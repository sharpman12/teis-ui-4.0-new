/*============= Create User Interface =============*/
export interface Users {
    active: boolean;
    applicationName?: string;
    changePassword: boolean;
    confirmpassword?: string;
    defaultWorkspace: DefaultWorkspace;
    email: string;
    firstName: string;
    id: string;
    identityProvider: string;
    instanceIdentity?: string;
    isChecked?: boolean;
    lastName: string;
    newPassword?: string;
    password: string;
    permissions?: string;
    phoneNumber: string;
    profile: Profile;
    profileRef?: string;
    provider: string;
    refreshToken?: string;
    scopes?: string;
    settings?: string;
    token?: string;
    updatedBy: string;
    userName: string;
    superAdminUser?: boolean;
    adminUser?: boolean;
    userType?: string;
    recentlyAdded?: boolean;
    recentlyUpdated?: boolean;
    groups?: Array<any>;
    userGroupList: any;
}

export interface Profile {
    id: string;
    active?: boolean;
    deleted?: boolean;
    description?: string;
    lastUpdated?: string;
    name?: string;
    profileAccessList?: Array<any>;
    roleDataList?: Array<any>;
    updatedBy?: string;
    workspaceFolderList?: Array<any>;
    workspaceWebFlowRelationData?: Array<any>;
    wsFolderRelationList?: Array<any>;
}

export interface DefaultWorkspace {
    description: string;
    id: string;
    items: string;
    name: string;
    status: string;
}
/*============= END Create User Interface =============*/

/*============= Get All User Interface =============*/
export interface AllUsers {
    totalCount: number;
    users: Array<Users>;
}
/*============= END Get All User Interface =============*/

/*============= Utility interface ==============*/
export interface Utility {
    ldapUrlId?: string;
    ldapUrl: string;
    ldapUsernameId?: string;
    ldapUsername: string;
    ldapPasswordId?: string;
    ldapPassword: string;
    ldapDomainId?: string;
    ldapDomain: string;
    updatedBy: string;
}
/*============= END Utility interface ==============*/

export interface CreateGroupFromUser {
    isCreateGrpFromUser: boolean;
    isGrpCreated: boolean;
    isCancelGroupCreation: boolean;
    grpId: any;
    userFormData: Users;
}
