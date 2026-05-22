import { $el, loadCss } from "../../utils.js";
import { BaseModal } from "../base/base-dialog.js";
import { BlockConfigs, createDefaultBlocks } from "./block-configs.js";
import { BlockSection } from "./sections/block-section.js";
import { ModelTypeSection } from "./sections/model-type-section.js";
import { BimoSection } from "./sections/bimo-section.js";

loadCss("dialog/mecha-blocks/mecha-blocks-dialog.css");

export class MechaBlocksDialog extends BaseModal {
    constructor({ value, onSave }) {
        super();
        this.value = structuredClone(value);
        this.onSave = onSave;
        this.setupSections();
        this.createUI();
    }

    setupSections() {
        this.blockSection = new BlockSection(this);
        this.modelTypeSection = new ModelTypeSection(this);
        this.bimoSection = new BimoSection(this);
    }

    createUI() {
        this.element.classList.add("mecha-blocks-dialog");
        this.content.classList.add("mecha-blocks-content");

        const header = $el("div.mecha-blocks-dialog-header");
        header.append($el("span", { textContent: "Block Merge Settings" }));

        this.nameInput = $el("input.mecha-blocks-name-input", {
            type: "text",
            placeholder: "Preset name",
        });

        const side = $el("div.mecha-blocks-side");
        const nameSection = $el("div.mecha-blocks-name-section");
        nameSection.classList.add("mecha-blocks-name-area");
        const nameHeader = $el("div.mecha-blocks-section-header");
        nameHeader.append($el("span", { textContent: "Name" }));
        nameSection.append(nameHeader, this.nameInput);
        this.modelTypeSection.element.classList.add("mecha-blocks-modeltype-area");
        this.bimoSection.element.classList.add("mecha-blocks-bimo-area");
        side.append(nameSection, this.modelTypeSection.element, this.bimoSection.element);

        const blockArea = $el("div.mecha-blocks-block-area");
        blockArea.append(this.blockSection.element);

        const body = $el("div.mecha-blocks-body");
        body.append(blockArea, side);

        this.content.append(header, body);
    }

    getModelTypeOptions() {
        return Object.keys(BlockConfigs);
    }

    getCurrentBlockConfig() {
        return BlockConfigs[this.modelTypeSection.getValue()] ?? {};
    }

    handleModelTypeChange(modelType) {
        this.value.modelType = modelType;
        this.blockSection.createSliders();
    }

    applyInitialValues() {
        const modelType = this.value.modelType ?? this.getModelTypeOptions()[0];
        this.value.modelType = modelType;
        this.value.blocks ??= createDefaultBlocks(modelType);

        this.nameInput.value = this.value.name ?? "";
        this.modelTypeSection.setValue(modelType);
        this.blockSection.createSliders();
        this.blockSection.setValue(this.value.blocks);
    }

    getValue() {
        const modelType = this.modelTypeSection.getValue();
        return {
            ...this.value,
            name: this.nameInput.value.trim() || "Block",
            modelType,
            blocks: this.blockSection.getValue(),
        };
    }

    async show() {
        this.applyInitialValues();
        await super.show();
        this.nameInput.focus();
        this.nameInput.select();
    }

    async close() {
        this.onSave?.(this.getValue());
        await super.close();
    }
}
