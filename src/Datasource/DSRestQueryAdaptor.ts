import {DSAdaptor} from "./DSAdaptor";
import {DataRequest} from "./DataRequest";
import {Logging} from "../Utils/logging";
import {downloadDataWithDelegate, postDataWithDelegate} from "./download";
import {DataSourceRemoteDelegate} from "./DataSourceDelegate";
import {DataSource} from "./DS";

export interface DSRestQueryAdaptorOptions {
    totalRows: (json: any) => number;
    arrayPath: (json: any) => any[];
    dataSourcePayloadForRequest: (rq: DataRequest) => any;
}

export class DSRestQueryAdaptor implements DSAdaptor {
    kind: "DSAdaptor";
    dataSource: DataSource;
    options: DataSourceRemoteDelegate;
    data: any;
    groupKey: string = "";


    private cursor_index0Based: number = 0;
    private cursor_currentRow: any = undefined;
    private cursor_eof: boolean = true;

    constructor(options: DataSourceRemoteDelegate) {
        this.options = options;
    }
    link(dataSource: DataSource) {
        this.dataSource = dataSource;
    }
    getTotalRows(): number {
        if (this.options === undefined) { return 0;}
        return this.options.dataSourceNumberOfTotalRows(this.dataSource, this.dataSource.currentRequest, this.data)
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
        uri = this.options.dataSourceURIForRequest(this.dataSource, request);
        if (Logging.enableLogging) {
            Logging.log("uri is : " + uri);
        }
        payload = this.options.dataSourcePayloadForRequest(this.dataSource, request);
        if (Logging.enableLogging) {
            Logging.log("payload:");
            Logging.dir(payload);
        }

        if (this.options.dataSourceMethodForRequest !== undefined) {
            method = this.options.dataSourceMethodForRequest(this.dataSource, request);
        } else {
            method = "GET";
        }
        if (Logging.enableLogging) {
            Logging.log("method is : " + method);
        }
        this.dataSource.last_request_id = (this.dataSource.currentRequest !== undefined) ? this.dataSource.currentRequest.id : "";
        this.dataSource.lastRequest = this.dataSource.currentRequest;
        this.dataSource.currentRequest = request;

        const post_delegate = {
            dataSource: this.dataSource,
            processData: (dataID: string, data: string) => {
                const bGet = performance.now();
                if (Logging.enableLogging) {
                    Logging.log("DataSource.fetch GET exec " + (bGet - request.performance_RequestA) + " ms");
                }

                const json = JSON.parse(data);
                let valid = false;
                if (this.options.dataSourceIsDataValid !== undefined) {
                    valid = this.options.dataSourceIsDataValid(this.dataSource, request, json);
                } else {
                    if (json.valid !== undefined) {
                        valid = json.valid;
                    }
                }
                this.data = json;
                if (valid) {
                    this.dataSource.limit = this.dataSource.currentRequest.limit;
                    this.dataSource.dataSourceWasRefreshed(this.dataSource, this.dataSource.currentRequest);
                    if (Logging.enableLogging) {
                        Logging.log("DataSource.UpdateBindViews starts");
                    }
                    const aUpdateBindViews = performance.now();
                    this.dataSource.lastRequest = this.dataSource.currentRequest;
                    this.dataSource.dataSourceUpdatedViews(this.dataSource, this.dataSource.currentRequest);


                    const bUpdateBindViews = performance.now();
                    if (Logging.enableLogging) {
                        console.log("DataSource.UpdateBindViews exec " + (bUpdateBindViews - aUpdateBindViews) + " ms");
                    }



                } else {
                    this.dataSource.dataSourceFailed(this.dataSource, this.dataSource.currentRequest, this.data);
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

    go(request: DataRequest) {
        this._fetchRequest(request);
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

}