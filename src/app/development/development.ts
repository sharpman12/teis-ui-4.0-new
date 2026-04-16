import { SafeResourceUrl } from "@angular/platform-browser";

export interface CreateScriptDto {
    id?: number;
    scriptName: string;
    description: string;
    language: string;
    updatedBy: string;
    connectable: boolean;
    deployedVersion: number;
    thisDeployedVersion: boolean;
    isThisDeployedVersion?: boolean;
    scriptModule: boolean;
    order: number;
    userDefined: boolean;
    triggerScript: boolean;
    scriptContentsAsString: string;
    scriptId?: number;
    workspaceId?: number;
    lockInfo?: LockInfo;
    tabId?: string;
    isSystemLibrary?: boolean;
    releaseOnly: boolean;
    releaseAndDeploy: boolean;
    saveOnly: boolean;
    note: string;
    existingScriptId?: string;
    scriptType: string;
    sysLibRefList?: Array<string>;
    sysLibRefNameList?: Array<string>;
    debugParameters?: Array<any>;
    url?: SafeResourceUrl;
    workspaceName?: string;
    debugSeId?: string;
    debugSeUrl?: string;
    clientId?: Array<string>;
}
export interface RemoveScriptDto {
    workspaceId: number;
    scriptId: number;
    isUserDefinedScript: boolean
}

export interface ScriptItem {
    scriptName: string;
    type: string;
    scriptEngine: string;
    description: string;
    scriptId?: number;
    workspaceId?: number;
    lockInfo?: LockInfo;
    tabId?: string;
    url?: SafeResourceUrl;
    triggerScript: boolean;
    debugSeId?: string;
    debugSeUrl?: string;
    debugSeName?: string;
    scriptEngineGroupId?: string;
    scriptEngineGroupName?: string;
}

export interface LockInfo {
    idOfLockedItem: number;
    lockDate: Date;
    lockTime: any;
    lockedBy: string;
    isLocked?: boolean;
    isBreakLockBtnVisible?: boolean;
    lockedUserId?: number;
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
    probableValues: Array<ParamProbableValuesDto>;
    autoComplete: boolean;
    storedValue: boolean;
    dataType: string;
    description: string;
    parameterTypes: string;
    lastUpdated: string;
    updatedBy: string;
    securityLevel: string;
    workspaceId: string;
}

export interface ParamProbableValuesDto {
    id: string;
    scriptParameterData: string;
    paramValues: string;
    sequence: number;
}

export interface WinwrapRequestDto {
    jsonMap: string;
    headers: string;
    clientId: Array<string>;
    contentType: string;
    workspaceId: string;
    scriptId: string;
    attachSysLibIds: Array<string>;
    attachedReferenceIds: Array<string>;
    userName?: string;
    scriptType?: string;
    deployedCopy?: boolean;
    versionId?: number;
    versionCopy?: boolean;
    debugSettingUse?: boolean;
    triggerScript?: boolean;
    debugSeId?: string;
    debugSeUrl?: string;
    genId?: number;
}

export interface ExportScript {
    scriptId: string;
    teisItemType: string;
    workspaceId: string;
    versionNumber: number;
    workingCopy: boolean;
}