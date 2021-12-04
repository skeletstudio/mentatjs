import {Point} from "../NumberWithUnit/Point";
import {isDefined} from "../Utils/isDefined";
import {instanceOfIPoint} from "./instanceOfIPoint";


export function instanceOfPoint(object:any): object is Point {
    return isDefined(object) &&
        instanceOfIPoint(object.data) &&
        isDefined(object.toJSON);
}

