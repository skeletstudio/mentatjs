



export function parseLab(labString: string): {mode: string, l: number, a: number, b: number, alpha: number, stringValue: string} {
    let bracketStart = labString.indexOf('(');
    let bracketEnd = labString.indexOf(')',bracketStart);
    let commaString = labString.substr(bracketStart +1, bracketEnd - bracketStart - 1);
    let commaArray = commaString.split(',');
    let l = parseFloat(commaArray[0]);
    let a = parseFloat(commaArray[1].trim().replace('%',''));
    let b = parseFloat(commaArray[2].trim().replace('%',''));
    let alpha = (commaArray.length === 4) ? parseFloat(commaArray[3]) : 1.0;

    return {
        mode: 'lab',
        l: l,
        a: a,
        b: b,
        alpha: alpha,
        stringValue: `lab(${l},${a},${b})`
    };

}