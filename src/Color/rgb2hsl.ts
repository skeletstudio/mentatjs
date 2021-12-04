

export function rgb2hsl(rgbString: string): {mode: string, hue: number, saturation: number, lightness: number, alpha: number, stringValue: string} {
    let bracketStart = rgbString.indexOf('(');
    let bracketEnd = rgbString.indexOf(')',bracketStart);
    let commaString = rgbString.substr(bracketStart +1, bracketEnd - bracketStart - 1);
    let commaArray = commaString.split(',');
    let r = parseFloat(commaArray[0].trim()) / 255;
    let g = parseFloat(commaArray[1].trim()) / 255;
    let b = parseFloat(commaArray[2].trim()) / 255;
    let a = (commaArray.length === 4) ? parseFloat(commaArray[3]) : 1.0;

    let max = Math.max(r,g,b);
    let min = Math.min(r,g,b);

    let d = max - min;
    let h;
    if (d === 0) h = 0;
    else if (max === r) h = (g - b) / d % 6;
    else if (max === g) h = (b - r) / d + 2;
    else if (max === b) h = (r - g) / d + 4;
    let l = (min + max) / 2;
    let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

    h = parseInt((h * 60).toString());
    s = parseInt((s * 100).toString());
    l = parseInt((l * 100).toString());


    return { mode: 'hsla', hue: h, saturation: s, lightness: l, alpha: a, stringValue: "hsla(" + h + ", " + s + "%, " + l + "%, " + a + ")" };

}