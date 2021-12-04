import {View} from "../View/View";
import {isDefined} from "../Utils/isDefined";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";


export class ProgressBar extends View {

    progressBar? : any = undefined;

    max: number = 100;
    value: number = 0;

    tagNameToCreate = "progress";

    constructor() {
        super();
    }


    setMax(value: number) {
        this.max = value;
        if (isDefined(this.getDiv())) {
            this.getDiv().max = value;
        }
    }

    setValue(value: number) {
        this.value = value;
        if (isDefined(this.getDiv())) {
            this.getDiv().value = value;
        }
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);
        this.getDiv().min = 0;
        this.getDiv().max = this.max;
        this.getDiv().value = this.value;
    }
}