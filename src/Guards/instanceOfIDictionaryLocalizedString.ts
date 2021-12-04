import {IDictionaryLocalizedString} from "../LocalizedString/IDictionaryLocalizedString";
import {isDefined} from "../Utils/isDefined";


export function instanceOfIDictionaryLocalizedString(object: any): object is IDictionaryLocalizedString {
    return (object.kind === "IDictionaryLocalizedString" && isDefined(object.id) && isDefined(object.entries) && Array.isArray(object.entries));
}