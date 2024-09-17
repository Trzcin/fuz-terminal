import { Component } from "../Component";
import { css, html } from "../utils";

class Topbar extends Component {
    static styles = css`
        :host {
            display: flex;
        }

        div {
            display: flex;
            align-items: center;
            padding: 0 0.75rem;
        }

        #session {
            background-color: #8ee53f;
            color: #232621;
        }

        .tab {
            gap: 0.25rem;
        }
    `;

    connectedCallback(): void {
        super.connectedCallback();
        this.renderDom.innerHTML = html`
            <div id="session">session</div>
            <div class="tab">home <span>fish</span></div>
        `;
    }
}
customElements.define("top-bar", Topbar);
