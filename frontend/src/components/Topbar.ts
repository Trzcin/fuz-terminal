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
            padding: 0 1rem;
            font-size: 1rem;
        }

        #session {
            background-color: #8ee53f;
            color: #232621;
            font-weight: bold;
        }

        .tab {
            gap: 0.5rem;
            font-weight: 600;

            span {
                font-size: 0.75rem;
                color: #c2d9ad;
            }
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
