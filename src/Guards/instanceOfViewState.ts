import {ViewState} from "../View/ViewState";
import {isDefined} from "../Utils/isDefined";

export function instanceOfViewState(object: any): object is ViewState {
    return isDefined(object) &&
        typeof object.id === "string" &&
        typeof object.type === "string" &&
        typeof object.interaction === "string";
}