import {DataSource} from "./DataSource";
import {DataRequest} from "./DataRequest";


export interface DataSourceDelegate {
    dataSourceFailed?(dataSource: DataSource, request: DataRequest, data: string): void;
    dataSourceIsDataValid?(dataSource: DataSource, request: DataRequest, json: any): boolean;
    dataSourceNumberOfTotalRows?(dataSource: DataSource, request: DataRequest, json: any): number;
    dataSourceURIForRequest(dataSource: DataSource, request: DataRequest): string;
    dataSourceMethodForRequest?(dataSource: DataSource, request: DataRequest): string;
    dataSourcePayloadForRequest(dataSource: DataSource, request: DataRequest): any;
    dataSourceWasRefreshed?(dataSource: DataSource, request: DataRequest): void;
    dataSourceNestedEntriesForPath?(dataSource: DataSource, json: any): any;
    dataSourceUpdatedViews?(dataSouce: DataSource, request: DataRequest): void;
}
