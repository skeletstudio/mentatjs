import {BaseClass} from "../baseClass";
import {Bounds} from "../Bounds/Bounds";
import {ViewController} from "../ViewController/ViewController";
import {NavigationController} from "../NavigationController/NavigationController";
import {ViewState} from "./ViewState";
import {ViewDriver} from "./ViewDriver";
import {ViewStyle} from "./ViewStyle";
import {LayerProperty} from "./layerProperty";
import {Anchor} from "./Anchor";
import {Fill} from "./Fill";
import {
    anyToNU,
    NUAdd,
    NUConvertToPixel,
    NUConvertToPoint,
    NumberWithUnit,
    NUSub,
    pt,
    px
} from "../NumberWithUnit/NumberWithUnit";

import {ViewStyleCondition} from "./ViewStyleCondition";
import {BorderRadius} from "./BorderRadius";
import {Shadow} from "./Shadow";
import {instanceOfFill} from "../Guards/instanceOfFill";
import {renderViewStyle} from "./renderViewStyle";
import {compareProperty} from "./compareProperty";
import {instanceOfShadow} from "../Guards/instanceOfShadow";
import {assert} from "../Utils/assert";
import {instanceOfBorder} from "../Guards/instanceOfBorder";
import {instanceOfBorderRadius} from "../Guards/instanceOfBorderRadius";
import {Logging} from "../Utils/logging";
import {dispatch_msg} from "../Utils/dispatchMessage";
import {PXBounds} from "../Bounds/PXBounds";
import {Anchors} from "./Anchors";
import {isDefined} from "../Utils/isDefined";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {applyClickThrough} from "./applyClickThrough";
import {Border} from "./Border";

import {Size} from "../NumberWithUnit/Size";
import {kViewProperties} from "./kViewProperties";
import {Application} from "../Application/Application";
import {ServiceGetter} from "../Platform/ServiceGetter";



export interface EventOptions {
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
    action: 'click' | 'contextmenu' | 'dblclick' | 'mouseover' | 'mouseout'
};


export interface ViewDragDelegate {

    viewDragStart?(view: View, dragID: string);

    viewWillBeDragged(parentView: View, options?: {event: Event});
    viewIsBeingDragged(view: View, options?: {
        event: Event,
        x: number,
        y: number,
        offsetX: number,
        offsetY: number,
        mouseVelocity: {
            linear: number,
            x: number,
            y: number
        }
    });
    viewWasDragged(view: View, options?: {
        event: Event,
        x: number,
        y: number
    });
}


// declare class Application { static instance: { documentElementClientWidth: number, documentElementClientHeight: number, contextMenuInstance, keyValues, rootView }}


export class View extends BaseClass {
    kind: string = "View";
    keyValues: any = {};


    id: string = "";
    bounds: Bounds = undefined; // new Bounds(0,0,0,0);
    subViews: View[];
    parentView?: View;
    viewController?: ViewController;
    navigationController?: NavigationController;

    anchors: Anchors;
    growths: Size[] = [];

    states: ViewState[] = [];
    currentState = "";

    drivers: ViewDriver[] = [];
    styles: ViewStyle[] = [];
    properties: LayerProperty[] = [];

    dontCacheStyle: boolean = false;
    cachedStyle: ViewStyle = undefined;
    savedOverrides: ViewStyle[] = [];

    // RESIZING
    preDragBounds?: Bounds = new Bounds(0,0,0,0);
    dragDelegate?: ViewDragDelegate = undefined;
    isDragNDrop: boolean = false;
    isDraggable: boolean = false;
    isDOMHovering: boolean = false;

    // STYLE
    isEnabled: boolean = true;
    applyClickThrough: boolean = false;
    opacity: number = 100;
    blendingMode: string = 'normal';
    zIndex: string = 'auto';

    cursor: string = "";
    userSelect: string = "none";
    //fills: Fill[] = [];
    //borders: Border[] = [];
    //shadows: Shadow[] = [];
    visible: boolean = true;




    invalidateBounds() {
        this.cachedStyle = undefined;
        for (let i = 0; i < this.subViews.length; i += 1) {
            this.subViews[i].invalidateBounds();
        }
    }


    get borderRadius(): BorderRadius {
        let style: ViewStyle = this.getDefaultStyle();
        return style.borderRadius;
    }

    set borderRadius(value: BorderRadius) {
        assert(instanceOfBorderRadius(value), `View(${this.id}).borderRadius expects a valid BorderRadius value`);
        let style: ViewStyle = this.getDefaultStyle();
        style.borderRadius = value;
    }


    get shadows(): Shadow[] {
        let style: ViewStyle = this.getDefaultStyle();
        return style.shadows;
    }

    set shadows(value: Shadow[]) {
        assert(isDefined(value) && Array.isArray(value) &&
            value.every((v) => { return instanceOfShadow(v);}),
            `View(${this.id}).borderRadius expects a valid BorderRadius value`);
        let style: ViewStyle = this.getDefaultStyle();
        style.shadows = value;
    }


    get borders(): Border[] {
        let style: ViewStyle = this.getDefaultStyle();
        return style.borders;
    }

    set borders(value: Border[]) {
        assert(isDefined(value) && Array.isArray(value) &&
            value.every((v) => { return instanceOfBorder(v);}),
            `View(${this.id}).borders expects an array of Border`);
        let style: ViewStyle = this.getDefaultStyle();
        style.borders = value;
    }


    get fills(): Fill[] {
        let style: ViewStyle = this.getDefaultStyle();
        return style.fills;
    }

    set fills(value: Fill[]) {
        assert(isDefined(value) && Array.isArray(value) &&
            value.every((v) => { return instanceOfFill(v);}),
            `View(${this.id}).fills expects an array of Fill`);
        let style: ViewStyle = this.getDefaultStyle();
        style.fills = value;
    }

    get overflow(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.overflow;
    }

    set overflow(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.overflow = value;
    }

    get overflowX(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.overflowX;
    }

    set overflowX(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.overflowX = value;
    }

    get overflowY(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.overflowY;
    }

    set overflowY(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.overflowY = value;
    }

    get extracss(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.extraCss;
    }

    set extracss(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.extraCss = value;
    }

    get extraCss(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.extraCss;
    }

    set extraCss(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.extraCss = value;
    }

    get outlineColor() {
        let style: ViewStyle = this.getDefaultStyle();
        return style.outlineColor;
    }
    set outlineColor(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.outlineColor = value;
    }
    get outlineStyle() {
        let style: ViewStyle = this.getDefaultStyle();
        return style.outlineStyle;
    }
    set outlineStyle(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.outlineStyle = value;
    }
    get outlineWidth() {
        let style: ViewStyle = this.getDefaultStyle();
        return style.outlineWidth;
    }
    set outlineWidth(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.outlineWidth = value;
    }
    get outlineOffset() {
        let style: ViewStyle = this.getDefaultStyle();
        return style.outlineOffset;
    }
    set outlineOffset(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.outlineOffset = value;
    }


    dragScroll: boolean = false;
    NO_RESIZE: boolean = false;


    // Events
    actionDelegate?: any = undefined;
    actionDelegateEventName?: string = "";
    actionArrowFunction?: any = undefined;

    clickDelegate?: any = undefined;
    clickDelegateEventName?: string = "";

    dblClickActionDelegate?: any = undefined;
    dblClickActionDelegateEventName?: string = '';

    tapDelegate?: any = undefined;
    tapDelegateEventName?: string = '';

    hoverDelegate?: any = undefined;
    hoverDelegateEventName?: string = '';



    private m_arrayEventHandlers: {eventName: string, func: (evt: Event) => any}[] = [];


    public initialised: boolean;
    protected _div: any;

    protected isHovering: boolean = false;



    contextMenuHandler?: any = undefined;



    viewWillLoad() {};
    viewDidLoad() {};

    viewWasAttached() {


    };

    enableFocusEvents() {
        let focusEventHandler = (evt: FocusEvent) => {
            evt.stopPropagation();
            this.setPropertyValue(kViewProperties.focused, true);
            this.processStyleAndRender("", []);
        }
        let blurEventHandler = (evt: Event) => {
            evt.stopPropagation();
            this.setPropertyValue(kViewProperties.focused, false);
            this.processStyleAndRender("", []);
        }
        this.getDiv().addEventListener("focusin", focusEventHandler);
        this.m_arrayEventHandlers.push({eventName: "focusin", func: focusEventHandler});
        this.getDiv().addEventListener("focusout", blurEventHandler);
        this.m_arrayEventHandlers.push({eventName: "focusout", func: blurEventHandler});
    }


    viewWillBeDeattached() {};
    viewWasDetached() {


    };

    wasResized(bounds: Bounds) {};

    childIsGrowing(view: View, size: Size, initiator?: any) {};
    // delegate for drag events
    viewWillBeDragged(parentView: View, options?: {event: Event}) {}
    viewIsBeingDragged(view: View, options?: {
        event: Event,
        x: number,
        y: number,
        offsetX: number,
        offsetY: number,
        mouseVelocity: {
            linear: number,
            x: number,
            y: number
        }
    }) {}
    viewWasDragged(view: View, options?: {
        event: Event,
        x: number,
        y: number
    }) {}






    constructor(tag: string = "div", _id: string = "", children: View[] = []) {
        super();
        if (tag === "") {
            tag = "div";
        }
        this.initialised = false;
        this._div = ServiceGetter.instance.pool.getElement(tag);

        this.subViews = [];
        this.growths = [];
        this.keyValues = [];
        this.anchors = new Anchors();

        this.styles = [new ViewStyle()];
        this.properties.push(
            {
                kind: "LayerProperty",
                type: "boolean",
                property_id: kViewProperties.enabled,
                value: true,
                group: "property",
                id: kViewProperties.enabled,
                title: kViewProperties.enabled
            }
        );
        this.properties.push(
            {
                kind: "LayerProperty",
                type: "boolean",
                property_id: kViewProperties.hovered,
                value: false,
                group: "property",
                id: kViewProperties.hovered,
                title: kViewProperties.hovered
            }
        );
        this.properties.push(
            {
                kind: "LayerProperty",
                type: "boolean",
                property_id: kViewProperties.focused,
                value: false,
                group: "property",
                id: kViewProperties.focused,
                title: kViewProperties.focused
            }
        );
        this.properties.push(
            {
                kind: "LayerProperty",
                type: "boolean",
                property_id: kViewProperties.active,
                value: false,
                group: "property",
                id: kViewProperties.active,
                title: kViewProperties.active
            }
        );
        this.properties.push(
            {
                kind: "LayerProperty",
                type: "boolean",
                property_id: kViewProperties.error,
                value: false,
                group: "property",
                id: kViewProperties.error,
                title: kViewProperties.error
            }
        );
        this.properties.push(
            {
                kind: "LayerProperty",
                type: "boolean",
                property_id: kViewProperties.loading,
                value: false,
                group: "property",
                id: kViewProperties.loading,
                title: kViewProperties.loading
            }
        );
        this.properties.push(
            {
                kind: "LayerProperty",
                type: "boolean",
                property_id: kViewProperties.highlighted,
                value: false,
                group: "property",
                id: kViewProperties.highlighted,
                title: kViewProperties.highlighted
            }
        );
        if (_id !== "") {
            this.id = _id;
        }
        if (children.length > 0) {
            
        }
    }

    pxBoundsForView(parentBounds: PXBounds): PXBounds {
        return undefined;
    }

    boundsForView(parentBounds: Bounds): Bounds {
        return undefined;
        // return new Bounds(0, 0, 0, 0);
    }
    elementName = "div";
    initView(_id: string, parentView?: View) {
        this.id = _id;


        this._div.id = _id;
        this.growths = [];
        this.subViews = [];
        if (parentView !== undefined) {
            this.parentView = parentView;
        }
        if (this.viewWillLoad !== undefined) {
            this.viewWillLoad();
        }
        if (this.viewController) {
            if (this.viewController.viewWillLoad !== undefined) {
                this.viewController.viewWillLoad(this);
            }
        }
        if (this.viewDidLoad !== undefined) {
            this.viewDidLoad();
        }
        if (this.viewController) {
            if (this.viewController.viewDidLoad !== undefined) {
                this.viewController.viewDidLoad(this);
            }
        }
        this.initialised = true;
    }

    public getDiv() {
        return this._div;
    }

    property(property_id: string): LayerProperty {
        let properties = this.properties;
        for (let i = 0; i < properties.length; i += 1 ) {
            if (properties[i].property_id === property_id) {
                return JSON.parse(JSON.stringify(properties[i]));
            }
        }
        return undefined;
    }

    setPropertyValue(property_id: string, value: any) {
        let properties = this.properties;
        for (let i = 0; i < properties.length; i += 1 ) {
            if (properties[i].property_id === property_id) {
                properties[i].value = value;
            }
        }
    }

    getStylesForSubViewId(subViewId: string, copyAndRemoveId: boolean = false, conditions: ViewStyleCondition[] = []): ViewStyle[] {
        let styles: ViewStyle[] = [];
        let search_recur = (s: ViewStyle) => {
            if (s.subViewId === subViewId) {
                return s;
            }

            if (isDefined(s.children)) {
                for (let i = 0; i < s.children.length; i += 1) {
                    let ret = search_recur(s.children[i]);
                    if (isDefined(ret)) {
                        return ret;
                    }
                }
            }
            return undefined;
        }

        for (let i = 0; i < this.styles.length; i += 1) {
            let ret = search_recur(this.styles[i]);
            if (isDefined(ret)) {
                styles.push(ret);
            }
        }
        if (copyAndRemoveId === true) {
            let temp: ViewStyle[] = JSON.parse(JSON.stringify(styles));
            for (let i = 0; i < temp.length; i += 1) {
                temp[i].subViewId = undefined;
            }
            styles = temp;
        }

        if (conditions.length > 0) {
            for (let i = styles.length - 1; i >= 0; i--) {
                let matches: boolean = true;
                for (let j = 0; j < conditions.length; j += 1) {
                    let cond_property = conditions[j].property;
                    let cond_op = conditions[j].op;
                    let cond_value = conditions[j].value;
                    if (!isDefined(styles[i].cond)) {
                        matches = false;
                    } else {
                        let scond = styles[i].cond.find((elem) => {
                            return elem.property === cond_property;
                        })
                        if (cond_property !== scond.property || cond_op !== scond.op || cond_value !== scond.value) {
                            matches = false;
                        }
                    }
                }
                if (matches === false) {
                    conditions.splice(i, 1);
                }
            }


        }

        return styles;
    }

    getStylesForTargetId(id: string, copyAndRemoveId: boolean = false, conditions: ViewStyleCondition[] = []): ViewStyle[] {
        let styles: ViewStyle[] = [];
        let search_recur = (s: ViewStyle) => {
            if (s.id === id) {
                return s;
            }

            if (isDefined(s.children)) {
                for (let i = 0; i < s.children.length; i += 1) {
                    let ret = search_recur(s.children[i]);
                    if (isDefined(ret)) {
                        return ret;
                    }
                }
            }
            return undefined;
        }

        for (let i = 0; i < this.styles.length; i += 1) {
            let ret = search_recur(this.styles[i]);
            if (isDefined(ret)) {
                styles.push(ret);
            }
        }
        if (copyAndRemoveId === true) {
            let temp: ViewStyle[] = JSON.parse(JSON.stringify(styles));
            for (let i = 0; i < temp.length; i += 1) {
                temp[i].id = undefined;
            }
            styles = temp;
        }

        if (conditions.length > 0) {
            for (let i = styles.length - 1; i >= 0; i--) {
                let matches: boolean = true;
                for (let j = 0; j < conditions.length; j += 1) {
                    let cond_property = conditions[j].property;
                    let cond_op = conditions[j].op;
                    let cond_value = conditions[j].value;
                    if (!isDefined(styles[i].cond)) {
                        matches = false;
                    } else {
                        let scond = styles[i].cond.find((elem) => {
                            return elem.property === cond_property;
                        })
                        if (cond_property !== scond.property || cond_op !== scond.op || cond_value !== scond.value) {
                            matches = false;
                        }
                    }
                }
                if (matches === false) {
                    conditions.splice(i, 1);
                }
            }


        }

        return styles;
    }


    getStyleForStyleId(id: string, conditions: ViewStyleCondition[]): ViewStyle {
        let search_recur = (s: ViewStyle) => {
            if (s.id === id) {
                if (!isDefined(conditions) || conditions.length === 0) {
                    return s;
                }
                let matchAllCondition = true;
                if (isDefined(s.cond)) {
                    for (let i = 0; i < conditions.length; i += 1) {
                        for (let x = 0; x < s.cond.length; x += 1) {
                            if (s.cond[x].property !== conditions[i].property || s.cond[x].op !== conditions[i].op) {
                                matchAllCondition = false;
                            }
                        }
                    }
                } else {
                    matchAllCondition = false;
                }
                if (matchAllCondition === true) {
                    return s;
                }
            }

            if (isDefined(s.children)) {
                for (let i = 0; i < s.children.length; i += 1) {
                    let ret = search_recur(s.children[i]);
                    if (isDefined(ret)) {
                        return ret;
                    }
                }
            }
            return undefined;
        }

        for (let i = 0; i < this.styles.length; i += 1) {
            let ret = search_recur(this.styles[i]);
            if (isDefined(ret)) {
                return ret;
            }
        }
        return undefined;
    }

    getDefaultStyle(): ViewStyle {
        for (let i = 0; i < this.styles.length; i += 1) {
            let vs = this.styles[i];
            if (isDefined(vs.id) && vs.id !== "self" && vs.id !== this.id) {
                continue;
            }
            if (isDefined(vs.subViewId)) {
                continue;
            }
            if (isDefined(vs.state) && vs.state !== "default" && vs.state !== this.currentState) {
                continue;
            }
            if (isDefined(vs.cond) && vs.cond.length > 0) {
                continue;
            }
            return vs;
        }
        let vs = new ViewStyle();
        this.styles.push(vs);
        return vs;
    }


    private shouldProcessStyle(vs: ViewStyle): { shouldProceed: boolean, triggerChildren?: '*' | string[] } {
        if (isDefined(vs.id) && vs.id !== "self" && vs.id !== this.id) {
            return { shouldProceed: false };
        }
        if (isDefined(vs.state) && vs.state !== "default" && vs.state !== this.currentState) {
            return { shouldProceed: false };
        }
        let triggerChildren: '*' | string[] = undefined;

        if (isDefined(vs.cond)) {
            let condition = true;
            for (let i = 0; i < vs.cond.length; i += 1) {
                let c = vs.cond[i];
                let prop: LayerProperty;
                if (c.fieldTargetForProperty === undefined) {
                    prop = this.properties.find((elem: LayerProperty) => {
                        return elem.property_id === c.property;
                    });
                } else {
                    if (typeof c.fieldTargetForProperty === "string") {
                        let n = this.parentView.findViewNamed(c.fieldTargetForProperty);
                        if (n !== undefined) {
                            prop = n.properties.find((elem: LayerProperty) => {
                                return elem.property_id === c.property;
                            });
                        }
                    } else if (typeof c.fieldTargetForProperty === "number") {
                        let ptr: View = this;
                        for (let x = 0; x < c.fieldTargetForProperty; x++) {
                            ptr = ptr.parentView;
                        }
                        if (ptr !== undefined) {
                            prop = ptr.properties.find((elem: LayerProperty) => {
                                return elem.property_id === c.property;
                            });
                        }

                    }
                }
                if (!isDefined(prop)) {
                    return { shouldProceed: false };
                }
                let compareResult = compareProperty(prop.type, c.path, c.value, prop.value);
                if (compareResult !== c.op) {
                    condition = false;
                } else {
                    if (c.triggerChildren !== undefined) {
                        if (typeof c.triggerChildren === "string" && c.triggerChildren === '*') {
                            triggerChildren = "*";
                        } else  {
                            if (triggerChildren === undefined) {
                                triggerChildren = [];
                            }
                            (triggerChildren as string[]).push(...c.triggerChildren);
                        }
                    }
                }
            }
            if (condition === false) {
                return { shouldProceed: false };
            }
        }


        return {shouldProceed: true, triggerChildren: triggerChildren };
    }
    private calcStyle(vs: ViewStyle): {target: string; style: ViewStyle}[] {
        let ret: {target: string, style: ViewStyle}[] = [];

        let should = this.shouldProcessStyle(vs);
        if (should.shouldProceed === false) {
            return ret;
        }

        ret.push({target: this.id, style: vs});
        if (should.triggerChildren !== undefined) {
            if (typeof should.triggerChildren === "string" && should.triggerChildren === "*") {
                ret.push({target: "*", style: undefined});
            } else {
                for (let i = 0; i < should.triggerChildren.length; i++) {
                    ret.push({target: should.triggerChildren[i], style: undefined});
                }
            }
        }

        if (isDefined(vs.children)) {
            for (let i = 0; i < vs.children.length; i += 1) {
                let vsc = vs.children[i];
                if (isDefined(vsc.id)) {
                    let target = this.findViewNamed(vsc.id);
                    if (isDefined(target)) {
                        let retChildren = target.calcStyle(vsc);
                        if (retChildren.length > 0) {
                            ret.push(...retChildren);
                        }
                    }
                }
            }
        }

        return ret;
    }


    public processStyle(requestBy: string, overrides: ViewStyle[]): {style: ViewStyle, parentBounds: Bounds, childrenTargets: { target: string, styles: ViewStyle[]}[]} {
        let x: NumberWithUnit | undefined = undefined;
        let y: NumberWithUnit | undefined = undefined;
        let top: NumberWithUnit | undefined = undefined;
        let right: NumberWithUnit | undefined = undefined;
        let left: NumberWithUnit | undefined = undefined;
        let bottom: NumberWithUnit | undefined = undefined;
        let width: NumberWithUnit | undefined = undefined;
        let height: NumberWithUnit | undefined = undefined;
        let ret: ViewStyle = new ViewStyle();
        let allStyles: {target: string; style: ViewStyle}[] = [];
        let myStyles: ViewStyle[] = [];
        let childrenTargets: { target: string; styles: ViewStyle[]}[] = [];

        // get the viewStyle directly on the view
        let keys = Object.keys(ret);
        for (let i = 0; i < keys.length; i += 1) {
            if (isDefined(this[keys[i]])) {
                ret[keys[i]] = this[keys[i]];
            }
        }
        for (let i = 0; i < this.styles.length; i += 1) {
            let s = this.styles[i];
            allStyles.push(...this.calcStyle(s));
        }

        // separate styles for this view and its children
        for (let i = 0; i < allStyles.length; i += 1) {
            if (allStyles[i].style !== undefined && allStyles[i].style.subViewId !== undefined) {
                continue;
            }
            if (allStyles[i].target === this.id) {
                myStyles.push(allStyles[i].style);
            } else {
                let ct = childrenTargets.find((elem) => { return elem.target === allStyles[i].target});
                if (isDefined(ct)) {
                    ct.styles.push(allStyles[i].style);
                } else {
                    childrenTargets.push(
                        {
                            target: allStyles[i].target,
                            styles: [allStyles[i].style]
                        }
                    );
                }
            }
        }
        if (isDefined(overrides)) {
            myStyles.push(...overrides);
        }

        // flatten myStyles
        for (let i = 0; i < myStyles.length; i += 1) {
            let s = myStyles[i];
            if (s !== undefined) {
                let keys = Object.keys(s);
                for (let i = 0; i < keys.length; i += 1) {
                    if (isDefined(s[keys[i]])) {
                        ret[keys[i]] = s[keys[i]];
                    }
                }
            }
        }

        let parentBounds: Bounds = undefined;

        if (isDefined(this.parentView)) {
            if (['parentview','parent'].includes(requestBy.toLowerCase())) {
                parentBounds = new Bounds(0,0,0,0);
            } else {
                parentBounds = this.parentView.getBounds();
            }
        } else {


            const pnode = this.getDiv().parentNode;
            if (pnode === document.body) {
                parentBounds = {
                    kind: "Bounds",
                    x: new NumberWithUnit(0, "px"),
                    y: new NumberWithUnit(0, "px"),
                    width: new NumberWithUnit(Application.instance.documentElementClientWidth, "px"),
                    height: new NumberWithUnit(Application.instance.documentElementClientHeight, "px"),
                    unit: 'px',
                    rotation: new NumberWithUnit(0, "deg"),
                    elevation: new NumberWithUnit(0, "auto"),
                    position: 'absolute',
                    z: px(0),
                    rotationX: px(0),
                    rotationY: px(0),
                    rotationOriginX: new NumberWithUnit(50, "%"),
                    rotationOriginY: new NumberWithUnit(50, "%"),

                };
            } else {
                if ((isDefined(pnode)) && (pnode.style !== undefined)) {
                    if (pnode.style.left !== undefined) {
                        x = new NumberWithUnit(pnode.style.left.substr(0, pnode.style.left.indexOf('px')), "px");
                    }
                    if (pnode.style.top !== undefined) {
                        y = new NumberWithUnit(pnode.style.top.substr(0, pnode.style.top.indexOf('px')), "px");
                    }
                    if (pnode.style.width !== undefined) {
                        width = new NumberWithUnit(pnode.style.width.substr(0, pnode.style.width.indexOf('px')), "px");
                    }
                    if (pnode.style.height !== undefined) {
                        height = new NumberWithUnit(pnode.style.height.substr(0, pnode.style.height.indexOf('px')), "px");
                    }
                } else {
                    x = new NumberWithUnit(0, "px");
                    y = new NumberWithUnit(0, "px");
                    width = new NumberWithUnit(100, "px");
                    height = new NumberWithUnit(100, "px");
                }

                parentBounds = {
                    kind: "Bounds",
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    unit: 'px',
                    position: 'absolute',
                    rotation: new NumberWithUnit(0, "deg"),
                    elevation: new NumberWithUnit(0, "auto"),
                    z: px(0),

                };
            }
        }

        // are bounds defined ?
        if (!isDefined(ret.bounds)) {
            // call the layout functions
            if (isDefined(this["boundsForView"])) {
                ret.bounds = this["boundsForView"](parentBounds);
            }
            if (isDefined(this.pxBoundsForView) && ret.bounds === undefined) {
                let pxBounds: { x?: number, y?: number, width?: number, height?: number, unit: string, position: string} = {
                    unit: 'px',
                    position: 'absolute'
                };
                if (isDefined(parentBounds.x)) {
                    pxBounds.x = parentBounds.x.amount;
                }
                if (isDefined(parentBounds.y)) {
                    pxBounds.y = parentBounds.y.amount;
                }
                if (isDefined(parentBounds.width)) {
                    pxBounds.width = parentBounds.width.amount;
                }
                if (isDefined(parentBounds.height)) {
                    pxBounds.height = parentBounds.height.amount;
                }
                let pxret = this.pxBoundsForView(pxBounds);
                if (pxret !== undefined) {
                    ret.bounds = boundsWithPixels(pxret);
                } else {
                    // safer to just throw
                    throw new Error(`view with id ${this.id} has no layout method (boundsForView or pxBoundsForView).`);
                }
            }
        }

        this.cachedStyle = ret;
        this.bounds = this.cachedStyle.bounds;


        // check if we are missing sides
        let checkRealBounds: boolean = false;

        let defaultBounds: Bounds = { kind: "Bounds"};

        if (isDefined(this.bounds.position)) {
            defaultBounds.position = this.bounds.position;
        }
        if (isDefined(this.bounds.x)) {
            defaultBounds.x = this.bounds.x;
        } else {
            checkRealBounds = true;
        }
        if (isDefined(this.bounds.y)) {
            defaultBounds.y = this.bounds.y;
        } else {
            checkRealBounds = true;
        }
        if (isDefined(this.bounds.width)) {
            defaultBounds.width = this.bounds.width;
        } else {
            checkRealBounds = true;
        }
        if (isDefined(this.bounds.height)) {
            defaultBounds.height = this.bounds.height;
        } else {
            checkRealBounds = true;
        }
        if (isDefined(this.bounds.rotation)) {
            defaultBounds.rotation = this.bounds.rotation;
        } else {
            defaultBounds.rotation = new NumberWithUnit(0, "deg");
        }
        if (isDefined(this.bounds.elevation)) {
            defaultBounds.elevation = this.bounds.elevation;
        } else {
            defaultBounds.elevation = new NumberWithUnit(0, "auto");
        }

        if (isDefined(this.bounds.rotationX)) {
            defaultBounds.rotationX = this.bounds.rotationX;
        } else {
            defaultBounds.rotationX = px(0);
        }

        if (isDefined(this.bounds.rotationY)) {
            defaultBounds.rotationY = this.bounds.rotationY;
        } else {
            defaultBounds.rotationY = px(0);
        }

        if (isDefined(this.bounds.rotationOriginX)) {
            defaultBounds.rotationOriginX = this.bounds.rotationOriginX;
        } else {
            defaultBounds.rotationOriginX = new NumberWithUnit(50, "%");
        }

        if (isDefined(this.bounds.rotationOriginY)) {
            defaultBounds.rotationOriginY = this.bounds.rotationOriginY;
        } else {
            defaultBounds.rotationOriginY = new NumberWithUnit(50, "%");
        }

        if (isDefined(this.bounds.z)) {
            defaultBounds.z = this.bounds.z;
        } else {
            defaultBounds.z = px(0);
        }

        if (isDefined(this.bounds.scaleX)) {
            defaultBounds.scaleX = this.bounds.scaleX;
        } else {
            defaultBounds.scaleX = new NumberWithUnit(100, "%");
        }

        if (isDefined(this.bounds.scaleY)) {
            defaultBounds.scaleY = this.bounds.scaleY;
        } else {
            defaultBounds.scaleY = new NumberWithUnit(100, "%");
        }

        if (isDefined(this.bounds.skewX)) {
            defaultBounds.skewX = this.bounds.skewX;
        } else {
            defaultBounds.skewX = new NumberWithUnit(0, "deg");
        }

        if (isDefined(this.bounds.skewY)) {
            defaultBounds.skewY = this.bounds.skewY;
        } else {
            defaultBounds.skewY = new NumberWithUnit(0, "deg");
        }

        // do we have any missing sides
        if (checkRealBounds === true) {
            let realBounds = this.getRealBounds();
            if (!isDefined(defaultBounds.x)) {
                defaultBounds.x = realBounds.x;
            }
            if (!isDefined(defaultBounds.y)) {
                defaultBounds.y = realBounds.y;
            }
            if (!isDefined(defaultBounds.width)) {
                defaultBounds.width = realBounds.width;
            }
            if (!isDefined(defaultBounds.height)) {
                defaultBounds.height = realBounds.height;
            }
        }

        this.cachedStyle.bounds = defaultBounds;
        this.bounds = defaultBounds;

        if (!isDefined(this.anchors)) {

            return {
                style: this.cachedStyle,
                parentBounds: parentBounds,
                childrenTargets: childrenTargets
            };
        }

        // constraints ?
        if ((!isDefined(this.anchors["top" as any]) || !this.anchors["top" as any].active) && (!isDefined(this.anchors["left" as any]) || !this.anchors["left" as any].active) &&
            (!isDefined(this.anchors["right" as any]) || !this.anchors["right" as any].active) && (!isDefined(this.anchors["bottom" as any]) || !this.anchors["bottom" as any].active) &&
            (!isDefined(this.anchors["width" as any]) || !this.anchors["width" as any].active) && (!isDefined(this.anchors["height" as any]) || !this.anchors["height" as any].active)
        ) {
            return {
                style: this.cachedStyle,
                parentBounds: parentBounds,
                childrenTargets: childrenTargets
            };
        }


        // left + width = right
        left = this.getAnchorValue("left");
        width = this.getAnchorValue("width");
        right = this.getAnchorValue("right");

        if (Logging.enableLogging) {
            console.log(this.id + ".anchorLeft = " + (left === undefined) ? "undefined" : left);
            console.log(this.id + ".anchorWidth = " + (width === undefined ) ? "undefined" : width);
            console.log(this.id + ".anchorRight = " + (right === undefined ) ? "undefined" : right);
        }


        if (left === undefined) {
            if ((width !== undefined) && (right !== undefined)) {
                left = NUSub(right, width);
            } else if (width !== undefined) {
                // just use the default x
                left = defaultBounds.x;
                right = NUAdd(left, width);
            } else if (right !== undefined) {
                // just use the default x
                left = defaultBounds.x;
                width = NUSub(right, left);
            } else if ((width === undefined) && (right === undefined)) {
                left = defaultBounds.x;
                width = defaultBounds.width;
                right = NUAdd(defaultBounds.x, defaultBounds.width);
            }
        } else if (width === undefined) {
            if ((left !== undefined) && (right !== undefined)) {
                width = NUSub(right, left);
            } else if (left !== undefined) {
                // just use the default width
                width = defaultBounds.width;
                right = NUAdd(left, width);
            } else if (right !== undefined) {
                left = defaultBounds.x!;
                width = NUSub(right, left);
            } else if ((left === undefined) && (right === undefined)) {
                left = defaultBounds.x!;
                width = defaultBounds.width!;
                right = NUAdd(defaultBounds.x!, defaultBounds.width!);
            }
        } else if (right === undefined) {
            if ((left !== undefined) && (width !== undefined)) {
                right = NUAdd(left, width);
            } else if (left !== undefined) {
                width = defaultBounds.width!;
                right = NUAdd(left, width);
            } else if (width !== undefined) {
                left = defaultBounds.x!;
                right = NUAdd(left, width);
            } else if ((left === undefined) && (width === undefined)) {
                left = defaultBounds.x!;
                width = defaultBounds.width!;
                right = NUAdd(defaultBounds.x!, defaultBounds.width!);
            }
        }

        // top + height = bottom
        top = this.getAnchorValue("top");
        height = this.getAnchorValue("height");
        bottom = this.getAnchorValue("bottom");

        if (Logging.enableLogging) {
            console.log(this.id + ".anchorTop = " + (top === undefined) ? "undefined" : top);
            console.log(this.id + ".anchorHeight = " + (height === undefined ) ? "undefined" : height);
            console.log(this.id + ".anchorBottom = " + (bottom === undefined ) ? "undefined" : bottom);
        }

        if (top === undefined) {
            if ((height !== undefined) && (bottom !== undefined)) {
                top = NUSub(bottom, height);
            } else if (height !== undefined) {
                // just use the default x
                top = defaultBounds.y!;
                bottom = NUAdd(top, height);
            } else if (bottom !== undefined) {
                // just use the default x
                top = defaultBounds.y!;
                height = NUSub(bottom, top);
            } else if ((height === undefined) && (bottom === undefined)) {
                top = defaultBounds.y!;
                height = defaultBounds.height!;
                bottom = NUAdd(defaultBounds.y!, defaultBounds.height!);
            }
        } else if (height === undefined) {
            if ((top !== undefined) && (bottom !== undefined)) {
                height = NUSub(bottom, top);
            } else if (top !== undefined) {
                // just use the default width
                height = defaultBounds.height!;
                bottom = NUAdd(top, height);
            } else if (bottom !== undefined) {
                top = defaultBounds.y!;
                height = NUSub(bottom, top);
            } else if ((top === undefined) && (bottom === undefined)) {
                top = defaultBounds.y!;
                height = defaultBounds.height!;
                bottom = NUAdd(defaultBounds.y!, defaultBounds.height!);
            }
        } else if (bottom === undefined) {
            if ((top !== undefined) && (height !== undefined)) {
                bottom = NUAdd(top, height);
            } else if (top !== undefined) {
                height = defaultBounds.height!;
                bottom = NUAdd(top, height);
            } else if (height !== undefined) {
                top = defaultBounds.y!;
                bottom = NUAdd(top, height);
            } else if ((top === undefined) && (height === undefined)) {
                top = defaultBounds.y!;
                height = defaultBounds.height!;
                bottom = NUAdd(defaultBounds.y!, defaultBounds.height!);
            }
        }

        if (isDefined(left)) {
            defaultBounds.x = left;
        }
        if (isDefined(top)) {
            defaultBounds.y = top;
        }
        if (isDefined(width)) {
            defaultBounds.width = width;
        }
        if (isDefined(height)) {
            defaultBounds.height = height;
        }



        if (isDefined(this.anchors["centerv"]) && this.anchors["centerv"].active === true && isDefined(parentBounds.height) && isDefined(defaultBounds.height)) {
            defaultBounds.y = pt( NUConvertToPoint(parentBounds.height).amount / 2 - NUConvertToPoint(defaultBounds.height).amount / 2 + NUConvertToPoint(this.anchors["centerv"].constant).amount );
        }
        if (isDefined(this.anchors["centerh"]) && this.anchors["centerh"].active === true && isDefined(parentBounds.width) && isDefined(defaultBounds.width)) {
            defaultBounds.x = pt( NUConvertToPoint(parentBounds.width).amount / 2 - NUConvertToPoint(defaultBounds.width).amount / 2 + NUConvertToPoint(this.anchors["centerh"].constant).amount );
        }

        defaultBounds.unit = "px";
        defaultBounds.position = 'absolute';


        if (Logging.enableLogging) {
            console.log(this.id + ".newBounds = " + defaultBounds);
        }

        this.bounds = defaultBounds;
        this.cachedStyle.bounds = defaultBounds;
        this.bounds = this._applyGrowth(this.bounds);


        return {
            style: this.cachedStyle,
            parentBounds: parentBounds,
            childrenTargets: childrenTargets
        };

    }

    public processStyleAndRender(requestBy: string, overrides: ViewStyle[]) {
        let ret: {style: ViewStyle, parentBounds: Bounds, childrenTargets: {target: string, styles: ViewStyle[]}[]} = this.processStyle(requestBy, overrides);

        this.render(ret.parentBounds, ret.style );

        // now update the children
        for (let i = 0; i < ret.childrenTargets.length; i += 1) {
            let target = ret.childrenTargets[i].target;
            if (target === "*") {
                for (let x = 0; x < this.subViews.length; x++) {
                    if (this.subViews[x] !== undefined) {
                        this.subViews[x].processStyleAndRender("", ret.childrenTargets[i].styles);
                    }
                }
            } else {
                let subView = this.findViewNamed(target);
                if (isDefined(subView)) {
                    subView.processStyleAndRender(requestBy, ret.childrenTargets[i].styles);
                }
            }
        }

    }


    render(parentBounds?: Bounds, style?: ViewStyle) {

        if (isDefined(this.getDiv())) {

            // clear the style
            this.getDiv().style.cssText = '';
            // hint no paint
            this.getDiv().style.visibility = 'hidden';
            // resize first
            if (isDefined(style) && isDefined(style.bounds)) {
                this.resize(style.bounds);
            } else {
                this.resize(this.getBounds());
            }

            // now set the style
            if (isDefined(style)) {
                renderViewStyle(this.getDiv(), style);
            } else {
                if (isDefined(this.cachedStyle)) {
                    renderViewStyle(this.getDiv(), this.cachedStyle);
                } else {
                    renderViewStyle(this.getDiv(), this);
                }
            }

            if (this.applyClickThrough) {
                applyClickThrough(this);
            }

            // hint paint
            this.getDiv().style.visibility = 'visible';

        }

    }


    setVisible (b: boolean) {
        let div = this.getDiv();
        this.visible = b;
        if (div !== undefined) {
            div.style.display = (b) ? 'block' : 'none';
        }
    }

    setClickDelegate(delegate: any, functionName: string) {
        this.clickDelegate = delegate;
        this.clickDelegateEventName = functionName;

        if (!isDefined(this.getDiv().viewRef)) {
            this.getDiv().viewRef = this;
        }
        this.getDiv().onclick = function (e: Event) {
            e.preventDefault();
            e.stopPropagation();
            if (Logging.enableLogging) {
                console.log('+CLICK ' + this.viewRef.id);
            }
            if (isDefined(this.viewRef) && isDefined(this.viewRef.clickDelegate)) {
                this.viewRef.clickDelegate[this.viewRef.clickDelegateEventName](this.viewRef, e);
            }
        }
    }

    setDoubleClickDelegate(delegate: any, functionName: string) {
        this.dblClickActionDelegate = delegate;
        this.dblClickActionDelegateEventName = functionName;
        if (!isDefined(this.getDiv().viewRef)) {
            this.getDiv().viewRef = this;
        }
        this.getDiv().addEventListener("dblclick", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (this.viewRef !== undefined) {
                if (this.viewRef.dblClickActionDelegate !== null) {

                    let b = this.viewRef.getRealBounds();
                    let x_pos = e.clientX - NUConvertToPixel(b.x).amount;
                    let y_pos = e.clientY - NUConvertToPixel(b.y).amount;

                    const clickOptions: EventOptions = {
                        x: x_pos,
                        y: y_pos,
                        clientX: e.clientX,
                        clientY: e.clientY,
                        screenX: e.screenX,
                        screenY: e.screenY,
                        action: 'dblclick'
                    };

                    this.viewRef.dblClickActionDelegate[this.viewRef.dblClickActionDelegateEventName](this.viewRef, clickOptions);
                }
            }
        });
    }


    setWheelEvent(fn: (sender: View, options: {eventName: "wheel", mouseEvent: WheelEvent, x: number, y: number}) => void) {

        let wheelEventHandler = (evt: WheelEvent) => {
            let b = this.getRealBounds();
            let x_pos = evt.clientX - NUConvertToPixel(b.x).amount;
            let y_pos = evt.clientY - NUConvertToPixel(b.y).amount;
            fn(this, {
                eventName: "wheel",
                mouseEvent: evt,
                x: x_pos,
                y: y_pos
            });
        }
        this.getDiv().addEventListener("wheel", wheelEventHandler);
        this.m_arrayEventHandlers.push({eventName: "wheel", func: wheelEventHandler});
    }


    setMouseDownMoveUpEvent(fn: (sender: View, options: {eventName: "down" | "up" | "move", mouseEvent: MouseEvent, x:number, y:number}) => void) {
        let x_pos = 0;
        let y_pos = 0;

        let mouseDownEventHandler = (evt: MouseEvent) => {
            let b = this.getRealBounds();
            x_pos = evt.clientX - NUConvertToPixel(b.x).amount;
            y_pos = evt.clientY - NUConvertToPixel(b.y).amount;
            fn(this, {
                eventName: "down",
                mouseEvent: evt,
                x: x_pos,
                y: y_pos
            });
        };

        let mouseUpEventHandler = (evt: MouseEvent) => {
            let b = this.getRealBounds();
            x_pos = evt.clientX - NUConvertToPixel(b.x).amount;
            y_pos = evt.clientY - NUConvertToPixel(b.y).amount;
            fn(this, {
                eventName: "up",
                mouseEvent: evt,
                x: x_pos,
                y: y_pos
            });
        }

        let mouseMoveEventHandler = (evt: MouseEvent) => {
            let b = this.getRealBounds();
            x_pos = evt.clientX - NUConvertToPixel(b.x).amount;
            y_pos = evt.clientY - NUConvertToPixel(b.y).amount;
            fn(this, {
                eventName: "move",
                mouseEvent: evt,
                x: x_pos,
                y: y_pos
            });
        }


        this.getDiv().addEventListener("mousedown", mouseDownEventHandler);
        this.getDiv().addEventListener("mouseup", mouseUpEventHandler);
        this.getDiv().addEventListener("mousemove", mouseMoveEventHandler);

        this.m_arrayEventHandlers.push({eventName: "mousedown", func: mouseDownEventHandler});
        this.m_arrayEventHandlers.push({eventName: "mouseup", func: mouseUpEventHandler});
        this.m_arrayEventHandlers.push({eventName: "mousemove", func: mouseMoveEventHandler});

    }

    setHoverEvent(fn: (sender: View, options: EventOptions) => void) {

        let mouseOverEvent = (e: MouseEvent)  => {
            let b = this.getRealBounds();
            let x_pos = e.clientX - NUConvertToPixel(b.x).amount;
            let y_pos = e.clientY - NUConvertToPixel(b.y).amount;
            const options: EventOptions = {
                x: x_pos,
                y: y_pos,
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY,
                action: 'mouseover'
            };
            fn(this, options);
        };

        let mouseOutEvent = (e: MouseEvent) => {
            let b = this.getRealBounds();
            let x_pos = e.clientX - NUConvertToPixel(b.x).amount;
            let y_pos = e.clientY - NUConvertToPixel(b.y).amount;
            const options: EventOptions = {
                x: x_pos,
                y: y_pos,
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY,
                action: 'mouseout'
            };
            fn(this, options);
        }

        this.getDiv().addEventListener("mouseover", mouseOverEvent);
        this.getDiv().addEventListener("mouseout", mouseOutEvent);

        this.m_arrayEventHandlers.push({eventName: "mouseover", func: mouseOverEvent});
        this.m_arrayEventHandlers.push({eventName: "mouseout", func: mouseOutEvent});

    }

    setHoverDelegate(delegate: any, functionName: string) {
        this.hoverDelegate = delegate;
        this.hoverDelegateEventName = functionName;

        if (!isDefined(this.getDiv().viewRef)) {
            this.getDiv().viewRef = this;
        }

        let mouseOverDelegate = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isDefined(delegate) && isDefined(functionName)) {
                let b = this.getRealBounds();
                let x_pos = e.clientX - NUConvertToPixel(b.x).amount;
                let y_pos = e.clientY - NUConvertToPixel(b.y).amount;
                const clickOptions: EventOptions = {
                    x: x_pos,
                    y: y_pos,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    screenX: e.screenX,
                    screenY: e.screenY,
                    action: 'mouseover'
                };
                delegate[functionName](this, clickOptions);
            }
        }

        let mouseOutDelegate = (e) => {
            e.preventDefault();
            e.stopPropagation();
            let b = this.getRealBounds();
            let x_pos = e.clientX - NUConvertToPixel(b.x).amount;
            let y_pos = e.clientY - NUConvertToPixel(b.y).amount;
            const clickOptions: EventOptions = {
                x: x_pos,
                y: y_pos,
                clientX: e.clientX,
                clientY: e.clientY,
                screenX: e.screenX,
                screenY: e.screenY,
                action: 'mouseout'
            };
            delegate[functionName](this, clickOptions);
        }

        this.getDiv().addEventListener("mouseover", mouseOverDelegate);
        this.getDiv().addEventListener("mouseout", mouseOutDelegate);

        this.m_arrayEventHandlers.push({eventName: "mouseover", func: mouseOverDelegate});
        this.m_arrayEventHandlers.push({eventName: "mouseout", func: mouseOutDelegate});
    }



    setActionDelegate(delegate: any, functionName: string) {
        this.actionDelegate = delegate;
        this.actionDelegateEventName = functionName;
    }

    setAction(fn: any) {
        this.actionArrowFunction = fn;
    }

    setEnabled(e: boolean) {
        if ((this as any).onEnableStatusChanged) {
            (this as any).onEnableStatusChanged(e);
        }
        this.render();
    }




    anchor (side: 'left' | 'right' | 'top' | 'bottom' | 'width' | 'height' | 'centerv' | 'centerh' | string, active: boolean, target: string, targetSide: string, constant: any = 0 ) {
        this.anchors[side as any] = new Anchor(active, side, target, targetSide, constant);
    }


    getAnchorValue(side: 'left' | 'right' | 'top' | 'bottom' | 'width' | 'height' | 'centerv' | 'centerh' | string): NumberWithUnit | undefined {



        if (this.anchors === undefined) {
            return undefined;
        }
        if (this.anchors[side as any] === undefined) {
            return undefined;
        }
        if (!this.anchors[side as any].active) {
            return undefined;
        }
        if ((side === "width") || (side === "height")) {
            return anyToNU(this.anchors[side as any].constant);
        }
        if (this.anchors[side as any].target === "") {
            return undefined;
        }
        if (this.anchors[side as any].target === "parentView") {
            if (this.parentView) {
                const parentBounds = this.parentView.getBounds(this.id);
                if (this.anchors[side as any].targetSide === "leading") {
                    return anyToNU(this.anchors[side as any].constant);
                }
                if (this.anchors[side as any].targetSide === "trailing") {
                    if ((side === "left") || (side === "right")) {
                        return NUAdd(parentBounds.width, this.anchors[side as any].constant);
                    }
                    if ((side === "top") || (side === "bottom")) {
                        return NUAdd(parentBounds.height, this.anchors[side as any].constant);
                    }
                }
            }
            //console.warn("Anchor " + side + " for view " + this.id + " does not specify a valid constraint");
            return undefined;
        } else {

            if (Logging.enableLogging) {
                const str = this.id + ".getAnchorValue(\"" + side + "\") for target " + this.anchors[side as any].target;
                console.log(str);
            }
            if (!this.parentView) {
                return undefined;
            }
            const view = this.parentView.findViewNamed(this.anchors[side as any].target);
            if (view === undefined) {
                console.warn("Anchor " + side + " for view " + this.id + " does not specify a target");
                return undefined;
            }
            const viewBounds = view.bounds; //getBounds(this.id);

            if (Logging.enableLogging) {
                console.log("bounds found for " + this.anchors[side as any].target + " = " + viewBounds);
            }

            if (viewBounds === undefined) {
                //console.warn("Anchor " + side + " for view " + this.id + " does not specify a target with valid bounds.");
                return undefined;
            }
            if (this.anchors[side as any].targetSide === "leading") {
                if ((side === "left") || (side === "right")) {
                    return NUAdd(viewBounds.x, this.anchors[side as any].constant);
                }
                if ((side === "top") || (side === "bottom")) {
                    return NUAdd(viewBounds.y, this.anchors[side as any].constant);
                }

            }
            if (this.anchors[side as any].targetSide === "trailing") {
                if ((side === "left") || (side === "right")) {
                    return NUAdd(NUAdd(viewBounds.x, viewBounds.width), this.anchors[side as any].constant);
                }
                if ((side === "top") || (side === "bottom")) {
                    return NUAdd(NUAdd(viewBounds.y, viewBounds.height), this.anchors[side as any].constant);
                }
            }
            //console.warn("Anchor " + side + " for view " + this.id + " does not specify a valid constraint");
            return undefined;
        }
    }


    setScrollView (horizEnabled: boolean,verticalEnabled: boolean) {
        "use strict";
        this.getDiv().style.overflowX = (horizEnabled) ? "scroll" : "hidden";
        this.getDiv().style.overflowY = (verticalEnabled) ? "scroll" : "hidden";
    }

    setLayerHeight (z: string) {
        this.zIndex = z;
        if (isDefined(this.getDiv())) {
            this.getDiv().style.zIndex = z;
        }
    }

    setOpacity (o: number) {
        this.opacity = o * 100;
        this.getDiv().style.opacity = o;
    }

    getRealBounds() {
        let g = (this.getDiv() as HTMLElement).getBoundingClientRect();
        return {
            x: new NumberWithUnit(g.left, "px"),
            y: new NumberWithUnit(g.top, "px"),
            width: new NumberWithUnit(g.width, "px"),
            height: new NumberWithUnit(g.height, "px"),
            position: "absolute",
            unit: 'px',
            rotation: this.bounds.rotation,
            elevation: this.bounds.elevation
        };
    }

    getBounds(requestedBy: string = "", forceRecalc: boolean = false): Bounds {
        if (this.dontCacheStyle === true || forceRecalc === true) {
            this.processStyle(requestedBy, this.savedOverrides);
            return this.cachedStyle.bounds;
        }

        if (isDefined(this.cachedStyle) && isDefined(this.cachedStyle.bounds)) {
            return this.cachedStyle.bounds;
        } else {
            this.processStyle(requestedBy, this.savedOverrides);
            return this.cachedStyle.bounds;
        }
    }


    getBoundsOBSOLETE(requestBy: string): Bounds | undefined {
        let x: NumberWithUnit | undefined = undefined;
        let y: NumberWithUnit | undefined = undefined;
        let top: NumberWithUnit | undefined = undefined;
        let right: NumberWithUnit | undefined = undefined;
        let left: NumberWithUnit | undefined = undefined;
        let bottom: NumberWithUnit | undefined = undefined;
        let width: NumberWithUnit | undefined = undefined;
        let height: NumberWithUnit | undefined = undefined;


        if (Logging.enableLogging) {
            const str = this.id + ".getBounds(\"" + requestBy + "\");";
            console.log(str);
        }
        let parentBounds: Bounds | undefined = new Bounds(0,0,0,0);
        if (this.parentView === undefined) {
            if (Logging.enableLogging) {
                console.log(this.id + " has no parentView");
            }
            // get the parent node if possible, returns undefined !
            const pnode = this.getDiv().parentNode;
            if (pnode === document.body) {
                parentBounds = {
                    kind: "Bounds",
                    x: new NumberWithUnit(0, "px"),
                    y: new NumberWithUnit(0, "px"),

                    width: new NumberWithUnit(Application.instance.documentElementClientWidth, "px"),
                    height: new NumberWithUnit(Application.instance.documentElementClientHeight, "px"),
                    unit: 'px',
                    rotation: new NumberWithUnit(0, "deg"),
                    elevation: new NumberWithUnit(0, "auto"),
                    position: 'absolute',
                    z: px(0),
                    rotationX: px(0),
                    rotationY: px(0),
                    rotationOriginX: new NumberWithUnit(50, "%"),
                    rotationOriginY: new NumberWithUnit(50, "%"),

                };
            } else {
                if ((isDefined(pnode)) && (pnode.style !== undefined)) {
                    if (pnode.style.left !== undefined) {
                        x = new NumberWithUnit(pnode.style.left.substr(0, pnode.style.left.indexOf('px')), "px");
                    }
                    if (pnode.style.top !== undefined) {
                        y = new NumberWithUnit(pnode.style.top.substr(0, pnode.style.top.indexOf('px')), "px");
                    }
                    if (pnode.style.width !== undefined) {
                        width = new NumberWithUnit(pnode.style.width.substr(0, pnode.style.width.indexOf('px')), "px");
                    }
                    if (pnode.style.height !== undefined) {
                        height = new NumberWithUnit(pnode.style.height.substr(0, pnode.style.height.indexOf('px')), "px");
                    }
                } else {
                    x = new NumberWithUnit(0, "px");
                    y = new NumberWithUnit(0, "px");
                    width = new NumberWithUnit(100, "px");
                    height = new NumberWithUnit(100, "px");
                }

                parentBounds = {
                    kind: "Bounds",
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    unit: 'px',
                    position: 'absolute',
                    rotation: new NumberWithUnit(0, "deg"),
                    elevation: new NumberWithUnit(0, "auto"),
                    z: px(0),

                };
            }

        } else {
            if (requestBy !== "parentView") {
                parentBounds = this.parentView!.getBounds("");
            } else {
                parentBounds = new Bounds(0,0,0,0);

            }
        }

        // call the layout functions
        if (isDefined(this["boundsForView"])) {
            this.bounds = this["boundsForView"](parentBounds);
        }
        if (isDefined(this.pxBoundsForView) && this.bounds === undefined) {
            let pxBounds: { x?: number, y?: number, width?: number, height?: number, unit: string, position: string} = {
                unit: 'px',
                position: 'absolute'
            };
            if (isDefined(parentBounds.x)) {
                pxBounds.x = parentBounds.x.amount;
            }
            if (isDefined(parentBounds.y)) {
                pxBounds.y = parentBounds.y.amount;
            }
            if (isDefined(parentBounds.width)) {
                pxBounds.width = parentBounds.width.amount;
            }
            if (isDefined(parentBounds.height)) {
                pxBounds.height = parentBounds.height.amount;
            }
            let pxret = this.pxBoundsForView(pxBounds);
            if (pxret !== undefined) {
                this.bounds = boundsWithPixels(pxret);
            } else {
                // safer to just throw
                throw new Error(`view with id ${this.id} has no layout method (boundsForView or pxBoundsForView).`);
            }
        }
        this.bounds = this._applyGrowth(this.bounds);

        // check if we are missing sides
        let checkRealBounds: boolean = false;

        let defaultBounds: Bounds = {kind: "Bounds"};

        if (isDefined(this.bounds.position)) {
            defaultBounds.position = this.bounds.position;
        }
        if (isDefined(this.bounds.x)) {
            defaultBounds.x = this.bounds.x;
        } else {
            checkRealBounds = true;
        }
        if (isDefined(this.bounds.y)) {
            defaultBounds.y = this.bounds.y;
        } else {
            checkRealBounds = true;
        }
        if (isDefined(this.bounds.width)) {
            defaultBounds.width = this.bounds.width;
        } else {
            checkRealBounds = true;
        }
        if (isDefined(this.bounds.height)) {
            defaultBounds.height = this.bounds.height;
        } else {
            checkRealBounds = true;
        }
        if (isDefined(this.bounds.rotation)) {
            defaultBounds.rotation = this.bounds.rotation;
        } else {
            defaultBounds.rotation = new NumberWithUnit(0, "deg");
        }
        if (isDefined(this.bounds.elevation)) {
            defaultBounds.elevation = this.bounds.elevation;
        } else {
            defaultBounds.elevation = new NumberWithUnit(0, "auto");
        }

        if (isDefined(this.bounds.rotationX)) {
            defaultBounds.rotationX = this.bounds.rotationX;
        } else {
            defaultBounds.rotationX = px(0);
        }

        if (isDefined(this.bounds.rotationY)) {
            defaultBounds.rotationY = this.bounds.rotationY;
        } else {
            defaultBounds.rotationY = px(0);
        }

        if (isDefined(this.bounds.rotationOriginX)) {
            defaultBounds.rotationOriginX = this.bounds.rotationOriginX;
        } else {
            defaultBounds.rotationOriginX = new NumberWithUnit(50, "%");
        }

        if (isDefined(this.bounds.rotationOriginY)) {
            defaultBounds.rotationOriginY = this.bounds.rotationOriginY;
        } else {
            defaultBounds.rotationOriginY = new NumberWithUnit(50, "%");
        }

        if (isDefined(this.bounds.z)) {
            defaultBounds.z = this.bounds.z;
        } else {
            defaultBounds.z = px(0);
        }

        if (isDefined(this.bounds.scaleX)) {
            defaultBounds.scaleX = this.bounds.scaleX;
        } else {
            defaultBounds.scaleX = new NumberWithUnit(100, "%");
        }

        if (isDefined(this.bounds.scaleY)) {
            defaultBounds.scaleY = this.bounds.scaleY;
        } else {
            defaultBounds.scaleY = new NumberWithUnit(100, "%");
        }

        if (isDefined(this.bounds.skewX)) {
            defaultBounds.skewX = this.bounds.skewX;
        } else {
            defaultBounds.skewX = new NumberWithUnit(0, "deg");
        }

        if (isDefined(this.bounds.skewY)) {
            defaultBounds.skewY = this.bounds.skewY;
        } else {
            defaultBounds.skewY = new NumberWithUnit(0, "deg");
        }

        // do we have any missing sides
        if (checkRealBounds === true) {
            let realBounds = this.getRealBounds();
            if (!isDefined(defaultBounds.x)) {
                defaultBounds.x = realBounds.x;
            }
            if (!isDefined(defaultBounds.y)) {
                defaultBounds.y = realBounds.y;
            }
            if (!isDefined(defaultBounds.width)) {
                defaultBounds.width = realBounds.width;
            }
            if (!isDefined(defaultBounds.height)) {
                defaultBounds.height = realBounds.height;
            }
        }

        this.bounds = defaultBounds;


        if (!isDefined(this.anchors)) {
            return this.bounds;
        }

        // constraints ?
        if ((!isDefined(this.anchors["top" as any]) || !this.anchors["top" as any].active) && (!isDefined(this.anchors["left" as any]) || !this.anchors["left" as any].active) &&
            (!isDefined(this.anchors["right" as any]) || !this.anchors["right" as any].active) && (!isDefined(this.anchors["bottom" as any]) || !this.anchors["bottom" as any].active) &&
            (!isDefined(this.anchors["width" as any]) || !this.anchors["width" as any].active) && (!isDefined(this.anchors["height" as any]) || !this.anchors["height" as any].active)
        ) {
            return this.bounds;
        }


        // left + width = right
        left = this.getAnchorValue("left");
        width = this.getAnchorValue("width");
        right = this.getAnchorValue("right");

        if (Logging.enableLogging) {
            console.log(this.id + ".anchorLeft = " + (left === undefined) ? "undefined" : left);
            console.log(this.id + ".anchorWidth = " + (width === undefined ) ? "undefined" : width);
            console.log(this.id + ".anchorRight = " + (right === undefined ) ? "undefined" : right);
        }


        if (left === undefined) {
            if ((width !== undefined) && (right !== undefined)) {
                left = NUSub(right, width);
            } else if (width !== undefined) {
                // just use the default x
                left = defaultBounds.x;
                right = NUAdd(left, width);
            } else if (right !== undefined) {
                // just use the default x
                left = defaultBounds.x;
                width = NUSub(right, left);
            } else if ((width === undefined) && (right === undefined)) {
                left = defaultBounds.x;
                width = defaultBounds.width;
                right = NUAdd(defaultBounds.x, defaultBounds.width);
            }
        } else if (width === undefined) {
            if ((left !== undefined) && (right !== undefined)) {
                width = NUSub(right, left);
            } else if (left !== undefined) {
                // just use the default width
                width = defaultBounds.width;
                right = NUAdd(left, width);
            } else if (right !== undefined) {
                left = defaultBounds.x!;
                width = NUSub(right, left);
            } else if ((left === undefined) && (right === undefined)) {
                left = defaultBounds.x!;
                width = defaultBounds.width!;
                right = NUAdd(defaultBounds.x!, defaultBounds.width!);
            }
        } else if (right === undefined) {
            if ((left !== undefined) && (width !== undefined)) {
                right = NUAdd(left, width);
            } else if (left !== undefined) {
                width = defaultBounds.width!;
                right = NUAdd(left, width);
            } else if (width !== undefined) {
                left = defaultBounds.x!;
                right = NUAdd(left, width);
            } else if ((left === undefined) && (width === undefined)) {
                left = defaultBounds.x!;
                width = defaultBounds.width!;
                right = NUAdd(defaultBounds.x!, defaultBounds.width!);
            }
        }

        // top + height = bottom
        top = this.getAnchorValue("top");
        height = this.getAnchorValue("height");
        bottom = this.getAnchorValue("bottom");

        if (Logging.enableLogging) {
            console.log(this.id + ".anchorTop = " + (top === undefined) ? "undefined" : top);
            console.log(this.id + ".anchorHeight = " + (height === undefined ) ? "undefined" : height);
            console.log(this.id + ".anchorBottom = " + (bottom === undefined ) ? "undefined" : bottom);
        }

        if (top === undefined) {
            if ((height !== undefined) && (bottom !== undefined)) {
                top = NUSub(bottom, height);
            } else if (height !== undefined) {
                // just use the default x
                top = defaultBounds.y!;
                bottom = NUAdd(top, height);
            } else if (bottom !== undefined) {
                // just use the default x
                top = defaultBounds.y!;
                height = NUSub(bottom, top);
            } else if ((height === undefined) && (bottom === undefined)) {
                top = defaultBounds.y!;
                height = defaultBounds.height!;
                bottom = NUAdd(defaultBounds.y!, defaultBounds.height!);
            }
        } else if (height === undefined) {
            if ((top !== undefined) && (bottom !== undefined)) {
                height = NUSub(bottom, top);
            } else if (top !== undefined) {
                // just use the default width
                height = defaultBounds.height!;
                bottom = NUAdd(top, height);
            } else if (bottom !== undefined) {
                top = defaultBounds.y!;
                height = NUSub(bottom, top);
            } else if ((top === undefined) && (bottom === undefined)) {
                top = defaultBounds.y!;
                height = defaultBounds.height!;
                bottom = NUAdd(defaultBounds.y!, defaultBounds.height!);
            }
        } else if (bottom === undefined) {
            if ((top !== undefined) && (height !== undefined)) {
                bottom = NUAdd(top, height);
            } else if (top !== undefined) {
                height = defaultBounds.height!;
                bottom = NUAdd(top, height);
            } else if (height !== undefined) {
                top = defaultBounds.y!;
                bottom = NUAdd(top, height);
            } else if ((top === undefined) && (height === undefined)) {
                top = defaultBounds.y!;
                height = defaultBounds.height!;
                bottom = NUAdd(defaultBounds.y!, defaultBounds.height!);
            }
        }

        if (isDefined(left)) {
            defaultBounds.x = left;
        }
        if (isDefined(top)) {
            defaultBounds.y = top;
        }
        if (isDefined(width)) {
            defaultBounds.width = width;
        }
        if (isDefined(height)) {
            defaultBounds.height = height;
        }



        if (isDefined(this.anchors["centerv"]) && this.anchors["centerv"].active === true && isDefined(parentBounds.height) && isDefined(defaultBounds.height)) {
            defaultBounds.y = pt( NUConvertToPoint(parentBounds.height).amount / 2 - NUConvertToPoint(defaultBounds.height).amount / 2 + NUConvertToPoint(this.anchors["centerv"].constant).amount );
        }
        if (isDefined(this.anchors["centerh"]) && this.anchors["centerh"].active === true && isDefined(parentBounds.width) && isDefined(defaultBounds.width)) {
            defaultBounds.x = pt( NUConvertToPoint(parentBounds.width).amount / 2 - NUConvertToPoint(defaultBounds.width).amount / 2 + NUConvertToPoint(this.anchors["centerh"].constant).amount );
        }

        defaultBounds.unit = "px";
        defaultBounds.position = 'absolute';


        if (Logging.enableLogging) {
            console.log(this.id + ".newBounds = " + defaultBounds);
        }

        this.bounds = defaultBounds;
        this.bounds = this._applyGrowth(this.bounds);


        return this.bounds;

    }




    _applyGrowth (bounds: Bounds) {
        let i = 0;
        if (isDefined(this.growths)) {
            for (i = 0; i < this.growths.length; i += 1) {
                if (bounds.width !== undefined) {
                    bounds.width = NUAdd(bounds.width, this.growths[i].width);
                }
                if (bounds.height !== undefined) {
                    bounds.height = NUAdd(bounds.height, this.growths[i].height);
                }
            }
        }
        return bounds;
    }

    growBy(size: Size) {

        assert(size !== undefined, "A size must be supplied");
        assert(size !== undefined, "A size must be supplied");
        assert(size.width !== undefined, "A width must be supplied");
        assert(size.height !== undefined, "A height must be supplied");
        this.growths.push(size);


        if (this.parentView !== undefined) {
            if (this.parentView !== undefined) {
                if (this.parentView.childIsGrowing !== undefined) {
                    this.parentView.childIsGrowing(this, size);
                }
            }
        }
    }



    doResize (forceRecalc: boolean = false) {
        let i: number = 0;
        let newBounds: Bounds = this.getBounds("", forceRecalc);

        this.bounds = newBounds;
        this.resize(newBounds);

        if (this.subViews === undefined) { this.subViews = []; }

        for (i = 0; i < this.subViews.length; i += 1) {
            this.subViews[i].doResize(forceRecalc);
        }


        if (isDefined(this.wasResized)) {
            this.wasResized(newBounds);
        }

    }


    doResizeFrameOnly (forceRecalc: boolean = false) {
        try {
            let newBounds: Bounds = this.getBounds("", forceRecalc);
            this.resize(newBounds);

            if (this.subViews === undefined) {
                this.subViews = [];
            }

            if (isDefined(this.wasResized)) {
                this.wasResized(newBounds);
            }
        } catch (e) {
            console.warn("Could not resize view: " + this.id);
            console.warn("switch logging on to throw");
            throw e;
            if (Logging.enableLogging) {
                throw e;
            }
        }


    }


    resize(bounds: Bounds) {

        if (this._div !== undefined) {
            this._div.style.position = bounds.position;
            if (bounds.x !== undefined && bounds.x.unit !== undefined && bounds.x.unit !== "auto") {
                this._div.style.left = bounds.x.amount + bounds.x.unit;
            }
            if (bounds.y !== undefined && bounds.y.unit !== undefined && bounds.y.unit !== "auto") {
                this._div.style.top = bounds.y.amount + bounds.y.unit;
            }
            if (bounds.y !== undefined && bounds.height !== undefined && bounds.y.unit !== "auto" && bounds.height.unit !== "auto") {
                let bt = NUAdd(bounds.y, bounds.height);
                this._div.style.bottom = bt.amount + bt.unit;
            }
            if (bounds.x !== undefined && bounds.width !== undefined && bounds.x.unit !== "auto" && bounds.width.unit !== "auto") {
                let r = NUAdd(bounds.x, bounds.width);
                this._div.style.right = r.amount + r.unit;
            }
            if (bounds.width !== undefined && bounds.width.unit !== undefined && bounds.width.unit !== "auto") {
                this._div.style.width = bounds.width.amount + bounds.width.unit;
            }
            if (bounds.height !== undefined && bounds.height.unit !== undefined && bounds.height.unit !== "auto") {
                this._div.style.height = bounds.height.amount + bounds.height.unit;
            }

            let transform = '';

            if (bounds.rotation !== undefined && bounds.rotation.unit === "deg") {
                transform = `rotate(${bounds.rotation.amount}${bounds.rotation.unit}) `;
            }
            if (bounds.rotationX !== undefined && bounds.rotationX.unit === "deg") {
                transform += `rotateX(${bounds.rotationX.amount}${bounds.rotationX.unit}) `;

            }
            if (bounds.rotationY !== undefined && bounds.rotationY.unit === "deg") {
                transform += `rotateY(${bounds.rotationY.amount}${bounds.rotationY.unit}) `;
            }

            let scaleX100 = 100;
            let scaleY100 = 100;
            if (bounds.scaleX !== undefined && bounds.scaleX.unit === "%" &&
                bounds.scaleY !== undefined && bounds.scaleY.unit === "%")
                {
                    scaleX100 = bounds.scaleX.amount;
                    scaleY100 = bounds.scaleY.amount;
                    transform += `scale(${(scaleX100 / 100.00)},${(scaleY100 / 100.00)}) `;
            }

            if (bounds.skewX !== undefined && bounds.skewX.unit === "deg" &&
                bounds.skewY !== undefined && bounds.skewY.unit === "deg") {
                transform += `skew(${bounds.skewX.amount}deg,${bounds.skewY.amount}deg) `;
            }


            let transformOrigin = "";
            if (bounds.rotationOriginX !== undefined && bounds.rotationOriginX.unit === "%" &&
                bounds.rotationOriginY !== undefined && bounds.rotationOriginY.unit === "%") {
                transformOrigin = `${bounds.rotationOriginX.amount}% ${bounds.rotationOriginY.amount}%`;
            }

            //console.log(transform);

            this._div.style.transform = transform;
            if (transformOrigin !== "") {
                this._div.style.transformOrigin = transformOrigin;
            }

            this._div.style.perspective = '0px';
            this._div.style.perspectiveOrigin = 'center';

        }
    }


    attach(view: View) {

        if (Logging.enableLogging) {
            const str = this.id + ".attach(\"" + view.id + "\");";
            console.log(str);
        }

        if (this.subViews === undefined) { this.subViews = []; }
        this.subViews.push(view);
        if (this.getDiv() !== undefined) {
            // is view.getDiv() already in this.getDiv() ?
            if (!isDefined(view.getDiv().parentNode)) {
                this.getDiv().appendChild(view.getDiv());
            }
        }
        if (this.viewController) {
            //if (this.viewController.appName === undefined) {
                view.viewController = this.viewController;
            //}
        }

        //view.getDiv().style.webkitTapHighlightColor = "rgba(0,0,0,0)";


        view.parentView = this;
        //if (!this.NO_RESIZE) {
        //    view.doResize();
        //}
        if (view.viewWasAttached !== undefined) {
            view.viewWasAttached();
        }
        view.processStyleAndRender("", []);

        view.getDiv().viewRef = view;
    }


    findViewNamed(name: string): View | undefined {
        let i = 0;
        if (Logging.enableLogging) {
            const str = this.id + ".findViewNamed(\"" + name + "\");";
            console.log(str);
        }

        if (this.id === name) {
            return this;
        }
        if (!isDefined(this.subViews)) {
            console.warn('View ' + this.id + ' has no subViews');
            console.warn('typeof: ' + (typeof this).toString());
            return undefined;
        }
        for (i = 0; i < this.subViews.length; i += 1) {
            const ret = this.subViews[i].findViewNamed(name);
            if (ret !== undefined) { return ret; }
        }
        return undefined;
    }


    focus() {
        this.getDiv().focus();
    }


    detachItSelf() {
        this.detachAllChildren();
        this._detachItself();
    }

    detachAllChildren() {
        if (isDefined(this.subViews)) {
            for (let i = 0; i < this.subViews.length; i++) {
                this.subViews[i].detachItSelf();
            }
        }
        if (this._div !== undefined) {
            while (this._div.children.length > 0) {
                this._div.removeChild(this._div.children[this._div.children.length - 1]);
            }
        }
        this.subViews = [];
    }

    private _detachItself() {
        if (isDefined(this.viewWillBeDeattached)) {
            this.viewWillBeDeattached();
        }
        let handler = ServiceGetter.instance.handler;
        for (let i = 0; i < this.m_arrayEventHandlers.length; i ++) {
            handler.removeListener(this._div, this.m_arrayEventHandlers[i].eventName, this.m_arrayEventHandlers[i].func);
        }
        let el = this.getDiv() as HTMLElement;
        if (isDefined(el)) {
            for (let i = el.children.length - 1; i >= 0; i--) {
                el.removeChild(el.children[i]);
            }
            el.remove();
            ServiceGetter.instance.pool.returnElement(this.elementName, this._div);
        }
        if (isDefined(this.viewWasDetached)) {
            try {
                this.viewWasDetached();
            } catch (viewDetachedError) {
                console.warn(viewDetachedError.message);
                console.warn("full error", viewDetachedError);
            }
        }
        delete this._div;
    }


/*
    detachAllChildren() {
        let i = 0;
        if (this.subViews === undefined) {
            this.subViews = [];
        }
        if (isDefined(this.getDiv())) {

            for (i = 0; i < this.subViews.length; i += 1) {
                this.subViews[i].detachItSelf();
                // this._detachView(this.subViews[i]);
            }
            this.subViews = [];

            while ( this.getDiv().childNodes.length>0) {
                this.getDiv().removeChild(this.getDiv().children[this.getDiv().childNodes.length-1]);
            }

        }
    }

    protected _detachView(view: View) {
        let i = 0;
        if (!isDefined(view)) {
            return;
        }

        if (isDefined(view.viewWillBeDeattached)) {
            view.viewWillBeDeattached();
        }

        for (i = 0; i < view.subViews.length; i += 1) {
            view._detachView(view.subViews[i]);
        }
        if (isDefined(view._div) && isDefined(view._div.children)) {
            for (i = 0; i < view._div.children.length; i += 1) {
                if (isDefined(view._div.children[i].viewRef)) {
                    view._div.children[i].viewRef = undefined;
                }
                view._div.removeChild(view._div.children[i]);
            }
        }
        let handler = ServiceGetter.instance.handler;
        for (let i = 0; i < this.m_arrayEventHandlers.length; i ++) {
            handler.removeListener(this._div, this.m_arrayEventHandlers[i].eventName, this.m_arrayEventHandlers[i].func);
        }


        if (isDefined(view.parentView)) {
            // @ts-ignore
            if (isDefined(view.parentView.getDiv()) && isDefined(view.getDiv())) {

                try {
                    // @ts-ignore
                    view.parentView.getDiv().removeChild(view.getDiv());
                } catch (ee) {
                    console.warn(ee.message);
                }
            }
        }
        let el = view.getDiv() as HTMLElement;
        if (isDefined(el)) {
            for (let i = el.children.length - 1; i >= 0; i--) {
                el.removeChild(el.children[i]);
            }
            el.remove();

        }

        if (isDefined(view.viewWasDetached)) {
            try {
                view.viewWasDetached();
            } catch (viewDetachedError) {
                console.warn(viewDetachedError.message);
                console.warn("full error", viewDetachedError);
            }
        }
        ServiceGetter.instance.pool.returnElement(this.elementName, this._div);
        delete this._div;
        view.parentView = undefined;
    }


    detach(name: string) {
        let idx = -1;
        let i = 0;
        if (name === "") {
            console.warn("function " + this.id + ".detach expects a string as a parameter");
        }
        for (i = 0; i < this.subViews.length; i += 1) {
            if (this.subViews[i].id === name) {
                idx = i;
            }
        }

        if (idx>-1) {
            this._detachView(this.subViews[idx]);
            this.subViews.splice(idx,1);
        }
    }

    detachItSelf() {
        this.detachAllChildren();
        if (this.parentView) {
            this.parentView.detach(this.id);
        } else {

            if (isDefined(this.viewWasDetached)) {
                try {
                    this.viewWasDetached();
                } catch (viewDetachedError) {
                    console.warn(viewDetachedError.message);
                    console.warn("full error", viewDetachedError);
                }
            }

            if (isDefined(this.getDiv()) && isDefined(this.getDiv().parentNode)) {
                this.getDiv().parentNode.removeChild(this.getDiv());
            }
        }
    }

*/

    scrollCallback(event?:any) {
        "use strict";
        //this.getDiv().style.left = (MentatJS._offsetX + event.clientX - MentatJS._startX) + 'px';
        //this.getDiv().style.top = (MentatJS._offsetY + event.clientY - MentatJS._startY) + 'px';
    }


    isDragScroll(): boolean {
        "use strict";
        if (this.dragScroll) {
            return true;
        }
        if (this.parentView) {
            return this.parentView.isDragScroll();
        }
        return false;
    }

    setDragNDrop(isDragNDrop: boolean, id: string) {
        if (isDragNDrop) {
            this.isDragNDrop = true;
            this.getDiv().viewRef = this;
            this.getDiv().dragNDropId = id;
            this.getDiv().draggable = true;

            this.getDiv().addEventListener("dragstart", function (e: DragEvent) {

                // @ts-ignore
                let self : HTMLElement & { viewRef: View, dragNDropId: string, draggable: boolean} = this;

                e.stopPropagation();
                e.dataTransfer!.effectAllowed = 'move';
                e.dataTransfer!.setData('text/plain', self.dragNDropId);

                if (self.viewRef.dragDelegate !== undefined) {
                    if (self.viewRef.dragDelegate.viewDragStart !== undefined) {
                        self.viewRef.dragDelegate.viewDragStart(self.viewRef, self.dragNDropId);
                    }
                }

            }, false);
            this.getDiv().addEventListener("dragend", function (e: DragEvent) {
                let self : HTMLElement & { viewRef: View, dragNDropId: string, draggable: boolean} = this;
                if (self.viewRef.dragDelegate !== undefined) {
                    if (self.viewRef.dragDelegate.viewWasDragged !== undefined) {
                        self.viewRef.dragDelegate.viewWasDragged(self.viewRef, {event: e, x: e.screenX, y: e.screenY});
                    }
                }
            }, false);




        }
    }


    // DRAG

    setDraggable(isDraggable: boolean) {
        if (isDraggable) {
            this.isDraggable = true;
            if (isDefined(this.getDiv())) {
                this.getDiv().viewRef = this;
                this.getDiv().addEventListener('mousedown', mouseDown, false);
            }


        } else {
            this.isDraggable = false;
            if (isDefined(this.getDiv())) {
                this.getDiv().removeEventListener("mousedown", mouseDown);
            }

        }
    }




/*
    childIsGrowing(childNode: View, grow: Size, initiator: any) {
        if (this.parentView !== undefined) {
            if (this.parentView !== undefined) {
                if (this.parentView.childIsGrowing !== undefined) {
                    this.parentView.childIsGrowing(this, grow, initiator);
                }
            }
        }
    }
*/


    scrollToTop() {
        this.getDiv().scrollTop =  0;
    }

    scrollToSubView(subView: View) {
        this.getDiv().scrollTop = subView.bounds.y;
    }

    scrollToBottom() {
        this.getDiv().scrollTop = this.getDiv().scrollHeight;
    }



    isElementChild(el: HTMLElement) {
        function _isElementChild(baseElem: any, el: any) {
            if (baseElem === el) {
                return true;
            }
            for (let i = 0; i < baseElem.children.length; i ++) {
                let ret = _isElementChild(baseElem.children[i], el);
                if (ret) {
                    return true;
                }
            }
            return false;
        }
        return _isElementChild(this.getDiv(), el);
    }







}






if (typeof window !== "undefined") {
    window.addEventListener('mouseup', mouseUp, false);
}

function mouseUp(e: MouseEvent) {

    if (Application.instance.keyValues["currentViewMoving"] !== undefined) {

        if (Application.instance.keyValues["currentViewMoving"].dragDelegate !== undefined) {
            if (Application.instance.keyValues["currentViewMoving"].dragDelegate["viewWasDragged"] !== undefined) {
                //console.log(`${(Application.instance.keyValues["currentViewMoving"] as View).id}.viewWasDragged`);
                Application.instance.keyValues["currentViewMoving"].dragDelegate["viewWasDragged"](Application.instance.keyValues["currentViewMoving"], {
                    event: e,
                    x: (e.clientX - Application.instance.keyValues["x_pos"]),
                    y: (e.clientY - Application.instance.keyValues["y_pos"])
                });
            }
        }

        Application.instance.keyValues["currentViewMoving"] = undefined;
        window.removeEventListener('mousemove', divMove, true);
    }
}



function mouseDown(e: MouseEvent) {
    // @ts-ignore
    const div = this as any;
    e.preventDefault();
    e.stopPropagation();


    Application.instance.keyValues["x_off_start"] = e.clientX;
    Application.instance.keyValues["y_off_start"] = e.clientY;

    Application.instance.keyValues["currentViewMoving"] = div.viewRef;
    Application.instance.keyValues["x_pos"] = e.clientX - div.offsetLeft;
    Application.instance.keyValues["y_pos"] = e.clientY - div.offsetTop;

    Application.instance.keyValues["mouseDownTime"] = +new Date();
    Application.instance.keyValues["lastMouseDownTime"] = Application.instance.keyValues["mouseDownTime"];

    if (div.viewRef.isDraggable) {
        if (div.viewRef.dragDelegate !== undefined) {
            if (div.viewRef.dragDelegate.viewWillBeDragged !== undefined) {
                let result = div.viewRef.dragDelegate["viewWillBeDragged"](Application.instance.keyValues["currentViewMoving"].parentView, {event: e});
                if (result === false) {
                    return;
                }
            }
        }
    }

    window.addEventListener('mousemove', divMove, true);
}

function divMove(e: MouseEvent) {
    const div = Application.instance.keyValues["currentViewMoving"].getDiv();
    div.style.position = 'absolute';
    div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) + 'px';
    div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) + 'px';


    //calculate mouse velocity
    let mouseVelocity = {
        linear: 0,
        x: 0,
        y: 0
    };


    if (Application.instance.keyValues["x_off_start"] === 0) {
        Application.instance.keyValues["x_off_start"] = e.clientX;
    }
    if (Application.instance.keyValues["y_off_start"] === 0) {
        Application.instance.keyValues["y_off_start"] = e.clientY;
    }

    mouseVelocity.x = Math.round( ((Application.instance.keyValues["x_off_start"] - e.clientX) / (+new Date() - Application.instance.keyValues["lastMouseDownTime"])) * 1000);
    mouseVelocity.y = Math.round( ((Application.instance.keyValues["y_off_start"] - e.clientY) / (+new Date() - Application.instance.keyValues["lastMouseDownTime"])) * 1000);
    mouseVelocity.linear = Math.round( Math.sqrt( (mouseVelocity.x * mouseVelocity.x) + (mouseVelocity.y * mouseVelocity.y)));

    // console.log(`Mouse velocity ${mouseVelocity.x}, ${mouseVelocity.y}`);

    Application.instance.keyValues["lastMouseDownTime"] = + new Date();

    let offsetX = e.clientX - Application.instance.keyValues["x_off_start"];
    let offsetY = e.clientY - Application.instance.keyValues["y_off_start"];
    Application.instance.keyValues["x_off_start"] = e.clientX;
    Application.instance.keyValues["y_off_start"] = e.clientY;

    if (Application.instance.keyValues["currentViewMoving"].corner === undefined) {
        Application.instance.keyValues["currentViewMoving"].bounds = Application.instance.keyValues["currentViewMoving"].getBounds("");
        if (Application.instance.keyValues["currentViewMoving"].temp !== undefined) {

            Application.instance.keyValues["currentViewMoving"].temp.selectedLayerOverlay._div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) + "px";
            Application.instance.keyValues["currentViewMoving"].temp.selectedLayerOverlay._div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) + 'px';

            if (Application.instance.keyValues["currentViewMoving"].resizeWidth === true) {
                Application.instance.keyValues["currentViewMoving"].temp.middleLeftCorner._div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount / 2) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.middleLeftCorner._div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.middleRightCorner._div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount / 2) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.middleRightCorner._div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount - 4) + 'px';
            }
            if (Application.instance.keyValues["currentViewMoving"].resizeHeight === true) {
                Application.instance.keyValues["currentViewMoving"].temp.topMiddleCorner._div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.topMiddleCorner._div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount / 2) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.bottomMiddleCorner._div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.bottomMiddleCorner._div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) + (NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount / 2) - 4 + 'px';
            }

            if ((Application.instance.keyValues["currentViewMoving"].resizeWidth === true) && (Application.instance.keyValues["currentViewMoving"].resizeHeight === true)) {
                Application.instance.keyValues["currentViewMoving"].temp.topLeftCorner._div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.topLeftCorner._div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.topRightCorner._div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.topRightCorner._div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) + NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.bottomLeftCorner._div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) + NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.bottomLeftCorner._div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.bottomRightCorner._div.style.top = (e.clientY - Application.instance.keyValues["y_pos"]) + NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.height).amount - 4 + 'px';
                Application.instance.keyValues["currentViewMoving"].temp.bottomRightCorner._div.style.left = (e.clientX - Application.instance.keyValues["x_pos"]) + NUConvertToPixel(Application.instance.keyValues["currentViewMoving"].bounds.width).amount - 4 + 'px';
            }

        }
    } else {
        //recalculate the corners pos
        if (Application.instance.keyValues["currentViewMoving"].viewRef.temp !== undefined) {

            Application.instance.keyValues["currentViewMoving"].viewRef.temp.selectedLayerOverlay.doResizeFrameOnly();
            if (Application.instance.keyValues["currentViewMoving"].viewRef.resizeWidth === true) {
                dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "middleLeftCorner"], "doResize");
                dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "middleRightCorner"], "doResize");
            }
            if (Application.instance.keyValues["currentViewMoving"].viewRef.resizeHeight === true) {
                dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "topMiddleCorner"], "doResize");
                dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "bottomMiddleCorner"], "doResize");
            }
            if ((Application.instance.keyValues["currentViewMoving"].viewRef.resizeWidth === true) && (Application.instance.keyValues["currentViewMoving"].viewRef.resizeHeight === true)) {
                dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "topLeftCorner"], "doResize");
                dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "topRightCorner"], "doResize");
                dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "bottomLeftCorner"], "doResize");
                dispatch_msg(Application.instance.keyValues["currentViewMoving"].viewRef, ["temp", "bottomRightCorner"], "doResize");
            }

        }
    }
    let viewIsBeingDraggedParam : {
        event: Event,
        x: number,
        y: number,
        offsetX: number,
        offsetY: number,
        mouseVelocity: {
            linear: number,
            x: number,
            y: number
        }
    } = {
        event: e,
        x: (e.clientX - Application.instance.keyValues["x_pos"]),
        y: (e.clientY - Application.instance.keyValues["y_pos"]),
        offsetX: -offsetX,
        offsetY: -offsetY,
        mouseVelocity: mouseVelocity
    }
    Application.instance.keyValues["currentViewMoving"].isDragging = true;

    if (Application.instance.keyValues["currentViewMoving"].dragDelegate !== undefined) {
        if (Application.instance.keyValues["currentViewMoving"].dragDelegate["viewIsBeingDragged"] !== undefined) {
            Application.instance.keyValues["currentViewMoving"].dragDelegate["viewIsBeingDragged"](Application.instance.keyValues["currentViewMoving"], viewIsBeingDraggedParam);
        }
    }



}



export function fillParentBounds (parentBounds: Bounds, paddingInPixels: number = 0): Bounds {
    return new Bounds(
        paddingInPixels,
        paddingInPixels,
        parentBounds.width.amount! - (paddingInPixels * 2),
        parentBounds.height.amount! - (paddingInPixels * 2)
    );
}


export function centerParentBounds(parentBounds: Bounds, width: number, height: number) {
    let x = 0;
    let y = 0;
    if (parentBounds.width.amount! / 2 - width / 2 > 0) {
        x = parentBounds.width.amount! / 2 - width / 2;
    } else {
        x = 0;
    }
    if (parentBounds.height.amount! / 2 - height / 2 > 0) {
        y = parentBounds.height.amount! / 2 - height / 2;
    } else {
        y = parentBounds.height.amount! - height;
    }
    return new Bounds(
        x,
        y,
        width,
        height
    );
}


