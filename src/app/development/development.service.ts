import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Workspace, ScriptDto } from '../application-integration/app-integration/appintegration';
import { CreateScriptDto, ExportScript, RemoveScriptDto, WinwrapRequestDto } from './development';


@Injectable({
  providedIn: 'root'
})
export class DevelopmentService {
  private readonly getWorkspacesByUserUrl = environment.baseUrl + 'workspaces';

  private readonly getScriptByIdUrl = environment.baseUrl + 'taskManager/getScriptById';

  private readonly getScriptsUrl = environment.baseUrl + 'scriptmgmt/development/scripts';

  private readonly getAllScriptUrl = environment.baseUrl + 'scriptmgmt/scripts';
  private readonly validateScriptNameUrl = environment.baseUrl + 'scriptmgmt/validateScriptName';
  private readonly createScriptUrl = environment.baseUrl + 'scriptmgmt/script';
  private readonly createScriptFromExistingScriptUrl = environment.baseUrl + 'scriptmgmt/existingScript';
  private readonly isScriptConnectedToPITUrl = environment.baseUrl + 'scriptmgmt/isScriptConnectedToTIP';
  private readonly removeScriptUrl = environment.baseUrl + 'scriptmgmt/userDefinedScript';
  private readonly updateScriptUrl = environment.baseUrl + 'scriptmgmt/updateScript';
  private readonly saveScriptParameterUrl = environment.baseUrl + 'scriptmgmt/parameters/scriptParameter';

  private readonly getScriptVersionHistoryUrl = environment.baseUrl + 'version-history';
  private readonly getScriptVersionByIdUrl = environment.baseUrl + 'scriptmgmt/scriptVersion';
  private readonly deleteScriptVersionByIdUrl = environment.baseUrl + 'scriptmgmt/scriptVersion';
  private readonly restoreScriptVersionByIdUrl = environment.baseUrl + 'scriptmgmt/restoreExecutable';
  private readonly deployScriptVersionByIdUrl = environment.baseUrl + 'scriptmgmt/deployScript';
  private readonly exportScriptUrl = environment.baseUrl + 'scriptmgmt/script/export';
  private readonly getConnectedPITItemsUrl = environment.baseUrl + 'scriptmgmt/scripts/connected';
  private readonly validateScriptUrl = environment.baseUrl + 'scriptmgmt/scriptContent/param/validate';
  private readonly getLatestVersionUrl = environment.baseUrl + 'scriptmgmt/scripts/version-info';
  private readonly importScriptUrl = environment.baseUrl + 'scriptmgmt/script/import';
  private readonly getDebugParamsUrl = environment.baseUrl + 'scriptmgmt/debug-parameters';
  private readonly saveDebugParamsUrl = environment.baseUrl + 'scriptmgmt/map/debug-parameters';
  private readonly getAdditionalInfoUrl = environment.baseUrl + 'scriptmgmt/additional/info';

  private readonly getLockInfoUrl = environment.baseUrl + 'lockManager/getTeisItemLockInfo';
  private readonly getLockedUrl = environment.baseUrl + 'lockManager/lock';
  private readonly cancellockUrl = environment.baseUrl + 'lockManager/unlock';
  private readonly breaklockedUrl = environment.baseUrl + 'lockManager/breakLock';

  private readonly getRecentScriptsUrl = environment.baseUrl + 'appintegration/getScriptsFromUserSettings';
  private readonly getAllScriptsByWorkspaceIdUrl = environment.baseUrl + 'appintegration/getScripts';
  private readonly createRecentScriptsUrl = environment.baseUrl + 'appintegration/createRecentScript';

  private readonly getAllocatedIdsUrl = environment.baseUrl + 'winwrapservices/allocatedIds';
  private readonly closedTabsUrl = environment.baseUrl + 'winwrapservices/releaseAllocation';
  private readonly getParametersByIdUrl = environment.baseUrl + 'winwrapservices/clientid-parameters';
  private readonly attachSysLibUrl = environment.baseUrl + 'winwrapservices/attach-syslibs';
  private readonly getReferencesUrl = environment.baseUrl + 'winwrapservices/references';
  private readonly attachReferencesUrl = environment.baseUrl + 'winwrapservices/attach-references';
  private readonly getScriptParsedParametersUrl = environment.baseUrl + 'winwrapservices/parsed-parameters';

  private readonly createUpdateSystemLibUrl = environment.baseUrl + 'syslibmgmt/systemLibrary';
  private readonly updateSystemLibByIdUrl = environment.baseUrl + 'syslibmgmt/systemLibraryUpdate';
  private readonly deleteSystemLibByIdUrl = environment.baseUrl + 'syslibmgmt/systemLibrary';
  private readonly getSystemLibByIdUrl = environment.baseUrl + 'syslibmgmt/systemLibrary';
  private readonly getSystemLibsUrl = environment.baseUrl + 'syslibmgmt/systemLibraries';
  private readonly getSysLibConnectionStatusUrl = environment.baseUrl + 'syslibmgmt/systemLibraryConnectStatus';
  private readonly getScriptVersionInfoByIdUrl = environment.baseUrl + 'syslibmgmt/scriptVersion';
  private readonly validateSysLibScriptUrl = environment.baseUrl + 'syslibmgmt/sysLibContent/param/validate';
  private readonly getSysLibStatusUrl = environment.baseUrl + 'syslibmgmt/systemLibraries/status';

  private readonly getScriptEngineInfoUrl = environment.baseUrl + 'configuration/scriptengines/info';
  private readonly getScriptEngineGroupsUrl = environment.baseUrl + 'configuration/getSEGroups';


  constructor(private http: HttpClient) { }

  /*========= Get Workspaces By Username =========*/
  getWorkspacesByUsername(username: string): Observable<Array<Workspace>> {
    return this.http.get<Array<Workspace>>(`${this.getWorkspacesByUserUrl}/${username}`);
  }

  /*========== Get Script By Id =========*/
  getScriptById(scriptId: string, teisItemType: string, workspaceId: any): Observable<any> {
    return this.http.get<any>(`${this.getScriptByIdUrl}/${scriptId}/${teisItemType}/${workspaceId}`);
  }

  /*========== Get Deployed Script By Id =========*/
  getDeployedScriptById(scriptId: string, teisItemType: string, workspaceId: any, deployed: boolean): Observable<any> {
    return this.http.get<any>(`${this.getAllScriptUrl}/${scriptId}/${teisItemType}/${workspaceId}/${deployed}`);
  }

  /*========= Get Scripts/Template List For Create Script From Existing Script/Template =========*/
  getScripts(scriptType: string, isUserScript: boolean, itemType: string, workspaceId: string): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${this.getScriptsUrl}/${scriptType}/${isUserScript}/${itemType}/${workspaceId}`);
  }

  /*========= Get All Scripts =========*/
  getAllScripts(workspaceId: number, scriptTypes: string, requireTemplateScript: boolean): Observable<Array<ScriptDto>> {
    return this.http.get<Array<ScriptDto>>(`${this.getAllScriptUrl}/${workspaceId}/${scriptTypes}/${requireTemplateScript}`);
  }

  /*========= Get Scripts By WorksapceId =========*/
  getScriptsByWorkspaceId(workspaceId: number, scriptType: string): Observable<any> {
    return this.http.get<any>(`${this.getAllScriptsByWorkspaceIdUrl}/${workspaceId}/${scriptType}`);
  }

  /*========= Validate Script Name =========*/
  validateScriptName(scriptObj: any): Observable<any> {
    return this.http.post<any>(`${this.validateScriptNameUrl}`, scriptObj);
  }

  /*========= Create Script =========*/
  createScript(workspaceId: number, createScriptDto: CreateScriptDto): Observable<any> {
    return this.http.post<any>(`${this.createScriptUrl}/${workspaceId}`, createScriptDto);
  }

  /*========= Create Script From Existing Script =========*/
  createScriptFromExisting(createScriptDto: any): Observable<any> {
    return this.http.post<any>(`${this.createScriptFromExistingScriptUrl}`, createScriptDto);
  }

  /*========= Update Script =========*/
  updateScript(workspaceId: number, updateScriptDto: CreateScriptDto, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.updateScriptUrl}/${workspaceId}`, updateScriptDto, { headers });
  }

  /*========= Check Script is Connected to any PIT Items =========*/
  scriptConnectedToPIT(scriptId: number): Observable<any> {
    return this.http.get<any>(`${this.isScriptConnectedToPITUrl}/${scriptId}`);
  }

  /*========= Create Recent Scripts =========*/
  createRecentScripts(scriptId: number): Observable<any> {
    return this.http.get<any>(`${this.createRecentScriptsUrl}/${scriptId}`);
  }

  /*========= Save Script Parameters =========*/
  saveScriptParameters(workspaceId: number, paramsDto: any): Observable<any> {
    return this.http.post<any>(`${this.saveScriptParameterUrl}/${workspaceId}`, paramsDto);
  }

  /*========= Update Script Parameters =========*/
  updateScriptParameters(workspaceId: number, paramsDto: any): Observable<any> {
    return this.http.put<any>(`${this.saveScriptParameterUrl}/${workspaceId}`, paramsDto);
  }

  /*========= Remove Script =========*/
  removeScript(workspaceId: number, scriptId: number, softDelete: boolean, isUserDefinedScript: boolean): Observable<any> {
    return this.http.delete<any>(`${this.removeScriptUrl}/${workspaceId}/${scriptId}/${softDelete}/${isUserDefinedScript}`);
  }

  /*========= Create System Library =========*/
  createSystemLib(createScriptDto: CreateScriptDto, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.createUpdateSystemLibUrl}`, createScriptDto, { headers });
  }

  /*========= Update System Library =========*/
  updateSystemLib(sysLibId: number, updateScriptDto: CreateScriptDto, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.createUpdateSystemLibUrl}/${sysLibId}`, updateScriptDto, { headers });
  }

  /*========= Delete System Library =========*/
  deleteSysLibById(scriptId: number, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.delete<any>(`${this.deleteSystemLibByIdUrl}/${scriptId}`, { headers });
  }

  /*========= Get System Library =========*/
  getSystemLibraries(): Observable<any> {
    return this.http.get<any>(`${this.getSystemLibsUrl}`);
  }

  /*========= Get System Library By Id =========*/
  getSystemLibraryById(sysLibId: string, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.get<any>(`${this.getSystemLibByIdUrl}/${sysLibId}`, { headers });
  }

  /*========= Get Deployed System Library By Id =========*/
  getDeployedSystemLibraryById(sysLibId: string, isDeployed: boolean): Observable<any> {
    return this.http.get<any>(`${this.getSystemLibsUrl}/${sysLibId}/${isDeployed}`);
  }

  /*========= Get System Library Connection Status =========*/
  getSysLibConnectionStatusById(scriptId: number): Observable<any> {
    return this.http.get<any>(`${this.getSysLibConnectionStatusUrl}/${scriptId}`);
  }

  /*========= Get Script Lock Info =========*/
  getScriptLockInfo(workspaceId: number, teisItemId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.getLockInfoUrl}/${workspaceId}/${teisItemId}/${teisItemType}`);
  }

  /*========== Get Script Lock ==========*/
  getScriptLock(workspaceId: number, teisItemId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.getLockedUrl}/${workspaceId}/${teisItemId}/${teisItemType}`);
  }

  /*========== Get Script Lock ==========*/
  cancelScriptLock(workspaceId: number, teisItemId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.cancellockUrl}/${workspaceId}/${teisItemId}/${teisItemType}`);
  }

  /*========== Break Script Lock ==========*/
  breakScriptLock(workspaceId: number, teisItemId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.breaklockedUrl}/${workspaceId}/${teisItemId}/${teisItemType}`);
  }

  /*========= Get Script Version Info =========*/
  getScriptVersionInfo(workspaceId: number, scriptId: number, teisItemType: string, workingCopyRequired: boolean): Observable<any> {
    return this.http.get<any>(`${this.getScriptVersionHistoryUrl}/${workspaceId}/${scriptId}/${teisItemType}/${workingCopyRequired}`);
  }

  /*========= Get Recent Scripts =========*/
  getRecentScripts(module: string, path: string, param: string): Observable<any> {
    return this.http.get<any>(`${this.getRecentScriptsUrl}/${module}/${path}/${param}`);
  }

  /*========= Get Allocated Ids By ClientIds =========*/
  getAllocatedIdsByClientId(allocatedIdsObj: any, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.getAllocatedIdsUrl}`, allocatedIdsObj, { headers });
  }

  /*========= Closed Tab By Tab Id =========*/
  closeTab(closeTabObj: any, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.closedTabsUrl}`, closeTabObj, { headers });
  }

  /*========= Get Script Version By Id =========*/
  getScriptVersionInfoById(versionScriptId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.getScriptVersionInfoByIdUrl}/${versionScriptId}/${teisItemType}`);
  }

  /*========= Get Script Version By Id =========*/
  getScriptVersionById(versionScriptId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.getScriptVersionByIdUrl}/${versionScriptId}/${teisItemType}`);
  }

  /*========= Restore Script Version By Id =========*/
  restoreScriptVersionById(scriptId: number, VersionNo: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.restoreScriptVersionByIdUrl}/${scriptId}/${VersionNo}/${teisItemType}`);
  }

  /*========= Deploy Script Version By Id =========*/
  deployScriptVersionById(scriptObj: any): Observable<any> {
    return this.http.post<any>(`${this.deployScriptVersionByIdUrl}`, scriptObj);
  }

  /*========= Delete Script Version By Id =========*/
  deleteScriptVersionById(scriptVersionId: number, teisItemType: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteScriptVersionByIdUrl}/${scriptVersionId}/${teisItemType}`);
  }

  /*========== Get Script Parameters ===========*/
  getScriptParameters(paramsObj: any, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.getParametersByIdUrl}`, paramsObj, { headers });
  }

  /*========== Attached System Lib To Script ===========*/
  attachSysLib(sysLibObj: WinwrapRequestDto, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.attachSysLibUrl}`, sysLibObj, { headers });
  }

  /*========== Get Refrences List ===========*/
  getReferences(referencesObj: WinwrapRequestDto, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.getReferencesUrl}`, referencesObj, { headers });
  }

  /*========== Attached References To Script ===========*/
  attachReferences(sysLibObj: WinwrapRequestDto, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.attachReferencesUrl}`, sysLibObj, { headers });
  }

  /*========= Export Script =========*/
  exportScriptById(scriptId: number, teisItemType: string, workspaceId: number): Observable<any> {
    return this.http.get<any>(`${this.exportScriptUrl}/${scriptId}/${teisItemType}/${workspaceId}`, {
      headers: new HttpHeaders({ 'Accept': 'application/xml' }),
      responseType: 'text' as 'json'
    });
  }

  exportScript(exportObj: ExportScript): Observable<any> {
    return this.http.post<any>(`${this.exportScriptUrl}`, exportObj, {
      headers: new HttpHeaders({ 'Accept': 'application/xml' }),
      responseType: 'text' as 'json'
    });
  }

  /*========== Get Connected PIT Items By Script Id ===========*/
  getConnectedPITItemsByScriptId(scriptId: number, scriptType: string, isTriggerScript: boolean): Observable<any> {
    return this.http.get<any>(`${this.getConnectedPITItemsUrl}/${scriptId}/${scriptType}/${isTriggerScript}`);
  }

  /*========== Validate Script Content ===========*/
  validateScript(winwrapObj: WinwrapRequestDto, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.validateScriptUrl}`, winwrapObj, { headers });
  }

  /*========== Validate System Library Script Content ===========*/
  validateSysLibContent(winwrapObj: WinwrapRequestDto, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.validateSysLibScriptUrl}`, winwrapObj, { headers });
  }

  /*========== Get Latest Version Of PIT and Scripts ==========*/
  getLatestVersionInfo(itemId: string, itemType: string): Observable<any> {
    return this.http.get<any>(`${this.getLatestVersionUrl}/${itemId}/${itemType}`);
  }

  /*========== Import Script ==========*/
  importScript(workspaceId: string, overWriteScript: boolean, file: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/octet-stream'
    });
    return this.http.post<any>(`${this.importScriptUrl}/${workspaceId}/${overWriteScript}`, file, { headers });
  }

  /*========== Get Debug Script Parameters ===========*/
  getDebugScriptParameters(paramsObj: any, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.getDebugParamsUrl}`, paramsObj, { headers });
  }

  /*========== Save Debug Script Parameters ===========*/
  saveDebugParameters(username: string, scriptId: string, clientId: string, scriptParameters: Array<any>, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.saveDebugParamsUrl}/${username}/${scriptId}/${clientId}`, scriptParameters, { headers });
  }

  /*========== Get Parsed Script Parameters ===========*/
  getParsedScriptParameters(paramsObj: any, debugSeId: string, debugSeUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'debugSeId': debugSeId ? debugSeId : '',
      'debugSeUrl': debugSeUrl ? debugSeUrl : ''
    });
    return this.http.post<any>(`${this.getScriptParsedParametersUrl}`, paramsObj, { headers });
  }

  /*========== Get SysLib Current Status ===========*/
  getSysLibStatus(ids: Array<string>): Observable<any> {
    return this.http.post<any>(`${this.getSysLibStatusUrl}`, ids);
  }

  /*========== Get Script Engine Info ===========*/
  getScriptEngineInfo(): Observable<any> {
    return this.http.get<any>(`${this.getScriptEngineInfoUrl}`);
  }

  /*========== Get Script Engine Info ===========*/
  getScriptEngineGroups(): Observable<any> {
    return this.http.get<any>(`${this.getScriptEngineGroupsUrl}`);
  }

  /*========== Get Debug Executables Additional Info ===========*/
  getAdditionalInfo(winwrapObj: any): Observable<any> {
    return this.http.post<any>(`${this.getAdditionalInfoUrl}`, winwrapObj);
  }
}