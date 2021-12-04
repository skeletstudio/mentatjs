

export class Logging {
    static enableLogging : boolean = false;
    static log(...args) {
        //@ts-ignore
        console.log.apply(console, args);
    }
    static warn(...args) {
        //@ts-ignore
        console.warn.apply(console, args);
    }
    static dir(...args) {
        //@ts-ignore
        console.dir.apply(console, args);
    }
}

