import {isDefined} from "../Utils/isDefined";
import {NodeHandler} from "./NodeHandler";
import {Logging} from "../Utils/logging";
import {assert} from "../Utils/assert";





export class DOMPool<N> {

    handler: NodeHandler<N>;
    pools: { [key: string]: {tagName: string, growBy: number, pool: N[]}} = {};

    constructor(handler: NodeHandler<N>) {
        this.handler = handler;
    }

    addPool(tagUnique: string, tagName: string, numberOfElementsToCreate: number) {
        let exists = this.pools[tagUnique];
        if (!isDefined(exists)) {
            this.pools[tagUnique] = {tagName: tagName, growBy: numberOfElementsToCreate, pool: []};
        }

        for (let i = 0; i < numberOfElementsToCreate; i++) {
            let elem: N = this.handler.newNode(tagName, "");
            this.pools[tagUnique].pool.push(elem);
        }
        return this.pools[tagUnique];
    }

    getPool(tagUnique: string) {
        let exists = this.pools[tagUnique];
        return exists;
    }

    getElement(tagUnique: string): N {
        let p = this.getPool(tagUnique);
        if (p === undefined) {
            p = this.addPool(tagUnique, tagUnique, 100);
        }
        assert(p !== undefined, "DOMPool.getElement called with tag " + tagUnique + " which has no pool.");

        if (p.pool.length === 0) {
            Logging.log("DOMPool " + tagUnique + " has depleted its supply. Adding " + p.growBy + " " + tagUnique + ".");
            this.addPool(tagUnique,p.tagName, p.growBy);
        }
        return p.pool.pop();
    }

    returnElement(tagUnique: string, element: N) {
        if (element === undefined || element === null) { return; }
        this.handler.cleanNode(element);
        let p = this.getPool(tagUnique);
        assert(p !== undefined, "DOMPool.returnElement called with tag " + tagUnique + " which has no pool.");

        //p.pool.push(element);
    }


}