def log(message: str):
    print(f"[mecha-utils] {message}")


author = "jupo"
packageName = "mechaUtils"

def _name(name: str):
    return f"{author}.{packageName}.{name}"

def _dname(name: str):
    return name.replace(f"{author}.", "").replace(f"{packageName}.", "").replace("_", " ")


def _endpoint(part: str):
    return f"/{author}/{packageName}/{part}"


