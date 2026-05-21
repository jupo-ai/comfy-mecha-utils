import { $el, loadCss } from "../../utils.js";
import { IconButton } from "../../dom/icon.js";

loadCss("dialog/base/base-dialog.css");

export class BaseDialog {
    constructor() {
        this.createBaseUI();
        this.createToolButtons();
    }

    createBaseUI() {
        this.element = $el("div.mecha-dialog");
        this.toolbar = $el("div.mecha-dialog-toolbar");
        this.content = $el("div.mecha-dialog-content");
        this.element.append(this.toolbar, this.content);
    }

    createToolButtons() {
        this.addToolButton({
            icon: "close",
            title: "Close",
            onClick: () => this.close(),
        });
    }

    addToolButton({ icon, title, onClick }) {
        const button = new IconButton({ icon, title, size: 20, onClick });
        this.toolbar.prepend(button.element);
        return button;
    }

    async show() {}

    async close() {}
}

export class BaseModal extends BaseDialog {
    createBaseUI() {
        super.createBaseUI();
        this.overlay = $el("div.mecha-dialog-overlay");
        this.overlay.addEventListener("mousedown", (event) => {
            if (event.target === this.overlay) {
                this.close();
            }
        });
        this.overlay.append(this.element);
    }

    async show() {
        document.body.append(this.overlay);
    }

    async close() {
        this.overlay.remove();
    }
}
