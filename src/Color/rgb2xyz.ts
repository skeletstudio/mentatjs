import {parseRGB} from "./parseRGB";


export function rgb2xyz(rgbString: string): { mode: string, x: number, y: number, z: number, alpha: number, stringValue: string} {
    let rgb = parseRGB(rgbString);
    let r: number = pivotRgb(rgb.red / 255.0);
    let g: number = pivotRgb(rgb.green / 255.0);
    let b: number = pivotRgb(rgb.blue / 255.0);

    let x: number = r * 0.4124 + g * 0.3576 + b * 0.1805;
    let y: number = r * 0.2126 + g * 0.7152 + b * 0.0722;
    let z: number = r * 0.0193 + g * 0.1192 + b * 0.9505;

    // Observer. = 2°, Illuminant = D65
    return {
        mode: 'xyz',
        x: x,
        y: y,
        z: z,
        alpha: rgb.alpha,
        stringValue: `xyz(${x},${y},${z})`
    };
}


function pivotRgb(n: number): number {
    return (n > 0.04045 ? Math.pow((n + 0.055) / 1.055, 2.4) : n / 12.92) * 100;
}