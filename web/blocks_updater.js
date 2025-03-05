import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { debug, _name, _endpoint } from "./utils.js";


const extension = {
    name: _name("BlocksUpdater"), 

    beforeRegisterNodeDef: function(nodeType, nodeData, app) {
        if (nodeType.comfyClass === _name("Blocks_Updater")) {
            
            const __onConnectionsChange = nodeType.prototype.onConnectionsChange;
            nodeType.prototype.onConnectionsChange = function(side, slot, connected, link_info) {
                const r = __onConnectionsChange?.apply(this, arguments);

                // 入力の時 (side === 1 が入力)
                if (side === 1) {
                    this.adjustHyperInputs();
                }

                return r;
            };

            nodeType.prototype.adjustHyperInputs = function() {
                // this.inputsを走査して、一番上以外の未接続スロットを削除
                const inputsToRemove = [];
                
                // 入力スロットをチェック（インデックス0は保持）
                for (let i = 1; i < this.inputs.length; i++) {
                    if (!this.inputs[i].link) { // 未接続の場合
                        inputsToRemove.push(i);
                    }
                }

                // 削除対象のスロットを後ろから順に削除（インデックスがずれないように）
                for (let i = inputsToRemove.length - 1; i >= 0; i--) {
                    this.removeInput(inputsToRemove[i]);
                }

                // 必要に応じて新しい入力スロットを追加
                if (this.inputs.length > 0 && this.inputs[this.inputs.length - 1].link) {
                    this.addInput(`hyper_${this.inputs.length}`, "MECHA_HYPER");
                    this.inputs[this.inputs.length - 1].label = "hyper";
                }
            };
        }
    }, 
};

app.registerExtension(extension);