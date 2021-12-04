import {NodeHandler} from "../NodeHandler";


export class WebNodeHandler implements NodeHandler<HTMLElement> {

    newNode(tagName: string, namespace: string = ""): HTMLElement {
        if (namespace === "") {
            return document.createElement(tagName);
        } else {
            return document.createElementNS(namespace, tagName) as HTMLElement;
        }
    }

    attach(node: HTMLElement, parent: HTMLElement) {
        parent.appendChild(node);
    }

    remove(node: HTMLElement, parent: HTMLElement) {
        parent.removeChild(node);
    }

    addListener(node: HTMLElement, eventName: string, func: (evt: Event) => any) {
        node.addEventListener(eventName, func);
    }
    removeListener(node: HTMLElement, eventName: string, func: (evt: Event) => any) {
        node.removeEventListener(eventName, func);
    }
    cleanNode(node: HTMLElement) {
        node.id = "";
        while (node.attributes.length > 0) {
            node.removeAttribute(node.attributes[node.attributes.length-1].name);
        }
        node.draggable = false;
        node.innerHTML = "";
        node.className = "";
        node.style.cssText = "";
        let props = Object.keys(node);
        for (let key in props) {
            if (key[0] === "o" && key[1] === "n") {
                node[key] = null;
            }
        }

    }

}
