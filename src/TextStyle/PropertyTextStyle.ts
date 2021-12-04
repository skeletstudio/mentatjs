import {Shadow} from "../View/Shadow";
import {Fill} from "../View/Fill";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";

export class PropertyTextStyle {
    typeface: 'System Fonts' | string = "System Fonts";
    weight: string = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
    size: NumberWithUnit = { amount: 14, unit: 'px'};
    weightName: string = 'Regular';
    weightValue: string = '300';
    bold: boolean = false;
    italic: boolean = false;
    capitalize: 'none' | 'lowercase' | 'uppercase' | 'capitalize' = 'none';

    textOverflow: 'clip' | 'ellipsis' | string = 'clip';
    lineSpacing: 'normal' | number = 'normal';
    wordSpacing: 'normal' | NumberWithUnit = { amount: 0.25, unit: 'em'};
    wordBreak: 'normal' | 'break-all' | 'keep-all' | 'break-word' = 'normal';
    wordWrap: 'normal' | 'break-word' = 'normal';
    letterSpacing: 'normal' | NumberWithUnit = 'normal';
    textShadows: Shadow[] = [];
    textDirection: 'ltr' | 'rtl' = 'ltr';
    whiteSpace: 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap' = 'normal';
    lineHeight: string | NumberWithUnit = 'normal';
    writingMode: 'horizontal-tb' | 'vertical-rl' | 'vertical-lr' = 'horizontal-tb';

    openTypeTags: string[] = ['liga'];

    fontVariant: {
        smallCaps: boolean
    } = { smallCaps: false };

    color: Fill = { active: true, type: 'color', blendMode: "normal", value: 'rgb(50,50,50)' };

    textAlignment: 'left' | 'right' | 'center' | 'justify' = 'left';

    decorations: {
        understrike: boolean;
        strike: boolean;
    } = { understrike: false, strike: false};

    kerning: 'normal' | 'auto' = 'auto';

    fillLineHeight: boolean = false;

}