import {assert} from "../Utils/assert";


export function readGradientStop(str: string) {
    assert(typeof str === "string", "readGradientStop expects a string as parameter.");
    let split = str.split(')');
    split[0] += ')';
    let color = split[0].trim();
    let percentage = split[1].trim().replace('%', '');
    return {
        color: color,
        percentage: parseInt(percentage)
    };
}
