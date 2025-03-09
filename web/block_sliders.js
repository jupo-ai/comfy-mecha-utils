import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { $el } from "../../scripts/ui.js";
import { debug, _name, _endpoint } from "./utils.js";


const extension = {
    name: _name("BlockSliders"), 
    nodeNames: [], 

    init: async function(app) {
        // python側で作成したカスタムノードの一覧を取得
        const res = await api.fetchApi(_endpoint("block_sliders_node_list"));
        this.nodeNames = await res.json();
    }, 

    beforeRegisterNodeDef: function(nodeType, nodeData, app) {
        if (!this.nodeNames.includes(nodeType.comfyClass)) return;

        const __onAdded = nodeType.prototype.onAdded;
        nodeType.prototype.onAdded = function() {
            const result = __onAdded?.apply(this, arguments);

            // ウィジェットの初期化
            this.properties ||= {};
            const presetIndex = this.widgets.findIndex(widget => widget.name === "preset");
            this.preset = this.widgets[presetIndex];
            this.sliders = this.widgets.slice(presetIndex + 1); // presetの対象となるスライダー

            // 各スライダーの設定
            this.widgets.forEach(widget => {
                if (widget.type !== "slider") return;

                this.addProperty(widget.name, widget.value, "string", {
                    callback: (_, value) => {
                        widget.value = value;
                        this.setDirtyCanvas(true, false);
                    }
                });

                widget.callback = (value) => {
                    const shouldRound = this.widgets[0].value;
                    const finalValue = shouldRound ? Number(value.toFixed(2)) : value;
                    this.properties[widget.name] = finalValue;
                    // プロパティパネルへ即時表示
                    const panel = app.canvas.node_panel;
                    const valueElement = panel?.querySelector(`div.property[data-property="${widget.name}"] span.property_value`);
                    if (valueElement) valueElement.textContent = finalValue;
                }
            });
            
            // preset のコールバック
            this.preset.callback = async (value) => {
                const res = await api.fetchApi(_endpoint("block_sliders_preset_on_changed"), {
                    method: "POST", 
                    body: JSON.stringify({preset: value, num: this.sliders.length})
                });
                const values = await res.json();

                values.forEach((v, i) => {
                    const slider = this.sliders[i]
                    slider.value = v;
                    slider?.callback(v);
                });
                
                this.setDirtyCanvas(true, false);
            };

            return result;
        };
    }, 
};

app.registerExtension(extension);
