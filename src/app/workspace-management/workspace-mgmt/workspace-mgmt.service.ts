import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeployItemDto, UpdateWorkspace, Workspaces } from './workspaces';
import { delay, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceMgmtService {
  readonly getWorkspacesUrl = environment.baseUrl + 'workspaces';
  readonly getWorkspaceItemsInfoUrl = environment.baseUrl + 'workspaces/item-info';
  readonly createWorkspacesUrl = environment.baseUrl + 'workspaces';
  readonly updateWorkspacesUrl = environment.baseUrl + 'workspaces';
  readonly removeWorkspacesUrl = environment.baseUrl + 'workspaces';
  readonly getUsersByWorkspaceUrl = environment.baseUrl + 'user/users/search';
  readonly deployWorkspaceUrl = environment.baseUrl + 'workspaces/deploy';
  readonly undeployWorkspaceUrl = environment.baseUrl + 'workspace/undeployWorkspace';
  readonly getLogDetailsByIdUrl = environment.baseUrl + 'workspace/getLogDetailsById';
  readonly disableSchedulerUrl = environment.baseUrl + 'workspaces/status/schedulers';
  readonly disableWebServicesUrl = environment.baseUrl + 'workspaces/status/wsw';
  readonly getWorkspaceErrorCountUrl = environment.baseUrl + 'workspaces/error/count';

  constructor(private http: HttpClient) { }

  /*========= Get All Workspaces =========*/
  getAllWorkspaces(username: string): Observable<Workspaces[]> {
    return this.http.get<Workspaces[]>(`${this.getWorkspacesUrl}/${username}`);
  }

  /*========= Get Workspace Item Info =========*/
  getWorkspaceItemInfo(workspaceIds: Array<any>): Observable<Workspaces[]> {
    return this.http.post<Workspaces[]>(`${this.getWorkspaceItemsInfoUrl}`, workspaceIds);
  }

  /*========= Get Workspace Error Count =========*/
  getWorkspaceErrorCount(workspaceIds: Array<any>): Observable<Array<any>> {
    return this.http.post<Array<any>>(`${this.getWorkspaceErrorCountUrl}`, workspaceIds);
  }

  /*========= Recursive function to call API with different workspace IDs =========*/
  getWorkspaceItemInfoRecursively(workspaceIds: Array<any>): Observable<any> {
    return this.http.post<any>(`${this.getWorkspaceItemsInfoUrl}`, workspaceIds).pipe(
      delay(1000)
    ).pipe(
      map((result: any) => {
        return result;
      })
    );
  }

  /*========= Create Workspaces =========*/
  createWorkspace(workspaceDto: Workspaces): Observable<Workspaces> {
    return this.http.post<Workspaces>(this.createWorkspacesUrl, workspaceDto);
  }

  /*========= Update Workspaces =========*/
  updateWorkspace(workspaceDto: Workspaces): Observable<Workspaces> {
    return this.http.put<Workspaces>(this.updateWorkspacesUrl, workspaceDto);
  }

  /*========= Remove Workspaces =========*/
  removeWorkspace(workspaceId: number, removeAllTasks: boolean): Observable<any> {
    return this.http.delete<any>(`${this.removeWorkspacesUrl}/${workspaceId}/${removeAllTasks}`);
  }

  /*========= Get Users By Workspaces =========*/
  // getUsersByWorkspace(workspaceId: number): Observable<any> {
  //   return this.http.get<any>(`${this.getUsersByWorkspaceUrl}/${workspaceId}`);
  // }

  getUsersByWorkspace(obj: any): Observable<any> {
    return this.http.post<any>(`${this.getUsersByWorkspaceUrl}`, obj);
  }

  /*========= Deploy Workspaces =========*/
  deployWorkspace(deployItemDto: DeployItemDto[]): Observable<DeployItemDto> {
    return this.http.post<DeployItemDto>(this.deployWorkspaceUrl, deployItemDto);
  }

  /*========= Undeploy Workspaces =========*/
  undeployWorkspace(undeployItemDto: DeployItemDto[]): Observable<DeployItemDto> {
    return this.http.post<DeployItemDto>(this.undeployWorkspaceUrl, undeployItemDto);
  }

  /*========= Get Log Details By WorkspaceId =========*/
  getLogDetailsById(logDetailId: string): Observable<any> {
    return this.http.get<any>(`${this.getLogDetailsByIdUrl}/${logDetailId}`);
  }

  /*========= Disable Scheduler =========*/
  disableScheduler(disableScheduler: UpdateWorkspace): Observable<UpdateWorkspace> {
    return this.http.put<UpdateWorkspace>(this.disableSchedulerUrl, disableScheduler);
  }

  /*========= Disable Webservices =========*/
  disableWebservices(disableWebservices: UpdateWorkspace): Observable<UpdateWorkspace> {
    return this.http.put<UpdateWorkspace>(this.disableWebServicesUrl, disableWebservices);
  }
}
