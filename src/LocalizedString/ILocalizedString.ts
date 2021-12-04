import {LocalizedStringData} from "./LocalizedStringData";


export interface ILocalizedString {
    kind: string;
    id: string;
    languages: {
        [key: string]: LocalizedStringData
    }
    fromDictionary?: string;
}
