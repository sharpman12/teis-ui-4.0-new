import { Injectable } from '@angular/core';
import { Groups } from './groups/groups';
import { Profiles } from './profiles/profiles';
import { Roles } from './roles/roles';
import { Users } from './users/users';

@Injectable({
  providedIn: 'root'
})
export class GlobalDataService {

  /*---------------- Users Properties ----------------*/
  private usersData = {
    userId: null,
    searchCriteria: {
      type: 'All',
      pageNumber: null,
      name: null,
      excludeRecordId: null,
      userType: '',
      includeSuperAdmin: false,
      includeAdmin: false,
      includeUser: false,
      profileId: null
    },
    userList: [],
    totalCount: null
  };

  /*---------------- Profiles Properties ----------------*/
  private profilesData = {
    profileId: null,
    searchCriteria: {
      type: 'All',
      pageNumber: null,
      name: null,
      excludeRecordId: null,
      userType: '',
      includeSuperAdmin: false,
      includeAdmin: false,
      includeUser: false,
      profileId: null
    },
    profileList: [],
    totalCount: null
  };

  private profiles = [];

  /*---------------- Roles Properties ----------------*/
  private rolesData = {
    roleId: null,
    searchCriteria: {
      type: 'All',
      pageNumber: null,
      name: null,
      excludeRecordId: null,
      userType: '',
      includeSuperAdmin: false,
      includeAdmin: false,
      includeUser: false,
      profileId: null
    },
    roleList: [],
    totalCount: null
  };

  private roles = [];

  /*---------------- Groups Properties ----------------*/
  private groupsData = {
    groupId: null,
    searchCriteria: {
      type: 'All',
      pageNumber: null,
      name: null,
      excludeRecordId: null,
      userType: '',
      includeSuperAdmin: false,
      includeAdmin: false,
      includeUser: false,
      profileId: null
    },
    groupList: [],
    totalCount: null
  };

  constructor() { }

  /*========================== Users Data ==========================*/

  /*----------- Store Users -----------*/
  storeUsers(usersData: any) {
    this.usersData = this.usersData;
    usersData.userList.forEach(element => {
      element.recentlyAdded = false;
      element.recentlyUpdated = false;
    });
    this.usersData = usersData;
  }

  /*----------- Add User -----------*/
  addUser(user: Users) {
    this.usersData.userId = user.id;
    user.recentlyAdded = true;
    this.usersData.userList.unshift(user);
  }

  /*----------- Update User -----------*/
  updateUser(user: Users) {
    user.recentlyUpdated = true;
    this.usersData.userId = user.id;
    const index = this.usersData.userList.findIndex((el) => el.id === user.id);
    this.usersData.userList[index] = user;
  }

  /*----------- Get Users -----------*/
  getUsers() {
    return this.usersData;
  }

  /*========================== END Users Data ==========================*/

  /*========================== Profiles Data ==========================*/

  /*----------- Store Profile -----------*/
  storeProfile(profileData: any) {
    this.profilesData = this.profilesData;
    profileData.profileList.forEach(element => {
      element.recentlyAdded = false;
      element.recentlyUpdated = false;
    });
    this.profilesData = profileData;
  }

  /*----------- Add Profile -----------*/
  addProfile(profile: Profiles) {
    this.profilesData.profileId = profile.id;
    profile.recentlyAdded = true;
    this.profilesData.profileList.unshift(profile);
  }

  /*----------- Update Profile -----------*/
  updateProfile(profile: Profiles) {
    profile.recentlyUpdated = true;
    this.profilesData.profileId = profile.id;
    const index = this.profilesData.profileList.findIndex((el) => el.id === profile.id);
    this.profilesData.profileList[index] = profile;
    if (this.profiles?.length) {
      const i = this.profiles.findIndex((el) => el.id === profile.id);
      this.profiles[i] = profile;
    }
  }

  /*----------- Update Archive Functional Map of Profile -----------*/
  updateArchiveFunMap(profile: Profiles) {
    profile.recentlyUpdated = true;
    this.profilesData.profileId = profile.id;
    const index = this.profilesData.profileList.findIndex((el) => el.id === profile.id);
    this.profilesData.profileList[index].archiveFunctionalMapTree = profile?.functionalMapTree;
    if (this.profiles?.length) {
      const i = this.profiles.findIndex((el) => el.id === profile.id);
      this.profiles[i].archiveFunctionalMapTree = profile?.functionalMapTree;
    }
  }

  /*----------- Get Profiles -----------*/
  getProfiles() {
    return this.profilesData;
  }

  /*----------- Store Profile On Select -----------*/
  storeProfileOnSelect(profile: Profiles[]) {
    this.profiles = [];
    this.profiles = profile;
  }

  /*----------- Get Profile By Id -----------*/
  getProfileOnSelect() {
    return this.profiles;
  }

  /*========================== END Profiles Data ==========================*/

  /*========================== Roles Data ==========================*/

  /*----------- Store Roles -----------*/
  storeRole(rolesData: any) {
    this.rolesData = this.rolesData;
    rolesData.roleList.forEach(element => {
      element.recentlyAdded = false;
      element.recentlyUpdated = false;
    });
    this.rolesData = rolesData;
  }

  /*----------- Add Role -----------*/
  addRole(role: Roles) {
    this.rolesData.roleId = role.id;
    role.recentlyAdded = true;
    this.rolesData.roleList.unshift(role);
  }

  /*----------- Update Role -----------*/
  updateRole(role: Roles) {
    role.recentlyUpdated = true;
    this.rolesData.roleId = role.id;
    const index = this.rolesData.roleList.findIndex((el) => el.id === role.id);
    this.rolesData.roleList[index] = role;
    if (this.roles?.length) {
      const i = this.roles.findIndex((el) => el.id === role.id);
      this.roles[i] = role;
    }
  }

  /*----------- Get Roles -----------*/
  getRoles() {
    return this.rolesData;
  }

  /*----------- Store Roles On Role Select -----------*/
  storeRolesOnSelect(roles: Roles[]) {
    this.roles = [];
    this.roles = roles;
  }

  /*----------- Get Roles On Role Select -----------*/
  getRolesOnSelect() {
    return this.roles;
  }

  /*========================== END Roles Data ==========================*/

  /*========================== Groups Data ==========================*/

  /*----------- Store Group -----------*/
  storeGroup(groupsData: any) {
    this.groupsData = this.groupsData;
    groupsData.groupList.forEach(element => {
      element.recentlyAdded = false;
      element.recentlyUpdated = false;
    });
    this.groupsData = groupsData;
  }

  /*----------- Add Group -----------*/
  addGroup(group: Groups) {
    this.groupsData.groupId = group.id;
    group.recentlyAdded = true;
    this.groupsData.groupList.unshift(group);
  }

  /*----------- Update Group -----------*/
  updateGroup(group: Groups) {
    group.recentlyUpdated = true;
    this.groupsData.groupId = group.id;
    const index = this.groupsData.groupList.findIndex((el) => el.id === group.id);
    this.groupsData.groupList[index] = group;
  }

  /*----------- Get Group -----------*/
  getGroups() {
    return this.groupsData;
  }

  /*========================== END Groups Data ==========================*/

}
