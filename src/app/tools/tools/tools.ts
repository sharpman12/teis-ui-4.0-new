export interface Workspaces {
    archived?: boolean;
    defaultWorkspace: boolean;
    deleted?: boolean;
    deployLogId?: string;
    deployedItems?: number;
    description: string;
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
}

export interface Items {
    workspaceId: number;
    type: string;
    processIds: Array<number>;
    integrationIds: Array<number>;
    triggerIds: Array<number>;
    searchText: string;
    exportDeployedVersion?: boolean;
}

export interface Script {
    workspaceId: number;
    type: string;
    processIds: Array<string>;
    integrationIds: Array<string>;
    triggerIds: Array<string>;
    exportDeployedVersion?: boolean;
}

export interface Export {
    workspaceId?: number;
    teisVersion?: string;
    exportDeployedVersion?: boolean;
    workspaceIds?: Array<number>;
    processIds: Array<number>;
    integrationIds: Array<number>;
    triggerIds: Array<number>;
    applicationParamIds: Array<number>;
    globalParamIds: Array<number>;
    templateScriptIds: Array<number>;
    userScriptIds: Array<number>;
}

export interface ExportedData {
    alertEnabledForProcesses?: boolean;
    applicationParamList?: Array<any>;
    applicationParams?: Array<any>;
    applicationVersion?: string;
    encryptedContents?: string;
    expCreationDate?: string;
    exportDir?: string;
    exportSize?: number;
    fileName?: string;
    globalParamList?: Array<any>;
    globalParams?: Array<any>;
    iconList?: Array<any>;
    iconNames?: Array<any>;
    importContentDto?: ImportContentDto;
    importPath?: string;
    importResultData?: any;
    innerParamCompIds?: any;
    innerParams?: Array<any>;
    integrationList?: Array<any>;
    integrations?: Array<any>;
    itemCompositeExported?: boolean;
    logId?: string;
    netUser?: Array<any>;
    outerParams?: Array<any>;
    outterParamCompIds?: any;
    overrideOption: string;
    overwriteWithDeploy: boolean;
    overrideItemsScriptsWithDeploy: boolean;
    processList?: Array<any>;
    processes?: Array<any>;
    schedulerCompositeExported?: boolean;
    systemLibrary?: any;
    templateList?: Array<any>;
    templateScriptExported?: boolean;
    templateScripts?: Array<any>;
    toOverwrite?: boolean;
    triggerList?: Array<any>;
    triggers?: Array<any>;
    userId?: any;
    userName?: any;
    userScriptExported?: boolean;
    userScriptList?: Array<any>;
    userScripts?: Array<any>;
    workspaceId: number;
    workspaceMappingExported?: boolean;
    workspaceName: string;
    byte?: string;
}

export interface ImportContentDto {
    appParamsCount: string;
    globalParamsCount: string;
    integrationTree: string;
    integrationsCount: string;
    processTree: string;
    processesCount: string;
    systemLibrary: string;
    templatesCount: string;
    triggerTree: string;
    triggersCount: string;
    userScriptsCount: string;
    workspaceName: string;
}

export interface ExportedWorkspaceAndType {
    exportToId: string;
    workspaceId: number;
    workspaceName: string;
    allWorkspaceIds: Array<number>;
    typeId: number;
    exportOption: string;
    isExportDeployedVersion: boolean;
}

export interface ImportedWorkspace {
    importFromId: string;
    workspaceId: number;
    workspaceName: string;
    allWorkspaceIds: Array<number>;
    typeId: number;
    isTypeChanged: boolean;
    override: number;
    overwriteWithDeploy: boolean;
    toOverwrite: boolean;
    overrideOption: string;
    overrideItemsScriptsWithDeploy: boolean;
    alertEnabledForProcesses: boolean;
    alertEnabledForIntegrations: boolean;
    alertEnabledForTriggers: boolean;
}

export interface ImportResultDto {
    applicationParamsStatus: Array<any>;
    configFilesStatus: Array<any>;
    createdScript: Array<any>;
    defaultParamsStatus: Array<any>;
    fileName: string;
    globalParamsStatus: Array<any>;
    importContentDto?: ImportContentDto;
    importIdExistingIdIntegrationMap: any;
    importIdExistingIdProcessMap: any;
    importIdExistingIdTplScriptMap: any;
    importIdExistingIdTriggerMap: any;
    importIdExistingIdUserScriptMap: any;
    importIdExistingNetUserDataMap: any;
    integrationsStatus: any;
    logId: string;
    netUserStatus: Array<any>;
    processesStatus: Array<any>;
    templateScriptsStatus: Array<any>;
    triggersStatus: Array<any>;
    userScriptsStatus: Array<any>;
}

export interface ItemRequestDto {
    workspaceId: number;
    type: string;
    integrationList: Array<any>;
    processList: Array<any>;
    triggerList: Array<any>;
    scriptList: Array<any>;
    searchText: string;
}