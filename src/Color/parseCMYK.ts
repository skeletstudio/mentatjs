



export function parseCMYK(cmykString: string): {mode: string, cyan: number, magenta: number, yellow: number, blackKey: number, alpha: number, stringValue: string} {
    let bracketStart = cmykString.indexOf('(');
    let bracketEnd = cmykString.indexOf(')',bracketStart);
    let commaString = cmykString.substr(bracketStart +1, bracketEnd - (bracketStart + 1));
    let commaArray = commaString.split(',');
    let c = parseInt(commaArray[0].replace('%',''));
    let m = parseInt(commaArray[1].replace('%',''));
    let y = parseInt(commaArray[2].replace('%',''));
    let k = parseInt(commaArray[3].replace('%', ''));
    let a = (commaArray.length === 5) ? parseFloat(commaArray[4]) : 1.0;

    return {
        mode: 'cmyka',
        cyan: c,
        magenta: m,
        yellow: y,
        blackKey: k,
        alpha: a,
        stringValue: `device-cmyk(${c}%,${m}%,${y}%,${k}%,${a})`
    };
}
