import { Terminal } from "@xterm/xterm";
import { Component } from "../Component";
import { StartShell } from "../../wailsjs/go/main/Terminal";
import { EventsEmit, EventsOn } from "../../wailsjs/runtime/runtime";
import { css } from "../utils";
import xtermCSS from "@xterm/xterm/css/xterm.css?inline";
import { terminals } from "../state";

class TerminalComponent extends Component {
    static styles = [
        css`
            #parent {
                width: 100%;
                height: 100%;
                display: none;
            }

            .xterm-viewport {
                background: transparent !important;
            }

            :host([active]) #parent {
                display: block;
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

        const term = new Terminal({
            cols: Math.floor(rect.width / 10),
            rows: Math.floor(rect.height / 21),
            fontSize: 16,
            fontFamily: '"JetBrainsMono Nerd Font", monospace',
        });
        term.open(el);
        const shellId = await StartShell();

        this.id = `term-${shellId}`;
        terminals.value = [
            ...terminals.value,
            {
                id: shellId,
                title: this.getAttribute("title")!,
                subtitle: this.getAttribute("subtitle")!,
                active: this.hasAttribute("active"),
            },
        ];

        EventsOn(shellId, (text: string) => {
            term.write(text);
        });
        term.onData((data) => EventsEmit(shellId + "/write", data));
        EventsEmit(shellId + "/resize", term.cols, term.rows);
        term.onResize(({ cols, rows }) =>
            EventsEmit(shellId + "/resize", cols, rows)
        );
        term.focus();

        const observer = new ResizeObserver(([entry]) => {
            term.resize(
                Math.floor(entry.contentRect.width / 10),
                Math.floor(entry.contentRect.height / 21)
            );
        });
        observer.observe(el);
    }
}
customElements.define("xterm-terminal", TerminalComponent);
