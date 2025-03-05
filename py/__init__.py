from . import block_sliders
from . import exp_preset_slider
from . import blocks_updater

NODE_CLASS_MAPPINGS = {}
NODE_CLASS_MAPPINGS.update(block_sliders.NODE_CLASS_MAPPINGS)
NODE_CLASS_MAPPINGS.update(exp_preset_slider.NODE_CLASS_MAPPINGS)
NODE_CLASS_MAPPINGS.update(blocks_updater.NODE_CLASS_MAPPINGS)