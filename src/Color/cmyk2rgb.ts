



export function cmyk2rgb(cmykString: string): { mode: string, red: number, green: number, blue: number, alpha: number, stringValue: string} {
    let bracketStart = cmykString.indexOf('(');
    let bracketEnd = cmykString.indexOf(')',bracketStart);
    let commaString = cmykString.substr(bracketStart +1, bracketEnd - (bracketStart + 1));
    let commaArray = commaString.split(',');
    let c = parseInt(commaArray[0].replace('%','')) / 100.00;
    let m = parseInt(commaArray[1].replace('%','')) / 100.00;
    let y = parseInt(commaArray[2].replace('%','')) / 100.00;
    let k = parseInt(commaArray[3].replace('%', '')) / 100.00;

    //let r = Math.abs(Math.round(255 * (1-c) * (1-k)));
    //let g = Math.abs(Math.round(255 * (1-m) * (1-k)));
    //let b = Math.abs(Math.round(255 * (1-y) * (1-k)));

    let r = 1 - Math.min( 1, c * ( 1 - k ) + k );
    let g = 1 - Math.min( 1, m * ( 1 - k ) + k );
    let b = 1 - Math.min( 1, y * ( 1 - k ) + k );

    r = Math.round( r * 255 );
    g = Math.round( g * 255 );
    b = Math.round( b * 255 );
    //console.log(`cmyk2rgb ${r},${g},${b} <= ${c},${m},${y},${k}`);

    return { mode: 'rgba', red: r, green: g, blue: b, alpha: 1.0, stringValue: "rgb(" + r + "," + g + "," + b + ")"};
}
