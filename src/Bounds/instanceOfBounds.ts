import {Bounds} from "./Bounds";
import {isDefined} from "../Utils/isDefined";



export function instanceOfBounds(object: any): object is Bounds {
    return isDefined(object) && object.kind === "Bounds";
}