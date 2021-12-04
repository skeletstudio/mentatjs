import {anyToNU, NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";


export class Anchor {
    active: boolean;
    side: string;
    target: string;
    targetSide: string;
    constant: NumberWithUnit;

    constructor (active: boolean, side: string, target: string, targetSide: string, constant: any) {
        this.active = active;
        this.side = side;
        this.target = target;
        this.targetSide = targetSide;
        this.constant = anyToNU(constant);
    }
}
