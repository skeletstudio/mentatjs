import {DataSource} from "./DS";
import {DataRequest} from "./DataRequest";


export interface DSAdaptor {
    kind: "DSAdaptor";
    dataSource: DataSource;

    groupKey: string;

    link(dataSource: DataSource);

    getTotalRows(): number;

    getObjectAtIndex(index0Based: number): any | undefined;

    readFirst(): any | undefined;
    readNext(): any | undefined;
    eof(): boolean;

    getCurrentRow(): any | undefined;
    getKeyValue(key: string): any | undefined;
    setKeyForGroup(key: string);
    getGroupKeyValue(): any | undefined;

    go(request: DataRequest);

}