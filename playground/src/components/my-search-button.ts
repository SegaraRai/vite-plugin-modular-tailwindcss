import tailwindCSS from "#tailwindcss";
import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { iconSearch, textCommonClasses } from "./common";

@customElement("my-search-button")
export class MySearchButton extends LitElement {
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
      " w-full h-full px-2 py-1 inline-flex items-center gap-2 text-gray-100 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-400";

    return html`
      <button class=${cls} ?disabled=${this.disabled}>
        <span class=${iconSearch}></span>
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-search-button": MySearchButton;
  }
}
