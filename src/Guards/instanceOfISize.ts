import {ISize} from "../NumberWithUnit/ISize";
import {isDefined} from "../Utils/isDefined";
import {instanceOfNumberWithUnit} from "../NumberWithUnit/NumberWithUnit";


export function instanceOfISize(object: any): object is ISize {
    return isDefined(object) &&
        instanceOfNumberWithUnit(object.width) &&
        instanceOfNumberWithUnit(object.height);
}
