import {BorderRadius} from "./BorderRadius";
import {Fill} from "./Fill";
import {Border} from "./Border";
import {Shadow} from "./Shadow";
import {LocalizedString} from "../LocalizedString/LocalizedString";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";


export class LayerProperty {
    kind: string = 'LayerProperty';
    id?: string = "";
    title: string = "";
    property_id: string;
    symbol_id?: string;
    symbol_node_id?: string;
    group: 'property' | 'style' | 'hidden_style' | 'delegate' | 'hidden_property' = 'property';
    type: 'bounds' | 'anchors' | 'string' | 'number' | 'boolean' | 'slider' | 'image' | 'resource' | 'radius' | 'dropdown' | 'fills' | 'borders' | 'shadows' |
        'localizedString' | 'TextStyle' | 'shapes' | 'color' | 'json' | 'dataSource' | 'symbolSelector' | 'function' | 'custom' = 'string';
    customType?: string;
    dataSource?: { dsID: string } | {id: string, text: string, [key:string]: any}[];
    value: string | boolean | number | BorderRadius | Fill | Border | Shadow | LocalizedString | PropertyTextStyle | any = "";
}


