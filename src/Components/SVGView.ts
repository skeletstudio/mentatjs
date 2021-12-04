import {View} from "../View/View";
import {NUConvertToPixel} from "../NumberWithUnit/NumberWithUnit";


export class CPoint {
    x: number;
    y: number;

    constructor (array: number[]) {
        this.x = +array[0];
        this.y = +array[1];
    }
    setWithSVGPoint (svgPoint: {x: number, y: number}) {
        this.x = svgPoint.x;
        this.y = svgPoint.y;
    }
}

export class SVGPoint {
    type: 'point' | 'curvePoint' = 'point';

    point: CPoint;
    curveFrom: CPoint;
    curveTo: CPoint;
    hasCurveFrom: boolean;
    hasCurveTo: boolean;
    cornerRadius: number;
    curveMode: number;
}


export class SVGView extends View {
    className: string = "MentatJS.SVGView";
    element: 'shapeGroup' | 'shapePath' | 'rectangle' | 'oval' | 'polyline';
    path: 'string';

    protected svg: any;
    isCached: boolean = false;

    booleanOp: string;
    isFlippedVertical: boolean;
    isFlippedHorizontal: boolean;
    rotation: number;

    isClosed: boolean;


    points: SVGPoint[] = [];



    doResize() {
        super.doResize();
        if (this.svg) {
           this.isCached = false;
           this.render();
        }
    }

    getShapePointInfo(bounds, point) {
        let ret: {
            type: 'point' | 'curvePoint',
            point: {x: number, y: number},
            from?: {x: number, y: number},
            to?: {x: number, y: number},
            curveMode?: number,
            cornerRadius?: number,
            hasCurveFrom?: boolean,
            hasCurveTo?: boolean
        } = {
            type: point.type,
            point: { x: 0, y: 0}
        };
        let _point = point.point;
        ret.point.x = _point.x * bounds.width.amount;
        ret.point.y = _point.y * bounds.height.amount;

        if (ret.type === 'curvePoint') {
            let _from = point.curveFrom;
            let _to = point.curveTo;
            ret.from = {x: _from.x * bounds.width.amount, y: _from.y * bounds.height.amount};
            ret.to = {x: _to.x * bounds.width.amount, y: _to.y * bounds.height.amount};
            ret.curveMode = point.curveMode;
            ret.cornerRadius = point.cornerRadius;
            ret.hasCurveFrom = point.hasCurveFrom;
            ret.hasCurveTo = point.hasCurveTo;
        }
        return ret;
    }

    getStyle() {
        let ret: {
            fill: string,
            stroke: string,
            "stroke-width": number,
            rotation: number
        } = {
            fill: "none",
            stroke: "none",
            "stroke-width": 0,
            rotation: 0
        };

        let hasFill = false;
        let hasBorder = false;
        if (this.fills.length > 0) {
            for (let fx = 0; fx < this.fills.length; fx +=1) {
                let f = this.fills[fx];
                if (f.active === true) {
                    if (f.type === 'color') {
                        ret.fill = f.value;
                        hasFill = true;
                        break;
                    }
                }
            }
        }
        if (!hasFill) {
            ret.fill = "none";
        }
        if (this.borders.length > 0) {
            for (let bx = 0; bx < this.borders.length; bx += 1) {
                let b = this.borders[bx];
                if (b.active === true) {
                    ret.stroke = b.value;
                    ret["stroke-width"] = b.thickness;
                    hasBorder = true;
                }
            }
        }
        if (!hasBorder) {
            ret["stroke-width"] = 0;
        }

        ret.rotation = this.rotation;
        return ret;
    }

    generate(): any {
        let bounds = this.getBounds("");
        let gElement = document .createElementNS("http://www.w3.org/2000/svg", "g");
        let elementToSpawn = "path";
        if (this.element === "rectangle") {
            elementToSpawn = "rect";
        }
        if (this.element === "shapePath") {
            elementToSpawn = "path";
        }
        if (this.element === "oval") {
            elementToSpawn = "ellipse";
        }
        if (this.element === "shapeGroup") {
            return gElement;
        }
        let pathElement = document .createElementNS("http://www.w3.org/2000/svg", elementToSpawn);

        if (elementToSpawn === "rect") {
            pathElement.setAttribute("x", NUConvertToPixel(bounds.x).amount.toString());
            pathElement.setAttribute("y", NUConvertToPixel(bounds.y).amount.toString());
            pathElement.setAttribute("width", NUConvertToPixel(bounds.width).amount.toString());
            pathElement.setAttribute("height", NUConvertToPixel(bounds.height).amount.toString());
            if (this.borderRadius && this.borderRadius.tl.amount > 0) {
                pathElement.setAttribute("rx", this.borderRadius.tl.amount.toString())
            }
        }
        if (elementToSpawn === "ellipse") {
            pathElement.setAttribute("cx", (bounds.x.amount + bounds.width.amount / 2).toString());
            pathElement.setAttribute("cy", (bounds.y.amount + bounds.height.amount / 2).toString());
            pathElement.setAttribute("rx", (bounds.width.amount / 2).toString());
            pathElement.setAttribute("ry", (bounds.height.amount / 2).toString());
        }
        if (elementToSpawn === "path") {

            let svgString = "";

            for (let p = 0; p < this.points.length; p += 1) {
                let pointInfo = this.getShapePointInfo(bounds, this.points[p]);

                if (pointInfo.type === 'point') {
                    if (p === 0) {
                        svgString = `M${pointInfo.point.x},${pointInfo.point.y} `;
                    } else {
                        svgString += `L${pointInfo.point.x},${pointInfo.point.y} `;
                    }
                }

                if (pointInfo.type === 'curvePoint') {
                    if (p === 0) {
                        svgString += `M${pointInfo.point.x},${pointInfo.point.y} `;
                    }


                        svgString += `C${pointInfo.from.x},${pointInfo.from.y} `;
                        let nextPointInfo;
                        if (p + 1 >= this.points.length) {
                            nextPointInfo = this.getShapePointInfo(bounds, this.points[0]);
                        } else {
                            nextPointInfo = this.getShapePointInfo(bounds, this.points[p + 1]);
                        }
                        svgString += `${nextPointInfo.to.x},${nextPointInfo.to.y} ${nextPointInfo.point.x},${nextPointInfo.point.y} `;

                }

            }

            if (this.isClosed) {
                svgString += "Z";
            }

            pathElement.setAttribute("d", svgString);


        }

        let style = this.getStyle();
        let parentStyle;
        if (this.parentView instanceof SVGView) {
            parentStyle = this.parentView.getStyle();
            if (style.fill === "none") {
                style.fill = parentStyle.fill;
            }
            if (style.stroke === "none") {
                style.stroke = parentStyle.stroke;
            }
            if (style["stroke-width"] === 0) {
                style["stroke-width"] = parentStyle["stroke-width"];
            }
            if (style.rotation === 0) {
                style.rotation = parentStyle.rotation;
            }

        }

        pathElement.setAttribute("fill", style.fill);
        pathElement.setAttribute("stroke", style.stroke);
        pathElement.setAttribute("stroke-width", style["stroke-width"].toString());

        if (style.rotation !== 0) {
            pathElement.setAttribute("transform", "rotate(" + -style.rotation + ")");
        }


        gElement.appendChild(pathElement);

        return gElement;


    }


    protected renderSVG() {
        if (this.parentView && this.parentView instanceof SVGView) {
            return;
        }
        this.getDiv().innerHTML = "";

        let bounds = this.getBounds("");
        let svg: any = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        // svg.id = this.id;
        //svg.style.width = bounds.width + "px";
        //svg.style.height = bounds.height + "px";
        svg.setAttribute("viewBox", `0 0 ${bounds.width.amount} ${bounds.height.amount}`);
        svg.setAttribute("version", "1,1");
        //  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        //svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        //svg.setAttribute("width", "100%");
        //svg.setAttribute("height", "100%");
        svg.setAttribute("preserveAspectRatio", "none");
        svg.style.position = 'absolute';
        svg.style.top = "0px";
        svg.style.left = "0px";
        svg.style.width = bounds.width.amount + bounds.width.unit;
        svg.style.height = bounds.height.amount + bounds.height.unit;
        this.svg = svg;

        let elem = this.generate();
        if (elem) {
            svg.appendChild(elem);
        }

        for (let i = 0; i < this.subViews.length; i += 1) {
            this.subViews[i].doResize();
            if (this.subViews[i] instanceof SVGView) {
                let subElem = (<SVGView>this.subViews[i]).generate();
                if (subElem) {
                    svg.appendChild(subElem);
                }
            }

        }

        this.getDiv().appendChild(svg);

        this.isCached = true;

    }





    render() {
        if (this.parentView && this.parentView instanceof SVGView) {
            return;
        }
        //if (this.isCached) {
        //    return;
        //}
        this.renderSVG();

    }


}



