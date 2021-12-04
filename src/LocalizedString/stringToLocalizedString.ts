import {LocalizedString} from "./LocalizedString";


export function stringToLocalizedString(id: string, language: string, value: string) {
    let ls: LocalizedString = new LocalizedString(id);
    ls.add(language, {content: value});
    return ls;
}