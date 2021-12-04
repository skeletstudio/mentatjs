


export function splitGradientString(str: string): string[] {
    let ret: string[] = [];
    let current: string = '';
    let inSub = 0;
    for (let i = 0; i < str.length; i += 1) {
        if (str[i] !== ',') {
            current += str[i];
        }
        if (str[i] === '(') {
            inSub += 1;
            // ignore , until ')'
        }
        if (str[i] === ')') {
            inSub -= 1;
        }
        if (str[i] === ',' && inSub === 0) {
            ret.push(current);
            current = '';
        } else if (str[i] === ',' && inSub > 0) {
            current += ',';
        }
    }
    if (current.length > 0) {
        ret.push(current);
    }
    return ret;
}