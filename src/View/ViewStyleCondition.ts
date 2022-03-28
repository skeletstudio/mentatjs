import {OpResult} from "../Types/OpResult";


export interface ViewStyleCondition {
    property: string;
    op: OpResult;
    path?: string;
    value: boolean | number | string;
    fieldTargetForProperty?: string | number;
    triggerChildren?: '*' | string[];
}