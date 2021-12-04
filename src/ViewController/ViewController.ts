import {BaseClass} from "../baseClass";
import {fillParentBounds, View} from "../View/View";
import {NavigationController} from "../NavigationController/NavigationController";
import {isDefined} from "../Utils/isDefined";
import {Logging} from "../Utils/logging";
import {Bounds} from "../Bounds/Bounds";


export class ViewController extends BaseClass {

    id: string = "";
    vcClass: string = "ViewController";
    view?: View;
    navigationController?: NavigationController;

    keyValues: any = {};

    initViewController(_id: string) {
        this.id = _id;
        this.view = this.viewForViewController();
        if (!isDefined(this.view)) {
            Logging.log("ViewController " + this.id + " does not implement viewForViewController.");
            let v = new View();
            v.boundsForView = function (parentBounds) { return fillParentBounds(parentBounds);}
            this.view = v;
        }

        this.view.viewController = this;
        this.view.navigationController = this.navigationController;
        this.view.initView(this.id + ".view");

    }

    viewControllerDidLoad() {

    }

    viewControllerWillBeDestroyed() {
        this.view.detachItSelf();
    }


    viewForViewController() {
        let v = new View();
        v.boundsForView = function (parentBounds) {
            return fillParentBounds(parentBounds);
        };
        return v;
    }

    viewWillBePresented(parentBounds?: Bounds) {

    }


    viewWillLoad(view: View) {

    }
    viewDidLoad(view: View) {

    }

    viewWasPresented() {

    }

}
