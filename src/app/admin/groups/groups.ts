import { Users } from '../users/users';

export interface Groups {
    color: string;
    id?: string;
    lastUpdated?: string;
    name: string;
    description: string;
    updatedBy?: string;
    userName?: string;
    users: Array<Users>;
    recentlyAdded?: boolean;
    recentlyUpdated?: boolean;
    superAdminGroup: boolean;
    adminGroup: boolean;
    profile: any;
    userType?: string;
}

export interface AllGroups {
    userGroups: Array<Groups>;
    totalCount: number;
}

export interface CreateUserFromGroup {
    isCreateUserFromGrp: boolean;
    isUserCreated: boolean;
    isCancelUserCreation: boolean;
    groupId: any,
    groupFormData: Groups,
    groupMembers: Array<any>,
    createdUser: any
}

export interface CreateProfileFromGroup {
    isCreateProfileFromGrp: boolean;
    isProfileCreated: boolean;
    isCancelProfileCreation: boolean;
    groupId: any,
    profileId: any,
    groupFormData: Groups,
    groupMembers: Array<any>,
    createdProfile: any
}
