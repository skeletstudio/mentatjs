import {View} from "../View/View";


export class CollectionItem {
    obj?: any = undefined;
    isAddOption: boolean = false;
    isMoreOption: boolean = false;
    index: number = 0;
    selected: boolean = false;
    cell?: View = undefined;
    upperPosition: number = 0;
    bottomPosition: number = 0;
    inViewport: boolean = false;
}
