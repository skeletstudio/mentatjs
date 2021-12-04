import {ColorData} from "./ColorData";
import {GradientData} from "./GradientData";
import {parseRGB} from "./parseRGB";
import {rgb2hsl} from "./rgb2hsl";
import {rgb2cmyk} from "./rgb2cmyk";
import {rgb2xyz} from "./rgb2xyz";
import {rgb2lab} from "./rgb2lab";
import {parseHSL} from "./parseHSL";
import {hsl2rgb} from "./hsl2rgb";
import {parseCMYK} from "./parseCMYK";
import {cmyk2rgb} from "./cmyk2rgb";
import {parseXYZ} from "./parseXYZ";
import {xyz2rgb} from "./xyz2rgb";
import {parseLab} from "./parseLAB";
import {lab2rgb} from "./lab2rgb";
import {splitGradientString} from "./splitGradientString";
import {readGradientStop} from "./readGradientStop";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {isDefined} from "../Utils/isDefined";
import {assert} from "../Utils/assert";
import {Logging} from "../Utils/logging";


export class Color {
    type: 'color' | 'gradient' = 'color';
    value: string = '';
    colorData: ColorData = { mode: 'rgba', alpha: 1.0, red: 255, green: 255, blue: 255, cyan: 0, magenta: 0, yellow: 0, key: 0, hue: 0, saturation: 0, lightness: 0, l: 0, a: 0, b: 0, x: 0, y: 0, z: 0};
    gradientData: GradientData = { type: 'linear', shape: 'ellipse', originX: 0, originY: 0, directionAngle: 0, steps: []};


    static whiteD65 (): {mode: string, x: number, y: number, z: number, alpha: number, stringValue} {
        let X = 95.047;
        let Y = 100.000;
        let Z = 108.883;

        return {
            mode: 'xyz',
            x: X,
            y: Y,
            z: Z,
            alpha: 1.0,
            stringValue: `xyz(${X},${Y},${Z})`
        };

    }

    static updateColor(c: Color, fieldUpdated: 'type' | 'mode' | 'alpha' | 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow' | 'key' | 'hue' | 'saturation' | 'lightness') {
        let str = '';
        if (fieldUpdated !== 'type') {
            if (['red', 'green', 'blue'].includes(fieldUpdated)) {
                str = 'rgba(' + c.colorData.red + ', ' + c.colorData.green + ', ' + c.colorData.blue + ', ' + c.colorData.alpha + ')';
            } else if (['cyan', 'magenta', 'yellow', 'key'].includes(fieldUpdated)) {
                str = 'device-cmyk(' + c.colorData.cyan + '%, ' + c.colorData.magenta + '%, ' + c.colorData.yellow + '%, ' + c.colorData.key + '%, ' + c.colorData.alpha + ')';
            } else if (['hue', 'saturation', 'lightness'].includes(fieldUpdated)) {
                str = 'hsla(' + c.colorData.hue + ', ' + c.colorData.saturation + '%, ' + c.colorData.lightness + '%, ' + c.colorData.alpha + ')';
            } else {
                if (c.colorData.mode === 'rgba') {
                    str = 'rgba(' + c.colorData.red + ', ' + c.colorData.green + ', ' + c.colorData.blue + ', ' + c.colorData.alpha + ')';
                } else if (c.colorData.mode === 'cmyka') {
                    str = 'device-cmyk(' + c.colorData.cyan + '%, ' + c.colorData.magenta + '%, ' + c.colorData.yellow + '%, ' + c.colorData.key + '%, ' + c.colorData.alpha + ')';
                } else {
                    str = 'hsla(' + c.colorData.hue + ', ' + c.colorData.saturation + '%, ' + c.colorData.lightness + '%, ' + c.colorData.alpha + ')';
                }
            }
            //console.log(str);
            if (Color.processColor(c, str)) {
                c.value = str;
            } else {
                Logging.warn("could not parse color " + str);
            }
        } else {
            if (c.type === 'gradient') {
                c.value = Color.gradient(c.gradientData);
            } else {
                Color.updateColor(c, "alpha");
            }
        }

    }

    static processColor(c: Color, str: string): boolean {
        let mode: 'rgba' | 'cmyka' | 'hsla' | 'xyz' | 'lab';
        let hsl_conversion: { mode: string, hue: number, saturation: number, lightness: number, alpha: number, stringValue: string};
        let rgb_conversion: { mode: string, red: number, green: number, blue: number, alpha: number, stringValue: string};
        let cmyk_conversion: {mode: string, cyan: number, magenta: number, yellow: number, blackKey: number, alpha: number, stringValue: string};
        let xyz_conversion: {mode: string, x: number, y: number, z: number, alpha: number, stringValue: string};
        let lab_conversion: {mode: string, l: number, a: number, b: number, alpha: number, stringValue: string};

        if (!str.trim().endsWith(')')) {
            return false;
        }
        if (str.startsWith('rgb')) {
            mode = 'rgba';
            rgb_conversion = parseRGB(str);
            hsl_conversion = rgb2hsl(rgb_conversion.stringValue);
            cmyk_conversion = rgb2cmyk(rgb_conversion.stringValue);
            xyz_conversion = rgb2xyz(rgb_conversion.stringValue);
            lab_conversion = rgb2lab(rgb_conversion.stringValue);

        } else if (str.startsWith('hsl')) {
            mode = 'hsla';
            hsl_conversion = parseHSL(str);
            rgb_conversion = hsl2rgb(hsl_conversion.stringValue);
            cmyk_conversion = rgb2cmyk(rgb_conversion.stringValue);
            xyz_conversion = rgb2xyz(rgb_conversion.stringValue);
            lab_conversion = rgb2lab(rgb_conversion.stringValue);
        } else if (str.startsWith('device-cmyk')) {
            mode = 'cmyka';
            cmyk_conversion = parseCMYK(str);
            rgb_conversion = cmyk2rgb(cmyk_conversion.stringValue);
            hsl_conversion = rgb2hsl(rgb_conversion.stringValue);
            xyz_conversion = rgb2xyz(rgb_conversion.stringValue);
            lab_conversion = rgb2lab(rgb_conversion.stringValue);
        } else if (str.startsWith('xyz')) {
            mode = 'xyz';
            xyz_conversion = parseXYZ(str);
            rgb_conversion = xyz2rgb(xyz_conversion.stringValue);
            hsl_conversion = rgb2hsl(rgb_conversion.stringValue);
            lab_conversion = rgb2lab(rgb_conversion.stringValue);
        } else if (str.startsWith('lab')) {
            mode = 'lab';
            lab_conversion = parseLab(str);
            rgb_conversion = lab2rgb(lab_conversion.stringValue);
            cmyk_conversion = rgb2cmyk(rgb_conversion.stringValue);
            hsl_conversion = rgb2hsl(rgb_conversion.stringValue);
            xyz_conversion = rgb2xyz(rgb_conversion.stringValue);

        } else {
            return false;
        }
        c.value = str;
        c.type = 'color';
        c.colorData = {
            mode: mode,
            alpha: rgb_conversion.alpha,
            red: rgb_conversion.red,
            green: rgb_conversion.green,
            blue: rgb_conversion.blue,

            cyan: cmyk_conversion.cyan,
            magenta: cmyk_conversion.magenta,
            yellow: cmyk_conversion.yellow,
            key: cmyk_conversion.blackKey,

            hue: hsl_conversion.hue,
            saturation: hsl_conversion.saturation,
            lightness: hsl_conversion.lightness,

            x: xyz_conversion.x,
            y: xyz_conversion.y,
            z: xyz_conversion.z,

            l: lab_conversion.l,
            a: lab_conversion.a,
            b: lab_conversion.b

        };
        return true;
    }

    static processGradient(c: Color, str: string): boolean {
        c.gradientData.directionAngle = 0;
        c.gradientData.steps = [];
        c.gradientData.originY = 50;
        c.gradientData.originX = 50;
        c.gradientData.shape = 'ellipse';
        c.value = str;
        if (!str.trim().endsWith(')')) {
            return false;
        }

        if (str.startsWith('linear')) {
            c.gradientData.type = 'linear';
            c.gradientData.directionAngle = 0;
            c.gradientData.steps = [];
            let idx = 'linear-gradient('.length;

            let sub = str.substr(idx, str.length - idx - 1);
            let array: string[] = splitGradientString(sub);
            if (array[0].indexOf('deg')) {
                let sAngle = array[0].trim().replace('deg', '');
                c.gradientData.directionAngle = parseInt(sAngle);
                idx = 1;
            } else {
                idx = 0;
            }
            for (let i = idx; i < array.length; i += 1 ) {
                let colorPercentage = readGradientStop(array[i]);
                c.gradientData.steps.push({
                    id: generateV4UUID(),
                    color: new Color('color', colorPercentage.color),
                    percentage: colorPercentage.percentage
                });

            }
            return true;
        } else if (str.startsWith('radial')) {
            c.gradientData.type = 'radial';
            c.gradientData.directionAngle = 0;
            c.gradientData.steps = [];
            let idx = 'radial-gradient('.length;
            let sub = str.substr(idx, str.length - idx - 1);
            let array: string[] = splitGradientString(sub);
            // find the start of steps
            let startOfColors = 0;
            let shape = 'ellipse';
            let originX: number = 50;
            let originY: number = 50;
            if (['circle', 'ellipse'].includes(array[0].toLowerCase())) {

                shape = array[0].toLowerCase();
                startOfColors = 1;
            } else {
                if (array[0].indexOf('closest-side') > -1) {
                    shape = 'closest-side';
                } else if (array[0].indexOf('farthest-side') > -1) {
                    shape = 'farthest-side';
                } else if (array[0].indexOf('closest-corner') > -1) {
                    shape = 'closest-corner';
                } else if (array[0].indexOf('farthest-corner') > -1) {
                    shape = 'farthest-corner';
                } else {
                    shape = 'ellipse';
                }
                if (shape !== 'ellipse') {
                    let at = array[0].split('at ');
                    if (at.length === 2) {
                        let percentages = at[1].split('%');
                        if (percentages.length >= 2) {
                            originX = parseInt(percentages[0]);
                            originY = parseInt(percentages[1]);
                        } else {
                            originX = 50;
                            originY = 50;
                        }

                    }
                }

                startOfColors = 1;
            }
            // @ts-ignore
            c.gradientData.shape = shape;
            c.gradientData.originX = originX;
            c.gradientData.originY = originY;

            for (let i = startOfColors; i < array.length; i += 1 ) {
                let colorPercentage = readGradientStop(array[i]);
                c.gradientData.steps.push({
                    id: generateV4UUID(),
                    color: new Color('color', colorPercentage.color),
                    percentage: colorPercentage.percentage
                });

            }

            return true;

        } else {
            return false;
        }
    }


    static fromString(str: string): Color {
        let ret: Color = new Color('color', '');
        if (str.startsWith('rgb') || str.startsWith('device-cmyk') || str.startsWith('hsl') || str.startsWith('lab') || str.startsWith('xyz')) {
            ret.type = 'color';
            Color.processColor(ret, str);
        }
        if (str.startsWith('linear') || str.startsWith('radial')) {
            ret.type = 'gradient';
            Color.processGradient(ret, str);
        }

        return ret;
    }


    constructor (type: 'color' | 'gradient', value: string) {
        assert(isDefined(type) && (type === "color" || type === "gradient") && typeof value === "string", "Color constructor expects two strings");
        this.type = type;
        this.value = value;
        if (type === 'color' && value !== "") {
            Color.processColor(this, value);
        }
        if (type === 'gradient' && value !== "") {
            Color.processGradient(this, value);
        }
    }


    static rgba(c: Color): {r: number, g: number, b: number, a: number,  stringValue: string} {
        let ret: { r: number, g: number, b: number, a: number,  stringValue: string} = {r:255, g: 255, b: 255, a: 1.0, stringValue: 'rgba(255,255,255,1.0)'};
        ret.r = c.colorData.red;
        ret.g = c.colorData.green;
        ret.b = c.colorData.blue;
        ret.a = c.colorData.alpha;
        ret.stringValue = "rgba(" + ret.r + ", " + ret.g + ", " + ret.b + ", " + ret.a + ")";
        return ret;
    }

    static cmyka(c: Color):  {c: number, m: number, y: number, k: number, a: number, stringValue: string} {
        let ret: {c: number, m: number, y: number, k: number, a: number, stringValue: string} = {c:0,m:0,y:0,k:0,a:0,stringValue:''};
        ret.c = c.colorData.cyan;
        ret.m = c.colorData.magenta;
        ret.y = c.colorData.yellow;
        ret.k = c.colorData.key;
        ret.stringValue = "device-cmyk(" + ret.c + "%, " + ret.m + "%, " + ret.y + "%, " + ret.k + "%, " + ret.a + ")";
        return ret;
    }

    static hsla(c: Color): {h:number, s: number, l: number, a: number, stringValue: string} {
        let ret: {h:number, s: number, l: number, a: number, stringValue: string} = { h: 0, s: 0, l: 0, a: 1.0, stringValue: 'hsla(0,0%,0%,1.0)'};
        ret.h = c.colorData.hue;
        ret.s = c.colorData.saturation;
        ret.l = c.colorData.lightness;
        ret.a = c.colorData.alpha;
        ret.stringValue = "hsla(" + ret.h + ", " + ret.s + "%, " + ret.l + "%, " + ret.a + ")";
        return ret;
    }

    static gradient(c: GradientData): string {
        let gradient: string = c.type + "-gradient(";
        if (c.type === 'linear') {
            gradient += c.directionAngle + "deg";
            gradient += ", ";
        }
        if (c.type === 'radial') {
            gradient += c.shape;
            if (['closest-side', 'farthest-side', 'closest-corner', 'farthest-corner'].includes(c.shape)) {
                gradient += ` at ${c.originX}% ${c.originY}%`;
            }
            gradient += ", ";
        }


        for (let i = 0; i < c.steps.length; i += 1) {
            gradient += Color.rgba(c.steps[i].color).stringValue + " " + c.steps[i].percentage + "%";
            if (i < c.steps.length - 1) {
                gradient += ", ";
            }
        }
        gradient += ")";
        return gradient;
    }

}

