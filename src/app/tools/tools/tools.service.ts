import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Export, ExportedData, ExportedWorkspaceAndType, ImportedWorkspace, ImportResultDto, Items, Script, Workspaces } from './tools';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  readonly getActiveWorkspacesUrl = environment.baseUrl + 'tools/getActiveWorkspaces';
  readonly getExportContentUrl = environment.baseUrl + 'tools/getExportContent';
  readonly getItemTreeByTypeUrl = environment.baseUrl + 'tools/getItemTreeByType';
  readonly getScriptUrl = environment.baseUrl + 'tools/getScripts';
  readonly getScriptParametersUrl = environment.baseUrl + 'tools/getScriptParameters';
  readonly exportUrl = environment.baseUrl + 'tools/export';
  readonly getLogDetailsByIdUrl = environment.baseUrl + 'workspace/getLogDetailsById';

  readonly parseWorkspaceUrl = environment.baseUrl + 'tools/parseWorkspace';
  readonly getImportItemTreeUrl = environment.baseUrl + 'tools/getImportItemTree';
  readonly importUrl = environment.baseUrl + 'tools/import';
  readonly getActiveAlertProcessesUrl = environment.baseUrl + 'tools/getActiveAlertProcesses';
  readonly setDefaultAlertProcessUrl = environment.baseUrl + 'tools/setDefaultAlertProcess';
  readonly getProcessIdNamesForAlertUrl = environment.baseUrl + 'tools/getProcessIdNamesForAlert';
  readonly getTeisItemLockInfoUrl = environment.baseUrl + 'lockManager/getTeisItemLockInfo';

  readonly reindexLogsUrl = environment.baseUrl + 'configuration/indexlog';

  /*============= Shared Selected Workspace to Another Tabs ===============*/
  private selectedWorkspace = new BehaviorSubject<any>({ workspaceName: 'Sample Workspace', workspaceId: 1 });
  selectedWsForExport = this.selectedWorkspace.asObservable();

  /*============= Shared Selected Type Id to Another Tabs ===============*/
  private selectedType = new BehaviorSubject<number>(1);
  selectedExportType = this.selectedType.asObservable();

  /*============= Shared Selected Export Option to Another Tabs ===============*/
  private selectedExportOp = new BehaviorSubject<string>('exportConnected');
  selectedExportOption = this.selectedExportOp.asObservable();

  /*============= Shared Export Selected Workspace, Type to Another Tabs ===============*/
  private selectedWsAndType = new BehaviorSubject<ExportedWorkspaceAndType>({
    exportToId: '3.3',
    workspaceId: 1,
    workspaceName: 'Sample Workspace',
    allWorkspaceIds: [],
    typeId: 1,
    exportOption: 'exportConnected',
    isExportDeployedVersion: true
  });
  selectedWsAndTypeForExport = this.selectedWsAndType.asObservable();

  /*=========== Shared Import Selected Export to, Workspace, Type and Override to Another Tabs ============*/
  private selectedImportData = new BehaviorSubject<ImportedWorkspace>({
    importFromId: '3.3',
    workspaceId: 1,
    workspaceName: 'Sample Workspace',
    allWorkspaceIds: [],
    typeId: 1,
    isTypeChanged: false,
    override: 1,
    overwriteWithDeploy: false,
    toOverwrite: false,
    overrideOption: 'No override',
    overrideItemsScriptsWithDeploy: false,
    alertEnabledForProcesses: false,
    alertEnabledForIntegrations: false,
    alertEnabledForTriggers: false
  });
  selectedImportDetails = this.selectedImportData.asObservable();

  /*============= Shared Selected Alert Process to Another Tabs ===============*/
  private selectedAlertProcessData = new BehaviorSubject<any>('');
  selectedAlertProcess = this.selectedAlertProcessData.asObservable();

  constructor(private http: HttpClient) { }

  /*============= Shared Selected Workspace Id to Another Tabs ===============*/
  sendSelectedWorkspace(obj: any) {
    this.selectedWorkspace.next(obj);
  }

  /*============= Shared Selected Type Id to Another Tabs ===============*/
  sendSelectedType(selectedTypeId: number) {
    this.selectedType.next(selectedTypeId);
  }

  /*============= Shared Selected Export Option to Another Tabs ===============*/
  sendSelectedExportOptions(exportOption: string) {
    this.selectedExportOp.next(exportOption);
  }

  /*============= Shared Selected Workspace, Type to Another Tabs ===============*/
  sendSelectedWsAndType(selectedWsAndTypeId: ExportedWorkspaceAndType) {
    this.selectedWsAndType.next(selectedWsAndTypeId);
  }

  /*============= Shared Import Selected Export to, Workspace, Type and Override to Another Tabs ===============*/
  sendSelectedImportedData(selectedImportedData: ImportedWorkspace) {
    this.selectedImportData.next(selectedImportedData);
  }

  /*============= Shared Selected Alert Process to Another Tabs ===============*/
  sendSelectedAlertProcess(selectedAlertProcess: any) {
    this.selectedAlertProcessData.next(selectedAlertProcess);
  }

  /*========= Get Active Workspaces =========*/
  getActiveWorkspaces(): Observable<Array<Workspaces>> {
    return this.http.get<Array<Workspaces>>(`${this.getActiveWorkspacesUrl}`);
  }

  /*========= Get Export Content =========*/
  getExportContent(workspacesIds: Array<number>, isExportDeployedVersion: boolean): Observable<any> {
    return this.http.post<any>(`${this.getExportContentUrl}/${isExportDeployedVersion}`, workspacesIds);
  }

  /*========= Get Workspace Items Tree =========*/
  getWsItemTree(itemTreeObj: Items): Observable<any> {
    return this.http.post<any>(`${this.getItemTreeByTypeUrl}`, itemTreeObj);
  }

  /*========= Get Script =========*/
  getScript(scriptObj: Script): Observable<any> {
    return this.http.post<any>(`${this.getScriptUrl}`, scriptObj);
  }

  /*========= Get Script Parameters =========*/
  getScriptParams(workspacesId: number, paramsType: string): Observable<any> {
    return this.http.get<any>(`${this.getScriptParametersUrl}/${workspacesId}/${paramsType}`);
  }

  /*========= Export =========*/
  export(exportObj: Export): Observable<ExportedData> {
    return this.http.post<ExportedData>(`${this.exportUrl}`, exportObj);
  }

  /*========= Get Logs Details By Id =========*/
  getLogDetailsById(logId: number): Observable<any> {
    return this.http.get<any>(`${this.getLogDetailsByIdUrl}/${logId}`);
  }

  /*========= Parse Workspace =========*/
  parseWorkspace(exportObj: any): Observable<any> {
    return this.http.post<any>(`${this.parseWorkspaceUrl}`, exportObj);
  }

  /*========= Get Workspace Import Items Tree =========*/
  getWsImportItemTree(itemTreeObj: any): Observable<any> {
    return this.http.post<any>(`${this.getImportItemTreeUrl}`, itemTreeObj);
  }

  /*========= Import =========*/
  import(importObj: ExportedData): Observable<ImportResultDto> {
    return this.http.post<ImportResultDto>(`${this.importUrl}`, importObj);
  }

  /*========= Get Active Alert Process =========*/
  getActiveAlertProcess(workspaceId: number): Observable<any> {
    return this.http.get<any>(`${this.getActiveAlertProcessesUrl}/${workspaceId}`);
  }

  /*========= Get Process Id Names For Alert =========*/
  getProcessIdNamesForAlert(workspaceId: number): Observable<any> {
    return this.http.get<any>(`${this.getProcessIdNamesForAlertUrl}/${workspaceId}`);
  }

  /*========= Get TEIS Item Lock Info =========*/
  getTeisItemLockInfo(workspaceId: number, teisItemId: number, teisItemType: string): Observable<any> {
    return this.http.get<any>(`${this.getTeisItemLockInfoUrl}/${workspaceId}/${teisItemId}/${teisItemType}`);
  }

  /*========= Set Default Alert Process =========*/
  setDefaultAlertProcess(alertProcessDto: any): Observable<any> {
    return this.http.post<any>(`${this.setDefaultAlertProcessUrl}`, alertProcessDto);
  }

  /*========= Re-Index Logs =========*/
  reIndexLogs(): Observable<any> {
    return this.http.get<any>(`${this.reindexLogsUrl}`);
  }
}
