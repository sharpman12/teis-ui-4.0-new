export interface TaskDetailsDto {
    taskIdList?: Array<String>;
    note?: String;
    updatedBy?: String;
    itemIdList?: Array<any>;
    allTasksSelected?: Boolean;
    executionStates?: Array<String>;
    workspaceIds?: Array<any>;
    timeFrame?: String;
    workspaceId?: String;
}

export interface ItemTaskDto {
    itemId?: any;
    itemIdList?: Array<any>;
    executionStates?: Array<String>;
    workspaceId?: number;
    paginationCriteria?: PaginationCriteria;
}

export interface PaginationCriteria {
    pageNumber: number;
}

export interface StartTaskDetailsDto {
    workspaceID?: number;
    tiesItemID?: number;
    parameters?: any;
    parameterDto?: Object;
    currentScript?: number;
    teisItemType?: String;
    priority?: any;
    updatedTriggerConfigList?: Array<any>;
    debugSeId?: string;
    debugSeUrl?: string;
}

export interface TaskItemsListDto {
    taskType: string;
    itemId: number;
    taskItemLists: Array<any>;
    pageNumber: number;
}

export interface TaskCacheStatusDto {
    status: string;
    taskId: string;
}

export interface StopAllTasksDto {
    taskId?: string;
    executionState: string;
    taskStopped: boolean;
    workspaceId: number;
    note: string;
    updatedBy: string;
    taskStatus: Array<string>;
    allTasksSelected: boolean;
    itemIdList: Array<number>;
}
