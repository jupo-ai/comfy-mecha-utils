import { app } from "../../../scripts/app.js";
import { mkName } from "../utils.js";
import { MechaBlocksField } from "../dom/mecha-blocks-field.js";

const PACKAGE_NAME = "MechaUtils";
const CLASS_NAME = mkName(PACKAGE_NAME, "MechaUtilsBlocks");

function hideSocketlessWidget(node, name) {
    const widget = node.widgets?.find((w) => w.name === name);
    if (widget) {
        widget.options ??= {};
        widget.options.hidden = true;
        widget.hidden = true;
        widget.computeSize = () => [0, 0];
    }

    let inputIndex = node.inputs?.findIndex((input) => input.name === name) ?? -1;
    while (inputIndex >= 0) {
        if (typeof node.removeInput === "function") {
            node.removeInput(inputIndex);
        } else {
            node.inputs.splice(inputIndex, 1);
        }
        inputIndex = node.inputs?.findIndex((input) => input.name === name) ?? -1;
    }

    return widget;
}

app.registerExtension({
    name: mkName(PACKAGE_NAME, "Blocks"),

    beforeRegisterNodeDef(nodeType) {
        if (nodeType.comfyClass !== CLASS_NAME) return;

        const onNodeCreated = nodeType.prototype.onNodeCreated;
        nodeType.prototype.onNodeCreated = function () {
            const result = onNodeCreated?.apply(this, arguments);

            this.selectMode = "alwaysOne";
            this.valuesWidget = hideSocketlessWidget(this, "values");
            this.optionsWidget = hideSocketlessWidget(this, "options");
            this.setupMechaBlocksField();

            return result;
        };

        nodeType.prototype.setupMechaBlocksField = function () {
            this.blocksField = new MechaBlocksField(this);
            const fieldWidget = this.addDOMWidget("field", "DOM", this.blocksField.element);

            fieldWidget.computeLayoutSize = () => ({
                minHeight: this.blocksField.computeHeight(),
                minWidth: this.blocksField.computeWidth(),
            });
            fieldWidget.onClick = () => {};
        };

        const configure = nodeType.prototype.configure;
        nodeType.prototype.configure = function (data) {
            const result = configure?.apply(this, arguments);

            this.valuesWidget = hideSocketlessWidget(this, "values");
            this.optionsWidget = hideSocketlessWidget(this, "options");
            this.blocksField?.load(this.valuesWidget?.value);

            return result;
        };

        nodeType.prototype.updateNodeSize = function () {
            const computed = this.computeSize();
            this.size[0] = Math.max(this.size[0], computed[0]);
            this.size[1] = Math.max(this.size[1], computed[1]);
            this.setDirtyCanvas(true, true);
        };
    },
});
