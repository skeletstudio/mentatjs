import {Bounds} from "./Bounds";
import {PXBounds} from "./PXBounds";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";


export function boundsWithPixels( b: PXBounds): Bounds {
    return {
        kind: "Bounds",
        x: new NumberWithUnit(b.x, "px"),
        y: new NumberWithUnit(b.y, "px"),
        width: new NumberWithUnit(b.width, "px"),
        height: new NumberWithUnit(b.height, "px"),
        unit: 'px',
        position: ((b.position === undefined) ? "absolute" : b.position),
        rotation: ((b.rotation === undefined) ? (new NumberWithUnit(0, "deg")) : (new NumberWithUnit(b.rotation, "deg"))),
        elevation: ((b.elevation === undefined) ? (new NumberWithUnit(0, "auto")) : ( new NumberWithUnit(b.elevation, "px"))),
    }
}