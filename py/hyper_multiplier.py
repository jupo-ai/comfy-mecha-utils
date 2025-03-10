from .utils import _name

class MechaHyperMultiplier:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "hyper": ("MECHA_HYPER", ), 
            }, 
            "optional": {
                "dict_opt": ("MECHA_HYPER", ), 
                "float_opt": ("FLOAT", {"min": -10, "max": 10, "step": 0.01, "default": 1.0})
            }
        }
    
    RETURN_TYPES = ("MECHA_HYPER", )
    RETURN_NAMES = ("hyper", )
    CATEGORY = "advanced/model_merging/mecha"
    FUNCTION = "execute"

    def execute(self, hyper, dict_opt={}, float_opt=1.0):
        if isinstance(hyper, dict):
            hyper = {k: v * dict_opt.get(k, 1.0) for k, v in hyper.items()}
            hyper = {k: v * float_opt for k, v in hyper.items()}
        
        elif isinstance(hyper, float):
            hyper = hyper * float_opt

        return (hyper, )


NODE_CLASS_MAPPINGS = {
    _name("Hyper_Multiplier"): MechaHyperMultiplier
}