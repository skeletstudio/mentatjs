import {parseXYZ} from "./parseXYZ";
import {Logging} from "../Utils/logging";


export function xyz2rgb(xyz: string): {mode: string, red: number, green: number, blue: number, alpha: number, stringValue: string} {
    let item = parseXYZ(xyz);

    let x = item.x / 100.0;
    let y = item.y / 100.0;
    let z = item.z / 100.0;

    let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
    let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
    let b = x * 0.0557 + y * -0.2040 + z * 1.0570;

    r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
    g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
    b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

    r = r * 255;
    g = g * 255;
    b = b * 255;

    let outside = false;
    if (r < 0) {
        r = 0;
        outside = true;
    }
    if (r > 255) {
        r = 255;
        outside = true;
    }
    if (g < 0) {
        g = 0;
        outside = true;
    }
    if (g > 255) {
        g = 255;
        outside = true;
    }
    if (b < 0) {
        b = 0;
        outside = true;
    }
    if (b > 255) {
        b = 255;
        outside = true;
    }
    if (outside) {
        Logging.warn(`Color ${xyz} was approximated to rgba(${r},${g},${b},1.0)`);

    }

    return {
        mode: 'rgba',
        red: r,
        green: g,
        blue: b,
        alpha: 1.0,
        stringValue: `rgba(${r},${g},${b},1.0)`
    };
}