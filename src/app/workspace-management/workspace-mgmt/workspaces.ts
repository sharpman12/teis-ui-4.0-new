export interface Workspaces {
    archived?: boolean;
    defaultWorkspace: boolean;
    deleted?: boolean;
    deployLogId?: string;
    deployedItems?: number;
    description: string;
    failedCount?: string;
    id?: string;
    items?: any;
    lastUpdated?: string;
    lockedItems?: number;
    name: string;
    notInitializeItems?: number;
    schedulerDisabled?: boolean;
    status?: string;
    unDeployLogId?: string;
    unDeployedItems?: number;
    updatedBy?: string;
    userIds?: Array<string>;
    webServiceDisabled?: boolean;
    isSelected?: boolean;
    isChecked?: boolean;
    isInfoShow?: boolean;
    isRecentlyCreated?: boolean;
    isRecentlyUpdated?: boolean;
    isRecentlyDeployed?: boolean;
    isRecentlyUndeployed?: boolean;
    deployUndeployAccess?: boolean;
    createUpdateDeleteAccess?: boolean;
    enableDisableSchedulerAccess?: boolean;
    enableDisableServicesAccess?: boolean;
}

export interface DeployItemDto {
    workspaceId: string;
    reportRequired: boolean;
    redeployRequired: boolean;
    isDeploy?: boolean;
}

export interface UpdateWorkspace {
    workspaceIds: Array<string>;
    schedulerDisabled: boolean;
    wswDisabled: boolean;
    isDeploy?: boolean;
}
