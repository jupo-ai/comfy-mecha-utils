import { $el, loadCss } from "../utils.js";
import { NumberInput } from "./number-input.js";

loadCss("dom/css/slider.css");

export class Slider {
    constructor({
        label = "",
        labelTitle = "",
        value = 1,
        min = 0,
        max = 1,
        step = 0.01,
        onChange = null,
        numberInputWidth = 80,
        restrict = false,
    } = {}) {
        this.label = label;
        this.labelTitle = labelTitle || label;
        this.min = min;
        this.max = max;
        this.step = step;
        this.onChange = onChange;
        this.restrict = restrict;
        this.currentValue = value;
        this.createUI(numberInputWidth);
        this.value = value;
    }

    get value() {
        return this.currentValue;
    }

    set value(v) {
        const nextValue = Number(v);
        if (!Number.isFinite(nextValue)) return;

        this.currentValue = nextValue;
        if (this.numberInput.value !== nextValue) {
            this.numberInput.value = nextValue;
        }
        this.rangeInput.value = String(nextValue);
        this.updateProgress();
        this.onChange?.(nextValue);
    }

    createUI(numberInputWidth) {
        this.element = $el("div.mecha-slider");
        const header = $el("div.mecha-slider-header");
        const label = $el("span.mecha-slider-label", {
            textContent: this.label,
            title: this.labelTitle,
        });

        this.numberInput = new NumberInput({
            defaultValue: this.currentValue,
            min: this.restrict ? this.min : -Infinity,
            max: this.restrict ? this.max : Infinity,
            step: this.step,
            width: numberInputWidth,
            height: 24,
            fontSize: 12,
            dialogTitle: this.labelTitle || this.label,
            onChange: (value) => {
                this.value = value;
            }
        });
        header.append(label, this.numberInput.element);

        this.rangeInput = $el("input.mecha-slider-range", {
            type: "range",
            min: this.min,
            max: this.max,
            step: this.step,
            oninput: () => {
                this.value = this.rangeInput.value;
            },
        });

        this.element.append(header, this.rangeInput);
    }

    updateProgress() {
        const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
        this.rangeInput.style.setProperty("--percent", `${Math.min(100, Math.max(0, percent))}%`);
    }
}
