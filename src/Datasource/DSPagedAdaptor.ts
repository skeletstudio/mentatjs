import {DSAdaptor} from "./DSAdaptor";
import {DataSource} from "./DS";
import {DataRequest} from "./DataRequest";

export interface DSPagedAdaptorOptions {
    totalRows: (json: any) => number;
    arrayPath: (json: any) => any[];
    go: (offset: number, fetch: number, cb: (data: any) => void) => void;
}


export class DSPagedAdaptor implements DSAdaptor {
    kind: "DSAdaptor";
    dataSource: DataSource;
    options: DSPagedAdaptorOptions;
    data: any;
    groupKey: string = "";

    private cursor_index0Based: number = 0;
    private cursor_currentRow: any = undefined;
    private cursor_eof: boolean = true;

    private lastRequest: DataRequest;

    constructor(options: DSPagedAdaptorOptions) {
        this.options = options;
    }

    link(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    getTotalRows(): number {
        if (this.options === undefined) { return 0;}
        return this.options.totalRows(this.data);
    }

    getObjectAtIndex(index0Based: number): any {
        if (this.options === undefined) { return undefined;}
        let arr = this.options.arrayPath(this.data);
        if (index0Based < arr.length && index0Based >= 0) {
            return arr[index0Based];
        }
        return undefined;
    }

    go(request: DataRequest) {
        this.lastRequest = request;
        if (this.options === undefined) { return; }
        this.options.go(request.offset, request.limit, (data: any) => {
            this.data = data;
            this.dataSource.dataSourceUpdatedViews(this.dataSource, this.lastRequest);
            this.dataSource.dataSourceWasRefreshed(this.dataSource, this.lastRequest);
        })
    }

    readFirst(): any | undefined {
        this.cursor_index0Based = 0;
        this.cursor_eof = false;
        this.cursor_currentRow = this.getObjectAtIndex(this.cursor_index0Based);
        if (this.cursor_currentRow === undefined) {
            this.cursor_eof = true;
        }
        return this.cursor_currentRow;
    }
    readNext(): any | undefined {
        this.cursor_index0Based++;
        this.cursor_eof = false;
        this.cursor_currentRow = this.getObjectAtIndex(this.cursor_index0Based);
        if (this.cursor_currentRow === undefined) {
            this.cursor_eof = true;
        }
        return this.cursor_currentRow;
    }
    eof(): boolean {
        return this.cursor_eof;
    }

    getCurrentRow(): any {
        return this.cursor_currentRow;
    }

    getKeyValue(key: string): any | undefined {
        return (this.cursor_currentRow == undefined) ? undefined : this.cursor_currentRow[key];
    }
    setKeyForGroup(key: string) {
        this.groupKey = key;
    }
    getGroupKeyValue(): any {
        return (this.cursor_currentRow == undefined) ? undefined : this.cursor_currentRow[this.groupKey];
    }

}