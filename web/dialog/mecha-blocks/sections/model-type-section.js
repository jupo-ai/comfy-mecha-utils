import { $el } from "../../../utils.js";
import { Dropdown } from "../../../dom/dropdown.js";

export class ModelTypeSection {
    constructor(parent) {
        this.parent = parent;
        this.createUI();
    }

    createUI() {
        this.element = $el("div.mecha-modeltype-section");
        const header = $el("div.mecha-blocks-section-header");
        header.append($el("span", { textContent: "Model Type" }));

        this.dropdown = new Dropdown({
            options: this.parent.getModelTypeOptions(),
            selectName: "modelType",
            onChange: (value) => this.parent.handleModelTypeChange(value),
        });
        this.dropdown.element.classList.add("mecha-modeltype-section-dropdown");

        this.element.append(header, this.dropdown.element);
    }

    getValue() {
        return this.dropdown.value;
    }

    setValue(value, dispatchEvent = false) {
        this.dropdown.select(value, dispatchEvent);
    }
}
