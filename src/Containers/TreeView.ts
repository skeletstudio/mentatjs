
// MentatJS.TreeView component
/* usage

var treeView = new MentatJS.TreeView();
treeView.boundsForView = function (parentBounds) { return MentatJS.fillParentBounds(parentBounds); };
treeView.dataArray = [ { id: "1", text: "Root Leaf", children: [ { id: "3", text: "Leaf3", children: [] }], { id: "2", text: "Leaf2", children: [] } ] } ]
treeView.initView("treeView");
this.view.attach(treeView);

*/

import {TreeViewDelegate} from "./TreeViewDelegate";
import {fillParentBounds, View} from "../View/View";
import {SelectionMode} from "./SelectionMode";
import {TreeLeaf} from "./TreeLeaf";
import {Color} from "../Color/Color";
import {Fill} from "../View/Fill";
import {PropertyTextStyle} from "../TextStyle/PropertyTextStyle";
import {setProps} from "../baseClass";
import {Bounds} from "../Bounds/Bounds";
import {NUConvertToPixel, NumberWithUnit, px} from "../NumberWithUnit/NumberWithUnit";
import { Label } from "../Components/Label";
import {Logging} from "../Utils/logging";
import {ViewStyle} from "../View/ViewStyle";
import {isDefined} from "../Utils/isDefined";
import {Border} from "../View/Border";
import {BorderRadius} from "../View/BorderRadius";
import {boundsWithPixels} from "../Bounds/boundsWithPixels";
import {ImageView} from "../Components/ImageView";
import {Base64} from "../Utils/base64";
import {assert} from "../Utils/assert";
import {generateV4UUID} from "../Utils/generateV4UUID";

const resource_caretdown = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 320 512\"><path fill=\"currentColor\" d=\"M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z\"></path></svg>";
const resource_caretright = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 192 512\"><path fill=\"currentColor\" d=\"M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z\"></path></svg>";



export class TreeView extends View implements TreeViewDelegate {
    // object which will receive treeView* events
    delegate?: TreeViewDelegate;
    // property expects an Array of objects.
    dataArray: any[] = [];
    // property to specify if the treeview accepts single, multi or no selection
    selectionMode : SelectionMode = SelectionMode.singleSelection;
    // property to specify if leaf can be reordered
    allowReordering: boolean = false;
    // property to specify if leaf at the root level should use the full width of the treeView regardless it it has sub leaves or not.
    depthZeroIsFullWidth: boolean = false;
    // if set to true, a contextmenu event listener will be added on each leaf
    // on contextmenu event, treeViewContextMenuDataSource will be called on the delegate.
    // see MentatJS.ContextMenu


    hoverRows: boolean = false;

    expandedLeaves: string[] = [];

    // internal object storing leaf states
    leaves: TreeLeaf[] = [];
    // internal ref to the scroll containing the leaf cells
    scrollView: View = new View();

    // internal array containing cells allowing drop events
    allDropTargets: View[] = [];

    // On reloadData() or when the treeview is first attached, we'll go through each object and its children to create the view
    // treeViewIdForObject should return the object unique id
    // treeViewChildrenForObject should return the path to the array of children nodes for each object
    // treeViewCellSizeForLeaf should return the dimensions of the cell for the current leaf in this format [width,height]
    // treeViewLeafWasAttached is your cue to attach your own cell

    bEnableContextMenu: boolean = false;

    selectedRowColor: Color = new Color("color", "rgba(24, 144, 255, 0.1)");





    enableContextMenu(bEnable: boolean, containerRef?: View) {
        this.bEnableContextMenu = bEnable;
    }


    constructor () {
        super();
        this.leaves = [];
        this.dataArray = [];
        this.allDropTargets = [];

        this.styles.push(
            {
                kind: "ViewStyle",
                id: "cell",
                cond: [],
                fills: []
            },
            {
                kind: "ViewStyle",
                id: "cell",
                cond: [{property: "view.hovered", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 0.1)")]
                // borders: [new Border(true, 2, "solid", "rgba(24, 144, 255, 1.0)")]
            },
            {
                kind: "ViewStyle",
                id: "cell",
                cond: [{property: "cell.isSelected", op: "equals", value: true}],
                fills: [new Fill(true, "color", "normal", "rgba(24, 144, 255, 1)")]
            },
            {
                kind: "ViewStyle",
                id: "expandCollapseIcon",
                textStyle: setProps(new PropertyTextStyle(), {
                    color: new Fill(true, "color", "normal", "rgba(50, 50, 50, 1.0)")
                } as PropertyTextStyle)
            }
        )

    }


    viewWasAttached() {
        // we create a scrollView to contain the leaves cells
        this.scrollView.boundsForView = function (parentBounds: Bounds): Bounds {
            return fillParentBounds(parentBounds);
        };
        this.scrollView.fills = [{active: false, type: "color", blendMode: 'normal', value: ""}];
        this.scrollView.initView(this.id + ".scrollView");
        this.attach(this.scrollView);
        this.scrollView.setScrollView(false, true);
    }

    // delegate method to specify the dimensions of the leaf cell.
    treeViewCellSizeForLeaf(treeView: TreeView, leafObject: any, index: number, depth: number): NumberWithUnit[] {
        return [treeView.bounds.width, px(44)];
    }

    // delegate method to customize the content of the leaf cell.
    treeViewLeafWasAttached(treeView: TreeView, leafObject: any, leafCell: View, index: number, depth: number) {
        let label = new Label();
        label.boundsForView = function (parentBounds: Bounds): Bounds {
            return fillParentBounds(parentBounds);
        };
        label.text = leafObject.object.text;
        label.fontFamily = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
        label.fontSize = 12;
        label.fillLineHeight = true;
        label.initView(leafCell.id + ".label");
        leafCell.attach(label);

    }

    // delegate method to specify the id field of your object
    treeViewIdForObject(treeView: TreeView, object: any): string {
        return object.id;
    }

    // delegate method to specify how to check for children leaves
    treeViewChildrenForObject(treeView: TreeView, object: any): any[] {
        return object.children;
    }

    // delegate method triggered when the user has selected one or more leaves.
    // get the leaves by calling treeView.GetSelectedLeaves();
    treeViewSelectionHasChanged(treeView: TreeView) {

    }

    // delegate method to specify if the cell should use the full width of the treeview regardless of the depth of the current leaf
    treeViewIsCellFullWidth(treeView: TreeView, leafObject: any, index: number, depth: number): boolean {
        return false;
    }


    // internal recursive function to find a leaf by its id
    protected _findLeafRecur(leaf: TreeLeaf, leafId: string): TreeLeaf | undefined {
        if (leaf.id === leafId) {
            return leaf;
        }
        for (let i = 0; i < leaf.children.length; i++) {
            let ret = this._findLeafRecur(leaf.children[i], leafId);
            if (ret) {
                return ret;
            }
        }
        return undefined
    }

    // method find a leaf by its id
    findLeaf(leafId: string): TreeLeaf | undefined {
        let ret = undefined;
        for (let i = 0; i < this.leaves.length; i++) {
            ret = this._findLeafRecur(this.leaves[i], leafId);
            if (ret) {
                return ret;
            }
        }
        return undefined;
    }

    protected _findLeafRecurWithParent(leaf: TreeLeaf, leafId: string, parentLeaf: TreeLeaf | undefined, index: number): {leaf: TreeLeaf, parentLeaf: TreeLeaf | undefined, index: number} | undefined {
        if (leaf.id === leafId) {
            return {
                leaf: leaf,
                parentLeaf: parentLeaf,
                index: index
            };
        }
        for (let i = 0; i < leaf.children.length; i += 1) {
            let ret = this._findLeafRecurWithParent(leaf.children[i], leafId, leaf, i);
            if (ret) {
                return ret;
            }
        }
        return undefined;
    }
    // { leaf, parentLeaf, index }
    findLeafWithParent(leafId: string): {leaf: TreeLeaf, parentLeaf: TreeLeaf | undefined, index: number} | undefined{
        let ret = undefined;
        for (let i = 0; i < this.leaves.length; i+=1) {
            ret = this._findLeafRecurWithParent(this.leaves[i], leafId, undefined, i);
            if (ret) {
                return ret;
            }
        }
        return undefined;
    }


    protected _findLeafRecurInfo(leaf: TreeLeaf, leafId: string, index: number, depth: number): {leaf: TreeLeaf, index: number, depth: number} | undefined {
        if (leaf.id === leafId) {
            return {
                leaf: leaf,
                index: index,
                depth: depth
            };
        }
        for (let i = 0; i < leaf.children.length; i += 1) {
            let ret = this._findLeafRecurInfo(leaf.children[i], leafId, i, depth + 1);
            if (ret) {
                return ret;
            }
        }
        return undefined;
    }

    findLeafInfo(leafId: string): {leaf: TreeLeaf, index: number, depth: number} | undefined {
        let ret = undefined;
        for (let i = 0; i < this.leaves.length; i += 1) {
            ret = this._findLeafRecurInfo(this.leaves[i], leafId, i, 0);
            if (ret) {
                return ret;
            }
        }
        return undefined;
    }

    // method disable drop targets
    protected clearDropTargets() {
        for (let i = 0; i < this.allDropTargets.length; i++) {
            this.allDropTargets[i].getDiv().ondragover = undefined;
            this.allDropTargets[i].getDiv().onmouseover = undefined;
            this.allDropTargets[i].getDiv().onmouseout = undefined;
        }

    }

    // method enable drop targets for a leaf
    protected enableDropTarget(forLeafId: string) {

        let leaf = this.findLeaf(forLeafId);
        if (leaf) {
            for (let i = 0; i < leaf.childrenDropTargets!.length; i++) {
                leaf.childrenDropTargets![i].getDiv().ondragover = function (ev: DragEvent) {
                    ev.preventDefault();
                };
                leaf.childrenDropTargets![i].getDiv().onmouseover = function (ev: DragEvent) {
                    this.style.backgroundColor = "red";
                };
                leaf.childrenDropTargets![i].getDiv().onmouseout = function (ev: DragEvent) {
                    this.style.backgroundColor = "";
                };
            }
        }
    }

    // internal event a leaf is being dragged to a new position
    protected viewDragStart(view: View, id: string) {
        if (Logging.enableLogging) {
            Logging.log("viewWillBeDragged");
        }
        for (let i = 0; i < this.allDropTargets.length; i++) {
            //this.allDropTargets[i].getDiv().style.backgroundColor = "red";
            this.allDropTargets[i].getDiv().addEventListener("dragover", function (ev: DragEvent) {
                if (Logging.enableLogging) {
                    Logging.log("can drop here");
                }
                // @ts-ignore
                (this as any).style.backgroundColor = "red";
                ev.preventDefault();
            }, false);
            this.allDropTargets[i].getDiv().addEventListener("dragleave", function (ev: DragEvent) {
                if (Logging.enableLogging) {
                    Logging.log("drag leave");
                }
                // @ts-ignore
                this.style.backgroundColor = "";
                ev.preventDefault();
            }, false);

        }
    }


    // internal event a leaf has been dragged to a new position
    protected viewWasDrop(view: View, options: any) {

        view.doResize();

        this.clearDropTargets();
        //window.alert("dragged");
    }



    protected traverseTree(fragment: any, currentLeaf: TreeLeaf, parentLeaf: TreeLeaf | undefined, index: number, depth: number, insertAfterDiv: any = undefined) {

        currentLeaf.treeViewRef = this;

        let cell = new View();


        let size = [this.bounds.width, 44];
        if (this.delegate && this.delegate.treeViewCellSizeForLeaf) {
            size = this.delegate!.treeViewCellSizeForLeaf!(this, currentLeaf, index, depth);
        } else {
            size = this.treeViewCellSizeForLeaf(this, currentLeaf, index, depth);
        }
        cell.keyValues["computed_size"] = size;

        cell.keyValues["leafRef"] = currentLeaf;
        cell.keyValues["tableRef"] = this;

        cell.boundsForView = function (parentBounds: Bounds): Bounds {
            return {
                kind: "Bounds",
                x: new NumberWithUnit(0, "auto"),
                y: new NumberWithUnit(0, "auto"),
                width: this.keyValues["computed_size"][0],
                height: this.keyValues["computed_size"][1],
                unit: 'px',
                rotation: new NumberWithUnit(0, "deg"),
                elevation: new NumberWithUnit(0, "auto")
            }
        };

        let cellStyles: ViewStyle[] = JSON.parse(JSON.stringify(this.getStylesForTargetId("cell")));
        cellStyles.forEach((style: ViewStyle) => {
            style.id = undefined;
        });

        cell.styles.push(...cellStyles);

        // console.log(`(tableView) cell ${currentLeaf.id} styles[${cell.styles.length}]`);


        cell.properties.push(
            {
                property_id: "cell.isSelected",
                group: "property",
                kind: "LayerProperty",
                id: "cell.isSelected",
                title: "cell.isSelected",
                type: "boolean",
                value: currentLeaf.isSelected
            }
        );




        // if the leaf is selected, we color the cell
        //if (currentLeaf.isSelected) {
//            cell.fills = [{active: true, type: 'color', blendMode: 'normal', value: this.selectedRowColor.value}];
        //} else {
        //    cell.fills = [];
        //}

        cell.initView(fragment.id + ".cell[" + depth + "," + index + "]." + currentLeaf.id);
        cell.parentView = this.scrollView;
        cell.viewController = this.viewController;
        if (isDefined(insertAfterDiv)) {
            this.scrollView.getDiv().insertBefore(cell.getDiv(), insertAfterDiv.nextSibling());
        } else {
            fragment.appendChild(cell.getDiv());
        }

        currentLeaf.cellRef = cell;

        let rowContainer = new View();
        //rowContainer.leafRef = currentLeaf; NOT NECESSARY ?
        //rowContainer.treeViewRef = this;
        rowContainer.boundsForView = function (parentBounds: Bounds): Bounds {
            if (parentBounds.width === undefined) {
                throw new Error("treeView rowContainer has no set width");
            }
            return {
                kind: "Bounds",
                x: px(0),
                y: px(0),
                width: parentBounds.width,
                height: parentBounds.height,
                unit: 'px',
                position: "relative",
                rotation: new NumberWithUnit(0, "deg"),
                elevation: new NumberWithUnit(0, "auto")
            };
        };
        rowContainer.fills = [];
        rowContainer.borders = [new Border(true, 2, "solid", "transparent")];
        rowContainer.borderRadius = new BorderRadius(6, 6, 6, 6);
        rowContainer.initView(cell.id + ".container");
        cell.attach(rowContainer);
        cell.keyValues["rowContainer"] = rowContainer;

        if (currentLeaf.children.length > 0) {
            let expCell: View | undefined = undefined;
            // do we have a delegate implementing treeViewExpandCollapseCell
            if (this.delegate && this.delegate.treeViewExpandCollapseCell) {

                    let expCellDelegate = this.delegate.treeViewExpandCollapseCell(this, currentLeaf, rowContainer);
                    if (isDefined(expCellDelegate)) {
                        expCell = expCellDelegate;
                    }

            }
            // if not we create the expand cell here
            if (expCell === undefined) {
                expCell = new View();
                expCell.fills = [];
                expCell.boundsForView = function (parentBounds: Bounds): Bounds {
                    return boundsWithPixels({
                        x: 5 + (depth * 15),
                        y: 0,
                        width: 25,
                        height: parentBounds.height.amount,
                        unit: 'px',
                        position: 'absolute'
                    });
                };
                expCell.cursor = "pointer";
                expCell.initView(cell.id + ".expCell");
                rowContainer.attach(expCell);

                let expendCollapse = new ImageView();
                expendCollapse.boundsForView = function (parentBounds: Bounds): Bounds {
                    return boundsWithPixels({
                        x: NUConvertToPixel(parentBounds.width).amount / 2 - 14 / 2,
                        y: NUConvertToPixel(parentBounds.height).amount / 2 - 14 / 2,
                        width: 14,
                        height: 14,
                        unit: 'px',
                        position: 'absolute'
                    });
                };

                let color = "";
                let styles = this.getStylesForTargetId("expandCollapseIcon");
                for (let x = 0; x < styles.length; x += 1) {
                    if (!isDefined(styles[x].cond) || styles[x].cond.length === 0) {
                        color = styles[x].textStyle.color.value;
                    }
                }
                var img = "";
                if (this.isLeafExpanded(currentLeaf.id)) {
                    img = Base64.encode(resource_caretdown.replace("currentColor", color));
                } else {
                    img = Base64.encode(resource_caretright.replace("currentColor", color));
                }

                expendCollapse.imageURI = "data:image/svg+xml;base64," + img;
                expendCollapse.imageWidth = 14;
                expendCollapse.imageHeight = 14;
                expendCollapse.getDefaultStyle().userSelect = "none";
                expendCollapse.fit = "contain";
                expendCollapse.initView(expCell.id + ".expendCollapse");
                expCell.attach(expendCollapse);

                /*
                let expendCollapse = new Label();
                expendCollapse.boundsForView = function (parentBounds: Bounds): Bounds {
                    return boundsWithPixels({
                        x: 0,
                        y: 0,
                        width: parentBounds.width.amount,
                        height: parentBounds.height.amount,
                        unit: 'px',
                        position: 'absolute'
                    });
                };

                expendCollapse.fontFamily = 'FontAwesome5ProRegular, -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif';
                if (currentLeaf.isExpanded) {
                    expendCollapse.text = "&#xf0d7;";
                } else {
                    expendCollapse.text = "&#xf0da;";
                }
                expendCollapse.fillLineHeight = true;
                expendCollapse.fontSize = 14;
                expendCollapse.cursor = "pointer";
                expendCollapse.initView(expCell.id + ".expend");
                expCell.attach(expendCollapse);

                 */

                currentLeaf.expandCollapseImage = expendCollapse;
            }
            currentLeaf.onToggle = function () {
                let self = <TreeLeaf>this;
                if (!self.treeViewRef.isLeafExpanded(self.id)) {
                    self.treeViewRef.expandNode(self);
                } else {
                    self.treeViewRef.collapseNode(self);
                }

            };
            expCell.setClickDelegate(currentLeaf, "onToggle");

        }

        let container = new View();
        container.keyValues["size"] = size;
        container.fills = [];
        container.keyValues["depth"] = depth;
        container.keyValues["treeViewRef"] = this;
        // should the cell uses the full width even if its not on the root level
        container.keyValues["isFullWidth"] = false;
        container.cursor = "pointer";
        if (this.delegate && this.delegate.treeViewIsCellFullWidth) {
                container.keyValues["isFullWidth"] = this.delegate["treeViewIsCellFullWidth"](this, currentLeaf, index, depth);
        } else {
                container.keyValues["isFullWidth"] = this["treeViewIsCellFullWidth"](this, currentLeaf, index, depth);
        }


        container.boundsForView = function (parentBounds: Bounds): Bounds {
            if (this.keyValues["isFullWidth"] === false) {
                return boundsWithPixels({
                    x: 5 + (this.keyValues["depth"] * 15) + 12,
                    y: 0,
                    width: parentBounds.width.amount - (5 + (this.keyValues["depth"] * 15) + 12),
                    height: parentBounds.height.amount,
                    unit: "px",
                    position: "absolute"
                });
            } else {
                return boundsWithPixels({
                    x: 0,
                    y: 0,
                    width: parentBounds.width.amount,
                    height: parentBounds.height.amount,
                    unit: "px",
                    position: "absolute"
                });
            }
        };
        container.initView(cell.id + ".container");
        rowContainer.attach(container);

        cell.keyValues["container"] = container;

        rowContainer.setClickDelegate(this, "_onCellClicked");
        rowContainer.keyValues["leafRef"] = currentLeaf;
        rowContainer.keyValues["treeViewRef"] = this;

        rowContainer.setDoubleClickDelegate(this, "_onCellDblClicked");

        if (this.bEnableContextMenu) {


        }

        // call the delegate for the custom cell
        if (this.delegate && this.delegate.treeViewLeafWasAttached) {
            this.delegate.treeViewLeafWasAttached(this, currentLeaf, container, index, depth)
        } else {
            this.treeViewLeafWasAttached(this, currentLeaf, container, index, depth);
        }

        // add the hover events on the rowContainer
        rowContainer.getDiv().rowContainerRef = rowContainer;

        rowContainer.getDiv().cellRef = cell;

        if (this.hoverRows) {

            rowContainer.getDiv().addEventListener("mouseenter", function(e) {
                if (this.rowContainerRef) {
                    let r = this.rowContainerRef;
                    let c: View = this.cellRef;
                    //let selectionColor = "rgba(24, 144, 255, 1.0)";
                    //r.borders = [new Border(true, 2, "solid", selectionColor)];
                    //r.render();


                    c.setPropertyValue("view.hovered", true);

                    c.processStyleAndRender("", []);



                    if (r.keyValues["treeViewRef"] && r.keyValues["leafRef"]) {
                        let t = r.keyValues["treeViewRef"];
                        let l = r.keyValues["leafRef"];
                        if (t.delegate && t.delegate.treeViewRowHover) {
                            t.delegate.treeViewRowHover(t, l, true);
                        } else {
                            if (t.treeViewRowHover) {
                                t.treeViewRowHover(t, l, true);
                            }
                        }
                    }
                }
            })

            rowContainer.getDiv().addEventListener("mouseover", function () {

            });

            rowContainer.getDiv().addEventListener("mouseleave", function () {
                if (this.rowContainerRef) {
                    let r = this.rowContainerRef;

                    let c: View = this.cellRef;
                    //let selectionColor = "rgba(24, 144, 255, 1.0)";
                    //r.borders = [new Border(true, 2, "solid", selectionColor)];
                    //r.render();


                    c.setPropertyValue("view.hovered", false);

                    c.processStyleAndRender("", []);

                    if (r.keyValues["treeViewRef"] && r.keyValues["leafRef"]) {
                        let t = r.keyValues["treeViewRef"];
                        let l = r.keyValues["leafRef"];
                        if (t.delegate && t.delegate.treeViewRowHover) {
                            t.delegate.treeViewRowHover(t, l, false);
                        } else {
                            if (t.treeViewRowHover) {
                                t.treeViewRowHover(t, l, false);
                            }
                        }
                    }
                }
            });
        }

        if (isDefined(parentLeaf)) {
            if (this.isLeafExpanded(parentLeaf.id) === false) {
                cell.setVisible(false);
            }
        }



        for (let i = 0; i < currentLeaf.children.length; i++) {
            this.traverseTree(fragment, currentLeaf.children[i], currentLeaf, i, depth + 1);
        }
    }

    collapseNode(leaf: TreeLeaf) {

        this.removeLeafFromExpandedList(leaf.id);
        if (leaf.expandCollapseImage) {
            let color = "";
            let styles = this.getStylesForTargetId("expandCollapseIcon");
            for (let x = 0; x < styles.length; x += 1) {
                if (!isDefined(styles[x].cond) || styles[x].cond.length === 0) {
                    color = styles[x].textStyle.color.value;
                }
            }
            var img = "";
            img = Base64.encode(resource_caretright.replace("currentColor", color));

            leaf.expandCollapseImage.setImageURI("data:image/svg+xml;base64," + img)

        }
        function hideLeaves(leaf: TreeLeaf) {
            if (leaf.cellRef) {
                leaf.cellRef.setVisible(false);
            }
            for (let i = 0; i < leaf.children.length; i += 1) {
                hideLeaves(leaf.children[i]);
            }
        }
        for (let x = 0; x < leaf.children.length; x += 1) {
            hideLeaves(leaf.children[x]);
        }
    }

    private addLeafToExpandedList(leafId: string) {
        let exists = this.expandedLeaves.find((s) => { return s === leafId;});
        if (exists === undefined) {
            this.expandedLeaves.push(leafId);
        }
    }
    private removeLeafFromExpandedList(leafId: string) {
        let idx = this.expandedLeaves.findIndex((s) => { return s === leafId;});
        if (idx > -1) {
            this.expandedLeaves.splice(idx, 1);
        }
    }
    private isLeafExpanded(leafId: string) {
        return this.expandedLeaves.findIndex((s) => { return s === leafId;}) > -1;
    }

    expandNode(leaf: TreeLeaf) {

        this.addLeafToExpandedList(leaf.id);
        if (leaf.expandCollapseImage) {
            let color = "";
            let styles = this.getStylesForTargetId("expandCollapseIcon");
            for (let x = 0; x < styles.length; x += 1) {
                if (!isDefined(styles[x].cond) || styles[x].cond.length === 0) {
                    color = styles[x].textStyle.color.value;
                }
            }
            var img = "";
            img = Base64.encode(resource_caretdown.replace("currentColor", color));

            leaf.expandCollapseImage.setImageURI("data:image/svg+xml;base64," + img)
        }
        for (let i = 0; i < leaf.children.length; i += 1) {
            let subLeaf = leaf.children[i];
            if (subLeaf.cellRef) {
                subLeaf.cellRef.setVisible(true);
            }
            /*
            if (this.isLeafExpanded(subLeaf.id) === false) {
                if (subLeaf.expandCollapseImage) {
                    let color = "";
                    let styles = this.getStylesForTargetId("expandCollapseIcon");
                    for (let x = 0; x < styles.length; x += 1) {
                        if (!isDefined(styles[x].cond) || styles[x].cond.length === 0) {
                            color = styles[x].textStyle.color.value;
                        }
                    }
                    var img = "";
                    if (this.isLeafExpanded(leaf.id)) {
                        img = Base64.encode(resource_caretdown.replace("currentColor", color));
                    } else {
                        img = Base64.encode(resource_caretright.replace("currentColor", color));
                    }
                    subLeaf.expandCollapseImage.setImageURI("data:image/svg+xml;base64," + img)
                }
            } else {
                this.expandNode(subLeaf);

            }

             */
        }
    }
    expandAllNodes() {

        let fn = (leaf: TreeLeaf) => {
            if (leaf.children && leaf.children.length > 0) {
                this.expandNode(leaf);
            }
            for (let i = 0; i < leaf.children.length; i += 1) {
                fn(leaf.children[i]);
            }
        }
        for (let i = 0; i < this.leaves.length; i += 1) {
            fn(this.leaves[i]);
        }

    }





    // internal recursive function to find a leaf and select it
    // REFACTOR
    _setSelectedRecur(leaf: TreeLeaf, id: string, isSelected: boolean): boolean {
        if (leaf.id === id) {
            leaf.isSelected = isSelected;
            if (isSelected) {
                // leaf.cellRef!.fills = [{active: true, type: 'color', blendMode: 'normal', value: this.selectedRowColor.value}];
                leaf.cellRef!.setPropertyValue("cell.isSelected", true);
            } else {
                //leaf.cellRef!.fills = []
                leaf.cellRef!.setPropertyValue("cell.isSelected", false);
            }

            this.expandNode(leaf);
            if (leaf.expandCollapseImage) {
                let color = "";
                let styles = this.getStylesForTargetId("expandCollapseIcon");
                for (let x = 0; x < styles.length; x += 1) {
                    if (!isDefined(styles[x].cond) || styles[x].cond.length === 0) {
                        color = styles[x].textStyle.color.value;
                    }
                }
                var img = "";
                img = Base64.encode(resource_caretdown.replace("currentColor", color));
                leaf.expandCollapseImage.setImageURI("data:image/svg+xml;base64," + img)

            }
            for (let j = 0; j < leaf.children.length; j++) {
                leaf.children[j].cellRef!.setVisible(true);
            }


            leaf.cellRef!.processStyleAndRender("", []);
            leaf.cellRef!.setVisible(true);
            return true;
        }

        for (let i = 0; i < leaf.children.length; i++) {
            let ret = this._setSelectedRecur(leaf.children[i], id, isSelected);
            if (ret) {

                if (leaf.expandCollapseImage) {
                    let color = "";
                    let styles = this.getStylesForTargetId("expandCollapseIcon");
                    for (let x = 0; x < styles.length; x += 1) {
                        if (!isDefined(styles[x].cond) || styles[x].cond.length === 0) {
                            color = styles[x].textStyle.color.value;
                        }
                    }
                    var img = "";
                    if (this.isLeafExpanded(leaf.id)) {
                        img = Base64.encode(resource_caretdown.replace("currentColor", color));
                    } else {
                        img = Base64.encode(resource_caretright.replace("currentColor", color));
                    }
                    leaf.expandCollapseImage.setImageURI("data:image/svg+xml;base64," + img)
                }
                for (let j = 0; j < leaf.children.length; j++) {
                    leaf.children[j].cellRef!.setVisible(true);
                }

                leaf.cellRef!.setVisible(true);
                return true;
            }
        }
        return false;

    }

    // method set a leaf as selected
    setSelected(id: string,isSelected: boolean) {
        for (let i = 0; i < this.leaves.length; i++) {
            let ret = this._setSelectedRecur(this.leaves[i], id, isSelected);
            if (isSelected === true && ret === true) {
                this.expandNode(this.leaves[i]);
            }
        }
    }

    // internal recursive function to set multiple leaves selection flag
    _setSelectedBatchRecur(leaf: TreeLeaf, array: any): boolean {

        let ret = false;

        let item  = array.find(function (item: any, value: string) {
            if (item.id === value) {
                return true;
            }
            return false;
        }, leaf.id);
        if (item !== undefined) {
            leaf.isSelected = item.isSelected;
        }

        for (let i = 0; i < leaf.children.length; i++) {
            ret = this._setSelectedBatchRecur(leaf.children[i], array);
            if (ret) {
                if (leaf.expandCollapseImage) {
                    let color = "";
                    let styles = this.getStylesForTargetId("expandCollapseIcon");
                    for (let x = 0; x < styles.length; x += 1) {
                        if (!isDefined(styles[x].cond) || styles[x].cond.length === 0) {
                            color = styles[x].textStyle.color.value;
                        }
                    }
                    var img = "";
                    if (this.isLeafExpanded(leaf.id)) {
                        img = Base64.encode(resource_caretdown.replace("currentColor", color));
                    } else {
                        img = Base64.encode(resource_caretright.replace("currentColor", color));
                    }
                    leaf.expandCollapseImage.setImageURI("data:image/svg+xml;base64," + img)
                }
            }
        }
        return ret;
    }

    // method set multiple leaves selection flag
    setSelectedBatch(array: any) {
        assert(array !== undefined, "setSelectedBatch Error: an array argument was expected.");
        this.clearSelection();
        if (array.length > 0) {
            assert((array[0].id !== undefined) && (array[0].isSelected !== undefined), "setSelectedBatch Error: type expected in array { id: value, isSelected: Boolean }.");
        }

        for (let i = 0; i < this.leaves.length; i++) {
            let ret = this._setSelectedBatchRecur(this.leaves[i], array);
            if (ret) {

                let color = "";
                let styles = this.getStylesForTargetId("expandCollapseIcon");
                for (let x = 0; x < styles.length; x += 1) {
                    if (!isDefined(styles[x].cond) || styles[x].cond.length === 0) {
                        color = styles[x].textStyle.color.value;
                    }
                }
                var img = "";
                if (this.isLeafExpanded(this.leaves[i].id)) {
                    img = Base64.encode(resource_caretdown.replace("currentColor", color));
                } else {
                    img = Base64.encode(resource_caretright.replace("currentColor", color));
                }
                this.leaves[i].expandCollapseImage.setImageURI("data:image/svg+xml;base64," + img)

            }
        }
    }


    // internal function to clear selection
    protected _clearSelectionRecur(leaf: TreeLeaf) {
        leaf.isSelected = false;
        // leaf.cellRef!.fills = [];
        leaf.cellRef!.setPropertyValue("cell.isSelected", false);
        leaf.cellRef!.processStyleAndRender("", []);

        for (let i = 0; i < leaf.children.length; i++) {
            this._clearSelectionRecur(leaf.children[i]);
        }
    }
    // method clear selection
    clearSelection() {
        for (let i = 0; i < this.leaves.length; i++) {
            this._clearSelectionRecur(this.leaves[i]);
        }
    }

    // internal recursive function get the selected leaves
    _getSelectedLeaves(leaf: TreeLeaf, retArray: any) {
        if (leaf.isSelected) {
            retArray.push(leaf);
        }
        for (let i = 0; i < leaf.children.length; i++) {
            this._getSelectedLeaves(leaf.children[i], retArray);
        }
    }
    // method get the selected leaves
    getSelectedLeaves(): TreeLeaf[] {
        let arrSelected: TreeLeaf[] = [];
        for (let i = 0; i < this.leaves.length; i++) {
            this._getSelectedLeaves(this.leaves[i], arrSelected);
        }
        return arrSelected;
    }

    // internal recursive toggle selection on user click
    _onCellClickedRecur(leaf: TreeLeaf, clickedLeaf: TreeLeaf, ctrl: boolean, shift: boolean, alwaysOn: boolean) {
        if (leaf.id === clickedLeaf.id) {
            if (alwaysOn) {
                leaf.isSelected = true;
                //leaf.cellRef!.fills = [{active: true, type: "color", blendMode: "normal", value: this.selectedRowColor.value}];
                leaf.cellRef!.setPropertyValue("cell.isSelected", true);
            } else {
                if (leaf.isSelected === true) {
                    leaf.isSelected = false;
                    // leaf.cellRef!.fills = [{active: false, type: "color", blendMode: "normal", value: ""}];
                    leaf.cellRef!.setPropertyValue("cell.isSelected", false);
                } else {
                    leaf.isSelected = true;
                    //leaf.cellRef!.fills = [{active: true, type: "color", blendMode: "normal", value: this.selectedRowColor.value}];
                    leaf.cellRef!.setPropertyValue("cell.isSelected", true);
                }
            }
            leaf.cellRef!.processStyleAndRender("", []);
        } else {
            if (!shift) {
                if ((leaf.isSelected) && (leaf.id !== clickedLeaf.id)) {
                    leaf.isSelected = false;
                    // leaf.cellRef!.fills = [{active: false, type: "color", blendMode: "normal", value: ""}];
                    leaf.cellRef!.setPropertyValue("cell.isSelected", false);
                    leaf.cellRef!.processStyleAndRender("", [])
                }
            }
        }


        for (let i = 0; i < leaf.children.length; i++) {
            this._onCellClickedRecur(leaf.children[i], clickedLeaf, ctrl, shift, alwaysOn);
        }

    }


    // internal function, the user has clicked a leaf
    _onCellClicked(sender: any, clickOptions: any) {
        let cellRef = sender.parentView;
        let leafRef = cellRef.keyValues["leafRef"];

        if (this.selectionMode === SelectionMode.noSelection) {
            return;
        }

        if (this.delegate && this.delegate.treeViewSelectionWillChange) {
            this.delegate.treeViewSelectionWillChange(this);
        }


        let ctrl = false;
        let shift = false;
        // are we selecting multiple leaves
        if (this.selectionMode === SelectionMode.multipleSelection) {
            ctrl = false;
            shift = false;

            if (clickOptions.ctrlKey) {
                ctrl = true;
            }
            if (clickOptions.shiftKey) {
                shift = true;
            }
            if (clickOptions.metaKey) {
                ctrl = true;
            }
        } else {
            ctrl = false;
            shift = false;
        }

        // go through each leaf and toggle the selection
        for (let i = 0; i < this.leaves.length; i++) {
            this._onCellClickedRecur(this.leaves[i], leafRef, ctrl, shift, (clickOptions.alwaysOn === true));
        }

        if (this.delegate && this.delegate.treeViewSelectionHasChanged) {

            this.delegate.treeViewSelectionHasChanged(this);
        } else {
            this.treeViewSelectionHasChanged(this);

        }

    }

    protected _onCellDblClicked(sender: any, clickOptions: any) {
        let cellRef = sender.parentView;
        let leafRef = cellRef.keyValues["leafRef"];
        if (this.delegate && this.delegate.treeViewLeafDoubleClicked) {
            this.delegate.treeViewLeafDoubleClicked(this, leafRef);
        }
    }



    // internal function, prepare our internal tree
    protected prepare(): void {
        let leaves: TreeLeaf[] = [];
        // for each item in the data array
        for (let i = 0; i < this.dataArray.length; i++) {
            // what is the id of the object
            let id : string = "0";
            if (this.delegate && this.delegate.treeViewIdForObject) {
                id = this.delegate.treeViewIdForObject(this, this.dataArray[i]);
            } else {
                id = this.treeViewIdForObject(this, this.dataArray[i]);
            }
            // create a leaf with refs to the object, parentLeaf
            // the index of the leaf on the current level,
            // the depth of the leaf ( 0 is root level)
            // and flags for the selection and collapse status
            let leaf: TreeLeaf =
            {
                id: id,
                parentLeaf: undefined,
                cellRef: undefined,
                object: this.dataArray[i],
                index: i,
                depth: 0,
                isSelected: false,
                children: [],
                childrenDropTargets: [],
                beforeDropTarget: undefined,
                afterDropTarget: undefined,
                onToggle() {}
            };
            // go through the children leaves
            this.prepareLeaves(leaf, undefined, i, 0);
            leaves.push(leaf);
        }
        this.leaves = leaves;
    }

    // internal recursive function, go through children leaves
    prepareLeaves(leaf: TreeLeaf, parentLeaf: TreeLeaf | undefined, index: number, depth: number) {

        let children = [];
        if (isDefined(this.delegate) && isDefined(this.delegate.treeViewChildrenForObject)) {
            children = this.delegate.treeViewChildrenForObject(this, leaf.object);
        } else {
            children = this.treeViewChildrenForObject(this, leaf.object);
        }
        if (!isDefined(children)) {
            children = [];
        }

        // console.log(`(tableView) prepCell ${leaf.object.title} has ${children.length} children`);

        for (let i = 0; i < children.length; i++) {
            // get the id
            let id : string = "";
            if (this.delegate && this.delegate.treeViewIdForObject) {
                id = this.delegate.treeViewIdForObject(this, children[i]);
            } else {
                id = this.treeViewIdForObject(this, children[i]);
            }

            let subLeaf: TreeLeaf = {
                id: id,
                parentLeaf: leaf,
                cellRef: undefined,
                object: children[i],
                index: i,
                depth: depth+1,
                isSelected: false,
                children: [],
                childrenDropTargets: [],
                beforeDropTarget: undefined,
                afterDropTarget: undefined,
                onToggle(): void {
                }
            };

            this.prepareLeaves(subLeaf, leaf, i, depth+1);

            leaf.children.push(subLeaf);
        }

    }


    protected search_leaf(baseArray: TreeLeaf[], nodeId: string): TreeLeaf | undefined {
        for (let i = 0; i < baseArray.length; i++) {
            if (Logging.enableLogging) {
                console.log(baseArray[i].object.title);
            }
            if (baseArray[i].id === nodeId) {
                return baseArray[i];
            }
            let ret = this.search_leaf(baseArray[i].children, nodeId);
            if (ret !== undefined) {
                return ret;
            }
        }
        return undefined;
    }

    render(parentBounds?: Bounds, style?: ViewStyle) {
        super.render(parentBounds, style);
        this.reloadData(undefined);
    }


    // method force a full refresh.  prepare our internal tree and redraw
    reloadData(optionalExpandedNodes: string[] | undefined) {
        this.prepare();
        this.redraw();

        if (optionalExpandedNodes) {
            for (let i = 0; i < optionalExpandedNodes.length; i++) {
                let leaf = this.search_leaf(this.leaves, optionalExpandedNodes[i]);
                if (leaf) {
                    this.expandNode(leaf);
                }
            }
        }


    }

    // method redraw all the cells
    redraw() {
        let i = 0;
        // remove all the cells on the scrollView
        this.allDropTargets = [];
        this.scrollView.detachAllChildren();

        if (this.dataArray === undefined) {
            return;
        }
        if (this.dataArray.length === 0) {
            return;
        }

        this.scrollView.getDiv().style.contain = 'strict';

        let fragment: DocumentFragment = document.createDocumentFragment();
        (fragment as any).id = this.id + ".fragment";


        // draw drop targets and go through the tree
        for (i = 0; i < this.leaves.length; i++) {
            //let dt = this._drawDropTarget(vars, i, 0);
            //this.allDropTargets.push(dt);
            //this.leaves[i].beforeDropTarget = dt;
            //if (i > 0) {
            //    this.leaves[i-1].afterDropTarget = dt;
            //}
            this.traverseTree(fragment, this.leaves[i], undefined, i, 0);
        }
        this.scrollView.getDiv().appendChild(fragment);



        //let lastDT = this._drawDropTarget(vars, i, 0);
        //this.allDropTargets.push(lastDT);
        //this.leaves[this.leaves.length-1].afterDropTarget = lastDT;

    }

    // draw a cell that will accept drop events
    _drawDropTarget(vars: any, index: number, depth: number) {
        let cell = new View();
        cell.keyValues["current_y"] = vars.current_y;
        cell.keyValues["depth"] = depth;
        // the left bound of the cell depends on the leaf depth
        cell.boundsForView = function (parentBounds: Bounds) : Bounds {
            let x = 0;
            if (this.keyValues["depth"] > 0) {
                x = 5 + (this.keyValues["depth"] * 15) + 25
            }
            return boundsWithPixels({
                x: x,
                y: this.keyValues["current_y"],
                width: parentBounds.width.amount - x,
                height: 2,
                unit: "px",
                position: "absolute"
            });
        };
        cell.fills = [];
        cell.initView(this.id + ".dropTarget." + depth + "." + index);
        this.scrollView.attach(cell);
        // we add two pixels to running Y index
        vars.current_y = vars.current_y + 2;
        return cell;
    }

    removeLeaf(withId: string) {
        let leafInfo = this.findLeafWithParent(withId);
        if (leafInfo ) {
            // remove the row
            if (leafInfo.leaf.cellRef) {

                this.scrollView.getDiv().removeChild(leafInfo.leaf.cellRef.getDiv());

                // leafInfo.leaf.cellRef.detachItSelf();
            }
            if (leafInfo.parentLeaf === undefined) {
                this.leaves.splice(leafInfo.index, 1);
            } else {
                leafInfo.parentLeaf.children.splice(leafInfo.index, 1);
            }
        } else {
            console.warn("treeView.removeLeaf: could not find leaf " + withId);
        }
    }


    // method, scroll to the first selected leaf
    scrollToSelection() {
        //console.log("scrollToSelection");
        let bounds = this.scrollView.getBounds("");
        let leaves = this.getSelectedLeaves();
        //console.log("selectedLeaves", leaves);
        if (leaves.length > 0 ) {
            if (leaves[0].cellRef !== undefined) {
                let div = leaves[0].cellRef!.getDiv();
                let divElem = this.scrollView.getDiv();
                let value = div.getBoundingClientRect().top - divElem.offsetTop;
                value = value - (bounds.height.amount / 2);
                //console.log("scrollTop: " + value);
                if (value < 0) {
                    value = parseFloat(divElem.scrollTop) + value;
                    if (value < 0) {
                        value = 0;
                    }
                }
                divElem.scrollTop = value;
                return;
            }

        } else {
            //console.log("no selection");
            this.scrollView.getDiv().scrollTop = 0;
        }
    }


    addLeaf(leaf: any, toLeafId: string) {
        let id = undefined;
        if (this.delegate && this.delegate.treeViewIdForObject) {
            id = this.delegate.treeViewIdForObject(this, leaf);
        } else {
            id = this.treeViewIdForObject(this, leaf);
        }
        if (!isDefined(id)) {
            id = generateV4UUID();
        }

        let parentLeafInfo = undefined;
        let index = 0;
        let depth = 0;
        let parentLeaf = undefined;
        if (toLeafId) {
            parentLeafInfo = this.findLeafInfo(toLeafId);
            if (parentLeafInfo) {
                depth = parentLeafInfo.depth + 1;
                parentLeaf = parentLeafInfo.leaf;
            } else {
                depth = 0;
                parentLeaf = undefined;
            }
            if (parentLeaf) {
                index = parentLeaf.children.length;
            }
        } else {
            depth = 0;
            index = this.leaves.length;
        }

        let newLeaf = {
            id: id,
            parentLeaf: parentLeaf,
            cellRef: undefined,
            object: leaf,
            index: index,
            depth: depth,
            isExpanded: true,
            isSelected: false,
            children: [],
            childrenDropTargets: [],
            beforeDropTarget: undefined,
            afterDropTarget: undefined,
            onToggle():void {}
        };

        if (parentLeaf) {
            parentLeaf.children.push(newLeaf);
        } else {
            this.leaves.push(newLeaf);
        }
        this.redraw();

    }


    treeViewContextMenuDataSource(treeView: TreeView, leaf: TreeLeaf) {
        return [];
    }

    treeViewContextMenuItemWasSelected(treeView: TreeView, leaf: TreeLeaf, id: string) {

    }




}