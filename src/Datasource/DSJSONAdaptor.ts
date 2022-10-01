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
    private fn_filter: (o: any) => boolean;
    constructor(data: any[], filter: (o: any) => boolean = undefined) {
        this.data = data;
        this.fn_filter = filter;
    }
    link(dataSource: DataSource) {
        this.dataSource = dataSource;
    }
    getTotalRows(): number {
        if (this.data === undefined) { return 0; }
        if (this.fn_filter === undefined) {
            return this.data.length;
        }
        let counter = 0;
        for (let i = 0; i < this.data.length; i++) {
            if (this.fn_filter(this.data[i])) { counter++;}
        }
        return counter;
    }
    getObjectAtIndex(index0Based: number): any {
        this.cursor_currentRow = undefined;
        this.cursor_eof = true;
        this.cursor_index0Based = index0Based;
        if (index0Based < 0) { return undefined};
        if (index0Based >= this.getTotalRows()) { return undefined; }
        this.cursor_eof = false;
        if (this.fn_filter === undefined) {
            this.cursor_currentRow = this.data[index0Based];
            return this.data[index0Based];
        } else {
            let counter = -1;
            for (let i = 0; i < this.data.length; i++) {
                if (this.fn_filter(this.data[i])) { counter++;}
                if (counter === index0Based) {
                    this.cursor_currentRow = this.data[index0Based];
                    return this.data[index0Based];
                }
            }
        }
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
        if (this.fn_filter === undefined) {
            this.cursor_index0Based++;
            if (this.dataSource.limit !== undefined && this.cursor_index0Based > this.dataSource.offset + this.dataSource.limit) {
                this.cursor_currentRow = undefined;
                this.cursor_eof = true;
                return undefined;
            }
            return this.getObjectAtIndex(this.cursor_index0Based);
        } else {
            while (1) {
                this.cursor_index0Based++;
                if (this.cursor_index0Based > this.data.length -1) {
                    this.cursor_eof = true;
                    this.cursor_currentRow = undefined;
                    return undefined;
                }
                if (this.fn_filter(this.data[this.cursor_index0Based])) {
                    this.cursor_currentRow = this.data[this.cursor_index0Based];
                    this.cursor_eof = false;
                    return this.cursor_currentRow;
                }
            }
        }
    }
    eof(): boolean {
        return this.cursor_eof;
    }
}