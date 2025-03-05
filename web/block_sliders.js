import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
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
        if (this.nodeNames.includes(nodeType.comfyClass)) {
            // preset に対してcallbackを設定する

            const __onAdded = nodeType.prototype.onAdded;
            nodeType.prototype.onAdded = function() {
                const r = __onAdded?.apply(this, arguments);
                
                const presetIndex = this.widgets.findIndex(widget => widget.name === "preset");
                this.preset = this.widgets[presetIndex];
                this.sliders = this.widgets.slice(presetIndex+1);
                
                this.preset.callback = async (value) => {
                    const res = await api.fetchApi(_endpoint("block_sliders_preset_on_changed"), {
                        method: "POST", 
                        body: JSON.stringify({preset: value, num: this.sliders.length})
                    });
                    const values = await res.json();

                    values.forEach((v, i) => {
                        this.sliders[i].value = v;
                    });
                    
                    this.setDirtyCanvas(true, false);
                };

                return r;
            }
        }
    }, 
};

app.registerExtension(extension);
