import {DictionaryLocalizedString} from "./DictionaryLocalizedString";
import {LocalizedString} from "./LocalizedString";


export function localizedStringWithId(id: string, fromDictionary: DictionaryLocalizedString): LocalizedString {
    return fromDictionary.get(id);
}