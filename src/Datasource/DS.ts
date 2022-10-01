import {DSAdaptor} from "./DSAdaptor";
import {View} from "../View/View";
import {DataSourceDelegate} from "./DataSourceDelegate";
import {DataRequest} from "./DataRequest";


export enum kDataSourceType {
    json = 0,
    request = 1,
    custom = 2
}

export interface DataSourceBind {
    bindDataSourceUpdated(ds: DataSource);
    bindDataSource(ds: DataSource);
}




export class DataSource implements DataSourceDelegate {
    kind: "DataSource";

    dataSourceID: string = "";

    adaptor: DSAdaptor;

    paged: boolean = false;
    currentPage: number = 1;
    offset: number = 0;
    limit: number = undefined;

    last_request_id: string;
    currentRequest: DataRequest;
    lastRequest: DataRequest;

    private binds: { type: "View" | "ViewProperty", view: View, property_id?: string, key?: string}[] = [];

    delegate?: DataSourceDelegate;

    constructor(adaptor: DSAdaptor) {
        this.adaptor = adaptor;
        this.adaptor.dataSource = this;
    }

    firstPage(): void {
        this.currentPage = 1;
        this.offset = this._calcOffsetWithPage(this.currentPage);
        this.run();
    }
    nextPage(): void {
        if (this.limit !== undefined) {
            this.currentPage++;
            if (this.currentPage > Math.ceil(this.adaptor.getTotalRows() / this.limit) + 1) {
                this.currentPage = Math.ceil(this.adaptor.getTotalRows() / this.limit) + 1;
            }
        } else {
            this.currentPage = 1;
        }
        this.offset = this._calcOffsetWithPage(this.currentPage);
        this.run();
    }
    previousPage(): void {
        if (this.limit !== undefined) {
            this.currentPage--;
            if (this.currentPage > Math.ceil(this.adaptor.getTotalRows() / this.limit) + 1) {
                this.currentPage = Math.ceil(this.adaptor.getTotalRows() / this.limit) + 1;
            }
            if (this.currentPage < 1) {
                this.currentPage = 1;
            }
        } else {
            this.currentPage = 1;
        }
        this.offset = this._calcOffsetWithPage(this.currentPage);
        this.run();
    }
    lastPage(): void {
        if (this.limit !== undefined) {
            this.currentPage = this.numberOfPages();
        } else {
            this.currentPage = 1;
        }
        this.offset = this._calcOffsetWithPage(this.currentPage);
        this.run();
    }

    jumpTo(page1Based: number) {
        if (page1Based < 1) {
            page1Based = 1;
        } else if (page1Based > this.numberOfPages()) {
            page1Based = this.numberOfPages();
        }
        this.currentPage = page1Based;
        this.offset = this._calcOffsetWithPage(this.currentPage);
        this.run();
    }

    numberOfPages(): number {
        if (this.limit === undefined) {
            return 1;
        }
        return Math.ceil(this.adaptor.getTotalRows() / this.limit);
    }
    private _calcOffsetWithPage(page1Based: number) {
        if (this.limit === undefined) { return 0; }
        return page1Based * this.limit - this.limit;
    }

    totalNumberOfRows(): number {
        return this.adaptor.getTotalRows();
    }

    numberOfItems(): number {
        if (this.paged === true && this.limit !== undefined) {
            let dif = this.adaptor.getTotalRows() - this.offset;
            if (dif > this.limit) {
                dif = this.limit;
            }
            return dif;
        } else {
            return this.adaptor.getTotalRows();
        }
    }

    objectForSortedIndex(index0Based: number): any {
        return this.adaptor.getObjectAtIndex(index0Based);
    }

    getRow(): any {
        return this.adaptor.getCurrentRow();
    }
    valueForKey(key: string): any {
        return this.adaptor.getKeyValue(key);
    }
    valueForGroupBy(): any {
        return this.adaptor.getGroupKeyValue();
    }

    bindViewProperty(view: View, property_id: string, key: string) {
        this.binds.push({type: "ViewProperty", view: view, property_id: property_id, key: key});
    }

    bindView(view: View & DataSourceBind) {
        this.binds.push({type: "View", view: view});
        view.bindDataSource(this);
    }
    clearBinds() {
        for (let i = 0; i < this.binds.length; i++) {
            let b = this.binds[i];
            if (b.view !== undefined) {
            }
        }
    }

    run() {
        this.currentRequest = {
            limit: this.limit,
            offset: this.offset,
            id: "0",
            last_request_id: "-1",
            page: 1,
            order_by: "",
            performance_RequestA: -1
        }
        this.adaptor.go(this.currentRequest);
    }

    scanStart() {
        this.adaptor.readFirst();
    }
    scanNext() {
        this.adaptor.readNext();
    }
    eof(): boolean {
        return this.adaptor.eof();
    }
    dataSourceFailed(dataSource: DataSource, request: DataRequest, data: string) {
        if (this.delegate !== undefined && this.delegate.dataSourceFailed !== undefined) {
            this.delegate.dataSourceFailed(this, request, data);
        }
    }

    dataSourceUpdatedViews(dataSource: DataSource, request: DataRequest) {
        if (this.delegate !== undefined && this.delegate.dataSourceUpdatedViews !== undefined) {
            this.delegate.dataSourceUpdatedViews(this, request);
        }
    }
    dataSourceWasRefreshed(dataSource: DataSource, request: DataRequest) {
        for (let i = 0; i < this.binds.length; i++) {
            if (this.binds[i].type === "View") {
                (this.binds[i].view as View & DataSourceBind).bindDataSourceUpdated(this);
            }
        }
        if (this.delegate !== undefined && this.delegate.dataSourceWasRefreshed !== undefined) {
            this.delegate.dataSourceWasRefreshed(this, request);
        }
    }


}