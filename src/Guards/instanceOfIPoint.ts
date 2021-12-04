import {IPoint} from "../NumberWithUnit/IPoint";
import {isDefined} from "../Utils/isDefined";
import {instanceOfNumberWithUnit} from "../NumberWithUnit/NumberWithUnit";


export function instanceOfIPoint(object: any): object is IPoint {
    return isDefined(object) && instanceOfNumberWithUnit(object.x) && instanceOfNumberWithUnit(object.y);
}
