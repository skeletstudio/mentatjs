


export function parseXYZ(labString: string): {mode: string, x: number, y: number, z: number, alpha: number, stringValue: string} {
    let bracketStart = labString.indexOf('(');
    let bracketEnd = labString.indexOf(')',bracketStart);
    let commaString = labString.substr(bracketStart +1, bracketEnd - bracketStart - 1);
    let commaArray = commaString.split(',');
    let x = parseFloat(commaArray[0]);
    let y = parseFloat(commaArray[1].trim());
    let z = parseFloat(commaArray[2].trim());
    let alpha = (commaArray.length === 4) ? parseFloat(commaArray[3]) : 1.0;

    return {
        mode: 'xyz',
        x: x,
        y: y,
        z: z,
        alpha: alpha,
        stringValue: `xyz(${x},${y},${z}%)`
    };

}
