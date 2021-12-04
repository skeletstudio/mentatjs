import {TableView} from "./TableView";
import {View} from "../View/View";
import {TableViewColumn} from "./TableViewColumn";
import {CheckBox} from "../Components/CheckBox";


export interface TableViewDelegate {
    tableViewHeightForHeader?(tableView: TableView): number;
    tableViewCustomCellForHeader?(tableView: TableView, columnIndex: number): View;
    tableViewNumberOfColumns?(tableView: TableView): number;
    tableViewWidthForColumn?(tableView: TableView,index: number): number;
    tableViewTitleForColumn?(tableView: TableView,index: number): string;
    tableViewNumberOfRows?(tableView: TableView): number;
    tableViewHeightForRow?(tableView: TableView, index: number): number;
    tableViewTableBreakCell?(tableView: TableView, cell: View, path: {row: number}): void;
    tableViewCellForPath?(tableView: TableView, cell: View, path: {row: number, col: number}): void;
    tableViewFirstColumnIsAlwaysVisible?(tableView: TableView): boolean;

    tableViewControlCellForPath?(tableView: TableView, columnInfo: TableViewColumn, columnIndex: number);
    tableViewControlCellWillInit?(tableView: TableView, cell: View, control: View , item: any, columnInfo: any, path: { row: number, col: number}): void;
    tableViewControlCellWasAttached?(tableView: TableView, cell: View, control: View, item: any, columnInfo: any, path: { row: number, col: number}): void;

    tableViewCheckBoxSelectionClicked?(tableView: TableView, checkBox: CheckBox, row: number): void;
    tableViewSelectionHasChanged?(tableView: TableView): void;

    tableViewUserAddedRow?(tableView: TableView):void;

    tableViewHeaderContainerWillBeAttached?(tableView: TableView, cell: View);
    tableViewHeaderCellWillBeAttached?(tableView: TableView, cell: View, columnIndex: number);
}

