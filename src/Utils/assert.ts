export function assert(evaluate: boolean, message: string) {
    if (evaluate === false) {
        throw new Error(message);
    }
}

