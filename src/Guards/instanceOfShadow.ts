
import {Shadow} from "../View/Shadow";
import {isDefined} from "../Utils/isDefined";

export function instanceOfShadow(object: any): object is Shadow {
    return isDefined(object) && isDefined(object.active) &&
        isDefined(object.offsetX);
}