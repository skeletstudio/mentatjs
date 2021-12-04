

export interface ContextMenuDelegate {
    contextMenuDataSource(e: any): any[];
    contextMenuItemWasSelected(id: string, e: any): void;
}

