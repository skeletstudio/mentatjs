import {rgb2xyz} from "./rgb2xyz";


export function rgb2lab(rgbString: string): { mode: string, l: number, a: number, b: number, alpha: number, stringValue: string} {
    let xyz_conversion = rgb2xyz(rgbString);

    let REF_X = 95.047; // Observer= 2°, Illuminant= D65
    let REF_Y = 100.000;
    let REF_Z = 108.883;

    let x = pivotXyz(xyz_conversion.x / REF_X);
    let y = pivotXyz(xyz_conversion.y / REF_Y);
    let z = pivotXyz(xyz_conversion.z / REF_Z);

    let l = 116 * y - 16;
    let a = 500 * (x - y);
    let b = 200 * (y - z);

    return {
        mode: 'lab',
        l: l,
        a: a,
        b: b,
        alpha: xyz_conversion.alpha,
        stringValue: `lab(${l},${a},${b})`
    };

}


function pivotXyz(n: number): number {
    let i: number = Math.cbrt(n);
    return n > 0.008856 ? i : 7.787 * n + 16 / 116;
}


