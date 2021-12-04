import {View} from "../View/View";
import {LocalizedString} from "../LocalizedString/LocalizedString";
import {Label} from "./Label";
import {isDefined} from "../Utils/isDefined";
import {setProps} from "../baseClass";
import {ViewStyle} from "../View/ViewStyle";
import {BorderRadius} from "../View/BorderRadius";
import {Shadow} from "../View/Shadow";
import {Color} from "../Color/Color";
import {Fill} from "../View/Fill";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {NUConvertToPixel, px} from "../NumberWithUnit/NumberWithUnit";
import {instanceOfLocalizedString} from "../Guards/instanceOfLocalizedString";
import {getLocalizedString} from "../LocalizedString/getLocalizedString";
import {Bounds} from "../Bounds/Bounds";
import {renderTextStyleProps} from "../TextStyle/renderTextStyleProps";
import {applyClickThrough} from "../View/applyClickThrough";


export class Drp extends View {

    private ds?: {id: string; text: string | LocalizedString, [key:string]:any}[];

    selectedID?: string;

    glyphString: string = "&#xf0dc;";
    glyphFont: string = "FontAwesome5ProSolid";

    protected dd: any;
    protected glyph: Label;


    set dataSource(value: {id: string; text: string | LocalizedString, [key:string]:any}[]) {
        this.ds = value;
        if (isDefined(this.getDiv())) {
            this.reloadData();
        }
    }

    get dataSource(): {id: string; text: string | LocalizedString, [key:string]:any}[] {
        return this.ds;
    }



    constructor() {
        super();
        this.glyph = new Label();
        this.dd = document.createElement('select');
        this.styles = [
            setProps(new ViewStyle(),
                {
                    borderRadius: new BorderRadius(3, 3, 3, 3),
                    //borders: [new Border(true, 1, "solid", "rgba(50, 50, 50, 1.0)", BorderSide.all)],
                    shadows: [new Shadow(true, 0, 1, 1, 1, Color.fromString("rgba(50, 50, 59, 1.0)"), false)],

                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(61, 61, 61, 1.0), rgba(57, 57, 57, 1.0))")],
                    textStyle: setProps(new PropertyTextStyle(), {
                        color: new Fill(true, "color", "normal", "rgba(224, 224, 225, 1.0)"),
                        size: px(10)
                    } as PropertyTextStyle)
                } as ViewStyle),
            {
                id: "glyph",
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", "rgba(224, 224, 225, 1.0)"),
                    size: px(10),
                    textAlignment: "center",
                    weightName: "FontAwesome5ProSolid",
                    fillLineHeight: true
                } as PropertyTextStyle)
            } as ViewStyle,
            setProps(new ViewStyle(),
                {
                    cond: [
                        {
                            property: "view.hovered",
                            value: true,
                            op: "equals",
                            path: ""
                        }
                    ],
                    fills: [new Fill(true, "gradient", "normal", "linear-gradient(rgba(77, 77, 77, 1.0), rgba(61, 61, 61, 1.0))")],
                } as ViewStyle)
            ]
    }


    viewWillLoad() {

        this.dd.style.backgroundColor = 'transparent';
        this.dd.style.border = '';
        this.dd.style.webkitAppearance = 'none';
        this.dd.style["mozAppearance"] = 'none';
        this.dd.style['msProgressAppearance'] = 'none';

        this.dd.style.fontSize = 12 + "px";
        this.dd.style.fontWeight = '400';
        this.dd.style.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        this.dd.style.webkitUserSelect = 'none';
        this.dd.style['mozUserSelect'] = 'none';
        this.dd.style['webkitPaddingEnd'] = '20px';
        this.dd.style['mozPaddingEnd'] = '20px';
        this.dd.style['webkitPaddingStart'] = '2px';
        this.dd.style['mozPaddingStart'] = '2px';
        //this.dd.style.borderRadius = '3px';
        this.dd.style.textOverflow = 'ellipsis';
        this.dd.style.whiteSpace = 'nowrap';
        this.dd.style.paddingLeft = '5px';
        this.dd.style.padding = "auto 0";


    }


    reloadData() {
        while (this.dd.children.length > 0) {
            this.dd.removeChild(this.dd.lastChild);
        }
        if (this.ds) {
            for (let i = 0; i < this.ds.length; i++) {
                const id = this.ds[i].id;
                let val = "";
                if (instanceOfLocalizedString(this.ds[i].text)) {
                    val = getLocalizedString(this.ds[i].text as LocalizedString).content;
                } else {
                    val = this.ds[i].text as string;
                }


                const opt: HTMLOptionElement = document.createElement('option');
                opt.value = id;
                opt.text = val;
                this.dd.appendChild(opt);
            }
            if (this.ds.length > 0) {
                this.setSelectedItem(this.ds[0].id);
            }
        }

    }



    viewWillBeDeattached() {
        try {
            delete this.dd.viewRef;
            this.dd.onchange = undefined;
            this.getDiv().removeChild(this.dd);
            delete this.dd;
            delete this.ds;
        } catch (e) {
            console.warn(e.message);
        }
    }

    viewWasDetached() {

    }

    viewWasAttached() {
        this.getDiv().appendChild(this.dd);

        this.dd.viewRef = this;
        this.dd.onchange = function (e: Event) {
            let self : any = this;
            e.preventDefault(); e.stopPropagation();
            if (self.viewRef !== undefined) {
                if (self.viewRef !== undefined) {

                    this.viewRef.selectedID = this.viewRef.getSelectedItem().id;

                    if (this.viewRef.actionDelegate && this.viewRef.actionDelegateEventName) {
                        this.viewRef.actionDelegate[this.viewRef.actionDelegateEventName](this.viewRef, 'onchange');
                    }
                    if (isDefined(this.viewRef.actionArrowFunction)) {
                        this.viewRef.actionArrowFunction(this.viewRef, "onchange");
                    }
                }
            }
        };
        this.dd.onmouseover = function (e: MouseEvent) {
            if (isDefined(this.viewRef)) {
                (this.viewRef as View).setPropertyValue("view.hovered", true);
                this.viewRef.processStyleAndRender("", []);
            }
        };
        this.dd.onmouseout = function (e: MouseEvent) {

            if (isDefined(this.viewRef)) {
                (this.viewRef as View).setPropertyValue("view.hovered", false);
                this.viewRef.processStyleAndRender("", []);

            }

        };


        this.glyph.boundsForView = function (parentBounds: Bounds): Bounds {
            return new Bounds(NUConvertToPixel(parentBounds.width).amount- 20,
                0,
                20,
                NUConvertToPixel(parentBounds.height).amount);
        };
        let glyphStyles = this.getStylesForTargetId("glyph", true);
        if (isDefined(glyphStyles)) {
            this.glyph.styles = glyphStyles;
        }
        this.glyph.fillLineHeight = true;
        this.glyph.text = this.glyphString;
        this.glyph.extracss = "pointer-events:none;";
        this.glyph.textAlignment = "center";
        this.glyph.initView(this.id + ".glyph");
        this.attach(this.glyph);

        this.reloadData();
        //this.render();

    }

    getSelectedItem(): any | undefined {
        const idx = this.dd.selectedIndex;
        if (idx === -1) {
            return undefined;
        }
        const id = this.dd.options[idx].value;
        if (this.dataSource) {
            for (let i = 0; i < this.dataSource.length; i++) {
                if (this.dataSource[i].id === id)
                    return this.dataSource[i];
            }
        }
        return undefined;
    }


    setSelectedItem(idToSelect: string) {

        this.dd.value = idToSelect;
        this.selectedID = idToSelect;
    }


    wasResized(bounds: Bounds) {
        super.wasResized(bounds);
        this.processStyleAndRender("", []);

    }


    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        if (isDefined(this.getDiv()) && isDefined(this.dd)) {

            //renderViewStyle(this.dd, style);
            if (isDefined(style.textStyle)) {
                renderTextStyleProps(this.dd, style.textStyle);
            }
            let bounds = this.getBounds("");
            if (isDefined(bounds.width)) {
                this.dd.style.width = bounds.width.amount + bounds.width.unit;
            }
            if (isDefined(bounds.height)) {
                this.dd.style.height = bounds.height.amount + bounds.height.unit;
            }
            let glyphStyles = this.getStylesForTargetId("glyph", true);
            if (isDefined(glyphStyles)) {
                this.glyph.styles = glyphStyles;
            }
            this.glyph.processStyleAndRender("", []);
            applyClickThrough(this.glyph);


        }

    }





}
