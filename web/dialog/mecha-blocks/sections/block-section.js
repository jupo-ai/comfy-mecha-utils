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

    getSearchKeys(info) {
        return Array.isArray(info[0]) ? info[0] : [info[0]];
    }

    getLabelTitle(info) {
        return this.getSearchKeys(info).map((key) => `${key}*`).join("\n");
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
                    labelTitle: this.getLabelTitle(info),
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
        const item = this.sliders.find((sliderItem) => this.getSearchKeys(sliderItem.info).includes(key));
        if (!item) return;

        item.slider.value = value;
    }

    getValue() {
        const value = { model: {}, clip: {} };
        for (const { info, slider } of this.sliders) {
            const [, , type] = info;
            this.getSearchKeys(info).forEach((key) => {
                value[type][key] = slider.value;
            });
        }
        return value;
    }

    setValue(blocks) {
        if (!blocks) return;

        for (const { info, slider } of this.sliders) {
            const [, , type] = info;
            const value = this.getSearchKeys(info)
                .map((key) => blocks?.[type]?.[key])
                .find((blockValue) => blockValue !== undefined);
            if (value !== undefined) {
                slider.value = value;
            }
        }
    }
}
