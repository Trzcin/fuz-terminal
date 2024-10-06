import { Component } from "../Component";
import { terminals, TerminalState } from "../state";
import { css, html } from "../utils";

export class Topbar extends Component {
    static styles = css`
        :host {
            display: flex;
        }

        #session,
        .tab {
            display: flex;
            align-items: center;
            padding: 0 1rem;
            font-size: 1rem;
        }

        #tabs {
            display: flex;
        }

        #session {
            background-color: var(--green-500);
            color: #232621;
            font-weight: bold;
        }

        .tab {
            gap: 0.5rem;
            font-weight: 600;
            cursor: pointer;

            span {
                font-size: 0.75rem;
                color: #c2d9ad;
            }

            &.active {
                background: var(--bg-500);
                box-shadow: inset 0 -2px var(--green-500);
                cursor: default;
            }
        }
    `;

    private tabsContainer?: HTMLElement;

    connectedCallback(): void {
        super.connectedCallback();
        this.renderDom.innerHTML = html`
            <div id="session">session</div>
            <div id="tabs">
                <div class="tab active">~ <span>fish</span></div>
                <div class="tab">fuz-terminal <span>fish</span></div>
            </div>
        `;
        this.tabsContainer = this.renderDom.querySelector("#tabs")!;
        this.renderTabs(terminals.value);
        terminals.subscribe(this.renderTabs.bind(this));
    }

    disconnectedCallback() {
        terminals.unsubscribe(this.renderTabs.bind(this));
    }

    renderTabs(terminals: TerminalState[]) {
        if (!this.tabsContainer) return;
        this.tabsContainer.innerHTML = html`${terminals.map(
            (t) =>
                html`<div class="tab ${t.active ? "active" : ""}" id="${t.id}">
                    ${t.title} <span>${t.subtitle}</span>
                </div>`
        )}`;
        this.renderDom.querySelectorAll<HTMLElement>(".tab:not(.active)").forEach(
            (t) =>
                (t.onclick = () => {
                    const event = new CustomEvent("switchTab", { detail: t.id });
                    this.dispatchEvent(event);
                })
        );
    }
}
customElements.define("top-bar", Topbar);
