



export function hsl2rgb(hslString: string): { mode: string, red: number, green: number, blue: number, alpha: number, stringValue: string } {
    let bracketStart = hslString.indexOf('(');
    let bracketEnd = hslString.indexOf(')',bracketStart);
    let commaString = hslString.substr(bracketStart +1, bracketEnd - bracketStart - 1);
    let commaArray = commaString.split(',');
    let h = parseInt(commaArray[0]);
    let s = parseInt(commaArray[1].trim().replace('%','')) / 100.0;
    let l = parseInt(commaArray[2].trim().replace('%','')) / 100.0;
    let a = (commaArray.length === 4) ? parseFloat(commaArray[3]) : 1.0;

    let c = (1 - Math.abs(2 * l - 1)) * s;
    let hp = h / 60.0;
    let x = c * (1 - Math.abs((hp % 2) - 1));
    let rgb1;
    if (isNaN(h)) rgb1 = [0, 0, 0];
    else if (hp <= 1) rgb1 = [c, x, 0];
    else if (hp <= 2) rgb1 = [x, c, 0];
    else if (hp <= 3) rgb1 = [0, c, x];
    else if (hp <= 4) rgb1 = [0, x, c];
    else if (hp <= 5) rgb1 = [x, 0, c];
    else if (hp <= 6) rgb1 = [c, 0, x];
    let m = l - c * 0.5;

    let r = Math.round(255 * (rgb1[0] + m));
    let g = Math.round(255 * (rgb1[1] + m));
    let b = Math.round(255 * (rgb1[2] + m));


    return { mode: 'rgba', red: r, green: g, blue: b, alpha: a, stringValue: "rgba(" + r + "," + g + "," + b + ", " + a + ")"};
}