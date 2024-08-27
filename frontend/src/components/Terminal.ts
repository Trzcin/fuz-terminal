import { Terminal } from "@xterm/xterm";
import { Component } from "../Component";
import { StartShell } from "../../wailsjs/go/main/Terminal";
import { EventsEmit, EventsOn } from "../../wailsjs/runtime/runtime";
import { css } from "../utils";
import xtermCSS from "@xterm/xterm/css/xterm.css?inline";

class TerminalComponent extends Component {
    static styles = [
        css`
            #parent {
                width: 100%;
                height: 100%;
            }

            .xterm-rows {
                font-family: inherit !important;
            }

            .xterm-viewport {
                background: transparent !important;
            }
        `,
        css`
            ${xtermCSS}
        `,
    ];

    async connectedCallback() {
        super.connectedCallback();

        const el = document.createElement("div");
        el.id = "parent";
        this.renderDom.appendChild(el);
        const rect = el.getBoundingClientRect();

        const term = new Terminal({ cols: Math.floor(rect.width / 9), rows: Math.floor(rect.height / 18) });
        term.open(el);
        const shellId = await StartShell();
        EventsOn(shellId, (text: string) => {
            term.write(text);
        });
        term.onData((data) => EventsEmit(shellId + "/write", data));
        EventsEmit(shellId + "/resize", term.cols, term.rows);
        term.onResize(({ cols, rows }) => EventsEmit(shellId + "/resize", cols, rows));
    }
}
customElements.define("xterm-terminal", TerminalComponent);
