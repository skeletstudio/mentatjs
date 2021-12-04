import {ILocalizedString} from "../LocalizedString/ILocalizedString";


export function instanceOfILocalizedString(object: any): object is ILocalizedString {
    return object.kind === "ILocalizedString";
}