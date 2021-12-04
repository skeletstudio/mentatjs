import {View} from "../View/View";
import {isDefined} from "../Utils/isDefined";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";
import {BorderRadius} from "../View/BorderRadius";

export class CanvasView extends View {

    shapes: any;


    constructor () {
        super();
        this.shapes = [];
    }


    initView(_id: string,parentView?: View) {
        "use strict";
        this.id = _id;
        this._div = document.createElement('canvas');
        this._div.id = _id;
        //this._div.style.overflowX = 'hidden';
        //this._div.style.overflowY = 'hidden';


        this.subViews = [];
        if (parentView !== undefined) {
            this.parentView = parentView;
        }

        if (this.viewWillLoad !== undefined) {
            this.viewWillLoad();
        }

        if (this.viewDidLoad !== undefined) {
            this.viewDidLoad();
        }
    }

    doResize() {
        const newBounds = this.getBounds("");
        this.resize(newBounds);


        this.render();
    }

    render() {
        if (!isDefined(this._div)) {
            return;
        }
        //this.viewStyleRender();


        var dpr = window.devicePixelRatio || 1;
        // Get the size of the canvas in CSS pixels.
        var rect = this._div.getBoundingClientRect();
        // Give the canvas pixel dimensions of their CSS
        // size * the device pixel ratio.
        this._div.width = rect.width * dpr;
        this._div.height = rect.height * dpr;


        let ctx = this._div.getContext("2d");

        ctx.scale(dpr, dpr);


        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);


        /*
        let fill : Fill;
        let stroke = undefined;
        if (this.fills.length > 0) {
            if (this.fills[0].active === true) {
                fill = this.fills[0].value;
            } else {
                fill = undefined;
            }
        }
        if (this.borders.length > 0) {
            if (this.borders[0].active === true) {
                stroke = this.borders[0].value;
            } else {
                stroke = undefined;
            }
        }
        */
        console.log('canvas drawing');
        console.log('w: ' + this.bounds.width + " h: " + this.bounds.height);

        console.log('shapes:');
        console.dir(this.shapes);

/*
        paper.setup(this._div);



        for (let i = 0; i < this.shapes.length; i += 1) {
            let s = this.shapes[i];

            var myPath = new paper.Path();
            myPath.strokeColor = stroke;
            myPath.fillColor = fill;

            for (let p = 0; p < s.points.length; p += 1) {
                if ((s.points[p].hasCurveFrom === true) && (s.points[p].hasCurveTo === true)) {

                    // for paper.js, we need to replace the absolute position of the control point to a relative position to the central point
                    let c = [s.points[p].point[0] * parseFloat(this.bounds.width), s.points[p].point[1] * parseFloat(this.bounds.height)];
                    let hf = [s.points[p].controlPointFrom[0] * parseFloat(this.bounds.width), s.points[p].controlPointFrom[1] * parseFloat(this.bounds.height)];
                    let ht = [s.points[p].controlPointTo[0] * parseFloat(this.bounds.width), s.points[p].controlPointTo[1] * parseFloat(this.bounds.height)];

                    if (hf[0] < c[0]) {
                        hf[0] = -(c[0] - hf[0]);
                    } else {
                        hf[0] = hf[0] - c[0];
                    }
                    if (hf[1] < c[1]) {
                        hf[1] = -(c[1] - hf[1]);
                    } else {
                        hf[1] = hf[1] - c[1];
                    }

                    if (ht[0] < c[0]) {
                        ht[0] = -(c[0] - ht[0]);
                    } else {
                        ht[0] = ht[0] - c[0];
                    }
                    if (ht[1] < c[1]) {
                        ht[1] = -(c[1] - ht[1]);
                    } else {
                        ht[1] = ht[1] - c[1];
                    }


                    console.log('point ' + c[0] + "," + c[1]);
                    console.log('control from ' + s.points[p].controlPointFrom[0] * parseFloat(this.bounds.width) + "," + s.points[p].controlPointFrom[1] * parseFloat(this.bounds.height) );
                    console.log('control to ' + s.points[p].controlPointTo[0] * parseFloat(this.bounds.width) + "," + s.points[p].controlPointTo[1] * parseFloat(this.bounds.height) );
                    console.log('handle from ' + hf[0] + "," + hf[1]);
                    console.log('handle to ' + ht[0] + "," + ht[1]);

                    let segment_point = new paper.Point(c[0], c[1]);
                    let handle_from = new paper.Point(hf[0], hf[1]);
                    let handle_to = new paper.Point(ht[0], ht[1]);

                    myPath.add(new paper.Segment(segment_point, handle_to, handle_from));
                    //myPath.fullySelected = true;
                }
                else if ((s.points[p].hasCurveFrom === false) && (s.points[p].hasCurveTo === false)) {
                    myPath.add(new paper.Point(s.points[p].controlPointFrom[0] * parseFloat(this.bounds.width), s.points[p].controlPointFrom[1] * parseFloat(this.bounds.height)));
                    myPath.add(new paper.Point(s.points[p].point[0] * parseFloat(this.bounds.width), s.points[p].point[1] * parseFloat(this.bounds.height)));
                    myPath.add(new paper.Point(s.points[p].controlPointTo[0] * parseFloat(this.bounds.width), s.points[p].controlPointTo[1] * parseFloat(this.bounds.height)));
                }
            }
            if (s.isClosed === true) {
                myPath.closed = true;
            }
        }
        paper.view.draw();

 */

    }



    roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: BorderRadius | number, fill: string, stroke: boolean) {
        if (typeof stroke == 'undefined') {
            stroke = true;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        if (typeof radius === 'number') {
            radius = {tl: new NumberWithUnit(radius, "px"), tr: new NumberWithUnit(radius, "px"), br: new NumberWithUnit(radius, "px"), bl: new NumberWithUnit(radius, "px")};
        } else {
            let defaultRadius = {tl: new NumberWithUnit(0, "px"), tr: new NumberWithUnit(0, "px"), br: new NumberWithUnit(0, "px"), bl: new NumberWithUnit(0, "px")};
            radius.tl = radius.tl || defaultRadius.tl;
            radius.tr = radius.tr || defaultRadius.tr;
            radius.bl = radius.bl || defaultRadius.bl;
            radius.br = radius.br || defaultRadius.br;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius.tl.amount, y);
        ctx.lineTo(x + width - radius.tr.amount, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr.amount);
        ctx.lineTo(x + width, y + height - radius.br.amount);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br.amount, y + height);
        ctx.lineTo(x + radius.bl.amount, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl.amount);
        ctx.lineTo(x, y + radius.tl.amount);
        ctx.quadraticCurveTo(x, y, x + radius.tl.amount, y);
        ctx.closePath();
        if (fill) {
            ctx.fill();
        }
        if (stroke) {
            ctx.stroke();
        }

    }




}