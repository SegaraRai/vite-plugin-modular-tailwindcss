import tailwindCSS from "#tailwindcss";
import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { iconMenu, textCommonClasses } from "./common";

@customElement("my-menu-button")
export class MyMenuButton extends LitElement {
  static readonly styles = css`
    ${unsafeCSS(tailwindCSS)}

    /* To use TailwindCSS classes here, import separate CSS files */
    :host {
      display: inline-block;
    }
  `;

  @property({ type: Boolean, reflect: true })
  disabled = false;

  render() {
    const cls =
      textCommonClasses +
      " w-full h-full px-2 py-1 inline-flex items-center gap-2 text-blue-400 hover:text-blue-500 active:text-blue-600 disabled:text-gray-400";

    return html`
      <button class=${cls} ?disabled=${this.disabled}>
        <span class=${iconMenu}></span>
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-menu-button": MyMenuButton;
  }
}
