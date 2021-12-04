import {View} from "../View/View";
import {Fill} from "../View/Fill";
import {isDefined} from "../Utils/isDefined";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {Label} from "./Label";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {Direction} from "../Containers/Direction";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {setProps} from "../baseClass";


export class Menu extends View {

    dataSource?: {id: string, text: string}[];
    direction: Direction = Direction.horizontal;

    showSelectedBar: boolean = true;
    selectedBarPlacement: 'after' | 'before' = 'after';





    constructor() {
        super();
        this.properties.push(
            {
                kind: "LayerProperty",
                property_id: "menu.selectedId",
                id: "menu.selectedId",
                type: "number",
                title: "selectedId",
                value: 0,
                group: "property"
            }
        )
        this.styles = [
            {
                kind: "ViewStyle",
                textStyle: setProps(new PropertyTextStyle(),
                    {
                        color: new Fill(true, "color", "normal", "rgba(255, 255, 255, 1.0)")
                    } as PropertyTextStyle)
            },
            {
                kind: "ViewStyle",
                id: "selectedRow",
                fills: [new Fill(true, "color", "normal", "rgba(150, 150, 150, 1.0)")],
            },
            {
                kind: "ViewStyle",
                id: "underline",
                fills: [new Fill(true, "color", "normal", "rgba(255, 150, 150, 1.0)")]
            }
        ]


    }

    get selectedId(): string|number|undefined {
        let prop = this.properties.find((p) => { return p.property_id === "menu.selectedId;"});
        if (isDefined(prop)) {
            return prop.id;
        }
        return undefined;
    }

    set selectedId(value: string | number) {
        let prop = this.properties.find((p) => { return p.property_id === "menu.selectedId;"});
        if (isDefined(prop)) {
            prop.value = value;
        }
    }


    _onClick(sender: any) {
        this.selectedId = sender.id;
        this.processStyleAndRender("", []);

        if (isDefined(this.actionDelegate) && isDefined(this.actionDelegateEventName) && isDefined(this.actionDelegate[this.actionDelegateEventName])) {
            this.actionDelegate[this.actionDelegateEventName](this, sender.id);
        }
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        this.detachAllChildren();

        if (!this.dataSource) {
            return;
        }


        for (let i = 0; i < this.dataSource.length; i += 1) {
            let o = this.dataSource[i];
            if (!isDefined(o)) {
                continue;
            }
            let v = new Label();
            v.keyValues["index"] = i;
            v.boundsForView = function (parentBounds: Bounds): Bounds {
                if ((this.parentView! as Menu).showSelectedBar === false) {
                    return boundsWithPixels({
                        x: this.keyValues["index"] * 100,
                        y: 0,
                        width: 100,
                        height: parentBounds.height.amount,
                        unit: 'px',
                        position: 'absolute'
                    });
                } else {
                    if ((this.parentView! as Menu).selectedBarPlacement === 'after') {
                        return boundsWithPixels({
                            x: this.keyValues["index"] * 100,
                            y: 0,
                            width: 100,
                            height: parentBounds.height.amount - 5,
                            unit: 'px',
                            position: 'absolute'
                        });
                    } else {
                        return boundsWithPixels({
                            x: this.keyValues["index"] * 100,
                            y: 5,
                            width: 100,
                            height: parentBounds.height.amount - 5,
                            unit: 'px',
                            position: 'absolute'
                        });
                    }
                }
            };
            v.fillLineHeight = true;
            v.fontSize = 14;
            v.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
            v.textAlignment = 'center';
            v.fontWeight = '400';
            v.text = o.text;
            if (o.id === this.selectedId) {
                let styles = this.getStylesForTargetId("selectedRow", true);
                v.styles = styles;
            } else {
                v.styles = this.styles;
            }
            v.initView(o.id);
            this.attach(v);
            v.setClickDelegate(this, "_onClick");

            if (this.showSelectedBar) {
                let underline = new View();
                underline.keyValues["index"] = i;
                underline.boundsForView = function (parentBounds: Bounds): Bounds {
                    let h: number | undefined;
                    if (parentBounds.height) {
                        h = parentBounds.height.amount - 5
                    }
                    if ((this.parentView! as Menu).selectedBarPlacement === 'after') {
                        return boundsWithPixels({
                            x: this.keyValues["index"] * 100,
                            y: h,
                            width: 100,
                            height: 5,
                            unit: 'px',
                            position: 'absolute'
                        });
                    } else {
                        return boundsWithPixels({
                            x: this.keyValues["index"] * 100,
                            y: 0,
                            width: 100,
                            height: 5,
                            unit: 'px',
                            position: 'absolute'
                        });
                    }
                };
                if (o.id === this.selectedId) {
                    let styles = this.getStylesForTargetId("selectedRow", true);
                    underline.styles = styles;
                } else {
                    underline.fills = [];
                }
                underline.initView(o.id + ".underline");
                this.attach(underline);
            }

        }


    }


}