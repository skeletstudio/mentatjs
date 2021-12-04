


export function whiteD65 ():  {mode: string, x: number, y: number, z: number, alpha: number, stringValue} {
    let X = 95.047;
    let Y = 100.000;
    let Z = 108.883;

    return {
        mode: 'xyz',
        x: X,
        y: Y,
        z: Z,
        alpha: 1.0,
        stringValue: `xyz(${X},${Y},${Z})`
    };

}