import { Component } from "../Component";
import { terminals } from "../state";
import { css, html } from "../utils";
import { Topbar } from "./Topbar";

class FuzApp extends Component {
    static styles = css`
        :host {
            display: grid;
            height: 100%;
            grid-template-rows: 2rem auto;
        }

        div {
            height: 100%;
            padding: 0.75rem;
            background: var(--bg-500);
        }
    `;

    private topbar?: Topbar;

    connectedCallback(): void {
        super.connectedCallback();
        this.renderDom.innerHTML = html`
            <top-bar></top-bar>
            <div>
                <xterm-terminal active title="~" subtitle="fish"></xterm-terminal>
                <xterm-terminal title="fuz-terminal" subtitle="fish"></xterm-terminal>
                <xterm-terminal title="HackatonFooBar" subtitle="fish"></xterm-terminal>
            </div>
        `;
        this.topbar = this.renderDom.querySelector<Topbar>("top-bar")!;
        this.topbar.addEventListener("switchTab", ((ev: CustomEvent) => {
            const id = ev.detail;
            let oldId = "";
            terminals.value = terminals.value.map((t) => {
                if (t.active) {
                    oldId = t.id;
                    return { ...t, active: false };
                } else if (t.id === id) {
                    return { ...t, active: true };
                } else {
                    return t;
                }
            });
            this.renderDom.querySelector(`#term-${oldId}`)?.removeAttribute("active");
            this.renderDom.querySelector(`#term-${id}`)?.setAttribute("active", "");
        }) as EventListener);
    }
}
customElements.define("fuz-app", FuzApp);
