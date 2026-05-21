import dataclasses
from collections import OrderedDict
from typing import Optional

import sd_mecha
from sd_mecha import RecipeNodeOrValue
from sd_mecha.extensions import model_configs


MODEL_PREFIX = "model.diffusion_model."
ANIMA_CONFIG_ID = "anima-comfyui"
ANIMA_BLOCKS = 28
ANIMA_LLM_BLOCKS = 6

MAIN_BLOCK_SUFFIXES = (
    "self_attn.q_proj.weight",
    "self_attn.q_norm.weight",
    "self_attn.k_proj.weight",
    "self_attn.k_norm.weight",
    "self_attn.v_proj.weight",
    "self_attn.output_proj.weight",
    "cross_attn.q_proj.weight",
    "cross_attn.q_norm.weight",
    "cross_attn.k_proj.weight",
    "cross_attn.k_norm.weight",
    "cross_attn.v_proj.weight",
    "cross_attn.output_proj.weight",
    "mlp.layer1.weight",
    "mlp.layer2.weight",
    "adaln_modulation_self_attn.1.weight",
    "adaln_modulation_self_attn.2.weight",
    "adaln_modulation_cross_attn.1.weight",
    "adaln_modulation_cross_attn.2.weight",
    "adaln_modulation_mlp.1.weight",
    "adaln_modulation_mlp.2.weight",
)

BASE_SUFFIXES = (
    "t_embedder.1.linear_1.weight",
    "t_embedder.1.linear_2.weight",
    "x_embedder.proj.1.weight",
    "final_layer.linear.weight",
    "final_layer.adaln_modulation.1.weight",
    "final_layer.adaln_modulation.2.weight",
    "t_embedding_norm.weight",
)

LLM_BLOCK_SUFFIXES = (
    "norm_self_attn.weight",
    "self_attn.q_proj.weight",
    "self_attn.q_norm.weight",
    "self_attn.k_proj.weight",
    "self_attn.k_norm.weight",
    "self_attn.v_proj.weight",
    "self_attn.o_proj.weight",
    "norm_cross_attn.weight",
    "cross_attn.q_proj.weight",
    "cross_attn.q_norm.weight",
    "cross_attn.k_proj.weight",
    "cross_attn.k_norm.weight",
    "cross_attn.v_proj.weight",
    "cross_attn.o_proj.weight",
    "norm_mlp.weight",
    "mlp.0.weight",
    "mlp.0.bias",
    "mlp.2.weight",
    "mlp.2.bias",
)

LLM_BASE_SUFFIXES = (
    "llm_adapter.embed.weight",
    "llm_adapter.out_proj.weight",
    "llm_adapter.out_proj.bias",
    "llm_adapter.norm.weight",
)


def _prefixed_key(key: str) -> str:
    return f"{MODEL_PREFIX}{key}"


def _main_block_keys(index: int) -> tuple[str, ...]:
    return tuple(_prefixed_key(f"blocks.{index}.{suffix}") for suffix in MAIN_BLOCK_SUFFIXES)


def _llm_block_keys(index: int) -> tuple[str, ...]:
    return tuple(_prefixed_key(f"llm_adapter.blocks.{index}.{suffix}") for suffix in LLM_BLOCK_SUFFIXES)


def _base_keys() -> tuple[str, ...]:
    return tuple(_prefixed_key(suffix) for suffix in BASE_SUFFIXES)


def _llm_base_keys() -> tuple[str, ...]:
    return tuple(_prefixed_key(suffix) for suffix in LLM_BASE_SUFFIXES)


def _mergeable_keys() -> tuple[str, ...]:
    keys = list(_base_keys())
    for i in range(ANIMA_BLOCKS):
        keys.extend(_main_block_keys(i))
    return tuple(keys)


def _llm_keys() -> tuple[str, ...]:
    keys = list(_llm_base_keys())
    for i in range(ANIMA_LLM_BLOCKS):
        keys.extend(_llm_block_keys(i))
    return tuple(keys)


def _all_known_keys() -> tuple[str, ...]:
    return (*_mergeable_keys(), *_llm_keys())


def _anima_weight_config() -> model_configs.ModelConfig:
    components = OrderedDict()
    components["diffusion_model"] = OrderedDict(
        (
            key,
            {
                "aliases": [key.removeprefix(MODEL_PREFIX), f"net.{key.removeprefix(MODEL_PREFIX)}"],
                "optional": True,
            },
        )
        for key in _all_known_keys()
    )
    return model_configs.ModelConfigImpl(
        identifier=ANIMA_CONFIG_ID,
        components=components,
    )


ANIMA_WEIGHT_CONFIG = _anima_weight_config()
try:
    model_configs.resolve(ANIMA_CONFIG_ID)
except KeyError:
    model_configs.register(ANIMA_WEIGHT_CONFIG)

