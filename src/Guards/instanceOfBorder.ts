import {isDefined} from "../Utils/isDefined";
import {Border} from "../View/Border";
import {instanceOfFill} from "./instanceOfFill";
import {instanceOfColor} from "./instanceOfColor";

export function instanceOfBorder(object: any): object is Border {
    if (!isDefined(object)) {
        return false;
    }
    return (object.active === true || object.active === false)
        && object.thickness >= 0
        && isDefined(object.pattern) && typeof object.pattern === "string"
        && isDefined(object.value) && (typeof object.value === "string" || instanceOfColor(object.value) || instanceOfFill(object.value))
        && isDefined(object.side) && object.side >= 0 && object.side <= 4;
}