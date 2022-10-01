import {DataSource} from "./DS";
import {DataRequest} from "./DataRequest";


export interface DataSourceRemoteDelegate {
    dataSourceIsDataValid?(dataSource: DataSource, request: DataRequest, json: any): boolean;
    dataSourceNumberOfTotalRows(dataSource: DataSource, request: DataRequest, json: any): number;
    dataSourceURIForRequest(dataSource: DataSource, request: DataRequest): string;
    dataSourceMethodForRequest(dataSource: DataSource, request: DataRequest): string;
    dataSourcePayloadForRequest(dataSource: DataSource, request: DataRequest): any;
    dataSourceNestedEntriesForPath?(dataSource: DataSource, json: any): any;
}


export interface DataSourceDelegate {
    dataSourceFailed?(dataSource: DataSource, request: DataRequest, data: string): void;
    dataSourceWasRefreshed?(dataSource: DataSource, request: DataRequest): void;
    dataSourceUpdatedViews?(dataSource: DataSource, request: DataRequest): void;
    //dataSourceObjectForSortedIndex(dataSource: DataSource, request: DataRequest, index0Based: number): any;
}
