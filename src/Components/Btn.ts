import {Label} from "./Label";
import {BorderRadius} from "../View/BorderRadius";
import {Application, SessionEvent} from "../Application/Application";
import {isDefined} from "../Utils/isDefined";
import {Logging} from "../Utils/logging";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {renderTextStyleProps} from "../TextStyle/renderTextStyleProps";
import {NUConvertToPixel} from "../NumberWithUnit/NumberWithUnit";
import {View} from "../View/View";


export class Btn extends Label {

    text: string = '';
    isToggle : boolean = false;
    isFullyRound: boolean = false;
    isEnabled : boolean = true;
    isToggled : boolean = false;
    innerText : string = '';
    buttonGroup: string = "";
    allowClickUntoggle: boolean = true;

    svgIcon: string = '';
    elementName: string = "button";
    constructor(tag: string = "button", _id: string = "", children: View[] = []) {
        super("button", _id, children);
        this.textAlignment = "center";
        this.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        this.fontSize = 12;
        this.getDefaultStyle().borderRadius = new BorderRadius(3,3,3,3);
    }

    viewWasDetached() {
        if (this.isToggle) {
            Application.instance.deregisterForNotification("kButtonToggleGroup", this.id);
        }

        this._div.onclick = undefined;
        this._div.onmouseover = undefined;
        this._div.onmouseout = undefined;
        this._div.viewRef = undefined;
        if (this.actionDelegate !== undefined) {
            this.actionDelegate = undefined;
        }
        this.actionDelegateEventName = "";

    }

    initView(id: string) {
        this.id = id;
        this.growths = [];
        this._div.id = id;
        this._div.style.verticalAlign =  "baseline";
        this._div.style.userSelect = 'none';
        this._div.style.MozUserSelect = 'none';
        this._div.style.webkitUserSelect = 'none';
        this._div.style.boxSizing = "content-box";
        this._div.style.webkitAppearance = 'none';
        this._div.style.height = '30px';
        this._div.style.padding = 0;
        this._div.style.border = 'none';
        this._div.style.background = 'none';
        this._div.style.fontWeight = this.fontWeight;
        this._div.style.fontFamily = this.fontFamily;
        this._div.style.fontSize = this.fontSize + "px";
        this._div.value = this.text;
        this._div.innerHTML = this.text;
        this._div.className = 'fa';
        if (this.viewWillLoad !== undefined)
            this.viewWillLoad();
        if (this.viewDidLoad !== undefined)
            this.viewDidLoad();
        if (this.isToggle) {
            Application.instance.registerForNotification("kButtonToggleGroup", this);
        }
    }

    setTextSize(newSize: string) {
        this._div.style.fontSize = newSize;
    }

    doResize() {

        let newBounds = this.getBounds("");
        this.resize(newBounds);

        this._div.style.textAlign = 'center';


        if (this.subViews === undefined) this.subViews = [];

        for (let i = 0; i < this.subViews.length; i++) {
            this.subViews[i].doResize();
        }
    }


    setText(_txt: string) {
        this.text = _txt;
        if (isDefined(this.getDiv())) {
            this.processStyleAndRender("", []);
        }
    }

    setIcon(uri: string, width: number, height: number) {
        this.svgIcon = `<img src="${uri}" width=${width} height=${height}/>`;
        if (isDefined(this.getDiv())) {
            this.processStyleAndRender("", []);
        }
    }


    setToggled(t: boolean) {
        this.isToggled = t;
        if (isDefined(this.getDiv())) {
            this.processStyleAndRender("", [])
        }
    }

    protected kButtonToggleGroup(sender: any, buttonGroup: string) {
        if (this.buttonGroup === "") {
            return;
        }
        if (this.id !== sender.id) {
            if ((sender.isToggled === true) && (buttonGroup === this.buttonGroup)) {
                if (this.isToggled) {
                    this.setToggled(false);
                }
            }
        }
    }


    protected onEnableStatusChanged(e: boolean) {
        if (!e) {
            this.isEnabled=false;
            if (isDefined(this._div)) {
                this._div.onclick = undefined;
            }
            this.render();
        } else {
            this.isEnabled = true;

            if (isDefined(this._div)) {
                this._div.onclick = function (e: MouseEvent) {
                    if (Logging.enableLogging) {
                        Logging.log('+CLICK ' + this.viewRef.id);
                    }
                    e.preventDefault();
                    e.stopPropagation();
                    if (isDefined(this.viewRef)) {
                        this.viewRef._onClick();
                    }
                    return false;
                };
            }

            this.render();
        }
    }


    protected _onClick() {
        let vc_id = "root";
        if (this.viewController !== undefined) {
            if (this.viewController !== null) {
                vc_id = this.viewController.id;
            }
        }

        let event_param = {
            viewController_id: vc_id,
            button_id: this.id
        };
        Application.instance.session_event(SessionEvent.kEvent_User,'Button.Click', event_param);

        if (this.isToggle) {
            if (this.isToggled) {
                if (this.allowClickUntoggle) {
                    this.setToggled(false);
                    Application.instance.notifyAll(this, "kButtonToggleGroup", this.buttonGroup);
                    if (this.actionDelegate && this.actionDelegateEventName) {
                        this.actionDelegate[this.actionDelegateEventName](this,'onclick');
                    }
                    if (this.actionArrowFunction) {
                        this.actionArrowFunction(this);
                    }
                }

            } else {
                this.setToggled(true);
                Application.instance.notifyAll(this, "kButtonToggleGroup", this.buttonGroup);
                if (this.actionDelegate && this.actionDelegateEventName) {
                    this.actionDelegate[this.actionDelegateEventName](this,'onclick');
                }
                if (this.actionArrowFunction) {
                    this.actionArrowFunction(this);
                }
            }

        } else {
            if (this.actionDelegate && this.actionDelegateEventName) {
                this.actionDelegate[this.actionDelegateEventName](this,'onclick');
            }
            if (this.actionArrowFunction) {
                this.actionArrowFunction(this);
            }
        }
    }


    render(parentBounds?: Bounds, style?: ViewStyle) {
        if (isDefined(this.getDiv())) {


            let renderFN = () => {
                this.getDiv().style.cssText = '';
                this.doResizeFrameOnly();

                this._div.style.webkitAppearance = 'none';
                //this._div.style.height = '30px';
                while (this.getDiv().children.length > 0) {
                    this.getDiv().removeChild(this.getDiv().lastChild);
                }

                this._div.innerHTML = this.svgIcon + this.text;

                this._div.style.verticalAlign =  "baseline";
                this._div.style.userSelect = 'none';
                this._div.style.MozUserSelect = 'none';
                this._div.style.webkitUserSelect = 'none';
                this._div.style.boxSizing = "content-box";
                this._div.style.webkitAppearance = 'none';
                this._div.style.padding = 0;
                this._div.style.border = 'none';
                this._div.style.background = 'none';
                super.render(parentBounds, style);

                renderTextStyleProps(this._div, this.getDefaultStyle().textStyle);

                if (this.isFullyRound === false) {
                    if (isDefined(this.borderRadius)) {
                        this.getDiv().style.borderTopLeftRadius = this.borderRadius.tl + "px";
                        this.getDiv().style.borderTopRightRadius = this.borderRadius.tr + "px";
                        this.getDiv().style.borderBottomLeftRadius = this.borderRadius.bl + "px";
                        this.getDiv().style.borderBottomRightRadius = this.borderRadius.br + "px";
                    } else {
                        this.getDiv().style.borderTopLeftRadius = 0 + "px";
                        this.getDiv().style.borderTopRightRadius = 0 + "px";
                        this.getDiv().style.borderBottomLeftRadius = 0 + "px";
                        this.getDiv().style.borderBottomRightRadius = 0 + "px";
                    }
                } else {
                    let b = this.getBounds("");
                    let heightInPx = NUConvertToPixel(b.height).amount;
                    let round = heightInPx / 2;
                    this.getDiv().style.borderRadius = round + "px";
                }



            }

            renderFN();

        }
    }

    viewWasAttached() {
        this.isHovering = false;

        // this.setToggled(this.isToggled);

        this._div.viewRef = this;

        if (this.isEnabled) {
            this._div.onclick = function (e: MouseEvent) {
                if (Logging.enableLogging) {
                    console.log('+CLICK ' + this.viewRef.id);
                }
                e.preventDefault();
                e.stopPropagation();
                if (isDefined(this.viewRef)) {
                    this.viewRef._onClick();
                }
                e.cancelBubble = true;
                return false;
            };
            this._div.onmouseover = function (e: MouseEvent) {
                this.style.cursor = 'pointer';
                if (isDefined(this.viewRef)) {
                    this.viewRef.isHovering = true;
                    (this.viewRef as View).setPropertyValue("view.hovered", true);
                    this.viewRef.processStyleAndRender("", []);
                }
            };
            this._div.onmouseout = function (e: MouseEvent) {
                this.style.cursor = '';
                if (isDefined(this.viewRef)) {
                    this.viewRef.isHovering = false;
                    (this.viewRef as View).setPropertyValue("view.hovered", false);
                    this.viewRef.processStyleAndRender("", []);
                }
            };
        }

    }



}