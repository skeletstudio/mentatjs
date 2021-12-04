import {View} from "../View/View";
import {ImageView} from "./ImageView";
import {isDefined} from "../Utils/isDefined";
import {Bounds} from "../Bounds/Bounds";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {ViewStyle} from "../View/ViewStyle";
import {Base64} from "../Utils/base64";
import {Border} from "../View/Border";
import {BorderSide} from "../View/BorderSide";
import {Fill} from "../View/Fill";


export class CheckBox extends View {

        _checkbox: any = undefined;
        tickSVG: string = '<svg aria-hidden="true" data-prefix="fas" data-icon="check" class="svg-inline--fa fa-check fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg>';
        img?: ImageView;
        defaultSize: number[] = [20,20];

        get checked(): boolean {
            let l = this.properties.find((p) => { return p.property_id === "checkbox.isChecked;"});
            if (isDefined(l)) {
                return l.value;
            } else {
                return false;
            }
        }

        set checked(value: boolean) {
            let l = this.properties.find((p) => { return p.property_id === "checkbox.isChecked;"});
            if (isDefined(l)) {
                l.value = value;
            }
        }


    constructor() {
        super();
        this.properties.push(
            {
                kind: "LayerProperty",
                type: "boolean",
                property_id: "checkbox.isChecked",
                value: true,
                group: "property",
                id: "checkbox.isChecked",
                title: "checkbox.isChecked"
            }
        )

        this.styles = [
            {
                kind: "ViewStyle",
                borders: [new Border(true, 1, "solid", "rgba(0, 0, 250, 1.0)", BorderSide.all)]
            },
            {
                kind: "ViewStyle",
                id: "glyph",
                visible: false,
            },
            {
                kind: "ViewStyle",
                cond: [{property: "view.hovered", path: "", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(0, 0, 250, 1.0)")],
                borders: [new Border(true, 1, "solid", "rgba(0, 0, 250, 1.0)", BorderSide.all)],

            },
            {
                kind: "ViewStyle",
                cond: [{property: "checkbox.isChecked", path: "", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(0, 0, 200, 1.0)")],
                borders: [new Border(true, 1, "solid", "rgba(0, 0, 250, 1.0)", BorderSide.all)],
            },
            {
                kind: "ViewStyle",
                id: "glyph",
                cond: [{property: "checkbox.isChecked", path: "", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "white")],
                visible: true,
            }
        ];
    }


    viewWasDetached() {
            this.getDiv().onclick = undefined;
            this.getDiv().onmouseover = undefined;
            this.getDiv().onmouseout = undefined;
            this.getDiv().viewRef = undefined;
            this._checkbox.viewRef = undefined;
            if (isDefined(this._checkbox.parentNode)) {
                this._checkbox.parentNode.removeChild(this._checkbox);
            }
            this._checkbox = undefined;
            this.actionDelegate = undefined;
            if (this.img) {
                this.img.detachItSelf();
                delete this.img;
            }
        }

        viewWasAttached() {

            this._checkbox = document.createElement("input");
            this._checkbox.type = "checkbox";
            this._checkbox.id = this.id + ".chk";
            this._checkbox.style.display = "none";
            this._checkbox.viewRef = this;

            this._checkbox.checked = this.checked;

            this.img = new ImageView();
            this.img.boundsForView = function (parentBounds: Bounds): Bounds {
                let w = 14;
                return boundsWithPixels({
                    x: parentBounds.width.amount / 2 - 14 / 2,
                    y: parentBounds.height.amount / 2 - 14 / 2,
                    width: w,
                    height: w,
                    unit: "px",
                    position: "absolute"
                });
            };
            this.img.imageWidth = 14;
            this.img.imageHeight = 14;
            this.img.initView(this.id + ".img");
            this.attach(this.img);

            this.getDiv().onmouseover = function (e: MouseEvent) {
                e.preventDefault();
                this.viewRef.isHovering = true;
                this.viewRef.render();
            };
            this.getDiv().onmouseout = function (e: MouseEvent) {
                e.preventDefault();
                this.viewRef.isHovering = false;
                this.viewRef.render();
            };

            this.render();
        }

        setChecked(checked: boolean) {
            this._checkbox.checked = checked;
            this.checked = checked;
            this.render();
        }

        setEnabled(bEnabled: boolean) {
            this.isEnabled = bEnabled;
            this._checkbox.enabled = bEnabled;
            this.render();

        }


        render(parentBounds?: Bounds, style?: ViewStyle) {
            super.render(parentBounds, style);
            if (!isDefined(this.getDiv())) {
                return;
            }





            if (this.img) {

                if (this.checked) {
                    let glyphStyles = this.getStylesForTargetId("glyph", false, [
                        {
                            property: "checkbox.isChecked",
                            path: "",
                            op: "equals",
                            value: true
                        }
                    ]);
                    let color = "white";
                    let fillStyle = glyphStyles.find((g) => { return isDefined(g.fills);});
                    if (isDefined(fillStyle)) {
                        if (fillStyle.fills.length > 0) {
                            color = fillStyle.fills[0].value;
                        }
                    }
                    var img = Base64.encode(this.tickSVG.replace("currentColor", color));
                    this.img.setImageURI("data:image/svg+xml;base64," + img);
                    this.img.setVisible(true);
                    //this.img.innerImg.style.verticalAlign = '';
                } else {
                    this.img.setVisible(false);
                }
            }

            this.getDiv().onclick = null;
            if (this.isEnabled === false) {
                this.getDiv().onclick = null;
            } else {
                this.getDiv().onclick = function (e: MouseEvent) {
                    e.preventDefault(); e.stopPropagation();
                    this.viewRef._checkbox.checked = !this.viewRef._checkbox.checked;
                    this.viewRef.checked = this.viewRef._checkbox.checked;
                    this.viewRef.isHovering = true;
                    this.viewRef.render();
                    if (isDefined(this.viewRef.actionDelegate)) {
                        if (isDefined(this.viewRef.actionDelegate[this.viewRef.actionDelegateEventName])) {
                            this.viewRef.actionDelegate[this.viewRef.actionDelegateEventName](this.viewRef, this.viewRef._checkbox.checked);
                        }
                    }
                };
            }


        }

    }

