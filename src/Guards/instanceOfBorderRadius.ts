import {BorderRadius} from "../View/BorderRadius";
import {isDefined} from "../Utils/isDefined";
import {instanceOfNumberWithUnit} from "../NumberWithUnit/NumberWithUnit";


export function instanceOfBorderRadius(object: any): object is BorderRadius {
    if (!isDefined(object)) {
        return false;
    }
    return instanceOfNumberWithUnit(object.tl)
        && instanceOfNumberWithUnit(object.tr)
        && instanceOfNumberWithUnit(object.bl)
        && instanceOfNumberWithUnit(object.br);
}