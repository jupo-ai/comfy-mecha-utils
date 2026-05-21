import { api } from "../../scripts/api.js";
import { app } from "../../scripts/app.js";

const AUTHOR = "jupo";

export function $el(...args) {
    const fn = window.comfyAPI?.ui?.$el;
    if (!fn) {
        throw new Error("ComfyUI ui.$el is not available");
    }
    return fn(...args);
}

// ==============================================
// ユニークなIDを作成
// ==============================================
export function mkName() {
    const parts = [AUTHOR, ...arguments];
    return parts.join(".");
}


// ==============================================
// CSSファイルの読み込み
// ==============================================
export function loadCss(path, options = {}) {
    try {
        const { preventDuplicates = true, onLoad, onError } = options;

        const normalizedPath = path.endsWith(".js")
            ? path.replace(/\.js$/, ".css")
            : path;
        
        const resolveUrl = (relativePath) => {
            try {
                const webDir = new URL(".", import.meta.url);
                return new URL(relativePath, webDir).toString();
            } catch (error) {
                console.warn(`Invalid URL: ${relativePath}`, error);
                return relativePath;
            }
        };

        const href = normalizedPath.startsWith("http")
            ? normalizedPath
            : resolveUrl(normalizedPath);
        
        if (preventDuplicates) {
            const existingLink = document.querySelector(`link[rel="stylesheet"][href="${href}"]`);
            if (existingLink) {
                return existingLink;
            }
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = href;

        if (onLoad) {
            link.addEventListener("load", () => onLoad());
        }
        if (onError) {
            link.addEventListener("error", () => onError());
        }

        document.head.appendChild(link);
        return link;
    
    } catch (error) {
        console.error(`Failed to load css ${path}: `, error)
    }
}


// ==============================================
// パス関連
// ==============================================
export class Path {
    constructor(pathStr) {
        // 入力がPathオブジェクトなら文字列を取り出す
        const p = pathStr instanceof Path ? pathStr.toString() : String(pathStr || ".");

        // Windowsのバックスラッシュをスラッシュに統一し、重複スラッシュを除去
        this._p = p.replace(/\\/g, '/').replace(/\/+/g, '/');

        // 末尾のスラッシュを除去 (ルート '/' 以外)
        if (this._p.length > 1 && this._p.endsWith('/')) {
            this._p = this._p.slice(0, -1);
        }
    }

    // ------------------------------------------
    // プロパティ Getter
    // ------------------------------------------
    // ファイル名を取得
    get name() {
        return this._p.split("/").pop();
    }

    // 親ディレクトリを取得
    //  : 戻り値はPathオブジェクト
    get parent() {
        const parts = this._p.split("/");
        if (parts.length === 1) {
            return new Path(parts[0] === "" ? "/" : "."); // ルートまたはカレント
        }
        parts.pop();
        return new Path(parts.join("/"));
    }

    // 拡張子を除いたファイル名
    get stem() {
        const name = this.name;
        const lastDot = name.lastIndexOf(".");
        if (lastDot <= 0) return name; // ドットが無い、または先頭 (隠しファイル)
        return name.substring(0, lastDot);
    }

    // 拡張子
    get suffix() {
        const name = this.name;
        const lastDot = name.lastIndexOf(".");
        if (lastDot <= 0) return "";
        return name.substring(lastDot);
    }

    // パスの構成要素を配列で返す
    get parts() {
        return this._p.split("/");
    }

    // ------------------------------------------
    // 操作メソッド
    // ------------------------------------------
    // 文字列として評価されたときにパスを返す 
    toString() {
        return this._p;
    }
    
    // JSON化されたときに文字列を返す
    toJSON() {
        return this._p;
    }

    // パスを結合する
    //  例: path.join("subdir", "file.txt")
    join(...parts) {
        // 引数がPathオブジェクトの場合も考慮
        const strParts = parts.map(part => part.toString());

        // 現在が "." なら新しいパーツをそのまま使う、そうでなければ / で繋ぐ
        const base = this._p === "." ? "" : this._p + "/";
        const combined = strParts.join("/");

        // 結果を新しいPathオブジェクトとして返す
        return new Path(base + combined);
    }

    // ファイル名を置き換えた新しいPathを返す
    with_name(newName) {
        return this.parent.join(newName);
    }

    // 拡張子を置き換えた新しいPathを返す
    with_suffix(newSuffix) {
        return this.parent.join(this.stem + newSuffix);
    }
}


// ==============================================
// エンドポイント
// ==============================================
export function endpoint(packageName, url) {
    return `/${AUTHOR}/${packageName}/${url}`;
}

export async function apiGet(packageName, url, { signal } = {}) {
    const res = await api.fetchApi(endpoint(packageName, url), { signal });
    const data = await res.json();
    return data;
}

export async function apiPost(packageName, url, postData = {}, { signal } = {}) {
    const postBody = {
        method: "POST", 
        body: JSON.stringify(postData), 
        signal, 
    };
    const res = await api.fetchApi(endpoint(packageName, url), postBody);
    const data = await res.json();
    return data;
}


// ==============================================
// ContextMenuパッチ
//  : 拡張機能の init で実行
// ==============================================
export function applyContextMenuPatch(classNames) {
    const canvas = app.canvas.constructor.prototype;
    const processContextMenu = canvas.processContextMenu;

    canvas.processContextMenu = function(node, e) {
        // 対象ノードがチェック
        if (node && classNames.includes(node.constructor.comfyClass)) {
            const canvasPos = this.convertEventToCanvasOffset(e);
            const mousePos = [canvasPos[0] - node.pos[0], canvasPos[1] - node.pos[1]];

            // クリックしたウィジェットを取得
            const clickedWidget = node.getClickedWidget?.(mousePos[0], mousePos[1]);
            if (clickedWidget) {
                clickedWidget.showContextMenu?.(e, node);
                return;
            }
        }

        return processContextMenu?.apply(this, arguments);
    }
}
