import { $el, loadCss } from "../utils.js";

loadCss("dom/css/toggle-switch.css");

export class ToggleSwitch {
    constructor({ defaultValue = false, width = 32, height = 16, onChange = null } = {}) {
        this.onChange = onChange;
        this.createUI();
        this.width = width;
        this.height = height;
        this.setState(defaultValue, false);
    }

    get value() {
        return this.inputElement.checked;
    }

    set value(v) {
        this.setState(v);
    }

    set width(v) {
        const width = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--width", width);
    }

    set height(v) {
        const height = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--height", height);
    }

    createUI() {
        this.element = $el("label.mecha-toggle");
        this.inputElement = $el("input.mecha-toggle-input", { type: "checkbox" });
        this.inputElement.addEventListener("change", () => this.onChange?.(this.value));
        const slider = $el("span.mecha-toggle-slider");
        this.element.append(this.inputElement, slider);
    }

    setState(state, dispatchEvent = true) {
        this.inputElement.checked = !!state;
        if (dispatchEvent) {
            this.inputElement.dispatchEvent(new Event("change"));
        }
    }

    enable() {
        this.inputElement.disabled = false;
        this.element.classList.remove("mecha-toggle--disabled");
    }

    disable() {
        this.inputElement.disabled = true;
        this.element.classList.add("mecha-toggle--disabled");
    }
}
