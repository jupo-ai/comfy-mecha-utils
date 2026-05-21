function createSliderInfo(keyPrefix, namePrefix, start, end, type = "model") {
    const result = [];
    const step = start <= end ? 1 : -1;

    for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
        result.push([`${keyPrefix}.${i}`, `${namePrefix}.${String(i).padStart(2, "0")}`, type]);
    }

    return result;
}

const ANIMA_BASE_SEARCH_KEYS = [
    "diffusion_model.t_embedder.",
    "diffusion_model.x_embedder.",
    "diffusion_model.final_layer.",
    "diffusion_model.t_embedding_norm.",
].join("\n");

export const BlockConfigs = {
    "SD1.5": {
        upper: [["transformer.text_model.encoder", "TE", "clip"]],
        left: createSliderInfo("input_blocks", "INPUT", 0, 11),
        bottom: [["middle_block", "MIDDLE", "model"]],
        right: createSliderInfo("output_blocks", "OUTPUT", 0, 11),
    },
    SDXL: {
        upper: [
            ["conditioner.embedders.0", "TE1", "clip"],
            ["conditioner.embedders.1", "TE2", "clip"],
        ],
        left: createSliderInfo("input_blocks", "INPUT", 0, 8),
        bottom: [["middle_block", "MIDDLE", "model"]],
        right: createSliderInfo("output_blocks", "OUTPUT", 0, 8),
    },
    Anima: {
        upper: [
            ["__anima_base__", "BASE", "model", ANIMA_BASE_SEARCH_KEYS],
            ["diffusion_model.llm_adapter", "LLM Adapter", "model"],
        ],
        left: createSliderInfo("diffusion_model.blocks", "BLOCK", 0, 13),
        right: createSliderInfo("diffusion_model.blocks", "BLOCK", 14, 27),
    },
};

export function createDefaultBlocks(modelType) {
    const blocks = { model: {}, clip: {} };
    const config = BlockConfigs[modelType] ?? {};

    for (const position of ["upper", "left", "right", "bottom"]) {
        for (const [key, , type] of config[position] ?? []) {
            blocks[type][key] = 1;
        }
    }

    return blocks;
}
