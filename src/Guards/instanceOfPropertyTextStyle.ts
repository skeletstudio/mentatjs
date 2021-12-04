import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {isDefined} from "../Utils/isDefined";


export function instanceOfPropertyTextStyle(object: any): object is PropertyTextStyle {
    return isDefined(object) &&
        typeof object.typeface === "string";
}