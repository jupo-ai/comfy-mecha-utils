import { $el, loadCss } from "../utils.js";

loadCss("dom/css/number-input.css");

export class NumberInput {
    constructor({
        defaultValue = 0,
        min = -Infinity,
        max = Infinity,
        step = 1,
        width = 80,
        height = 24,
        fontSize = 12,
        onChange = null,
        dialogTitle = "Input value",
    } = {}) {
        this.onChange = onChange;
        this.options = { min, max, step };
        this.decimalPlaces = this.getDecimalPlaces(step);
        this.createUI();
        this.isDragging = false;
        this.dragSensitivity = 10;
        this.width = width;
        this.height = height;
        this.fontSize = fontSize;
        this.updateValue(defaultValue, false);
        this.dialogTitle = dialogTitle;
    }

    get value() {
        return this.currentValue;
    }

    set value(value) {
        this.updateValue(value);
    }

    set width(value) {
        this.element.style.setProperty("--width", typeof value === "number" ? `${value}px` : value);
    }

    set height(value) {
        this.element.style.setProperty("--height", typeof value === "number" ? `${value}px` : value);
    }

    set fontSize(value) {
        this.element.style.setProperty("--font-size", typeof value === "number" ? `${value}px` : value);
    }

    createUI() {
        this.element = $el("div.mecha-number-input");

        const downButton = $el("button.mecha-number-input-button", {
            type: "button",
            onclick: () => this.handleArrowClick(-1),
        });

        this.valueElement = $el("span.mecha-number-input-value");
        this.valueElement.addEventListener("mousedown", (event) => this.handleDragStart(event));
        this.valueElement.addEventListener("click", () => this.handleValueClick());

        const upButton = $el("button.mecha-number-input-button", {
            type: "button",
            onclick: () => this.handleArrowClick(1),
        });

        this.element.append(downButton, this.valueElement, upButton);
    }

    updateValue(rawValue, dispatchEvent = true) {
        const parsedValue = Number(rawValue);
        if (!Number.isFinite(parsedValue)) return;

        const step = this.getSnapStep();
        const factor = Math.pow(10, this.decimalPlaces);
        const roundedValue = Math.round(parsedValue / step) * step;
        const clampedValue = Math.max(this.options.min, Math.min(this.options.max, roundedValue));
        const nextValue = parseFloat((Math.round(clampedValue * factor) / factor).toFixed(this.decimalPlaces));

        this.currentValue = nextValue;
        this.valueElement.textContent = this.currentValue.toFixed(this.decimalPlaces);

        if (dispatchEvent) {
            this.onChange?.(this.currentValue);
        }
    }

    handleArrowClick(direction) {
        this.updateValue(this.value + (this.options.step * direction));
    }

    handleValueClick() {
        if (this.isDragging) return;

        const result = window.prompt(this.dialogTitle, String(this.value));
        if (result === null) return;
        this.value = result;
    }

    handleDragStart(startEvent) {
        startEvent.preventDefault();
        this.isDragging = false;

        const startX = startEvent.clientX;
        const startValue = this.value;

        const handleDragMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;

            if (Math.abs(deltaX) > 2 && !this.isDragging) {
                this.isDragging = true;
                this.element.classList.add("is-number-dragging");
            }

            if (this.isDragging) {
                const valueChange = Math.round(deltaX / this.dragSensitivity) * this.options.step;
                this.updateValue(startValue + valueChange);
            }
        };

        const handleDragEnd = () => {
            document.removeEventListener("mousemove", handleDragMove);
            document.removeEventListener("mouseup", handleDragEnd);
            document.body.style.cursor = "";
            this.element.classList.remove("is-number-dragging");
            setTimeout(() => { this.isDragging = false; }, 0);
        };

        document.addEventListener("mousemove", handleDragMove);
        document.addEventListener("mouseup", handleDragEnd);
        document.body.style.cursor = "ew-resize";
    }

    getDecimalPlaces(value) {
        if (typeof value !== "number" || !Number.isFinite(value)) return 0;
        const text = String(value);
        return text.includes(".") ? text.split(".")[1].length : 0;
    }

    getSnapStep() {
        const baseStep = this.options.step;
        if (typeof baseStep !== "number" || baseStep <= 0 || !Number.isFinite(baseStep)) return 1;
        if (this.decimalPlaces <= 0) return 1;
        return 1 / Math.pow(10, this.decimalPlaces);
    }
}
