interface HTMLString {
    toString(): string;
    __html: string;
}

export function html(template: TemplateStringsArray, ...params: unknown[]): string {
    const sanitized = params.reduce<string>((result, param, idx) => {
        const arrayParam = Array.isArray(param) ? param : [param];
        let parsedParam = arrayParam.reduce<string>((acc, p) => {
            if (p == null || p === false) {
                return acc;
            } else if (typeof p === "object" && "__html" in p) {
                return acc + p.toString();
            } else {
                return (
                    acc +
                    p
                        .toString()
                        .replaceAll("&", "&amp;")
                        .replaceAll("<", "&lt;")
                        .replaceAll(">", "&gt;")
                        .replaceAll('"', "&quot;")
                        .replaceAll("'", "&#039;")
                );
            }
        }, "");
        return result + parsedParam + template[idx + 1];
    }, template[0]);

    const htmlString: HTMLString = {
        __html: sanitized,
        toString() {
            return this.__html;
        },
    };
    return htmlString as unknown as string;
}

export class CSSExpression {
    constructor(private src: string) {}

    private _stylesheet?: CSSStyleSheet;

    get stylesheet() {
        if (this._stylesheet) {
            return this._stylesheet;
        } else {
            this._stylesheet = new CSSStyleSheet();
            this._stylesheet.replaceSync(this.src);
            return this._stylesheet;
        }
    }
}

export function css(template: TemplateStringsArray, ...params: any[]): CSSExpression {
    const content = params.reduce((acc, param, idx) => acc + param + template[idx + 1], template[0]);
    return new CSSExpression(content);
}
