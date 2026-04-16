export interface Workspaces {
    id: string;
    name: string;
    type: string;
    selected?: boolean;
}

export interface CreateReport {
    defaultValue: boolean;
    description: string;
    error?: boolean;
    errorCount?: number;
    id?: string;
    items: Array<ItemsArray>;
    name: string;
    searchText: string;
    timeFrame: string;
    userId?: number;
    isAdd?: boolean;
}

export interface ItemsArray {
    workspaceId: string;
    itemType: string;
    itemId: number;
}
