import {FullScreenPane} from "./FullScreenPane";


export interface FullScreenPaneDelegate {
    fullscreenPane: FullScreenPane | undefined;
    fullscreenPaneDidClosed(pane: FullScreenPane, status: any): void;
}