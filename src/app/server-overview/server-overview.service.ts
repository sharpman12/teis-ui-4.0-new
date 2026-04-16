import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ScriptEngineGroup, Workspace } from '../application-integration/app-integration/appintegration';

@Injectable({
  providedIn: 'root'
})
export class ServerOverviewService {
  private readonly getWorkspacesByUserUrl = environment.baseUrl + 'workspaces';
  private readonly getWorkspacesUrl = environment.baseUrl + 'processingOverview/workspaces';
  private readonly queueMessageCountUrl = environment.baseUrl + 'processingOverview/queueMessageCount';
  private readonly itemCacheDetailUrl = environment.baseUrl + 'processingOverview/itemCacheDetail';
  private readonly taskCacheDetailUrl = environment.baseUrl + 'processingOverview/taskCacheDetail';
  private readonly dlqDetailUrl = environment.baseUrl + 'processingOverview/dlqDetail';
  private readonly processEngineUrl = environment.baseUrl + 'processingOverview/processEngine';
  private readonly allWorkspacesPEUrl = environment.baseUrl + 'processingOverview/appProcessEngine/allWorkspaces';
  private readonly webServiceOverviewUrl = environment.baseUrl + 'processingOverview/webServiceOverview';
  private readonly allWorkspacesWebServiceUrl = environment.baseUrl + 'processingOverview/webServiceOverview/allWorkspaces';
  private readonly getSEGroupsUrl = environment.baseUrl + 'configuration/getSEGroups';
  
  constructor(private http: HttpClient) { }

  /*========= Get Workspaces By Username =========*/
  getWorkspacesByUsername(username: string): Observable<Array<Workspace>> {
    return this.http.get<Array<Workspace>>(`${this.getWorkspacesUrl}`);
  }

  /*========= Get Queues Count By Username =========*/
  getQueuesCount(username: string): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${this.queueMessageCountUrl}/${username}`);
  }

  /*========= Get Queues Count By Username =========*/
  getItemCacheDetails(username: string, workspaceId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${this.itemCacheDetailUrl}/${workspaceId}`);
  }

  /*========= Get Tasks Count By Username =========*/
  getTaskCacheDetails(username: string, workspaceId: number): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${this.taskCacheDetailUrl}/${workspaceId}`);
  }

  /*========= Get DLQ Queues Count =========*/
  getDLQQueuesCount(): Observable<any> {
    return this.http.get<any>(`${this.dlqDetailUrl}`);
  }

  /*========= Get Process Engine Data =========*/
  getPEDetails(processEngineDto: any): Observable<any> {
    return this.http.post<any>(`${this.processEngineUrl}`, processEngineDto);
  }

  /*========= Get All Workspaces Process Engine Data =========*/
  getAllWorkspacesPEDetails(processEngineDto: any): Observable<any> {
    return this.http.post<any>(`${this.allWorkspacesPEUrl}`, processEngineDto);
  }

  /*========= Get Web Service Data =========*/
  getWebServiceDetails(webServiceDto: any): Observable<any> {
    return this.http.post<any>(`${this.webServiceOverviewUrl}`, webServiceDto);
  }

  /*========= Get All Workspaces Web Service Data =========*/
  getAllWorkspacesWebServiceDetails(processEngineDto: any): Observable<any> {
    return this.http.post<any>(`${this.allWorkspacesWebServiceUrl}`, processEngineDto);
  }

  /*========== Get Script Engine Groups ==========*/
  getSEGroups(): Observable<[ScriptEngineGroup]> {
    return this.http.get<[ScriptEngineGroup]>(`${this.getSEGroupsUrl}`);
  }
}
