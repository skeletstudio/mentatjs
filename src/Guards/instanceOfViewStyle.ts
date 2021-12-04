import {isDefined} from "../Utils/isDefined";
import {ViewStyle} from "../View/ViewStyle";


export function instanceOfViewStyle(object: any): object is ViewStyle {
    return isDefined(object) &&
        object.kind === "ViewStyle";
}