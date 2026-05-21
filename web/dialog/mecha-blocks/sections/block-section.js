import { $el } from "../../../utils.js";
import { Slider } from "../../../dom/slider.js";

export class BlockSection {
    constructor(parent) {
        this.parent = parent;
        this.sliders = [];
        this.createUI();
    }

    createUI() {
        this.element = $el("div.mecha-block-section");
    }

    createSliders() {
        this.clear();
        const config = this.parent.getCurrentBlockConfig();
        const isUnet = ["SD1.5", "SDXL"].includes(this.parent.modelTypeSection.getValue());
        const options = { min: 0, max: 1, step: 0.01, value: 1 };

        this.element.classList.toggle("mecha-block-section--unet", isUnet);

        for (const position of ["upper", "left", "right", "bottom"]) {
            if (!config[position]) continue;

            const container = $el("div.mecha-block-section-sliders");
            container.classList.add(`--${position}`);

            for (const info of config[position]) {
                const slider = new Slider({
                    label: info[1],
                    labelTitle: info[3] ?? info[0],
                    value: options.value,
                    min: options.min,
                    max: options.max,
                    step: options.step,
                });
                slider.element.classList.add("mecha-block-section-slider");
                container.append(slider.element);
                this.sliders.push({ info, slider });
            }

            this.element.append(container);
        }
    }

    clear() {
        this.sliders = [];
        this.element.replaceChildren();
    }

    applyValue(key, value) {
        const item = this.sliders.find((sliderItem) => sliderItem.info[0] === key);
        if (!item) return;

        item.slider.value = value;
    }

    getValue() {
        const value = { model: {}, clip: {} };
        for (const { info, slider } of this.sliders) {
            const [key, , type] = info;
            value[type][key] = slider.value;
        }
        return value;
    }

    setValue(blocks) {
        if (!blocks) return;

        for (const { info, slider } of this.sliders) {
            const [key, , type] = info;
            const value = blocks?.[type]?.[key];
            if (value !== undefined) {
                slider.value = value;
            }
        }
    }
}
