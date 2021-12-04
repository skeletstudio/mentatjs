import {TreeView} from "./TreeView";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";
import {View} from "../View/View";
import {TreeLeaf} from "./TreeLeaf";


export interface TreeViewDelegate {
    treeViewCellSizeForLeaf?(treeView: TreeView, leafObject: any, index: number, depth: number): NumberWithUnit[];
    treeViewLeafWasAttached?(treeView: TreeView, leafObject: any, leafCell: View, index: number, depth: number): void;
    treeViewIdForObject?(treeView: TreeView, object: any): string;
    treeViewChildrenForObject?(treeView: TreeView, object: any): any[];
    treeViewSelectionWillChange?(treeView: TreeView): void;
    treeViewSelectionHasChanged?(treeView: TreeView): void;
    treeViewIsCellFullWidth?(treeView: TreeView, leafObject: any, index: number, depth: number): boolean;
    treeViewExpandCollapseCell?(treeView: TreeView, leaf: TreeLeaf, rowContainer: View): View;
    treeViewContextMenuDataSource?(treeView: TreeView, leaf: TreeLeaf): void;
    treeViewContextMenuItemWasSelected?(treeView: TreeView, leaf: TreeLeaf, id: string): void;
    treeViewRowHover?(treeView: TreeView, leaf: TreeLeaf | undefined, hoverStatus: boolean): void;
    treeViewLeafDoubleClicked?(treeView: TreeView, leaf: TreeLeaf): void;
}
