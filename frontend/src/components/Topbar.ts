import { Component } from "../Component";
import { sessions, terminals, TerminalState } from "../state";
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

        #session input {
            background: transparent;
            color: inherit;
            display: inline-block;
            width: 70px;
            font-size: 1rem;
            font-weight: bold;
            border: none;
            min-width: 0;

            &:focus {
                outline: none;
            }
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

        #add-tab-btn {
            background-color: var(--bg-300);
            border: none;
            color: var(--text-500);
            padding: 0 1rem;
            font-size: 1.25rem;
            cursor: pointer;

            &:hover {
                background-color: var(--bg-500);
            }
        }
    `;

    private tabsContainer?: HTMLElement;
    private sessionContainer?: HTMLElement;

    connectedCallback(): void {
        super.connectedCallback();
        this.renderDom.innerHTML = html`
            <div id="session"></div>
            <div id="tabs"></div>
            <button id="add-tab-btn" title="New tab">+</button>
        `;

        this.tabsContainer = this.renderDom.querySelector("#tabs")!;
        this.renderTabs(terminals.value);
        terminals.subscribe(this.renderTabs.bind(this));

        this.renderDom.querySelector<HTMLButtonElement>(
            "#add-tab-btn"
        )!.onclick = () => {
            this.dispatchEvent(new CustomEvent("newTab"));
        };

        this.sessionContainer =
            this.renderDom.querySelector<HTMLElement>("div#session")!;
        this.sessionContainer.oncontextmenu = this.editSessionName.bind(this);
        this.sessionContainer.onclick = () => {
            this.dispatchEvent(new CustomEvent("showSessions"));
        };

        sessions.subscribe((newValue) => {
            const activeSession = newValue.find((s) => s.active);
            if (activeSession) {
                this.sessionContainer!.textContent = activeSession.name;
            }
        });
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
        this.renderDom
            .querySelectorAll<HTMLElement>(".tab:not(.active)")
            .forEach(
                (t) =>
                    (t.onclick = () => {
                        const event = new CustomEvent("switchTab", {
                            detail: t.id,
                        });
                        this.dispatchEvent(event);
                    })
            );
    }

    editSessionName(ev: MouseEvent) {
        ev.preventDefault();
        const value = this.sessionContainer!.textContent;
        const input = document.createElement("input");
        input.value = value!;
        this.sessionContainer!.replaceChildren(input);
        input.focus();
        input.onblur = () => {
            this.sessionContainer!.innerHTML = html`${input.value}`;
            sessions.value = sessions.value.map((s) =>
                s.active ? { ...s, name: input.value } : s
            );
        };
        input.onkeydown = (ev) => {
            if (ev.key == "Enter") {
                this.sessionContainer!.innerHTML = html`${input.value}`;
                sessions.value = sessions.value.map((s) =>
                    s.active ? { ...s, name: input.value } : s
                );
            }
        };
    }
}
customElements.define("top-bar", Topbar);
