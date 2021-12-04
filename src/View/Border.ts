import {BorderSide} from "./BorderSide";
import {assert} from "../Utils/assert";


export class Border {
    active: boolean = false;
    thickness: number = 1;
    pattern: string = "solid";
    value: string = "rgba(0,0,0,1.0)";
    side: BorderSide = BorderSide.all;

    constructor (_active: boolean, _thickness: number, _pattern: string, _value : string, _side: BorderSide = BorderSide.all) {
        assert(typeof _active === "boolean", "border.active must be set.");
        assert(typeof _thickness === "number", "border.thickness must be set.");
        assert(typeof _pattern === "string", "border.pattern must be set.");
        assert(typeof _value === "string", "border.value must be set.");
        assert(typeof _side === "number", "border.side must be set.");
        this.active = _active;
        this.thickness = _thickness;
        this.pattern = _pattern;
        this.value = _value;
        this.side = _side;
    }

}

