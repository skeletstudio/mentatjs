import {Bounds} from "./Bounds";
import {View} from "../View/View";
import {isDefined} from "../Utils/isDefined";
import {NUConvertToPoint, NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";


export function convertBoundsToPT(b: Bounds, view: View): Bounds {
    let ret = new Bounds(0,0,0,0);
    let gb: {top:number, left: number, width: number, height: number} = undefined;
    if (!isDefined(b.x) || !isDefined(b.y) || !isDefined(b.width) || !isDefined(b.height) ||
        (isDefined(b.x) && b.x.unit === 'auto') || (isDefined(b.y) && b.y.unit === 'auto') || (isDefined(b.width) && b.width.unit === 'auto') || (isDefined(b.height) && b.height.unit === 'auto')) {
        gb = (view.getDiv() as HTMLElement).getBoundingClientRect();
    }
    if (!isDefined(b.x) || (isDefined(b.x) && b.x.unit === 'auto')) {
        ret.x = NUConvertToPoint(new NumberWithUnit(gb.left, "px"));
    } else {
        ret.x = NUConvertToPoint(b.x);
    }
    if (!isDefined(b.y) || (isDefined(b.y) && b.y.unit === 'auto')) {
        ret.y = NUConvertToPoint(new NumberWithUnit(gb.top, "px"));
    } else {
        ret.y = NUConvertToPoint(b.y);
    }
    if (!isDefined(b.width) || (isDefined(b.width) && b.width.unit === 'auto')) {
        ret.width = NUConvertToPoint(new NumberWithUnit(gb.width, "px"));
    } else {
        ret.width = NUConvertToPoint(b.width);
    }
    if (!isDefined(b.height) || (isDefined(b.height) && b.height.unit === 'auto')) {
        ret.height = NUConvertToPoint(new NumberWithUnit(gb.height, "px"));
    } else {
        ret.height = NUConvertToPoint(b.height);
    }
    if (!isDefined(b.rotation)) {
        ret.rotation = new NumberWithUnit(0, "deg");
    } else {
        ret.rotation = b.rotation;
    }
    if (!isDefined(b.elevation)) {
        ret.elevation = new NumberWithUnit(0, "auto");
    } else {
        ret.elevation = b.elevation;
    }
    ret.position = b.position;

    return ret;
}