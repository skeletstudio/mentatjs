import {View} from "../View/View";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";


export class FileUpload extends View {

    fileUpload: any = undefined;


    constructor() {
        super();
    }

    render (parentBounds?:Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);

    }


    viewWasAttached() {

        this.fileUpload = document.createElement("input");
        this.fileUpload.type = "file";
        this.getDiv().appendChild(this.fileUpload);

        this.fileUpload.onchange = (e: Event) => {
            if (this.actionDelegate && this.actionDelegateEventName) {
                this.actionDelegate[this.actionDelegateEventName](this, e);
            }
        };
    }

    numberOfFiles() {
        return this.fileUpload.files.length;
    }

    file(index: number): any {
        return this.fileUpload.files[index];
    }


    resize(bounds: Bounds) {
        super.resize(bounds);
        if (this.fileUpload !== undefined) {
            if (bounds.unit) {
                this.fileUpload.style.position = 'absolute'
                this.fileUpload.style.left = 0 + bounds.x.unit;
                this.fileUpload.style.top = 0 + bounds.y.unit;
                if (bounds.height) {
                    this.fileUpload.style.bottom = (bounds.height.amount) + bounds.height.unit;
                    this.fileUpload.style.height = bounds.height.amount + bounds.height.unit;
                }
                if (bounds.width) {
                    this.fileUpload.style.right = (bounds.width.amount) + bounds.width.unit;
                    this.fileUpload.style.width = bounds.width.amount + bounds.width.unit;
                }
            }
        }
    }

}