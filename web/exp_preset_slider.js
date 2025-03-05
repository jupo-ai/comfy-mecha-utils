import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";
import { debug, _name, _endpoint } from "./utils.js";

function make_preset_extension(preset) {
    return {
        name: _name(`Exp${preset.replace("_", "")}Slider`), 

        beforeRegisterNodeDef: function(nodeType, nodeData, app) {
            if (nodeType.comfyClass === _name(`[Experimental]_${preset}_Slider`)) {

                const __onAdded = nodeType.prototype.onAdded;
                nodeType.prototype.onAdded = function() {
                    const r = __onAdded?.apply(this, arguments);

                    const sliderStart = this.widgets.findIndex(widget => widget.type === "slider");

                    this.kwargs_widgets = this.widgets.slice(0, sliderStart);
                    this.slider_widgets = this.widgets.slice(sliderStart);

                    this.kwargs_widgets.forEach(widget => {
                        widget.callback = async (value) => {
                            const kwargs = {};
                            this.kwargs_widgets.forEach(w => {
                                if (w.name === widget.name) {
                                    kwargs[w.name] = value;
                                } else {
                                    kwargs[w.name] = w.value;
                                }
                            });
                            const body = JSON.stringify(
                                {
                                    preset: preset.toLowerCase(), 
                                    num: this.slider_widgets.length, 
                                    kwargs: kwargs, 
                                }
                            );

                            const res = await api.fetchApi(_endpoint("exp_preset_slider"), {
                                method: "POST", 
                                body: body
                            });
                            const values = await res.json();

                            values.forEach((v, i) => {
                                this.slider_widgets[i].value = v;
                            });

                            this.setDirtyCanvas(true, false);
                        };
                    });

                    return r
                };
            }
        }, 
    };
}


const targetPresets = [
    "Wave", 
    "Cubic_Hermite", 
]

targetPresets.forEach(preset => {
    app.registerExtension(make_preset_extension(preset));
});