import { app } from "../../../scripts/app.js";
import { $el, loadCss } from "../utils.js";
import { Icon, IconButton } from "./icon.js";
import { ToggleSwitch } from "./toggle-switch.js";
import { MechaBlocksDialog } from "../dialog/mecha-blocks/mecha-blocks-dialog.js";

loadCss("dom/css/mecha-blocks-widget.css");

export class MechaBlocksWidget {
    constructor({ parentField, value }) {
        this.parentField = parentField;
        this.value = value;
        this.createUI();
        this.updateUI();
    }

    createUI() {
        this.element = $el("div.mecha-blocks-widget");
        this.element.addEventListener("contextmenu", (event) => this.handleContextMenu(event));
        this.setupPointerEventForwarding();

        this.dragHandle = new Icon({ icon: "menu" });
        this.dragHandle.element.classList.add("mecha-blocks-widget-drag-handle");
        this.dragHandle.element.addEventListener("mousedown", (event) => this.handleDragStart(event));

        this.toggleSwitch = new ToggleSwitch({
            defaultValue: this.value.enabled,
            width: 32,
            height: 16,
            onChange: (enabled) => this.parentField.setActiveWidget(enabled ? this : null),
        });

        this.displayName = $el("button.mecha-blocks-widget-name", {
            type: "button",
            onclick: () => this.openDialog(),
        });

        this.modelType = $el("span.mecha-blocks-widget-type");

        this.deleteButton = new IconButton({
            icon: "delete",
            title: "Delete",
            size: 16,
            onClick: () => this.delete(),
        });
        this.deleteButton.element.classList.add("mecha-blocks-widget-delete");

        this.element.append(
            this.dragHandle.element,
            this.toggleSwitch.element,
            this.displayName,
            this.modelType,
            this.deleteButton.element,
        );
    }

    setupPointerEventForwarding() {
        const forwardIfNeeded = (handler) => (event) => {
            if (event.button === 1) {
                event.preventDefault();
                event.stopPropagation();
                handler.call(app.canvas, event);
            }
        };

        this.element.addEventListener("pointerdown", forwardIfNeeded(app.canvas.processMouseDown));
        this.element.addEventListener("pointerup", forwardIfNeeded(app.canvas.processMouseUp));
        this.element.addEventListener("pointermove", forwardIfNeeded(app.canvas.processMouseMove));
        this.element.addEventListener("wheel", (event) => app.canvas.processMouseWheel(event));
    }

    handleContextMenu(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    handleDragStart(event) {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        this.parentField.startDragging(this);
    }

    openDialog() {
        const dialog = new MechaBlocksDialog({
            value: this.value,
            onSave: (nextValue) => {
                this.value = nextValue;
                this.updateUI();
                this.parentField.save();
            },
        });
        dialog.show();
    }

    setEnabled(enabled, dispatchEvent = false) {
        this.value.enabled = enabled;
        this.toggleSwitch.setState(enabled, dispatchEvent);
        this.updateUI();
    }

    updateUI() {
        this.displayName.textContent = this.value.name || "Block";
        this.modelType.textContent = this.value.modelType || "";
        this.element.classList.toggle("mecha-blocks-widget--active", !!this.value.enabled);
        this.element.classList.toggle("mecha-blocks-widget--disabled", !this.value.enabled);
        if (this.value.enabled) {
            this.toggleSwitch.disable();
        } else {
            this.toggleSwitch.enable();
        }
    }

    delete() {
        this.element.remove();
        this.parentField.deleteWidget(this);
    }
}

export class MechaBlocksSeparator {
    constructor({ parentField, value = {} }) {
        this.parentField = parentField;
        this.value = {
            isSeparator: true,
            displayName: "",
            ...value,
        };
        this.createUI();
        this.updateUI();
    }

    createUI() {
        this.element = $el("div.mecha-blocks-widget.mecha-blocks-widget--separator");
        this.setupPointerEventForwarding();

        this.dragHandle = new Icon({ icon: "menu" });
        this.dragHandle.element.classList.add("mecha-blocks-widget-drag-handle");
        this.dragHandle.element.addEventListener("mousedown", (event) => this.handleDragStart(event));

        this.displayName = $el("button.mecha-blocks-widget-name", {
            type: "button",
            onclick: () => this.rename(),
        });

        this.deleteButton = new IconButton({
            icon: "delete",
            title: "Delete",
            size: 16,
            onClick: () => this.delete(),
        });
        this.deleteButton.element.classList.add("mecha-blocks-widget-delete");

        this.element.append(this.dragHandle.element, this.displayName, this.deleteButton.element);
    }

    setupPointerEventForwarding() {
        const forwardIfNeeded = (handler) => (event) => {
            if (event.button === 1) {
                event.preventDefault();
                event.stopPropagation();
                handler.call(app.canvas, event);
            }
        };

        this.element.addEventListener("pointerdown", forwardIfNeeded(app.canvas.processMouseDown));
        this.element.addEventListener("pointerup", forwardIfNeeded(app.canvas.processMouseUp));
        this.element.addEventListener("pointermove", forwardIfNeeded(app.canvas.processMouseMove));
        this.element.addEventListener("wheel", (event) => app.canvas.processMouseWheel(event));
    }

    handleDragStart(event) {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        this.parentField.startDragging(this);
    }

    rename() {
        const result = window.prompt("Separator name", this.value.displayName ?? "");
        if (result === null) return;
        this.value.displayName = result;
        this.updateUI();
        this.parentField.save();
    }

    updateUI() {
        this.displayName.textContent = this.value.displayName || "";
    }

    delete() {
        this.element.remove();
        this.parentField.deleteWidget(this);
    }
}
