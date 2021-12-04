import {isDefined} from "../Utils/isDefined";
import {assert} from "../Utils/assert";
import {instanceOfColor} from "../Guards/instanceOfColor";
import {instanceOfFill} from "../Guards/instanceOfFill";
import {Color} from "../Color/Color";
import {Fill} from "./Fill";

export class Shadow {
    active: boolean = false;
    offsetX: number = 0;
    offsetY: number = 0;
    blur: number = 0;
    spread: number = 0;
    color: any;
    isInset: boolean = false;

    constructor (active: boolean, offsetX: number, offsetY: number, blur: number, spread: number, color: string | Color | Fill, isInset: boolean) {
        const errorMessage = "Shadow constructor called with wrong parameters";
        assert(isDefined(active) && typeof active === "boolean", errorMessage);
        assert(isDefined(offsetX) && typeof offsetX === "number", errorMessage);
        assert(isDefined(offsetY) && typeof offsetY === "number", errorMessage);
        assert(isDefined(blur) && typeof blur === "number", errorMessage);
        assert(isDefined(spread) && typeof spread === "number", errorMessage);
        assert(isDefined(color) && (typeof color === "string" || instanceOfColor(color) || instanceOfFill(color)), errorMessage);
        assert(isDefined(isInset) && typeof isInset === "boolean", errorMessage);
        this.active = active;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.blur = blur;
        this.spread = spread;
        this.color = color;
        this.isInset = isInset;
    }

}

