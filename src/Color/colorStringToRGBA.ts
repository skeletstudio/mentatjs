import {hsl2rgb} from "./hsl2rgb";
import {rgb2hsl} from "./rgb2hsl";
import {cmyk2rgb} from "./cmyk2rgb";


export function colorStringToRGBA(str: string) {
    let ret = { red: 255, green: 255, blue: 255, alpha: 1.0 };
    if (str.startsWith('hsl')) {
        let conversion = hsl2rgb(str);
        ret.red = conversion.red;
        ret.green = conversion.green;
        ret.blue = conversion.blue;
        ret.alpha = conversion.alpha;
    }
    if (str.startsWith('rgb')) {
        let conversion = hsl2rgb(rgb2hsl(str).stringValue);
        ret.red = conversion.red;
        ret.green = conversion.green;
        ret.blue = conversion.blue;
        ret.alpha = conversion.alpha;

    }
    if (str.startsWith('device-cmyk')) {
        let conversion = cmyk2rgb(str);
        ret.red = conversion.red;
        ret.green = conversion.green;
        ret.blue = conversion.blue;
        ret.alpha = conversion.alpha;
    }
    return ret;
}