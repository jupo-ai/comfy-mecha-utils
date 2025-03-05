from .utils import _name

class BlocksUpdater:
    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {
                "hyper": ("MECHA_HYPER", {"forceInput": True})
            }
        }
    
    RETURN_TYPES = ("MECHA_HYPER", )
    RETURN_NAMES = ("hyper", )
    CATEGORY = "advanced/model_merging/mecha/blocks"
    FUNCTION = "execute"
    
    def execute(self, **kwargs):
        hyper = {}
        for v in kwargs.values():
            if isinstance(v, dict):
                hyper.update(v)
        
        return (hyper, )


NODE_CLASS_MAPPINGS = {
    _name("Blocks_Updater"): BlocksUpdater, 
}