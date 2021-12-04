
import {GradientStep} from "../Color/GradientStep";
import {isDefined} from "../Utils/isDefined";



declare function instanceOfColor(c);

export function instanceOfGradientStep(object: any): object is GradientStep {
    return isDefined(object) &&
        typeof object.id === "string" &&
        isDefined(object.color) &&
        instanceOfColor(object.color) &&
        typeof object.percentage === "number";
}
