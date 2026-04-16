import { Users } from '../users/users';

export interface Profiles {
    active?: boolean;
    deleted?: boolean;
    description?: string;
    functionalMapTree?: string;
    archiveFunctionalMapTree?: string;
    id?: string;
    lastUpdated?: string;
    name?: string;
    profileAccessList?: Array<any>;
    roleDataList?: Array<RoleList>;
    updatedBy?: string;
    userList?: Array<Users>;
    workspaceFolderList?: Array<any>;
    workspaceWebFlowRelationData?: string;
    wsFolderRelationList?: Array<any>;
    recentlyAdded?: boolean;
    recentlyUpdated?: boolean;
    superAdminProfile: boolean;
    adminProfile: boolean;
    userType?: string;
}

export interface RoleList {
    active: boolean;
    deleted: boolean;
    description: string;
    id: string;
    lastUpdated: string;
    modules: any;
    modulesTree: any;
    name: string;
    profiles: any;
    updatedBy: string;
    users: any;
}

export interface AllProfiles {
    totalCount: number;
    profiles: Array<Profiles>;
}
