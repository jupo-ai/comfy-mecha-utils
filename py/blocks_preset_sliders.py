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
    
    RETURN_TYPES = ("MECHA_HYPER", "STRING", )
    RETURN_NAMES = ("hyper", "text", )
    FUNCTION = "execute"
    CATEGORY = "advanced/model_merging/mecha/blocks/experimental"
    
    def execute(self, **kwargs):
        blocks = block_sliders.get_target_blocks("sdxl", "unet")
        hyper = {k: v for k, v in kwargs.items() if k in blocks}
        text = ",".join(map(str, hyper.values()))
        return (hyper, text, )


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
    
    RETURN_TYPES = ("MECHA_HYPER", "STRING", )
    RETURN_NAMES = ("hyper", "text", )
    FUNCTION = "execute"
    CATEGORY = "advanced/model_merging/mecha/blocks/experimental"
    
    def execute(self, **kwargs):
        blocks = block_sliders.get_target_blocks("sdxl", "unet")
        hyper = {k: v for k, v in kwargs.items() if k in blocks}
        text = ",".join(map(str, hyper.values()))
        return (hyper, text, )



NODE_CLASS_MAPPINGS = {
    _name("Blocks_SDXL_UNET_Wave_Slider"): WavePresetSlider, 
    _name("Blocks_SDXL_UNET_Cubic_Hermite_Slider"): CubicHermitePresetSlider, 
}
    
    