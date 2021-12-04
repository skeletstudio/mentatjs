import {FullScreenPane} from "./FullScreenPane";


export interface FullScreenPaneDelegate {
    fullscreenPane: FullScreenPane;
    fullscreenPaneDidClosed(pane: FullScreenPane, status: any): void;
}