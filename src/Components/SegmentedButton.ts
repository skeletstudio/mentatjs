import {Label} from "./Label";

import {isDefined} from "../Utils/isDefined";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {Btn} from "./Btn";


export class SegmentedButton extends Label {

    buttonsOptions: any = undefined;
    selectedID: string = "";
    noBorder: boolean = false;
    buttonsViews: Btn[];


    constructor() {
        super();
        this.buttonsViews = [];
    }


    clear() {
        "use strict";

        if (isDefined(this.buttonsOptions)) {
            for (let i = 0; i < this.buttonsOptions.length; i++) {
                delete this.buttonsOptions[this.buttonsOptions.length - 1].btn;
            }
        }

        if (isDefined(this.buttonsViews)) {
            while (this.buttonsViews.length > 0) {
                this.buttonsViews[this.buttonsViews.length - 1].keyValues["parent"] = undefined;
                this.buttonsViews[this.buttonsViews.length - 1].detachItSelf();
                delete this.buttonsViews[this.buttonsViews.length - 1];
                this.buttonsViews.pop();
            }
        }
        this.buttonsViews = [];
        this.buttonsOptions = [];
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        if (!isDefined(this.getDiv())) {
            return;
        }
        if (!isDefined(this.buttonsViews)) {
            this.buttonsViews = [];
        }
        if (!isDefined(this.buttonsOptions)) {
            this.buttonsOptions = [];
        }

        while (this.buttonsViews.length > 0) {
            this.buttonsViews[this.buttonsViews.length-1].keyValues["parent"] = undefined;

            this.buttonsViews[this.buttonsViews.length-1].detachItSelf();
            delete this.buttonsViews[this.buttonsViews.length-1];
            this.buttonsViews.pop();

        }
        let buttonGroup = generateV4UUID();
        for (let i = 0; i < this.buttonsOptions.length; i++) {

            const id: string = this.buttonsOptions[i].id;
            const text: string = this.buttonsOptions[i].text;
            // const icon: string | undefined = this.buttonsOptions[i].icon;

            const b = new Btn();
            b.parentView = this;
            b.keyValues["stateID"] = id;
            b.keyValues["index"] = i;
            b.text = text;
            b.isToggle = true;
            b.getDefaultStyle().borders = [];
            b.buttonGroup = buttonGroup;

            b.fontFamily = this.fontFamily;
            b.fontSize = this.fontSize;
            b.fontWeight = this.fontWeight;


            //b.isLayoutEditor = this.isLayoutEditor;
            if (i === 0) {
                b.borderRadius = {tl: new NumberWithUnit(3, "px"), tr: new NumberWithUnit(0, "px"), bl: new NumberWithUnit(3, "px"), br: new NumberWithUnit(0, "px")};
            }
            if (i > 0 && i < this.buttonsOptions.length -1) {
                b.borderRadius = {tl: new NumberWithUnit(3, "px"), tr: new NumberWithUnit(0, "px"), bl: new NumberWithUnit(3, "px"), br: new NumberWithUnit(0, "px")};
            }
            if (i === this.buttonsOptions.length -1) {
                b.borderRadius = {tl: new NumberWithUnit(0, "px"), tr: new NumberWithUnit(3, "px"), bl: new NumberWithUnit(0, "px"), br: new NumberWithUnit(3, "px")};
            }

            // add the button before we attach
            this.buttonsOptions[i].btn = b;

            b.boundsForView = function(parentBounds: Bounds): Bounds {
                if (!this.parentView) {
                    throw "Button in Segmented button has lost its parent";
                }
                const w = this.parentView!.bounds.width.amount / (this.parentView! as SegmentedButton).buttonsOptions.length;
                const x = (this.keyValues["index"] * w);
                return boundsWithPixels({
                    x: x,
                    y: 0,
                    width: w,
                    height: this.parentView!.bounds.height.amount,
                    unit: 'px',
                    position: 'absolute'
                });

            };
            b.initView(this.id+'.'+id);
            //if (this.isLayoutEditor === false) {
                b.setActionDelegate(this, 'buttonPressed');
            //}
            this.attach(b);

            //b.setTextSize(10 + 'px');

            if (this.buttonsOptions[i].enabled !== undefined) {
                if (this.buttonsOptions[i].enabled === false) {
                    b.setEnabled(false);
                }
            }
            if (this.buttonsOptions[i].id === this.selectedID) {
                b.setToggled(true);
            } else {
                b.setToggled(false);
            }


            this.buttonsViews.push(b);

        }
        this.setCurrent(this.selectedID);
    }

    buttonPressed(sender: Btn) {
        const sid = sender.keyValues["stateID"];
        this.setCurrent(sid);
        if (this.actionDelegate && this.actionDelegateEventName) {
            this.actionDelegate[this.actionDelegateEventName](this,sid);
        }
    }

    clearButtons() {
        this.clear();
    }

    addButton( options: any ) {
        if (this.buttonsOptions === undefined) {
            this.buttonsOptions = [];
        }
        this.buttonsOptions.push(options);
    }

    addButtons(array: any[]) {
        "use strict";
        if (this.buttonsOptions === undefined) {
            this.buttonsOptions = [];
        }
        this.buttonsOptions = this.buttonsOptions.concat(JSON.parse(JSON.stringify(array)));
        this.render();
    }


    setCurrent(buttonID: string) {
        if (!isDefined(this.getDiv())) {
            this.selectedID = buttonID;
            return;
        }

        for (let i = 0; i < this.buttonsOptions.length; i++) {

            let button = this.buttonsOptions[i].btn;
            if (isDefined(button)) {
                if (this.buttonsOptions[i].id === buttonID) {
                    this.selectedID = buttonID;
                    button.setToggled(true);
                    if (this.buttonsOptions[i].pane !== undefined) {
                        this.buttonsOptions[i].pane.setVisible(true);
                    }
                    if (this.buttonsOptions[i].paneId !== undefined) {
                        var paneView = this.parentView!.findViewNamed(this.buttonsOptions[i].paneId);
                        if (paneView !== undefined) {
                            paneView.setVisible(true);
                        }
                    }
                } else {
                    button.setToggled(false);
                    if (this.buttonsOptions[i].pane !== undefined) {
                        this.buttonsOptions[i].pane.setVisible(false);
                    }
                    if (this.buttonsOptions[i].paneId !== undefined) {
                        var paneView = this.parentView!.findViewNamed(this.buttonsOptions[i].paneId);
                        if (paneView !== undefined) {
                            paneView.setVisible(false);
                        }
                    }
                }
            }


        }


    }

}