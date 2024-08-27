import { globalCSS } from "./global";
import { CSSExpression } from "./utils";

export abstract class Component extends HTMLElement {
  static styles?: CSSExpression | CSSExpression[];
  protected renderDom: Component | ShadowRoot = this;

  connectedCallback() {
    this.renderDom = this.attachShadow({ mode: "open" });
    this.renderDom.adoptedStyleSheets.push(globalCSS.stylesheet);
    const styles = (this.constructor as typeof Component).styles;
    if (styles) {
      this.renderDom.adoptedStyleSheets.push(...(Array.isArray(styles) ? styles.map((s) => s.stylesheet) : [styles.stylesheet]));
    }
  }
}
