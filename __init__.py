import json
from aiohttp import web

from server import PromptServer

from .py.utils import _dname, _endpoint, log
from .py import NODE_CLASS_MAPPINGS

NODE_DISPLAY_NAME_MAPPINGS = {k: _dname(k) for k in NODE_CLASS_MAPPINGS}
WEB_DIRECTORY = "./web"


# ===============================================
# endpoint
# ===============================================
routes = PromptServer.instance.routes

# debug print
@routes.post(_endpoint("debug"))
async def debug(req: web.Request):
    data = await req.json()
    log(data)
    return web.Response()


# -------------------------------------
# block sliders
from .py import block_sliders

# block sliders のカスタムノード一覧を取得
@routes.get(_endpoint("block_sliders_node_list"))
async def get_block_sliders_node_list(req: web.Request):
    node_names = list(block_sliders.NODE_CLASS_MAPPINGS.keys())
    body = json.dumps(node_names)

    return web.Response(body=body)

# preset 変更時
@routes.post(_endpoint("block_sliders_preset_on_changed"))
async def block_sliders_preset_on_changed(req: web.Request):
    data = await req.json()
    preset = data.get("preset")
    slider_num = data.get("num")
    
    values = block_sliders.execute_preset_func(preset, slider_num)
    body = json.dumps(values)
    
    return web.Response(body=body)



# -------------------------------------
# exp preset slider
@routes.post(_endpoint("exp_preset_slider"))
async def exp_wave_preset(req: web.Request):
    data = await req.json()
    preset = data.get("preset")
    num = data.get("num")
    kwargs = data.get("kwargs")
    
    from .py import block_presets
    func = getattr(block_presets, preset)
    
    res = []
    for a in range(num):
        x = a / (num - 1)
        y = func(x, **kwargs)
        res.append(y)
    
    body = json.dumps(res)
    return web.Response(body=body)
    