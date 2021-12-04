import {View} from "../View/View";
import {Application} from "../Application/Application";
import {Bounds} from "../Bounds/Bounds";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {ViewStyle} from "../View/ViewStyle";
import {Fill} from "../View/Fill";


export class RadioButton extends View {

    radioGroup: string = "Group1";
    isSelected: boolean = false;

    Frame: View;
    Frame1: View;
    FrameSelected: View;

    constructor() {
        super();
        this.styles = [
            {
                kind: "ViewStyle",

            },
            {
                kind: "ViewStyle",
                id: "Frame1",
                fills: [new Fill(true, "color", "normal", "rgba(10, 20, 250, 1.0)")],
            },
            {
                kind: "ViewStyle",
                id: "FrameSelected",
                fills: [new Fill(true, "color", "normal", "rgba(10, 20, 250, 1.0)")],
            }
        ]
        this.Frame = new View();
        this.Frame1 = new View();
        this.FrameSelected = new View();
    }

    viewWasDetached() {
        Application.instance.deregisterForNotification("kRadioButtonSelected", this.id);
        this.Frame.getDiv().classRef = undefined;
        this.Frame.getDiv().onclick = undefined;
        this.Frame.getDiv().onmouseover = undefined;
        this.Frame.getDiv().onmouseout = undefined;
        this.Frame.detachItSelf();

    }

    viewWasAttached() {
        this.getDiv().style.backgroundColor = "transparent";
        this.getDiv().style.mentatClassName = "MentatJS.RadioButton";

        this.Frame.boundsForView = function (parentBounds: Bounds): Bounds {
            return boundsWithPixels({
                "x": 0,
                "y": 0,
                "width": parentBounds.width.amount,
                "height": parentBounds.height.amount,
                "unit": "px",
                "position": "absolute"
            });
        };
        this.Frame.initView("Frame");
        this.attach(this.Frame);

        this.Frame1.boundsForView = function (parentBounds: Bounds): Bounds {
            return boundsWithPixels({
                "x": 4,
                "y": 4,
                "width": parentBounds.width.amount - 8,
                "height": parentBounds.height.amount - 8,
                "unit": "px",
                "position": "absolute"
            });
        };
        this.Frame1.initView("Frame1");
        this.Frame.attach(this.Frame1);


        this.FrameSelected.boundsForView = function (parentBounds: Bounds): Bounds {
            return boundsWithPixels({
                "x": 8,
                "y": 8,
                "width": parentBounds.width.amount - 16,
                "height": parentBounds.height.amount - 16,
                "unit": "px",
                "position": "absolute"
            });
        };
        this.FrameSelected.initView("FrameSelected");
        this.Frame.attach(this.FrameSelected);









        Application.instance.registerForNotification("kRadioButtonSelected", this);

    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        this.Frame.getDiv().style.borderRadius = (this.Frame.getBounds("").width.amount / 2) + "px";
        this.Frame1.getDiv().style.borderRadius = (this.Frame1.getBounds("").width.amount / 2) + "px";
        this.FrameSelected.getDiv().style.borderRadius = (this.FrameSelected.getBounds("").width.amount / 2) + "px";

        if (!this.isSelected) {
            this.FrameSelected.setVisible(false);
        } else {
            this.setSelected();
        }

        this.Frame.getDiv().classRef = this;

        this.Frame.getDiv().onmouseover = function (e: MouseEvent) {
            // @ts-ignore
            let div = this;
            if (div.classRef) {
                div.classRef._onMouseOver();
                e.stopPropagation();
            }
        };
        this.Frame.getDiv().onmouseout = function (e: MouseEvent) {
            // @ts-ignore
            let div = this;
            if (div.classRef) {
                div.classRef._onMouseOut();
                e.stopPropagation();
            }
        };
        this.Frame.setClickDelegate(this, "_onClick");


    }



    _onMouseOver () {
        this.isHovering = true;
        this.render();
    }

    _onMouseOut() {
        this.isHovering = false;
        this.render();
    }

    _onClick() {

        if (this.isSelected) {
            ;
        } else {
            this.isSelected = true;
            this.FrameSelected.setVisible(true);
            Application.instance.notifyAll(this, "kRadioButtonSelected", this.radioGroup);
        }

    }

    setSelected() {
        this.isSelected = true;
        this.FrameSelected.setVisible(true);
        Application.instance.notifyAll(this, "kRadioButtonSelected", this.radioGroup);
    }


    kRadioButtonSelected(sender: any, radioGroup: string) {
        if (this.id !== sender.id) {
            if ((sender.isSelected === true) && (radioGroup === this.radioGroup)) {
                if (this.isSelected) {
                    this.isSelected = false;
                    this.FrameSelected.setVisible(false);
                }
            }
        }
    }


}