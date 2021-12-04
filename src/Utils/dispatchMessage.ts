


export function dispatch_msg ( object: any, arrPath: string[], functionName: string) {
    let i = 0;
    if (object === null) {
        console.warn("dispatch_msg assert failed: object is undefined");
        console.warn(functionName + " function not called.");
        return;
    }
    if (object === undefined) {
        console.warn("dispatch_msg assert failed: object is undefined");
        console.warn(functionName + " function not called.");
        return;
    }

    let obj = object;

    for (i = 0; i < arrPath.length; i += 1) {
        obj = obj[arrPath[i]];
        if (obj === undefined) {
            console.warn("dispatch_msg assert failed: object in array is undefined (" + arrPath[i] + ")");
            console.warn(functionName + " function not called.");
            return;
        }
        if (obj === null) {
            console.warn("dispatch_msg assert failed: object in array is undefined (" + arrPath[i] + ")");
            console.warn(functionName + " function not called.");
            return;
        }
    }

    if (obj[functionName] === undefined) {
        console.warn("dispatch_msg assert failed: functionName doesn't exists (undefined) in path");
        console.warn(functionName + " function not called.");
        return;
    }

    if (obj[functionName] === null) {
        console.warn("dispatch_msg assert failed: functionName doesn't exists (undefined) in path");
        console.warn(functionName + " function not called.");
        return;
    }

    obj[functionName]();

}


export function dispatch_msg_params (object: any, arrPath: string[], functionName: string, arrParams: any[]) {
    let i = 0;
    if (object === null) {
        console.warn("dispatch_msg assert failed: object is undefined");
        console.warn(functionName + " function not called.");
        return;
    }
    if (object === undefined) {
        console.warn("dispatch_msg assert failed: object is undefined");
        console.warn(functionName + " function not called.");
        return;
    }

    let obj = object;

    for (i = 0; i < arrPath.length; i += 1) {
        obj = obj[arrPath[i]];
        if (obj === undefined) {
            console.warn("dispatch_msg assert failed: object in array is undefined (" + arrPath[i] + ")");
            console.warn(functionName + " function not called.");
            return;
        }
        if (obj === null) {
            console.warn("dispatch_msg assert failed: object in array is undefined (" + arrPath[i] + ")");
            console.warn(functionName + " function not called.");
            return;
        }
    }

    if (obj[functionName] === undefined) {
        console.warn("dispatch_msg assert failed: functionName doesn't exists in path");
        console.warn(functionName + " function not called.");
        return;
    }

    if (obj[functionName] === null) {
        console.warn("dispatch_msg assert failed: functionName doesn't exists (undefined) in path");
        console.warn(functionName + " function not called.");
        return;
    }

    const fun = obj[functionName];

    fun.apply(obj, arrParams);



}

