import {fillParentBounds, View} from "../View/View";
import {TableViewDelegate} from "./TableViewDelegate";
import {DataSource} from "../Datasource/DataSource";
import {SelectionMode} from "./SelectionMode";
import {Color} from "../Color/Color";
import {CheckBox} from "../Components/CheckBox";
import {TableViewColumn} from "./TableViewColumn";
import {Fill} from "../View/Fill";
import {Border} from "../View/Border";
import {setProps} from "../baseClass";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {isDefined} from "../Utils/isDefined";
import {Label} from "../Components/Label";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {NUConvertToPixel, px} from "../NumberWithUnit/NumberWithUnit";
import {Logging} from "../Utils/logging";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {Size} from "../NumberWithUnit/Size";
import {BorderSide} from "../View/BorderSide";
import {Btn} from "../Components/Btn";


export class TableView extends View implements TableViewDelegate {

    readonly className: string = "MentatJS.TableView";

    delegate?: TableViewDelegate;
    viewHeaderContainer: View;
    viewHeader: View;

    viewContentContainer: View;
    viewContent: View;


    leftViewHeaderContainer: View;
    leftViewHeader: View;
    leftViewContentContainer: View;
    leftViewContent: View;

    autoGrow: boolean = false;

    dataSource?: DataSource;

    showHeader: boolean = true;

    allowReorder: boolean = false;
    rowMargin: number = 0;
    separateRows: boolean = true;
    addRowLabel: string = "";
    showSelectionCheckbox: boolean = false;
    selectionMode: SelectionMode = SelectionMode.singleSelection;
    allowNoSelection: boolean = true;
    selectedRows: any[];
    protected cells: {row: number, col: number; view: View}[] = [];

    selectedRowColor: Color = new Color('color', 'rgba(24, 144, 255, 1.0)');

    protected selectionCheckboxes: CheckBox[];
    jsonColumns: TableViewColumn[];


    viewWillBeDeattached() {
        super.viewWillBeDeattached();
        this.viewContent?.detachAllChildren();
        this.viewContent?.detachItSelf();
        this.viewHeader?.detachItSelf();
        this.viewContentContainer?.detachItSelf();
        this.viewHeaderContainer?.detachItSelf();
        
    }

    constructor() {
        super();
        this.viewHeaderContainer = new View();
        this.viewHeader = new View();
        this.viewContentContainer = new View();
        this.viewContent = new View();
        this.leftViewHeaderContainer = new View();
        this.leftViewHeader = new View();
        this.leftViewContentContainer = new View();
        this.leftViewContent = new View();
        this.jsonColumns = [{ "id":"COL1", "title": "Column 1", "defaultCell":"MentatJS.Label", "width":-1, "properties": []}];
        this.selectedRows = [];

        this.styles = [
            {
                kind: "ViewStyle",
                fills: []
            },
            {
                kind: "ViewStyle",
                id: "header",
                fills: [new Fill(true, "color", "normal", "rgb(250, 250, 250)")],
                borders: [new Border(true, 1, "solid", "rgb(232, 232, 232)", BorderSide.bottom)],

            },
            {
                kind: "ViewStyle",
                id: "column",
                fills: [],
                borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.right)]
            },
            {
                kind: "ViewStyle",
                id: "column.label",
                textStyle: setProps(new PropertyTextStyle(), {

                } as PropertyTextStyle)
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isEven", op: "equals", value: false}],
                fills: [new Fill(true, "color", "normal", "rgb(82,81,83)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isEven", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgb(88,87,88)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "view.hovered", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 0.1)")]
            },
            {
                kind: "ViewStyle",
                id: "row",
                cond: [{property: "cell.isSelected", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 1)")]
            },

        ]


    }


    getCellForPath(row: number, col: number): View {
        for (let i = 0; i < this.cells.length; i += 1) {
            if (this.cells[i].row === row && this.cells[i].col === col) {
                return this.cells[i].view;
            }
        }
        return undefined;
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);
        //if (this.showHeader === false) {
        this.viewHeaderContainer.setVisible(this.showHeader);
        this.reloadData();
    }



    bindDataSource(ds: DataSource) {
        this.dataSource = ds;
        if (isDefined(ds)) {
            ds.bindViews.push(this);
        }
    }

    setDelegate(_delegate: any) {
        this.delegate = _delegate;
    }

    tableViewHeightForHeader(tableView: TableView): number {
        return 20;
    }
    //tableViewCustomCellForHeader(tableView: TableView, columnIndex: number): View {
    //    return new View();
    //}
    tableViewNumberOfColumns(tableView: TableView): number {
        if (isDefined(this.jsonColumns)) {
            if (tableView.showSelectionCheckbox) {
                return this.jsonColumns.length + 1;
            }
            return this.jsonColumns.length;
        }
        if (tableView.showSelectionCheckbox) {
            return 2;
        }
        return 1;
    }

    tableViewWidthForColumn(tableView: TableView,index: number): number {
        if (index === 0 && tableView.showSelectionCheckbox) {
            return 30;
        }
        if (isDefined(this.jsonColumns)) {
            let idx = index;
            if (tableView.showSelectionCheckbox) {
                idx = idx - 1;
            }
            if (idx < this.jsonColumns.length) {
                let col = this.jsonColumns[idx];
                if (isDefined(col)) {
                    if (isDefined(col.width)) {
                        if (col.width === -1) {
                            // calculate the space
                            let spaceUsed = 0;
                            let flexCols = 0;
                            for (let i = 0; i < this.jsonColumns.length; i += 1) {
                                let c = this.jsonColumns[i];
                                if (isDefined(c)) {
                                    if (isDefined(c.width)) {
                                        if (c.width === -1) {
                                            flexCols += 1;
                                        } else {
                                            spaceUsed += parseInt(c.width.toString());
                                        }
                                    }
                                }
                            }
                            if (flexCols === 0) {
                                return 100;
                            }
                            let bounds = this.getBounds("");
                            let totalSpace = bounds.width.amount;
                            if (totalSpace - spaceUsed <= 0) {
                                return 100;
                            }
                            return ((totalSpace - spaceUsed) / flexCols) - 10;
                        } else {
                            return col.width;
                        }
                    }
                }

            }
        }
        return 100;
    }

    tableViewTitleForColumn(tableView: TableView,index: number): string {
        if (index === 0 && this.showSelectionCheckbox) {
            return "";
        }
        if (isDefined(this.jsonColumns)) {
            let idx = index;
            if (this.showSelectionCheckbox) {
                idx = idx - 1;
            }
            if (idx < this.jsonColumns.length) {
                if (isDefined(this.jsonColumns[idx])) {
                    return this.jsonColumns[idx].title;
                }
            }
        }
        return "COLUMN";
    }

    tableViewNumberOfRows(tableView: TableView): number {
        if (this.dataSource) {
            return this.dataSource.numberOfItems();
        }

        return 0;
    }
    tableViewHeightForRow(tableView: TableView, index: number): number {
        return 30;
    }

    tableViewTableBreakCell(tableView: TableView, cell: View, path: {row: number}) {
        let item = tableView.dataSource!.objectForSortedIndex(path.row);
        let label = new Label();
        label.boundsForView = function (parentBounds: Bounds): Bounds {
            return boundsWithPixels({
                x: 5,
                y: 0,
                width: NUConvertToPixel(parentBounds.width).amount - 10,
                height: NUConvertToPixel(parentBounds.height).amount,
                unit: 'px',
                position: 'absolute'
            });
        };
        label.text = item.title;
        label.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        label.fontSize = 12;
        label.fontWeight = '300';
        label.fillLineHeight = true;
        label.initView(cell.id + ".label");
        cell.attach(label);
    }

    protected _onCheckboxSelection(sender) {
        let check = sender as CheckBox;
        let row = check.keyValues["row"];
        if (isDefined(this.delegate.tableViewCheckBoxSelectionClicked)) {
            this.delegate.tableViewCheckBoxSelectionClicked(this, check, row);
        } else {
            if (isDefined(this.tableViewCheckBoxSelectionClicked)) {
                this.tableViewCheckBoxSelectionClicked(this, check, row);
            }
        }
    }

    tableViewCheckBoxSelectionClicked(tableView: TableView, checkBox: CheckBox, row: number): void {

    }

    setCheckBoxSelected(row: number, status: boolean) {
        if (row < 0) return;
        let numberOfRows = 0;
        if (isDefined(this.delegate.tableViewNumberOfRows)) {
            numberOfRows = this.delegate.tableViewNumberOfRows(this);
        } else {
            numberOfRows = this.tableViewNumberOfRows(this);
        }
        if (row >= numberOfRows) return;

        let checkBox = this.selectionCheckboxes[row];
        checkBox.checked = status;
        checkBox.render();
    }
    getCheckBoxSelected(row: number) {
        if (row < 0) return false;
        let numberOfRows = 0;
        if (isDefined(this.delegate.tableViewNumberOfRows)) {
            numberOfRows = this.delegate.tableViewNumberOfRows(this);
        } else {
            numberOfRows = this.tableViewNumberOfRows(this);
        }
        if (row >= numberOfRows) return false;

        let checkBox = this.selectionCheckboxes[row];
        return checkBox.checked;
    }

    tableViewCellForPath(tableView: TableView, cell: View, path: {row: number, col: number}) {
        "use strict";
        let item = undefined;
        if (isDefined(tableView.dataSource)) {
            item = tableView.dataSource!.objectForSortedIndex(path.row);
        }

        if (path.col === 0 && this.showSelectionCheckbox) {
            let chk = new CheckBox();
            chk.boundsForView = function (parentBounds: Bounds): Bounds {
                return boundsWithPixels({
                    x: NUConvertToPixel(parentBounds.width).amount / 2 - 20 / 2,
                    y: NUConvertToPixel(parentBounds.height).amount / 2 - 20 / 2,
                    width: 20,
                    height: 20,
                    unit: 'px',
                    position: 'absolute'
                });
            };
            chk.keyValues["row"] = path.row;
            chk.checked = false;
            chk.initView(cell.id + ".chk");
            cell.attach(chk);
            chk.setActionDelegate(this, "_onCheckboxSelection");
            this.selectionCheckboxes.push(chk);
            return;
        }

        if (isDefined(this.jsonColumns)) {
            let idx = path.col;
            if (this.showSelectionCheckbox) {
                idx = idx - 1;
            }
            if (idx < this.jsonColumns.length) {
                if (isDefined(this.jsonColumns[idx])) {
                    let col = this.jsonColumns[idx];
                    if (Logging.enableLogging) {
                        Logging.log("JSONCOLUMN: ", col);
                    }
                    if (isDefined(col.defaultCell)) {

                        //try {
                        let v : View;
                        if (col.defaultCell === "View" || col.defaultCell === "MentatJS.View") {
                            v = new View();
                        } else if (col.defaultCell === "Label" || col.defaultCell === "MentatJS.Label") {
                            v = new Label();
                        } else if (col.defaultCell === "Checkbox" || col.defaultCell === "MentatJS.Checkbox") {
                            v = new CheckBox();
                        } else if (col.defaultCell === "Button" || col.defaultCell === "MentatJS.Button") {
                            v = new Btn();
                        } else {
                            // let win = (window as any);
                            //v = new win[col.defaultCell]();
                            if (this.delegate && this.delegate.tableViewControlCellForPath) {
                                v = this.delegate.tableViewControlCellForPath(this, col, idx);


                            } else {

                                eval("v = new " + col.defaultCell + "();");
                            }
                        }
                        if (Logging.enableLogging) {
                            console.log("instantiating " + col.defaultCell + " for column " + col.id);
                        }
                        //if (this.isLayoutEditor === true) {
                        //    console.warn("tableView overrided function not loaded in layoutEditor mode")

                        //} else {

                        v.id = generateV4UUID();
                        //}
                        v.keyValues["column_id"] = col.id;

                        v.boundsForView = function (parentBounds: Bounds): Bounds {
                            if (isDefined(this.keyValues["defaultSize"])) {
                                return boundsWithPixels({
                                    x: NUConvertToPixel(parentBounds.width).amount / 2 - this.keyValues["defaultSize"][0] / 2,
                                    y: NUConvertToPixel(parentBounds.height).amount / 2 - this.keyValues["defaultSize"][1] / 2,
                                    width: this.keyValues["defaultSize"][0],
                                    height: this.keyValues["defaultSize"][1],
                                    unit: 'px',
                                    position: 'absolute'
                                });
                            }
                            return boundsWithPixels({
                                x: 5,
                                y: 0,
                                width: NUConvertToPixel(parentBounds.width).amount - 10,
                                height: NUConvertToPixel(parentBounds.height).amount,
                                unit: 'px',
                                position: "absolute"
                            });
                        };
                        if (col.defaultCell === "View" || col.defaultCell === "MentatJS.View") {
                            if (isDefined(col.functions)) {
                                for (let fi = 0; fi < col.functions.length; fi += 1) {
                                    let fn = "function (view, dataSourceItem) { " + col.functions[fi] + " }";
                                    try {
                                        let myFunc: any = undefined;
                                        eval("myFunc = " + fn);
                                        if (myFunc !== undefined) {
                                            myFunc(v, item);
                                        }

                                    } catch (e) {
                                        console.warn(e.message);
                                    }
                                }
                            }
                        }
                        if (col.defaultCell === 'Checkbox' || col.defaultCell === "MentatJS.Checkbox") {
                            if (col.field !== undefined) {
                                if (isDefined(item)) {
                                    (v as CheckBox).checked = item[col.field] === true;
                                    v.setActionDelegate({
                                        item: item,
                                        field: col.field,
                                        onClick: function (sender: CheckBox) {
                                            this.item[this.field] = !this.item[this.field];
                                        }
                                    }, "onClick");
                                }
                            }
                        }
                        if (col.defaultCell === "Button" || col.defaultCell === "MentatJS.Button") {
                            if (col.field !== undefined && col.field !== "") {
                                if (isDefined(item)) {
                                    (v as Btn).text = item[col.field];
                                }
                            }
                        }
                        if (col.defaultCell === "Label" || col.defaultCell === "MentatJS.Label") {
                            (v as Label).text = "Label";
                            (v as Label).fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                            (v as Label).fontSize = 12;
                            (v as Label).fontWeight = '300';
                            v.extracss = "overflow: hidden;text-overflow: ellipsis;pointer-events:none;";
                            if (col.field !== undefined && col.field !== "") {
                                if (isDefined(item)) {
                                    (v as Label).text = item[col.field];
                                }
                            }
                            if (isDefined(col.functions)) {
                                for (let fi = 0; fi < col.functions.length; fi += 1) {
                                    let fn = "function (labelView, dataSourceItem) { " + col.functions[fi] + " }";
                                    try {
                                        let myFunc: any = undefined;
                                        eval("myFunc = " + fn);
                                        if (myFunc !== undefined) {
                                            myFunc(v, item);
                                        }

                                    } catch (e) {
                                        console.warn(e.message);
                                    }
                                }
                            }
                            (v as Label).fillLineHeight = true;
                        }

                        if (isDefined(this.delegate) && isDefined(this.delegate!.tableViewControlCellWillInit)) {
                            this.delegate!.tableViewControlCellWillInit!(this, cell, v, item, col, path);
                        }

                        v.initView(cell.id + ".v");
                        cell.attach(v);


                        if (isDefined(this.delegate) && isDefined(this.delegate!.tableViewControlCellWasAttached)) {
                            this.delegate!.tableViewControlCellWasAttached!(this, cell, v, item, col, path);
                        }

                        return;
                        //} catch (exception) {
                        //    console.warn(exception.message);
                        //}
                    }
                }
            }
            return;
        }
        let label = new Label();
        label.boundsForView = function (parentBounds: Bounds): Bounds {
            return boundsWithPixels({
                x: 5,
                y: 0,
                width: NUConvertToPixel(parentBounds.width).amount - 10,
                height: NUConvertToPixel(parentBounds.height).amount,
                unit: 'px',
                position: "absolute"
            });
        };
        label.fillLineHeight = true;
        label.text = "Label";
        label.initView(cell.id + ".label");
        cell.attach(label);


    }



    tableViewFirstColumnIsAlwaysVisible(tableView: TableView): boolean {
        return false;
    }




    viewWillLoad() {

        if (this.delegate === undefined) {
            this.delegate = this;
        }
    }

    reloadData() {
        this.reload();
    }

    reload() {
        this.renderUI();
    }



    setEnabled(e: boolean): void {
        this.isEnabled = e;
        for (let i = 0; i < this.selectionCheckboxes.length; i += 1) {
            this.selectionCheckboxes[i].setEnabled(e);
        }
    }

    renderUI() {
        "use strict";
        this.detachAllChildren();
        this.selectionCheckboxes = [];



        const aRenderUI = performance.now();


        this.leftViewHeaderContainer = new View();

        this.leftViewHeaderContainer.keyValues["tableRef"] = this;

        this.leftViewHeaderContainer.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["cachedBounds"] === undefined) {

                let headerHeight = 0;
                if (this.keyValues["tableRef"].showHeader === true) {
                    headerHeight = ((this.parentView! as TableView).delegate!.tableViewHeightForHeader === undefined) ? (this.parentView! as TableView).tableViewHeightForHeader(this.keyValues["tableRef"]) : (this.parentView! as TableView).delegate!.tableViewHeightForHeader!(this.keyValues["tableRef"]);
                }
                const isFirstColumnFixed = ((this.parentView! as TableView).delegate!.tableViewFirstColumnIsAlwaysVisible === undefined) ? (this.parentView! as TableView).tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]) : (this.parentView! as TableView).delegate!.tableViewFirstColumnIsAlwaysVisible!(this.keyValues["tableRef"]);
                const col0Width = ((this.parentView! as TableView).delegate!.tableViewWidthForColumn === undefined) ? (this.parentView! as TableView).tableViewWidthForColumn(this.keyValues["tableRef"], 0) : (this.parentView! as TableView).delegate!.tableViewWidthForColumn!(this.keyValues["tableRef"], 0);
                let w = 0;
                if (isFirstColumnFixed === true) {
                    w = col0Width;
                }

                this.keyValues["cachedBounds"] = {
                    x: 0,
                    y: 0,
                    width: w,
                    height: headerHeight,
                    unit: "px",
                    position: "absolute"
                }

            }

            return boundsWithPixels(this.keyValues["cachedBounds"]);



        };
        this.leftViewHeaderContainer.viewWasAttached = function () {
            this.getDiv().style.overflowX = 'hidden';

        };
        this.leftViewHeaderContainer.initView(this.id + ".leftViewHeaderContainer");
        this.attach(this.leftViewHeaderContainer);

        this.leftViewHeader = new View();
        this.leftViewHeader.keyValues["tableRef"] = this;
        this.leftViewHeader.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["cachedBounds"] === undefined) {
                let size = 0;
                for (let i = 0; i < 1; i++) {
                    size += (this.keyValues["tableRef"].delegate.tableViewWidthForColumn === undefined) ? this.keyValues["tableRef"].tableViewWidthForColumn(this.keyValues["tableRef"], i) : this.keyValues["tableRef"].delegate.tableViewWidthForColumn(this.keyValues["tableRef"], i);
                }
                this.keyValues["cachedBounds"] =  {
                    x: 0,
                    y: 0,
                    width: size,
                    height: parentBounds.height.amount!,
                    unit: "px",
                    position: "absolute"
                };
            }

            return boundsWithPixels(this.keyValues["cachedBounds"]);

        };
        this.leftViewHeader.viewWasAttached =  function () {
            //this.getDiv().style.backgroundColor = "blue";


            let size = 0;
            for (let i = 0; i < 1; i++) {
                const colSize = (this.keyValues["tableRef"].delegate.tableViewWidthForColumn === undefined) ? this.keyValues["tableRef"].tableViewWidthForColumn(this.keyValues["tableRef"], i) : this.keyValues["tableRef"].delegate.tableViewWidthForColumn(this.keyValues["tableRef"], i);
                const cell = new View();
                cell.keyValues["columnStart"] = size;
                cell.keyValues["columnIndex"] = i;
                cell.keyValues["columnWidth"] = colSize;
                cell.keyValues["tableRef"] = this.keyValues["tableRef"];
                cell.boundsForView = function (parentBounds: Bounds): Bounds {
                    return boundsWithPixels({
                        x: this.keyValues["columnStart"],
                        y: 0,
                        width: this.keyValues["columnWidth"],
                        height: parentBounds.height.amount,
                        unit: "px",
                        position: "absolute"
                    });
                };
                cell.viewWasAttached = function () {

                    // do we have a custom cell ?
                    let cell: View | undefined = undefined;
                    if (this.keyValues["tableRef"].delegate && this.keyValues["tableRef"].delegate.tableViewCustomCellForHeader !== undefined) {
                        cell = this.keyValues["tableRef"].delegate.tableViewCustomCellForHeader(this.keyValues["tableRef"], this.keyValues["columnIndex"]);
                    } else if (this.keyValues["tableRef"].tableViewCustomCellForHeader !== undefined) {
                        cell = this.keyValues["tableRef"].tableViewCustomCellForHeader(this.keyValues["tableRef"], this.keyValues["columnIndex"]);
                    }
                    if (cell !== undefined) {
                        cell.boundsForView = function (parentBounds: Bounds): Bounds {
                            return fillParentBounds(parentBounds);
                        };
                        cell.initView(this.id + ".customCell");
                        this.attach(cell);

                    } else {
                        //this.getDiv().style.color = "white";
                        //this.getDiv().style.borderRight = "1px solid #afafaf";
                        this.keyValues["label"] = new Label();
                        this.keyValues["label"].boundsForView = function (parentBounds: Bounds): Bounds {
                            return boundsWithPixels({
                                x: 5,
                                y: 0,
                                width: parentBounds.width.amount - 10,
                                height: parentBounds.height.amount,
                                unit: "px",
                                position: "absolute"
                            });
                        };


                        let styles = (this.keyValues["tableRef"] as View).getStylesForTargetId('column.label', true);
                        if (!isDefined(styles)) {
                            styles = [setProps(new ViewStyle(), {
                                textStyle: new PropertyTextStyle()
                            } as ViewStyle)]
                        }
                        this.keyValues["label"].styles = styles;
                        this.keyValues["label"].text = (!this.keyValues["tableRef"].delegate || this.keyValues["tableRef"].delegate.tableViewTitleForColumn === undefined) ? this.keyValues["tableRef"].tableViewTitleForColumn(this.keyValues["tableRef"], i) : this.keyValues["tableRef"].delegate.tableViewTitleForColumn(this.keyValues["tableRef"], i);
                        //this.keyValues["label"].fillLineHeight = true;
                        //this.keyValues["label"].textAlignment = 'left';
                        //this.keyValues["label"].fontColor = "white";
                        this.keyValues["label"].initView(this.id + ".label");
                        this.attach(this.keyValues["label"]);

                    }
                };
                // get header style
                let headerStyles =(this as View).getStylesForTargetId('column', true);
                if (!isDefined(headerStyles)) {
                    headerStyles = [new ViewStyle()];
                }
                cell.styles = headerStyles;


                cell.initView(this.id + ".cell" + i);
                this.attach(cell);
                size += colSize;
            }
        };

        this.leftViewHeader.initView(this.id + ".leftViewHeader");
        this.leftViewHeaderContainer.attach(this.leftViewHeader);


        this.viewHeaderContainer = new View();
        if (this.delegate.tableViewHeaderContainerWillBeAttached) {
            this.delegate.tableViewHeaderContainerWillBeAttached(this, this.viewHeaderContainer);
        } //else {
       //     this.viewHeaderContainer.fills = [{
       //         active: true,
        //        type: 'color',
        //        blendMode: 'normal',
        //        value: "rgb(250, 250, 250)"
        //    }];
         //   this.viewHeaderContainer.extracss = "border-bottom: 1px solid rgb(232, 232, 232);";
        //}
        let viewHeaderStyles =(this as View).getStylesForTargetId('header', true);
        if (!isDefined(viewHeaderStyles)) {
            viewHeaderStyles = [new ViewStyle()];
        }
        this.viewHeaderContainer.styles = viewHeaderStyles;
        this.viewHeaderContainer.overflow = 'hidden';
        this.viewHeaderContainer.keyValues["tableRef"] = this;
        this.viewHeaderContainer.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["cachedBounds"] === undefined) {

                let headerHeight = 0;
                if (this.keyValues["tableRef"].showHeader === true) {
                    headerHeight = ((this.parentView! as TableView).delegate!.tableViewHeightForHeader === undefined) ? (this.parentView! as TableView).tableViewHeightForHeader(this.keyValues["tableRef"]) : (this.parentView! as TableView).delegate!.tableViewHeightForHeader!(this.keyValues["tableRef"]);
                }
                const isFirstColumnFixed = ((this.parentView! as TableView).delegate!.tableViewFirstColumnIsAlwaysVisible === undefined) ? (this.parentView! as TableView).tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]) : (this.parentView! as TableView).delegate!.tableViewFirstColumnIsAlwaysVisible!(this.keyValues["tableRef"]);
                const col0Width = ((this.parentView! as TableView).delegate!.tableViewWidthForColumn === undefined) ? (this.parentView! as TableView).tableViewWidthForColumn(this.keyValues["tableRef"], 0) : (this.parentView! as TableView).delegate!.tableViewWidthForColumn!(this.keyValues["tableRef"], 0);
                let x = 0;
                let w = parentBounds.width.amount;
                if (isFirstColumnFixed) {
                    x = col0Width;
                    w = parentBounds.width.amount - col0Width;
                }
                this.keyValues["cachedBounds"] = {
                    x: x,
                    y: 0,
                    width: w,
                    height: headerHeight,
                    unit: "px",
                    position: "absolute"
                };
            }
            return boundsWithPixels(this.keyValues["cachedBounds"]);
        };
        this.viewHeaderContainer.viewWasAttached = function () {
            this.getDiv().style.overflowX = 'hidden';

        };
        this.viewHeaderContainer.initView(this.id + ".headerContainer");
        this.attach(this.viewHeaderContainer);

        this.viewHeader = new View();
        this.viewHeader.keyValues["tableRef"] = this;
        this.viewHeader.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["cachedBounds"] === undefined) {
                const nbCols = (this.keyValues["tableRef"].delegate.tableViewNumberOfColumns === undefined) ? this.keyValues["tableRef"].tableViewNumberOfColumns(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewNumberOfColumns(this.keyValues["tableRef"]);
                const isFirstColumnFixed = (this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible === undefined) ? this.keyValues["tableRef"].tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]);
                let iStart = 0;
                if (isFirstColumnFixed) {
                    iStart = 1;
                }
                let size = 0;
                for (let i = iStart; i < nbCols; i++) {
                    size += (this.keyValues["tableRef"].delegate.tableViewWidthForColumn === undefined) ? this.keyValues["tableRef"].tableViewWidthForColumn(this.keyValues["tableRef"], i) : this.keyValues["tableRef"].delegate.tableViewWidthForColumn(this.keyValues["tableRef"], i);
                }
                this.keyValues["cachedBounds"] = {
                    x: 0,
                    y: 0,
                    width: size,
                    height: NUConvertToPixel(parentBounds.height).amount,
                    unit: "px",
                    position: "absolute"
                };
            }
            return boundsWithPixels(this.keyValues["cachedBounds"]);
        };
        this.viewHeader.viewWasAttached =  function () {
            //this.getDiv().style.backgroundColor = "blue";

            const nbCols = (this.keyValues["tableRef"].delegate.tableViewNumberOfColumns === undefined) ? this.keyValues["tableRef"].tableViewNumberOfColumns(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewNumberOfColumns(this.keyValues["tableRef"]);
            const isFirstColumnFixed = (this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible === undefined) ? this.keyValues["tableRef"].tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]);
            let iStart = 0;
            if (isFirstColumnFixed) {
                iStart = 1;
            }
            let size = 0;
            for (let i = iStart; i < nbCols; i++) {
                const colSize = (this.keyValues["tableRef"].delegate.tableViewWidthForColumn === undefined) ? this.keyValues["tableRef"].tableViewWidthForColumn(this.keyValues["tableRef"], i) : this.keyValues["tableRef"].delegate.tableViewWidthForColumn(this.keyValues["tableRef"], i);
                const cell = new View();
                cell.keyValues["columnStart"] = size;
                cell.keyValues["columnIndex"] = i;
                cell.keyValues["columnWidth"] = colSize;
                cell.keyValues["tableRef"] = this.keyValues["tableRef"];
                cell.boundsForView = function (parentBounds: Bounds): Bounds {
                    return boundsWithPixels({
                        x: this.keyValues["columnStart"],
                        y: 0,
                        width: this.keyValues["columnWidth"],
                        height: NUConvertToPixel(parentBounds.height).amount,
                        unit: "px",
                        position: "absolute"
                    });
                };
                cell.viewWasAttached = function () {

                    // do we have a custom cell ?
                    let cell: View | undefined = undefined;
                    if (this.keyValues["tableRef"].delegate && this.keyValues["tableRef"].delegate.tableViewCustomCellForHeader !== undefined) {
                        cell = this.keyValues["tableRef"].delegate.tableViewCustomCellForHeader(this.keyValues["tableRef"], this.keyValues["columnIndex"]);
                    } else if (this.keyValues["tableRef"].tableViewCustomCellForHeader !== undefined) {
                        cell = this.keyValues["tableRef"].tableViewCustomCellForHeader(this.keyValues["tableRef"], this.keyValues["columnIndex"]);
                    }
                    if (cell !== undefined) {
                        //cell.boundsForView = function (parentBounds: Bounds): Bounds {
                        //    return fillParentBounds(parentBounds);
                        //};
                        cell.initView(this.id + ".customCell" + this.keyValues["columnIndex"]);
                        this.attach(cell);

                    } else {

                        //this.getDiv().style.color = "black";

                        //this.getDiv().style.borderRight = "1px solid #afafaf";
                        this.keyValues["label"] = new Label();
                        this.keyValues["label"].boundsForView = function (parentBounds: Bounds): Bounds {
                            return boundsWithPixels({
                                x: 5,
                                y: 0,
                                width: NUConvertToPixel(parentBounds.width).amount - 10,
                                height: NUConvertToPixel(parentBounds.height).amount,
                                unit: "px",
                                position: "absolute"
                            });
                        };
                        let styles = (this.keyValues["tableRef"] as View).getStylesForTargetId('column.label', true);
                        if (!isDefined(styles)) {
                            styles = [setProps(new ViewStyle(), {
                                textStyle: new PropertyTextStyle()
                            } as ViewStyle)]
                        }
                        this.keyValues["label"].styles = styles;
                        this.keyValues["label"].text = (this.keyValues["tableRef"].delegate.tableViewTitleForColumn === undefined) ? this.keyValues["tableRef"].tableViewTitleForColumn(this.keyValues["tableRef"], i) : this.keyValues["tableRef"].delegate.tableViewTitleForColumn(this.keyValues["tableRef"], i);
                        this.keyValues["label"].fillLineHeight = true;
                        this.keyValues["label"].initView(this.id + ".label");
                        this.attach(this.keyValues["label"]);

                    }
                };

                let columnStyles =(this as View).getStylesForTargetId('column', true);
                if (!isDefined(columnStyles)) {
                    columnStyles = [new ViewStyle()];
                }
                cell.styles = columnStyles;

                if (this.keyValues["tableRef"].delegate.tableViewHeaderCellWillBeAttached) {
                    this.keyValues["tableRef"].delegate.tableViewHeaderCellWillBeAttached(this.keyValues["tableRef"], cell, i);
                }

                cell.initView(this.id + ".cell" + i);
                this.attach(cell);
                size += colSize;
            }
        };
        //this.viewHeader.dragScroll = true;
        this.viewHeader.scrollCallback = function (event) {
            this.getDiv().style.top = "0px";
            let x = (this.parentView! as TableView).viewContent.getDiv().style.offsetLeft;
            this.keyValues["tableRef"].viewHeaderContainer.getDiv().scrollLeft = x

            //this.tableRef.viewContent.getDiv().style.left = x + "px";
        };
        this.viewHeader.initView(this.id + ".header");
        this.viewHeaderContainer.attach(this.viewHeader);

        this.viewContentContainer = new View();
        this.viewContentContainer.keyValues["tableRef"] = this;
        this.viewContentContainer.overflow = 'scroll';
        this.viewContentContainer.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["cachedBounds"] === undefined) {

                let headerHeight = 0;
                if (this.keyValues["tableRef"].showHeader === true) {
                    headerHeight = ((this.parentView! as TableView).delegate!.tableViewHeightForHeader === undefined) ? (this.parentView! as TableView).tableViewHeightForHeader(this.keyValues["tableRef"]) : (this.parentView! as TableView).delegate!.tableViewHeightForHeader!(this.keyValues["tableRef"]);
                }
                const isFirstColumnFixed = (this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible === undefined) ? this.keyValues["tableRef"].tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]);
                let x = 0;
                let w = NUConvertToPixel(parentBounds.width).amount;
                if (isFirstColumnFixed) {
                    const col0Width = (this.keyValues["tableRef"].delegate.tableViewWidthForColumn === undefined) ? this.keyValues["tableRef"].tableViewWidthForColumn(this.keyValues["tableRef"], 0) : this.keyValues["tableRef"].delegate.tableViewWidthForColumn(this.keyValues["tableRef"], 0);
                    x = col0Width;
                    w = NUConvertToPixel(parentBounds.width).amount - x;
                }

                this.keyValues["cachedBounds"] =  {
                    x: x,
                    y: headerHeight,
                    width: w,
                    height: NUConvertToPixel(parentBounds.height).amount - headerHeight,
                    unit: "px",
                    position: "absolute"
                };
            }
            return boundsWithPixels(this.keyValues["cachedBounds"]);
        };
        this.viewContentContainer.overflow = 'hidden';
        this.viewContentContainer.extracss = "overflow-x: scroll; overflow-y: scroll;";
        // max-width
        const nbCols = (this.delegate!.tableViewNumberOfColumns === undefined) ? this.tableViewNumberOfColumns(this) : this.delegate!.tableViewNumberOfColumns(this);
        let size = 0;

        for (let i = 0; i < nbCols; i++) {
            size += (this.delegate!.tableViewWidthForColumn === undefined) ? this.tableViewWidthForColumn(this, i) : this.delegate!.tableViewWidthForColumn(this, i);
        }


        /*
        this.viewContentContainer.viewWasAttached = function () {
            //this.getDiv().style.overflowX = 'auto';
            //this.getDiv().style.overflowY = 'auto';
            if (this.tableRef.autoGrow === false) {
                this.getDiv().style.overflowX = 'scroll';
                this.getDiv().style.overflowY = "scroll";

                this.getDiv().style.webkitOverflowScrolling = "touch";
            }


        };
    */
        this.viewContentContainer.initView(this.id + ".viewContentContainer");
        this.attach(this.viewContentContainer);

        this.viewContent = new View();
        this.viewContent.keyValues["tableRef"] = this;
        this.viewContent.overflow = 'hidden';
        this.viewContent.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["cachedBounds"] === undefined) {
                const nbCols = (this.keyValues["tableRef"].delegate.tableViewNumberOfColumns === undefined) ? this.keyValues["tableRef"].tableViewNumberOfColumns(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewNumberOfColumns(this.keyValues["tableRef"]);
                let size = 0;
                const isFirstColumnFixed = (this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible === undefined) ? this.keyValues["tableRef"].tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]);
                let iStart = 0;
                if (isFirstColumnFixed) {
                    iStart = 1;
                }
                for (let i = iStart; i < nbCols; i++) {
                    size += (this.keyValues["tableRef"].delegate.tableViewWidthForColumn === undefined) ? this.keyValues["tableRef"].tableViewWidthForColumn(this.keyValues["tableRef"], i) : this.keyValues["tableRef"].delegate.tableViewWidthForColumn(this.keyValues["tableRef"], i);
                }
                const nbRows = (this.keyValues["tableRef"].delegate.tableViewNumberOfRows === undefined) ? this.keyValues["tableRef"].tableViewNumberOfRows(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewNumberOfRows(this.keyValues["tableRef"]);
                let height = 5;
                for (let j = 0; j < nbRows; j++) {
                    height += (this.keyValues["tableRef"].delegate.tableViewHeightForRow === undefined) ? this.keyValues["tableRef"].tableViewHeightForRow(this.keyValues["tableRef"], j) : this.keyValues["tableRef"].delegate.tableViewHeightForRow(this.keyValues["tableRef"], j);
                    if (this.keyValues["tableRef"].rowMargin > 0) {
                        height += parseInt(this.keyValues["tableRef"].rowMargin);
                    }
                }
                if (this.keyValues["tableRef"].addRowLabel !== "") {
                    height += 35;
                }

                this.keyValues["cachedBounds"] = {
                    x: 0,
                    y: 0,
                    width: size,
                    height: height,
                    unit: "px",
                    position: "absolute"
                };
            }
            return boundsWithPixels(this.keyValues["cachedBounds"]);
        };
        this.viewContent.extracss = "max-width: " + size + "px;";
        this.viewContent.initView(this.id + ".viewContent");
        this.viewContentContainer.attach(this.viewContent);

        this.viewContentContainer.getDiv().tableRef = this;
        this.viewContentContainer.getDiv().onscroll = function () {
            this.tableRef.scrollEventOwner = "viewContentContainer";
            if (Logging.enableLogging) {
                console.log('content scroll ' + this.scrollLeft);
            }
            this.tableRef.viewHeaderContainer.getDiv().scrollLeft = this.scrollLeft;
            this.tableRef.leftViewContentContainer.getDiv().scrollTop = this.scrollTop;
            let scrollData = {
                tableRef: this.tableRef
            };
            if (isDefined(this.tableRef.keyValues["_tableViewScrollTimeout"])) {
                clearTimeout(this.tableRef.keyValues["_tableViewScrollTimeout"]);
            }
            this.tableRef.keyValues["_tableViewScrollTimeout"] = setTimeout(function () {
                scrollData.tableRef.viewHeaderContainer.getDiv().scrollLeft = scrollData.tableRef.viewContentContainer.getDiv().scrollLeft;
            }, 100);
        };
        this.viewContentContainer.getDiv().ontouchend = function () {
            this.tableRef.scrollEventOwner = "viewContentContainer";
            this.tableRef.viewHeaderContainer.getDiv().scrollLeft = this.scrollLeft;
            this.tableRef.leftViewContentContainer.getDiv().scrollTop = this.scrollTop;
        };


        this.leftViewContentContainer = new View();
        this.leftViewContentContainer.keyValues["tableRef"] = this;
        this.leftViewContentContainer.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["cachedBounds"] === undefined) {
                const headerHeight = (this.keyValues["tableRef"].delegate.tableViewHeightForHeader === undefined) ? this.keyValues["tableRef"].tableViewHeightForHeader(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewHeightForHeader(this.keyValues["tableRef"]);
                const isFirstColumnFixed = (this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible === undefined) ? this.keyValues["tableRef"].tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]);
                let x = 0;
                let w = 0;
                if (isFirstColumnFixed) {
                    const col0Width = (this.keyValues["tableRef"].delegate.tableViewWidthForColumn === undefined) ? this.keyValues["tableRef"].tableViewWidthForColumn(this.keyValues["tableRef"], 0) : this.keyValues["tableRef"].delegate.tableViewWidthForColumn(this.keyValues["tableRef"], 0);
                    x = 0;
                    w = col0Width;
                }

                this.keyValues["cachedBounds"] = {
                    x: x,
                    y: headerHeight + 1,
                    width: w,
                    height: NUConvertToPixel(parentBounds.height).amount - headerHeight - 1,
                    unit: "px",
                    position: "absolute"
                };
            }
            return boundsWithPixels(this.keyValues["cachedBounds"]);
        };
        this.leftViewContentContainer.overflow = 'hidden';
        this.leftViewContentContainer.initView(this.id + ".leftViewContentContainer");
        this.attach(this.leftViewContentContainer);


        this.leftViewContent = new View();
        this.leftViewContent.keyValues["tableRef"] = this;

        this.leftViewContent.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["cachedBounds"] === undefined) {
                //const nbCols = (this.keyValues["tableRef"].delegate.tableViewNumberOfColumns === undefined) ? this.keyValues["tableRef"].tableViewNumberOfColumns(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewNumberOfColumns(this.keyValues["tableRef"]);
                const isFirstColumnFixed = (this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible === undefined) ? this.keyValues["tableRef"].tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewFirstColumnIsAlwaysVisible(this.keyValues["tableRef"]);
                let width = (this.keyValues["tableRef"].delegate.tableViewWidthForColumn === undefined) ? this.keyValues["tableRef"].tableViewWidthForColumn(this.keyValues["tableRef"], 0) : this.keyValues["tableRef"].delegate.tableViewWidthForColumn(this.keyValues["tableRef"], 0);
                if (!isFirstColumnFixed) {
                    width = 0;
                }
                const nbRows = (this.keyValues["tableRef"].delegate.tableViewNumberOfRows === undefined) ? this.keyValues["tableRef"].tableViewNumberOfRows(this.keyValues["tableRef"]) : this.keyValues["tableRef"].delegate.tableViewNumberOfRows(this.keyValues["tableRef"]);
                let height = 5;
                for (let j = 0; j < nbRows; j++) {
                    height += (this.keyValues["tableRef"].delegate.tableViewHeightForRow === undefined) ? this.keyValues["tableRef"].tableViewHeightForRow(this.keyValues["tableRef"], j) : this.keyValues["tableRef"].delegate.tableViewHeightForRow(this.keyValues["tableRef"], j);
                    if (this.keyValues["tableRef"].rowMargin > 0) {
                        height += parseInt(this.keyValues["tableRef"].rowMargin);
                    }
                }
                if (this.keyValues["tableRef"].addRowLabel !== "") {
                    height += 35;
                }

                this.keyValues["cachedBounds"] = {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                    unit: "px",
                    position: "absolute"
                };
            }
            return boundsWithPixels(this.keyValues["cachedBounds"]);
        };
        this.leftViewContent.initView(this.id + ".leftViewContent");
        this.leftViewContentContainer.attach(this.leftViewContent);


        const bRenderUI = performance.now();

        if (Logging.enableLogging) {
            console.log("TableView.renderUI exec " + (bRenderUI - aRenderUI) + " ms");
        }

        this.drawCells();

    }


    scrollToTop() {
        this.viewContentContainer.scrollToTop();
    }
    scrollToBottom() {
        this.viewContentContainer.scrollToBottom();
    }

    prepareDrawCells () {

        this.viewContentContainer.growths = [];
        this.growths = [];

    }

    drawCells() {
        "use strict";
        let x = 0,
            y = 0,
            cellStartX = 0,
            cellStartY = 0;
        const nbCols = (this.delegate!.tableViewNumberOfColumns === undefined) ? this.tableViewNumberOfColumns(this) : this.delegate!.tableViewNumberOfColumns(this),
            nbRows = (this.delegate!.tableViewNumberOfRows === undefined) ? this.tableViewNumberOfRows(this) : this.delegate!.tableViewNumberOfRows(this);

        this.prepareDrawCells();

        this.cells = [];


        let autoGrowTotal = 0;

        const aDrawCells = performance.now();


        let rowWidth = 0;
        for (x = 0; x < nbCols; x += 1) {
            const isFirstColumnFixed = (this.delegate!.tableViewFirstColumnIsAlwaysVisible === undefined) ? this.tableViewFirstColumnIsAlwaysVisible(this) : this.delegate!.tableViewFirstColumnIsAlwaysVisible(this);

            const cellWidth = (this.delegate!.tableViewWidthForColumn === undefined) ? this.tableViewWidthForColumn(this, x) : this.delegate!.tableViewWidthForColumn(this, x);
            if (isFirstColumnFixed === false || x > 0) {
                rowWidth += cellWidth;
            }
        }


        for ( y = 0; y < nbRows; y++ ) {
            const rowHeight = (this.delegate!.tableViewHeightForRow === undefined) ? this.tableViewHeightForRow(this, y) : this.delegate!.tableViewHeightForRow(this, y);

            cellStartX = 0;

            let obj = undefined;
            if (isDefined(this.dataSource)) {
                obj = this.dataSource!.objectForSortedIndex(y);
                if (isDefined(obj)) {
                    if (isDefined(obj.isTableBreak)) {
                        if (obj.isTableBreak === true) {

                            let breakCell = new View();
                            let breakCellWidth = 0;
                            for ( x = 0; x < nbCols; x++) {
                                breakCellWidth += (this.delegate!.tableViewWidthForColumn === undefined) ? this.tableViewWidthForColumn(this, x) : this.delegate!.tableViewWidthForColumn(this, x);
                            }
                            breakCell.keyValues["size"] = [breakCellWidth, rowHeight];
                            breakCell.keyValues["origin"] = [cellStartX, cellStartY];
                            breakCell.keyValues["row"] = y;
                            breakCell.keyValues["col"] = 0;

                            breakCell.boundsForView = function (parentBounds: Bounds): Bounds {
                                return boundsWithPixels({
                                    x: this.keyValues["origin"][0],
                                    y: this.keyValues["origin"][1],
                                    width: this.keyValues["size"][0],
                                    height: this.keyValues["size"][1],
                                    unit: "px",
                                    position: "absolute"
                                });
                            };
                            breakCell.initView(this.id + ".breakLine." + y);
                            this.viewContent.attach(breakCell);

                            if (this.delegate!.tableViewTableBreakCell !== undefined) {
                                this.delegate!.tableViewTableBreakCell(this, breakCell, { row: y });
                            } else {
                                this.tableViewTableBreakCell(this, breakCell, { row: y});
                            }

                            if (this.showSelectionCheckbox) {
                                this.selectionCheckboxes.push(new CheckBox());
                            }

                            cellStartY = cellStartY + rowHeight;

                            if (this.autoGrow === true) {
                                autoGrowTotal += rowHeight;

                                //this.growBy({ width: 0, height: rowHeight});


                            }
                            // go to next row
                            continue;
                        }
                    }
                }
            }


            let rowCell = new View();
            rowCell.keyValues["tableRef"] = this;
            rowCell.keyValues["size"] = [rowWidth, rowHeight];
            rowCell.keyValues["origin"] = [cellStartX, cellStartY];
            rowCell.keyValues["row"] = y;
            rowCell.boundsForView = function (parentBounds: Bounds): Bounds {
                return boundsWithPixels({
                    x: this.keyValues["origin"][0],
                    y: this.keyValues["origin"][1],
                    width: this.keyValues["size"][0],
                    height: this.keyValues["size"][1],
                    unit: 'px',
                    position: "absolute"
                });
            };

            let styles = this.getStylesForTargetId("row", true);
            if (isDefined(styles)) {
                rowCell.styles = styles;
            }
            rowCell.properties.push({
                id: "cell.isEven",
                kind: "LayerProperty",
                group: "property",
                title: "isEven",
                property_id: "cell.isEven",
                type: "boolean",
                value: (y % 2 === 0)
            });

            let isSelected = false;

            if (isDefined(this.selectedRows.find( (row) => { return row.rowIndex === y;}))) {
                isSelected = true;
            }
            rowCell.properties.push({
                id: "cell.isSelected",
                kind: "LayerProperty",
                group: "property",
                title: "IsSelected",
                property_id: "cell.isSelected",
                type: "boolean",
                value: isSelected
            })


            // console.log(`(tableView) row ${y}`, rowCell.styles, rowCell.properties);

            if (this.separateRows) {
                // rowCell.extracss = "border-bottom: 1px solid rgb(232, 232, 232);";
            }



            rowCell.initView(this.id + ".row[" + y + "]");
            this.viewContent.attach(rowCell);





            for ( x = 0; x < nbCols; x++) {

                const isFirstColumnFixed = (this.delegate!.tableViewFirstColumnIsAlwaysVisible === undefined) ? this.tableViewFirstColumnIsAlwaysVisible(this) : this.delegate!.tableViewFirstColumnIsAlwaysVisible(this);

                const cellWidth = (this.delegate!.tableViewWidthForColumn === undefined) ? this.tableViewWidthForColumn(this, x) : this.delegate!.tableViewWidthForColumn(this, x);
                const cell = new View();
                cell.keyValues["tableRef"] = this;
                cell.keyValues["size"] = [cellWidth, rowHeight];
                cell.keyValues["origin"] = [cellStartX, cellStartY];
                cell.keyValues["row"] = y;
                cell.keyValues["col"] = x;
                cell.keyValues["rowCell"] = rowCell;


                cell.boundsForView = function (parentBounds: Bounds): Bounds {
                    return boundsWithPixels({
                        x: this.keyValues["origin"][0],
                        y: this.keyValues["origin"][1],
                        width: this.keyValues["size"][0],
                        height: this.keyValues["size"][1],
                        unit: "px",
                        position: "absolute"
                    });
                };
                cell.viewWasAttached = function () {
                    if (this.keyValues["tableRef"] !== undefined) {
                        if (!isDefined(this.keyValues["tableRef"].delegate["tableViewCellForPath"])) {
                            this.keyValues["tableRef"]["tableViewCellForPath"](this.keyValues["tableRef"], this, {row: this.keyValues["row"], col: this.keyValues["col"]});
                        } else {
                            this.keyValues["tableRef"].delegate["tableViewCellForPath"](this.keyValues["tableRef"], this, {row: this.keyValues["row"], col: this.keyValues["col"]});
                        }
                    }
                };



                cell.initView(this.id + ".cell[" + y + "][" + x + "]");

                if ((isFirstColumnFixed) && (x === 0)) {
                    this.leftViewContent.attach(cell);

                } else {
                    this.viewContent.attach(cell);
                    cellStartX = cellStartX + cellWidth;
                }

                this.cells.push( { row: y, col: x, view: cell});

                if (this.selectionMode === SelectionMode.singleSelection || this.selectionMode === SelectionMode.multipleSelection) {
                    if (Logging.enableLogging) {
                        console.log("setting click delegate for row " + y);
                    }
                    cell.setClickDelegate(this, "internalRowClicked");
                }


            }
            cellStartY = cellStartY + rowHeight;
            if (this.rowMargin > 0) {
                cellStartY = cellStartY + this.rowMargin;
            }

            if (this.autoGrow) {
                autoGrowTotal += rowHeight;

                //this.growBy({ width: 0, height: rowHeight});


            }

        }

        // add row ?
        if (this.addRowLabel !== "") {

            let addRowCell = new View();
            addRowCell.keyValues["tableRef"] = this;
            //if (this.isLayoutEditor === true) {
            //    addRowCell.isLayoutEditor = true;
            //}
            addRowCell.keyValues["size"] = [rowWidth, 35];
            addRowCell.keyValues["origin"] = [0, cellStartY];
            addRowCell.boundsForView = function (parentBounds: Bounds): Bounds {
                return boundsWithPixels({
                    x: this.keyValues["origin"][0],
                    y: this.keyValues["origin"][1],
                    width: this.keyValues["size"][0],
                    height: this.keyValues["size"][1],
                    unit: 'px',
                    position: "absolute"
                });
            };
            addRowCell.viewWasAttached = function () {
                let btn = new Btn();
                btn.boundsForView = function (parentBounds) {
                    return boundsWithPixels({
                        x: 5,
                        y: 0,
                        width: 100,
                        height: 30,
                        unit: 'px',
                        position: "absolute"
                    });
                };
                btn.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                btn.fontSize = 14;
                btn.fontWeight = '400';
                btn.isFullyRound = true;
                btn.text = this.keyValues["tableRef"].addRowLabel;
                btn.initView(this.keyValues["tableRef"].id + ".addRowBtn");
                this.attach(btn);
                this.keyValues["btn"] = btn;
            };
            addRowCell.initView(this.id + ".row[" + y + "]");
            this.viewContent.attach(addRowCell);

            addRowCell.keyValues["btn"].setActionDelegate({
                tableViewRef: this,
                onAddRow: function (sender: Btn) {
                    if (isDefined(this.tableViewRef) && isDefined(this.tableViewRef.delegate) && isDefined(this.tableViewRef.delegate.tableViewUserAddedRow)) {
                        this.tableViewRef.delegate.tableViewUserAddedRow(this.tableViewRef);
                    }
                }
            }, "onAddRow")
            this.keyValues["addRowCell"] = addRowCell;

            if (this.showSelectionCheckbox) {
                this.selectionCheckboxes.push(new CheckBox());
            }

        }


        const bDrawCells = performance.now();
        if (Logging.enableLogging) {
            console.log("TableView.DrawCells exec " + (bDrawCells - aDrawCells) + " ms");
        }

        const aAutoGrow = performance.now();

        if (autoGrowTotal > 0) {
            this.viewContentContainer.growBy(new Size(px(0), px(autoGrowTotal)));
        }

        const bAutoGrow = performance.now();
        if (Logging.enableLogging) {
            console.log("TableView.DrawCells(AutoGrow) exec " + (bAutoGrow - aAutoGrow) + " ms");
        }



    }

    childIsGrowing(childNode: View, growSize: Size, initiator: any) {
        "use strict";
        this.growBy(growSize);

        this.doResizeFrameOnly();

    }

    getSelectionInfo(): {rowIndex: number; rowCell: View; dataSourceItem: any}[] {
        let ret = [];
        for (let i = 0; i < this.selectedRows.length; i += 1) {
            let item = undefined;
            if (isDefined(this.dataSource)) {
                try {
                    item = this.dataSource!.objectForSortedIndex(this.selectedRows[i].row);
                } catch (ee) {console.warn("selected row outside of datasource bounds")};
            }
            ret.push({
                rowIndex: this.selectedRows[i].row,
                rowCell: this.selectedRows[i].view,
                dataSourceItem: item
            })
        }
        return ret;
    }


    internalRowClicked(sender: View, event: any) {
        if (Logging.enableLogging) {
            console.log("internalRowClicked", sender.keyValues["row"]);
        }
        let row = sender.keyValues["row"];

        /*
        let ctrl: boolean = false;
        let shift: boolean = false;
        if (event.ctrlKey === true) {
            ctrl = true;
        }
        if (event.shiftKey === true) {
            shift = true;
        }
        */
        let status: 'toggle' | 'select' | 'unselect' = 'toggle';
        if (this.allowNoSelection === false && this.selectionMode === SelectionMode.singleSelection) {
            status = 'select';
        }
        this.selectRow(row, status,false);

        if (isDefined(this.delegate) && isDefined(this.delegate.tableViewSelectionHasChanged)) {
            this.delegate.tableViewSelectionHasChanged(this);
        }

        if (isDefined(this.actionDelegate) && isDefined(this.actionDelegateEventName) && isDefined(this.actionDelegate![this.actionDelegateEventName!])) {
            this.actionDelegate![this.actionDelegateEventName!](this);
        }


    }


    selectRow(row: number, status: 'toggle' | 'select' | 'unselect', additive: boolean) {
        if (!isDefined(this.dataSource)) {
            return false;
        }

        if (row < 0) return false;
        let numberOfRows = 0;
        if (isDefined(this.delegate.tableViewNumberOfRows)) {
            numberOfRows = this.delegate.tableViewNumberOfRows(this);
        } else {
            numberOfRows = this.tableViewNumberOfRows(this);
        }
        if (row >= numberOfRows) return false;

        let firstCell: View = this.getCellForPath(row, 0);

        let rowCell: View = firstCell.keyValues["rowCell"];

        let isSelected = false;
        let rowIdxInArray = -1;
        for (let i = 0; i < this.selectedRows.length; i += 1) {
            if (this.selectedRows[i].row === row) {
                rowIdxInArray = i;
                isSelected = true;
                break;
            }
        }

        if (status === 'toggle') {

            if (!isSelected) {

                if (this.selectionMode === SelectionMode.singleSelection) {
                    for (let i = 0; i < this.selectedRows.length; i += 1) {
                        this.selectedRows[i].view.setPropertyValue("cell.isSelected", false);
                        this.selectedRows[i].view.processStyleAndRender("", []);
                    }
                    this.selectedRows = [];

                    rowCell.setPropertyValue("cell.isSelected", true);
                    rowCell.processStyleAndRender("", []);
                    this.selectedRows.push({row: row, view: rowCell});

                } else {

                }

            } else {
                if (this.selectedRows.length >= 1 && this.allowNoSelection === true) {
                    rowCell.setPropertyValue("cell.isSelected", false);
                    rowCell.processStyleAndRender("", []);
                    this.selectedRows.splice(rowIdxInArray, 1);
                    if (this.selectionMode === SelectionMode.singleSelection) {
                        this.selectedRows = [];
                    }
                } else if (this.selectedRows.length === 1 && this.allowNoSelection === false) {
                    // do nothing
                }
            }
        }
        if (status === 'select') {
            if (this.selectionMode === SelectionMode.singleSelection) {
                for (let i = 0; i < this.selectedRows.length; i += 1) {
                    this.selectedRows[i].view.fills = [];
                    this.selectedRows[i].view.render();
                }
                this.selectedRows = [];
            }
            rowCell.setPropertyValue("cell.isSelected", true);
            rowCell.processStyleAndRender("", []);
            //if (!isSelected) {
                this.selectedRows.push({row: row, view: rowCell});
            //}
        }

        if (status === 'unselect') {
            rowCell.setPropertyValue("cell.isSelected", false);
            rowCell.processStyleAndRender("", []);
            if (isSelected) {
                this.selectedRows.splice(rowIdxInArray, 1);
                if (this.selectionMode === SelectionMode.singleSelection) {
                    this.selectedRows = [];
                }
            }
        }

        return true;

    }



}