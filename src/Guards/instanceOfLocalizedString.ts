import {LocalizedString} from "../LocalizedString/LocalizedString";
import {isDefined} from "../Utils/isDefined";


export function instanceOfLocalizedString(object: any): object is LocalizedString {
    return object !== undefined && object.kind === "LocalizedString" && isDefined(object.add);
}


