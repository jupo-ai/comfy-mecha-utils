from functools import wraps
from server import PromptServer
from pathlib import Path

AUTHOR = "jupo"
ROOT_DIR = Path(__file__).parent.parent

def mk_name(*args):
    parts = [AUTHOR] + list(args)
    return ".".join(parts)

def mk_category(*args):
    parts = [AUTHOR] + list(args)
    return "/".join(parts)


class Endpoint:
    routes = PromptServer.instance.routes
    
    @classmethod
    def _endpoint(cls, *args):
        parts = [AUTHOR] + list(args)
        path = "/".join(parts)
        return f"/{path}"
    
    @classmethod
    def get(cls, *args):
        """GETリクエスト用デコレータ"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            
            cls.routes.get(cls._endpoint(*args))(wrapper)
            return wrapper
        return decorator
    
    @classmethod
    def post(cls, *args):
        """POSTリクエスト用デコレータ"""
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            
            cls.routes.post(cls._endpoint(*args))(wrapper)
            return wrapper
        return decorator


