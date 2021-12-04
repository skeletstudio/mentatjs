import {Popover} from "./Popover";
import {ViewController} from "../ViewController/ViewController";


export interface PopoverDelegate {
    popoverRef: Popover
    popoverWasClosed(popover: Popover, status: any): void;
    popoverReceivedStatus?(popover: Popover, viewController: ViewController, status: any);
}

