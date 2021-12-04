
import {anyToNU, NumberWithUnit, px} from "../NumberWithUnit/NumberWithUnit";
import {isDefined} from "../Utils/isDefined";


export class Bounds {
    kind: string = "Bounds";
    x?: NumberWithUnit;
    y?: NumberWithUnit;
    z?: NumberWithUnit;
    width?: NumberWithUnit;
    height?: NumberWithUnit;
    elevation?: NumberWithUnit;
    position?: string;
    unit?: string;

    rotation?: NumberWithUnit;
    rotationX? : NumberWithUnit;
    rotationY?: NumberWithUnit;
    rotationOriginX?: NumberWithUnit;
    rotationOriginY?: NumberWithUnit;

    scaleX?: NumberWithUnit;
    scaleY?: NumberWithUnit;
    skewX?: NumberWithUnit;
    skewY?: NumberWithUnit;

    minWidth?: NumberWithUnit;
    maxWidth?: NumberWithUnit;
    minHeight?: NumberWithUnit;
    maxHeight?: NumberWithUnit;

    constructor(_x: any, _y: any, _width: any, _height: any) {
        if (isDefined(_x)) {
            this.x = anyToNU(_x);
        } else {
            this.x = new NumberWithUnit(0, "auto");
        }
        if (isDefined(_y)) {
            this.y = anyToNU(_y);
        } else {
            this.y = new NumberWithUnit(0, "auto");
        }
        this.z = px(0);
        if (isDefined(_width)) {
            this.width = anyToNU(_width);
        } else {
            this.width = new NumberWithUnit(0, "auto");
        }
        if (isDefined(_height)) {
            this.height = anyToNU(_height);
        } else {
            this.height = new NumberWithUnit(0, "auto");
        }
        this.position = "absolute";
        this.unit = "px";
        this.rotation = new NumberWithUnit(0, "deg");
        this.elevation = new NumberWithUnit(0, "auto");

        this.rotationX = new NumberWithUnit(0, "deg");
        this.rotationY = new NumberWithUnit(0, "deg");

        this.rotationOriginX = new NumberWithUnit(50, "%");
        this.rotationOriginY = new NumberWithUnit(50, "%");

        this.minWidth = new NumberWithUnit(0, "auto");
        this.maxWidth = new NumberWithUnit(0, "auto");
        this.minHeight = new NumberWithUnit(0, "auto");
        this.maxHeight = new NumberWithUnit(0, "auto");

        this.scaleX = new NumberWithUnit(100, "%");
        this.scaleY = new NumberWithUnit(100, "%");

        this.skewX = new NumberWithUnit(0, "deg");
        this.skewY = new NumberWithUnit(0, "deg");

    }
}
