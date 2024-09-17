import { Component } from "../Component";
import { css, html } from "../utils";

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
        }
    `;

    connectedCallback(): void {
        super.connectedCallback();
        this.renderDom.innerHTML = html`
            <top-bar></top-bar>
            <div>
                <xterm-terminal></xterm-terminal>
            </div>
        `;
    }
}
customElements.define("fuz-app", FuzApp);
