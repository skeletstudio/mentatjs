




export function rgb2cmyk(rgbString: string): { mode: string, cyan: number, magenta: number, yellow: number, blackKey: number, alpha: number, stringValue: string} {
    let bracketStart = rgbString.indexOf('(');
    let bracketEnd = rgbString.indexOf(')',bracketStart);
    let commaString = rgbString.substr(bracketStart +1, bracketEnd - bracketStart + 1);
    let commaArray = commaString.split(',');
    let r = parseFloat(commaArray[0]);
    let g = parseFloat(commaArray[1]);
    let b = parseFloat(commaArray[2]);
    let a = (commaArray.length === 4) ? parseFloat(commaArray[3]) : 1.0;

    let r1 = r / 255.0;
    let g1 = g / 255.0;
    let b1 = b / 255.0;

    let k = parseInt(   ((1 - Math.max(r1,g1,b1)) * 100).toString());
    let c = (k === 100) ? 0 : parseInt((((1 - r1 - k) / (1 - k)) * 100).toString());
    let m = (k === 100) ? 0 : parseInt((((1 - g1 - k) / (1 - k)) * 100).toString());
    let y = (k === 100) ? 0 : parseInt((((1 - b1 - k) / (1 - k)) * 100).toString());

    // console.log(`rgb2cmyk ${r},${g},${b} = ${c},${m},${y},${k}`);




    return { mode: 'cmyka', cyan: c, magenta: m, yellow: y, blackKey: k, alpha: a, stringValue: "device-cmyk(" + c + "%, " + m + "%, " + y + "%, " + k + "%, " + a + ")"};
}
