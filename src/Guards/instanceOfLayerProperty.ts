import {LayerProperty} from "../View/layerProperty";

export function instanceOfLayerProperty(object: any): object is LayerProperty {
    return object.kind === 'LayerProperty';
}