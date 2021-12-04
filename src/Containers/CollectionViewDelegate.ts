import {CollectionView} from "./CollectionView";
import {View} from "../View/View";
import {CollectionItem} from "./CollectionItem";


export interface CollectionViewDelegate {

    collectionViewCellSize?(collectionView: CollectionView, index: number): number[];
    collectionViewCellWasAttached?(collectionView: CollectionView, cell: View, index: number):void;

    collectionViewWasRefreshed?(collectionView: CollectionView):void;
    collectionViewSelectionChangedForCellIndex?(collectionView: CollectionView, index: number, selected: boolean):void;
    collectionViewSelectionHasChanged?(collectionView: CollectionView):void;

    collectionViewAddOptionCellSize?(collectionView: CollectionView): number[];
    collectionViewAddOptionCellAdded?(collectionView: CollectionView, cell: View):void;
    collectionViewAddOptionSelected?(collectionView: CollectionView):void;
    collectionViewMoreOptionCellSize?(collectionView: CollectionView): number[];
    collectionViewMoreOptionCellAdded?(collectionView: CollectionView, cell: View):void;
    collectionViewMoreOptionSelected?(collectionView: CollectionView):void;

    collectionViewCellCameIntoViewport?(collectionView: CollectionView, item: CollectionItem);
    collectionViewCellLeftViewport?(collectionView: CollectionView, item: CollectionItem);

}
