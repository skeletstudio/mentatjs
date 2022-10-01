import {DSAdaptor} from "./DSAdaptor";
import {DataSource} from "./DS";
import {DataRequest} from "./DataRequest";


export class DSJSONAdaptor implements DSAdaptor {
    kind: "DSAdaptor";
    dataSource: DataSource;
    data: any[];
    groupKey: string = "";

    private cursor_index0Based: number = 0;
    private cursor_currentRow: any = undefined;
    private cursor_eof: boolean = true;

    constructor(data: any[]) {
        this.data = data;
    }
    link(dataSource: DataSource) {
        this.dataSource = dataSource;
    }
    getTotalRows(): number {
        return (this.data !== undefined) ? this.data.length : 0;
    }
    getObjectAtIndex(index0Based: number): any {
        this.cursor_currentRow = undefined;
        this.cursor_eof = true;
        this.cursor_index0Based = index0Based;
        if (index0Based < 0) { return undefined};
        if (index0Based >= this.getTotalRows()) { return undefined; }
        this.cursor_eof = false;
        this.cursor_currentRow = this.data[index0Based];
        return this.data[index0Based];
    }

    getCurrentRow() {
        return this.cursor_currentRow;
    }

    getKeyValue(key: string): any | undefined {
        return (this.cursor_currentRow == undefined) ? undefined : this.cursor_currentRow[key];
    }
    setKeyForGroup(key: string) {
        this.groupKey = key;
    }
    getGroupKeyValue(): any | undefined {
        return (this.cursor_currentRow == undefined) ? undefined : this.cursor_currentRow[this.groupKey];
    }

    go(request: DataRequest) {
        if (this.dataSource !== undefined) {
            this.dataSource.dataSourceWasRefreshed(this.dataSource, request);
        }
    }
    readFirst(): any | undefined {
        let offset = this.dataSource.offset;
        return this.getObjectAtIndex(offset);
    }
    readNext(): any | undefined {
        this.cursor_index0Based++;
        if (this.dataSource.limit !== undefined && this.cursor_index0Based > this.dataSource.offset + this.dataSource.limit) {
            this.cursor_currentRow = undefined;
            this.cursor_eof = true;
            return undefined;
        }
        return this.getObjectAtIndex(this.cursor_index0Based);
    }
    eof(): boolean {
        return this.cursor_eof;
    }
}