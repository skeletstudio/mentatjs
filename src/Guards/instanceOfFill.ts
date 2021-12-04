import {Fill} from "../View/Fill";
import {isDefined} from "../Utils/isDefined";
import {instanceOfColor} from "./instanceOfColor";

export function instanceOfFill(object: any): object is Fill {
    return isDefined(object) &&
        typeof object.active === "boolean" &&
        typeof object.type === "string" &&
        ["color", "gradient", "cssText"].includes(object.type) &&
        typeof object.blendMode === "string" &&
        (typeof object.value === "string" || instanceOfColor(object.value));
}