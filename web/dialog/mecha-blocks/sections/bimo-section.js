import { $el } from "../../../utils.js";

export class BimoSection {
    constructor(parent) {
        this.parent = parent;
        this.createUI();
    }

    createUI() {
        this.element = $el("div.mecha-bimo-section");

        const header = $el("div.mecha-blocks-section-header");
        header.append($el("span", { textContent: "BIMO Syntax" }));

        this.input = $el("input.mecha-bimo-section-input");
        this.input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                event.stopPropagation();
                this.handleApply();
            }
        });

        this.button = $el("button.mecha-bimo-section-button", {
            type: "button",
            textContent: "Apply",
            onclick: () => this.handleApply(),
        });

        const container = $el("div.mecha-bimo-section-container");
        container.append(this.input, this.button);
        this.element.append(header, container);
    }

    handleApply() {
        const bimo = this.input.value;
        if (!this.validateBimo(bimo)) {
            this.input.select();
            return;
        }

        const blockConfig = this.parent.getCurrentBlockConfig();
        const mapping = {};

        const processCharType = (charPattern, configKey) => {
            const chars = bimo.match(charPattern) || [];
            if (chars.length === 0 || !blockConfig[configKey]) return;

            const items = blockConfig[configKey];
            const baseItemsPerChar = Math.floor(items.length / chars.length);
            const remainder = items.length % chars.length;
            let currentIndex = 0;

            chars.forEach((char, index) => {
                const value = char === char.toUpperCase() ? 1 : 0;
                const itemsForThisChar = baseItemsPerChar + (index < remainder ? 1 : 0);

                for (let i = 0; i < itemsForThisChar; i++) {
                    if (currentIndex >= items.length) return;
                    const keys = this.parent.blockSection.getSearchKeys(items[currentIndex]);
                    keys.forEach((key) => {
                        mapping[key] = value;
                    });
                    currentIndex++;
                }
            });
        };

        processCharType(/[bB]/g, "upper");
        processCharType(/[iI]/g, "left");
        processCharType(/[mM]/g, "bottom");
        processCharType(/[oO]/g, "right");

        for (const [key, value] of Object.entries(mapping)) {
            this.parent.blockSection.applyValue(key, value);
        }
    }

    validateBimo(text) {
        if (/^[bimo]+$/i.test(text)) return true;

        alert("BIMO syntax error: only B, I, M, and O are allowed.");
        return false;
    }
}
