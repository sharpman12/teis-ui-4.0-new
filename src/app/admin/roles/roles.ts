import { Profiles } from '../profiles/profiles';
import { Users } from '../users/users';

export interface Roles {
    active?: boolean;
    deleted?: boolean;
    description: string;
    id?: string;
    lastUpdated: string;
    modules: Array<any>;
    modulesTree: Array<any>;
    name: string;
    profiles: Array<Profiles>;
    updatedBy: string;
    users: Array<Users>;
    recentlyAdded?: boolean;
    recentlyUpdated?: boolean;
    superAdminRole: boolean;
    adminRole: boolean;
    userType?: string;
}

export interface AllRoles {
    roles: Array<Roles>;
    totalCount: number;
}
