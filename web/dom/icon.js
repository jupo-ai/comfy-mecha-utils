import { $el, loadCss } from "../utils.js";

loadCss("dom/css/icon.css");

export class Icon {
    constructor({ icon, size = "" }) {
        this.element = $el(`i.mdi.mdi-${icon}.mecha-icon`);
        if (size) this.size = size;
    }

    set size(v) {
        const size = typeof v === "number" ? `${v}px` : v;
        this.element.style.fontSize = size;
    }
}

export class IconButton {
    constructor({ icon, title = "", size = 16, padding = 4, onClick = null }) {
        this.onClick = onClick;
        this.element = $el("button.mecha-icon-button", {
            title,
            onclick: (event) => {
                this.element.blur();
                this.onClick?.(event);
            },
        });
        const iconElement = new Icon({ icon }).element;
        iconElement.style.fontSize = "";
        this.element.append(iconElement);
        this.size = size;
        this.padding = padding;
    }

    set size(v) {
        const size = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--icon-size", size);
    }

    set padding(v) {
        const padding = typeof v === "number" ? `${v}px` : v;
        this.element.style.setProperty("--button-padding", padding);
    }
}
