




export function parseRGB(rgbString: string): {mode: string, red: number, green: number, blue: number, alpha: number, stringValue: string} {
    let bracketStart = rgbString.indexOf('(');
    let bracketEnd = rgbString.indexOf(')',bracketStart);
    let commaString = rgbString.substr(bracketStart +1, bracketEnd - bracketStart - 1);
    let commaArray = commaString.split(',');
    let r = parseFloat(commaArray[0].trim());
    let g = parseFloat(commaArray[1].trim());
    let b = parseFloat(commaArray[2].trim());
    let a = (commaArray.length === 4) ? parseFloat(commaArray[3]) : 1.0;

    return {
        mode: 'rgba',
        red: r,
        green: g,
        blue: b,
        alpha: a,
        stringValue: `rgba(${r},${g},${b},${a})`
    };
}