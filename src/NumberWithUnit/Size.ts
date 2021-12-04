import {instanceOfNumberWithUnit, NumberWithUnit} from "./NumberWithUnit";
import {ISize} from "./ISize";
import {assert} from "../Utils/assert";
import {instanceOfISize} from "../Guards/instanceOfISize";


export class Size {
    width: NumberWithUnit = new NumberWithUnit(0, "px");
    height: NumberWithUnit = new NumberWithUnit(0, "px");
    constructor (width: NumberWithUnit, height: NumberWithUnit) {
        assert(instanceOfNumberWithUnit(width) && instanceOfNumberWithUnit(height), "Size constructor expects two NumberWithUnits");
        this.width = new NumberWithUnit(width.amount, width.unit);
        this.height = new NumberWithUnit(height.amount, height.unit);
    }

    static fromStruct(struct: ISize) {
        assert(instanceOfISize(struct), "Size.fromStruct expects a valid ISize");
        return new Size(struct.width, struct.height);
    }

    copy(): Size {
        return new Size(this.width, this.height);
    }
    toJSON(): ISize {
        return {
            width: new NumberWithUnit(this.width.amount, this.width.unit),
            height: new NumberWithUnit(this.height.amount, this.height.unit)
        } as ISize;
    }
}