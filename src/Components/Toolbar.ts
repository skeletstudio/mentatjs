import {View} from "../View/View";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {NUConvertToPixel} from "../NumberWithUnit/NumberWithUnit";
import {isDefined} from "../Utils/isDefined";
import {generateV4UUID} from "../Utils/generateV4UUID";
import {Direction} from "../Containers/Direction";


export class Toolbar extends View {

    controls: { id?: string, viewFn?: ()=>View, width?: number, isSpace: boolean }[] = [];

    protected _controls : {id: string, view: View, x: number, width: number}[] = [];

    direction: Direction = Direction.horizontal;


    findControlForId(id: string): View {
        for (let i = 0; i < this._controls.length; i += 1) {
            if (this._controls[i].id === id) {
                return this._controls[i].view;
            }
        }
        return undefined;
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        this.detachAllChildren();
        super.render(parentBounds, style);

    //    renderViewStyle(this.getDiv(), this);

        this._controls = [];

        let x: number = 0;

        let totalHeight = NUConvertToPixel(this.bounds.width).amount;
        if (this.direction === Direction.vertical) {
            totalHeight = NUConvertToPixel(this.bounds.height).amount;
        }
        let leftSpace = totalHeight;
        let div: number = 0;
        let stretchableWidthCount = 0;
        let stretchableWidth = 0;

        for (let i = 0; i < this.controls.length; i += 1) {
            if (isDefined(this.controls[i])) {
                let c = this.controls[i];
                if (c.isSpace === true) {
                    div += 1;
                } else {
                    if (!isDefined(c.width) || c.width < 0) {
                        stretchableWidthCount += 1;
                    } else {
                        leftSpace = leftSpace - c.width - 4;
                    }
                }
            }
        }
        if (stretchableWidthCount > 0) {
            stretchableWidth = (leftSpace / stretchableWidthCount) - (4 * stretchableWidthCount)
            leftSpace = leftSpace - (stretchableWidth * stretchableWidthCount) - (4 * stretchableWidthCount);
        }

        for (let i = 0; i < this.controls.length; i += 1) {
            if (isDefined(this.controls[i])) {
                let c = this.controls[i];
                if (c.isSpace === true) {
                    x += leftSpace / div;
                } else {
                    x += 2;
                    let v = c.viewFn();
                    v.keyValues["x"] = x;
                    if (!isDefined(c.width) || c.width < 0) {
                        v.keyValues["width"] = stretchableWidth;
                    } else {
                        v.keyValues["width"] = c.width;
                    }
                    v.keyValues["Direction"] = this.direction;
                    v.boundsForView = function (parentBounds) {
                        if (this.keyValues["Direction"] as Direction === Direction.horizontal) {
                            return new Bounds(this.keyValues["x"], 2, this.keyValues["width"], NUConvertToPixel(parentBounds.height).amount - 4);
                        } else {
                            return new Bounds(2, this.keyValues["x"], NUConvertToPixel(parentBounds.width).amount - 4, this.keyValues["width"]);
                        }
                    }
                    v.initView(generateV4UUID());
                    this.attach(v);

                    this._controls.push({
                        id: c.id,
                        view: v,
                        x: x,
                        width: v.keyValues["width"]
                    });
                    x += 2 + v.keyValues["width"];
                }
            }
        }



    }


}