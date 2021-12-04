import {WebNodeHandler} from "./Web/WebNodeHandler";
import {DOMPool} from "./DOMPool";
import {NodeHandler} from "./NodeHandler";


export class ServiceGetter {

    private static _instance: ServiceGetter = undefined;

    static get instance(): ServiceGetter {
        if (ServiceGetter._instance === undefined) {
            return new ServiceGetter();
        }
        return ServiceGetter._instance;
    }

    private constructor() {
        ServiceGetter._instance = this;
    }


    private domHandler: NodeHandler<HTMLElement>;
    private domPool: DOMPool<HTMLElement>

    initWeb() {
        this.domHandler = new WebNodeHandler();
        this.domPool = new DOMPool<HTMLElement>(this.domHandler);
        this.domPool.addPool("div", "div", 5000);
        this.domPool.addPool("button", "button", 200);
        this.domPool.addPool("textField", "input", 500);
        this.domPool.addPool("canvas", "canvas", 50);
    }
    
    get pool(): DOMPool<HTMLElement> {
        return this.domPool;
    }

    get handler(): NodeHandler<HTMLElement> {
        return this.domHandler;
    }


}