import {BaseClass} from "../baseClass";
import {View} from "../View/View";
import {NavigationController} from "../NavigationController/NavigationController";
import {FullScreenPaneDelegate} from "./FullScreenPaneDelegate";
import {Bounds} from "../Bounds/Bounds";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {Fill} from "../View/Fill";
import {Application} from "../Application/Application";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";
import {Btn} from "../Components/Btn";


export class FullScreenPane extends BaseClass {
    id: string = '';

    backgroundView?: View;
    contentView?: View;

    delegate?: any =  undefined;
    opacity: number = 60;
    navigationController?: NavigationController;

    backgroundColor: string = "";

    showCloseButton: boolean = false;
    isModal: boolean = true;

    protected closeButton?: Btn;

    constructor() {
        super();
    }


    initFullscreenPane(_delegate: FullScreenPaneDelegate, _options: any) {
        this.backgroundColor = "rgb(50,50,50)";
        this.opacity = 60;
        this.showCloseButton = true;
        this.isModal = true;

        if (_options !== undefined) {
            if (_options.backgroundColor !== undefined) {
                this.backgroundColor = _options.backgroundColor;
            }
            if (_options.opacity !== undefined) {
                this.opacity = _options.opacity;
            }
            if (_options.showCloseButton !== undefined) {
                this.showCloseButton = _options.showCloseButton;
            }
            if (_options.isModal !== undefined) {
                this.isModal = _options.isModal;
            }
        }


        this.delegate = _delegate;

        if (this.isModal) {
            this.backgroundView = new View();
            this.backgroundView.boundsForView = function (parentBounds: Bounds): Bounds {
                return boundsWithPixels({
                    x: 0,
                    y: 0,
                    width: parentBounds.width.amount,
                    height: parentBounds.height.amount,
                    unit: "px",
                    position: "absolute"
                });
            };
            this.backgroundView.fills = [new Fill(true, 'color', 'normal', this.backgroundColor)];
            this.backgroundView.opacity = 40;
            this.backgroundView.initView("fullscreenBackgroundView");
            Application.instance.rootView!.attach(this.backgroundView);
            this.backgroundView.getDiv().style.zIndex = 100;
        }

        this.contentView = new View();
        this.contentView.boundsForView = function (parentBounds: Bounds): Bounds {
            return boundsWithPixels({
                x: 0,
                y: 0,
                width: parentBounds.width.amount,
                height: parentBounds.height.amount,
                unit: "px",
                position: "absolute"
            });
        };
        this.contentView.fills = [];
        this.contentView.initView("fullscreenContentView");
        Application.instance.rootView!.attach(this.contentView);
        this.contentView.getDiv().style.zIndex = 101;
        //if (this.isModal === false) {
        //    MentatJS.applyClickThrough(this.contentView);
        //}

        if (this.showCloseButton) {

            this.closeButton = new Btn();
            this.closeButton.boundsForView = function (parentBounds: Bounds): Bounds {
                return boundsWithPixels({
                    x: 7,
                    y: 7,
                    width: 48,
                    height: 48,
                    unit: "px",
                    position: "absolute"
                });
            };
            this.closeButton.text = "&#xf00d;";
            this.closeButton.borderRadius = {tl: new NumberWithUnit(24, "px"), tr: new NumberWithUnit(24, "px"), bl: new NumberWithUnit(24, "px"), br: new NumberWithUnit(24, "px")};
            this.closeButton.initView("fullscreenCloseButton");
            Application.instance.rootView!.attach(this.closeButton);
            this.closeButton.getDiv().style.zIndex = 102;
            this.closeButton.viewController = Application.instance.viewController;
            this.closeButton.setActionDelegate(this, "_onClose");

        }

        this.navigationController = new NavigationController();
        this.navigationController.initNavigationControllerWithRootView("fullscreenNavigationController", this.contentView);



        Application.instance.registerForNotification('noticeBodyClicked', this);

    }

    noticeBodyClicked(sender: any) {
        this._onClose();
    }

    _removeFullscreenPane() {
        if (this.showCloseButton) {
            if (this.closeButton) {
                this.closeButton.detachItSelf();
                delete this.closeButton;
            }
        }
        this.navigationController!.clear();
        this.contentView!.detachItSelf();
        if (this.isModal) {
            this.backgroundView!.detachItSelf();
        }
        //this.closeButton = undefined;
        delete this.navigationController;
        delete this.contentView;
        delete this.backgroundView;
        Application.instance.deregisterForNotification('noticeBodyClicked', this.id);
    }

    _onClose(){
        this.closeWithStatus({"cancel": true});
    }


    closeWithStatus(status: any) {
        this._removeFullscreenPane();
        if (this.delegate !== undefined) {
            if (this.delegate["fullscreenPaneDidClosed"] !== undefined) {
                this.delegate["fullscreenPaneDidClosed"](this, status);
            }
        }
    }




}