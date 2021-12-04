



export interface NodeHandler<N> {
    newNode(tagName: string, namespace: string): N;
    attach(node: N, parent: N);
    remove(node: N, parent: N);
    addListener(node: N, eventName: string, func: (evt: Event) => any);
    removeListener(node: N, eventName: string, func: (evt: Event) => any);
    cleanNode(node: N);
}
