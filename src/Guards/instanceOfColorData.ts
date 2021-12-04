import {ColorData} from "../Color/ColorData";
import {isDefined} from "../Utils/isDefined";


export function instanceOfColorData(object: any): object is ColorData {
    return isDefined(object) &&
        typeof object.mode === "string" &&
        ["rgba", "hsla", "cmyka", "lab", "xyz"].includes(object.mode) &&
        typeof object.red === "number" &&
        typeof object.green === "number" &&
        typeof object.blue === "number" &&
        typeof object.alpha === "number" &&
        typeof object.cyan === "number" &&
        typeof object.magenta === "number" &&
        typeof object.yellow === "number" &&
        typeof object.key === "number" &&
        typeof object.hue === "number" &&
        typeof object.saturation === "number" &&
        typeof object.lightness === "number" &&
        typeof object.l === "number" &&
        typeof object.a === "number" &&
        typeof object.b === "number" &&
        typeof object.x === "number" &&
        typeof object.y === "number" &&
        typeof object.z === "number";
}
