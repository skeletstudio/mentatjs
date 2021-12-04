
import {IDictionaryLocalizedString} from "./IDictionaryLocalizedString";
import {LocalizedString} from "./LocalizedString";


export class DictionaryLocalizedString {
    readonly kind: string = "DictionaryLocalizedString";
    id: string = "";
    entries: LocalizedString[] = [];

    static fromStruct(dict: IDictionaryLocalizedString): DictionaryLocalizedString {
        let ret = new DictionaryLocalizedString(dict.id, []);
        ret.id = dict.id;
        for (let i = 0; i < dict.entries.length; i += 1) {
            let ls = LocalizedString.fromStruct(dict.entries[i]);
            ret.appendArray([ls]);
        }
        return ret;
    }

    constructor(id: string, entries: LocalizedString[]) {
        this.id = id;
        this.entries = entries;
    }

    appendArray(array: LocalizedString[]) {
        for (let i = 0; i < array.length; i += 1) {
            this.entries.push( LocalizedString.fromStruct(array[i].toJSON()));
        }
    }
    appendDict(dict: DictionaryLocalizedString) {
        for (let i = 0; i < dict.entries.length; i += 1) {
            this.entries.push(LocalizedString.fromStruct(dict.entries[i].toJSON()));
        }
    }

    get(id: string): LocalizedString | undefined {
        for (let i = 0; i < this.entries.length; i += 1) {
            if (this.entries[i].id === id) {
                return this.entries[i];
            }
        }
        return undefined;
    }

    toJSON(): IDictionaryLocalizedString {
        let ret: IDictionaryLocalizedString = {
            kind: "IDictionaryLocalizedString",
            id: this.id,
            entries: []
        }
        for (let i = 0; i < this.entries.length; i += 1) {
            ret.entries.push(this.entries[i].toJSON());
        }
        return ret;
    }

}