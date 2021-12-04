import {ILocalizedString} from "./ILocalizedString";
import {LocalizedStringData} from "./LocalizedStringData";
import {safeCopy} from "../Utils/safeCopy";


export class LocalizedString implements ILocalizedString{
    readonly kind: string = 'LocalizedString';
    id: string = "";
    languages: {
        [key: string]: LocalizedStringData
    } = { };

    constructor(id: string) {
        this.id = id;
    }
    static fromStruct(struct: ILocalizedString): LocalizedString {
        let ls = new LocalizedString(struct.id);
        ls.languages = safeCopy(struct.languages);
        return ls;
    }

    add(language: string, value: LocalizedStringData): LocalizedString {
        this.languages[language] = value;
        return this;
    }
    addString(language: string, value: string): LocalizedString {
        this.languages[language] = {content: value} as LocalizedStringData;
        return this;
    }

    toJSON(): ILocalizedString {
        return {
            kind: "ILocalizedString",
            id: this.id,
            languages: safeCopy(this.languages)
        } as ILocalizedString;
    }
}
