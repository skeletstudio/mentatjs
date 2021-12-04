import {View} from "../View/View";
import {LocalizedString} from "../LocalizedString/LocalizedString";
import {isDefined} from "../Utils/isDefined";
import {ViewStyle} from "../View/ViewStyle";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {NUConvertToPixel, px} from "../NumberWithUnit/NumberWithUnit";
import {Fill} from "../View/Fill";
import {Logging} from "../Utils/logging";
import {stringToLocalizedString} from "../LocalizedString/stringToLocalizedString";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {Bounds} from "../Bounds/Bounds";
import {renderTextStyleProps} from "../TextStyle/renderTextStyleProps";
import {instanceOfLocalizedString} from "../Guards/instanceOfLocalizedString";
import {LocalizedStringData} from "../LocalizedString/LocalizedStringData";
import {getLocalizedString} from "../LocalizedString/getLocalizedString";


export class Label extends View {

    text: LocalizedString | string = "";


    constructor(tag: string = "div", _id: string = "", children: View[] = []) {
        super(tag, _id, children);
        if (!isDefined(this.styles)) {
            this.styles = [
                new ViewStyle()
            ];
            this.styles[0].textStyle = new PropertyTextStyle();
            this.styles[0].userSelect = "none";
        }

    }


    get fontFamily(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.weight
    }
    set fontFamily(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.weight = value;
    }

    get fontSize(): number {
        let style: ViewStyle = this.getDefaultStyle();
        return NUConvertToPixel(style.textStyle.size).amount;
    }

    set fontSize(value: number) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.size = px(value);
    }

    get fontSizeUnit(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.size.unit;
    }
    set fontSizeUnit(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.size.unit = value;
    }

    get fontWeight(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.weightValue;
    }

    set fontWeight(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.weightValue = value;
    }

    get fontColor(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.color.value;
    }
    set fontColor(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.color = new Fill(true, "color", "normal", value);
    }


    get fillLineHeight(): boolean {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.fillLineHeight;
    }
    set fillLineHeight(value: boolean) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.fillLineHeight = value;
    }

    get textAlignment(): "left" | "right" | "center" | "justify" | string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.textAlignment;
    }

    set textAlignment(value: "left" | "right" | "center" | "justify" | string) {
        let style: ViewStyle = this.getDefaultStyle();
        // @ts-ignore
        style.textStyle.textAlignment = value;
    }

    get wordBreak(): 'normal' | 'break-all' | 'keep-all' | 'break-word' | string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.wordBreak;
    }

    set wordBreak(value: 'normal' | 'break-all' | 'keep-all' | 'break-word' | string) {
        let style: ViewStyle = this.getDefaultStyle();
        //@ts-ignore
        style.textStyle.wordBreak = value;
    }


    get wordWrap(): 'normal' | 'break-word' | string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.wordWrap;
    }

    set wordWrap(value: 'normal' | 'break-word' | string) {
        let style: ViewStyle = this.getDefaultStyle();
        //@ts-ignore
        style.textStyle.wordWrap = value;
    }


    get whiteSpace() {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.whiteSpace;
    }

    set whiteSpace(value) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.whiteSpace = value;
    }

    get textOverflow(): 'clip' | 'ellipsis' | string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.textOverflow;
    }

    set textOverflow(value: 'clip' | 'ellipsis' | string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.textOverflow = value;
    }

    get underline(): boolean {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.decorations.understrike;
    }

    set underline(value: boolean) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.decorations.understrike = value;
    }

    get strike(): boolean {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.decorations.strike;
    }
    set strike(value: boolean) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.decorations.strike = value;
    }

    get kerning(): "normal" | "auto" {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.kerning;
    }

    set kerning(value: "normal" | "auto") {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.kerning;
    }


    viewWasDetached() {
        if (this.getDiv() !== undefined) {
            if (isDefined(this.getDiv().viewRef)) {
                this.getDiv().viewRef = undefined;
            }
            if (isDefined(this.clickDelegate)) {
                this.clickDelegate = undefined;
                this.getDiv().onclick = undefined;

            }
            this._div = undefined;
        }
    }

    viewWasAttached() {
        super.viewWasAttached();
        this.getDiv().addEventListener("mouseover", (e) => {

        });
        this.getDiv().addEventListener("mouseout", (e) => {

        });
    }


    setClickDelegate(d: any, n: string) {
        "use strict";
        this.clickDelegate = d;
        this.clickDelegateEventName = n;
        this.getDiv().viewRef = this;
        this.getDiv().onclick = function (e: MouseEvent) {
            e.preventDefault();
            e.stopPropagation();
            if (Logging.enableLogging) {
                Logging.log('+CLICK ' + this.viewRef.id);
            }
            if (isDefined(this.viewRef)) {
                if (this.viewRef.isDragging === true) {
                    this.viewRef.isDragging = false;
                    return;
                }
                if (isDefined(this.viewRef.clickDelegate)) {
                    const clickOptions = {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        screenX: e.screenX,
                        screenY: e.screenY,
                        action: 'click',
                        evt: e
                    };
                    this.viewRef.clickDelegate[this.viewRef.clickDelegateEventName](this.viewRef, clickOptions);
                }
            }
        };
    }

    onLabelClicked(sender: any, param: any) {
        if (isDefined(this.actionDelegate) && isDefined(this.actionDelegateEventName) && isDefined(this.actionDelegate[this.actionDelegateEventName])) {
            this.actionDelegate[this.actionDelegateEventName](sender,param);
        }
    }

    setText(text: string) {
        this.text = stringToLocalizedString(generateV4UUID(), "en", text);
        this.processStyleAndRender("", []);
    }


    setFontColor(newColor: string) {
        this.fontColor = newColor;
        this.processStyleAndRender("", []);
    }



    render(parentBounds?: Bounds, style?: ViewStyle) {
        if (!isDefined(this.getDiv())) {
            return;
        }

        while (this.getDiv().children.length > 0) {
            this.getDiv().removeChild(this.getDiv().lastChild);
        }


        super.render(parentBounds, style);
        let st: ViewStyle;
        if (isDefined(style)) {
            st = style;
        } else {
            if (isDefined(this.cachedStyle)) {
                st = this.cachedStyle;
            } else {
                st = this.getDefaultStyle();
            }
        }
        renderTextStyleProps(this.getDiv(), st.textStyle);

        if (!instanceOfLocalizedString(this.text)) {
            this.getDiv().innerHTML = this.text;
        } else {
            let ls = this.text as LocalizedString;
            let lsd: LocalizedStringData = getLocalizedString(ls, []);
            if (isDefined(lsd.textStyles) && lsd.textStyles.length > 0) {
                for (let i = 0; i < lsd.textStyles.length; i += 1) {
                    let span = document.createElement('span');
                    renderTextStyleProps(span, lsd.textStyles[i].style);
                    let str = "";
                    try {
                        str = lsd.content.substr( lsd.textStyles[i].start, lsd.textStyles[i].end - lsd.textStyles[i].start);
                    } catch (e) {
                        console.warn("Label LocalizedStringData is not ordered correctly");
                    }
                    span.innerText = str;
                    this.getDiv().appendChild(span);
                }
            } else {
                this.getDiv().innerHTML = lsd.content;
            }
        }

        if (this.fillLineHeight) {
            if (st.bounds !== undefined && st.bounds.height) {
                this._div.style.lineHeight = st.bounds.height.amount + st.bounds.height.unit;
            }
        }


    }


}
