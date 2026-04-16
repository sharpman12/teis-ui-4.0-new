export interface AppRegistryDto {
    appParamsDataList: Array<any>;
    description: string;
    enabled: boolean;
    id: string;
    lastDeployedDate: string;
    lastUpdated: string;
    logLevel: string;
    logMaintenanceId: string;
    name: string;
    registeredDate: string;
    setupData: SetupData;
    status: string;
    updatedBy: string;
    version: string;
    workspaceData: any;
    wsType: string;
}

export interface SetupData {
    buildVersion: string;
    componentType: string;
    description: string;
    id: string;
    instanceIdentity: string;
    lastUpdated: string;
    serverIdentity: string;
    setupTagValueList: any;
    updatedBy: string;
}

export interface AppParamsDto {
    name: string;
    value: string;
    type: string;
    id: string;
    enabled: boolean;
}
