import {ILocalizedString} from "./ILocalizedString";


export interface IDictionaryLocalizedString {
    kind: "IDictionaryLocalizedString";
    id: string;
    entries: ILocalizedString[];
}