
import {ViewDriver} from "../View/ViewDriver";
import {isDefined} from "../Utils/isDefined";


export function instanceOfViewDriver(object: any): object is ViewDriver {
    return isDefined(object) &&
        typeof object.id === "string" &&
        typeof object.draggable === "string";
}