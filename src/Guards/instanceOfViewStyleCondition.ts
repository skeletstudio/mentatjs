import {ViewStyleCondition} from "../View/ViewStyleCondition";
import {isDefined} from "../Utils/isDefined";


export function instanceOfViewStyleCondition(object: any): object is ViewStyleCondition {
    return isDefined(object) &&
        typeof object.property === "string" &&
        isDefined(object.op) && isDefined(object.value);
}