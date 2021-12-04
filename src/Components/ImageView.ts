import {View} from "../View/View";
import {ImageViewDelegate} from "./ImageViewDelegate";
import {isDefined} from "../Utils/isDefined";
import {Application, SessionEvent} from "../Application/Application";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";


export class ImageView extends View {

    delegate?: ImageViewDelegate;

    imageURI: string = '';
    imageWidth: number = 48;
    imageHeight: number = 48;

    protected innerImg: any;
    fit: string = 'fill';



    constructor() {
        super();
        if (typeof document !== "undefined") {
            this.innerImg = document.createElement("img");
        }
    }


    viewWillBeDeattached() {
        if (isDefined(this.innerImg)) {
            this.innerImg.uuimageRef = undefined;
            this.innerImg.ondragstart = undefined;
            this.innerImg.onclick = undefined;
            this.innerImg.parentNode.removeChild(this.innerImg);
            this.innerImg = undefined;
            this.imageURI = "";
        }
    }


    viewWillLoad(){
        super.viewWillLoad();

        while (this.getDiv().hasChildNodes()) {
            this.getDiv().removeChild(this.getDiv().lastChild);
        }

        this.getDiv().style.zIndex = 1;

        this.innerImg.style.all = 'unset';
        this.innerImg.uiimageRef = this;
        this.innerImg.onclick = function (e: MouseEvent) {
            this.uiimageRef.imageClicked(this.uiimageRef);
        };
        this.innerImg.onerror = function () {
            if (isDefined(this.uiimageRef.delegate) && isDefined(this.uiimageRef.delegate.imageViewImageNotLoaded)) {
                this.uiimageRef.delegate.imageViewImageNotLoaded(this.uiimageRef);
            }
        }
        this.innerImg.ondragstart = function() { return false; };
        this.getDiv().appendChild(this.innerImg);

        this.render();
    }

    setImageURI(uri: string) {
        this.imageURI = uri;
        this.render();
    }

    imageClicked(sender?: any) {

        const event_param = {
            viewController_id: (this.viewController) ? this.viewController.id : '',
            image_id: this.id
        };
        Application.instance.session_event(SessionEvent.kEvent_User,'Image.Click', event_param);

        if (this.actionDelegate && this.actionDelegateEventName) {
            this.actionDelegate[this.actionDelegateEventName](sender);
        }
    }


    render (parentBounds?:Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);
        let bounds: Bounds;
        if (isDefined(style)) {
            bounds = style.bounds;
        } else {
            if (isDefined(this.cachedStyle)) {
                bounds = this.cachedStyle.bounds;
            } else {
                bounds = this.getBounds("");
            }
        }
        if (bounds.width) {
            this.innerImg.style.width = bounds.width.amount + bounds.width.unit;
        }
        if (bounds.height) {
            this.innerImg.style.height = bounds.height.amount + bounds.height.unit;
        }
        this.innerImg.position = bounds.position;
        this.innerImg.src = this.imageURI;

        this.innerImg.style.objectFit = this.fit;
        this.innerImg.style.overflow = 'hidden';
    }


}

