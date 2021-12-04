import {Color} from "../Color/Color";
import {isDefined} from "../Utils/isDefined";
import {instanceOfColorData} from "./instanceOfColorData";
import {instanceOfGradientData} from "./instanceOfGradientData";


export function instanceOfColor(object: any): object is Color {
    return isDefined(object) &&
        isDefined(object.type) &&
        ["color", "gradient"].includes(object.type) &&
        instanceOfColorData(object.colorData) &&
        instanceOfGradientData(object.gradientData);
}



