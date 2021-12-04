import {LocalizedString} from "./LocalizedString";
import {LocalizedStringData} from "./LocalizedStringData";
import {instanceOfLocalizedString} from "../Guards/instanceOfLocalizedString";
import {Logging} from "../Utils/logging";
import {isDefined} from "../Utils/isDefined";


export function getLocalizedString(ls: LocalizedString, languages: string[] = undefined): LocalizedStringData {
    if (!instanceOfLocalizedString(ls)) {
        Logging.warn('this is not a localized string: ' + JSON.stringify(ls));
        return ({content: "", textStyles: []} as LocalizedStringData);
    }
    let langArray: string[];
    if (languages !== undefined) {
        langArray = [...languages];
    } else {
        langArray = ['en-US', 'global'];
    }
    if (!langArray.includes('global')) {
        langArray.push('global');
    }
    for (let i = 0; i < langArray.length; i += 1) {
        if (isDefined(ls.languages[langArray[i]])) {
            return ls.languages[langArray[i]];
        }
    }
    let keys = Object.keys(ls.languages);
    if (keys.length === 0) {
        Logging.warn('No localization found for string ' + ls.id);
        return ({content: "", textStyles: []} as LocalizedStringData);
    }
    return ls.languages[keys[0]];

}