import { Component } from "../Component";
import { nextSessionId, sessions, terminals } from "../state";
import { css, html } from "../utils";
import { Topbar } from "./Topbar";

class FuzApp extends Component {
    static styles = css`
        :host {
            display: grid;
            height: 100%;
            grid-template-rows: 2.5rem auto;
        }

        #terms {
            height: 100%;
            padding: 0.75rem;
            background: var(--bg-500);
        }

        dialog {
            position: absolute;
            left: 50%;
            top: 100px;
            background-color: var(--bg-700);
            padding: 1rem 2rem;
            width: 200px;
            border-radius: 10px;
            border: none;
            transform: translateX(-50%);

            & > div {
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 1rem;
            }
        }

        button {
            background: transparent;
            color: var(--text-500);
            border: none;
            cursor: pointer;

            &:focus {
                outline: none;
            }
        }

        #sessions {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.5rem;

            & button {
                font-weight: bold;
                padding: 0.5rem 0;

                &.active {
                    background-color: var(--green-500);
                    color: #232621;
                }
            }
        }

        #new-ses-btn {
            font-size: 1.25rem;
        }
    `;

    private topbar?: Topbar;
    private sessionModal?: HTMLDialogElement;
    private sessionsContainer?: HTMLElement;

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
            <dialog>
                <div>
                    <div id="sessions"></div>
                    <button id="new-ses-btn" autofocus>+</button>
                </div>
            </dialog>
        `;

        this.topbar = this.renderDom.querySelector<Topbar>("top-bar")!;
        this.sessionModal = this.renderDom.querySelector("dialog")!;
        this.sessionsContainer = this.renderDom.querySelector("#sessions")!;

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
        this.topbar.addEventListener("showSessions", () => {
            this.sessionModal?.showModal();
        });

        sessions.subscribe((newValue) => {
            this.sessionsContainer!.innerHTML = html`${newValue.map(
                (s, idx) =>
                    html`<button
                        class="session-btn ${s.active ? "active" : ""}"
                        data-id=${idx}
                    >
                        ${s.name}
                    </button>`
            )}`;
            this.renderDom
                .querySelectorAll<HTMLElement>(".session-btn")
                .forEach((b) => {
                    b.addEventListener("click", () => {
                        this.switchSession(parseInt(b.dataset.id!));
                        this.sessionModal?.close();
                    });
                });
        });
        this.renderDom.querySelector<HTMLButtonElement>(
            "#new-ses-btn"
        )!.onclick = () => {
            // set all current terminals to inactive
            const activeTermIdx = terminals.value.findIndex((t) => t.active);
            this.renderDom
                .querySelector(`#term-${terminals.value[activeTermIdx].id}`)
                ?.removeAttribute("active");

            sessions.value = sessions.value.map((s) => ({
                ...s,
                active: false,
            }));
            sessions.value = [
                ...sessions.value,
                { name: `#${nextSessionId}`, active: true, tabs: [] },
            ];
            terminals.value = [];
            const newTerm = document.createElement("xterm-terminal");
            newTerm.setAttribute("title", "~");
            newTerm.setAttribute("subtitle", "fish");
            newTerm.setAttribute("active", "");
            this.renderDom.querySelector("div#terms")!.appendChild(newTerm);

            this.sessionModal?.close();
        };
    }

    private switchSession(id: number) {
        // set all current terminals to inactive
        const activeTermIdx = terminals.value.findIndex((t) => t.active);
        this.renderDom
            .querySelector(`#term-${terminals.value[activeTermIdx].id}`)
            ?.removeAttribute("active");

        sessions.value = sessions.value.map((s, idx) => ({
            ...s,
            active: idx == id,
        }));

        terminals.value = sessions.value[id].tabs;
        const activeTermId = terminals.value.find((t) => t.active)?.id;
        this.renderDom
            .querySelector(`#term-${activeTermId}`)
            ?.setAttribute("active", "");
    }
}
customElements.define("fuz-app", FuzApp);
