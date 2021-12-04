import {NodeHandler} from "./NodeHandler";


export class NoOPNodeHandler implements NodeHandler<any> {
    newNode(tagName: string, namespace: string = ""): any {
        return {};
    }

    attach(node: any, parent: any) {

    }

    remove(node: any, parent: any) {

    }

    addListener(node: any, eventName: string, func: (evt: Event) => any) {

    }
    removeListener(node: any, eventName: string, func: (evt: Event) => any) {

    }
    cleanNode(node: any) {
    }
}