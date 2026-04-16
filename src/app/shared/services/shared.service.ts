import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ReturnToURPG, UpdateURPG } from 'src/app/admin/admin';
import { CreateProfileFromGroup, CreateUserFromGroup } from 'src/app/admin/groups/groups';
import { CreateGroupFromUser } from 'src/app/admin/users/users';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  /*============ Show/Hide Menu Bar =============*/
  isShowMenuBar = new BehaviorSubject<boolean>(false);
  showMenuBar = this.isShowMenuBar.asObservable();

  /*============ Shared Current User Object =============*/
  private currentUserObj = new BehaviorSubject<any>(null);
  currentUser = this.currentUserObj.asObservable();

  /*============ Add Profile Maintain Routing =============*/
  isAddProfile = new BehaviorSubject<boolean>(false);

  /*============ Return To Add User ==============*/
  returnToAddUser = new BehaviorSubject<boolean>(false);

  /*============ Add Role Maintain Routing =============*/
  isAddRole = new BehaviorSubject<boolean>(false);

  /*============ Return To Add Role ==============*/
  returnToAddProfile = new BehaviorSubject<boolean>(false);

  /*============ Profile Save or Not ==============*/
  isProfileSave = new BehaviorSubject<boolean>(false);

  /*============ Role Save or Not ==============*/
  isRoleSave = new BehaviorSubject<boolean>(false);

  /*============ Change Dashboard Router-Outlet Background Color ==============*/
  isChangeBgColor = new BehaviorSubject<boolean>(false);

  /*============ User Add/Update/Cancelled Action Flag ============*/
  isUserAction = false;

  /*============ Check New User Added Flag ============*/
  isNewUserAdded = false;

  /*============ Profile Add/Update/Cancelled Action Flag ============*/
  isProfileAction = false;

  /*============ Check New Profile Added Flag ============*/
  isNewProfileAdded = false;

  /*============ Role Add/Update/Cancelled Action Flag ============*/
  isRoleAction = false;

  /*============ Check New Role Added Flag ============*/
  isNewRoleAdded = false;

  /*============ Group Add/Update/Cancelled Action Flag ============*/
  isGroupAction = false;

  /*============ Check New Group Added Flag ============*/
  isNewGroupAdded = false;

  /*============ Business Management Flow Group Add/Update/Cancelled Action Flag ============*/
  isFlowGroupAction = false;

  /*============ Add Profile From Add User Page ============*/
  isProfileAddFromUser = new BehaviorSubject<boolean>(false);
  isProfileAddedForUser = false;

  /*============ Add Role From Add Profile Page ============*/
  isRoleAddFromProfile = new BehaviorSubject<boolean>(false);
  isRoleAddedForProfile = false;

  /*============= Hide Header For MC ===============*/
  isHeader = new BehaviorSubject<boolean>(false);

  /*============= User Update From Group ===============*/
  updateGroupMember = new BehaviorSubject<any>({ isUpdate: false, groupId: '', userId: '' });
  returnToGroupPage = new BehaviorSubject<any>({ isUpdate: false, groupId: '', userId: '' });

  /*============= Update Users From Role/Profile ===============*/
  updateURPGObject = new BehaviorSubject<UpdateURPG>({
    isUpdate: false,
    isProfile: false,
    isRole: false,
    isGroup: false,
    isProfileUser: false,
    isRoleUser: false,
    userId: null,
    roleId: null,
    profileId: null,
    groupId: null,
    activeProfileId: null,
    activeRoleId: null,
    activeGroupId: null,
    isExpandPT: false,
    isExpandRT: false,
    isExpandUT: false
  });
  getURPGDetails = this.updateURPGObject.asObservable();

  returnToURPGPage = new BehaviorSubject<ReturnToURPG>({
    isReturnToProfile: false,
    isReturnToRole: false,
    isReturnToGroup: false,
    isUpdate: false,
    isProfile: false,
    isRole: false,
    isGroup: false,
    isProfileUser: false,
    isRoleUser: false,
    userId: null,
    roleId: null,
    profileId: null,
    groupId: null,
    activeProfileId: null,
    activeRoleId: null,
    activeGroupId: null,
    isExpandPT: false,
    isExpandRT: false,
    isExpandUT: false
  });
  returnToURPG = this.returnToURPGPage.asObservable();

  /*============= Create Group From Add User ===============*/
  createGroupFromUser = new BehaviorSubject<CreateGroupFromUser>(null);
  createGroup = this.createGroupFromUser.asObservable();

  returnToCreateUserPage = new BehaviorSubject<CreateGroupFromUser>(null);
  returnToUser = this.returnToCreateUserPage.asObservable();

  /*============= Create User From Group ===============*/
  createUserFromGrp = new BehaviorSubject<CreateUserFromGroup>(null);
  createGrpMember = this.createUserFromGrp.asObservable();

  returnToCreateGrpPage = new BehaviorSubject<CreateUserFromGroup>(null);
  returnToGrp = this.returnToCreateGrpPage.asObservable();

  /*============= Create Profile From Group ===============*/
  createProfileFromGrp = new BehaviorSubject<CreateProfileFromGroup>(null);
  createProfile = this.createProfileFromGrp.asObservable();

  returnToCreateGroupPage = new BehaviorSubject<CreateProfileFromGroup>(null);
  returnToGroup = this.returnToCreateGroupPage.asObservable();

  /*============= Load/Refresh System status ===============*/
  isSystemStatusLoaded = new BehaviorSubject<boolean>(false);
  systemStatusLoad = this.isSystemStatusLoaded.asObservable();

  /*============= Check Is Archive Package is Installed ===============*/
  isArchivePackageInstalled = new BehaviorSubject<boolean>(false);
  archivePackInstalled = this.isArchivePackageInstalled.asObservable();

  /*======= Get Workspace Details From Dahsboard and send to TM Page For Workspace Selection =======*/
  private workspaceDetails = new BehaviorSubject<any>(null);
  workspace = this.workspaceDetails.asObservable();

  /*============= Show Confirmation Pop up For Closed All Archive Logs Tab ============*/
  openArchiveItems = [];

  /*============= Store User Permissions Locally =============*/
  private userPermissions = [];

  private readonly userPermissionsUrl = environment.baseUrl + 'user/getUserPermissions';
  private readonly userAccessUrl = environment.baseUrl + 'user/userInfo';
  private readonly isArchivePackInstalledUrl = environment.baseUrl + 'utilityServices/isArchivePackInstalled';
  private readonly getVersionInfoUrl = environment.baseUrl + 'system/versioninfo';

  constructor(private http: HttpClient) { }

  /*======= Get Workspace Details From Dahsboard and send to TM Page For Workspace Selection =======*/
  sendWorkspaceDetails(workspace: any) {
    this.workspaceDetails.next(workspace);
  }

  /*=========== Get user permissions ============*/
  getUserPermissions(username: string, root: boolean): Observable<any> {
    return this.http.get<any>(`${this.userPermissionsUrl}/${username}/${root}`);
  }

  /*=========== Get user access ============*/
  getUserAccess(userObj: any): Observable<any> {
    return this.http.post<any>(`${this.userAccessUrl}`, userObj);
  }

  /*=========== Is Archive Packed Installed ============*/
  getVersionInfo(): Observable<any> {
    return this.http.get<any>(this.getVersionInfoUrl);
  }

    /*=========== Is Archive Packed Installed ============*/
  checkArchivePackInstalled(): Observable<boolean> {
    return this.http.get<boolean>(this.isArchivePackInstalledUrl);
  }

  /*============= Show Confirmation Pop up For Closed All Archive Logs Tab ============*/
  openArchiveTabs(openTabs: Array<any>) {
    this.openArchiveItems = [];
    this.openArchiveItems = openTabs;
  }

  getOpenArchiveTabs() {
    return this.openArchiveItems;
  }
  /*============= END Show Confirmation Pop up For Closed All Archive Logs Tab ============*/

  /*============= Show/Hide Menu Bar in Mobile View ===============*/
  showHideMenuBar(isSideBarShow: boolean) {
    this.isShowMenuBar.next(isSideBarShow);
  }

  /*============ Shared Current User Object =============*/
  shareCurrentUserObj(obj: any) {
    this.currentUserObj.next(obj);
  }

  /*============ Update User From Profile/Role =============*/
  updateURPG(obj: UpdateURPG) {
    this.updateURPGObject.next(obj);
  }

  backToURPG(obj: ReturnToURPG) {
    this.returnToURPGPage.next(obj);
  }

  createGrpFromUser(obj: CreateGroupFromUser) {
    this.createGroupFromUser.next(obj);
  }

  backToCreateUserPage(obj: CreateGroupFromUser) {
    this.returnToCreateUserPage.next(obj);
  }

  createUserFromGroup(obj: CreateUserFromGroup) {
    this.createUserFromGrp.next(obj);
  }

  backToCreateGrpPage(obj: CreateUserFromGroup) {
    this.returnToCreateGrpPage.next(obj);
  }

  createProfileFromGroup(obj: CreateProfileFromGroup) {
    this.createProfileFromGrp.next(obj);
  }

  backToCreateGroupPage(obj: CreateProfileFromGroup) {
    this.returnToCreateGroupPage.next(obj);
  }

  /*============= Load/Refresh System status ===============*/
  updateSystemStatus(isStatusUpdate: boolean) {
    this.isSystemStatusLoaded.next(isStatusUpdate);
  }

  /*============= Check Is Archive Package is Installed ===============*/
  checkArchivePackIsInstalled(isArchivePackInstalled: boolean) {
    this.isArchivePackageInstalled.next(isArchivePackInstalled);
  }

  /*============= Store User Permissions Locally =============*/
  storeUserPermissions(userPermission: string) {
    this.userPermissions.push(userPermission);
  }

  /*============= Get Local User Permissions Locally =============*/
  getLocalUserPermissions() {
    return this.userPermissions;
  }

  /*============= Clear Local User Permissions Locally =============*/
  clearLocalUserPermissions() {
    this.userPermissions = [];
  }

}
