import { api } from "../../scripts/api.js";

const DEBUG = true;
export function debug(data) {
    if (DEBUG) {
        api.fetchApi(_endpoint("debug"), {
            method: "POST", 
            body: JSON.stringify(data), 
        });
    }
}


const author = "jupo";
const packageName = "mechaUtils";

export function _name(name) {
    return `${author}.${packageName}.${name}`;
}

export function _endpoint(part) {
    return `/${author}/${packageName}/${part}`;
}

