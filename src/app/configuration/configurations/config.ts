export enum ServerParamsKeys {
    workspaceFolder = 'Workspace_Folder',
    logFolder = 'Log_Folder',
    archiveFolder = 'ArchiveLog_Folder',
    tempFiles = 'TempFiles',
    appLogPurgeInDays = 'AppLogPurgeInDays',
    versionCount = 'VersionCount',
    webServiceMaxResTime = 'ws_max_response_time',
    webSerivceMaxReqSize = 'ws_max_request_size',
    host = 'mail.smtp.host',
    port = 'mail.smtp.port',
    ssltrust = 'mail.smtp.ssl.trust',
    starttlsEnable = 'mail.smtp.starttls.enable',
    auth = 'mail.smtp.auth',
    username = 'mail.smtp.username',
    password = 'mail.smtp.password',
    timeout = 'mail.smtp.timeout',
    connectiontimeout = 'mail.smtp.connectiontimeout',
    writetimeout = 'mail.smtp.writetimeout'
}

export class SetupDto {
    id: string;
    componentType: string;
    serverIdentity: string;
    instanceIdentity: string;
    buildVersion: string;
    description: string;
    lastUpdated: string;
    updatedBy: string;
    setupTagValueList: Array<any>;
}

export class ScriptParameterDto {
    id?: string;
    parameterName: string;
    securityLevel: string;
    value: string;
    optionProtected: boolean;
    description: string;
    parameterTypes?: string;
    lastUpdated?: string;
    updatedBy?: string;
}

export class LogMaintenanceDto {
    id?: string;
    name: string;
    activeDays: number;
    archiveDays: number;
    archiveMode: boolean;
    lastUpdated: string;
    updatedBy: string;
}

export class ScriptEngineGroupDto {
    id?: string;
    groupName: string;
    description: string;
    enabled: boolean;
    tempPath: string;
    updatedBy: string;
    scriptEngines: Array<SEConfigurationDto>;
}

export class SEConfigurationDto {
    id: string;
    name: string;
    ipAddress: string;
    key: string;
    type: string;
    url?: string;
    lastUpdated?: Date;
    enabled?: boolean;
    startUpTime?: string;
    newName?: string;
    newEnabled?: boolean;
    cacheDefault?: string;
    cacheNew?: string;
    processPoolDefault?: string;
    processPoolNew?: string;
    updatedBy?: string;
}



