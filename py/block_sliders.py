import sd_mecha
from .block_presets import PRESET_MAPPING
from .utils import _name

# 非対象コンポーネントのリストを取得
# 順番はsd_mecha.defaultで得られる順番
def get_non_target_components(arch_id: str, target_component: str):
    default = sd_mecha.default(arch_id)
    default_keys = list(default.keys())
    
    # arch_component_defaultの形からcomponentのみ
    default_keys = [key.replace(f"{arch_id}_", "").replace("_default", "") for key in default_keys]

    # target_component ではないもののみ抽出
    non_targets = [cmp for cmp in default_keys if cmp != target_component]
    return non_targets

# プリセット名のリストを取得
def get_presets():
    return list(PRESET_MAPPING.keys())

# 対象コンポーネントのブロックリストを取得
# 順番はsd_mecha.blocksで得られる順番
def get_target_blocks(arch_id: str, target_component: str):
    arch = sd_mecha.extensions.model_arch.resolve(arch_id)
    temp_blocks = list(k for k in arch.user_keys() if "_" + target_component + "_block" in k)
    temp_values = [0] * len(temp_blocks)

    blocks = sd_mecha.blocks(arch_id, target_component, *temp_values)
    blocks_keys = list(blocks.keys())
    return blocks_keys

    
# プリセット実行
def execute_preset_func(preset: str, num: int):
    func = PRESET_MAPPING.get(preset)
    res = []
    for a in range(num):
        x = a / (num - 1) # x: normalize(0-1)
        y = func(x)
        res.append(y)

    return res


# ===============================================
# Custom Node
# ===============================================
NODE_CLASS_MAPPINGS = {}

def register_block_sliders_nodes():
    for arch_id in sd_mecha.extensions.model_arch.get_all():
        arch = sd_mecha.extensions.model_arch.resolve(arch_id)
        
        for component in arch.components:
            class_name = f"Mecha_Blocks_{arch_id.upper()}_{component.upper()}"
            class_name = _name(class_name)
            NODE_CLASS_MAPPINGS[class_name] = make_block_sliders_node(class_name, arch_id, component)


def make_block_sliders_node(class_name: str, arch_id: str, target_component: str):
    def __input_types(cls):
        required = {}
        # round
        required["round"] = ("BOOLEAN", {"default": False})
        # non targets
        for cmp in get_non_target_components(arch_id, target_component):
           required[cmp] = ("FLOAT", {"default": 0.5, "min": 0, "max": 1, "step": 0.01, "display": "slider"})
        # preset
        presets = get_presets()
        required["preset"] = (presets, {"default": presets[0]})
        # blocks
        for block in get_target_blocks(arch_id, target_component):
            required[block] = ("FLOAT", {"default": 0.5, "min": 0, "max": 1, "step": 0.01, "display": "slider"})
        
        return {"required": required}
    
    def __execute(self, **kwargs):
        hyper = {}
        # round
        use_round = kwargs.get("round")
        if use_round:
            for k, v in kwargs.items():
                if isinstance(v, float):
                    kwargs[k] = round(v, 2)
            
        # non targets
        for k, v in kwargs.items():
            if k in get_non_target_components(arch_id, target_component):
                hyper.update(sd_mecha.default(arch_id, k, v))
        
        # blocks
        values = tuple(v for k, v in kwargs.items() if k in get_target_blocks(arch_id, target_component))
        hyper.update(sd_mecha.blocks(arch_id, target_component, *values))

        # text
        text = ",".join(map(str, values))
        
        return (hyper, text)
    
    cls = type(class_name, (object, ), {
        "INPUT_TYPES": classmethod(__input_types), 
        "RETURN_TYPES": ("MECHA_HYPER", "STRING"), 
        "RETURN_NAMES": ("hyper", "blocks text"), 
        "FUNCTION": "execute", 
        "CATEGORY": "advanced/model_merging/mecha/blocks", 
        "execute": __execute
    })
    
    return cls


register_block_sliders_nodes()
