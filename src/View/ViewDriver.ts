
export interface ViewDriver
{
    id: string;
    draggable: "no" | "x" | "y" | "both";
    property: string;
    subProperty?: string;
    range: any[];
    keys: any[];
    value: any;
    easing: "linear";
    deps: {
        id: string;
        property: string;
        subProperty: string;
        keys: {key: any, value: any}[]
    }[]
}
