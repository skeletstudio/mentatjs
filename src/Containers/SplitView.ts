import {View} from "../View/View";
import {Direction} from "./Direction";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";


export class SplitView extends View {
    viewA: View;
    viewB: View;


    divisionView: View;
    direction: Direction;
    length: NumberWithUnit = new NumberWithUnit(0, "px");


    constructor() {
        super();
        this.viewA = new View();
        this.viewB = new View();
        this.divisionView = new View();
        this.direction = Direction.horizontal;
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

        if (this.length === undefined) {
            console.warn('length not defined');
            return;
        }


        this.divisionView.doResize();
        if (this.direction === Direction.horizontal) {
            this.divisionView.cursor = 'e-resize';
        } else {
            this.divisionView.cursor = 'n-resize';
        }
        this.divisionView.render();


        this.viewA.doResize();
        this.viewB.doResize();

        this.viewA.render();
        this.viewB.render();


    }


    viewWasAttached() {
        "use strict";
        this.viewA = new View();
        this.viewB = new View();
        this.divisionView = new View();
        this.viewA.boundsForView = function (parentBounds: Bounds): Bounds {
            //this.parentView.viewANode.anchors["width"] = {active: true, target: "", targetAnchor:"", constant: (this.parentview.direction === "horizontal") ? this.parentView.length : parentBounds.width};
            //this.parentView.viewANode.anchors["height"] = {active: true, target: "", targetAnchor: "", constant: (this.parentView.direction === "horizontal") ? parentBounds.height : this.parentView.length};
            if ((this.parentView! as SplitView).direction === Direction.horizontal) {
                return boundsWithPixels({
                    x: 0,
                    y: 0,
                    width: (this.parentView! as SplitView).length.amount,
                    height: parentBounds.height.amount,
                    unit: 'px',
                    position: 'absolute'
                });
            } else {
                return boundsWithPixels({
                    x: 0,
                    y: 0,
                    width: parentBounds.width.amount,
                    height: (this.parentView! as SplitView).length.amount,
                    unit: 'px',
                    position: 'absolute'
                });
            }
        };
        this.viewB.boundsForView = function (parentBounds: Bounds): Bounds {
            //this.parentView.viewBNode.anchors["width"] = {active: true, target: "", targetAnchor:"", constant: (this.parentView.direction === "horizontal") ? (parseInt(parentBounds.width) - parseInt(this.parentView.length)) : parseInt(parentBounds.width)};
            //this.parentView.viewBNode.anchors["height"] = {active: true, target: "", targetAnchor: "", constant: (this.parentView.direction === "horizontal") ? parseInt(parentBounds.height) : (parseInt(parentBounds.height) - parseInt(this.parentView.length))};
            if ((this.parentView! as SplitView).direction === Direction.horizontal) {
                return boundsWithPixels({
                    x: (this.parentView! as SplitView).length.amount + 2,
                    y: 0,
                    width: parentBounds.width.amount - (this.parentView! as SplitView).length.amount - 2,
                    height: parentBounds.height.amount,
                    unit: 'px',
                    position: 'absolute'
                });
            } else {
                return boundsWithPixels({
                    x: 0,
                    y: (this.parentView! as SplitView).length.amount + 2,
                    width: parentBounds.width.amount,
                    height: parentBounds.height.amount - (this.parentView! as SplitView).length.amount - 2,
                    unit: 'px',
                    position: 'absolute'
                });
            }
        };
        this.divisionView.boundsForView = function (parentBounds: Bounds): Bounds {
            if ((this.parentView! as SplitView).direction === Direction.horizontal) {
                return boundsWithPixels({
                    x: (this.parentView! as SplitView).length.amount,
                    y: 0,
                    width: 2,
                    height: parentBounds.height.amount,
                    unit: 'px',
                    position: 'absolute'
                });
            } else {
                return boundsWithPixels({
                    x: 0,
                    y: (this.parentView! as SplitView).length.amount,
                    width: parentBounds.width.amount,
                    height: 2,
                    unit: 'px',
                    position: 'absolute'
                });
            }
        };
        this.divisionView.setDraggable(true);
        //this.viewA.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(225,122,111)'}];
        //this.viewB.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(111,255,111)'}];
        this.divisionView.fills = [{active: true, type: 'color', blendMode: 'normal', value: 'rgb(228,228,228)'}];
        this.viewA.initView(this.id + ".viewA");
        this.viewB.initView(this.id + ".viewB");
        this.divisionView.initView(this.id + ".divisionView");
        this.attach(this.viewA);
        this.attach(this.viewB);
        this.attach(this.divisionView);
    }


}