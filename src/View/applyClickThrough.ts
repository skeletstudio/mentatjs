import {View} from "./View";

export function applyClickThrough (cell: View) {
    let i: number;
    cell.getDiv().style.pointerEvents = 'none';

    for (i = 0; i < cell.subViews.length; i += 1 ) {
        applyClickThrough(cell.subViews[i] as View);
    }
}
