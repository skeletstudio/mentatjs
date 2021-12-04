import {ViewController} from "../ViewController/ViewController";


export interface NavigationControllerDelegate {
    viewControllerWasLoadedSuccessfully(viewController: ViewController): void;
}
