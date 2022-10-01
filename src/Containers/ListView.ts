import {View} from "../View/View";
import {ListViewDelegate} from "./ListViewDelegate";
import {ListItem} from "./ListItem";
import {DataSource, DataSourceBind} from "../Datasource/DS";
import {SelectionMode} from "./SelectionMode";
import {Direction} from "./Direction";
import {Color} from "../Color/Color";
import {setProps} from "../baseClass";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {px} from "../NumberWithUnit/NumberWithUnit";
import {Fill} from "../View/Fill";
import {Bounds} from "../Bounds/Bounds";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {Application, SessionEvent} from "../Application/Application";
import {isDefined} from "../Utils/isDefined";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {Label} from "../Components/Label";
import {ViewStyle} from "../View/ViewStyle";
import {DSJSONAdaptor} from "../Datasource/DSJSONAdaptor";


export class ListView  extends View implements ListViewDelegate, DataSourceBind {

    readonly className: string = "ListView";

    items: ListItem[] = [];
    noTabIndex: boolean = false;
    dataSource? : DataSource;
    selectionMode: SelectionMode = SelectionMode.multipleSelection;
    sectionedByLetters : boolean = false;
    direction: Direction = Direction.vertical;

    showMoreOptions: boolean = false;
    addOptionOnTop: boolean = true;
    showAddOption: boolean = false;

    delegate?: ListViewDelegate;


    selectedRowColor: Color = new Color("color", "rgba(24, 144, 255, 0.1)");

    heightForDataRow: number = 44;
    layoutCellViewLoading?: View;
    layoutCellViewNoData?: View;
    layoutCellViewData?: View;

    private scrollContainer: HTMLDivElement;


    constructor() {
        super();
        this.styles = [
            {
                kind: "ViewStyle",
                fills: [],
                borders: [],
                shadows: []
            },
            {
                kind: "ViewStyle",
                id: "header",
                textStyle: setProps(new PropertyTextStyle(), {
                    weight: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
                    size: px(14),
                    color: new Fill(true, "color", "normal", "rgba(0, 0, 0, 1.0)")
                } as PropertyTextStyle)
            }
        ];
        if (typeof document !== "undefined") {
            this.scrollContainer = document.createElement('div');
        }
    }

    bindDataSource(ds: DataSource) {
        this.dataSource = ds;
    }
    bindDataSourceUpdated(ds: DataSource) {
        this.reloadData();
    }


    viewWasAttached() {
        super.viewWasAttached();
        this.getDiv().appendChild(this.scrollContainer);
    }

    listViewSizeForAddOption(listView: ListView): number[] {
        return [this.getBounds("").width.amount, 30];
    }

    listViewCellForAddOption(listView: ListView, cell: View) {
        "use strict";

    }

    listViewSizeForMoreOption(listView: ListView): number[] {
        return [this.getBounds("").width.amount, 30];
    }

    listViewCellForMoreOption(listView: ListView, cell: View) {
        "use strict";

    }

    listViewRowCellReady(listView: ListView, cell: View, section_index: number, item_index: number) {
        "use strict";
    }

    listViewCellWasAttached(listView: ListView, cell: View, section_index: number, item_index: number) {
        "use strict";
    }


    listViewDataIsLoading(listView: ListView, cell: View): void {

    }
    listViewNoDataToDisplay(listView: ListView, cell: View): void {

    }

    listViewNumberOfSections(listView: ListView): number {
        if (!this.sectionedByLetters)
            return 1;

        const letters = [];

        if (!this.dataSource) {
            return 0;
        }

        for (let i = 0; i < this.dataSource.numberOfItems(); i++) {
            let l = undefined;
            if (this.delegate && this.delegate.listViewAlphabetSectionForObjectAtIndex) {
                l = this.delegate["listViewAlphabetSectionForObjectAtIndex"](this, i);
            } else {
                l = this["listViewAlphabetSectionForObjectAtIndex"](this, i);
            }
            if ((l === '0') || (l === '1') || (l === '2') || (l === '3') || (l === '4') || (l === '5') || (l === '6') || (l === '7') || (l === '8') || (l === '9')) {
                if (letters.indexOf('0-9') === -1)
                    letters.push('0-9');
            }
            else {
                if (letters.indexOf(l) === -1)
                    letters.push(l);
            }
        }
        //letters.sort();
        return letters.length;
    }

    listViewIDForItem(listView: ListView, section_index: number, item_index: number): string {
        "use strict";
        let item = undefined;
        if (listView.delegate && listView.delegate['listViewObjectForItemIndex']) {
            item = listView.delegate['listViewObjectForItemIndex'](listView, section_index,item_index);
        } else {
            item = listView["listViewObjectForItemIndex"](listView, section_index, item_index);
        }
        return item.id;
    }

    listViewAlphabetSectionForObjectAtIndex(listView: ListView, index: number): string { throw "alphabetSectionForObjectAtIndex needs to be implemented."; }

    listViewRowMargin(listView:ListView, section_index: number,item_index: number): number { return 0; }

    listViewRowMarginCustomizeCell(listView: ListView, rowMarginCell: View, section_index: number, item_index: number) {}

    listViewBackgroundColor(listView: ListView): string { return ''; }

    listViewTitleForSection(listView: ListView, section_index: number): string {
        if (!this.sectionedByLetters)
            return "";

        const letters = [];

        if (!this.dataSource) {
            return "";
        }

        for (let i = 0; i < this.dataSource.numberOfItems(); i++) {
            let l = undefined;
            if (this.delegate && this.delegate["listViewAlphabetSectionForObjectAtIndex"]) {
                l = this.delegate["listViewAlphabetSectionForObjectAtIndex"](this, i);
            } else {
                l = this["listViewAlphabetSectionForObjectAtIndex"](this, i);
            }
            if ((l === '0') || (l === '1') || (l === '2') || (l === '3') || (l === '4') || (l === '5') || (l === '6') || (l === '7') || (l === '8') || (l === '9')) {
                if (letters.indexOf('0-9') === -1)
                    letters.push('0-9');
            }
            else {

                if (letters.indexOf(l) === -1)
                    letters.push(l);
            }
        }
        //letters.sort();
        return letters[section_index];
    }

    listViewNumberOfItemsForSection(listView: ListView, section_index: number): number {
        if (!this.dataSource) {
            return 1;
        }
        if (!this.sectionedByLetters) {
            if (!this.dataSource) {
                return 1;
            }
            return this.dataSource.numberOfItems();
        }

        let ret = -1;
        const letters = [];
        for (var i = 0; i < this.dataSource.numberOfItems(); i++) {
            var l = undefined;
            if (this.delegate && this.delegate["listViewAlphabetSectionForObjectAtIndex"] !== undefined) {
                l = this.delegate["listViewAlphabetSectionForObjectAtIndex"](this, i);
            } else {
                l = this["listViewAlphabetSectionForObjectAtIndex"](this, i);
            }
            if ((l === '0') || (l === '1') || (l === '2') || (l === '3') || (l === '4') || (l === '5') || (l === '6') || (l === '7') || (l === '8') || (l === '9')) {
                if (letters.indexOf('0-9') === -1)
                    letters.push('0-9');
            }
            else {

                if (letters.indexOf(l) === -1)
                    letters.push(l);
            }
        }
        //letters.sort();

        for (i = 0; i < this.dataSource.numberOfItems(); i++) {
            var l = undefined;
            if (this.delegate && this.delegate["listViewAlphabetSectionForObjectAtIndex"] !== undefined) {
                l = this.delegate["listViewAlphabetSectionForObjectAtIndex"](this, i);
            } else {
                l = this["listViewAlphabetSectionForObjectAtIndex"](this, i);
            }
            if ((l === '0') || (l === '1') || (l === '2') || (l === '3') || (l === '4') || (l === '5') || (l === '6') || (l === '7') || (l === '8') || (l === '9')) {
                l = '0-9';
            }
            if (l === letters[section_index]) {
                ret++;
            }
        }
        return ret+1;

    }

    listViewItemForIndex(listView: ListView, section_index: number, item_index: number): View {
        const cell = new View();
        if (listView.delegate && listView.delegate.listViewSizeForItemIndex) {
            cell.keyValues["size"] = listView.delegate["listViewSizeForItemIndex"](listView, section_index, item_index);
        } else {
            cell.keyValues["size"] = listView.listViewSizeForItemIndex(listView, section_index, item_index);
        }

        cell.boundsForView = function (parentBounds: Bounds) : Bounds {
            return new Bounds(0, 0, this.keyValues["size"][0], this.keyValues["size"][1]);
        };
        cell.initView(listView.id + "."+ section_index + "." + item_index);
        return cell;
    }


    listViewPaddingForSection(listView: ListView, section_index: number): number { return 10; }
    listViewSizeForItemIndex(listView: ListView, section_index: number, item_index: number): number[] { return [this.parentView!.bounds.width.amount, 68]; }
    listViewOnDoubleClick(listView: ListView) { ; }

    listViewObjectForItemIndex(listView: ListView, section_index: number, item_index: number): any {
        if (!this.dataSource) {
            return {id: generateV4UUID()};
        }
        if (!this.sectionedByLetters)
            return this.dataSource.objectForSortedIndex(item_index);
        let ret = -1;
        const letters = [];
        for (var i = 0; i < this.dataSource.numberOfItems(); i++) {
            var l = undefined;
            if (this.delegate && this.delegate["listViewAlphabetSectionForObjectAtIndex"]) {
                l = this.delegate["listViewAlphabetSectionForObjectAtIndex"](this, i);
            } else {
                l = this["listViewAlphabetSectionForObjectAtIndex"](this, i);
            }
            if ((l === '0') || (l === '1') || (l === '2') || (l === '3') || (l === '4') || (l === '5') || (l === '6') || (l === '7') || (l === '8') || (l === '9')) {
                if (letters.indexOf('0-9')===-1)
                    letters.push('0-9');
            }
            else {

                if (letters.indexOf(l) === -1)
                    letters.push(l);
            }
        }
        //letters.sort();
        for (i = 0; i < this.dataSource.numberOfItems(); i++) {
            var l = undefined;
            if (this.delegate && this.delegate["listViewAlphabetSectionForObjectAtIndex"]) {
                l = this.delegate["listViewAlphabetSectionForObjectAtIndex"](this, i);
            } else {
                l = this["listViewAlphabetSectionForObjectAtIndex"](this, i);
            }
            if ((l === '0') || (l === '1') || (l === '2') || (l === '3') || (l === '4') || (l === '5') || (l === '6') || (l === '7') || (l === '8') || (l === '9')) {
                l = '0-9';
            }
            if (l === letters[section_index])
                ret++;
            if (ret === item_index) {
                return this.dataSource.objectForSortedIndex(i);
            }
        }
        return undefined;
    }

    listViewSizeForSectionHeader(listView: ListView, section_index: number): number[] {
        let b: Bounds;
        if (isDefined(this.cachedStyle) && isDefined(this.cachedStyle.bounds)) {
            b = this.cachedStyle.bounds;
        } else {
            b = this.getBounds("");
        }
        if (listView.direction === Direction.vertical) {
            return [b.width.amount, 20];
        } else {
            return [20, b.height.amount];
        }
    }

    // DEPRECATED ?
    listViewIsObjectSelected(listView: ListView, section_index: number, item_index: number): boolean {
        return false;
        // throw "isObjectSelected needs to be implemented.";
    }

    objectSelectionChanged(section_index: number, item_index: number, selected: boolean) {
        //throw "objectSelectionChanged needs to be implemented.";
    }


    listViewSelectionChangedForRow(listView: ListView, path: any, selected: boolean) {
        "use strict";

    }

    _objectSelectionChanged(section_index: number, item_index: number, selected: boolean) {
        "use strict";
        const path = {
            section_index: section_index,
            item_index: item_index
        };

        if (this.delegate) {
            if (this.delegate["listViewSelectionChangedForRow"] !== undefined) {
                this.delegate["listViewSelectionChangedForRow"](this, path, selected);
            }
        }

        this.objectSelectionChanged(section_index,item_index, selected);


    }


    onItemClick(ctrlKey: boolean, shiftKey: boolean, rowID: string, section_index: number, item_index: number) {


        const event_param = {
            viewController_id: (this.viewController) ? this.viewController.id : "",
            listView_id: this.id,
            listView_selected_id: this.listViewIDForItem(this, section_index, item_index)
        };
        Application.instance.session_event(SessionEvent.kEvent_User, 'ListView.Click', event_param);

        let color = '';
        let arr: ListItem[] = [];

        for ( var i = 0; i < this.items.length; i++) {
            if ((this.items[i].section === section_index) && (this.items[i].index === item_index)) {
                arr = [this.items[i]];
            }
        }
        if (this.selectionMode === SelectionMode.noSelection) {
            return;
        }

        let selected = false;
        let ctrl = ctrlKey;
        let shift = shiftKey;
        if (this.selectionMode === SelectionMode.singleSelection) {
            ctrl = false;
            shift = false;
        }

        if ((ctrl) && (!shift)) {
            // ADD A ROW TO THE SELECTION
            color = document.getElementById(rowID)!.style.backgroundColor!;
            if (color === "rgb(173, 216, 230)") {
                document.getElementById(rowID)!.style.backgroundColor = 'transparent';
                if (arr.length > 0) {
                    arr[0].selected = false;
                    selected = false;
                }
            } else {
                document.getElementById(rowID)!.style.backgroundColor = this.selectedRowColor.value;
                if (arr.length > 0) {
                    arr[0].selected = true;
                    selected = true;
                }
            }
            this._objectSelectionChanged(section_index, item_index, selected);
        }
        else if ((!ctrl) && (!shift)) {
            // REMOVE SELECTION AND SELECT THIS ROW
            for (var i = 0; i < this.items.length; i++) {
                if ((this.items[i].section === section_index) && (this.items[i].index === item_index)) continue;
                document.getElementById(this.id + "_section" + this.items[i].section + "Cell" + this.items[i].index)!.style.backgroundColor = 'transparent';
                this.items[i].selected = false;
                this._objectSelectionChanged(this.items[i].section, this.items[i].index, this.items[i].selected);
            }
            color = document.getElementById(rowID)!.style.backgroundColor!;
            if (color === "rgb(173, 216, 230)") {
                document.getElementById(rowID)!.style.backgroundColor = 'transparent';
                if (arr.length > 0) {
                    arr[0].selected = false;
                    selected = false;
                }
            } else {
                document.getElementById(rowID)!.style.backgroundColor = this.selectedRowColor.value;
                if (arr.length > 0) {
                    arr[0].selected = true;
                    selected = true;
                }
            }
            this._objectSelectionChanged(section_index, item_index, selected);

        }
        else if ((!ctrl) && (shift)) {
            // RANGE SELECTION
            let index = -1;
            let reverse = false;
            for (var i = 0; i < this.items.length; i++) {
                if (index === -1) {
                    if (this.items[i].selected) {
                        index = i;

                        if ((this.items[i].section === section_index && this.items[i].index > item_index) || (this.items[i].section > section_index)) {
                            reverse = true;
                            break;
                        }

                    }
                }
                if ((i >= index) && (index > -1)) {
                    document.getElementById(this.id + "_section" + this.items[i].section + "Cell" + this.items[i].index)!.style.backgroundColor = this.selectedRowColor.value;
                    this.items[i].selected = true;
                    this._objectSelectionChanged(this.items[i].section, this.items[i].index, this.items[i].selected);

                    if ((this.items[i].section === section_index) && (this.items[i].index === item_index)) {
                        // remove the ones after
                        index = -2;
                    }
                } else
                if (index === -2) {
                    document.getElementById(this.id + "_section" + this.items[i].section + "Cell" + this.items[i].index)!.style.backgroundColor = 'transparent';
                    this.items[i].selected = false;
                    this._objectSelectionChanged(this.items[i].section, this.items[i].index, this.items[i].selected);
                }
            }

            if (reverse) {

                for (var i = index; i >= 0; i--) {

                    document.getElementById(this.id + "_section" + this.items[i].section + "Cell" + this.items[i].index)!.style.backgroundColor = this.selectedRowColor.value;
                    this.items[i].selected = true;
                    this._objectSelectionChanged(this.items[i].section, this.items[i].index, this.items[i].selected);

                    if ((this.items[i].section === section_index) && (this.items[i].index === item_index)) {
                        index = -2;
                    }
                    else if (index === -2) {
                        //$('#' + this._ID + "_section" + this.Items[i].section + "Cell" + this.Items[i].index).css({ "background-color": "transparent" });
                        document.getElementById(this.id + "_section" + this.items[i].section + "Cell" + this.items[i].index)!.style.backgroundColor = 'transparent';
                        this.items[i].selected = false;
                        this._objectSelectionChanged(this.items[i].section, this.items[i].index, this.items[i].selected);
                    }
                }

            }
        }

        if (this.delegate && this.delegate.listViewSelectionHasChanged) {
            this.delegate["listViewSelectionHasChanged"](this);
        }

    }


    scrollToSelection() {

        for (let i = 0 ; i < this.items.length; i++) {
            if (this.items[i].selected) {

                const divElem = this.getDiv();
                const chElem = this.items[i].cell!.getDiv();
                divElem.scrollTop =  chElem.getBoundingClientRect().top - divElem.offsetTop;

                //this.Items[i].cell.getDiv().scrollIntoView({block: 'end',  behaviour: 'smooth'});
                return;
            }
        }
        this.getDiv().scrollTop =  0;

    }

    setSelected(id: string,isSelected: boolean) {
        "use strict";
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].item_id === id) {
                if (isSelected) {
                    this.items[i].selected = true;
                    this.items[i].cell!.getDiv().style.backgroundColor = this.selectedRowColor.value;
                } else {
                    this.items[i].selected = false;
                    this.items[i].cell!.getDiv().style.backgroundColor = '';
                }
            }
        }
    }

    getSelectedObjects(): any {
        const arr = [];
        for ( var i = 0 ; i < this.items.length; i++) {
            if (this.items[i].selected) {
                arr.push(this.items[i]);
            }
        }
        const ret = [];
        for (var i = 0; i < arr.length; i++) {
            let obj = undefined;
            if (this.delegate && this.delegate["listViewObjectForItemIndex"]) {
                obj = this.delegate["listViewObjectForItemIndex"](this, arr[i].section, arr[i].index);
            } else {
                obj = this["listViewObjectForItemIndex"](this, arr[i].section, arr[i].index);
            }
            ret.push(obj);
        }
        return ret;
    }



    rowAtPath(path: any) {
        "use strict";
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].section === path.section_index && this.items[i].index === path.item_index) {
                return this.items[i].cell;
            }
        }
        return undefined;
    }


    setLoadingState (loading: boolean) {

        let b: Bounds;
        if (isDefined(this.cachedStyle) && isDefined(this.cachedStyle.bounds)) {
            b = this.cachedStyle.bounds;
        } else {
            b = this.getBounds("");
        }

        this.getDiv().style.backgroundColor = "";
        if (this.delegate && this.delegate["listViewBackgroundColor"]) {
            this.getDiv().style.backgroundColor = this.delegate["listViewBackgroundColor"](this);
        } else {
            this.getDiv().style.backgroundColor = this["listViewBackgroundColor"](this);
        }
        this.getDiv().style.outline = 'none';

        for (let j = this.items.length - 1; j === 0; j--) {
            let item = this.items[j];
            if (item !== undefined) {
                try {
                    this.getDiv().removeChild(item.obj.getDiv());
                } catch (e) { throw e; }
                item.obj = undefined;
                this.items.pop();
            }
        }
        while (this.scrollContainer.hasChildNodes()) {
            this.scrollContainer.removeChild(this.scrollContainer.lastChild!);
        }

        this.detachAllChildren();

        if (loading === true) {

            let cell = new View(); //document.createElement("div");

            var cellSize: number[] = [b.width.amount,44];

            cell.keyValues["cellSize"] = cellSize;
            cell.keyValues["item_x"] = 0;
            cell.keyValues["item_y"] = 0;
            cell.boundsForView = function (parnetBounds: Bounds): Bounds {
                "use strict";
                return {
                    kind: "Bounds",
                    x: this.keyValues["item_x"],
                    y: this.keyValues["item_y"],
                    width: this.keyValues["cellSize"][0],
                    height: this.keyValues["cellSize"][1],
                    unit: "px",
                    position: "absolute"
                };
            };
            cell.initView(this.id + "_LoadingCell");
            this.attach(cell);
            //cell.setAttribute("style", "left:" + item_x + "px;top:" + item_y + "px;width:" + cellSize[0] + "px;height:" + cellSize[1] + "px;position:absolute;");

            if (this.delegate && this.delegate.listViewDataIsLoading !== undefined) {
                this.delegate.listViewDataIsLoading(this, cell);
            } else {
                this.listViewDataIsLoading(this, cell);
            }




        }
    }


    reloadData() {

        console.warn("listView.reloadData " + + new Date());

        this.items = [];

        this.getDiv().style.backgroundColor = "";
        if (this.delegate && this.delegate["listViewBackgroundColor"]) {
            this.getDiv().style.backgroundColor = this.delegate["listViewBackgroundColor"](this);
        } else {
            this.getDiv().style.backgroundColor = this["listViewBackgroundColor"](this);
        }
        this.getDiv().style.outline = 'none';

        for (let j = this.items.length - 1; j === 0; j--) {
            let item = this.items[j];
            if (item !== undefined) {
                try {
                    this.getDiv().removeChild(item.obj.getDiv());
                } catch (e) { throw e; }
                item.obj = undefined;
                this.items.pop();
            }
        }
        while (this.scrollContainer.hasChildNodes()) {
            this.scrollContainer.removeChild(this.scrollContainer.lastChild!);
        }

        this.detachAllChildren();

        let item_y = 0;
        let item_x = 0;



        // add option

        var cellSize: number[] = [100,44];

        if (this.showAddOption) {
            if (this.addOptionOnTop) {

                const addOptionCell = new View(); //document.createElement("div");

                if (this.delegate && this.delegate["listViewSizeForAddOption"]) {
                    cellSize = this.delegate["listViewSizeForAddOption"](this);
                } else {
                    cellSize = this["listViewSizeForAddOption"](this);
                }
                addOptionCell.keyValues["cellSize"] = cellSize;
                addOptionCell.keyValues["item_x"] = item_x;
                addOptionCell.keyValues["item_y"] = item_y;
                addOptionCell.boundsForView = function (parnetBounds: Bounds): Bounds {
                    "use strict";
                    return boundsWithPixels({
                        x: this.keyValues["item_x"],
                        y: this.keyValues["item_y"],
                        width: this.keyValues["cellSize"][0],
                        height: this.keyValues["cellSize"][1],
                        unit: "px",
                        position: "absolute"
                    });
                };
                addOptionCell.initView(this.id + "_addOption");
                this.attach(addOptionCell);

                if (this.delegate && this.delegate["listViewCellForAddOption"]) {
                    this.delegate["listViewCellForAddOption"](this, addOptionCell);
                } else {
                    this["listViewCellForAddOption"](this, addOptionCell);
                }
                //cell.setAttribute("style", "left:" + item_x + "px;top:" + item_y + "px;width:" + cellSize[0] + "px;height:" + cellSize[1] + "px;position:absolute;");

                if (this.direction === Direction.horizontal) {
                    item_x += cellSize[0];
                } else {
                    item_y += cellSize[1];
                }

                if (this.direction === Direction.horizontal) {
                    item_x += 10;
                } else {
                    item_y += 10;
                }


            }

        }


        let nbSections = 0;
        if (this.delegate && this.delegate["listViewNumberOfSections"]) {
            nbSections = this.delegate["listViewNumberOfSections"](this);
        } else {
            nbSections = this["listViewNumberOfSections"](this);
        }
        for (let section_index = 0; section_index < nbSections; section_index++) {

            let nbItems = 0;
            if (this.delegate && this.delegate.listViewNumberOfItemsForSection) {
                nbItems = this.delegate.listViewNumberOfItemsForSection(this, section_index);
            } else {
                nbItems = this.listViewNumberOfItemsForSection(this, section_index);
            }
            if (nbItems === 0) continue;

            let hasCustomSectionHeader = false;
            if (this.delegate && this.delegate.listViewCustomSectionHeader) {
                hasCustomSectionHeader = true;
            } else if ((this as any).listViewCustomSectionHeader !== undefined) {
                hasCustomSectionHeader = true;
            }


            if (!hasCustomSectionHeader) {
                let title = "";
                if (this.delegate && this.delegate["listViewTitleForSection"]) {
                    title = this.delegate["listViewTitleForSection"](this, section_index);
                } else {
                    title = this["listViewTitleForSection"](this, section_index);
                }
                if (title !== "") {
                    var headerSize: number[] = [0,0];
                    if (this.delegate && this.delegate["listViewSizeForSectionHeader"]) {
                        headerSize = this.delegate["listViewSizeForSectionHeader"](this, section_index);
                    } else {
                        headerSize = this["listViewSizeForSectionHeader"](this, section_index);
                    }
                    /*
                    let title_div =  document.createElement("div");
                    title_div.id = this.id + "_section" + section_index + "Title";
                    title_div.setAttribute("style", "background-color:lightgrey;padding:0px;left:" + item_x + "px;top:" + item_y + "px;width:" + headerSize[0] + "px;height:" + headerSize[1] + "px;position:absolute;text-color:black;color:black;"); //rgb(47, 106, 187)

                    if (this.direction === MentatJS.kHorizontal) {
                        item_x += parseInt(headerSize[0]);
                    } else {
                        item_y += parseInt(headerSize[1]);
                    }
                    title_div.innerHTML = "&nbsp;" + title;
                    this.getDiv().appendChild(title_div);
                    title_div = undefined;
                    */
                    let title_div = new Label();
                    title_div.keyValues["item_x"] = item_x;
                    title_div.keyValues["item_y"] = item_y;
                    title_div.keyValues["headerSize"] = [headerSize[0], headerSize[1]];
                    title_div.boundsForView = function (parentBounds: Bounds): Bounds {
                        return boundsWithPixels({
                            x: this.keyValues["item_x"],
                            y: this.keyValues["item_y"],
                            width: this.keyValues["headerSize"][0],
                            height: this.keyValues["headerSize"][1],
                            unit: 'px',
                            position: 'absolute'
                        });
                    };
                    title_div.text = "&nbsp;" + title;


                    let headerStyles: ViewStyle[] = JSON.parse(JSON.stringify(this.getStylesForTargetId("header")));
                    headerStyles.forEach((style: ViewStyle) => {
                        style.id = undefined;
                    });

                    title_div.styles.push(...headerStyles);


                    //title_div.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                    //title_div.fontSize = 14;
                    title_div.fillLineHeight = true;
                    title_div.initView(this.id + "_section_" + section_index + "_Title");
                    this.attach(title_div);
                    if (this.direction === Direction.horizontal) {
                        item_x += headerSize[0];
                    } else {
                        item_y += headerSize[1];
                    }
                }
            } else {
                const customH = new View();
                customH.keyValues["size"] = 0;
                var headerSize: number[] = [0,0];
                if (this.delegate && this.delegate["listViewSizeForSectionHeader"]) {
                    headerSize = this.delegate["listViewSizeForSectionHeader"](this, section_index);
                } else {
                    headerSize = this["listViewSizeForSectionHeader"](this, section_index);
                }
                customH.keyValues["size"] = headerSize;
                customH.keyValues["item_x"] = item_x;
                customH.keyValues["item_y"] = item_y;
                if (this.direction === Direction.horizontal) {
                    item_x += customH.keyValues["size"][0];
                } else {
                    item_y += customH.keyValues["size"][1];
                }
                customH.boundsForView = function (parentBounds: Bounds): Bounds {
                    return boundsWithPixels({
                        x: this.keyValues["item_x"],
                        y: this.keyValues["item_y"],
                        width: this.keyValues["size"][0],
                        height: this.keyValues["size"][1],
                        unit: 'px',
                        position: 'absolute'
                    });
                };
                customH.viewWasAttached = function () {

                };
                customH.initView(this.id + "_section" + section_index + "Title");
                this.attach(customH);

                if (this.delegate && this.delegate.listViewCustomSectionHeader) {
                    this.delegate.listViewCustomSectionHeader(this, customH, section_index);
                } else if ((this as any)["listViewCustomSectionHeader"]) {
                    (this as any)["listViewCustomSectionHeader"](this, customH, section_index);
                }


                // add row margin
                if (this.direction === Direction.horizontal) {
                    if (this.delegate && this.delegate["listViewRowMargin"]) {
                        item_x += this.delegate.listViewRowMargin(this, section_index, -1);
                    } else {
                        item_x += this.listViewRowMargin(this, section_index, -1);
                    }
                } else {
                    if (this.delegate && this.delegate["listViewRowMargin"]) {
                        item_y += this.delegate.listViewRowMargin(this, section_index, -1);
                    } else {
                        item_y += this.listViewRowMargin(this, section_index, -1);
                    }
                }
            }

            for (let i = 0; i < nbItems; i++) {


                let cell = new View(); //document.createElement("div");
                const storeItem = new ListItem();

                var cellSize: number[] = [0,0];
                if (this.delegate && this.delegate["listViewSizeForItemIndex"]) {
                    cellSize = this.delegate["listViewSizeForItemIndex"](this, section_index, i);
                } else {
                    cellSize = this["listViewSizeForItemIndex"](this, section_index, i);
                }
                cell.overflow = 'hidden';
                cell.keyValues["cellSize"] = cellSize;
                cell.keyValues["item_x"] = item_x;
                cell.keyValues["item_y"] = item_y;
                cell.boundsForView = function (parnetBounds: Bounds): Bounds {
                    "use strict";
                    return boundsWithPixels({
                        x: this.keyValues["item_x"],
                        y: this.keyValues["item_y"],
                        width: this.keyValues["cellSize"][0],
                        height: this.keyValues["cellSize"][1],
                        unit: "px",
                        position: "absolute"
                    });
                };
                cell.initView(this.id + "_section" + section_index + "Cell" + i);
                this.attach(cell);
                //cell.setAttribute("style", "left:" + item_x + "px;top:" + item_y + "px;width:" + cellSize[0] + "px;height:" + cellSize[1] + "px;position:absolute;");

                if (this.direction === Direction.horizontal) {
                    storeItem.upperPosition = item_x;
                    item_x += cellSize[0];
                    storeItem.bottomPosition = item_x;
                } else {
                    storeItem.upperPosition = item_y;
                    item_y += cellSize[1];
                    storeItem.bottomPosition = item_y;
                }

                let userView: View;
                if (this.delegate && this.delegate["listViewItemForIndex"] !== undefined) {
                    userView = this.delegate["listViewItemForIndex"](this, section_index, i);
                } else {
                    userView = this["listViewItemForIndex"](this, section_index, i);
                }
                // TODO+ check is View ?
                userView.keyValues["cellSize"] = cellSize;
                userView.boundsForView = function (parentBounds: Bounds) : Bounds {
                    return boundsWithPixels({
                        x:0,
                        y:0,
                        width:this.keyValues["cellSize"][0],
                        height: this.keyValues["cellSize"][1],
                        unit:'px',
                        position:'absolute'
                    });
                }
                cell.attach(userView);



                let isSelected = false;
                if (this.delegate && this.delegate["listViewIsObjectSelected"]) {
                    isSelected = this.delegate["listViewIsObjectSelected"]( this, section_index, i);
                } else {
                    isSelected = this["listViewIsObjectSelected"](this, section_index, i);
                }
                if (isSelected) {
                    cell.fills = [new Fill(true, "color", "normal", this.selectedRowColor.value)];
                    storeItem.selected = true;
                }

                let itemID = undefined;
                if (this.delegate && this.delegate["listViewIDForItem"]) {
                    itemID = this.delegate["listViewIDForItem"](this, section_index, i);
                } else {
                    itemID = this["listViewIDForItem"](this, section_index, i);
                }


                storeItem.obj = this.listViewObjectForItemIndex(this, section_index, i);
                storeItem.section = section_index;
                storeItem.index = i;
                storeItem.cell = userView;
                storeItem.item_id = itemID;
                this.items.push(storeItem);


                cell.getDiv().section_index = section_index;
                cell.getDiv().item_index = i;
                cell.getDiv().ptr = this;
                cell.getDiv().addEventListener('click',function (e: MouseEvent) {
                    e.preventDefault(); e.stopPropagation();
                    // @ts-ignore
                    this.ptr.onItemClick(e.ctrlKey, e.shiftKey, this.id, this.section_index, this.item_index);
                });

                //this.getDiv().appendChild(cell);



                    if (this.delegate && this.delegate['listViewRowCellReady']) {
                        this.delegate['listViewRowCellReady'](this, userView, section_index, i);
                    } else {
                        this.listViewRowCellReady(this, userView, section_index, i);
                    }




                    if (this.delegate && this.delegate['listViewCellWasAttached']) {
                        this.delegate['listViewCellWasAttached'](this, userView, section_index, i);
                    } else {
                        this.listViewCellWasAttached(this, userView, section_index, i);
                    }


                let rowMargin = 0;
                if (this.delegate && this.delegate["listViewRowMargin"]) {
                    rowMargin = this.delegate["listViewRowMargin"](this, section_index, i);
                } else {
                    rowMargin = this["listViewRowMargin"](this, section_index, i);
                }
                if (rowMargin > 0) {

                    const rowMarginCell = new View();
                    rowMarginCell.keyValues["item_y"] = item_y;
                    rowMarginCell.keyValues["rowMargin"] = rowMargin;
                    rowMarginCell.boundsForView = function (parentBounds: Bounds) : Bounds {
                        return boundsWithPixels({
                            x: 0,
                            y: this.keyValues["item_y"],
                            width: parentBounds.width.amount,
                            height: this.keyValues["rowMargin"],
                            unit: "px",
                            position: "absolute"
                        });
                    };
                    rowMarginCell.initView(this.id + "." + section_index + "." + i + ".margin");
                    this.attach(rowMarginCell);

                    if (this.delegate && this.delegate["listViewRowMarginCustomizeCell"]) {
                        this.delegate["listViewRowMarginCustomizeCell"](this, rowMarginCell, section_index, i);
                    } else {
                        this["listViewRowMarginCustomizeCell"](this, rowMarginCell, section_index, i);
                    }


                }


                if (this.direction === Direction.horizontal) {
                    item_x += rowMargin;
                } else {
                    item_y += rowMargin;
                }
            }


        }



        if (this.showMoreOptions) {


            const moreOptionCell = new View(); //document.createElement("div");

            if (this.delegate && this.delegate["listViewSizeForMoreOption"]) {
                cellSize = this.delegate["listViewSizeForMoreOption"](this);
            } else {
                cellSize = this["listViewSizeForMoreOption"](this);
            }
            moreOptionCell.keyValues["cellSize"] = cellSize;
            moreOptionCell.keyValues["item_x"] = item_x;
            moreOptionCell.keyValues["item_y"] = item_y;
            moreOptionCell.boundsForView = function (parentBounds: Bounds): Bounds {
                return boundsWithPixels({
                    x: this.keyValues["item_x"],
                    y: this.keyValues["item_y"],
                    width: this.keyValues["cellSize"][0],
                    height: this.keyValues["cellSize"][1],
                    unit: "px",
                    position: "absolute"
                });
            };
            moreOptionCell.initView(this.id + "_moreOption");
            this.attach(moreOptionCell);

            if (this.delegate && this.delegate["listViewCellForMoreOption"]) {
                this.delegate["listViewCellForMoreOption"](this, moreOptionCell);
            } else {
                this["listViewCellForMoreOption"](this, moreOptionCell);
            }
            //cell.setAttribute("style", "left:" + item_x + "px;top:" + item_y + "px;width:" + cellSize[0] + "px;height:" + cellSize[1] + "px;position:absolute;");

            if (this.direction === Direction.horizontal) {
                item_x += cellSize[0];
            } else {
                item_y += cellSize[1];
            }

            if (this.direction === Direction.horizontal) {
                item_x += 10;
            } else {
                item_y += 10;
            }




        }








        if (this.direction === Direction.horizontal) {
            this.scrollContainer.style.width = item_x + "px";
            this.scrollContainer.style.height = this.getDiv().style.height;

        } else {

            this.scrollContainer.style.width = this.getDiv().style.width;
            this.scrollContainer.style.height = item_y + "px";
        }

        this.scrollContainer.style.overflowY = 'auto';
        (this.scrollContainer.style as any).webkitOverflowScrolling = 'touch';


        this.getDiv().onscroll = (e) => {
            let b: Bounds;
            if (isDefined(this.cachedStyle) && isDefined(this.cachedStyle.bounds)) {
                b = this.cachedStyle.bounds;
            } else {
                b = this.getBounds("");
            }
            let breakLoop: boolean = false;
            let scrollA = parseInt(this.getDiv().scrollTop);
            let scrollB = scrollA + b.width.amount;

            for (let i = 0; i < this.items.length; i += 1) {
                let item = this.items[i];
                if ((item.upperPosition > scrollA && item.upperPosition < scrollB) ||
                    (item.bottomPosition > scrollA && item.bottomPosition < scrollB)) {
                    if (item.inViewport === false) { // entered viewport
                        item.inViewport = true;
                        if (isDefined(this.delegate) && isDefined(this.delegate.listViewCellCameIntoViewport)) {
                            this.delegate.listViewCellCameIntoViewport(this, item);
                        }
                    }
                } else {
                    if (item.inViewport === true) { // left viewport
                        item.inViewport = false;
                        if (isDefined(this.delegate) && isDefined(this.delegate.listViewCellLeftViewport)) {
                            this.delegate.listViewCellLeftViewport(this, item);
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

        if (this.delegate && this.delegate.listViewWasRefreshed) {
            this.delegate.listViewWasRefreshed(this);
        }



    }



    render(parentBounds?: Bounds, style?: ViewStyle) {
        console.warn("listView.render " + + new Date());
        super.render(parentBounds, style);

        if (this.noTabIndex === false)
            this.getDiv().tabIndex = '-1';

        if (this.direction === Direction.horizontal) {
            this.getDiv().style.overflowX = 'scroll';
            this.getDiv().style.overflowY = "hidden";
            /* has to be scroll, not auto */
            this.getDiv().style.webkitOverflowScrolling = "touch";
        } else {
            this.getDiv().style.overflowX = 'hidden';
            this.getDiv().style.overflowY = "scroll";
            /* has to be scroll, not auto */
            this.getDiv().style.webkitOverflowScrolling = "touch";
        }


        this.reloadData();

    }


    viewDidLoad() {

        if (this.getDiv() !== undefined) {

            if (this.noTabIndex === false)
                this.getDiv().tabIndex = '-1';

            if (this.direction === Direction.horizontal) {
                this.getDiv().style.overflowX = 'scroll';
                this.getDiv().style.overflowY = "hidden";
                /* has to be scroll, not auto */
                this.getDiv().style.webkitOverflowScrolling = "touch";
            } else {
                this.getDiv().style.overflowX = 'hidden';
                this.getDiv().style.overflowY = "scroll";
                /* has to be scroll, not auto */
                this.getDiv().style.webkitOverflowScrolling = "touch";
            }
        }

        this.getDiv().ViewCtrl = this;

        this.items = [];
        this.dataSource = new DataSource(new DSJSONAdaptor([]));

        if (this.delegate === undefined) {
            this.delegate = this;
        }


        this.reloadData();
    }

}

