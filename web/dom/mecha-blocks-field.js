import { app } from "../../../scripts/app.js";
import { $el, loadCss } from "../utils.js";
import { createDefaultBlocks } from "../dialog/mecha-blocks/block-configs.js";
import { MechaBlocksDialog } from "../dialog/mecha-blocks/mecha-blocks-dialog.js";
import { MechaBlocksSeparator, MechaBlocksWidget } from "./mecha-blocks-widget.js";

loadCss("dom/css/mecha-blocks-field.css");

function createDefaultValue(index) {
    const modelType = "SD1.5";
    return {
        enabled: true,
        name: `Block ${index}`,
        modelType,
        blocks: createDefaultBlocks(modelType),
    };
}

export class MechaBlocksField {
    constructor(comfyNode) {
        this.comfyNode = comfyNode;
        this.widgets = [];
        this.draggedWidget = null;
        this.placeholder = null;
        this.createUI();
    }

    createUI() {
        this.element = $el("div.mecha-blocks-field");
        this.setupPointerEventForwarding();

        this.createHeader();
        this.container = $el("div.mecha-blocks-field-container");
        this.footer = $el("div.mecha-blocks-footer");

        this.addButton = $el("div.mecha-blocks-add-button", {
            textContent: "Add",
            onclick: () => this.onAddButtonClick(),
        });
        this.addButton.addEventListener("contextmenu", (event) => this.onFooterContextMenu(event));

        this.footer.append(this.addButton);
        this.element.append(this.container, this.footer);
    }

    createHeader() {
        this.header = $el("div.mecha-blocks-header");
        this.header.append(
            $el("div.mecha-blocks-header-drag"),
            $el("div.mecha-blocks-header-toggle"),
            $el("div.mecha-blocks-header-flex"),
            $el("div.mecha-blocks-header-type", { textContent: "Type" }),
            $el("div.mecha-blocks-header-delete"),
        );
        this.element.append(this.header);
    }

    setupPointerEventForwarding() {
        const isChildElement = (target) => {
            return target !== this.element &&
                target !== this.container &&
                this.element.contains(target);
        };

        const forwardIfNeeded = (handler) => (event) => {
            if (isChildElement(event.target)) return;
            if (event.button !== 0) {
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

    startDragging(widget) {
        this.draggedWidget = widget;
        const originalElement = widget.element;

        this.placeholder = originalElement.cloneNode(true);
        this.placeholder.classList.add("mecha-blocks-widget--dragging");
        this.container.insertBefore(this.placeholder, originalElement);
        originalElement.style.display = "none";

        this.onDragMove = (event) => this.handleDragMove(event);
        this.onDragEnd = () => this.handleDragEnd();
        document.addEventListener("mousemove", this.onDragMove);
        document.addEventListener("mouseup", this.onDragEnd);
        document.body.classList.add("mecha-blocks-body-grabbing");
    }

    handleDragMove(event) {
        if (!this.draggedWidget) return;

        const y = event.clientY;
        const otherWidgets = this.widgets.filter((widget) => widget !== this.draggedWidget);
        let closestWidget = null;
        let smallestDistance = Infinity;

        for (const widget of otherWidgets) {
            const rect = widget.element.getBoundingClientRect();
            const distance = Math.abs(y - (rect.top + rect.height / 2));
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestWidget = widget;
            }
        }

        if (closestWidget) {
            const rect = closestWidget.element.getBoundingClientRect();
            const nextElement = y < rect.top + rect.height / 2
                ? closestWidget.element
                : closestWidget.element.nextSibling;
            this.container.insertBefore(this.placeholder, nextElement);
        } else if (this.widgets.length > 1) {
            this.container.append(this.placeholder);
        }
    }

    handleDragEnd() {
        if (!this.draggedWidget) return;

        this.container.insertBefore(this.draggedWidget.element, this.placeholder);
        this.draggedWidget.element.style.display = "";
        this.placeholder.remove();

        document.removeEventListener("mousemove", this.onDragMove);
        document.removeEventListener("mouseup", this.onDragEnd);
        document.body.classList.remove("mecha-blocks-body-grabbing");

        this.updateWidgetOrder();
        this.draggedWidget = null;
        this.placeholder = null;
    }

    updateWidgetOrder() {
        const orderedElements = Array.from(this.container.children)
            .filter((element) => element.classList.contains("mecha-blocks-widget"));
        this.widgets.sort((a, b) => orderedElements.indexOf(a.element) - orderedElements.indexOf(b.element));
        this.save();
    }

    onAddButtonClick() {
        const value = createDefaultValue(this.getActionableWidgets().length + 1);
        const dialog = new MechaBlocksDialog({
            value,
            onSave: (nextValue) => {
                const widget = new MechaBlocksWidget({
                    parentField: this,
                    value: nextValue,
                });
                this.addWidget(widget);
                this.setActiveWidget(widget);
            },
        });
        dialog.show();
    }

    onFooterContextMenu(event) {
        event.preventDefault();
        event.stopPropagation();

        const menuItems = [
            {
                content: "Add Separator",
                callback: () => this.addSeparator(),
            },
        ];

        new LiteGraph.ContextMenu(menuItems, {
            event,
            node: app.canvas?.graph,
        }, window);
    }

    addWidget(widget) {
        this.widgets.push(widget);
        this.container.append(widget.element);
        this.normalizeActiveWidget();
        this.save();
        this.comfyNode.updateNodeSize?.();
    }

    addSeparator(displayName = "") {
        this.addWidget(new MechaBlocksSeparator({
            parentField: this,
            value: { displayName },
        }));
    }

    deleteWidget(widget) {
        const wasActive = !widget.value.isSeparator && widget.value.enabled;
        this.widgets = this.widgets.filter((item) => item !== widget);
        if (wasActive) {
            this.setActiveWidget(this.getActionableWidgets()[0] ?? null);
        } else {
            this.normalizeActiveWidget();
        }
        this.save();
        this.comfyNode.updateNodeSize?.();
    }

    setActiveWidget(activeWidget) {
        const actionableWidgets = this.getActionableWidgets();
        if (!activeWidget && actionableWidgets.length > 0) {
            activeWidget = actionableWidgets[0];
        }

        for (const widget of actionableWidgets) {
            widget.setEnabled(widget === activeWidget, false);
        }
        this.save();
    }

    normalizeActiveWidget() {
        const actionableWidgets = this.getActionableWidgets();
        if (actionableWidgets.length === 0) {
            this.save();
            return;
        }
        const activeWidget = actionableWidgets.find((widget) => widget.value.enabled) ?? actionableWidgets[0];
        this.setActiveWidget(activeWidget);
    }

    getActionableWidgets() {
        return this.widgets.filter((widget) => !widget.value?.isSeparator);
    }

    save() {
        if (!this.comfyNode.valuesWidget) return;
        this.comfyNode.valuesWidget.value = JSON.stringify(this.widgets.map((widget) => widget.value));
    }

    load(value) {
        if (!value) return;

        try {
            const values = JSON.parse(value);
            if (!Array.isArray(values)) return;

            this.widgets = [];
            this.container.replaceChildren();

            for (const item of values) {
                const WidgetClass = item?.isSeparator ? MechaBlocksSeparator : MechaBlocksWidget;
                const widget = new WidgetClass({
                    parentField: this,
                    value: item,
                });
                this.widgets.push(widget);
                this.container.append(widget.element);
            }

            this.normalizeActiveWidget();
            this.comfyNode.updateNodeSize?.();
        } catch (error) {
            console.error("MechaBlocksField: failed to restore values", value, error);
        }
    }

    computeHeight() {
        let height = 0;
        Array.from(this.element.children).forEach((child) => {
            height += child.offsetHeight;
        });
        return height + 24;
    }

    computeWidth() {
        let width = 0;

        const widget = this.getActionableWidgets()[0];
        if (widget) {
            Array.from(widget.element.children).forEach((child) => {
                if (child !== widget.displayName) {
                    width += child.offsetWidth;
                }
            });
            return width;
        }

        return 0;
    }
}
