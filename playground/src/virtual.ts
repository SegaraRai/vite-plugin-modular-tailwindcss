import "#tailwindcss/inject";
import { cls, style } from "#virtual";

document.querySelector("#virtual")!.className = cls;

document.querySelector("#code")!.textContent = Array.from(
  style.matchAll(/\.[\w-]+(?=\s*\{)/g)
)
  .map((match) => match[0])
  // FIXME: This is accidentally included in our virtual module name.
  .filter((cls) => cls !== ".inl" + "ine")
  .join(" ");
