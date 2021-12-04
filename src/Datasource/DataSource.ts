
import {downloadDataWithDelegate, postDataWithDelegate} from "./download";
import {DataSourceDelegate} from "./DataSourceDelegate";
import {View} from "../View/View";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {DataRequest} from "./DataRequest";
import {Logging} from "../Utils/logging";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {isDefined} from "../Utils/isDefined";





export class DataSource extends View implements DataSourceDelegate {
    id: string = '';
    dataSourceID: string =  '';
    dataString : string = '';
    mainData: any[] = [];
    sortedData: { ptrArray: any[], index: number }[] = [];
    dataLastUpdated: number = 0;


    dataSourceType: string = "MentatJS.DataSource";

    delegate?: DataSourceDelegate;
    last_request_id: string = '';
    lastRequest?: any = undefined;
    currentRequest?: any = undefined;
    limit: number = 50;
    offset: number = 0;
    order_by: string = "ID ASC";
    bindViews: any[] = [];
    totalCount: number = 0;

    shouldBind: boolean = false;

    countNestedEntries: boolean = false;



    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);
    }


    clearBinds() {
        "use strict";
        this.bindViews = [];
    }

    initWithDelegate(_delegate: DataSourceDelegate) {
        "use strict";
        this.delegate = _delegate;
        this.bindViews = [];
        this.shouldBind = true;
    }


    _fetchRequest(request: DataRequest) {
        "use strict";
        let uri: string = "";
        let payload : any = {};
        let method : string = "POST";

        if (Logging.enableLogging) {
            Logging.log("-------------------------");
            Logging.log("DataSource._fetchRequest");
            Logging.dir(request);
        }
        if (this.delegate === undefined) {
            Logging.warn("DataSource ID: " + this.dataSourceID + " has no delegate");
        }
        uri = this.delegate!.dataSourceURIForRequest(this, request);
        if (Logging.enableLogging) {
            Logging.log("uri is : " + uri);
        }
        payload = this.delegate!["dataSourcePayloadForRequest"](this, request);
        if (Logging.enableLogging) {
            Logging.log("payload:");
            Logging.dir(payload);
        }

        if (this.delegate!.dataSourceMethodForRequest !== undefined) {
            method = this.delegate!["dataSourceMethodForRequest"](this, request);
        } else {
            method = this["dataSourceMethodForRequest"](this, request);
        }
        if (Logging.enableLogging) {
            Logging.log("method is : " + method);
        }
        this.last_request_id = (this.currentRequest !== undefined) ? this.currentRequest.id : "";
        this.lastRequest = this.currentRequest;
        this.currentRequest = request;

        // update bind views
        for (let i = 0; i < this.bindViews.length; i++) {
            const view = this.bindViews[i];
            if (view.className === "TableView") {
                view.dataSource = this;
                view.reloadData();
            }
            if (view.className === "TableViewPager") {
                view.dataSource = this;
                view.reloadData();
            }
            if (view.className === "CollectionView") {
                view.dataSource = this;
                view.reloadData();
            }
            if (view.className === "ListView") {
                view.dataSource = this;
                view.reloadData();
                view.setLoadingState(true);
            }
        }


        const post_delegate = {
            dsRef: this,
            request: request,

            processData: function (dataID: string, data: string) {
                const bGet = performance.now();
                if (Logging.enableLogging) {
                    Logging.log("DataSource.fetch GET exec " + (bGet - this.request.performance_RequestA) + " ms");
                }

                const json = JSON.parse(data);
                let valid = false;
                if (this.dsRef!.delegate!["dataSourceIsDataValid"] !== undefined) {
                    valid = this.dsRef!.delegate!["dataSourceIsDataValid"](this.dsRef, this.request, json);
                } else {
                    if (json.valid !== undefined) {
                        valid = json.valid;
                    }
                }
                if (valid) {
                    this.dsRef.initWithData(json);
                    this.dsRef.limit = this.request.limit;
                    this.dsRef.dataString = data;
                    if (this.dsRef.delegate!["dataSourceNumberOfTotalRows"] !== undefined) {
                        this.dsRef.totalCount = this.dsRef.delegate!["dataSourceNumberOfTotalRows"](this.dsRef, this.request, json);
                    } else {
                        this.dsRef.totalCount = this.dsRef["dataSourceNumberOfTotalRows"](this.dsRef, this.request, json);
                    }
                    if (this.dsRef.delegate!["dataSourceWasRefreshed"] !== undefined) {
                        this.dsRef.delegate!["dataSourceWasRefreshed"](this.dsRef, this.request);
                    }
                    if (Logging.enableLogging) {
                        Logging.log("DataSource.UpdateBindViews starts");
                    }
                    const aUpdateBindViews = performance.now();
                    this.dsRef.lastRequest = this.request;

                    for (let i = 0; i < this.dsRef.bindViews.length; i++) {
                        const view = this.dsRef.bindViews[i];
                        if (view.className === "TableView") {
                            view.dataSource = this.dsRef;
                            view.reloadData();
                        }
                        if (view.className === "TableViewPager") {
                            view.dataSource = this.dsRef;
                            view.reloadData();
                        }
                        if (view.className === "CollectionView") {
                            view.dataSource = this.dsRef;
                            view.reloadData();
                        }
                        if (view.className === "ListView") {
                            view.dataSource = this.dsRef;
                            view.reloadData();
                        }
                    }

                    const bUpdateBindViews = performance.now();
                    if (Logging.enableLogging) {
                        console.log("DataSource.UpdateBindViews exec " + (bUpdateBindViews - aUpdateBindViews) + " ms");
                    }

                    if (this.dsRef.delegate!.dataSourceUpdatedViews !== undefined) {
                        this.dsRef.delegate!["dataSourceUpdatedViews"](this.dsRef, this.request);
                    }

                } else {
                    if (this.dsRef.delegate!["dataSourceFailed"] !== undefined) {
                        this.dsRef.delegate!["dataSourceFailed"](this.dsRef, this.request, data);
                    }
                }
            },

            dataWasDownloaded: function (dataID: string, data: any) {
                this.processData(dataID, data);
            },

            dataWasPosted: function (dataID: string, data: any) {
                this.processData(dataID, data);
            },

            couldNotPostData: function (dataID: string, err: any) {

            },

            couldNotDownload: function (dataID: string, err: any) {

            }
        };

        request.performance_RequestA = performance.now();
        if (method === "POST") {
            postDataWithDelegate(request.id, uri, payload, post_delegate);
        }
        if (method === "GET") {
            downloadDataWithDelegate(request.id, uri, post_delegate);
        }


    }

    dataSourceFailed(dataSource: DataSource, request: DataRequest, data: string): void {
        "use strict";

    }

    dataSourceIsDataValid(dataSource: DataSource, request: DataRequest, json: any): boolean {
        "use strict";
        return true;
    }
    dataSourceNumberOfTotalRows(dataSource: DataSource, request: DataRequest, json: any): number {
        "use strict";
        return json.total_count;
    }

    dataSourceURIForRequest(dataSource: DataSource, request: DataRequest): string {
        return "";
    }

    /*

        request = {
            id: "",
            last_request_id: "",
            limit: 20,
            offset: 0,
            order_by: ""
        };

     */

    dataSourceMethodForRequest(dataSource: DataSource, request: DataRequest): string {
        "use strict";
        return "POST";
    }
    dataSourcePayloadForRequest(dataSource: DataSource, request: DataRequest): any {
        "use strict";
        return {

        };
    }

    dataSourceWasRefreshed(dataSource: DataSource, request: DataRequest) {
        "use strict";

    }

    dataSourceNestedEntriesForPath(dataSource: DataSource, json: any): any {
        return undefined;
    }


    firstPage() {
        this.offset = 0;
        const request = {
            id: generateV4UUID(),
            last_request_id: this.last_request_id,
            limit: this.limit,
            page: 1,
            offset: 0,
            order_by: "",
            performance_RequestA: 0
        };
        this._fetchRequest(request);
    }
    nextPage() {
        let newPage = this.lastRequest.page + 1;
        if (newPage <= 0) {
            newPage = 1;
        }
        let new_offset = (newPage * this.lastRequest.limit);
        new_offset = new_offset - this.lastRequest.limit;

        const request = {
            id: generateV4UUID(),
            last_request_id: this.last_request_id,
            limit: this.limit,
            page: newPage,
            offset: new_offset,
            order_by: "",
            performance_RequestA: 0
        };

        this._fetchRequest(request);
    }
    previousPage() {
        let newPage = this.lastRequest.page - 1;
        if (newPage <= 0) {
            newPage = 1;
        }
        let new_offset = (newPage * this.lastRequest.limit);
        new_offset = new_offset - this.lastRequest.limit;
        const request = {
            id: generateV4UUID(),
            last_request_id: this.last_request_id,
            limit: this.limit,
            page: newPage,
            offset: new_offset,
            order_by: "",
            performance_RequestA: 0
        };
        this._fetchRequest(request);
    }

    jumpTo(page: number) {

        if (Logging.enableLogging) {
            console.log("jumping to page: " + page);
            console.log("limit is: " + this.limit);
        }
        let newPage = page;
        if (newPage <= 0) {
            newPage = 1;
        }
        let new_offset = (newPage * this.lastRequest.limit);
        new_offset = new_offset - this.lastRequest.limit;
        if (Logging.enableLogging) {
            console.log("new offset: " + new_offset);
        }
        const request = {
            id: generateV4UUID(),
            last_request_id: this.last_request_id,
            page: newPage,
            limit: this.limit,
            offset: new_offset,
            order_by: "",
            performance_RequestA: 0
        };
        this._fetchRequest(request);
    }


    totalNumberOfItems(): number {
        return this.totalCount;
    }




    initWithDataString(_str: string) {

        this.dataString = _str;
        let json: any = {};
        json = JSON.parse(_str);
        this.dataLastUpdated = + new Date();

        if ( json.valid===false) {
            this.mainData = [];
            this.sortedData = [];
        } else {
            this.mainData = this.arrayPath(json);
            this.reindex();
        }
    }

    initWithData(data: any) {
        "use strict";
        this.dataLastUpdated = + new Date();
        this.mainData = this.arrayPath(data);
        this.sortedData = [];
        this.reindex();
    }


    arrayPath(json: any): any[] {
        return json.rows;
    }

    objectForSortedIndex(index: number): any {
        if (index<0) return undefined;
        if (index>= this.sortedData.length) return undefined;

        let entry: {ptrArray: any[], index: number} = this.sortedData[index];
        if (entry.index <0) return undefined;
        if (entry.index > entry.ptrArray.length) return undefined;
        return entry.ptrArray[entry.index];

    }

    protected _objectAtIndex(index: number): any | undefined {
        throw "_objectAtIndex should not be used directly";
        if (index<0) return undefined;

        if (index>=this.mainData.length) return undefined;
        return this.mainData[index];
    }

    findObject(valueToFind: any,selectorFunction: any):any | undefined {
        "use strict";
        const nb = this.numberOfItems();
        for (let i = 0; i < nb; i++) {
            if (selectorFunction(valueToFind,this.objectForSortedIndex(i))===true) {
                return this.objectForSortedIndex(i);
            }
        }
        return undefined;
    }

    idForObject (item: any):number {
        return item.uniqueintid;
    }

    sortFieldForObject(item: any): any { // override to sort on name member
        return item.uniqueintid;
    }

    groupByForSortedIndex(index: number): any {
        "use strict";
        return this.objectForSortedIndex(index).uniqueintid;
    }


    applyFilter(value: any,fn_filter: any) {
        let i = this.mainData.length;
        while (i>0) {
            if (fn_filter(value,this.mainData[i-1])===false) {
                this.mainData.splice(i-1,1);
                i = this.mainData.length;
            } else {
                i--;
            }
        }
        this.reindex();
    }


    numberOfItems(): number {
        return this.sortedData.length;
    }

    filterForObject(item: any): boolean {
        return true;
    }


    quickFind(uniqueintid:number):any {
        let currentIndex = -1;
        let range = [0, this.mainData.length - 1];
        let nbJumps = 0;
        while (1) {
            nbJumps++;

            currentIndex = range[0] + (range[1] - range[0]) / 2;

            const _id = this.idForObject(this._objectAtIndex(currentIndex));

            if (_id === uniqueintid) {
                if (Logging.enableLogging) {
                    console.log('found ' + uniqueintid + ' in ' + nbJumps + ' jumps');
                }
                return this._objectAtIndex(currentIndex);
            }
            if (_id < uniqueintid) {
                range = [currentIndex,this.mainData.length-1];
            }
            if (_id > uniqueintid) {
                range[1] = currentIndex-1;
            }
            if (range[0] === range[1]) return undefined;
        }
    }


    select(compFN:any):any | undefined {
        "use strict";
        for (let i = 0; i < this.numberOfItems(); i++) {
            if (compFN(this.objectForSortedIndex(i)) === true) {
                return this.objectForSortedIndex(i);
            }
        }
        return undefined;
    }


    reindex() {

        this.sortedData = [];


        function recur_(ds: DataSource, base) {
            for (let i = 0; i < base.length; i++ ) {
                //this.mainData[i].uniqueintid = i;
                if (ds.filterForObject(base[i])) {
                    ds.sortedData.push({ptrArray: base, index: i});
                }
                if (ds.countNestedEntries === true) {
                    if (isDefined(ds.dataSourceNestedEntriesForPath)) {
                        let sub = ds.dataSourceNestedEntriesForPath(ds, base[i]);
                        if (isDefined(sub)) {
                            recur_(ds, sub);
                        }
                    }

                }

            }
        }
        recur_(this, this.mainData);



        const ptr = this;
        this.sortedData.sort(function (a,b) {
            const item_a = a.ptrArray[a.index]; // ptr.mainData[a];
            const item_b = b.ptrArray[b.index]; // ptr.mainData[b];
            const value_a = ptr.sortFieldForObject(item_a);
            const value_b = ptr.sortFieldForObject(item_b);
            if (typeof(value_a)==='string') {
                return value_a.localeCompare(value_b,undefined, { numeric: true });

            }
            return value_a - value_b;

        });



    }

    copy() {
        const ret = new DataSource();
        ret.arrayPath = this.arrayPath;
        ret.sortFieldForObject = this.sortFieldForObject;
        //ret.showAddOption = this.showAddOption;
        //ret.showMoreOptions = this.showMoreOptions;

        ret.initWithDataString(this.dataString);
        return ret;
    }

    deepCopy() {
        const ret = new DataSource();
        //ret.showAddOption = this.showAddOption;
        //ret.showMoreOptions = this.showMoreOptions;
        ret.arrayPath = this.arrayPath;
        ret.sortFieldForObject = this.sortFieldForObject;
        ret.filterForObject = this.filterForObject;
        ret.groupByForSortedIndex = this.groupByForSortedIndex;
        ret.initWithDataString(this.dataString);
        ret.mainData = JSON.parse(JSON.stringify(this.mainData));
        ret.reindex();
        return ret;
    }


}
