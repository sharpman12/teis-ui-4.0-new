import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddNoteDto, CreateFolderDto, DeployUndeployItemsDto, GlobalParameter, LogMaintenance, MoveItemDto, NetUser, QueueGroup, RestartTaskDto, ScriptDto, ScriptEngineGroup, TeisItemDto, ManualAutoDeployDto, TreeItemDto, Workspace } from './appintegration';
import { LogCriteria } from 'src/app/core/model/log/LogCriteria';
import { ServiceLogs } from 'src/app/core/model/log/ServiceLogs';
import { EventLogs } from 'src/app/core/model/log/EventLogs';
import { Workspaces } from 'src/app/workspace-management/workspace-mgmt/workspaces';

@Injectable({
  providedIn: 'root'
})
export class AppIntegrationService {
  private readonly getActiveWorkspacesUrl = environment.baseUrl + 'tools/getActiveWorkspacesPreference';
  private readonly getWorkspacesByUserUrl = environment.baseUrl + 'workspaces';
  private readonly getWorkspaceItemsInfoUrl = environment.baseUrl + 'workspaces/item-info';
  private readonly getItemStatusUrl = environment.baseUrl + 'appintegration/itemTaskStatusCount';
  private readonly updateWorkspacesUrl = environment.baseUrl + 'workspaces';
  private readonly getWorkspaceTreeUrl = environment.baseUrl + 'appintegration/getWorkspaceTree';
  private readonly getWorkspaceTreeItemCountUrl = environment.baseUrl + 'appintegration/workspaceTree/itemcount';
  private readonly getTreeItemStatusUrl = environment.baseUrl + 'appintegration/treeitems/status';
  private readonly getWorkspaceFolderTreeUrl = environment.baseUrl + 'appintegration/tree/folders';
  private readonly getWorkspaceTreeToggleSearchUrl = environment.baseUrl + 'appintegration/toggle-search';
  private readonly getDeployedIntegrationByIdUrl = environment.baseUrl + 'integrations/deployed';
  private readonly getDeployedTriggerByIdUrl = environment.baseUrl + 'triggers/deployed';
  private readonly getLogReportUrl = environment.baseUrl + 'log/searchLog';
  private readonly searchLogByItemIdUrl = environment.baseUrl + 'log/searchLogByItemId';
  private readonly getLogsByTaskIdUrl = environment.baseUrl + 'log/searchLogByTaskId';
  private readonly getItemDetailsUrl = environment.baseUrl + 'log/getItemDetails';
  private readonly markTaskAsCompletedUrl = environment.baseUrl + 'taskManager/markTasksAsComplete';
  private readonly startTaskUrl = environment.baseUrl + 'tasks/start';
  private readonly restartTaskUrl = environment.baseUrl + 'taskManager/restartTask';
  private readonly restartAllTasksUrl = environment.baseUrl + 'taskManager/restartAllTasks';

  private readonly deployItemsUrl = environment.baseUrl + 'appintegration/deploy-item';
  private readonly unDeployItemsUrl = environment.baseUrl + 'appintegration/undeploy-item';

  private readonly deployVersionUrl = environment.baseUrl + 'appintegration/deployVersion';

  private readonly createFolderUrl = environment.baseUrl + 'folders';
  private readonly updateFolderUrl = environment.baseUrl + 'folders';
  private readonly deleteFolderUrl = environment.baseUrl + 'appintegration/deleteFolder';
  private readonly getFolderByIdUrl = environment.baseUrl + 'folders';

  private readonly createProcessUrl = environment.baseUrl + 'processes';
  private readonly updateProcessUrl = environment.baseUrl + 'processes';
  private readonly deleteProcessUrl = environment.baseUrl + 'processes';
  private readonly manualAutoDeployItemsUrl = environment.baseUrl + 'appintegration/deploy';
  private readonly isProcessConnectedToIntegrationUrl = environment.baseUrl + 'integrations/connected-process';
  private readonly getProcessByIdUrl = environment.baseUrl + 'processes';
  private readonly getIntegrationByIdUrl = environment.baseUrl + 'integrations';
  private readonly getIntegrationListByIdentifierIdUrl = environment.baseUrl + 'appintegration/getIntegrationListByIdentifierId';
  private readonly disabledEnabledProcessUrl = environment.baseUrl + 'appintegration/disableEnableProcess';

  private readonly getDeployedProcessByIdUrl = environment.baseUrl + 'processes/deployed';
  private readonly getIntegrationsByProcessIdUrl = environment.baseUrl + 'integrations/process';
  private readonly getDeployedIntegrationsByProcessIdUrl = environment.baseUrl + 'appintegration/getDeployedIntegrationsByProcessId';
  private readonly getProcessWorkingCopyByIdUrl = environment.baseUrl + 'processes/work-copy';
  private readonly getIntegrationWorkingCopyByIdUrl = environment.baseUrl + 'integrations/work-copy';
  private readonly getTriggerWorkingCopyByIdUrl = environment.baseUrl + 'triggers/work-copy';

  private readonly createIntegrationUrl = environment.baseUrl + 'integrations';
  private readonly updateIntegrationUrl = environment.baseUrl + 'integrations';
  private readonly deleteIntegrationUrl = environment.baseUrl + 'integrations';
  private readonly disabledEnabledIntegrationUrl = environment.baseUrl + 'appintegration/disableEnableIntegration';
  private readonly deleteIntegrationVersionsUrl = environment.baseUrl + 'appintegration/integrationVersions';

  private readonly createTriggerUrl = environment.baseUrl + 'triggers';
  private readonly updateTriggerUrl = environment.baseUrl + 'triggers';
  private readonly deleteTriggerUrl = environment.baseUrl + 'triggers';
  private readonly getTriggerByIdUrl = environment.baseUrl + 'triggers';
  private readonly disabledEnabledTriggerUrl = environment.baseUrl + 'appintegration/disableEnableTrigger';

  private readonly getAllLogMaintenanceConfigUrl = environment.baseUrl + 'configuration/getAllLogMaintenanceConfig';
  private readonly getActiveAlertProcessesUrl = environment.baseUrl + 'processes/active-alert/';
  private readonly getSEGroupsUrl = environment.baseUrl + 'configuration/getSEGroups';
  private readonly getQueueGroupDetailsUrl = environment.baseUrl + 'queues/group-details';

  private readonly getWorkspaceProcessesUrl = environment.baseUrl + 'processes/workspaces';
  private readonly getIdentifiersUrl = environment.baseUrl + 'identifiers';
  private readonly getIdentifierParametersUrl = environment.baseUrl + 'appintegration/identifiers/params';

  private readonly getAllNetUsersUrl = environment.baseUrl + 'netusers';
  private readonly verifyNetUserUrl = environment.baseUrl + 'netusers/validate/netuser';
  private readonly createNetUserUrl = environment.baseUrl + 'netusers';
  private readonly updateNetUserUrl = environment.baseUrl + 'netusers';
  private readonly deleteNetUserUrl = environment.baseUrl + 'netusers/netuser';

  private readonly getGlobalParametersUrl = environment.baseUrl + 'configuration/getGlobalParameters';
  private readonly createScriptParameterUrl = environment.baseUrl + 'configuration/createScriptParameter';
  private readonly updateScriptParameterUrl = environment.baseUrl + 'configuration/updateScriptParameter';
  private readonly deleteScriptParameterUrl = environment.baseUrl + 'configuration/deleteScriptParameter';

  private readonly getPITLockedUrl = environment.baseUrl + 'locks';
  private readonly cancelPITlockUrl = environment.baseUrl + 'locks/release';
  private readonly breakPITlockedUrl = environment.baseUrl + 'lockManager/breakLock';
  private readonly getPITLockedUserByWorkspaceIdUrl = environment.baseUrl + 'lockManager/getPITLockedUserByWorkspaceId';

  //private readonly getScriptUrl = environment.baseUrl + 'appintegration/getScripts';
  private readonly getScriptUrl = environment.baseUrl + 'scripts/app-integration';
  private readonly getScriptDetailsUrl = environment.baseUrl + 'scriptmgmt/scripts-details';
  private readonly getScriptParamsByScriptIdUrl = environment.baseUrl + 'appintegration/getScriptParamsByScriptId';
  private readonly validateItemNameUrl = environment.baseUrl + 'appintegration/validateTeisItemName';
  private readonly getTasksByItemIdUrl = environment.baseUrl + 'taskManager/getTasksByItem';
  private readonly stopTaskUrl = environment.baseUrl + 'taskManager/setTaskStatus';
  private readonly stopAllTaskUrl = environment.baseUrl + 'taskManager/stopAllTasks';
  private readonly addNoteByTaskIdsUrl = environment.baseUrl + 'taskManager/updateNoteByTaskIds';
  private readonly getVersionHistoryByTeisItemIdUrl = environment.baseUrl + 'appintegration/versions/history';
  private readonly deleteTeisItemVersionUrl = environment.baseUrl + 'appintegration/item-version';
  private readonly restoreTeisItemsUrl = environment.baseUrl + 'appintegration/restore-item';
  private readonly getProcessByVersionIdUrl = environment.baseUrl + 'processes/version';
  private readonly getIntegrationByVersionIdUrl = environment.baseUrl + 'integrations/version';
  private readonly getTriggerByVersionIdUrl = environment.baseUrl + 'triggers/version';
  private readonly moveTeisItemsUrl = environment.baseUrl + 'appintegration/items/move';
  private readonly getRootFolderInfoUrl = environment.baseUrl + 'appintegration/rootFolderInfo';
  private readonly getIntegrationsByIdentifierIdsUrl = environment.baseUrl + 'integrations/workspace';
  private readonly getWebServicesByUserUrl = environment.baseUrl + 'configuration/getActiveWebServicesAccess';
  private readonly getWebServicesByWorkspaceIdUrl = environment.baseUrl + 'appintegration/tree/webservices';
  private readonly updateAppRegistryUrl = environment.baseUrl + 'application/updateAppRegistry';
  private readonly enableDisableWebServiceUrl = environment.baseUrl + 'webservices';
  private readonly verifyNetUserConnectionUrl = environment.baseUrl + 'appintegration/verifyNetUserConnection';
  private readonly getbusinessFlowByIdsUrl = environment.baseUrl + 'businessflows';
  private readonly getWebFlowByIdUrl = environment.baseUrl + 'businessMgmt/getWebFlowById';
  private readonly getAllWebFlowUrl = environment.baseUrl + 'businessMgmt/getAllWebFlow';
  private readonly getScriptParametersUrl = environment.baseUrl + 'scripts/script/params';
  private readonly getRecentFilesUrl = environment.baseUrl + 'userSetting/user-function/values';
  private readonly getLatestVersionUrl = environment.baseUrl + 'scripts/version-info';
  private readonly getScriptDeployStatusUrl = environment.baseUrl + 'scripts/status/deploy';
  private readonly createTaskUrl = environment.baseUrl + 'taskManager/tasks';
  private readonly getDebugExeUrl = environment.baseUrl + 'taskManager/debugExecutable';
  private readonly getTaskParamsByIdUrl = environment.baseUrl + 'tasks/all-params/task';
  private readonly getValidateAccessUrl = environment.baseUrl + 'validate/access';


  /*============= Return From Other Page To Detail Page =============*/
  private isReturnFromOtherPage = new BehaviorSubject<boolean>(false);
  returnFromOtherPage = this.isReturnFromOtherPage.asObservable();

  /*============= Shared Alert Process Flag =============*/
  private isAlertProcessSelected = new BehaviorSubject<boolean>(false);
  isAlertProcess = this.isAlertProcessSelected.asObservable();

  /*============= Shared Alert Process Flag =============*/
  private isAlarmPopupOpened = new BehaviorSubject<boolean>(false);
  isAlarmPopupOpen = this.isAlarmPopupOpened.asObservable();

  /*============= Shared Identifier Flag =============*/
  private isIdentifierSelected = new BehaviorSubject<boolean>(false);
  isIdentifierSelect = this.isIdentifierSelected.asObservable();

  /*============= Shared isConfig Pending Flag =============*/
  private isConfigPending = new BehaviorSubject<boolean>(false);
  isConfigOpened = this.isConfigPending.asObservable();

  /*============= Selected Process Details For Script Parameters =============*/
  private scriptParameters = new BehaviorSubject<any>(null);
  scriptParams = this.scriptParameters.asObservable();

  /*============= Shared Deleted Script Parameters =============*/
  private deletedScriptParameters = new BehaviorSubject<any>(null);
  deletedScriptParams = this.deletedScriptParameters.asObservable();

  /*============= Shared Deleted Trigger Script Parameters =============*/
  private deletedTriggerScript = new BehaviorSubject<any>(null);
  removedTriggerScript = this.deletedTriggerScript.asObservable();

  /*============= Shared Additional Parameters =============*/
  private additionalParameters = new BehaviorSubject<Array<any>>([]);
  additionalScriptParams = this.additionalParameters.asObservable();

  /*============= Share Item Properties Details =============*/
  private propertiesDetails = new BehaviorSubject<any>(null);
  itemPropertiesDetails = this.propertiesDetails.asObservable();

  /*============= Shared Get PIT Lock Flag =============*/
  private isPITGetLocked = new BehaviorSubject<boolean>(false);
  isGetPITLocked = this.isPITGetLocked.asObservable();

  /*============= Shared Cancel PIT Lock Flag =============*/
  private isPITLockCancel = new BehaviorSubject<boolean>(false);
  isCanceledPITLock = this.isPITLockCancel.asObservable();

  /*============= Shared Newly Created or Updated PIT Item Id =============*/
  private createdUpdatedPITItemId = new BehaviorSubject<any>(null);
  createdUpdatedPITItem = this.createdUpdatedPITItemId.asObservable();

  /*============= Share Selected Identifiers Methods To Trigger Activator Tab =============*/
  private identifiersMethods = new BehaviorSubject<any>(null);
  triggerIdentifiers = this.identifiersMethods.asObservable();

  constructor(private http: HttpClient) { }

  /*============= Shared Selected Workspace Id to Another Tabs ===============*/
  sendReturnFromOtherPageFlag(isBack: boolean) {
    this.isReturnFromOtherPage.next(isBack);
  }

  /*============= Shared Alert Process Flag =============*/
  sharedAlertProcessFlag(isAlertProcess: boolean) {
    this.isAlertProcessSelected.next(isAlertProcess);
  }

  /*============= Shared Alert Process Flag =============*/
  sharedAlarmPopupOpenedFlag(isAlarmPopup: boolean) {
    this.isAlarmPopupOpened.next(isAlarmPopup);
  }

   /*============= Shared Identified Flag =============*/
  sharedIdentifierSelected(isIdentifierSelected: boolean) {
    this.isIdentifierSelected.next(isIdentifierSelected);
  }

  /*============= Shared Identified Flag =============*/
  sharedConfigPending(isConfigPending: boolean) {
    this.isConfigPending.next(isConfigPending);
  }

  /*============= Shared Selected Process Details For Get Script Parameters =============*/
  sharedScriptParams(scriptList: any) {
    this.scriptParameters.next(scriptList);
  }

  /*============= Shared Deleted Script Parameters =============*/
  sharedDeletedScriptParameters(script: any) {
    this.deletedScriptParameters.next(script)
  }

  /*============= Shared Deleted Trigger Script Parameters =============*/
  sharedDeletedTriggerScript(script: any) {
    this.deletedTriggerScript.next(script)
  }

  /*============= Shared Additional Parameters =============*/
  sharedAdditionalScriptParams(paramsList: Array<any>) {
    this.additionalParameters.next(paramsList);
  }

  /*============= Share Item Properties Details =============*/
  sharedItemPropertiesDetails(itemDetails: any) {
    this.propertiesDetails.next(itemDetails);
  }

  /*============= Shared Get PIT Lock Flag =============*/
  sharedGetPITLockFlag(isPITLocked: boolean) {
    this.isPITGetLocked.next(isPITLocked);
  }

  /*============= Shared Cancel PIT Lock Flag =============*/
  sharedCancelPITLockFlag(isPITLockCancel: boolean) {
    this.isPITLockCancel.next(isPITLockCancel);
  }

  /*============= Shared Newly Created or Updated PIT Item Id =============*/
  sharedCreatedUpdatedPITItem(item: any) {
    this.createdUpdatedPITItemId.next(item);
  }

  /*============= Share Selected Identifiers Methods To Trigger Activator Tab =============*/
  sharedIdentifiersMethods(identifiers: any) {
    this.identifiersMethods.next(identifiers);
  }

  /*========= Get Active Workspaces =========*/
  getActiveWorkspaces(): Observable<Array<Workspace>> {
    return this.http.get<Array<Workspace>>(`${this.getActiveWorkspacesUrl}`);
  }

  /*========= Get Workspaces By Username =========*/
  getWorkspacesByUsername(username: string): Observable<Array<Workspace>> {
    return this.http.get<Array<Workspace>>(`${this.getWorkspacesByUserUrl}/${username}`);
  }

  /*========= Get Workspace Item Info =========*/
  getWorkspaceItemInfo(workspaceIds: Array<any>): Observable<Workspaces[]> {
    return this.http.post<Workspaces[]>(`${this.getWorkspaceItemsInfoUrl}`, workspaceIds);
  }

  /*========= Get Workspace Item Info =========*/
  getPITItemStatus(itemIds: number): Observable<any> {
    return this.http.get<any>(`${this.getItemStatusUrl}/${itemIds}`);
  }

  /*========= Update Workspaces =========*/
  updateWorkspace(workspaceDto: Workspace): Observable<Workspace> {
    return this.http.put<Workspace>(this.updateWorkspacesUrl, workspaceDto);
  }

  /*========== Get Workspace Tree By Status ==========*/
  getWorkspaceTree(taskDetailsDto: any): Observable<any> {
    return this.http.post(this.getWorkspaceTreeUrl, taskDetailsDto);
  }
  
  /*========== Get Workspace Tree Item Count ==========*/
  getWorkspaceTreeItemCount(taskDetailsDto: any): Observable<any> {
     return this.http.post(this.getWorkspaceTreeItemCountUrl, taskDetailsDto);
  }

  /*========== Get Workspace Tree By Status ==========*/
  getTreeItemStatus(taskDetailsDto: any): Observable<any> {
    return this.http.post(this.getTreeItemStatusUrl, taskDetailsDto);
  }


  /*========== Get Workspace Tree By Status ==========*/
  getWorkspaceFolderTree(taskDetailsDto: any): Observable<any> {
    return this.http.post(this.getWorkspaceFolderTreeUrl, taskDetailsDto);
  }

  /*========== Get Workspace Tree By Status ==========*/
  getWorkspaceTreeToggleSearch(taskDetailsDto: any): Observable<any> {
    return this.http.post(this.getWorkspaceTreeToggleSearchUrl, taskDetailsDto);
  }

  /*========== Get Deployed Integration By Id ==========*/
  getDeployedIntegrationById(integrationId: number): Observable<any> {
    return this.http.get(`${this.getDeployedIntegrationByIdUrl}/${integrationId}`);
  }

  /*========== Get Process By Id ==========*/
  getProcessById(processId: number): Observable<any> {
    return this.http.get<any>(`${this.getProcessByIdUrl}/${processId}`);
  }

  /*========== Get Integration By Id ==========*/
  getIntegrationById(integrationId: number): Observable<any> {
    return this.http.get<any>(`${this.getIntegrationByIdUrl}/${integrationId}`);
  }

  /*========== Get Integration By Id ==========*/
  getIntegrationListByIdentifierId(workspaceId: number, identifierId: number): Observable<any> {
    return this.http.get<any>(`${this.getIntegrationListByIdentifierIdUrl}/${workspaceId}/${identifierId}`);
  }

  /*========== Get Trigger By Id ==========*/
  getTriggerById(triggerId: number): Observable<any> {
    return this.http.get<any>(`${this.getTriggerByIdUrl}/${triggerId}`);
  }

  /*========== Get Deployed Process By Id ==========*/
  getDeployedProcessById(processId: number): Observable<any> {
    return this.http.get<any>(`${this.getDeployedProcessByIdUrl}/${processId}`);
  }

  /*========== Get Integration Process By Id ==========*/
  getIntegrationProcessById(workspaceId: number, processId: number): Observable<any> {
    return this.http.get(`${this.getIntegrationsByProcessIdUrl}/${workspaceId}/${processId}`);
  }

  /*========== Get Deployed Integration Process By Id ==========*/
  getDeployedIntegrationProcessById(processId: number): Observable<any> {
    return this.http.get(`${this.getDeployedIntegrationsByProcessIdUrl}/${processId}`);
  }

  /*========== Get Process Working Copy By Id ==========*/
  getProcessWorkingCopyById(processId: number): Observable<any> {
    return this.http.get<any>(`${this.getProcessWorkingCopyByIdUrl}/${processId}`);
  }

  /*========== Get Integration Working Copy By Id ==========*/
  getIntegrationWorkingCopyById(integrationId: number): Observable<any> {
    return this.http.get<any>(`${this.getIntegrationWorkingCopyByIdUrl}/${integrationId}`);
  }

  /*========== Get Integration Working Copy By Id ==========*/
  getTriggerWorkingCopyById(triggerId: number): Observable<any> {
    return this.http.get<any>(`${this.getTriggerWorkingCopyByIdUrl}/${triggerId}`);
  }

  /*========== Get Deployed Trigger By Id ==========*/
  getDeployedTriggerById(triggerId: number): Observable<any> {
    return this.http.get(`${this.getDeployedTriggerByIdUrl}/${triggerId}`);
  }

  /*========== Get Service Log ==========*/
  getServiceLog(criteria: LogCriteria): Observable<ServiceLogs> {
    return this.http.post<ServiceLogs>(this.getLogReportUrl, criteria);
  }

  /*========== Get Service Log By Item Id ==========*/
  getServiceLogByItemId(criteria: LogCriteria): Observable<ServiceLogs> {
    return this.http.post<ServiceLogs>(this.searchLogByItemIdUrl, criteria);
  }

  getServiceLogsByTaskId(criteria: LogCriteria): Observable<ServiceLogs> {
    return this.http.post<ServiceLogs>(this.getLogsByTaskIdUrl, criteria);
  }

  getItemDetailsById(itemId: any): Observable<any> {
    return this.http.get<any>(`${this.getItemDetailsUrl}/${itemId}`);
  }

  /*========== Get Event Log ==========*/
  getEventLog(criteria: LogCriteria): Observable<EventLogs> {
    return this.http.post<EventLogs>(this.getLogReportUrl, criteria);
  }

  /*========== Get Event Log By Item Id ==========*/
  getEventLogByItemId(criteria: LogCriteria): Observable<EventLogs> {
    return this.http.post<EventLogs>(this.searchLogByItemIdUrl, criteria);
  }

  /*========== Marked Task As Completed ==========*/
  markTaskAsCompleted(taskDetailsDto: any): Observable<any> {
    return this.http.post<any>(this.markTaskAsCompletedUrl, taskDetailsDto);
  }

  /*========== Start Task ==========*/
  startTask(startTaskDetailsDto: any): Observable<any> {
    return this.http.post<any>(this.startTaskUrl, startTaskDetailsDto);
  }

  /*========== Deploy Items ==========*/
  deployItems(deployItemsDto: DeployUndeployItemsDto, itemTreeType?: string, itemId?: number, itemType?: string): Observable<any> {
    return this.http.post<DeployUndeployItemsDto>(`${this.deployItemsUrl}/${itemTreeType}/${itemId}/${itemType}`, deployItemsDto);
  }

  /*========== Deploy Integration Items ==========*/
  deployVersion(deployItemsDto: DeployUndeployItemsDto): Observable<any> {
    return this.http.post<DeployUndeployItemsDto>(this.deployVersionUrl, deployItemsDto);
  }

  /*========== Undeploy Items ==========*/
  unDeployItems(unDeployItemsDto: DeployUndeployItemsDto, itemTreeType?: string, itemId?: number, itemType?: string): Observable<any> {
    return this.http.post<DeployUndeployItemsDto>(`${this.unDeployItemsUrl}/${itemTreeType}/${itemId}/${itemType}`, unDeployItemsDto);
  }

  /*========= Create Folder =========*/
  createFolder(createFolderDto: CreateFolderDto): Observable<any> {
    return this.http.post<CreateFolderDto>(this.createFolderUrl, createFolderDto);
  }

  /*========= Update Folder =========*/
  updateFolder(updateFolderDto: CreateFolderDto): Observable<any> {
    return this.http.put<CreateFolderDto>(this.updateFolderUrl, updateFolderDto);
  }

  /*========== Delete Folder ==========*/
  deleteFolder(workspaceId: number, teisitemtype: string, folderId: number, removeAllTask: boolean): Observable<any> {
    return this.http.delete(`${this.deleteFolderUrl}/${workspaceId}/${teisitemtype}/${folderId}`);
  }

  /*========== Get Folder By Id ==========*/
  getFolderById(folderId: number): Observable<any> {
    return this.http.get<any>(`${this.getFolderByIdUrl}/${folderId}`);
  }

  /*========== Get Log All Maintenance Config ==========*/
  getAllLogMaintenancesConfig(): Observable<[LogMaintenance]> {
    return this.http.get<[LogMaintenance]>(`${this.getAllLogMaintenanceConfigUrl}`);
  }

  /*========== Get Alert Processes ==========*/
  getActiveAlertProcesses(workspaceId: number): Observable<any> {
    return this.http.get<any>(`${this.getActiveAlertProcessesUrl}/${workspaceId}`);
  }

  /*========== Get Script Engine Groups ==========*/
  getSEGroups(): Observable<[ScriptEngineGroup]> {
    return this.http.get<[ScriptEngineGroup]>(`${this.getSEGroupsUrl}`);
  }

  /*========== Get Script Engine Groups ==========*/
  getQueueGroups(): Observable<[QueueGroup]> {
    return this.http.get<[QueueGroup]>(`${this.getQueueGroupDetailsUrl}`);
  }

  /*========== Get Workspace Processes ==========*/
  getWSProcesses(workspaceId: number): Observable<any> {
    return this.http.get<any>(`${this.getWorkspaceProcessesUrl}/${workspaceId}`);
  }

  /*========== Get Identifiers ==========*/
  getIdentifiers(): Observable<any> {
    return this.http.get<any>(`${this.getIdentifiersUrl}`);
  }

  /*========== Get Parameters By Identifiers Id ==========*/
  getParametersByIdentifiersId(identifierId: number): Observable<any> {
    return this.http.get<any>(`${this.getIdentifierParametersUrl}/${identifierId}`);
  }

  /*========== Get All Net Users ==========*/
  getNetUsers(workspaceId: number): Observable<[NetUser]> {
    return this.http.get<[NetUser]>(`${this.getAllNetUsersUrl}/${workspaceId}`);
  }

  /*========== Verify Net Users ==========*/
  verifyNetUser(netUserDto: NetUser): Observable<any> {
    return this.http.post<NetUser>(this.verifyNetUserUrl, netUserDto);
  }

  /*========== Create Net Users ==========*/
  createNetUser(netUserDto: NetUser): Observable<any> {
    return this.http.post<NetUser>(this.createNetUserUrl, netUserDto);
  }

  /*========== Update Net Users ==========*/
  updateNetUser(netUserDto: NetUser): Observable<any> {
    return this.http.put<NetUser>(this.updateNetUserUrl, netUserDto);
  }

  /*========== Delete Net Users ==========*/
  deleteNetUser(netUserId: number): Observable<any> {
    return this.http.delete<any>(`${this.deleteNetUserUrl}/${netUserId}`);
  }

  /*========== Get All Net Users ==========*/
  getGlobalParameters(workspaceId: number): Observable<[any]> {
    return this.http.get<[any]>(`${this.getGlobalParametersUrl}/${workspaceId}`);
  }

  /*========== Create Global Parameters ==========*/
  createGlobalParameter(globalParamsDto: GlobalParameter): Observable<any> {
    return this.http.post<GlobalParameter>(this.createScriptParameterUrl, globalParamsDto);
  }

  /*========== Update Global Parameters ==========*/
  updateGlobalParameter(globalParamsDto: GlobalParameter): Observable<any> {
    return this.http.post<GlobalParameter>(this.updateScriptParameterUrl, globalParamsDto);
  }

  /*========== Delete Net Users ==========*/
  deleteGlobalParameter(paramId: number): Observable<any> {
    return this.http.delete<any>(`${this.deleteScriptParameterUrl}/${paramId}`);
  }

  /*========== Get Script ==========*/
  getScript(workspaceId: number, scriptType: string): Observable<any> {
    return this.http.get(`${this.getScriptUrl}/${workspaceId}/${scriptType}`);
  }

    /*========== Get Script Details ==========*/
  getScriptDetails(scriptId: any): Observable<any> {
    return this.http.post<any>(`${this.getScriptDetailsUrl}`, scriptId);
  }

  /*========== Get Script Parameters By Script Id ==========*/
  getScriptParametersById(scriptId: number): Observable<any> {
    return this.http.get(`${this.getScriptParamsByScriptIdUrl}/${scriptId}`);
  }

  /*========== Validate Item Name ==========*/
  validateItemName(treeItemDto: TreeItemDto): Observable<any> {
    return this.http.post<any>(`${this.validateItemNameUrl}`, treeItemDto);
  }

  /*========== Create Process ==========*/
  createProcess(createProcessDto: TeisItemDto): Observable<any> {
    return this.http.post<any>(this.createProcessUrl, createProcessDto);
  }

  /*========== Update Process ==========*/
  updateProcess(updateProcessDto: TeisItemDto): Observable<any> {
    return this.http.put<any>(this.updateProcessUrl, updateProcessDto);
  }

  /*========== Manual/Auto Deploy Process Item ==========*/
  manualAutoDeployItems(manualAutoDeployDto: ManualAutoDeployDto): Observable<any> {
    return this.http.post<any>(`${this.manualAutoDeployItemsUrl}`, manualAutoDeployDto);
  }

  /*========== Delete Prccess ==========*/
  deleteProcessItem(workspaceId: number, processId: number, removeAllTask: boolean): Observable<any> {
    return this.http.delete(`${this.deleteProcessUrl}/${workspaceId}/${processId}/${removeAllTask}`);
  }

  /*========== Enabled / Disabled Prccess ==========*/
  enabledDisabledProcess(processId: number, isDisable: boolean): Observable<any> {
    return this.http.get<any>(`${this.disabledEnabledProcessUrl}/${processId}/${isDisable}`);
  }

  /*========== Check Process is Connected To the Integration ==========*/
  checkProcessConnectedToIntegration(processId: number): Observable<any> {
    return this.http.get<any>(`${this.isProcessConnectedToIntegrationUrl}/${processId}`);
  }

  /*========== Create Integration ==========*/
  createIntegration(createIntegrationDto: TeisItemDto): Observable<any> {
    return this.http.post<any>(this.createIntegrationUrl, createIntegrationDto);
  }

  /*========== Create Trigger ==========*/
  createTrigger(createTriggerDto: TeisItemDto): Observable<any> {
    return this.http.post<any>(this.createTriggerUrl, createTriggerDto);
  }

  /*========== Update Integration ==========*/
  updateIntegration(updateIntegrationDto: TeisItemDto): Observable<any> {
    return this.http.put<any>(this.updateIntegrationUrl, updateIntegrationDto);
  }

  /*========== Delete Integration version ==========*/
  deleteIntegrationVersions(integrationId: number): Observable<any> {
    return this.http.delete(`${this.deleteIntegrationVersionsUrl}/${integrationId}`);
  }

  /*========== Update Trigger ==========*/
  updateTrigger(updateTriggerDto: TeisItemDto): Observable<any> {
    return this.http.put<any>(this.updateTriggerUrl, updateTriggerDto);
  }

  /*========== Delete Integration ==========*/
  deleteIntegrationItem(workspaceId: number, processId: number, removeAllTask: boolean): Observable<any> {
    return this.http.delete(`${this.deleteIntegrationUrl}/${workspaceId}/${processId}/${removeAllTask}`);
  }

  /*========== Enabled / Disabled Integration ==========*/
  enabledDisabledIntegration(integrationId: number, isDisable: boolean): Observable<any> {
    return this.http.get<any>(`${this.disabledEnabledIntegrationUrl}/${integrationId}/${isDisable}`);
  }

  /*========== Delete Trigger ==========*/
  deleteTriggerItem(workspaceId: number, processId: number, removeAllTask: boolean): Observable<any> {
    return this.http.delete(`${this.deleteTriggerUrl}/${workspaceId}/${processId}/${removeAllTask}`);
  }

  /*========== Enabled / Disabled Trigger ==========*/
  enabledDisabledTrigger(triggerId: number, isDisable: boolean): Observable<any> {
    return this.http.get<any>(`${this.disabledEnabledTriggerUrl}/${triggerId}/${isDisable}`);
  }

  /*========== Get Task List By Item Id ==========*/
  getTaskListByItemId(itemId: number, executionState: string): Observable<any> {
    return this.http.get(`${this.getTasksByItemIdUrl}/${itemId}/${executionState}`);
  }

  /*========== Set Task Status ==========*/
  stopTask(taskUpdateDto: any): Observable<any> {
    return this.http.post<any>(this.stopTaskUrl, taskUpdateDto);
  }

  /*========== Stop All Task Status ==========*/
  stopAllTask(taskUpdateDto: any): Observable<any> {
    return this.http.post<any>(this.stopAllTaskUrl, taskUpdateDto);
  }

  /*========== Add Note By Task Id ==========*/
  addNoteByTaskId(addNoteDto: AddNoteDto): Observable<any> {
    return this.http.post<any>(this.addNoteByTaskIdsUrl, addNoteDto);
  }

  /*========== Restart Task ==========*/
  restartTask(restartTaskDto: any): Observable<any> {
    return this.http.post<any>(this.restartTaskUrl, restartTaskDto);
  }

  /*========== Restart All Task ==========*/
  restartAllTasks(restartTaskDto: RestartTaskDto): Observable<any> {
    return this.http.post<any>(this.restartAllTasksUrl, restartTaskDto);
  }

  /*========== Get Version History ==========*/
  getVersionHistory(workspaceId: number, teisItemType: string, teisItemId: number): Observable<any> {
    return this.http.get<any>(`${this.getVersionHistoryByTeisItemIdUrl}/${workspaceId}/${teisItemType}/${teisItemId}`);
  }

  /*========== Delete Version ==========*/
  deleteItemVersion(teisItemVersionId: number, teisItemType: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteTeisItemVersionUrl}/${teisItemVersionId}/${teisItemType}`);
  }

  /*========== Restore Version History ==========*/
  restoreVersionHistory(teisItemId: number, teisItemType: string, versionNumber: number): Observable<any> {
    return this.http.get<any>(`${this.restoreTeisItemsUrl}/${teisItemId}/${teisItemType}/${versionNumber}`);
  }

  /*========== Get PIT Lock User Information ==========*/
  getPITLockUserInfoByWorkspaceId(workspaceId: number): Observable<any> {
    return this.http.get<any>(`${this.getPITLockedUserByWorkspaceIdUrl}/${workspaceId}`);
  }

  /*========== Get PIT Lock ==========*/
  getPITLock(workspaceId: number, teisItemId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.getPITLockedUrl}/${workspaceId}/${teisItemId}/${teisItemType}`);
  }

  /*========== Get PIT Lock ==========*/
  cancelPITLock(workspaceId: number, teisItemId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.cancelPITlockUrl}/${workspaceId}/${teisItemId}/${teisItemType}`);
  }

  /*========== Break PIT Lock ==========*/
  breakPITLock(workspaceId: number, teisItemId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.breakPITlockedUrl}/${workspaceId}/${teisItemId}/${teisItemType}`);
  }

  /*========== Get Process By Version Id ==========*/
  getProcessByVersionId(processVersionId: number): Observable<any> {
    return this.http.get<any>(`${this.getProcessByVersionIdUrl}/${processVersionId}`);
  }

  /*========== Get Integration By Version Id ==========*/
  getIntegrationByVersionId(integrationVersionId: number): Observable<any> {
    return this.http.get<any>(`${this.getIntegrationByVersionIdUrl}/${integrationVersionId}`);
  }

  /*========== Get Trigger By Version Id ==========*/
  getTriggerByVersionId(triggerVersionId: number): Observable<any> {
    return this.http.get<any>(`${this.getTriggerByVersionIdUrl}/${triggerVersionId}`);
  }

  /*========== Move Item ==========*/
  moveItem(moveItemDto: MoveItemDto): Observable<any> {
    return this.http.post<any>(this.moveTeisItemsUrl, moveItemDto);
  }

  /*========== Get Root Folder Info ==========*/
  getRootItemInfo(workspaceId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.getRootFolderInfoUrl}/${workspaceId}/${teisItemType}`);
  }

  /*========== Get Integrations By Identifiers Ids ==========*/
  getIntByIdentifiers(workspaceId: any, identifierIds: Array<string>): Observable<any> {
    return this.http.post<any>(`${this.getIntegrationsByIdentifierIdsUrl}/${workspaceId}`, identifierIds);
  }

  /*========= Get Web Services By User =========*/
  getWebServices(): Observable<any> {
    return this.http.get<any>(`${this.getWebServicesByUserUrl}`);
  }

  /*========= Get Web Services By User =========*/
  // getWebServiceTreeByWorkspaceId(workspaceId: number): Observable<any> {
  //   return this.http.get<any>(`${this.getWebServicesByWorkspaceIdUrl}/${workspaceId}`);
  // }

  getWebServiceTree(taskDetailsDto: any): Observable<any> {
    return this.http.post(this.getWebServicesByWorkspaceIdUrl, taskDetailsDto);
  }

  /*========= Enable/Disable Web Service =========*/
  enableDisableWebService(webServiceId: number, isDisable: boolean): Observable<any> {
   // return this.http.get<any>(`${this.enableDisableWebServiceUrl}/${webServiceId}/${isDisable}`);
   return this.http.patch<any>(`${this.enableDisableWebServiceUrl}/${webServiceId}/${isDisable}`,{});
  }

  /*========= Verify Net User Connection =========*/
  verifyNetUserConnection(dto: any): Observable<any> {
    return this.http.post(this.verifyNetUserConnectionUrl, dto);
  }

  updateAppRegistry(updateServicesDto: any): Observable<any> {
    return this.http.post(this.updateAppRegistryUrl, updateServicesDto);
  }

  getBusinessFlowByIds(activityModelId: string, webFlowId: string): Observable<any> {
    return this.http.get<any>(`${this.getbusinessFlowByIdsUrl}/${activityModelId}/${webFlowId}`);
  }

  /*========= Get FLow Type By Id =========*/
  getWebFlowById(id: string): Observable<any> {
    return this.http.get<any>(`${this.getWebFlowByIdUrl}/${id}`);
  }

  /*========= Get All Web Flow =========*/
  getAllWebFlow(flowIds: Array<any>): Observable<Array<any>> {
    return this.http.post<Array<any>>(`${this.getAllWebFlowUrl}`, flowIds);
  }

  /*========= Get Parameters =========*/
  getScriptParameters(workspaceId: number, scriptId: number): Observable<Array<ScriptDto>> {
    return this.http.get<Array<ScriptDto>>(`${this.getScriptParametersUrl}/${workspaceId}/${scriptId}`);
  }

  /*========== Get Recent File ===========*/
  getRecentFiles(param: string): Observable<any> {
    return this.http.get<any>(`${this.getRecentFilesUrl}/${param}`);
  }

  /*========== Get Latest Version Of PIT and Scripts ===========*/
  getLatestVersionInfo(itemId: string, itemType: string): Observable<any> {
    return this.http.get<any>(`${this.getLatestVersionUrl}/${itemId}/${itemType}`);
  }

  /*========== Get Script Deploy Status ===========*/
  getScriptDeployStatus(scriptIds: any): Observable<any> {
    return this.http.post<any>(`${this.getScriptDeployStatusUrl}`, scriptIds);
  }

  /*========== Create Task ===========*/
  createTask(taskObj: any): Observable<any> {
    return this.http.post<any>(`${this.createTaskUrl}`, taskObj);
  }

  /*========== Get Debug Executables ===========*/
  getDebugExe(taskObj: any): Observable<any> {
    return this.http.post<any>(`${this.getDebugExeUrl}`, taskObj);
  }

  /*========== Get Task Details By Task Id ==========*/
  getTaskParametersByTaskId(taskId: string): Observable<any> {
    return this.http.get(`${this.getTaskParamsByIdUrl}/${taskId}`);
  }

  /*========== Get Debug Executables ===========*/
  getValidateAccess(ValidateObj: any): Observable<any> {
    return this.http.post<any>(`${this.getValidateAccessUrl}`, ValidateObj);
  }

}
