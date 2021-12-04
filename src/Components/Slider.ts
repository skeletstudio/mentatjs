import {View} from "../View/View";
import {ViewStyle} from "../View/ViewStyle";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {isDefined} from "../Utils/isDefined";
import {Bounds} from "../Bounds/Bounds";
import {setProps} from "../baseClass";
import {Fill} from "../View/Fill";


export class Slider extends View {

    min: number = 0;
    max: number = 100;
    value: number = 50;
    thinBar: boolean = false;

    direction: 'horizontal' | 'vertical' = 'horizontal';

    ruleName: string = '';
    style: any = undefined;

    protected _input: any;
    protected thinBarDiv: any;
    protected thinBarTrack: any;

    constructor() {
        super();
        this.styles = [
            setProps(new ViewStyle(),
            {

            }),
            setProps(new ViewStyle(),
                {
                    id: "bar",
                    fills: [new Fill(true, "color", "normal", "rgba(150, 150, 150, 1.0)")]
                } as ViewStyle),
            setProps(new ViewStyle(),
                {
                    id: "thumb",
                    fills: [new Fill(true, "color", "normal", "rgba(10, 20, 250, 1.0)")],
                })

            ];
    }


    viewWillBeDeattached() {
        this._div.removeChild(this._input);
        this._input.viewRef = undefined;
        this._input.oninput = undefined;
        this._input = undefined;
    }

    viewWasAttached() {

        this.ruleName = "slider" + generateV4UUID();
        this.style = document.createElement("style");
        this.style.appendChild(document.createTextNode(""));
        document.head.appendChild(this.style);

        this.thinBarDiv = document.createElement('div');
        this.thinBarDiv.style.position = 'absolute';
        this.thinBarDiv.style.height = 3 + 'px';

        this.getDiv().append(this.thinBarDiv);

        this.thinBarTrack = document.createElement('div');
        this.thinBarTrack.style.position = 'absolute';
        this.thinBarTrack.style.height = 3 + "px";

        this.getDiv().append(this.thinBarTrack);

        this._input = document.createElement("input");
        this._input.type = "range";
        this._input.id = this.id + ".range";
        this._input.classList.add(this.ruleName);
        this._input.viewRef = this;
        this._input.oninput = function (e: KeyboardEvent) {
            e.preventDefault(); e.stopPropagation();
            if (isDefined(this.viewRef)) {
                this.viewRef.value = this.value;

                this.viewRef.updateTrack();

                if (isDefined(this.viewRef.actionDelegate)) {
                    this.viewRef.actionDelegate[this.viewRef.actionDelegateEventName](this.viewRef, this.viewRef.value);
                }
                if (isDefined(this.viewRef.actionArrowFunction)) {
                    this.viewRef.actionArrowFunction(this.viewRef, this.viewRef.value);
                }
            }

        };


        this._div.appendChild(this._input);



        //this.doResize();

    }

    updateTrack() {
        let bounds : Bounds = this.getBounds("");
        this.thinBarTrack.style.top = (bounds.height.amount / 2 - 1) + "px";
        this.thinBarTrack.style.left = 0 + "px";
        this.thinBarTrack.style.width = (bounds.width.amount / (this.max - this.min) * this.value) + "px";
    }


    setValue(val: number) {
        this.value = val;
        this.render();
    }

    resize(bounds: Bounds) {

        super.resize(bounds);

        if (isDefined(this._input)) {
            this._input.style.position = 'absolute';
            if (isDefined(bounds.width) && isDefined(bounds.height)) {
                this._input.style.left = 0 + "px";
                this._input.style.top = 0 + "px"; //(bounds.height / 2) - (bounds.height/2)/2 + bounds.unit;
                this._input.style.bottom = bounds.height.amount + bounds.height.unit; //(bounds.height / 2) - (bounds.height/2)/2 + (bounds.height / 2) + bounds.unit;
                this._input.style.right = (bounds.width.amount) + bounds.width.unit;
                this._input.style.width = bounds.width.amount + bounds.width.unit;
                this._input.style.height = bounds.height.amount + bounds.height.unit; //(bounds.height / 2) + bounds.unit;
            }
        }
        if (isDefined(this.thinBarDiv)) {
            this.thinBarDiv.style.position = 'absolute';
            this.thinBarDiv.style.left = 0 + "px";
            if (bounds.height) {
                this.thinBarDiv.style.top = (bounds.height.amount / 2 - 1) + bounds.height.unit;
            }
            if (bounds.width) {
                this.thinBarDiv.style.width = (bounds.width.amount) + bounds.width.unit;
            }
            this.thinBarDiv.style.height = 3 + 'px';
        }

        if (isDefined(this.thinBarTrack)) {
            if (bounds.height) {
                this.thinBarTrack.style.top = (bounds.height.amount / 2 - 1) + bounds.height.unit;
            }
            this.thinBarTrack.style.left = 0 + "px";
            if (bounds.width) {
                this.thinBarTrack.style.width = (bounds.width.amount / (this.max - this.min) * this.value) + bounds.width.unit;
            }
        }

    }


    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);
        if (isDefined(this.getDiv())) {

            let i = 0;
            let background = '';
            let blendmode = '';
            let cssText = '';
            if (isDefined(this.fills)) {
                for (i = 0; i < this.fills.length; i += 1) {
                    let fill = this.fills[i];
                    if (fill.active) {
                        if (fill.type === 'color') {
                            let color = fill.value;
                            background += color + ",";
                        }
                        if (fill.type === 'cssText') {
                            cssText += fill.value;
                        }

                        if (isDefined(fill.blendMode)) {
                            blendmode += fill.blendMode + ',';
                        }

                    }
                }
            }
            if (background.length > 0) {
                background = background.substr(0, background.length -1);
            }
            if (blendmode.length > 0) {
                blendmode = blendmode.substr(0,blendmode.length - 1);
            }
            this.getDiv().style.background = "transparent"; //background;
            this.getDiv().style.backgroundBlendMode = blendmode;
            this.getDiv().style.mixBlendMode = this.cachedStyle.blendingMode;

            this._input.style.webkitAppearance = 'none';
            this._input.style.mozAppearance = 'none';
            this._input.style.msProgressAppearance = 'none';
            this._input.style.outline = 'none';

            if (this.thinBar) {
                this._input.style.backgroundColor = "transparent";

            } else {

            }

            this._input.min = this.min;
            this._input.max = this.max;
            this._input.value = this.value;

            let size = this.bounds.height.amount;
            let backgroundColor = "blue";

            if (isDefined(this.style)) {
                while (this.style.sheet.cssRules.length > 0) {
                    this.style.sheet.deleteRule(0);
                }

                //this.style.sheet.deleteRule(1);
                if (this.thinBar) {
                    size = 12;
                }
                let cssString = `.${this.ruleName}::-webkit-slider-thumb { -webkit-appearance: none;\n` +
                    `  background-color: white;\n` +
                    `  border: 2px solid ${backgroundColor};\n` +
                    `  width: ${size}px;\n` +
                    `  height: ${size}px;\n` +
                    `  border-radius: ${size/2}px;\n` +
                    `  box-shadow: hsla(0, 0%, 0%, 0.20) 0px 3px 0px;\n` +
                    `  cursor: pointer; }\n`;

                this.style.sheet.insertRule(cssString);

            }

            if (this.direction === 'vertical') {
                cssText += "writing-mode: bt-lr;\n";
                cssText += "-webkit-appearance: slider-vertical;\n";
            }

            if (cssText.length > 0) {
                this._input.style.cssText += cssText;
            }

        }
    }

    renderDEPREC(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        //this.getDiv().style.cssText = '';
        //this.doResizeFrameOnly();
        if (isDefined(this.getDiv())) {

            this.getDiv().style.opacity = (this.opacity / 100.0);

            let i = 0;
            let background = '';
            let blendmode = '';
            let cssText = '';
            for (i = 0; i < this.fills.length; i += 1) {
                let fill = this.fills[i];
                if (fill.active) {
                    if (fill.type === 'color') {
                        let color = fill.value;
                        background += color + ",";
                    }
                    if (fill.type === 'cssText') {
                        cssText += fill.value;
                    }

                    if (isDefined(fill.blendMode)) {
                        blendmode += fill.blendMode + ',';
                    }

                }
            }
            if (background.length > 0) {
                background = background.substr(0, background.length -1);
            }
            if (blendmode.length > 0) {
                blendmode = blendmode.substr(0,blendmode.length - 1);
            }

            this.getDiv().style.background = "transparent"; //background;
            this.getDiv().style.backgroundBlendMode = blendmode;
            this.getDiv().style.mixBlendMode = this.blendingMode;

            this._input.style.webkitAppearance = 'none';
            this._input.style.mozAppearance = 'none';
            this._input.style.msProgressAppearance = 'none';
            this._input.style.outline = 'none';


            if (this.thinBar) {
                this._input.style.backgroundColor = "transparent";


            } else {

            }



            let borders = '';
            for (i = 0; i < this.borders.length; i += 1) {
                let border = this.borders[i];
                if (border.active) {
                    borders += border.thickness + "px " + border.pattern + " " + border.value + ",";
                }
            }
            if (borders.length > 0) {
                borders = borders.substr(0, borders.length -1);
            }
            this.getDiv().style.border = borders;

            this.getDiv().style.borderTopLeftRadius = this.borderRadius.tl + "px";
            this.getDiv().style.borderTopRightRadius = this.borderRadius.tr + "px";
            this.getDiv().style.borderBottomLeftRadius = this.borderRadius.bl + "px";
            this.getDiv().style.borderBottomRightRadius = this.borderRadius.br + "px";


            this._input.min = this.min;
            this._input.max = this.max;
            this._input.value = this.value;

            let size = this.bounds.height.amount;
            let backgroundColor = "blue";

            if (isDefined(this.style)) {
                while (this.style.sheet.cssRules.length > 0) {
                    this.style.sheet.deleteRule(0);
                }

                //this.style.sheet.deleteRule(1);
                if (this.thinBar) {
                    size = 12;
                }
                let cssString = `.${this.ruleName}::-webkit-slider-thumb { -webkit-appearance: none;\n` +
                    `  background-color: white;\n` +
                    `  border: 2px solid ${backgroundColor};\n` +
                    `  width: ${size}px;\n` +
                    `  height: ${size}px;\n` +
                    `  border-radius: ${size/2}px;\n` +
                    `  box-shadow: hsla(0, 0%, 0%, 0.20) 0px 3px 0px;\n` +
                    `  cursor: pointer; }\n`;

                this.style.sheet.insertRule(cssString);

            }

            if (this.direction === 'vertical') {
                cssText += "writing-mode: bt-lr;\n";
                cssText += "-webkit-appearance: slider-vertical;\n";
            }

            if (cssText.length > 0) {
                this._input.style.cssText += cssText;
            }

        }

    }





}