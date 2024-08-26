import { Terminal } from "@xterm/xterm";
import { StartShell } from "../wailsjs/go/main/Terminal";
import { EventsEmit, EventsOn } from "../wailsjs/runtime";
import "@xterm/xterm/css/xterm.css";

(async () => {
    const root = document.querySelector("#app") as HTMLElement;
    const rootRect = root.getBoundingClientRect();
    const term = new Terminal({ cols: Math.floor(rootRect.width / 9), rows: Math.floor(rootRect.height / 18) });
    term.open(root);
    const shellId = await StartShell();
    EventsOn(shellId, (text: string) => {
        term.write(text);
    });
    term.onData((data) => EventsEmit(shellId + "/write", data));
    EventsEmit(shellId + "/resize", term.cols, term.rows);
    term.onResize(({ cols, rows }) => EventsEmit(shellId + "/resize", cols, rows));
})();
