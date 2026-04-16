export interface Workspace {
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

export interface NetUser {
    domain: string;
    userName: string;
    password: string;
    resource: string;
    id?: number;
    executableId: string;
    priorityLevel?: string;
    lastUpdated?: string;
    updatedBy: string;
    workspace: Workspace;
    checked?: boolean;
    recentlyCreated?: boolean;
    recentlyUpdated?: boolean;
}

export interface NetUserMapping {
    active: boolean;
    script: ScriptDto;
    netUsers: Array<NetUser>;
}

export interface GlobalParameter {
    autoComplete: boolean;
    config: boolean;
    dataType: string;
    description: string;
    id?: number;
    inParameter: boolean;
    lastUpdated: string;
    optionProtected: boolean;
    outParameter: boolean;
    parameterName: string;
    parameterTypes: string;
    probableValues: any;
    scriptId: number;
    securityLevel: string;
    storedValue: boolean;
    type: string;
    updatedBy: string;
    value: string;
    workspaceId: number;
    recentlyCreated?: boolean;
    recentlyUpdated?: boolean;
}

export interface TaskDetailsDto {
    workspaceId: number;
    itemType: string;
    itemName: string;
    deployed: boolean;
    disabled: boolean;
    locked: boolean;
    showAll: boolean;
    searchInNameAndDesc: boolean;
    moveItemFolderSearch: boolean;
    inAllParameters?: boolean;
    inIdentifier?: boolean;
    inNetUser?: boolean;
    inItemName?: boolean;
    inItemDescription?: boolean;
    advanceSearch?: boolean;
    advanceInputSearch?: string;
    advanceSearchFilters?: Array<any>;
    userName: string;
}

export interface DeployUndeployItemsDto {
    workspaceId: number;
    deploymentDetails: Array<DeploymentDetailsDto>;
}

export interface DeploymentDetailsDto {
    teisItemID: number;
    teisItemType: string;
    teisVersionNumber: number;
}

export interface MarkAllTaskAsCompletedDto {
    allTasksSelected: boolean;
    executionStates: Array<string>;
    itemIdList: Array<number>;
    note: string;
    taskIdList: Array<string>;
    updatedBy: string;
}

export interface ManualAutoDeployDto {
    process: TeisItemDto,
    type: string,
    processId: number,
    workspaceId: number,
    versionNote: string,
    userName: string
}

export interface CreateFolderDto {
    id?: number;
    workspaceId: number;
    belongsToFolder: number;
    name: string;
    description: string;
    type: string;
}

export interface TeisItemDto {
    activatorDataList?: Array<any>;
    activatorEnabled?: boolean;
    configData?: any;
    configDataList?: Array<any>;
    configParameterList?: Array<any>;
    identifierMethodList?: Array<any>;
    infoFilePath?: string;
    taskRepeatFrequency?: number;
    taskToBeRepeated?: boolean;
    alertProcess?: boolean;
    defaultAlert?: boolean;
    name: string;
    id?: number;
    locked?: boolean;
    lockedDate?: string;
    lockedUserId?: string;
    lockedUserName?: string;
    createAndDeploy: boolean;
    description: string;
    disabled: boolean;
    updateTaskList: boolean;
    enableAlert: boolean;
    alertProcessId: number;
    alertProcessName: string;
    scriptEngineGroup: string;
    scriptEngine: string;
    queue: string;
    netUsersDto: Array<NetUser>;
    netUserMapping: Array<NetUserMapping>;
    oldFileName: string;
    logMaintenanceId: string;
    alertId: string;
    alertEnabled: boolean;
    scheduled: boolean;
    modified: boolean;
    deployed: boolean;
    folder: boolean;
    type: string;
    folderDataList: Array<FolderDto>;
    workspaceId: number;
    autoStart: boolean;
    interactiveMode: boolean;
    showDebugMsg: boolean;
    disable: boolean;
    logLevel: string;
    priority: string;
    iconId: number;
    belongsToFolder: number;
    deleted: boolean;
    scriptEngineKey: string;
    imageIconName: string;
    failedTaskCount: number;
    initiateTaskCount: number;
    processingTaskCount: number;
    processingErrorTaskCount: number;
    lastUpdated: string;
    updatedBy: string;
    versionCount: number;
    version?: number;
    deployedVersion: number;
    versionNumber: number;
    thisDeployedVersion: boolean;
    disabledSchedulerOrAlarm: boolean;
    releasePressed: boolean;
    paramsData: any;
    scriptList: Array<ScriptDto>;
    scripts: Array<ScriptDto>;
    teisFolders: any;
    note?: string;
    releaseOnly?: boolean;
    releaseAndDeploy?: boolean;
    saveOnly?: boolean;
    identifierIdList?: Array<any>;
    identifiers?: Array<IdentifierDto>;
    alarmList?: Array<AlarmDto>;
    associatedProcess?: any;
    processComponentId?: string;
    schedulerList?: Array<SchedulerDto>;
    processId?: string;
    businessFlowDatas?: Array<BusinessFlowDto>;
}

export interface IdentifierDto {
    name: string;
    id: string;
    parameterNameValue: any;
    identifierName: string;
    fileName: string;
    order: number;
    methodVersion: string;
    methodName: string;
    detectorParametersData: any;
    content: string;
    identifierClassName: string;
    referenceComponentId: string;
    identifierConfigStr: string;
    lastUpdated: string;
    updatedBy: string;
    identifierStr: string;
    regexStr: string;
    enabled: boolean;
    scriptEngineId: string;
    scriptEngineName: string;
    identifierType: string;
    serverIdentity: string;
    scriptEngineKey: string;
}

export interface AlarmDto {
    alarmName: string;
    alarmProcessName: string;
    alarmProcessId: string;
    months: string;
    dayOfWeek: string;
    dayOfMonth: string;
    hour: string;
    minutes: string;
    seconds: string;
    startdate: string;
    enddate: string;
    disable: boolean;
    id: string;
    recurrencePattern: string;
    nonSchedulerDtoList: Array<NonSchedulerDto>;
}

export interface NonSchedulerDto {
    id: string;
    year: number;
    month: number;
    dayOfMonth: number;
    dayOfWeek: number;
    updatedBy: string;
    lastUpdated: string;
}

export interface SchedulerDto {
    id?: number;
    months: string;
    month: string;
    dayOfWeek: string;
    dayOfMonth: string;
    hour: string;
    lastUpdated: string;
    schedulerName: string;
    startDate: string;
    minutes: string;
    seconds: string;
    endDate: string;
    eventId: string;
    recurrencePatternSummary: any;
    recurrencePattern: string;
    nonSchedulerDataList: Array<NonSchedulerDto>;
    updatedBy: string;
    year: string;
    // disabled: boolean;
    disable: boolean;
    sequence: number;
    localDto?: any;
    isNew?: boolean;
    alarmDisable: boolean;
    isEventDisabled?: boolean;
}

export interface BusinessFlowDto {
    webFlowData: any;
    scriptData: ScriptDto;
    scriptPosition: number;
    flowActivityModelId: string;
    correlationName: Array<ExecutableParamCorrelationDto>;
    attachedBusinessIntegration: ItemBasicDetailDto;
    businessFlowId: string;
}

export interface ExecutableParamCorrelationDto {
    executableParamName: string;
    correlationName: string;
}

export interface ItemBasicDetailDto {
    name: string;
    id: string;
    description: string;
}

export interface ItemParamsDto {
    id: string;
    isprotected: boolean;
    paramName: string;
    securityLevel: string;
    type: string;
    value: string;
}

export interface FolderDto {
    items: Array<ItemDto>;
    status: string;
}

export interface ItemDto {
    name: string;
    id?: number;
    type: string;
}

export interface LogMaintenance {
    activeDays: number;
    archiveDays: number;
    archiveMode: boolean;
    id: number;
    lastUpdated: string;
    name: string;
    updatedBy: string;
}

export interface AlertProcess {
    alertEnabled: boolean;
    alertId: number;
    alertProcess: boolean;
    alertProcessId: number;
    alertProcessName: string;
    autoStart: boolean;
    belongsToFolder: string;
    defaultAlert: boolean;
    deleted: boolean;
    deployed: boolean;
    deployedVersion: number;
    description: string;
    disable: boolean;
    disabled: boolean;
    disabledSchedulerOrAlarm: boolean;
    enableAlert: boolean;
    failedTaskCount: number;
    folder: boolean;
    iconId: number;
    id: number;
    imageIconName: string;
    initiateTaskCount: number;
    interactiveMode: boolean;
    lastUpdated: string;
    logLevel: string;
    logMaintenanceId: number;
    modified: boolean;
    name: string;
    netUserMapping: string;
    netUsersDto: any;
    oldFileName: string;
    priority: string;
    processingErrorTaskCount: number;
    processingTaskCount: number;
    queue: any;
    releasePressed: boolean;
    scheduled: boolean;
    scriptEngine: any;
    scriptEngineGroup: number;
    scriptEngineKey: string;
    scriptList: Array<any>;
    showDebugMsg: boolean;
    teisFolders: any;
    thisDeployedVersion: boolean;
    type: string;
    updateTaskList: boolean;
    updatedBy: string;
    version: number;
    versionCount: number;
    versionNumber: number;
    workspaceId: number;
}

export interface ScriptEngineGroup {
    description: string;
    enabled: boolean;
    groupName: string;
    id: number;
    scriptEngines: Array<any>;
    tempPath: string;
    updatedBy: string;
}

export interface QueueGroup {
    active: boolean;
    alert: boolean;
    group: string;
    id: number;
    lastUpdated: string;
    queueDisplayName: string;
    queueId: number;
    triggerQueue: boolean;
    updatedBy: string;
}

export interface ScriptDto {
    className: string;
    connectable: boolean;
    connected: boolean;
    deleted: boolean;
    deployedVersion: number;
    description: string;
    executableRef: string;
    fileName: string;
    id: number;
    language: string;
    lastUpdated: string;
    netUsers: Array<NetUser>;
    oldFileName: string;
    order: number;
    parametersID: string;
    scriptContents: string;
    scriptEngineId: string;
    scriptEngineKey: string;
    scriptEngineName: string;
    scriptModule: boolean;
    scriptName: string;
    scriptParameterDataList: Array<ScriptParameterDto>;
    scriptVersion: number;
    sequence: number;
    serverIdentity: string;
    sysLibRefList: Array<any>;
    sysLibRefNameList: Array<any>;
    thisDeployedVersion: boolean;
    triggerScript: boolean;
    type: string;
    updatedBy: string;
    userDefined: boolean;
    versionCount: number;
    versionNumber: number;
    isSelected?: boolean;
    disabled?: boolean;
}

export interface ScriptParameterDto {
    id: string;
    parameterName: string;
    value: string;
    scriptId: string;
    config: boolean;
    type: string;
    optionProtected: boolean;
    inParameter: boolean;
    outParameter: boolean;
    currentParameterObj?: any;
    isProcessParam?: any;
}

export interface TreeItemDto {
    belongsToFolder: number;
    name: string;
    workspaceId: number;
    type: string;
}

export interface SelectedItemDto {
    itemId: string;
    itemType: string;
    workspaceId: string;
}

export interface AddNoteDto {
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

export interface RestartTaskDto {
    taskIdList?: Array<String>;
    note?: String;
    updatedBy?: String;
    itemIdList?: Array<any>;
    allTasksSelected?: Boolean;
    executionStates?: Array<String>;
}

export interface StoreServcieLogsDto {
    itemId: number;
    itemType: string;
    workspaceId: number;
    timeFrame: string;
    pageNo: number;
    serviceLogs: any;
}

export interface StoreEventLogsDto {
    itemId: number;
    itemType: string;
    workspaceId: number;
    timeFrame: string;
    pageNo: number;
    eventLogs: any;
}

export interface MoveItemDto {
    workspaceId: number;
    sourceFolder: number;
    destinationFolder: number;
    itemType: string;
    isFolder: boolean;
}

export interface AppliedFilters {
    selectedWorkspace: number;
    currentTab: number;
    searchTerm: string;
    undeployed: boolean;
    locked: boolean;
    disabled: boolean;
}
export class WebFlowArray {
    description: string;
    disable: boolean;
    flowGroupData: FlowGroup;
    flowModelData: FlowModel;
    id?: number;
    lastUpdated?: string;
    name: string;
    searchTimeFrame: string;
    timeFrame?: any;
    updatedBy?: string;
    webFlowActivityNameDataList: Array<any>;
    workspaceData: any;
    connectedToBusinessFlow?: boolean;
}
export class FlowModel {
    connectedToWebflow?: boolean;
    description: string;
    flowActivityModelDataList: Array<FlowActivityModelDataList>;
    flowType: FlowType;
    id?: string;
    lastUpdated: any;
    name: string;
    updatedBy: string;
    recentlyAdded?: boolean;
    recentlyUpdated?: boolean;
}

export class FlowType {
    description: string;
    id?: string;
    lastUpdated: string;
    name: string;
    updatedBy: string;
}

export class FlowActivityModelDataList {
    activityModelData: ActivityModelData;
    sequence: number;
    id?: string;
}

export class ActivityModelData {
    description: string;
    id?: string;
    lastUpdated: string;
    name: string;
    updatedBy: string;
    activityType: ActivityType;
    webFlowActivityDes: string;
}

export class ActivityType {
    description: string;
    id?: string;
    lastUpdated: string;
    name: string;
    updatedBy: string;
    type: string;
}

export class FlowGroup {
    connectedToWebflow?: boolean;
    description: string;
    errorCount: string;
    id?: number;
    name: string;
    recentlyAdded?: boolean;
    recentlyUpdated?: boolean;
}

export class WebFlow {
    description: string;
    disable: boolean;
    flowGroupData: FlowGroup;
    flowModelData: FlowModel;
    id?: number;
    lastUpdated?: string;
    name: string;
    searchTimeFrame: string;
    timeFrame?: any;
    updatedBy?: string;
    webFlowActivityNameDataList: Array<any>;
    workspaceData: any;
    recentlyAdded?: boolean;
    recentlyUpdated?: boolean;
    connectedToBusinessFlow?: boolean;
}

/*---------- Data Service Interfaces -----------*/
export class FlowModelData {
    flowModelId: number;
    flowModels: Array<FlowModel>;
}

export class FlowGrpData {
    flowGrpId: number;
    flowGrps: Array<FlowGroup>
}

export class WebFlowData {
    webFlowId: number;
    webFlows: Array<WebFlow>
}

export class UserAccessValidationDto {
    userName: string;
    workspaceId: string;
    itemType: string;
    itemId: string;
    validateRootAccess: boolean;
    parentId: string;
}




