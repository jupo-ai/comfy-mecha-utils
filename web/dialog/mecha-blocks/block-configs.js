function createSliderInfo(keyPrefix, namePrefix, start, end, type = "model") {
    const result = [];
    const step = start <= end ? 1 : -1;

    for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
        result.push([`${keyPrefix}.${i}.`, `${namePrefix}.${String(i).padStart(2, "0")}`, type]);
    }

    return result;
}

const ANIMA_BASE_SEARCH_KEYS = [
    "diffusion_model.t_embedder.",
    "diffusion_model.x_embedder.",
    "diffusion_model.final_layer.",
    "diffusion_model.t_embedding_norm.",
];

export const BlockConfigs = {
    "SD1.5": {
        upper: [
            [
                [
                    "transformer.text_model.encoder.",
                    "clip_l.transformer.text_model.encoder.",
                    "clip_h.transformer.text_model.encoder.",
                ],
                "TE",
                "clip",
            ],
        ],
        left: createSliderInfo("diffusion_model.input_blocks", "INPUT", 0, 11),
        bottom: [["diffusion_model.middle_block.", "MIDDLE", "model"]],
        right: createSliderInfo("diffusion_model.output_blocks", "OUTPUT", 0, 11),
    },
    SDXL: {
        upper: [
            ["clip_l.", "TE1", "clip"],
            ["clip_g.", "TE2", "clip"],
        ],
        left: createSliderInfo("diffusion_model.input_blocks", "INPUT", 0, 8),
        bottom: [["diffusion_model.middle_block.", "MIDDLE", "model"]],
        right: createSliderInfo("diffusion_model.output_blocks", "OUTPUT", 0, 8),
    },
    Anima: {
        upper: [
            [ANIMA_BASE_SEARCH_KEYS, "BASE", "model"],
            ["diffusion_model.llm_adapter.", "LLM Adapter", "model"],
        ],
        left: createSliderInfo("diffusion_model.blocks", "BLOCK", 0, 13),
        right: createSliderInfo("diffusion_model.blocks", "BLOCK", 14, 27),
    },
};

export function createDefaultBlocks(modelType) {
    const blocks = { model: {}, clip: {} };
    const config = BlockConfigs[modelType] ?? {};

    for (const position of ["upper", "left", "right", "bottom"]) {
        for (const [keyOrKeys, , type] of config[position] ?? []) {
            const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
            keys.forEach((key) => {
                blocks[type][key] = 1;
            });
        }
    }

    return blocks;
}
