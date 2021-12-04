import {TreeView} from "./TreeView";
import {View} from "../View/View";
import {ImageView} from "../Components/ImageView";


export interface TreeLeaf {
    id: string;
    parentLeaf?: TreeLeaf;
    cellRef?: View;
    expandCollapseImage?: ImageView;
    object?: any;
    index: number;
    depth: number;
    isExpanded: boolean;
    isSelected: boolean;
    children: TreeLeaf[];
    childrenDropTargets?: View[];
    beforeDropTarget?: View;
    afterDropTarget?: View;
    treeViewRef?: TreeView;
    onToggle():void;
}

