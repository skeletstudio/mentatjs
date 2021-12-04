import {assert} from "../Utils/assert";
import {isDefined} from "../Utils/isDefined";


export class Fill {
    active: boolean = false;
    type: 'color' | 'gradient' | 'cssText' | string = "color";
    blendMode: string = "normal";
    value: string = "rgb(255,255,255)";

    constructor(_active: boolean, _type: string, _blendMode: string, _value: string) {
        const errorMessage = "Fill constructor called with wrong parameters";
        assert(isDefined(_active) && typeof _active === "boolean", errorMessage);
        assert(isDefined(_type) && typeof _type === "string", errorMessage);
        assert(isDefined(_blendMode) && typeof _blendMode === "string", errorMessage);
        assert(isDefined(_value) && typeof _value === "string", errorMessage);
        this.active = _active;
        this.type = _type;
        this.blendMode = _blendMode;
        this.value = _value;
    }
}

