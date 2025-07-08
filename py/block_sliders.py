import sd_mecha
from .block_presets import PRESET_MAPPING
from .utils import _name


# プリセット名のリストを取得
def get_presets():
    return list(PRESET_MAPPING.keys())


# プリセット実行
def execute_preset_func(preset: str, num: int):
    func = PRESET_MAPPING.get(preset)
    res = []
    for a in range(num):
        x = a / (num - 1) # x: normalize(0-1)
        y = func(x)
        res.append(y)

    return res


# ===============================================
# Custom Node
# ===============================================
SLIDER_IO = ("FLOAT", {
    "default": 0.5, 
    "min": 0, 
    "max": 1, 
    "step": 0.01, 
    "display": "slider"
})


class Sd1BlocksSdlier:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "round": ("BOOLEAN", {
                    "default": False, 
                }), 
                "BASE": SLIDER_IO, 
                "VAE": SLIDER_IO, 
                "preset": (get_presets(), {"default": get_presets()[0]}), 
                **{f"IN{i:02}": SLIDER_IO for i in range(12)}, 
                "M00": SLIDER_IO, 
                **{f"OUT{i:02}": SLIDER_IO for i in range(12)}, 
            }
        }
    
    RETURN_TYPES = ("MECHA_RECIPE", )
    RETURN_NAMES = ("recipe", )
    FUNCTION = "execute"
    CATEGORY = "mecha/sliders"

    def execute(self, **kwargs):
        use_round = kwargs.get("round")
        if use_round:
            for k, v in kwargs.items():
                if isinstance(v, float):
                    kwargs[k] = round(v, 2)
        
        slider_dict = {k:v for k, v in kwargs.items() if k not in ["round", "preset"]}
        blocks = sd_mecha.literal(slider_dict, "sd1-supermerger_blocks")
        blocks = sd_mecha.convert(blocks, "sd1-ldm")
        
        return (blocks, )





class SdxlBlocksSdlier:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "round": ("BOOLEAN", {
                    "default": False, 
                }), 
                "BASE": SLIDER_IO, 
                "VAE": SLIDER_IO, 
                "preset": (get_presets(), {"default": get_presets()[0]}), 
                **{f"IN{i:02}": SLIDER_IO for i in range(9)}, 
                "M00": SLIDER_IO, 
                **{f"OUT{i:02}": SLIDER_IO for i in range(9)}, 
            }
        }
    
    RETURN_TYPES = ("MECHA_RECIPE", )
    RETURN_NAMES = ("recipe", )
    FUNCTION = "execute"
    CATEGORY = "mecha/sliders"

    def execute(self, **kwargs):
        use_round = kwargs.get("round")
        if use_round:
            for k, v in kwargs.items():
                if isinstance(v, float):
                    kwargs[k] = round(v, 2)
        
        slider_dict = {k:v for k, v in kwargs.items() if k not in ["round", "preset"]}
        blocks = sd_mecha.literal(slider_dict, "sdxl-supermerger_blocks")
        blocks = sd_mecha.convert(blocks, "sdxl-sgm")
        
        return (blocks, )




NODE_CLASS_MAPPINGS = {
    _name("SD1_Blocks_Slider"): Sd1BlocksSdlier, 
    _name("SDXL_Blocks_Slider"): SdxlBlocksSdlier, 
}