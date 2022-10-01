import {centerParentBounds, fillParentBounds, View} from "../View/View";
import {TextFieldFormatter} from "./TextFieldFormatter";
import {ViewStyle} from "../View/ViewStyle";
import {NUConvertToPixel, px} from "../NumberWithUnit/NumberWithUnit";
import {Fill} from "../View/Fill";
import {Border} from "../View/Border";
import {DataSource} from "../Datasource/DS";
import {Application, SessionEvent} from "../Application/Application";
import {Bounds} from "../Bounds/Bounds";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {CollectionView} from "../Containers/CollectionView";
import {ImageView} from "./ImageView";
import {Label} from "./Label";
import {isDefined} from "../Utils/isDefined";
import {DataRequest} from "../Datasource/DataRequest";
import {renderTextStyleProps} from "../TextStyle/renderTextStyleProps";
import {BorderSide} from "../View/BorderSide";
import {DSJSONAdaptor} from "../Datasource/DSJSONAdaptor";


declare class TableViewPager extends View {};

export class TextField extends View {


    leftView?: View;
    rightView?: View;
    container?: View;
    pillContainer?: View;
    textContainer?: View;
    textbox? : HTMLInputElement | HTMLTextAreaElement;
    pillBadges?: any;

    isPassword : boolean = false;
    isNumeric: boolean = false;
    isTextArea: boolean = false;
    value : string = "";
    placeholderValue: string = "";
    timeoutHandle: any = undefined;
    flatStyle: boolean = false;
    delegate: any = undefined;
    isSearch: boolean = false;
    autoCompletePane?: View;
    shouldDisplayAutoComplete: boolean = false;
    shouldDisplayAddOptionOnAutoComplete: boolean =  false;
    shouldHideAutoCompleteOnFocusLoss: boolean = true;
    shouldDisplayPagerOnAutoComplete: boolean = false;
    formatter?: TextFieldFormatter;
    isError: boolean = false;
    numericMin: number = 0;
    numericMax: number = 100;

    delayTrigger: number = 300;


    //fontColor : string = 'Black';
    //textAlignment : string = 'left';
    //bold: boolean = false;
    //italic: boolean = false;
    //underline: boolean = false;
    //strike: boolean = false;
    //fontWeight : string = '300';
    //fillLineHeight: boolean = false;
    //kerning: string = 'auto';
    //textStyle?: any = undefined;
    //overflow: string = 'hidden';


    protected willDismissPaneTimeout?: number;

    get fontFamily(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.weight
    }
    set fontFamily(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.weight = value;
    }

    get fontSize(): number {
        let style: ViewStyle = this.getDefaultStyle();
        return NUConvertToPixel(style.textStyle.size).amount;
    }

    set fontSize(value: number) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.size = px(value);
    }

    get fontSizeUnit(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.size.unit;
    }
    set fontSizeUnit(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.size.unit = value;
    }

    get fontWeight(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.weightValue;
    }

    set fontWeight(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.weightValue = value;
    }

    get fontColor(): string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.color.value;
    }
    set fontColor(value: string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.color = new Fill(true, "color", "normal", value);
    }


    get fillLineHeight(): boolean {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.fillLineHeight;
    }
    set fillLineHeight(value: boolean) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.fillLineHeight = value;
    }

    get textAlignment(): "left" | "right" | "center" | "justify" | string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.textAlignment;
    }

    set textAlignment(value: "left" | "right" | "center" | "justify" | string) {
        let style: ViewStyle = this.getDefaultStyle();
        // @ts-ignore
        style.textStyle.textAlignment = value;
    }

    get wordBreak(): 'normal' | 'break-all' | 'keep-all' | 'break-word' | string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.wordBreak;
    }

    set wordBreak(value: 'normal' | 'break-all' | 'keep-all' | 'break-word' | string) {
        let style: ViewStyle = this.getDefaultStyle();
        //@ts-ignore
        style.textStyle.wordBreak = value;
    }


    get wordWrap(): 'normal' | 'break-word' | string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.wordWrap;
    }

    set wordWrap(value: 'normal' | 'break-word' | string) {
        let style: ViewStyle = this.getDefaultStyle();
        //@ts-ignore
        style.textStyle.wordWrap = value;
    }


    get whiteSpace() {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.whiteSpace;
    }

    set whiteSpace(value) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.whiteSpace = value;
    }

    get textOverflow(): 'clip' | 'ellipsis' | string {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.textOverflow;
    }

    set textOverflow(value: 'clip' | 'ellipsis' | string) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.textOverflow = value;
    }

    get underline(): boolean {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.decorations.understrike;
    }

    set underline(value: boolean) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.decorations.understrike = value;
    }

    get strike(): boolean {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.decorations.strike;
    }
    set strike(value: boolean) {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.decorations.strike = value;
    }

    get kerning(): "normal" | "auto" {
        let style: ViewStyle = this.getDefaultStyle();
        return style.textStyle.kerning;
    }

    set kerning(value: "normal" | "auto") {
        let style: ViewStyle = this.getDefaultStyle();
        style.textStyle.kerning;
    }


    constructor() {
        super();
        this.fills = [new Fill(true, "color", "normal", "rgba(38, 38, 38, 1.0)")];
        this.borders = [];
        this.borders = [new Border(true, 2, "solid", "rgba(180, 180, 180, 1.0", BorderSide.bottom)];
        this.fontColor = 'rgba(255,255,255,1.0)';
        this.getDefaultStyle().textStyle.color = new Fill(true, "color", "normal", 'rgba(255,255,255,1.0)');
        this.getDefaultStyle().textStyle.weight = "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif";
        this.getDefaultStyle().textStyle.size = px(12);

    }



    textViewAutoCompleteDataSource(textView: TextField): DataSource {
        "use strict";
        return new DataSource(new DSJSONAdaptor([]));
    }

    textViewAutoCompleteCell(textView: TextField, cell: View, index: number) {
        "use strict";

    }

    textViewAutoCompleteCellSize(textView: TextField, index: number):number[] {
        "use strict";
        return [this.getBounds("").width.amount, 65];
    }

    textViewAutoCompleteSelected(textView: TextField, index: number) {
        "use strict";

    }

    textViewAutoCompleteSize (textView: TextField):number[] {
        "use strict";
        return [this.getBounds("").width.amount, 100];
    }

    textViewAutoCompleteAddOptionCellSize (textView: TextField): number[] {
        "use strict";
        return [this.getBounds("").width.amount, 30];
    }

    textViewAutoCompleteAddOptionCellAdded (textView: TextField, cell: View) {
        "use strict";

    }

    textViewAutoCompleteWasDisplayed (textView: TextField) {
        "use strict";

    }


    setIsError (isError: boolean) {
        this.isError = isError;
        if (this.isError) {

        } else {

        }
        this.forceFocusLoss();
    }


    _showAutoComplete () {
        "use strict";
        if (this.autoCompletePane) {
            this.autoCompletePane!.detachItSelf();
            delete this.autoCompletePane;
        }



        this.autoCompletePane = new View();
        this.autoCompletePane.keyValues["target"] = this;
        this.autoCompletePane.keyValues["rootView"] = Application.instance.rootView;
        this.autoCompletePane.boundsForView = function (parentBounds: Bounds): Bounds {
            const domTarget = this.keyValues["target"].getDiv();
            const anchorBoundingRect = {
                x: domTarget.getBoundingClientRect().left,
                y: domTarget.getBoundingClientRect().top,
                width: domTarget.getBoundingClientRect().width,
                height: domTarget.getBoundingClientRect().height
            };
            const autoCompleteSize = (this.keyValues["target"].delegate === undefined) ? this.keyValues["target"].textViewAutoCompleteSize(this.keyValues["target"]) : this.keyValues["target"].delegate.textViewAutoCompleteSize(this.keyValues["target"]);

            return boundsWithPixels({
                x: anchorBoundingRect.x,
                y: anchorBoundingRect.y + anchorBoundingRect.height -1,
                width: autoCompleteSize[0],
                height: autoCompleteSize[1],
                unit: "px",
                position: "absolute"
            });
        };
        this.autoCompletePane.viewWasAttached =  function () {
            let lst = new CollectionView();
            lst.keyValues["textFieldRef"] = this.keyValues["target"];
            lst.boundsForView = function (parentBounds: Bounds): Bounds {
                if (this.keyValues["textFieldRef"].shouldDisplayPagerOnAutoComplete) {
                    return boundsWithPixels({
                        x: 0,
                        y: 0,
                        width: parentBounds.width.amount,
                        height: parentBounds.height.amount - 36,
                        unit: "px",
                        position: "absolute"
                    });
                }
                return fillParentBounds(parentBounds);
            };
            lst.delegate = this.keyValues["target"]! as TextField;
            if (this.keyValues["target"].shouldDisplayAddOptionOnAutoComplete) {
                lst.showAddOption = true;
                lst.addOptionOnTop = true;
            }
            lst.initView(this.id + ".lst");
            this.attach(lst);
            lst.getDiv().style.overflowY = 'auto';
            lst.viewController = this.keyValues["target"].viewController;
            this.keyValues["lst"] = lst;


            let pager = new TableViewPager();
            pager.boundsForView = function (parentBounds: Bounds): Bounds {
                return boundsWithPixels({
                    x: 2,
                    y: parentBounds.height.amount - 30 - 4,
                    width: parentBounds.width.amount - 4,
                    height: 30,
                    unit: "px",
                    position: "absolute"
                });
            };
            pager.initView(this.id + ".pager");
            this.attach(pager);
            pager.viewController = (this.keyValues["target"] as TextField).viewController;
            if (this.keyValues["target"].shouldDisplayPagerOnAutoComplete === false) {
                pager.setVisible(false);
            }
            this.keyValues["page"] = pager;

            let loading = new ImageView();
            loading.boundsForView = function (parentBounds: Bounds): Bounds {
                return centerParentBounds(parentBounds,28,28);
            };
            loading.imageURI = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNNDYwLjExNSAzNzMuODQ2bC02Ljk0MS00LjAwOGMtNS41NDYtMy4yMDItNy41NjQtMTAuMTc3LTQuNjYxLTE1Ljg4NiAzMi45NzEtNjQuODM4IDMxLjE2Ny0xNDIuNzMxLTUuNDE1LTIwNS45NTQtMzYuNTA0LTYzLjM1Ni0xMDMuMTE4LTEwMy44NzYtMTc1LjgtMTA3LjcwMUMyNjAuOTUyIDM5Ljk2MyAyNTYgMzQuNjc2IDI1NiAyOC4zMjF2LTguMDEyYzAtNi45MDQgNS44MDgtMTIuMzM3IDEyLjcwMy0xMS45ODIgODMuNTUyIDQuMzA2IDE2MC4xNTcgNTAuODYxIDIwMi4xMDYgMTIzLjY3IDQyLjA2OSA3Mi43MDMgNDQuMDgzIDE2Mi4zMjIgNi4wMzQgMjM2LjgzOC0zLjE0IDYuMTQ5LTEwLjc1IDguNDYyLTE2LjcyOCA1LjAxMXoiLz48L3N2Zz4=";
            loading.imageWidth = 28;
            loading.imageHeight = 28;
            loading.initView(this.id + ".loading");
            this.attach(loading);
            loading.setVisible(false);
            this.keyValues["loading"] = loading;

        };
        this.autoCompletePane.initView(this.id + ".autoComplete");
        this.autoCompletePane.keyValues["rootView"].attach(this.autoCompletePane);
        this.autoCompletePane.getDiv().style.zIndex = 99999;
        this.autoCompletePane.getDiv().style.backgroundColor = "white";
        if (this.isSearch) {
            this.autoCompletePane.getDiv().style.backgroundColor = "hsl(210,9%,96%)";
        }
        // rgb(50, 192, 247)
        // rgb(235,235,235)


        this.autoCompletePane.getDiv().tfRef = this;


        this.autoCompletePane.getDiv().addEventListener("mouseenter", function (e: MouseEvent) {
            e.stopPropagation();
            // @ts-ignore
            this.tfRef.onAutoCompleteFocusGained(e); }, false);
        this.autoCompletePane.getDiv().addEventListener("mouseleave", function (e: MouseEvent) {
            e.stopPropagation();
            // @ts-ignore
            this.tfRef.onAutoCompleteFocusLost(e); },  false);



    }


    collectionViewCellSize (collectionView: CollectionView, index: number) {
        if (this.delegate === undefined) {
            return this.textViewAutoCompleteCellSize(this, index);
        } else {
            return this.delegate.textViewAutoCompleteCellSize(this, index);
        }
    }
    collectionViewCellForGroupAdded (collectionView: CollectionView, groupCell: View, currentGroup: string) {
        let label = new Label();
        label.boundsForView = function (parentBounds) {
            return boundsWithPixels({
                x: 5,
                y: 0,
                width: parentBounds.width.amount - 10,
                height: parentBounds.height.amount,
                unit: "px",
                position: "absolute"
            });
        };
        label.fillLineHeight = true;
        label.fontColor = "black";
        label.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        label.fontWeight = '400';
        label.text = currentGroup;
        label.initView(groupCell.id + ".label");
        groupCell.attach(label);
        groupCell.keyValues["label"] = label;


    }
    collectionViewCellWasAttached (collectionView: CollectionView, cell: View, index: number) {
        "use strict";
        if (this.delegate === undefined) {
            this.textViewAutoCompleteCell(this, cell, index);
        } else {
            this.delegate.textViewAutoCompleteCell(this, cell, index);
        }
        cell.keyValues["cell_index"] = index;
        cell.setClickDelegate(this, "_onCollectionViewCellClicked");

    }

    _onCollectionViewCellClicked (sender: any) {
        "use strict";
        if (this.delegate === undefined) {
            this.textViewAutoCompleteSelected(this, sender.cell_index);
        } else {
            this.delegate.textViewAutoCompleteSelected(this, sender.cell_index);
        }
    }





    collectionViewAddOptionCellSize (collectionView: CollectionView) {
        "use strict";
        if (this.delegate === undefined) {
            return this.textViewAutoCompleteAddOptionCellSize(this);
        } else {
            return this.delegate.textViewAutoCompleteAddOptionCellSize(this);
        }
    }



    collectionViewAddOptionCellAdded (collectionView: CollectionView, cell: View) {
        "use strict";
        if (this.delegate === undefined) {
            this.textViewAutoCompleteAddOptionCellAdded(this, cell);
        } else {
            this.delegate.textViewAutoCompleteAddOptionCellAdded(this, cell);
        }
    }

    collectionViewAddOptionSelected (collectionView: CollectionView) {

        "use strict";

    }

    viewWillLoad  () {
        this.pillBadges = [];

        this.leftView = new View();
        this.rightView = new View();

        this.container = new View();
        this.pillContainer = new View();
        this.textContainer = new View();

    }

    viewWasAttached () {



        this.leftView!.boundsForView = function (parentBounds: Bounds): Bounds {
            let cell_width = 0;
            for (let i = 0; i < this.subViews.length; i++) {
                const bounds = this.subViews[i].getBounds("parentView");
                if (bounds !== undefined) {
                    cell_width = cell_width + bounds.width.amount!;
                }
            }
            return boundsWithPixels({
                x: 0,
                y: 0,
                width: cell_width,
                height: parentBounds.height.amount,
                unit: "px",
                position: "absolute"
            });
        };
        this.leftView!.overflow = 'hidden';
        this.leftView!.initView(this.id + '.leftView');
        this.attach(this.leftView!);

        this.rightView!.boundsForView = function (parentBounds: Bounds): Bounds {
            let cell_width = 0;
            for (let i = 0; i < this.subViews.length; i++) {
                const bounds = this.subViews[i].getBounds("parentView");
                if (bounds !== undefined) {
                    cell_width = cell_width + bounds.width.amount!;
                }
            }
            return boundsWithPixels({
                x: parentBounds.width.amount - cell_width,
                y: 0,
                width: cell_width,
                height: parentBounds.height.amount,
                unit: "px",
                position: "absolute"
            });
        };
        this.rightView!.overflow = 'hidden';
        this.rightView!.initView(this.id + '.rightView');
        this.attach(this.rightView!);

        this.container!.boundsForView = function (parentBounds: Bounds): Bounds {
            const leftViewBounds = (this.parentView! as TextField).leftView!.getBounds("");
            const rightViewBounds = (this.parentView! as TextField).rightView!.getBounds("");
            let x = 0;
            let w = parentBounds.width.amount;

            //if (leftViewBounds !== undefined) {
            //    console.log("leftViewBounds: " + leftViewBounds.x + "," + leftViewBounds.y + "," + leftViewBounds.width + "," + leftViewBounds.height);
            //}

            if (leftViewBounds) {
                x = leftViewBounds.width.amount;
                w = parentBounds.width.amount - x;
            }
            if (rightViewBounds) {
                w = rightViewBounds.x.amount - x;
            }
            return boundsWithPixels({
                x: x,
                y: 0,
                width: w,
                height: parentBounds.height.amount,
                unit: "px",
                position: "absolute"
            });
        };
        this.container!.initView(this.id + ".container");
        this.attach(this.container!);

        this.pillContainer!.keyValues["tfRef"] = this;
        this.pillContainer!.boundsForView = function (parentBounds: Bounds): Bounds {
            let width = 0;
            for (let i = 0; i < this.keyValues["tfRef"].pillBadges.length; i++) {
                width = width + this.keyValues["tfRef"].pillBadges[i].getBoundingClientRect().width;
            }
            return boundsWithPixels({
                x: 0,
                y: 0,
                width: width,
                height: parentBounds.height.amount,
                unit: "px",
                position: "absolute"
            });
        };
        this.pillContainer!.initView(this.id + ".pillContainer");
        this.container!.attach(this.pillContainer!);

        this.textContainer!.keyValues["tfRef"] = this;
        this.textContainer!.boundsForView = function (parentBounds: Bounds): Bounds {
            const pillContainerBounds = this.keyValues["tfRef"].pillContainer.getBounds("");
            let x = 5;
            let w = parentBounds.width.amount - 5;
            if (pillContainerBounds !== undefined) {
                x = pillContainerBounds.width.amount + 5;
                w = parentBounds.width.amount - x - 5;
            }

            if ((this.keyValues["tfRef"] as TextField).textbox) {
                (this.keyValues["tfRef"] as TextField).textbox.style.left = "1px";
                (this.keyValues["tfRef"] as TextField).textbox.style.top = "1px"; //parentBounds.height + "px";
                (this.keyValues["tfRef"] as TextField).textbox.style.width = (w-2) + "px";
                (this.keyValues["tfRef"] as TextField).textbox!.style.height = (parentBounds.height.amount) + "px";

                if (!(this.keyValues["tfRef"] as TextField).isTextArea) {
                    (this.keyValues["tfRef"] as TextField).textbox!.style.lineHeight = parentBounds.height.amount + "px";
                }
            }


            return boundsWithPixels({
                x: x,
                y: 0,
                width: w,
                height: parentBounds.height.amount,
                unit: "px",
                position: "absolute"
            });
        };
        this.textContainer!.initView(this.id + ".textContainer");
        this.container!.attach(this.textContainer!);



        if (this.isTextArea ) {
            this.textbox = document.createElement("textarea");
            this.textContainer!.keyValues["textbox"] = this.textbox;

        } else {
            this.textbox = document.createElement("input");
            this.textContainer!.keyValues["textbox"] = this.textbox;
            if (!this.isPassword) {
                if (!this.isNumeric) {
                    this.textbox.setAttribute("type", "text");
                } else {
                    this.textbox.setAttribute("type", "number");
                    this.textbox.setAttribute("min", this.numericMin.toString());
                    this.textbox.setAttribute("max", this.numericMax.toString());
                }
            } else {
                this.textbox.setAttribute("type", "password");
            }
        }
        

        this.textbox.setAttribute("id", this.id + ".txt");
        this.textbox.style.border = '0px';
        this.textbox.style.position = 'absolute';
        this.textbox.style.outlineColor =  'transparent';
        this.textbox.style.backgroundColor = "transparent";
        this.textbox.style.outlineStyle =  'none';
        this.textbox.style.borderRadius = "0";
        this.textbox.style.webkitBorderRadius = "0";
        this.textbox.style.webkitAppearance = "none";
        this.textbox.style.boxSizing = "content-box";
        this.textContainer!.getDiv().append(this.textbox);
        (this.textbox as any).tfRef = this;

        this.textbox.addEventListener("input", function (e: KeyboardEvent) {
            e.stopPropagation();
            // @ts-ignore
            this.tfRef.onTextChange(e); }, false);
        this.textbox.addEventListener("propertychange", function (e: Event) {
            e.stopPropagation();
            // @ts-ignore
            this.tfRef.onTextChange(e); }, false);
        //this.textContainer.textbox.addEventListener("keydown", function (e) {console.log('key down :' + e.key);  this.tfRef.onTextChange(e); } false);

        this.textbox.addEventListener("keypress", function (e: KeyboardEvent) {
            e.stopPropagation();
            // @ts-ignore
            let div = this;
            // e = e || window.event;

            if (isDefined(div.tfRef.formatter)) {
                const result = div.tfRef._handleKeyPressWithFormatter(e);
                if (result.shouldDisableKey) {
                    e.preventDefault();
                    if (result.shouldFireActionDelegate) {
                        div.tfRef.onTextChange();
                    }
                    return false;
                }
                if (result.shouldFireActionDelegate) {
                    div.tfRef.onTextChange();
                }
            } else {
                div.tfRef.onTextChange();
            }
            return true;
        });
        this.textbox.addEventListener("paste", function (e: KeyboardEvent) {
            e.stopPropagation();
            // @ts-ignore
            this.tfRef.onTextPaste(e);
            },  false);
        this.getDiv().tfRef = this;
        this.getDiv().addEventListener("mouseenter", function (e: MouseEvent) {
            // @ts-ignore
            this.tfRef.onFocusGained(e); }, false);
        this.getDiv().addEventListener("mouseleave", function (e: MouseEvent) {
            // @ts-ignore
            this.tfRef.onFocusLost(e); }, false);

        //this.textContainer.textbox.addEventListener("focus", function (e) { this.tfRef.onFocusGained(e); } false);
        //this.textContainer.textbox.addEventListener("blur", function (e) { this.tfRef.onFocusLost(e); } false);


        this.doResize();
    }


    setStyle (styleName: string, value: string) {
        "use strict";
        if (isDefined(this.textbox)) {
            this.textbox.style[styleName] = value;
        }
    }

    setAttribute (attr: string, value: any) {
        "use strict";
        if (isDefined(this.textbox)) {
            this.textbox.setAttribute(attr, value);
        }
    }



    textWasChanged  (newValue: string) { }
    onTimeout () {
        clearTimeout(this.timeoutHandle);
        this.value = this.textbox.value;
        this.textWasChanged(this.value);

        const event_param = {
            viewController_id: (this.viewController) ? this.viewController.id : "",
            textField_id: this.id
        };
        Application.instance.session_event(SessionEvent.kEvent_User,'TextField.Input', event_param);

        if (this.shouldDisplayAutoComplete) {
            let ds = undefined;
            if (this.delegate === undefined) {
                ds = this.textViewAutoCompleteDataSource(this);
                ds.reindex();
                this.autoCompletePane!.keyValues["lst"].reloadData();
            } else {
                ds = this.delegate.textViewAutoCompleteDataSource(this);
                this.delegate.search = this.value;
                if (this.delegate.dataSourcePayloadForRequest !== undefined) {
                    this.autoCompletePane!.keyValues["lst"].setVisible(false);
                    this.autoCompletePane!.keyValues["pager"].setVisible(false);
                    this.autoCompletePane!.keyValues["loading"].setVisible(true);
                    ds.firstPage();
                }
            }
        }


        if (this.actionDelegate && this.actionDelegateEventName) {
            this.actionDelegate[this.actionDelegateEventName](this,this.value);
        }
        if (isDefined(this.actionArrowFunction)) {
            this.actionArrowFunction(this, this.value);
        }
    }
    onTextPaste (e: Event) {
        "use strict";

        this.value = this.textbox.value;

        if (this.timeoutHandle !== undefined) {
            clearTimeout(this.timeoutHandle);
        }
        const ptr = this;
        this.timeoutHandle = setTimeout(function () { ptr.onTimeout(); }, this.delayTrigger);
    }
    onTextChange  (e: Event) {

        this.value = this.textbox.value;
        if (this.timeoutHandle !== undefined) {
            clearTimeout(this.timeoutHandle);
        }
        const ptr = this;
        this.timeoutHandle = setTimeout(function () { ptr.onTimeout(); }, this.delayTrigger);
        //this.textWasChanged(this.value);
    }

    _autoCompleteRefresh () {
        "use strict";
        // refresh
        this.autoCompletePane!.keyValues["lst"].dataSource.reindex();
        this.autoCompletePane!.keyValues["lst"].reloadData();
    }

    showAutoComplete () {
        "use strict";
        if (this.autoCompletePane === undefined) {

            this._showAutoComplete();
            let ds = undefined;
            if (this.delegate === undefined) {
                ds = this.textViewAutoCompleteDataSource(this);
            } else {
                this.autoCompletePane!.keyValues["lst"].setVisible(false);
                this.autoCompletePane!.keyValues["pager"].setVisible(false);
                this.autoCompletePane!.keyValues["loading"].setVisible(true);
                // add the spin keyframes on the main css
                (document.styleSheets[0] as any).insertRule('@keyframes mjsSpin { from { transform: rotateZ(0deg);   } to   { transform: rotateZ(360deg); } }');
                this.autoCompletePane!.keyValues["loading"].getDiv().style.animation = 'mjsSpin 1s infinite steps(8)';
                this.delegate.keyValues["textFieldRef"] = this;
                this.delegate.value = this.value;
                this.delegate.dataSourceUpdatedViews = function (ds: DataSource,request: DataRequest) {
                    this.keyValues["textFieldRef"].autoCompletePane.keyValues["lst"].setVisible(true);
                    this.keyValues["textFieldRef"].autoCompletePane.keyValues["pager"].setVisible(true);
                    this.keyValues["textFieldRef"].autoCompletePane.keyValues["lst"].doResizeFrameOnly();
                    this.keyValues["textFieldRef"].autoCompletePane.keyValues["pager"].doResizeFrameOnly();
                };
                ds = this.delegate.textViewAutoCompleteDataSource(this);
            }
            if (ds.delegate) {
                ds.clearBinds();
                this.autoCompletePane!.keyValues["lst"].bindDataSource(ds);
                this.autoCompletePane!.keyValues["pager"].bindDataSource(ds);
                ds.firstPage();
            } else {
                this.autoCompletePane!.keyValues["lst"].dataSource = ds;
                this.autoCompletePane!.keyValues["lst"].reloadData();
            }
        } else {
            this._autoCompleteRefresh();
        }
    }

    focus () {
        if ((this.textContainer) && (this.textContainer.keyValues["textbox"])) {
            this.textContainer.keyValues["textbox"].focus();
        }
    }


    onFocusGained () {
        (this as View).setPropertyValue("view.focused", true);
        this.processStyleAndRender("", []);

        if (this.shouldDisplayAutoComplete) {
            if (!this.autoCompletePane) {
                this._showAutoComplete();


                let ds = undefined;
                if (this.delegate === undefined) {
                    ds = this.textViewAutoCompleteDataSource(this);
                } else {
                    this.autoCompletePane!.keyValues["lst"].setVisible(false);
                    this.autoCompletePane!.keyValues["pager"].setVisible(false);
                    this.autoCompletePane!.keyValues["loading"].setVisible(true);
                    // add the spin keyframes on the main css
                    (document.styleSheets[0] as any).insertRule('@keyframes mjsSpin { from { transform: rotateZ(0deg);   } to   { transform: rotateZ(360deg); } }');
                    this.autoCompletePane!.keyValues["loading"].getDiv().style.animation = 'mjsSpin 1s infinite steps(8)';
                    this.delegate.keyValues["textFieldRef"] = this;
                    this.delegate.value = this.value;
                    this.delegate.dataSourceUpdatedViews = function (ds: DataSource,request: DataRequest) {
                        this.keyValues["textFieldRef"].autoCompletePane.keyValues["lst"].setVisible(true);
                        this.keyValues["textFieldRef"].autoCompletePane.keyValues["pager"].setVisible(true);
                        this.keyValues["textFieldRef"].autoCompletePane.keyValues["lst"].doResizeFrameOnly();
                        this.keyValues["textFieldRef"].autoCompletePane.keyValues["pager"].doResizeFrameOnly();
                        this.keyValues["textFieldRef"].autoCompletePane.keyValues["loading"].setVisible(false);
                    };
                    ds = this.delegate.textViewAutoCompleteDataSource(this);
                }
                if (ds.delegate) {
                    ds.clearBinds();
                    this.autoCompletePane!.keyValues["lst"].bindDataSource(ds);
                    this.autoCompletePane!.keyValues["pager"].bindDataSource(ds);
                    ds.firstPage();
                } else {
                    this.autoCompletePane!.keyValues["lst"].dataSource = ds;
                    this.autoCompletePane!.keyValues["lst"].setVisible(true);
                    this.autoCompletePane!.keyValues["loading"].setVisible(false);
                    this.autoCompletePane!.keyValues["lst"].reloadData();
                }

                if (this.delegate !== undefined) {
                    if (this.delegate.textViewAutoCompleteWasDisplayed !== undefined) {
                        this.delegate.textViewAutoCompleteWasDisplayed(this);
                    }
                }

            } else {

                if (this.shouldHideAutoCompleteOnFocusLoss) {
                    clearTimeout(this.willDismissPaneTimeout);
                }

            }
        }
    }

    forceFocusLoss () {

        (this as View).setPropertyValue("view.focused", false);
        this.processStyleAndRender("", []);

        if (this.autoCompletePane) {

            const ptr = this;
            setTimeout(function () {
                if (ptr.autoCompletePane) {
                    ptr.autoCompletePane.detachItSelf();
                    delete ptr.autoCompletePane;


                }
            }, 300);


        } else {

        }
    }


    onAutoCompleteFocusGained (focusEvent: FocusEvent) {
        "use strict";
        if (this.shouldHideAutoCompleteOnFocusLoss) {
            clearTimeout(this.willDismissPaneTimeout);
        }




    }

    onAutoCompleteFocusLost (focusEvent: FocusEvent) {
        "use strict";

        if (this.shouldHideAutoCompleteOnFocusLoss) {
            const ptr = this;
            this.willDismissPaneTimeout = <any>setTimeout(function () {
                if (ptr.autoCompletePane) {
                    ptr.autoCompletePane.detachItSelf();
                    delete ptr.autoCompletePane;

                }
            }, 300);
        }


    }


    onFocusLost (focusEvent: FocusEvent) {
        if (this.autoCompletePane !== undefined) {

            // check if the new target for focus is a child of the autoCompletePane
            const target = focusEvent.relatedTarget;
            if (target !== undefined) {
                let checkChildrenForFocus = function (baseElement: any, target: any) {

                    if (baseElement === target) {
                        return true;
                    }
                    for (let i = 0; i < baseElement.children.length; i++) {
                        const ret = checkChildrenForFocus(baseElement.children[i], target);
                        if (ret === true) {
                            return true;
                        }
                    }
                    return false;
                }

            }


            if (this.shouldHideAutoCompleteOnFocusLoss) {
                const ptr = this;
                this.willDismissPaneTimeout = <any>setTimeout(function () {
                    if (ptr.autoCompletePane) {
                        ptr.autoCompletePane.detachItSelf();
                        delete ptr.autoCompletePane;

                    }
                }, 300);
            }

        } else {
            if (this.flatStyle === true) {

            } else {

            }
        }

    }

    hideAutoComplete () {
        "use strict";
        if (this.autoCompletePane) {
            const ptr = this;
            setTimeout(function ()
            {
                if (ptr.autoCompletePane) {
                    ptr.autoCompletePane.detachItSelf();
                    delete ptr.autoCompletePane;
                }
            }, 300);

        }
    }

    // formatter
    _handleKeyPressWithFormatter (e: KeyboardEvent) {
        "use strict";
        let i = 0;
        const lastValue = this.textbox.value;

        const length = lastValue.length;

        // matches full mask
        for (i = 0; i < this.formatter!.masks.length; i++) {
            // @ts-ignore
            if (lastValue.match(new RegExp(this.formatter!.masks[i].mask)) === true) {
                return {
                    shouldFireActionDelegate: true,
                    shouldDisableKey: true
                };
            }

            if (length < this.formatter!.masks[i].steps.length) {
                if ((lastValue + e.key).match(this.formatter!.masks[i].steps[length].mask)) {
                    if (this.formatter!.masks[i].steps[length].match !== undefined) {
                        if (this.formatter!.masks[i].steps[length].match.append !== undefined) {
                            this.textbox.value = lastValue + e.key + this.formatter!.masks[i].steps[length].match.append;
                            return {
                                shouldFireActionDelegate: false,
                                shouldDisableKey: true
                            }
                        }
                    }
                    return {
                        shouldFireActionDelegate: false,
                        shouldDisableKey: false
                    }
                }
            } else {
                if ((lastValue + e.key).match(this.formatter!.masks[i].mask)) {
                    return {
                        shouldFireActionDelegate: true,
                        shouldDisableKey: true
                    };
                }
            }

        }





        return {
            shouldFireActionDelegate: false,
            shouldDisableKey: true
        };

    }


    setEnabled (boolValue: boolean) {
        if (isDefined(this.textbox)) {
            this.textbox.disabled = !boolValue;
        }

    }



    setText (value: string) {
        this.value = value;
        if (isDefined(this.textbox)) {
            this.textbox.value = value;
            this.textWasChanged(this.value);
        }
    }
    setTextValue (value: string) {
        "use strict";
        this.value = value;
        if (isDefined(this.textbox)) {
            this.textbox.value = value;
        }
    }

    setPlaceholder (value: string) {
        if (isDefined(this.textbox)) {
            this.textbox.placeholder = value;
        }
    }


    setLeftView  (lv: View) {
        "use strict";
        this.leftView!.attach(lv);
        this.doResize();
        if (this.leftView) {
            this.leftView!.dontCacheStyle = true;
            this.leftView!.processStyleAndRender("", []);
        }
        if (this.rightView) {
            this.rightView!.dontCacheStyle = true;
            this.rightView!.processStyleAndRender("", []);
        }
        this.container.dontCacheStyle = true;
        this.container.processStyleAndRender("", []);
    }
    setRightView  (rv: View) {
        "use strict";
        this.rightView!.attach(rv);
        this.doResize();
        if (this.leftView) {
            this.leftView!.dontCacheStyle = true;
            this.leftView!.processStyleAndRender("", []);
        }
        if (this.rightView) {
            this.rightView!.dontCacheStyle = true;
            this.rightView!.processStyleAndRender("", []);
        }
        this.container.dontCacheStyle = true;
        this.container.processStyleAndRender("", []);
    }


    addPillBadge (id: string,title: string) {

        const pillBadge = document.createElement("span");
        pillBadge.id = id;
        pillBadge.style.wordBreak = "keep-all";
        pillBadge.innerHTML = "&nbsp;&nbsp;<nobr>" + title + "</nobr>&nbsp;&nbsp;";
        pillBadge.style.backgroundColor = "rgb(99,108,114)";
        pillBadge.style.color = "white";
        pillBadge.style.border = '1px solid rgb(99,108,114);';
        pillBadge.style.borderRadius = "10px";
        pillBadge.style.textAlign = "center";
        pillBadge.style.whiteSpace = "nowrap";
        pillBadge.style.display = "inline-block";
        pillBadge.style.verticalAlign = "middle";
        // pillBadge.style.marginRight = "5px";


        this.pillBadges.push(pillBadge);
        this.pillContainer!.getDiv().append(pillBadge);
        this.doResize();

        pillBadge.style.marginTop = (this.container!.getBounds("").height.amount / 2 - pillBadge.getBoundingClientRect().height / 2) + "px";



    }

    removeAllPillBadges () {
        while (this.pillBadges.length > 0) {
            this.removePillBadge(this.pillBadges[this.pillBadges.length-1].id);
        }
    }

    removePillBadge (id: string) {
        let idx = -1;
        for (let i = 0; i < this.pillBadges.length; i++) {
            if (this.pillBadges[i].id === id) {
                idx = i;
            }
        }
        if (idx>-1) {
            this.pillContainer!.getDiv().removeChild(this.pillBadges[idx]);
        }
        this.pillBadges[idx] = undefined;
        this.pillBadges.splice(idx,1);
        this.doResize();

    }

    render(parentBounds?: Bounds, style?: ViewStyle) {

        super.render(parentBounds, style);

        let bounds = this.getBounds("");




        if (isDefined(this.textContainer) && isDefined(this.textbox)) {
            this.getDiv().style.overflow = 'hidden';
            this.textbox.placeholder = this.placeholderValue;
            this.textbox.value = this.value;
            this.textbox.style.position = 'absolute';
            this.textbox.style.width = (bounds.width.amount -4) + bounds.width.unit;
            this.textbox.style.height = (bounds.height.amount) + bounds.height.unit;
            //this.textContainer.textbox.style.lineHeight = (this.fontSize - 2) + 'px';
            //@ts-ignore
            this.textbox.style.kerning = this.kerning;

            renderTextStyleProps(this.textbox, this.getDefaultStyle().textStyle);

            this.textbox.onclick = function (e) {
                e.stopPropagation();
            }


        }
    }

    refresh () {
        "use strict";

    }




}