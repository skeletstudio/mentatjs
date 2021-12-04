import {View} from "../View/View";


export class ListItem {

    obj?: any = undefined;
    section: number = 1;
    index: number = 1;
    selected: boolean = false;
    cell?: View;
    item_id: string = "";
    upperPosition: number = 0;
    bottomPosition: number = 0;
    inViewport: boolean = false;

}
