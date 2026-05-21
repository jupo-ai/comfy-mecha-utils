import importlib
from pathlib import Path

py_dir = Path(__file__).parent

EXTENSION_NAME = py_dir.parent.stem

def import_modules_from_directory(dirname: str):
    """指定されたディレクトリからモジュールを動的にインポートする"""
    dir_path = py_dir / dirname
    if not dir_path.exists():
        return []
    
    imported_modules = []
    disabled_modules = {}
    if not __package__:
        return imported_modules
    
    for path in dir_path.iterdir():
        if path.name.startswith(("_", ".")):
            continue
    
        module_name = None
        is_package = False
        
        if path.is_file() and path.suffix == ".py":
            module_name = path.stem
        elif path.is_dir() and (path / "__init__.py").exists():
            module_name = path.name
            is_package = True
        
        if module_name:
            if module_name in disabled_modules.get(dirname, set()):
                print(f"⏸️ Skipping disabled {dirname}: {module_name}")
                continue
            try:
                module = importlib.import_module(f".{dirname}.{module_name}", package=__package__)
                imported_modules.append(module)
                print(f"✅ Successfully imported {dirname}: {module_name}")
            except ImportError as e:
                print(f"❌ Failed to import {dirname}: {module_name}: {e}")
        
        elif path.is_dir() and not is_package:
            print(f"⚠️ Skipping non-package directory: {path.name}")
    
    return imported_modules



print(f"{'=' * 20} {EXTENSION_NAME} {'=' * 20}")

# modulesディレクトリ
import_modules_from_directory("modules")

# nodesディレクトリ
NODES = []
node_modules = import_modules_from_directory("nodes")
for module in node_modules:
    if hasattr(module, "nodes"):
        NODES.extend(module.nodes)

