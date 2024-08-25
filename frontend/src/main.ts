import { StartShell } from "../wailsjs/go/main/Terminal";
import { EventsOn } from "../wailsjs/runtime";

(async () => {
    const root = document.querySelector("#app") as HTMLElement;
    const shellId = await StartShell();
    EventsOn(shellId, (text: string) => {
        root.innerText = text;
    });
})();
