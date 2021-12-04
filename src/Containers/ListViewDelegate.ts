import {ListView} from "./ListView";
import {View} from "../View/View";
import {ListItem} from "./ListItem";


export interface ListViewDelegate {
    listViewNumberOfSections?(listView: ListView): number;
    listViewIDForItem?(listView: ListView, section_index: number, item_index: number): string;
    listViewAlphabetSectionForObjectAtIndex?(listView: ListView, index: number): string;
    listViewNumberOfItemsForSection?(listView: ListView, section_index: number): number;
    listViewObjectForItemIndex?(listView: ListView, section_index: number, item_index: number): any;
    listViewIsObjectSelected?(listView: ListView, section_index: number, item_index: number): boolean;

    listViewSizeForAddOption?(listView: ListView): number[];
    listViewCellForAddOption?(listView: ListView, cell: View): void;
    listViewSizeForMoreOption?(listView: ListView): number[];
    listViewCellForMoreOption?(listView: ListView, cell: View): void;

    listViewCellWasAttached?(listView: ListView, cell: View, section_index: number, item_index: number): void;

    listViewRowMargin?(listView:ListView, section_index: number,item_index: number): number;
    listViewRowMarginCustomizeCell?(listView: ListView, rowMarginCell: View, section_index: number, item_index: number): void;
    listViewBackgroundColor?(listView: ListView): string;
    listViewTitleForSection?(listView: ListView, section_index: number): string;

    listViewItemForIndex?(listView: ListView, section_index: number, item_index: number): View;
    listViewPaddingForSection?(listView: ListView, section_index: number): number;
    listViewSizeForItemIndex?(listView: ListView, section_index: number, item_index: number): number[];
    listViewOnDoubleClick?(listView: ListView): void;

    listViewSizeForSectionHeader?(listView: ListView, section_index: number): number[];
    listViewCustomSectionHeader?(listView: ListView, attachToCell: View, section_index: number): void;


    listViewHeightForRow?(listView: ListView, section: number, index: number): number;
    listViewDataIsLoading?(listView: ListView, cell: View): void;
    listViewNoDataToDisplay?(listView: ListView, cell: View): void;
    listViewRowCellReady?(listView: ListView, cell: View, section_index: number, item_index: number): void;

    listViewSelectionChangedForRow?(listView: ListView, path: any, selected: boolean): void;
    listViewSelectionHasChanged?(listView: ListView): void;
    listViewWasRefreshed?(listView: ListView): void;


    listViewCellCameIntoViewport?(listView: ListView, item: ListItem):void;
    listViewCellLeftViewport?(listView: ListView, item: ListItem): void;

}
