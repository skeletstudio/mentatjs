import {View} from "./View";
import {isDefined} from "../Utils/isDefined";
import {ViewStyle} from "./ViewStyle";
import {Fill} from "./Fill";
import {Color} from "../Color/Color";
import {Border} from "./Border";
import {Shadow} from "./Shadow";
import {instanceOfColor} from "../Guards/instanceOfColor";
import {instanceOfFill} from "../Guards/instanceOfFill";
import {Logging} from "../Utils/logging";
import {BorderSide} from "./BorderSide";


function getColorFromValue(value: string | Color | Fill, depth: number = 0) {
    if (typeof value === "string") {
        return value;
    }
    if (instanceOfColor(value)) {
        return (value as Color).value;
    }
    if (instanceOfFill(value)) {
        if (depth + 1 > 2) {
            Logging.warn("Color value from property is a Fill containing another Fill.");
            return "";
        }
        return getColorFromValue((value as Fill).value, depth + 1);
    }
    return "";
}


export function renderViewStyle(el: HTMLElement, style: ViewStyle | View) {
    //el.style.cssText = '';

    el.style.padding = "0";
    el.style.border = 'none';
    el.style.background = 'none';
    // @ts-ignore
    el.style.appearance = "none";
    el.style.webkitAppearance = "none";

    if (isDefined(style.overflow)) {
        el.style.overflow = style.overflow;
    }
    if (isDefined(style.opacity)) {
        el.style.opacity = (style.opacity / 100.0).toString();
    }

    let i = 0;
    let background = '';
    let blendmode = '';
    let cssText = '';

    let hasGradients: boolean = false;
    let gradients = 'background-image: ';
    if (isDefined(style.fills)) {
        for (i = 0; i < style.fills.length; i += 1) {
            let fill = style.fills[i] as Fill;
            if (fill.active) {
                if (fill.type === 'color' || fill.type === 'gradient') {
                    // hasColor = true;
                    hasGradients = true;
                    let color = getColorFromValue(fill.value);

                    if (color.startsWith('linear') || color.startsWith('radial')) {
                        gradients += color + ',';
                    } else {
                        //if (color.startsWith('device-cmyk') || color.startsWith('lab') || color.startsWith('xyz')) {
                        color = Color.rgba(Color.fromString(color)).stringValue;
                        //}
                        gradients += 'linear-gradient(to right, ' + color + ' 0%, ' + color + ' 100%),'
                    }
                }
                if (fill.type === 'cssText') {
                    if (fill.value.startsWith('linear') || fill.value.startsWith('radial')) {
                        hasGradients = true;
                        gradients += fill.value + ',';
                    } else {
                        cssText += fill.value;
                    }
                }

                if (isDefined(fill.blendMode)) {
                    blendmode += fill.blendMode + ',';
                }

            }
        }
    }

    if (hasGradients) {
        gradients = gradients.substr(0, gradients.length - 1) + ";";
        /*
        if ((this as any).nodeId !== undefined) {
            let node: any;
            eval("node = skeletapi_1.findNode('" + (this as any).nodeId + "');");
            console.log(node.title + ": " + gradients);
        }
         */
        cssText += gradients;
    }

    if (background.length > 0) {
        background = background.substr(0, background.length -1);
    }

    //if (hasColor) {
    //    cssText += "background: " + background + ";\n";
    //}

    if (blendmode.length > 0) {
        blendmode = blendmode.substr(0,blendmode.length - 1);
    }

    //this.getDiv().style.background = background;
    // @ts-ignore
    el.style.backgroundBlendMode = blendmode;
    if (isDefined(style.blendingMode)) {
        // @ts-ignore
        el.style.mixBlendMode = style.blendingMode;
    }


    let borders = '';
    if (isDefined(style.borders)) {
        let bordersLeft = "";
        let bordersTop = "";
        let bordersRight = "";
        let bordersBottom = "";

        for (i = 0; i < style.borders.length; i += 1) {
            let border = style.borders[i] as Border;
            if (border.active) {
                if (border.side === BorderSide.all) {
                    borders += border.thickness + "px " + border.pattern + " " + getColorFromValue(border.value) + ",";
                } else {
                    switch (border.side) {
                        case BorderSide.left:
                            bordersLeft += border.thickness + "px " + border.pattern + " " + getColorFromValue(border.value) + ",";
                            break;
                        case BorderSide.top:
                            bordersTop += border.thickness + "px " + border.pattern + " " + getColorFromValue(border.value) + ",";
                            break;
                        case BorderSide.right:
                            bordersRight += border.thickness + "px " + border.pattern + " " + getColorFromValue(border.value) + ",";
                            break;
                        case BorderSide.bottom:
                            bordersBottom += border.thickness + "px " + border.pattern + " " + getColorFromValue(border.value) + ",";
                            break;
                    }
                }
            }
        }
        if (borders.length > 0) {
            borders = borders.substr(0, borders.length - 1);
            if (!isDefined(style.extraCss)) {
                style.extraCss = "";
            }
            style.extraCss += 'box-sizing: border-box;-moz-box-sizing: border-box;-webkit-box-sizing: border-box;';
        }
        el.style.border = borders;
        if (bordersLeft.length > 0) {
            bordersLeft = bordersLeft.substr(0, bordersLeft.length - 1);
            el.style.borderLeft = bordersLeft;
        }
        if (bordersTop.length > 0) {
            bordersTop = bordersTop.substr(0, bordersTop.length - 1);
            el.style.borderTop = bordersTop;
        }
        if (bordersRight.length > 0) {
            bordersRight = bordersRight.substr(0, bordersRight.length - 1);
            el.style.borderRight = bordersRight;
        }
        if (bordersBottom.length > 0) {
            bordersBottom = bordersBottom.substr(0, bordersBottom.length - 1);
            el.style.borderBottom = bordersBottom;
        }


    }

    if (isDefined(style.borderRadius)) {
        el.style.borderTopLeftRadius = style.borderRadius.tl.amount + style.borderRadius.tl.unit;
        el.style.borderTopRightRadius = style.borderRadius.tr.amount + style.borderRadius.tr.unit;
        el.style.borderBottomLeftRadius = style.borderRadius.bl.amount + style.borderRadius.bl.unit;
        el.style.borderBottomRightRadius = style.borderRadius.br.amount + style.borderRadius.br.unit;
    }

    if (isDefined(style.shadows)) {
        for (i = 0; i < style.shadows.length; i +=1) {
            let shw = style.shadows[i] as Shadow;
            if (shw.active) {
                let shadowLine = "box-shadow: ";
                shadowLine += shw.offsetX + "px ";
                shadowLine += shw.offsetY + "px ";
                if (shw.blur !== 0) {
                    shadowLine += shw.blur + "px ";
                }
                if (shw.spread !== 0) {
                    shadowLine += shw.spread + "px ";
                }
                if (!isDefined(shw.color)) {
                    shadowLine += "rgb(50,50,50)";
                } else {
                    shadowLine += getColorFromValue(shw.color.value);
                }
                if (shw.isInset) {
                    shadowLine += " inset";
                }
                shadowLine += ";\n";
                cssText += shadowLine;
            }
        }
    }
    if (isDefined(style.cursor)) {
        el.style.cursor = style.cursor;
    }
    if (isDefined(style.userSelect)) {
        el.style.userSelect = style.userSelect;
        el.style.webkitUserSelect = style.userSelect;
        //@ts-ignore
        el.style.msUserSelect = style.userSelect;
    }
    if (isDefined(style.zIndex)) {
        el.style.zIndex = style.zIndex;
    }

    if (isDefined(style.cursor)) {
        el.style.cursor = style.cursor;
    }

    if (style.extraCss !== '') {
        cssText += style.extraCss;
    }

    //cssText += "::-webkit-scrollbar { display: none; }";

    if (cssText.length > 0) {
        el.style.cssText += cssText;
    }

}
