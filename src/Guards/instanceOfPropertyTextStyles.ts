import {PropertyTextStyles} from "../TextStyle/PropertyTextStyles";
import {isDefined} from "../Utils/isDefined";
import {instanceOfPropertyTextStyle} from "./instanceOfPropertyTextStyle";


export function instanceOfPropertyTextStyles(object: any): object is PropertyTextStyles {
    return isDefined(object) &&
        typeof object.start === "number" &&
        typeof object.end === "number" &&
        instanceOfPropertyTextStyle(object.style);
}