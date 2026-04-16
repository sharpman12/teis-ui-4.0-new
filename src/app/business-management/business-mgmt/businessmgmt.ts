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
    workspaceData: any;
    errorCount: string;
    id?: number;
    name: string;
    recentlyAdded?: boolean;
    recentlyUpdated?: boolean;
    isFlowGrpConnected?: boolean;
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

