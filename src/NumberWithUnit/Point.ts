import {IPoint} from "./IPoint";
import {instanceOfNumberWithUnit, NumberWithUnit} from "./NumberWithUnit";
import {assert} from "../Utils/assert";
import {instanceOfIPoint} from "../Guards/instanceOfIPoint";


export class Point {
    get description() {
        throw "Point is not serializable. use Point.toJSON";
    }

    private data: IPoint = undefined;

    constructor(x: NumberWithUnit, y: NumberWithUnit) {
        assert(instanceOfNumberWithUnit(x) && instanceOfNumberWithUnit(y), "Point constructor expects two NumberWithUnits");
        this.data = {
            x: new NumberWithUnit(x.amount, x.unit),
            y: new NumberWithUnit(y.amount, y.unit)
        } as IPoint;
    }

    static fromStruct(struct: IPoint): Point {
        assert(instanceOfIPoint(struct), "Point.fromStruct expects a valid IPoint");
        return new Point(struct.x, struct.y);
    }

    get x(): NumberWithUnit {
        return new NumberWithUnit(this.data.x.amount, this.data.x.unit);
    }
    get y(): NumberWithUnit {
        return new NumberWithUnit(this.data.y.amount, this.data.y.unit);
    }

    set(x: NumberWithUnit, y: NumberWithUnit) {
        assert(instanceOfNumberWithUnit(x) && instanceOfNumberWithUnit(y), "Point.set expects two NumberWithUnits")
        this.data.x = new NumberWithUnit(x.amount, x.unit);
        this.data.y = new NumberWithUnit(y.amount, y.unit);
    }

    copy(): Point {
        return Point.fromStruct(this.toJSON());
    }

    toJSON() {
        return {
            x: new NumberWithUnit(this.data.x.amount, this.data.x.unit),
            y: new NumberWithUnit(this.data.y.amount, this.data.y.unit)
        } as IPoint;
    }
}