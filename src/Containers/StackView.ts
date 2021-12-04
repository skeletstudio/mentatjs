import {View} from "../View/View";
import {isDefined} from "../Utils/isDefined";
import {Bounds} from "../Bounds/Bounds";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";


export class StackView extends View {

    delegate?: any = undefined;
    numberOfRows: number = 1;


    constructor() {
        super();
    }


    stackViewNumberOfRows(stackView: StackView) {
        return this.numberOfRows;
    }

    render () {
        let i = 0;
        this.detachAllChildren();

        let nbCells = -1;
        if (isDefined(this.delegate)) {
            if (isDefined(this.delegate["stackViewNumberOfRows"])) {
                nbCells = this.delegate["stackViewNumberOfRows"](this);
            }
        }
        if (nbCells === -1) {
            nbCells = this.stackViewNumberOfRows(this);
        }
        for (i = 0; i < nbCells; i += 1) {
            let cell = new View();
            cell.boundsForView = function (parentBounds: Bounds): Bounds {
                return {
                    kind: "Bounds",
                    x: new NumberWithUnit(0, "px"),
                    y: new NumberWithUnit(0, "auto"),
                    width: new NumberWithUnit(parentBounds.width.amount, parentBounds.width.unit),
                    height: new NumberWithUnit(0, "auto"),
                    unit: 'px',
                    rotation: new NumberWithUnit(0, "deg"),
                    elevation: new NumberWithUnit(0, "auto")
                };
            };
            cell.initView(this.id + ".stackRow" + i);
            this.attach(cell);
        }
    }
}