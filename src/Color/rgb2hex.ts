import {Color} from "./Color";


export function rgb2hex(rgbString: string): string {

    let c = Color.fromString(rgbString);
    let sr = Color.rgba(c).r.toString(16);
    let sg = Color.rgba(c).g.toString(16);
    let sb = Color.rgba(c).b.toString(16);
    if (sr.length < 2) {
        sr = "0" + sr;
    }
    if (sg.length < 2) {
        sg = "0" + sg;
    }
    if (sb.length < 2) {
        sb = "0" + sb;
    }
    return "#" + sr + sg + sb;
}