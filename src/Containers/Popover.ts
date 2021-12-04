import {BaseClass} from "../baseClass";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";
import {View} from "../View/View";
import {NavigationController} from "../NavigationController/NavigationController";
import {Bounds} from "../Bounds/Bounds";
import {ViewStyle} from "../View/ViewStyle";
import {Fill} from "../View/Fill";
import {Shadow} from "../View/Shadow";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {Label} from "../Components/Label";
import {isDefined} from "../Utils/isDefined";
import {Application} from "../Application/Application";
import {ViewController} from "../ViewController/ViewController";


export class Popover extends BaseClass {
    id: string = '';
    title: string = '';
    width: NumberWithUnit = new NumberWithUnit(300, "px");
    height: NumberWithUnit = new NumberWithUnit(400, "px");
    hasTitleBar: boolean = false;
    popoverView: View;
    popoverArrow: View;
    popoverContentView: View;
    popoverBackgroundView: View;
    popoverBackgroundArrowView: View;

    anchorView: View;
    containerView: View;
    navigationController: NavigationController;
    fixedPositioning: boolean = false;
    fixedBounds?: Bounds;
    actionDelegate?: any = undefined;
    actionDelegateEventName?: string = '';

    styles: ViewStyle[] = [];

    constructor() {
        super();
        this.styles = [
            {
                kind: "ViewStyle",
                id: "popover",
                cond: [],
                fills: [new Fill(true, "color", "normal", 'rgb(253,253,253)')],
                borderRadius: {tl: new NumberWithUnit(3, "px"), tr: new NumberWithUnit(3, "px"), bl: new NumberWithUnit(3, "px"), br: new NumberWithUnit(3, "px")},
                zIndex: "1100"
            },
            {
                kind: "ViewStyle",
                id: "popoverArrow",
                cond: [],
                fills: [new Fill(true, "color", "normal", 'rgb(253,253,253)')],
                zIndex: "1100"
            },
            {
                kind: "ViewStyle",
                id: "popoverBackground",
                cond: [],
                fills: [new Fill(true, "gradient", "normal", "linear-gradient(\n" +
                    "to bottom,\n" +
                    "rgba(134, 134, 134, 1.0),\n" +
                    "rgba(84, 84, 84, 1.0)\n" +
                    ")")],
                shadows: [new Shadow(true, 1, 3, 4, 0, new Fill(true, "color", "normal", "rgba(50, 50, 50, 0.2)"),false),
                    new Shadow(true, -1, 6, 8, 0, new Fill(true, "color", "normal", "rgba(50, 50, 50, 0.2)"), false)
                ],
                borderRadius: {tl: new NumberWithUnit(3, "px"), tr: new NumberWithUnit(3, "px"), bl: new NumberWithUnit(3, "px"), br: new NumberWithUnit(3, "px")},
                zIndex: "1099"
            },
            {
                kind: "ViewStyle",
                id: "popoverBackgroundArrow",
                cond: [],
                fills: [new Fill(true, "color", "normal", "rgba(134, 134, 134, 1.0)")],
                shadows: [new Shadow(true, 1, 3, 4, 0, new Fill(true, "color", "normal", "rgba(50, 50, 50, 0.2)"),false),
                    new Shadow(true, -1, 6, 8, 0, new Fill(true, "color", "normal", "rgba(50, 50, 50, 0.2)"), false)
                ],
                zIndex: "1099"
            }
        ];
        this.popoverView = new View();
        this.popoverArrow = new View();
        this.popoverContentView = new View();
        this.anchorView = new View();
        this.containerView = new View();
        this.navigationController = new NavigationController();

        this.popoverBackgroundView = new View();
        this.popoverBackgroundArrowView = new View();

    }


    setActionDelegate(d: any, n: string) {
        'use strict';
        this.actionDelegate = d;
        this.actionDelegateEventName = n;
    }

    getStylesForTargetId(target: string): ViewStyle[] {
        let view = new View();
        view.styles = JSON.parse(JSON.stringify(this.styles));
        let ret = view.getStylesForTargetId(target);
        for (let i = 0; i < ret.length; i += 1) {
            ret[i].id = undefined;
        }
        view = null;
        return ret;
    }

    initPopover(_id: string, _containerView: View, _anchorView: View) {
        "use strict";

        this.id = _id;
        this.anchorView = _anchorView;
        this.containerView = _containerView;

        this.popoverBackgroundView.keyValues["popoverRef"] = this;
        this.popoverBackgroundView.styles = this.getStylesForTargetId("popoverBackground");
        this.popoverBackgroundView.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["popoverRef"].fixedPositioning) {
                return this.keyValues["popoverRef"].fixedBounds;
            }
            const bestPos = this.keyValues["popoverRef"].calculateBestPosition();
            return boundsWithPixels({
                x: bestPos.frame.x -1,
                y: bestPos.frame.y -1,
                width: bestPos.frame.width + 2,
                height: bestPos.frame.height + 2,
                unit: "px",
                position: "absolute"
            });
        }
        this.popoverBackgroundView.initView(this.id + ".popoverBackgroundView");
        this.containerView.attach(this.popoverBackgroundView);

        this.popoverView.keyValues["popoverRef"] = this;
        this.popoverView.styles = this.getStylesForTargetId("popover");
        this.popoverView.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["popoverRef"].fixedPositioning) {
                return this.keyValues["popoverRef"].fixedBounds;
            }
            const bestPos = this.keyValues["popoverRef"].calculateBestPosition();
            return boundsWithPixels({
                x: bestPos.frame.x,
                y: bestPos.frame.y,
                width: bestPos.frame.width,
                height: bestPos.frame.height,
                unit: "px",
                position: "absolute"
            });

        };
        this.popoverView.viewWasAttached = function () {
            this.setLayerHeight('99999');
            if (this.keyValues["popoverRef"].hasTitleBar) {
                let title = new Label();
                title.text = this.keyValues["popoverRef"].title;
                title.fontColor = 'rgb(30,31,31)';
                title.fontSize = 14;
                title.fillLineHeight = true;
                title.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                title.boundsForView = function (parentBounds: Bounds): Bounds {
                    return boundsWithPixels({
                        x: 5,
                        y: 0,
                        width: parentBounds.width.amount - 15 - 15 - 20 - 5,
                        height: 37,
                        unit: 'px',
                        position: 'absolute'
                    });
;
                };
                title.initView(this.id + ".title");
                this.attach(title);
                this.keyValues["title"] = title;

                let close = new Label();
                close.boundsForView = function (parentBounds: Bounds): Bounds {
                    return boundsWithPixels({
                        x: parentBounds.width.amount - 15 - 20,
                        y: 0,
                        width: 37,
                        height: 37,
                        unit: "px",
                        position: "absolute"
                    });
;
                };
                close.fillLineHeight = true;
                close.fontColor = "rgb(150,150,150)";
                close.fontSize = 22;
                close.fontFamily = "Font Awesome\\ 5 Free";
                close.textAlignment = "center";
                close.text = "&#xf057;";
                close.initView(this.id + ".close");
                this.attach(close);
                this.keyValues['close'] = close;

                close.setClickDelegate(this.keyValues["popoverRef"], "cancelPopover");
            }

            this.keyValues["content"] = new View();
            this.keyValues["content"].keyValues["popoverRef"] = this.keyValues["popoverRef"];
            this.keyValues["content"].boundsForView = function (parentBounds: Bounds): Bounds {
                let y = 0;
                if (this.keyValues["popoverRef"].hasTitleBar === true) {
                    y = 37;
                }
                return boundsWithPixels({
                    x: 0,
                    y: y,
                    width: parentBounds.width.amount,
                    height: parentBounds.height.amount - y,
                    unit: 'px',
                    position: 'absolute'
                });
            };
            this.keyValues["content"].initView(this.id + ".content");
            this.attach(this.keyValues["content"]);


            //this.getDiv().style.opacity = 0.9;
        };
        this.popoverView.initView(this.id + ".popover");
        this.containerView.attach(this.popoverView);




        if (!this.fixedPositioning) {
            if (this.anchorView !== undefined) {
                const bestPos = this.calculateBestPosition();
                this.popoverBackgroundArrowView = new View();
                this.popoverBackgroundArrowView.keyValues["popoverRef"] = this;
                this.popoverBackgroundArrowView.styles = this.getStylesForTargetId("popoverBackgroundArrow");
                let backgroundDefaultStyle = this.popoverBackgroundArrowView.getDefaultStyle();
                let bdsFillColor = "rgb(253,253,253)";
                if (isDefined(backgroundDefaultStyle.fills) && backgroundDefaultStyle.fills.length > 0) {
                    bdsFillColor = backgroundDefaultStyle.fills[0].value;
                }
                this.popoverBackgroundArrowView.boundsForView = function (parentBounds: Bounds): Bounds {
                    const bestPos = this.keyValues["popoverRef"].calculateBestPosition();
                    if (bestPos.bestPosition === "bottom") {
                        this.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:0 10px 10px 10px;border-color:transparent transparent ${bdsFillColor} transparent;`}];
                    }
                    if (bestPos.bestPosition === "top") {
                        this.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:10px 10px 0 10px;border-color:${bdsFillColor} transparent transparent transparent;`}];
                    }
                    if (bestPos.bestPosition === "left") {
                        this.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:10px 0 10px 10px;border-color:transparent transparent transparent ${bdsFillColor};`}];
                    }
                    if (bestPos.bestPosition === "right") {
                        this.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:10px 10px 10px 0;border-color:transparent ${bdsFillColor} transparent transparent;`}];
                    }

                    return boundsWithPixels({
                        x: bestPos.arrow.x,
                        y: bestPos.arrow.y,
                        width: 0,
                        height: 0,
                        unit: "px",
                        position: "absolute"
                    });
                };
                if (bestPos.bestPosition === "bottom") {
                    this.popoverBackgroundArrowView.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:0 10px 10px 10px;border-color:transparent transparent ${bdsFillColor} transparent;`}];
                }
                if (bestPos.bestPosition === "top") {
                    this.popoverBackgroundArrowView.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:10px 10px 0 10px;border-color:${bdsFillColor} transparent transparent transparent;`}];
                }
                if (bestPos.bestPosition === "left") {
                    this.popoverBackgroundArrowView.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:10px 0 10px 10px;border-color:transparent transparent transparent ${bdsFillColor};`}];
                }
                if (bestPos.bestPosition === "right") {
                    this.popoverBackgroundArrowView.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:10px 10px 10px 0;border-color:transparent ${bdsFillColor} transparent transparent;`}];
                }
                this.popoverBackgroundArrowView.initView(this.id + ".popoverBackgroundArrowView");
                this.containerView.attach(this.popoverBackgroundArrowView);

                this.popoverArrow = new View();
                this.popoverArrow.keyValues["popoverRef"] = this;

                this.popoverArrow.styles = this.getStylesForTargetId("popoverArrow");
                let defaultStyle = this.popoverArrow.getDefaultStyle();
                let fillColor = "rgb(253,253,253)";
                if (isDefined(defaultStyle.fills) && defaultStyle.fills.length > 0) {
                    fillColor = defaultStyle.fills[0].value;
                }

                this.popoverArrow.boundsForView = function (parentBounds: Bounds): Bounds {
                    const bestPos = this.keyValues["popoverRef"].calculateBestPosition();
                    if (bestPos.bestPosition === "bottom") {
                        this.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:0 12px 12px 12px;border-color:transparent transparent ${fillColor} transparent;`}];
                        return boundsWithPixels({
                            x: bestPos.arrow.x-1,
                            y: bestPos.arrow.y+1,
                            width: 0,
                            height: 0,
                            unit: "px",
                            position: "absolute"
                        });
                    }
                    if (bestPos.bestPosition === "top") {
                        this.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:12px 12px 0 12px;border-color:${fillColor} transparent transparent transparent;`}];
                        return boundsWithPixels({
                            x: bestPos.arrow.x-1,
                            y: bestPos.arrow.y-1,
                            width: 0,
                            height: 0,
                            unit: "px",
                            position: "absolute"
                        });
                    }
                    if (bestPos.bestPosition === "left") {
                        this.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:12px 0 12px 12px;border-color:transparent transparent transparent ${fillColor};`}];
                        return boundsWithPixels({
                            x: bestPos.arrow.x-1,
                            y: bestPos.arrow.y-1,
                            width: 0,
                            height: 0,
                            unit: "px",
                            position: "absolute"
                        });
                    }
                    if (bestPos.bestPosition === "right") {
                        this.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:12px 12px 12px 0;border-color:transparent ${fillColor} transparent transparent;`}];
                        return boundsWithPixels({
                            x: bestPos.arrow.x+1,
                            y: bestPos.arrow.y-1,
                            width: 0,
                            height: 0,
                            unit: "px",
                            position: "absolute"
                        });
                    }

                    return boundsWithPixels({
                        x: bestPos.arrow.x,
                        y: bestPos.arrow.y,
                        width: 0,
                        height: 0,
                        unit: "px",
                        position: "absolute"
                    });
                };
                this.popoverArrow.viewWasAttached = function () {
                    this.setLayerHeight('99998');
                };

                if (bestPos.bestPosition === "bottom") {
                    this.popoverArrow.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:0 12px 12px 12px;border-color:transparent transparent ${fillColor} transparent;`}];
                }
                if (bestPos.bestPosition === "top") {
                    this.popoverArrow.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:12px 12px 0 12px;border-color:${fillColor} transparent transparent transparent;`}];
                }
                if (bestPos.bestPosition === "left") {
                    this.popoverArrow.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:12px 0 12px 12px;border-color:transparent transparent transparent ${fillColor};`}];
                }
                if (bestPos.bestPosition === "right") {
                    this.popoverArrow.getDefaultStyle().fills = [{active: true, type: 'cssText', blendMode: 'normal', value: `border-style:solid;border-width:12px 12px 12px 0;border-color:transparent ${fillColor} transparent transparent;`}];
                }
                //this.popoverArrow.shadows = [{"active":true,"offsetX":1,"offsetY":3,"blur":4,"spread":0,"color":{"active":true,"type":"color","blendMode":"normal","value":"rgba(50, 50, 50, 0.2)"},"isInset":false}];

                this.popoverArrow.initView(this.id + ".popoverArrow");
                this.containerView.attach(this.popoverArrow);



            }
        }


        this.navigationController = new NavigationController();
        this.navigationController.initNavigationControllerWithRootView(this.id + ".navigationController", this.popoverView.keyValues["content"]);

        Application.instance.registerForNotification('noticeBodyClicked', this);

    }


    calculateBestPosition(): { frame: {x: number, y: number, width: number, height: number}, arrow: {x: number, y: number, width: number, height: number}, bestPosition: string} {
        "use strict";
        const ret: { frame: {x: number, y: number, width: number, height: number}, arrow: {x: number, y: number, width: number, height: number}, bestPosition: string} = {
            bestPosition: "",
            frame: { x: 0, y: 0, width: 0, height: 0},
            arrow: { x: 0, y: 0, width: 0, height: 0}
        };

        let x = 0;
        let y = 0;
        let ax = 0;
        let ay = 0;

        const width = this.width.amount;
        const height = this.height.amount + ((this.hasTitleBar)
            ? 37
            : 3);

        this.anchorView.getBounds("");

        let anchorBoundingRect = {
            x: this.anchorView.bounds.x.amount,
            y: this.anchorView.bounds.y.amount,
            width: this.anchorView.bounds.width.amount,
            height: this.anchorView.bounds.height.amount
        };


        anchorBoundingRect = this.anchorView.getDiv().getBoundingClientRect();

        const rootBoundingRect = {
            x: 0,
            y: 0,
            width: this.containerView.bounds.width.amount,
            height: this.containerView.bounds.height.amount
        };


        // underneath ?

        if (anchorBoundingRect.y + anchorBoundingRect.height + 10 + height < rootBoundingRect.height) {
            x = anchorBoundingRect.x + anchorBoundingRect.width / 2 - width / 2;
            if (x < 0) {
                x = 0;
            }
            if (x + width > rootBoundingRect.width) {
                x = rootBoundingRect.width - width - 10;
                if (x < 0) {
                    x = 0;
                }
            }
            ret.bestPosition = "bottom";

            ax = anchorBoundingRect.x + anchorBoundingRect.width / 2 - 10;
            ay = anchorBoundingRect.y + anchorBoundingRect.height;

            ret.frame = {
                x: x,
                y: anchorBoundingRect.y + anchorBoundingRect.height + 10,
                width: width,
                height: height
            };
            ret.arrow = {
                x: ax,
                y: ay,
                width: 10,
                height: 10
            };
            return ret;
        }
        // left ?
        if (anchorBoundingRect.x - width - 10 > 0) {
            x = anchorBoundingRect.x - width - 10;
            if (anchorBoundingRect.y + anchorBoundingRect.height / 2 - height / 2 > 0) {
                y = anchorBoundingRect.y + anchorBoundingRect.height / 2 - height / 2;
                if (y + height > rootBoundingRect.height) {
                    y = rootBoundingRect.height - 10 - height;
                }
            } else {
                y = 10;
            }
            ret.bestPosition = "left";
            ret.frame = {
                x: x,
                y: y,
                width: width,
                height: height
            };
            ret.arrow = {
                x: anchorBoundingRect.x - 10,
                y: anchorBoundingRect.y + anchorBoundingRect.height / 2 - 10,
                width: 10,
                height: 10
            };
            return ret;
        }
        // right ?
        if (anchorBoundingRect.x + anchorBoundingRect.width + 10 + width < rootBoundingRect.width) {
            x = anchorBoundingRect.x + anchorBoundingRect.width + 10;
            if (anchorBoundingRect.y + anchorBoundingRect.height / 2 - height / 2 > 0) {
                y = anchorBoundingRect.y + anchorBoundingRect.height / 2 - height / 2;
            } else {
                y = 10;
            }
            ret.bestPosition = "right";
            ret.frame = {
                x: x,
                y: y,
                width: width,
                height: height
            };
            ret.arrow = {
                x: anchorBoundingRect.x + anchorBoundingRect.width,
                y: anchorBoundingRect.y + anchorBoundingRect.height / 2 + 10,
                width: 10,
                height: 10
            };
            return ret;
        }
        // top ?
        if (anchorBoundingRect.y - 10 - height > 0) {
            x = anchorBoundingRect.x + anchorBoundingRect.width / 2 - width / 2;
            if (x < 0) {
                x = 0;
            }
            if (x + width > rootBoundingRect.width) {
                x = rootBoundingRect.width - width - 10
                if (x < 0) {
                    x = 0;
                }
            }
            ret.bestPosition = "top";

            ax = anchorBoundingRect.x + anchorBoundingRect.width / 2 - 10;
            ay = anchorBoundingRect.y - 10;

            ret.frame = {
                x: x,
                y: anchorBoundingRect.y - 10 - height,
                width: width,
                height: height
            };
            ret.arrow = {
                x: ax,
                y: ay,
                width: 10,
                height: 10
            };
            return ret;
        }

        //throw 'not good place for popover';

        // fallback underneath
        x = anchorBoundingRect.x + anchorBoundingRect.width / 2 - width / 2;
        if (x < 0) {
            x = 0;
        }
        if (x + width > rootBoundingRect.width) {
            x = rootBoundingRect.width - width - 10
            if (x < 0) {
                x = 0;
            }
        }
        ret.bestPosition = "bottom";

        ax = anchorBoundingRect.x + anchorBoundingRect.width / 2 - 10;
        ay = anchorBoundingRect.y + anchorBoundingRect.height;

        ret.frame = {
            x: x,
            y: anchorBoundingRect.y + anchorBoundingRect.height + 10,
            width: width,
            height: height
        };
        ret.arrow = {
            x: ax,
            y: ay,
            width: 10,
            height: 10
        };
        return ret;


    }


    noticeBodyClicked(sender: any, e: any) {
        if (!isDefined(e)) {
            this.closeWithStatus({closedByUser: true});
            return;
        }
        if (e.target.id !== this.id) {
            if (isDefined(this.popoverView) && isDefined(this.popoverView.getDiv())) {
                let isTargetAChild = this.popoverView.isElementChild(e.target);
                if (!isTargetAChild) {
                    this.closeWithStatus({closedByUser: true});
                }
            }
        }
    }


    cancelPopover() {
        "use strict";
        this.closeWithStatus({valid: false});
    }

    closeWithStatus(status: any) {

        Application.instance.deregisterForNotification('noticeBodyClicked', this.id);

        let obj = undefined;
        if (status !== undefined) {
            obj = JSON.parse(JSON.stringify(status));
        }
        this.navigationController.clear(); // close the viewcontroller in the popup correctly

        if (isDefined(this.popoverBackgroundView)) {
            this.popoverBackgroundView.detachItSelf();
        }
        if (isDefined(this.popoverBackgroundArrowView)) {
            this.popoverBackgroundArrowView.detachItSelf();
        }

        if (this.popoverView !== undefined) {
            this.popoverView.detachItSelf();
        }
        if (this.popoverArrow !== undefined) {
            this.popoverArrow.detachItSelf();
        }
        try {
            if (this.actionDelegate && this.actionDelegateEventName) {
                this.actionDelegate[this.actionDelegateEventName](this, obj);
            }
        } catch (eee) {
            console.log("no function called " + this.actionDelegateEventName + " on actionDelegate");
        }

    }

    sendStatus(viewController: ViewController, status: any) {
        let obj = undefined;
        if (status !== undefined) {
            obj = JSON.parse(JSON.stringify(status));
        }
        if (isDefined(this.actionDelegate) && isDefined(this.actionDelegate.popoverReceivedStatus)) {
            this.actionDelegate.popoverReceivedStatus(this, viewController, obj);
        }
    }


}

