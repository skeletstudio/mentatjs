import {View} from "../View/View";
import {PropertyTextStyle} from "./PropertyTextStyle";


export function applyTextStyle(view: View, textStyle: PropertyTextStyle) {
    view.getDefaultStyle().textStyle = JSON.parse(JSON.stringify(textStyle));
}


