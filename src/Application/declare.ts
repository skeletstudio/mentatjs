import {Application} from "./Application";


export function declare (scriptID: string, fn: any) {
    let i = 0;
    fn();
    if (Application !== undefined) {
        if (Application.instance !== undefined) {
            Application.instance.cache(scriptID, {fn: fn});
            for (i = 0; i < Application.instance.downloadStack.length; i += 1) {
                const stack =Application.instance.downloadStack[i];
                if (stack.counter > 0) {
                    if (stack.files.contains(scriptID)) {
                        stack.counter--;
                        if (stack.counter === 0) {
                            stack.navigationController._initViewController(stack);
                        }
                    }
                }
            }
        }
    }
}