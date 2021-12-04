import {GradientData} from "../Color/GradientData";
import {isDefined} from "../Utils/isDefined";
import {instanceOfGradientStep} from "./instanceOfGradientStep";

export function instanceOfGradientData(object: any): object is GradientData {
    return isDefined(object) &&
        (object.type === "linear" || object.type === "radial") &&
        typeof object.shape === "string" &&
        ["circle", "ellipse", "closest-side", "farthest-side", "closest-corner", "farthest-corner"].includes(object.shape) &&
        typeof object.originX === "number" &&
        typeof object.originY === "number" &&
        typeof object.directionAngle === "number" &&
        isDefined(object.steps) &&
        object.steps.reduce( (a, c) => { return instanceOfGradientStep(a) && c;}, true) === true;
}
