from comfy_api.latest import io
from ...utils import mk_name
from .common import PACKAGE_NAME, CATEGORY, IO_MECHA_RECIPE



class MechaUtilsBlocks(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id=mk_name(PACKAGE_NAME, "MechaUtilsBlocks"), 
            display_name="Mecha Utils Blocks", 
            category=CATEGORY, 
            inputs=[
                io.String.Input("values", socketless=True, extra_dict={"hidden": True}, default="", optional=True), 
                io.String.Input("options", socketless=True, extra_dict={"hidden": True}, default="", optional=True)
            ], 
            outputs=[
                IO_MECHA_RECIPE.Output(display_name="blocks_recipe"), 
            ], 
        )
    
    @classmethod
    def execute(cls, values: str = "", options: str = ""):
        print(f"MechaUtilsBlocks values: {values}")
        print(f"MechaUtilsBlocks options: {options}")
        
        return io.NodeOutput()
