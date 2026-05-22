import dataclasses
import json
from typing import Any

import sd_mecha
from comfy_api.latest import io
from sd_mecha.extensions import model_configs

from ...modules import anima_config  # noqa: F401
from ...jupo_utils import mk_name
from .common import PACKAGE_NAME, CATEGORY, IO_MECHA_RECIPE


MODEL_CONFIG_AUTO = "auto"
MODEL_CONFIGS = {
    "SD1.5": "sd1-ldm",
    "SDXL": "sdxl-sgm",
    "Anima": anima_config.ANIMA_CONFIG_ID,
}
MODEL_CONFIG_OPTIONS = [MODEL_CONFIG_AUTO, *dict.fromkeys(MODEL_CONFIGS.values())]


@dataclasses.dataclass
class ComfyMechaRecipe:
    node: Any
    cache: dict = dataclasses.field(default_factory=dict)


def _parse_values(values: str) -> list[dict[str, Any]]:
    if not values:
        return []

    parsed = json.loads(values)
    if not isinstance(parsed, list):
        raise ValueError("MechaUtilsBlocks values must be a list.")

    return [item for item in parsed if isinstance(item, dict)]


def _active_block_values(values: str) -> list[dict[str, Any]]:
    return [
        item
        for item in _parse_values(values)
        if item.get("enabled") and not item.get("isSeparator")
    ]


def _resolve_model_config_id(item: dict[str, Any], model_config: str) -> str:
    if model_config != MODEL_CONFIG_AUTO:
        return model_config

    model_type = item.get("modelType")
    try:
        return MODEL_CONFIGS[model_type]
    except KeyError as exc:
        raise ValueError(f"Unsupported MechaUtilsBlocks model type for auto config: {model_type!r}") from exc


def _prefix_candidates(prefix: str, config_id: str) -> tuple[str, ...]:
    candidates = [prefix]

    if prefix.startswith("diffusion_model."):
        candidates.append(f"model.{prefix}")

    if config_id == "sd1-ldm":
        if prefix.startswith("transformer.text_model.encoder."):
            candidates.append(f"cond_stage_model.{prefix}")
        elif prefix.startswith("clip_l.transformer.text_model.encoder."):
            suffix = prefix.removeprefix("clip_l.")
            candidates.append(f"cond_stage_model.{suffix}")
        elif prefix.startswith("clip_h.transformer.text_model.encoder."):
            suffix = prefix.removeprefix("clip_h.")
            candidates.append(f"cond_stage_model.{suffix}")

    if config_id == "sdxl-sgm":
        if prefix.startswith("clip_l."):
            suffix = prefix.removeprefix("clip_l.")
            candidates.append(f"conditioner.embedders.0.{suffix}")
        elif prefix.startswith("clip_g."):
            suffix = prefix.removeprefix("clip_g.")
            candidates.append(f"conditioner.embedders.1.{suffix}")

    return tuple(dict.fromkeys(candidates))


def _iter_prefix_weights(item: dict[str, Any], config_id: str):
    blocks = item.get("blocks") or {}
    for component_weights in blocks.values():
        if not isinstance(component_weights, dict):
            continue
        for prefix, weight in component_weights.items():
            if not isinstance(prefix, str):
                continue
            try:
                for candidate in _prefix_candidates(prefix, config_id):
                    yield candidate, float(weight)
            except (TypeError, ValueError):
                continue


def _expand_prefix_weights(
    item: dict[str, Any],
    config_id: str,
    config: model_configs.ModelConfig,
) -> dict[str, float]:
    prefix_weights = list(_iter_prefix_weights(item, config_id))
    if not prefix_weights:
        return {}

    weights = {}
    for key in config.keys():
        for prefix, weight in prefix_weights:
            if key.startswith(prefix):
                weights[key] = weight

    return weights


class MechaUtilsBlocks(io.ComfyNode):
    @classmethod
    def define_schema(cls):
        return io.Schema(
            node_id=mk_name(PACKAGE_NAME, "MechaUtilsBlocks"), 
            display_name="Mecha Utils Blocks", 
            category=CATEGORY, 
            inputs=[
                io.String.Input("values", socketless=True, extra_dict={"hidden": True}, default="", optional=True), 
                io.String.Input("options", socketless=True, extra_dict={"hidden": True}, default="", optional=True),
                io.Combo.Input("model_config", options=MODEL_CONFIG_OPTIONS, default=MODEL_CONFIG_AUTO, optional=True),
                io.Float.Input("default", default=0.0, min=-2**64, max=2**64, step=0.01, optional=True),
            ], 
            outputs=[
                IO_MECHA_RECIPE.Output(display_name="blocks_recipe"), 
            ], 
        )
    
    @classmethod
    def execute(
        cls,
        values: str = "",
        options: str = "",
        model_config: str = MODEL_CONFIG_AUTO,
        default: float = 0.0,
    ):
        active_items = _active_block_values(values)
        if not active_items:
            return io.NodeOutput(ComfyMechaRecipe(default))

        item = active_items[-1]
        config_id = _resolve_model_config_id(item, model_config)
        config = model_configs.resolve(config_id)
        weights = _expand_prefix_weights(item, config_id, config)

        recipe = sd_mecha.literal(default, config=config, merge_space="param")
        if weights:
            recipe = sd_mecha.literal(weights, config=config, merge_space="param") | recipe

        return io.NodeOutput(ComfyMechaRecipe(recipe))
