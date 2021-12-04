
import {parseLab} from "./parseLAB";
import {whiteD65} from "./whiteD65";
import {xyz2rgb} from "./xyz2rgb";


export function lab2rgb(lab: string): {mode: string, red: number, green: number, blue: number, alpha: number, stringValue: string} {
    let item = parseLab(lab);
    let y = (item.l + 16.0) / 116.0;
    let x = item.a / 500.0 + y;
    let z = y - item.b / 200.0;

    let white = whiteD65();
    let x3 = x * x * x;
    let z3 = z * z * z;

    let epsilon = 0.008856; // Intent is 216/24389
    let kappa = 903.3; // Intent is 24389/27

    let X = white.x * (x3 > epsilon ? x3 : (x - 16.0 / 116.0) / 7.787);
    let Y = white.y * (item.l > (kappa * epsilon) ? Math.pow(((item.l + 16.0) / 116.0), 3) : item.l / kappa);
    let Z = white.z * (z3 > epsilon ? z3 : (z - 16.0 / 116.0) / 7.787);

    return xyz2rgb(`xyz(${X},${Y},${Z})`);
}