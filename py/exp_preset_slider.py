# experimental wave preset slider
import sys
from . import block_sliders
from .utils import _name

class WavePresetSlider:
    @classmethod
    def INPUT_TYPES(cls):
        required = {}
        required["k"] = ("INT", {"default": 1, "min": 1, "max": 4, "step": 1})
        required["p"] = ("FLOAT", {"default": 0, "min": 0, "max": 1, "step": 0.01})
        for block in block_sliders.get_target_blocks("sdxl", "unet"):
            required[block] = ("FLOAT", {"min": 0, "max": 1, "step": 0.01, "display": "slider"})
        
        return {
            "required": required
        }
    
    RETURN_TYPES = ("STRING", )
    RETURN_NAMES = ("text", )
    FUNCTION = "execute"
    CATEGORY = "advanced/model_merging/mecha/blocks/experimental"
    
    def execute(self, **kwargs):
        blocks = block_sliders.get_target_blocks("sdxl", "unet")
        values = tuple(v for k, v in kwargs.items() if k in blocks)

        text = ",".join(map(str, values))
        return (text, )


class CubicHermitePresetSlider:
    @classmethod
    def INPUT_TYPES(cls):
        required = {}
        required["p0"] = ("FLOAT", {"default": 0, "min": 0, "max": 1, "step": 0.01})
        required["p1"] = ("FLOAT", {"default": 0, "min": 0, "max": 1, "step": 0.01})
        required["m0"] = ("FLOAT", {"default": 0, "step": 0.01, "min": -sys.float_info.max, "max": sys.float_info.max})
        required["m1"] = ("FLOAT", {"default": 0, "step": 0.01, "min": -sys.float_info.max, "max": sys.float_info.max})
        for block in block_sliders.get_target_blocks("sdxl", "unet"):
            required[block] = ("FLOAT", {"min": 0, "max": 1, "step": 0.01, "display": "slider"})
        
        return {
            "required": required
        }
    
    RETURN_TYPES = ("STRING", )
    RETURN_NAMES = ("text", )
    FUNCTION = "execute"
    CATEGORY = "advanced/model_merging/mecha/blocks/experimental"
    
    def execute(self, **kwargs):
        blocks = block_sliders.get_target_blocks("sdxl", "unet")
        values = tuple(v for k, v in kwargs.items() if k in blocks)

        text = ",".join(map(str, values))
        return (text, )



NODE_CLASS_MAPPINGS = {
    _name("[Experimental]_Wave_Slider"): WavePresetSlider, 
    _name("[Experimental]_Cubic_Hermite_Slider"): CubicHermitePresetSlider, 
}
    
    