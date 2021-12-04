import {isDefined} from "./isDefined";
import {assert} from "./assert";


export function safeCopy(baseArray: any): any {
    "use strict";
    assert(isDefined(baseArray), "safeCopy called without a valid parameter");

    let json_str = JSON.stringify(baseArray, function (key, value) {
        if (value instanceof Uint8Array) {
            let ret = "@type:Uint8Array@";
            for (let i = 0; i < (value as Uint8Array).length; i++) {
                ret += value[i];
                if (i < (value as Uint8Array).length - 1) {
                    ret += ",";
                }
            }
            return ret;
        }
        if (typeof value === "function") {
            if (key === "viewFactory") {
                return value.toString();
            }
        }
        return value;
    });
    return JSON.parse(json_str, function (key, value) {
        if (typeof value === "string" && value.startsWith("@type:")) {
            if (value.startsWith("@type:Uint8Array@")) {
                let split = value.substr("@type:Uint8Array@".length).split(",");
                let uintArray = new Uint8Array(split.length);
                for (let i = 0; i < split.length; i ++) {
                    uintArray[i] = parseInt(split[i]);
                }
                return uintArray;
            }
        }
        if (key === "viewFactory") {
            return eval("(" + value + ")");
        }
        return value;
    });

}
