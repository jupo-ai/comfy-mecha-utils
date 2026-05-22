import dataclasses
from pathlib import Path
from typing import Optional

import folder_paths
import sd_mecha
from comfy_api.latest import io
from sd_mecha import RecipeNodeOrValue

from ...jupo_utils import mk_name
from ..mecha_blocks.common import CATEGORY, IO_MECHA_RECIPE, PACKAGE_NAME


MODEL_CONFIG_AUTO = "auto"
MERGE_SPACE_DEFAULT = "default"
MODEL_CONFIG_OPTIONS = [
    MODEL_CONFIG_AUTO,
    *[
        config.identifier
        for config in sd_mecha.extensions.model_configs.get_all_base()
        if "blocks" not in config.identifier
    ],
]
MERGE_SPACE_OPTIONS = [
    MERGE_SPACE_DEFAULT,
    *[merge_space.identifier for merge_space in sd_mecha.extensions.merge_spaces.get_all()],
]


@dataclasses.dataclass
class ComfyMechaRecipe:
    node: RecipeNodeOrValue
    cache: Optional[dict] = dataclasses.field(default_factory=dict)


def _model_files(folder_id: str) -> list[str]:
    return [
        filename
        for filename in folder_paths.get_filename_list(folder_id)
        if filename.endswith(".safetensors")
    ]


def _make_recipe(folder_id: str, model_name: str, model_config: str, merge_space: str):
    model_path = Path(folder_paths.get_full_path_or_raise(folder_id, model_name))
    config = None if model_config == MODEL_CONFIG_AUTO else model_config
    if merge_space == MERGE_SPACE_DEFAULT:
        merge_space = "weight"
    return ComfyMechaRecipe(sd_mecha.model(model_path, config=config, merge_space=merge_space))


class MechaUtilsDiffusionModelLoader(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id=mk_name(PACKAGE_NAME, "DiffusionModelMechaLoader"),
            display_name="Diffusion Model",
            category=CATEGORY,
            inputs=[
                io.Combo.Input("model_name", options=_model_files("diffusion_models")),
                io.Combo.Input("model_config", options=MODEL_CONFIG_OPTIONS, default=MODEL_CONFIG_AUTO, optional=True),
                io.Combo.Input("merge_space", options=MERGE_SPACE_OPTIONS, default=MERGE_SPACE_DEFAULT, optional=True),
            ],
            outputs=[
                IO_MECHA_RECIPE.Output("recipe"),
            ],
        )

    @classmethod
    def execute(
        cls,
        model_name: str,
        model_config: str = MODEL_CONFIG_AUTO,
        merge_space: str = MERGE_SPACE_DEFAULT,
    ):
        return io.NodeOutput(_make_recipe("diffusion_models", model_name, model_config, merge_space))


class MechaUtilsTextEncoderLoader(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id=mk_name(PACKAGE_NAME, "TextEncoderMechaLoader"),
            display_name="Text Encoder",
            category=CATEGORY,
            inputs=[
                io.Combo.Input("model_name", options=_model_files("text_encoders")),
                io.Combo.Input("model_config", options=MODEL_CONFIG_OPTIONS, default=MODEL_CONFIG_AUTO, optional=True),
                io.Combo.Input("merge_space", options=MERGE_SPACE_OPTIONS, default=MERGE_SPACE_DEFAULT, optional=True),
            ],
            outputs=[
                IO_MECHA_RECIPE.Output("recipe"),
            ],
        )

    @classmethod
    def execute(
        cls,
        model_name: str,
        model_config: str = MODEL_CONFIG_AUTO,
        merge_space: str = MERGE_SPACE_DEFAULT,
    ):
        return io.NodeOutput(_make_recipe("text_encoders", model_name, model_config, merge_space))
