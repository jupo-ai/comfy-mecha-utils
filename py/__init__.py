from . import block_sliders
# from . import blocks_preset_sliders
from . import blocks_updater
from . import hyper_multiplier

NODE_CLASS_MAPPINGS = {}
NODE_CLASS_MAPPINGS.update(block_sliders.NODE_CLASS_MAPPINGS)
# NODE_CLASS_MAPPINGS.update(blocks_preset_sliders.NODE_CLASS_MAPPINGS)
NODE_CLASS_MAPPINGS.update(blocks_updater.NODE_CLASS_MAPPINGS)
NODE_CLASS_MAPPINGS.update(hyper_multiplier.NODE_CLASS_MAPPINGS)