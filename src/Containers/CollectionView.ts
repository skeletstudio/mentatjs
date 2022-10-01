
// MentatJS.CollectionView Component
/* usage

let collectionView = new MentatJS.CollectionView();
collectionView.boundsForView = function (parentBounds) { return MentatJS.fillParentBounds(parentBounds); };
collectionView.dataSource = new MentatJS.DataSource();
collectionView.dataSource.initWithData ( {
    rows: [
        { id: "1", text: "Apple", uri: "https://...png" },
        { id: "2", text: "Orange", uri: "https://...png" }
    ]
} );
collectionView.delegate = {
    collectionViewCellSize: function (collectionView, index) {
        return [64, 64];
    },
    collectionViewCellWasAttached: function (collectionView, cell, index) {
        let item = collectionView.dataSource.objectForSortedIndex(index);
        let img = new MentatJS.Image();
        img.boundsForView = function (parentBounds) { return MentatJS.fillParentBounds(parentBounds); };
        img.imageURI = item.uri;
        img.imageWidth = 64;
        img.imageHeight = 64;
        img.initView(cell.id + ".image");
        cell.attach(cell.img);
    }
}
collectionView.initView("collectionView");
this.view.attach(collectionView);

 */




import {View} from "../View/View";
import {DataSource, DataSourceBind} from "../Datasource/DS";
import {CollectionViewDelegate} from "./CollectionViewDelegate";
import {CollectionItem} from "./CollectionItem";
import {Color} from "../Color/Color";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {Bounds} from "../Bounds/Bounds";
import {isDefined} from "../Utils/isDefined";
import {Logging} from "../Utils/logging";
import {Application, SessionEvent} from "../Application/Application";
import {ViewStyle} from "../View/ViewStyle";

export class CollectionView extends View implements DataSourceBind {
    className: String =  "CollectionView";
    dataSource?: DataSource;
    delegate?: CollectionViewDelegate = undefined;
    Items: CollectionItem[] = [];
    singleSelection: boolean = false;
    noSelection: boolean = false;
    direction: string = 'vertical';
    groupBy: boolean = false;
    showMoreOptions: boolean = false;
    addOptionOnTop: boolean = true;
    showAddOption: boolean = false;

    selectedRowColor: Color = new Color('color', "rgba(24, 144, 255, 0.1)");

    itemCellSymbolName: any = undefined;

    constructor() {
        super();
    }

    bindDataSourceUpdated(ds: DataSource) {
        this.reloadData();
    }

    bindDataSource(ds: DataSource) {
        this.dataSource = ds;
    }


    collectionViewCellSize(collectionView: CollectionView, index: number) {
        return [64, 64];
    }
    collectionViewCellWasAttached(collectionView: CollectionView, cell: View, index: number) {
        "use strict";

    }
    collectionViewWasRefreshed(collectionView: CollectionView) {
        "use strict";

    }
    collectionViewSelectionChangedForCellIndex(collectionView: CollectionView, index: number, selected: boolean) {
        "use strict";

    }
    collectionViewSelectionHasChanged(collectionView: CollectionView) {
        "use strict";

    }

    collectionViewAddOptionCellSize(collectionView: CollectionView) {
        "use strict";
        return [64,64];
    }

    collectionViewAddOptionCellAdded(collectionView: CollectionView, cell: View) {
        "use strict";
    }

    collectionViewAddOptionSelected(collectionView: CollectionView) {
        "use strict";

    }


    collectionViewMoreOptionCellSize(collectionView: CollectionView) {
        "use strict";
        return [64,64];
    }

    collectionViewMoreOptionCellAdded(collectionView: CollectionView, cell: View) {
        "use strict";
    }

    collectionViewMoreOptionSelected(collectionView: CollectionView) {
        "use strict";

    }



    cell_default_width(index: number) { return 64; }
    cell_default_height(index: number) { return 64; }

    _onAddOptionCellAdded(cell: View) {
        "use strict";
        if (this.delegate !== undefined) {
            this.delegate.collectionViewAddOptionCellAdded(this, cell);
        } else {
            this.collectionViewAddOptionCellAdded(this, cell);
        }
    }

    _onAddOptionSelected(cell: View) {
        "use strict";
        if (this.delegate !== undefined) {
            if (this.delegate.collectionViewAddOptionSelected !== undefined) {
                this.delegate.collectionViewAddOptionSelected(this);
            }
        } else {
            this.collectionViewAddOptionSelected(this);
        }
    }

    _onMoreOptionCellAdded(cell: View) {
        "use strict";
        if (this.delegate !== undefined) {
            this.delegate.collectionViewMoreOptionCellAdded(this, cell);
        } else {
            this.collectionViewMoreOptionCellAdded(this, cell);
        }
    }

    _onMoreOptionSelected(cell: View) {
        "use strict";
        if (this.delegate !== undefined) {
            if (this.delegate.collectionViewMoreOptionSelected !== undefined) {
                this.delegate.collectionViewMoreOptionSelected(this);
            }
        } else {
            this.collectionViewMoreOptionSelected(this);
        }
    }



    reloadData() {
        this.subViews = [];
        this.Items = [];
        while (this.getDiv().hasChildNodes()) {
            this.getDiv().removeChild(this.getDiv().firstChild);
        }

        if (!this.dataSource) {
            return;
        }


        //let currentRow = 0;
        //let currentCol = 0;
        let currentGroup = "";
        let startX = 0;
        let startY = 0;

        let width = 0, height = 0;

        if (this.showAddOption) {
            if (this.addOptionOnTop) {

                if (this.groupBy) {

                    currentGroup = "ADD";

                    let cellNewGroup = new View();
                    if (this.direction === "horizontal") {
                        cellNewGroup.keyValues["startX"] = startX + width;
                        cellNewGroup.keyValues["startY"] = 0;
                        cellNewGroup.keyValues["cell_width"] = 20;
                        cellNewGroup.keyValues["cell_height"] = this.bounds.height.amount;
                    } else {
                        cellNewGroup.keyValues["startX"] = 0;
                        cellNewGroup.keyValues["startY"] = startY + height;
                        cellNewGroup.keyValues["cell_width"] = this.bounds.width.amount;
                        cellNewGroup.keyValues["cell_height"] = 20;
                    }


                    cellNewGroup.boundsForView = function (parentBounds) {
                        const x = this.keyValues["startX"]; //this.currentCol*this.cell_width;
                        const y = this.keyValues["startY"]; //this.currentRow*this.cell_height;
                        const width = this.keyValues["cell_width"];
                        const height = this.keyValues["cell_height"];
                        return {
                            kind: "Bounds",
                            x: x,
                            y: y,
                            width: width,
                            height: height,
                            unit: 'px',
                            position: 'absolute'
                        };
                    };
                    cellNewGroup.initView(this.id + ".group." + currentGroup);
                    this.attach(cellNewGroup);

                    if (this.direction === "vertical") {
                        //currentRow += 1;
                        //currentCol = 1;

                        startY += height + 20;
                        startX = 0;

                    } else if (this.direction === 'horizontal') {
                        //currentCol = 1;
                        //currentRow += 1;
                        startX += width + 20;
                        startY = 0;

                    }
                }

                const opObj = { isAddOption: true, isMoreOption: false, index: -1, selected: false};

                const addOptionCell = new View();
                let addOptionSize: number[] = [this.getBounds("").width.amount, 30];
                if (this.delegate !== undefined) {
                    addOptionSize = this.delegate.collectionViewAddOptionCellSize (this);
                } else {
                    addOptionSize = this.collectionViewAddOptionCellSize(this);
                }
                addOptionCell.keyValues["size"] = addOptionSize;
                addOptionCell.keyValues["startX"] = startX;
                addOptionCell.keyValues["startY"] = startY;

                /*
                cell.currentRow = currentRow;
                cell.currentCol = currentCol;
                */
                addOptionCell.keyValues["cell_width"] = addOptionSize[0];
                addOptionCell.keyValues["cell_height"] = addOptionSize[1];
                addOptionCell.keyValues["itemObj"] = opObj;
                addOptionCell.boundsForView = function (parentBounds) {
                    const x = this.keyValues["startX"]; //this.currentCol*this.cell_width;
                    const y = this.keyValues["startY"]; //this.currentRow*this.cell_height;
                    const width = this.keyValues["cell_width"];
                    const height = this.keyValues["cell_height"];
                    return boundsWithPixels({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        unit: 'px',
                        position: 'absolute'
                    });
                };

                addOptionCell.initView(this.id + ".addOption");
                this.attach(addOptionCell);
                addOptionCell.getDiv().collectionPtr = this;
                addOptionCell.getDiv().item_index = -1;
                addOptionCell.getDiv().cell = addOptionCell;
                addOptionCell.getDiv().addEventListener('click',function (e: MouseEvent) {
                    // @ts-ignore
                    this.collectionPtr._onAddOptionSelected(this.cell);
                });
                this._onAddOptionCellAdded(addOptionCell);

                if (this.direction === "vertical") {
                    startY += addOptionSize[1];
                    startX = 0;

                } else if (this.direction === 'horizontal') {
                    startX += addOptionSize[0];
                    startY = 0;

                }


            }
        }




        let idx = -1;
        this.dataSource.scanStart();
        while (this.dataSource.eof() === false) {
            idx++;
            // default width of cell
            let newGroup = false;

            if (this.groupBy) {
                if (currentGroup === "") {
                    currentGroup = this.dataSource.valueForGroupBy();
                    newGroup = true;
                }
                else {
                    let snewGroup = this.dataSource.valueForGroupBy();
                    if (currentGroup !== snewGroup) {
                        currentGroup = snewGroup;
                        newGroup = true;
                    }
                }

                if (newGroup) {
                    let cellNewGroup = new View();
                    if (this.direction === "horizontal") {
                        cellNewGroup.keyValues["startX"] = startX + width;
                        cellNewGroup.keyValues["startY"] = 0;
                        cellNewGroup.keyValues["cell_width"] = 20;
                        cellNewGroup.keyValues["cell_height"] = this.bounds.height.amount;
                    } else {
                        cellNewGroup.keyValues["startX"] = 0;
                        cellNewGroup.keyValues["startY"] = startY + height;
                        cellNewGroup.keyValues["cell_width"] = this.bounds.width.amount;
                        cellNewGroup.keyValues["cell_height"] = 20;
                    }


                    cellNewGroup.boundsForView = function (parentBounds: Bounds): Bounds {
                        const x = this.keyValues["startX"]; //this.currentCol*this.cell_width;
                        const y = this.keyValues["startY"]; //this.currentRow*this.cell_height;
                        const width = this.keyValues["cell_width"];
                        const height = this.keyValues["cell_height"];
                        return {
                            kind: "Bounds",
                            x: x,
                            y: y,
                            width: width,
                            height: height,
                            unit: 'px',
                            position: 'absolute'
                        };
                    };
                    cellNewGroup.initView(this.id + ".group." + currentGroup);
                    this.attach(cellNewGroup);

                    if (this.delegate !== undefined) {
                        if (this.delegate["collectionViewCellForGroupAdded"] !== undefined) {
                            this.delegate["collectionViewCellForGroupAdded"](this, cellNewGroup, currentGroup);
                        }
                    }


                    if (this.direction === "vertical") {
                        //currentRow += 1;
                        //currentCol = 1;

                        startY += height + 20;
                        startX = 0;

                    } else if (this.direction === 'horizontal') {
                        //currentCol = 1;
                        //currentRow += 1;
                        startX += width + 20;
                        startY = 0;

                    }

                }

            }


            let size = [this.cell_default_width(idx), this.cell_default_height(idx)];
            if (this.delegate !== undefined) {
                if (this.delegate["collectionViewCellSize"] !== undefined) {
                    size = this.delegate["collectionViewCellSize"](this,idx);
                }
            }

            width = size[0];
            height = size[1];



            const cell = new View();


            let itemObj: CollectionItem = {
                obj: this.dataSource.getRow(),
                cell: cell,
                upperPosition: startY,
                bottomPosition: startY + height,
                inViewport: false,
                isAddOption: false,
                isMoreOption: false,
                index: idx,
                selected: false
            };
            this.Items.push(itemObj);

            cell.keyValues["idx"] = idx;

            cell.keyValues["startX"] = startX;
            cell.keyValues["startY"] = startY;

            cell.keyValues["cell_width"] = width;
            cell.keyValues["cell_height"] = height;
            cell.keyValues["itemObj"] = itemObj;
            cell.boundsForView = function (parentBounds: Bounds): Bounds {
                const x = this.keyValues["startX"]; //this.currentCol*this.cell_width;
                const y = this.keyValues["startY"]; //this.currentRow*this.cell_height;
                const width = this.keyValues["cell_width"];
                const height = this.keyValues["cell_height"];
                return boundsWithPixels({
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    unit: 'px',
                    position: 'absolute'
                });
            };

            cell.initView(this.id + ".cell" + idx);
            this.attach(cell);
            cell.getDiv().collectionPtr = this;
            cell.getDiv().item_index = idx;
            cell.getDiv().addEventListener('click',function (e: MouseEvent) {
                e.preventDefault();
                e.stopPropagation();
                // @ts-ignore
                this.collectionPtr.onItemClick(e.ctrlKey, e.shiftKey, this.id, this.item_index);
            });
            this.cellWasAdded(cell,cell.keyValues["idx"],cell.keyValues["itemObj"]);

            if (this.delegate !== undefined) {
                if (this.delegate["collectionViewCellWasAttached"] !== undefined) {
                    this.delegate["collectionViewCellWasAttached"](this, cell, idx);
                }
            }


            if (this.direction === 'vertical') {
                //currentCol += 1;
                startX += width;

                if (startX + width >= this.bounds.width.amount) {
                    //currentRow++;
                    startX = 0;
                    startY += height;
                    //currentCol = 0;
                }
            } else if (this.direction === 'horizontal') {
                //currentRow+= 1;
                startY += height;
                if (startY+height >= this.bounds.height.amount) {
                    //currentCol++;
                    startX += width;
                    startY = 0;
                    //currentRow = 0;
                }
            }
            this.dataSource.scanNext();
        }


        if (this.showMoreOptions) {

            if (this.groupBy) {

                currentGroup = "ADD";

                let cellNewGroup = new View();
                if (this.direction === "horizontal") {
                    cellNewGroup.keyValues["startX"] = startX + width;
                    cellNewGroup.keyValues["startY"] = 0;
                    cellNewGroup.keyValues["cell_width"] = 20;
                    cellNewGroup.keyValues["cell_height"] = this.bounds.height.amount;
                } else {
                    cellNewGroup.keyValues["startX"] = 0;
                    cellNewGroup.keyValues["startY"] = startY + height;
                    cellNewGroup.keyValues["cell_width"] = this.bounds.width.amount;
                    cellNewGroup.keyValues["cell_height"] = 20;
                }


                cellNewGroup.boundsForView = function (parentBounds: Bounds): Bounds {
                    const x = this.keyValues["startX"]; //this.currentCol*this.cell_width;
                    const y = this.keyValues["startY"]; //this.currentRow*this.cell_height;
                    const width = this.keyValues["cell_width"];
                    const height = this.keyValues["cell_height"];
                    return boundsWithPixels({
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        unit: 'px',
                        position: 'absolute'
                    });
                };
                cellNewGroup.initView(this.id + ".group." + currentGroup);
                this.attach(cellNewGroup);

                if (this.direction === "vertical") {
                    //currentRow += 1;
                    //currentCol = 1;

                    startY += height + 20;
                    startX = 0;

                } else if (this.direction === 'horizontal') {
                    //currentCol = 1;
                    //currentRow += 1;
                    startX += width + 20;
                    startY = 0;

                }
            }

            const opObj = { isAddOption: false, isMoreOption: true, index: -1, selected: false};

            const moreOptionCell = new View();
            let moreOptionSize: number[] = [this.getBounds("").width.amount, 30];
            if (this.delegate !== undefined) {
                moreOptionSize = this.delegate.collectionViewMoreOptionCellSize (this);
            } else {
                moreOptionSize = this.collectionViewMoreOptionCellSize(this);
            }
            moreOptionCell.keyValues["size"] = moreOptionSize;
            moreOptionCell.keyValues["startX"] = startX;
            moreOptionCell.keyValues["startY"] = startY;

            /*
            cell.currentRow = currentRow;
            cell.currentCol = currentCol;
            */
            moreOptionCell.keyValues["cell_width"] = moreOptionSize[0];
            moreOptionCell.keyValues["cell_height"] = moreOptionSize[1];
            moreOptionCell.keyValues["itemObj"] = opObj;
            moreOptionCell.boundsForView = function (parentBounds: Bounds): Bounds {
                const x = this.keyValues["startX"]; //this.currentCol*this.cell_width;
                const y = this.keyValues["startY"]; //this.currentRow*this.cell_height;
                const width = this.keyValues["cell_width"];
                const height = this.keyValues["cell_height"];
                return boundsWithPixels({
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    unit: 'px',
                    position: 'absolute'
                });
            };

            moreOptionCell.initView(this.id + ".moreOption");
            this.attach(moreOptionCell);
            moreOptionCell.getDiv().collectionPtr = this;
            moreOptionCell.getDiv().item_index = -1;
            moreOptionCell.getDiv().cell = moreOptionCell;
            moreOptionCell.getDiv().addEventListener('click',function (e: MouseEvent) {
                // @ts-ignore
                this.collectionPtr._onMoreOptionSelected(this.cell);
            });
            this._onMoreOptionCellAdded(moreOptionCell);

            if (this.direction === "vertical") {
                startY += moreOptionSize[1];
                startX = 0;

            } else if (this.direction === 'horizontal') {
                startX += moreOptionSize[0];
                startY = 0;

            }



        }


        this.getDiv().onscroll = (e) => {
            let bounds = this.bounds;
            let breakLoop: boolean = false;
            let scrollA = parseInt(this.getDiv().scrollTop);
            let scrollB = scrollA + bounds.width.amount;

            for (let i = 0; i < this.Items.length; i += 1) {
                let item = this.Items[i];
                if ((item.upperPosition > scrollA && item.upperPosition < scrollB) ||
                    (item.bottomPosition > scrollA && item.bottomPosition < scrollB)) {
                    if (item.inViewport === false) { // entered viewport
                        item.inViewport = true;
                        if (isDefined(this.delegate) && isDefined(this.delegate.collectionViewCellCameIntoViewport)) {
                            this.delegate.collectionViewCellCameIntoViewport(this, item);
                        }
                    }
                } else {
                    if (item.inViewport === true) { // left viewport
                        item.inViewport = false;
                        if (isDefined(this.delegate) && isDefined(this.delegate.collectionViewCellLeftViewport)) {
                            this.delegate.collectionViewCellLeftViewport(this, item);
                        }
                    } else {
                        // we can abort
                        breakLoop = true;
                    }
                }
                if (breakLoop === true) {
                    // break;
                }
            }
        };
        this.getDiv().onscroll({});



        if (this.delegate !== undefined) {
            if (this.delegate['collectionViewWasRefreshed'] !== undefined) {
                this.delegate['collectionViewWasRefreshed'](this);
            }
        }



    }


    objectSelectionChanged(index: number,selected: boolean) {
        if (Logging.enableLogging === true) {
            Logging.log('uicollectionview objectSelectionChanged');
        }
    }

    _objectSelectionChanged(index: number, selected: boolean) {
        if (this.delegate !== undefined) {
            if (this.delegate["collectionViewSelectionChangedForCellIndex"] !== undefined) {
                this.delegate["collectionViewSelectionChangedForCellIndex"](this, index, selected);
            }
        }
        this.objectSelectionChanged(index, selected);
    }



    onItemClick(ctrlKey: boolean,shiftKey: boolean,cellID: string, cellIndex: number) {
        let i = 0;
        const event_param = {
            viewController_id: (this.viewController) ? this.viewController.id : "",
            collectionView_id: this.id
        };
        Application.instance.session_event(SessionEvent.kEvent_User,'CollectionView.Click', event_param);

        let color = '';


        if (this.noSelection) return;

        let arr = [];


        for (i = 0; i < this.Items.length; i += 1) {
            if ((this.Items[i].index === cellIndex)) {
                arr = [this.Items[i]];
            }
        }


        let selected = false;

        let ctrl = ctrlKey;
        let shift = shiftKey;

        if (this.singleSelection) {
            ctrl = false;
            shift = false;
        }

        if ((ctrl) && (!shift)) {
            // ADD A ROW TO THE SELECTION
            //color = window.top.$(document.getElementById(rowID)).css("background-color");
            color = document.getElementById(cellID)!.style.backgroundColor!;
            if (color === this.selectedRowColor.value) {
                //window.top.$(document.getElementById(rowID)).css({ "background-color": "transparent" });
                document.getElementById(cellID)!.style.backgroundColor = 'transparent';
                if (arr.length > 0) {
                    arr[0].selected = false;
                    selected = false;
                }
            } else {
                //window.top.$(document.getElementById(rowID)).css({ "background-color": "rgb(173, 216, 230)" });
                document.getElementById(cellID)!.style.backgroundColor = this.selectedRowColor.value;
                if (arr.length > 0) {
                    arr[0].selected = true;
                    selected = true;
                }
            }
            this._objectSelectionChanged(cellIndex, selected);
        }
        else if ((!ctrl) && (!shift)) {
            // REMOVE SELECTION AND SELECT THIS ROW
            for (i = 0; i < this.Items.length; i += 1) {
                if ((this.Items[i].index === cellIndex)) continue;
                //$('#' + this._ID + "_section" + this.Items[i].section + "Cell" + this.Items[i].index).css({ "background-color": "transparent" });
                if (this.Items[i].selected === true) {
                    document.getElementById(this.id + ".cell" + this.Items[i].index)!.style.backgroundColor = 'transparent';
                    this.Items[i].selected = false;
                    this._objectSelectionChanged(this.Items[i].index, this.Items[i].selected);
                }
            }
            //color = window.top.$(document.getElementById(rowID)).css("background-color");
            color = document.getElementById(cellID)!.style.backgroundColor!;

            if (color === this.selectedRowColor.value) {
                //$(document.getElementById(rowID)).css({ "background-color": "transparent" });
                document.getElementById(cellID)!.style.backgroundColor = 'transparent';
                if (arr.length > 0) {
                    arr[0].selected = false;
                    selected = false;
                }
            } else {
                //$(document.getElementById(rowID)).css({ "background-color": "rgb(173, 216, 230)" });
                document.getElementById(cellID)!.style.backgroundColor = this.selectedRowColor.value;

                if (arr.length > 0) {
                    arr[0].selected = true;
                    selected = true;
                }
            }
            this._objectSelectionChanged(cellIndex, selected);

        }
        else if ((!ctrl) && (shift)) {
            // RANGE SELECTION
            let index = -1;
            let reverse = false;
            for (i = 0; i < this.Items.length; i += 1) {
                if (index === -1) {
                    if (this.Items[i].selected === true) {
                        index = i;

                        if (this.Items[i].index > cellIndex) {
                            reverse = true;
                            break;
                        }

                    }
                }
                if ((i >= index) && (index > -1)) {

                    //$('#' + this._ID + "_section" + this.Items[i].section + "Cell" + this.Items[i].index).css({ "background-color": "rgb(173, 216, 230)" });
                    document.getElementById(this.id + ".cell" + this.Items[i].index)!.style.backgroundColor = this.selectedRowColor.value;
                    this.Items[i].selected = true;
                    this._objectSelectionChanged(this.Items[i].index, this.Items[i].selected);

                    if ((this.Items[i].index === cellIndex)) {
                        // remove the ones after
                        index = -2;
                    }
                } else
                if (index === -2) {
                    //$('#' + this._ID + "_section" + this.Items[i].section + "Cell" + this.Items[i].index).css({ "background-color": "transparent" });
                    document.getElementById(this.id + ".cell" + this.Items[i].index)!.style.backgroundColor = 'transparent';
                    this.Items[i].selected = false;
                    this._objectSelectionChanged(this.Items[i].index, this.Items[i].selected);
                }
            }

            if (reverse) {

                for (i = index; i >= 0; i -= 1) {

                    //$('#' + this._ID + "_section" + this.Items[i].section + "Cell" + this.Items[i].index).css({ "background-color": "rgb(173, 216, 230)" });
                    document.getElementById(this.id + ".cell" + this.Items[i].index)!.style.backgroundColor = this.selectedRowColor.value;
                    this.Items[i].selected = true;
                    this._objectSelectionChanged(this.Items[i].index, this.Items[i].selected);

                    if ((this.Items[i].index === cellIndex)) {
                        index = -2;
                    }
                    else if (index === -2) {
                        //$('#' + this._ID + "_section" + this.Items[i].section + "Cell" + this.Items[i].index).css({ "background-color": "transparent" });
                        document.getElementById(this.id + ".cell" + this.Items[i].index)!.style.backgroundColor = 'transparent';
                        this.Items[i].selected = false;
                        this._objectSelectionChanged(this.Items[i].index, this.Items[i].selected);
                    }
                }

            }
        }

        if (this.delegate !== undefined) {
            if (this.delegate["collectionViewSelectionHasChanged"] !== undefined) {
                this.delegate["collectionViewSelectionHasChanged"](this);
            } else {
                this["collectionViewSelectionHasChanged"](this);
            }
        }


        // call the action delegate
        if (this.actionDelegate && this.actionDelegateEventName) {
            this.actionDelegate[this.actionDelegateEventName](this)
        }


    }

    getSelectedCollectionItem(): CollectionItem[] {
        if (!this.dataSource) {
            return [];
        }
        let arr = [];
        let i = 0;
        for ( i = 0 ; i < this.Items.length; i += 1) {
            if (this.Items[i].selected === true) {
                arr.push(this.Items[i]);
            }
        }
        return arr;
    }

    getSelectedObjects(): any[] {
        if (!this.dataSource) {
            return [];
        }
        let arr = [];
        let i = 0;
        for ( i = 0 ; i < this.Items.length; i += 1) {
            if (this.Items[i].selected === true) {
                arr.push(this.Items[i].obj);
            }
        }
        return arr;
    }


    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        if (isDefined(this.getDiv())) {



            if (this.direction === 'horizontal') {
                this.getDiv().style.overflowX = 'scroll';
                this.getDiv().style.overflowY = 'hidden';
            } else {
                this.getDiv().style.overflowX = 'hidden';
                this.getDiv().style.overflowY = 'scroll';
            }


        }


        this.reloadData();
    }


    cellWasAdded(cell: View,index: number,item: any) {

    }

    initView(_id: string) {
        // set the id
        this.id = _id;
        this._div = document.createElement('div');
        this._div.id = _id;
        this.subViews = [];
        if (this.delegate === undefined) {
            this.delegate = this;
        }
        if (this.viewWillLoad !== undefined) {
            this.viewWillLoad();
        }


        if (this.direction === 'horizontal') {
            this.getDiv().style.overflowX = 'scroll';
            this.getDiv().style.overflowY = 'hidden';
        } else {
            this.getDiv().style.overflowX = 'hidden';
            this.getDiv().style.overflowY = 'scroll';
        }

        //this.reloadData();




        if (isDefined(this.viewDidLoad)) {
            this.viewDidLoad();
        }


    }





}