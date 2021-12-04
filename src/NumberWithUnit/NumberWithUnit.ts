import {isDefined} from "../Utils/isDefined";

export var DPI: number = 96.0;


export class NumberWithUnit {
    amount: number;
    unit: string;

    constructor (amount: number, unit: string) {
        if (amount === undefined) {
            throw "NumberWithUnit called without a value";
        }
        this.amount = amount;
        this.unit = unit;
    }
}


export function px(a: number): NumberWithUnit {
    return new NumberWithUnit(a, "px");
}

export function pt(a: number): NumberWithUnit {
    return new NumberWithUnit(a, "pt");
}

export function cm(a: number): NumberWithUnit {
    return new NumberWithUnit(a, "cm");
}
export function mm(a: number): NumberWithUnit {
    return new NumberWithUnit(a, "mm");
}

export function inch(a: number): NumberWithUnit {
    return new NumberWithUnit(a, "in");
}


export function NUConvert(a: NumberWithUnit, unit: string) {
    switch (unit) {
        case "pt":
            return NUConvertToPoint(a);
        case "px":
            return NUConvertToPixel(a);
        case "cm":
            return NUConvertToCentimeters(a);
        case "mm":
            return NUConvertToMillimeters(a);
        case "in":
            return NUConvertToInch(a);
    }
    throw "Attempted to convert NumberWithUnit with relative unit";
}

export function NUConvertToInch(a: NumberWithUnit): NumberWithUnit {
    if (a.unit === "in") {
        return a;
    }
    if (a.unit === "pt") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 0.0138889).toFixed(2)), "in");
    }
    if (a.unit === "px") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) / DPI).toFixed(2)), "in");
    }
    if (a.unit === "cm") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 0.393701).toFixed(2)), "in");
    }
    if (a.unit === "mm") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 0.0393701).toFixed(2)), "in");
    }
    throw "Attempted to convert NumberWithUnit with relative unit";
}

export function NUConvertToMillimeters(a: NumberWithUnit): NumberWithUnit {
    if (a.unit === "mm") {
        return a;
    }
    if (a.unit === "cm") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 10.0).toFixed(2)), "mm");
    }
    if (a.unit === "pt") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 0.352778).toFixed(2)), "mm");
    }
    if (a.unit === "px") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * (2.54 / DPI) * 10).toFixed(2)), "mm");
    }
    if (a.unit === "in") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 25.4).toFixed(2)), "mm");
    }
    throw "Attempted to convert NumberWithUnit with relative unit";
}

export function NUConvertToCentimeters(a: NumberWithUnit): NumberWithUnit {
    if (a.unit === "cm") {
        return a;
    }
    if (a.unit === "pt") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 0.0352778).toFixed(2)), "cm");
    }
    if (a.unit === "px") {
        let am = parseFloat(a.amount.toString());
        let conv = (2.54 / DPI);
        return new NumberWithUnit(parseFloat((am * conv).toFixed(2)), "cm");
    }
    if (a.unit === "mm") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) / 10.0).toFixed(2)), "cm");
    }
    if (a.unit === "in") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 2.54).toFixed(2)), "cm");
    }
    throw "Attempted to convert NumberWithUnit with relative unit";
}

export function NUConvertToPoint(a: NumberWithUnit): NumberWithUnit {
    if (a.unit === "pt") {
        return a;
    }
    if (a.unit === "cm") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 28.3464566929).toFixed(2)), "pt");
    }
    if (a.unit === "mm") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 2.83464566929).toFixed(2)), "pt");
    }
    if (a.unit === "in") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * 28.3464566929 * 2.54).toFixed(2)), "pt");
    }
    if (a.unit === "px") {
        let amount = (parseFloat(a.amount.toString()) * 72 /  DPI).toFixed(2);
        return new NumberWithUnit(parseFloat(amount), "pt");

        //return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * (DPI / 100.0)).toFixed(2)), "pt");
    }
    throw "Attempted to convert NumberWithUnit with relative unit";
}

export function NUConvertToPixel(a: NumberWithUnit): NumberWithUnit {
    if (a.unit === "px") {
        return a;
    }
    if (a.unit === "cm") {
        return new NumberWithUnit(parseFloat((parseFloat(a.amount.toString()) * DPI/2.54).toFixed(2)), 'px');
    }
    if (a.unit === "mm") {
        return px(parseFloat((parseFloat(a.amount.toString()) * DPI/25.4).toFixed(2)));
    }
    if (a.unit === "in") {
        return px( parseFloat((parseFloat(a.amount.toString()) * DPI).toFixed(2)));
    }
    if (a.unit === "pt") {
        return px(parseFloat((a.amount / (72 / DPI)).toFixed(2)));
    }
    throw "Attempted to convert NumberWithUnit with relative unit";
}



export function NUAdd(a: NumberWithUnit, b: NumberWithUnit): NumberWithUnit {
    try {
        if (a.unit === b.unit) {
            return new NumberWithUnit(parseFloat((((a.amount === undefined) ? 0.0 : parseFloat(a.amount.toString())) + ((b.amount === undefined) ? 0.0 : parseFloat(b.amount.toString()))).toFixed(2)), a.unit);
        } else {
            let aValue = NUConvertToPoint(a);
            let bValue = NUConvertToPoint(b);
            return NUAdd(aValue, bValue);
        }
    } catch (e)
    {
        throw "Attempted to add two NumberWithUnit with different units";
    }

}

export function NUSub(a: NumberWithUnit, b: NumberWithUnit): NumberWithUnit {
    try {
        if (a.unit === b.unit) {
            return new NumberWithUnit(parseFloat((((a.amount === undefined) ? 0.0 : parseFloat(a.amount.toString())) - ((b.amount === undefined) ? 0.0 : parseFloat(b.amount.toString()))).toFixed(2)), a.unit);
        } else {
            let aValue = NUConvertToPoint(a);
            let bValue = NUConvertToPoint(b);
            return NUSub(aValue, bValue);
        }
    } catch (e)
    {
        throw "Attempted to add two NumberWithUnit with different units";
    }

}

export function NUscalarDiv( a: NumberWithUnit, scalar: number) : NumberWithUnit  {
    return new NumberWithUnit(a.amount / scalar, a.unit);
}


export function anyToNU(input: any): NumberWithUnit {

    if (input.amount !== undefined && input.unit !== undefined) {
        return new NumberWithUnit(parseFloat(input.amount.toFixed(2)), input.unit);
    } else if (input.unit !== undefined) {
        return new NumberWithUnit(0, input.unit);
    } else if (input.amount !== undefined) {
        return new NumberWithUnit(parseFloat(input.toFixed(2)), "px")
    } else if (!isDefined(input)) {
        return new NumberWithUnit(0, "auto");
    } else {
        return new NumberWithUnit(parseFloat(input.toFixed(2)), "px");
    }
}


export function instanceOfNumberWithUnit(object: any): object is NumberWithUnit {
    return isDefined(object) && typeof object.amount === "number" && typeof object.unit === "string";
}