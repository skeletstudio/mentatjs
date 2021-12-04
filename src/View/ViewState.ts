import {LayerStateType} from "./LayerStateType";
import {LayerInteractionType} from "./LayerInteractionType";

export interface ViewState {
    id: string;
    type: LayerStateType;
    interaction: LayerInteractionType;
}
