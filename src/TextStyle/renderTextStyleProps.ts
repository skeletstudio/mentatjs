import {PropertyTextStyle} from "./PropertyTextStyle";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";
import {isDefined} from "../Utils/isDefined";


export function renderTextStyleProps(el: HTMLElement, obj: PropertyTextStyle) {
    el.style.color = obj.color.value;
    el.style.fontFamily = obj.weight;
    el.style.fontWeight = obj.weightValue;
    el.style.fontSize = obj.size.amount + obj.size.unit;
    //if (el.style.lineHeight) {
    if (obj.lineHeight === 'normal') {
        el.style.lineHeight = 'normal';
    } else {
        el.style.lineHeight = (obj.lineHeight as NumberWithUnit).amount + (obj.lineHeight as NumberWithUnit).unit;
    }
    //} else {
    //    el.style.lineHeight = (obj.fontSize - 2) + 'px';
    //}

    if (obj.letterSpacing === 'normal') {
        el.style.letterSpacing = obj.letterSpacing;
    } else {
        el.style.letterSpacing = (obj.letterSpacing as NumberWithUnit).amount + (obj.letterSpacing as NumberWithUnit).unit;
    }
    el.style.wordBreak = obj.wordBreak;
    el.style.wordWrap = obj.wordWrap;
    if (obj.wordSpacing === 'normal') {
        el.style.wordSpacing = 'normal';
    } else {
        el.style.wordSpacing = (obj.wordSpacing as NumberWithUnit).amount + (obj.wordSpacing as NumberWithUnit).unit;
    }
    el.style.textTransform = obj.capitalize;
    if (obj.fontVariant.smallCaps) {
        el.style.fontVariant = 'small-caps';
    }
    el.style.textOverflow = obj.textOverflow;
    let shadows = '';
    for (let i = 0; i < obj.textShadows.length; i += 1) {
        let s = obj.textShadows[i];
        if (s.active) {
            shadows += `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.color},`
        }
    }
    if (shadows.length > 0) {
        shadows = shadows.substr(0, shadows.length - 1);
        el.style.textShadow = shadows;
    }
    el.style.direction = obj.textDirection
    el.style.whiteSpace = obj.whiteSpace;
    el.style.writingMode = obj.writingMode;


    el.style.textAlign = obj.textAlignment;
    //el.style.fontFeatureSettings = '"liga" 0';
    el.style.fontKerning = obj.kerning;
    let textDecoration = "";
    if (obj.decorations.understrike) {
        textDecoration = "underline ";
    }
    if (obj.decorations.strike) {
        textDecoration += "line-through ";
    }
    el.style.textDecoration = textDecoration;


    // OpenType Tags
    let fontFeatureSettings = '';
    if (isDefined(obj.openTypeTags)) {
        for (let i = 0; i < obj.openTypeTags.length; i += 1) {
            fontFeatureSettings += `"${obj.openTypeTags[i]}",`;
        }
        if (fontFeatureSettings.length > 0) {
            fontFeatureSettings = fontFeatureSettings.substr(0,fontFeatureSettings.length-1);
        }
        el.style.fontFeatureSettings = fontFeatureSettings;
        //@ts-ignore
        el.style.msFontFeatureSettings = fontFeatureSettings;
    }



    //el.style.fontVariantLigatures = 'common-ligatures';
}

