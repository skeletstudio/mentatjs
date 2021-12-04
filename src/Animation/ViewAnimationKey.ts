import {View} from "../View/View";
import {Easing} from "../Utils/easing";


export class ViewAnimationKey {
    view?: View;
    easingFunction: any = Easing.easeLinear;
    duration: number = 300;
    transform: string = 'translateX';
    startValue: number = 0;
    endValue: number = 0;
    direction: number = 1;
    offset: number = 0;
    uniqueGuid: string = "";
    executeOnStart() {

    }

    drawFrame (x: number) {
        let newposition = this.startValue + this.direction * ((this.endValue - this.startValue) * x);
        if (this.startValue>this.endValue) {
            newposition = this.startValue + this.direction * ((this.startValue - this.endValue) * x);
        }
        return this.transform + "(" + newposition + "px) ";
    }


}
