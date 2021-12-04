import {fillParentBounds, View} from "../View/View";
import {isDefined} from "../Utils/isDefined";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {setProps} from "../baseClass";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {NUConvertToPixel, NumberWithUnit, px} from "../NumberWithUnit/NumberWithUnit";
import {Label} from "./Label";
import {Direction} from "../Containers/Direction";
import {Btn} from "./Btn";
import {Fill} from "../View/Fill";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {kViewProperties} from "../View/kViewProperties";


export class Tabs extends View {

    dataSource?: {id: string, text: string, width?: number}[];
    direction: Direction = Direction.horizontal;


    selectedId: string = "";


    left: Btn;
    right: Btn;


    private tabOffset: number = 0;

    constructor() {
        super();
        this.styles = [
            {
                kind: "ViewStyle",
                fills: [],
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "active",
                fills: [new Fill(true, "color", "normal", "rgba(64, 64, 64, 1.0)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(10),
                    color: new Fill(true, "color", "normal", "rgba(255,255,255,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "grab",
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "active",
                cond: [{property: kViewProperties.hovered, path: "", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(70, 70, 70, 1.0)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(10),
                    color: new Fill(true, "color", "normal", "rgba(255,255,255,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "grab",
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "inactive",
                fills: [new Fill(true, "color", "normal", "rgba(45, 45, 45, 1.0)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(10),
                    color: new Fill(true, "color", "normal", "rgba(255,255,255,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "click",
                userSelect: "none"
            },
            {
                kind: "ViewStyle",
                id: "inactive",
                cond: [{property: kViewProperties.hovered, path: "", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(55, 55, 55, 1.0)")],
                textStyle: setProps(new PropertyTextStyle(), {
                    size: px(10),
                    color: new Fill(true, "color", "normal", "rgba(255,255,255,1.0)"),
                    fillLineHeight: true,
                    textAlignment: "center"
                } as PropertyTextStyle),
                cursor: "click",
                userSelect: "none"
            },

        ]
    }


    setSelectedId(id: string) {
        this.selectedId = id;
        this.processStyleAndRender("", []);
    }


    _onClick(sender: any) {
        this.selectedId = sender.id;
        this.render();
        if (isDefined(this.actionDelegate) && isDefined(this.actionDelegateEventName) && isDefined(this.actionDelegate[this.actionDelegateEventName])) {
            this.actionDelegate[this.actionDelegateEventName](this, sender.id);
        }
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style)
        if (!this.dataSource) {
            return;
        }
        this.detachAllChildren();

        let container = new View();
        container.overflow = 'hidden';
        container.boundsForView = function (parentBounds) {
            return setProps(fillParentBounds(parentBounds), {
                position: 'relative'
            });
        }
        container.initView(generateV4UUID());
        this.attach(container);

        this.right = new Btn();
        this.right.boundsForView = function (parentBounds) {
            return new Bounds(NUConvertToPixel(parentBounds.width).amount - NUConvertToPixel(parentBounds.height).amount, 0, NUConvertToPixel(parentBounds.height).amount, NUConvertToPixel(parentBounds.height).amount);
        }
        this.right.fontFamily = 'FontAwesome5ProSolid';
        this.right.text = "&#xf0da;";
        this.right.initView(generateV4UUID());
        this.attach(this.right);
        this.right.setActionDelegate(this, "onRight");


        this.left = new Btn();
        this.left.boundsForView = function (parentBounds) {
            return new Bounds(NUConvertToPixel(parentBounds.width).amount - (NUConvertToPixel(parentBounds.height).amount * 2), 0, NUConvertToPixel(parentBounds.height).amount, NUConvertToPixel(parentBounds.height).amount);
        }
        this.left.fontFamily = 'FontAwesome5ProSolid';
        this.left.text = "&#xf0d9;";
        this.left.initView(generateV4UUID());
        this.attach(this.left);
        this.left.setActionDelegate(this, "onLeft");

        let x = 0;
        let totalWidth = 0;

        if (this.tabOffset > 0) {
            for (let i = 0; i < this.dataSource.length; i += 1) {
                let o = this.dataSource[i];
                if (!isDefined(o)) {
                    continue;
                }
                let width = (o.width === undefined) ? 100 : o.width;
                if (this.tabOffset > i) {
                    x = x - width;
                }
            }
        }

        for (let i = 0; i < this.dataSource.length; i += 1) {
            let o = this.dataSource[i];
            if (!isDefined(o)) {
                continue;
            }

            let width = (o.width === undefined) ? 100 : o.width;
            totalWidth += width;

            let v = new Label();
            v.keyValues["index"] = i;
            v.keyValues["x"] = x;
            v.keyValues["width"] = width;
            v.boundsForView = function (parentBounds: Bounds): Bounds {
                return {
                    kind: "Bounds",
                    x: px(this.keyValues["x"]),
                    y: px(0),
                    width: px(this.keyValues["width"]),
                    height: parentBounds.height,
                    unit: 'px',
                    position: "absolute",
                    rotation: new NumberWithUnit(0, "deg"),
                    elevation: new NumberWithUnit(0, "auto")
                };
            };
            //v.fillLineHeight = true;
            v.styles = this.getStylesForTargetId(this.dataSource[i].id === this.selectedId ? "active" : "inactive", true);
            v.text = o.text;
            //v.getDefaultStyle().userSelect = "none";
            //v.getDefaultStyle().cursor = "pointer";
            //v.textAlignment = 'center';

            v.initView(o.id);
            container.attach(v);
            v.setClickDelegate(this, "_onClick");

            x = x + width;


        }

        let myBounds = this.getBounds("");


        if (totalWidth > NUConvertToPixel(myBounds.width).amount) {
            this.left.setVisible(true);
            this.right.setVisible(true);
            if (this.tabOffset === 0) {
                this.left.setEnabled(false);
                this.right.setEnabled(true);
            } else {
                if (this.tabOffset < this.dataSource.length - 1) {
                    this.left.setEnabled(true);
                    this.right.setEnabled(true);
                } else {
                    this.left.setEnabled(true);
                    this.right.setEnabled(false);
                }
            }
        } else {
            this.left.setVisible(false);
            this.right.setVisible(false);
        }


    }

    onRight() {
        this.tabOffset += 1;
        if (this.tabOffset > this.dataSource.length -1) {
            this.tabOffset = this.dataSource.length - 1;
        }
        this.selectedId = this.dataSource[this.tabOffset].id;
        this.render();
        if (isDefined(this.actionDelegate) && isDefined(this.actionDelegateEventName) && isDefined(this.actionDelegate[this.actionDelegateEventName])) {
            this.actionDelegate[this.actionDelegateEventName](this, this.selectedId);
        }

    }
    onLeft() {
        this.tabOffset -= 1;
        if (this.tabOffset < 0) {
            this.tabOffset = 0;
        }
        this.selectedId = this.dataSource[this.tabOffset].id;
        this.render();
        if (isDefined(this.actionDelegate) && isDefined(this.actionDelegateEventName) && isDefined(this.actionDelegate[this.actionDelegateEventName])) {
            this.actionDelegate[this.actionDelegateEventName](this, this.selectedId);
        }
    }


}