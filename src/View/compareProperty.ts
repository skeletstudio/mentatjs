import {assert} from "../Utils/assert";
import {isDefined} from "../Utils/isDefined";
import {Bounds} from "../Bounds/Bounds";
import {NumberWithUnit} from "../NumberWithUnit/NumberWithUnit";
import {Logging} from "../Utils/logging";
import {OpResult} from "../Types/OpResult";


export function compareProperty(type: 'bounds' | 'anchors' | 'string' | 'boolean' | 'slider' | 'image' | 'radius' | 'dropdown' | 'fills' | 'borders' | 'shadows' | 'localizedString' | 'textStyle' | any , path: string, valueA: any ,valueB: any ): OpResult {
    assert(typeof type === "string", "compareProperty expects a valid type parameter");
    if (!isDefined(path)) {
        path = "";
    }

    assert(isDefined(valueA), "compareProperty expects a valid valueA parameter");
    assert(isDefined(valueB), "compareProperty expects a valid valueB parameter");
    try {
        if (type === "string") {
            let a: string = valueA as string;
            let b: string = valueB as string;
            let comp = a.localeCompare(b);
            if (comp === 0) {
                return 'equals';
            }
            return 'different';
        }
        if (type === 'boolean') {
            let a: boolean = valueA as boolean;
            let b: boolean = valueB as boolean;
            if (a===b) { return 'equals';}
            return 'different';
        }
        if (type === 'number') {
            let a: number = valueA as number;
            let b: number = valueB as number;
            if (a===b) {
                return 'equals';
            }
            if (a>b) {
                return 'greater';
            }
            return 'lower';

        }
        if (type === "bounds") {
            let a: Bounds = valueA as Bounds;
            let b: Bounds = valueB as Bounds;
            if (isDefined(path) && path !== "") {
                let testA = (a[path] as NumberWithUnit).amount;
                let testB = (b[path] as NumberWithUnit).amount;
                if (testA === testB) {
                    return 'equals';
                }
                if (testA > testB) {
                    return 'greater';
                }
                if (testA < testB) {
                    return 'lower';
                }

            } else {
                if ((a.x.amount === b.x.amount && a.x.unit === b.x.unit) &&
                    (a.y.amount === b.y.amount && a.y.unit === b.y.unit) &&
                    (a.width.amount === b.width.amount && a.width.unit === b.width.unit) &&
                    (a.height.amount === b.height.amount && a.height.unit === b.height.unit)) {
                    return 'equals';
                }
                return 'different';
            }
        }
        if (Logging.enableLogging) {
            Logging.warn('No compare function for type ' + type);
        }


    } catch (e) {
        Logging.warn(e.message);
        Logging.dir(e);

    }

    return 'different';
}