import { Component } from "../Component";
import { terminals } from "../state";
import { css, html } from "../utils";
import { Topbar } from "./Topbar";

class FuzApp extends Component {
    static styles = css`
        :host {
            display: grid;
            height: 100%;
            grid-template-rows: 2.5rem auto;
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
            <div id="terms">
                <xterm-terminal
                    active
                    title="~"
                    subtitle="fish"
                ></xterm-terminal>
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
            this.renderDom
                .querySelector(`#term-${oldId}`)
                ?.removeAttribute("active");
            this.renderDom
                .querySelector(`#term-${id}`)
                ?.setAttribute("active", "");
        }) as EventListener);
        this.topbar.addEventListener("newTab", () => {
            // set all current terminals to inactive
            const activeTermIdx = terminals.value.findIndex((t) => t.active);
            terminals.value = terminals.value.map((t) => ({
                ...t,
                active: false,
            }));
            this.renderDom
                .querySelector(`#term-${terminals.value[activeTermIdx].id}`)
                ?.removeAttribute("active");

            const newTerm = document.createElement("xterm-terminal");
            newTerm.setAttribute("title", "~");
            newTerm.setAttribute("subtitle", "fish");
            newTerm.setAttribute("active", "");
            this.renderDom.querySelector("div#terms")!.appendChild(newTerm);
        });
    }
}
customElements.define("fuz-app", FuzApp);
