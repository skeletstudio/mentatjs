
import {ViewStyleCondition} from "./ViewStyleCondition";
import {Bounds} from "../Bounds/Bounds";
import {BorderRadius} from "./BorderRadius";
import {Fill} from "./Fill";
import {Border} from "./Border";
import {Shadow} from "./Shadow";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";


export class ViewStyle {
    kind: string = "ViewStyle";
    id?: string;
    state?: string;
    cond?: ViewStyleCondition[] = []
    children? : ViewStyle[];
    bounds?: Bounds;
    opacity?: number;
    blendingMode?: string;
    borderRadius?: BorderRadius;
    zIndex?: string;
    overflow?: string;
    overflowX?: string;
    overflowY?: string;
    cursor?: string;
    userSelect?: string;
    extraCss?: string;
    fills?: Fill[];
    borders?: Border[];
    shadows?: Shadow[];
    visible?: boolean;
    textStyle?: PropertyTextStyle = undefined;

    constructor() {
        this.textStyle = new PropertyTextStyle();
    }

}
