import { $el, loadCss } from "../utils.js";

loadCss("dom/css/dropdown.css");

export class Dropdown {
    constructor({
        options = [],
        selectName = "",
        placeholder = "Select Option",
        value = null,
        onChange = null,
    } = {}) {
        this.onChange = onChange;
        this.selectName = selectName;
        this.placeholderText = placeholder;
        this.optionItems = [];
        this.isOpen = false;
        this.createUI();
        this.options = options;

        if (value !== null) {
            this.value = value;
        } else {
            this.updateDisplay(null);
        }

        document.addEventListener("click", (event) => {
            if (this.isOpen && !this.element.contains(event.target)) {
                this.close();
            }
        });
    }

    get options() {
        return this.optionItems;
    }

    set options(options) {
        this.optionItems = Array.isArray(options) ? options : [];
        const parsedOptions = this.parseOptions(this.optionItems);

        this.nativeSelect.replaceChildren();
        this.customList.replaceChildren();

        this.nativeSelect.append($el("option", {
            value: "",
            textContent: this.placeholderText,
            disabled: true,
            selected: true,
        }));

        for (const item of parsedOptions) {
            const option = $el("option", {
                textContent: item.text,
                value: item.value,
            });
            this.nativeSelect.append(option);

            const customItem = $el("div.mecha-dropdown-item", {
                textContent: item.text,
                dataset: { value: item.value },
            });
            customItem.addEventListener("click", (event) => {
                event.stopPropagation();
                this.value = item.value;
                this.close();
                this.onChange?.(this.value);
            });
            this.customList.append(customItem);
        }
    }

    get value() {
        return this.nativeSelect.value;
    }

    set value(value) {
        this.nativeSelect.value = value;
        this.updateDisplay(value);
    }

    createUI() {
        this.element = $el("div.mecha-dropdown-container");
        this.nativeSelect = $el("select", {
            name: this.selectName,
            style: { display: "none" },
        });
        this.displayLabel = $el("div.mecha-dropdown-placeholder", {
            textContent: this.placeholderText,
        });
        this.customList = $el("div.mecha-dropdown-list");
        this.element.append(this.nativeSelect, this.displayLabel, this.customList);
        this.element.addEventListener("click", () => this.toggle());
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        this.element.classList.add("active");
        this.isOpen = true;
    }

    close() {
        this.element.classList.remove("active");
        this.isOpen = false;
    }

    updateDisplay(value) {
        const items = this.customList.querySelectorAll(".mecha-dropdown-item");
        let selectedText = this.placeholderText;
        let found = false;

        items.forEach((item) => {
            if (item.dataset.value === String(value)) {
                item.classList.add("selected");
                selectedText = item.textContent;
                found = true;
            } else {
                item.classList.remove("selected");
            }
        });

        this.displayLabel.textContent = selectedText;
        this.element.classList.toggle("has-value", found);
    }

    select(value, dispatchEvent = true) {
        this.value = value;
        if (dispatchEvent) this.onChange?.(this.value);
    }

    parseOptions(options) {
        return options.map((option) => {
            if (Array.isArray(option) && option.length >= 2) {
                return { text: option[0], value: option[1] };
            }
            return { text: String(option), value: String(option) };
        });
    }
}
