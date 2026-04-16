export interface ArchiveFlow {
    disable: boolean;
    id: number;
    name: string;
    discription?: string;
    timeFrame?: string;
}

export interface ArchiveSearch {
    error: boolean;
    flowId: number;
    pageNo: number;
    searchText: string;
    startActivity: boolean;
    timeFrame: string;
}

export interface LogSearch {
    actualTimeFrame: string;
    applyAccess: boolean;
    defaultValue: boolean;
    description: string;
    error: boolean;
    errorCount: number;
    flowId: number;
    id: number;
    items: Array<any>;
    logType: string;
    name: string;
    pageNo: number;
    searchText: string;
    timeFrame: string;
}
