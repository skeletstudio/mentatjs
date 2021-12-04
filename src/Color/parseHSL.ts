



export function parseHSL(hslString: string): {mode: string, hue: number, saturation: number, lightness: number, alpha: number, stringValue: string} {
    let bracketStart = hslString.indexOf('(');
    let bracketEnd = hslString.indexOf(')',bracketStart);
    let commaString = hslString.substr(bracketStart +1, bracketEnd - bracketStart - 1);
    let commaArray = commaString.split(',');
    let h = parseInt(commaArray[0]);
    let s = parseInt(commaArray[1].trim().replace('%',''));
    let l = parseInt(commaArray[2].trim().replace('%',''));
    let a = (commaArray.length === 4) ? parseFloat(commaArray[3]) : 1.0;

    return {
        mode: 'hsla',
        hue: h,
        saturation: s,
        lightness: l,
        alpha: a,
        stringValue: `hsla(${h},${s}%,${l}%,${a})`
    };
}