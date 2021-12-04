import {Anchors} from "../View/Anchors";
import {isDefined} from "../Utils/isDefined";


export function instanceOfAnchors(object: any): object is Anchors {
    if (!isDefined(object)) { return false;}
    return object.kind === 'Anchors';
}