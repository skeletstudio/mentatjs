import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";
import {assert} from "../Utils/assert";


export class BorderRadius {
    tl: NumberWithUnit = new NumberWithUnit(0, "px");
    tr: NumberWithUnit = new NumberWithUnit(0, "px");
    bl: NumberWithUnit = new NumberWithUnit(0, "px");
    br: NumberWithUnit = new NumberWithUnit(0, "px");

    constructor (_tl: number, _tr: number, _bl: number, _br: number) {
        assert(typeof _tl === "number", "BorderRadius.tl must be set.");
        assert(typeof _tr === "number", "BorderRadius.tr must be set.");
        assert(typeof _bl === "number", "BorderRadius.bl must be set.");
        assert(typeof _br === "number", "BorderRadius.br must be set.");

        this.tl = new NumberWithUnit(_tl, "px");
        this.tr = new NumberWithUnit(_tr, "px");
        this.bl = new NumberWithUnit(_bl, "px");
        this.br = new NumberWithUnit(_br, "px");
    }

}

