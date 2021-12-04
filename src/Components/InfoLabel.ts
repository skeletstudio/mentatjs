import {View} from "../View/View";
import {Label} from "./Label";
import {Bounds} from "../Bounds/Bounds";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {Fill} from "../View/Fill";
import {BorderRadius} from "../View/BorderRadius";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {setProps} from "../baseClass";
import {ViewStyle} from "../View/ViewStyle";


export class InfoLabelView extends View {

    label: Label;
    constructor() {
        super();
        this.styles = [
            {
                kind: "ViewStyle",
                fills: [new Fill(true, "color", "normal", "rgba(200, 50, 20, 1.0)")],
                borderRadius: new BorderRadius(3, 3, 3, 3),
            },
            {
                kind: "ViewStyle",
                id: "label",
                textStyle: setProps(new PropertyTextStyle(),
                    {

                        color: new Fill(true, "color", "normal", "rgba(255, 255, 255, 1.0)")
                    } as PropertyTextStyle)
            }
        ]
        this.label = new Label();
    }


    viewWasAttached() {
        this.label.boundsForView = function (parentBounds: Bounds): Bounds {
            let w: number | undefined;
            if (parentBounds.width) {
                w = parentBounds.width.amount - 10;
            } else {
                w = undefined;
            }
            let h: number | undefined;
            if (parentBounds.height) {
                h = parentBounds.height.amount - 10;
            } else {
                h = undefined;
            }
            return boundsWithPixels({
                x: 5,
                y: 5,
                width: w,
                height: h,
                unit: "px",
                position: "absolute"
            });
        };

        this.label.initView("label");
        this.attach(this.label);
        this.label.getDiv().style.lineHeight = 1.4;


    }


    setText(value: string) {
        this.label.setText(value);
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

    }


}