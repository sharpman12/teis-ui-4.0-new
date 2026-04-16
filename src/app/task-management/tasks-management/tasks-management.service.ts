import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogCriteria } from '../../core/model/log/LogCriteria';
import { ServiceLogs } from '../../core/model/log/ServiceLogs';
import { EventLogs } from '../../core/model/log/EventLogs';
import { StopAllTasksDto, TaskCacheStatusDto } from './task-mgmt';

@Injectable({
  providedIn: 'root'
})
export class TasksManagementService {
  private readonly getWorkspacesByUserUrl = environment.baseUrl + 'workspaces';
  private readonly getWorkspaceTreeByStatusUrl = environment.baseUrl + 'taskManager/getWorkspaceTreeByStatus';
  private readonly getWorkspaceTreeForTriggersUrl = environment.baseUrl + 'taskManager/getWorkspaceTreeForTriggers';
  private readonly getTasksByItemIdAndStatusUrl = environment.baseUrl + 'taskManager/getTasksByItemIdAndStatus';
  private readonly getDeployedProcessByIdUrl = environment.baseUrl + 'taskManager/getDeployedProcessById/';
  private readonly getIntegrationsByProcessIdUrl = environment.baseUrl + 'taskManager/getIntegrationsByProcessId/';
  private readonly getDeployedTriggerByIdUrl = environment.baseUrl + 'taskManager/getDeployedTriggerById/';
  private readonly getIntegrationsByTriggerIdUrl = environment.baseUrl + 'taskManager/getIntegrationsByTriggerId/';
  private readonly getDeployedIntegrationByIdUrl = environment.baseUrl + 'taskManager/getDeployedIntegrationById/';
  private readonly getRestartTaskParametersByTaskIdUrl = environment.baseUrl + 'tasks/parameters/task';
  private readonly getStartTaskParametersByItemIdUrl = environment.baseUrl + 'tasks/parameters/';
  private readonly getTaskStatusCountUrl = environment.baseUrl + 'taskManager/getTaskStatusCount';
  private readonly releaseMutexUrl = environment.baseUrl + 'taskManager/releaseMutex';
  private readonly getTaskDetailsUrl = environment.baseUrl + 'tasks/all-params/task/';
  private readonly getLogReportUrl = environment.baseUrl + 'log/searchLogByTaskId';
  private readonly markTaskAsCompletedUrl = environment.baseUrl + 'taskManager/markTasksAsComplete';
  private readonly restartTaskUrl = environment.baseUrl + 'taskManager/restartTask';
  private readonly releaseMutexByTaskIdUrl = environment.baseUrl + 'taskManager/releaseMutexByTaskIds';
  private readonly startTaskUrl = environment.baseUrl + 'taskManager/startTask';
  private readonly restartAllTasksUrl = environment.baseUrl + 'taskManager/restartAllTasks';
  private readonly updateNoteByTaskIdsUrl = environment.baseUrl + 'taskManager/updateNoteByTaskIds';
  private readonly stopTaskUrl = environment.baseUrl + 'taskManager/setTaskStatus';
  private readonly stopAllTasksUrl = environment.baseUrl + 'taskManager/stopAllTasks';
  private readonly getScriptByIdUrl = environment.baseUrl + 'taskManager/getScriptById/';
  private readonly getInputFilesPathUrl = environment.baseUrl + 'taskManager/getRecentInputFilePaths';
  private readonly getRecentFilesUrl = environment.baseUrl + 'userSetting/user-function/values';
  private readonly getTimeFrameUrl = environment.baseUrl + 'log/getReports';
  private readonly getCacheStatusByTaskIdUrl = environment.baseUrl + 'taskManager/getCacheStatusByTaskId';

  constructor(private http: HttpClient) { }

  /*========== Get Workspaces By Username ==========*/
  getWorkspacesByUser(username: string): Observable<any> {
    return this.http.get(`${this.getWorkspacesByUserUrl}/${username}`);
  }

  /*========== Get Workspace Tree By Status ==========*/
  getWorkspaceTreeByStatus(taskDetailsDto: any): Observable<any> {
    return this.http.post(this.getWorkspaceTreeByStatusUrl, taskDetailsDto);
  }

  /*========== Get Workspace Tree For Trigger ==========*/
  getWorkspaceTreeForTriggers(criteria: any): Observable<any> {
    return this.http.post<any>(this.getWorkspaceTreeForTriggersUrl, criteria);
  }

  /*========== Get Time Frame For Trigger Filters =========*/
  getTimeframe(): Observable<any> {
    return this.http.get(this.getTimeFrameUrl);
  }

  /*========== Get Task By Item and Status ==========*/
  getTasksByItemIdAndStatus(itemTaskDto: any): Observable<any> {
    return this.http.post(this.getTasksByItemIdAndStatusUrl, itemTaskDto);
  }

  /*========== Get Deployed Process By Id ==========*/
  getDeployedProcessById(processId: number): Observable<any> {
    return this.http.get(this.getDeployedProcessByIdUrl + processId);
  }

  /*========== Get Integration Process By Id ==========*/
  getIntegrationProcessById(workspaceId: number, processId: number): Observable<any> {
    return this.http.get(this.getIntegrationsByProcessIdUrl + workspaceId + '/' + processId);
  }

  /*========== Get Deployed Trigger By Id ==========*/
  getDeployedTriggerById(processId: number): Observable<any> {
    return this.http.get(this.getDeployedTriggerByIdUrl + processId);
  }

  /*========== Get Integration Trigger By Id ==========*/
  getIntegrationTriggerById(workspaceId: number, processId: number): Observable<any> {
    return this.http.get(this.getIntegrationsByTriggerIdUrl + workspaceId + '/' + processId);
  }

  /*========== Get Deployed Trigger By Id ==========*/
  getDeployedIntegrationById(integrationId: number): Observable<any> {
    return this.http.get(this.getDeployedIntegrationByIdUrl + integrationId);
  }

  /*========== Get Restart Task Parameters ==========*/
  getRestartTaskParams(taskId: number): Observable<any> {
    return this.http.get(this.getRestartTaskParametersByTaskIdUrl + taskId);
  }

  /*========== Get Start Task Parameters ==========*/
  getStartTaskParams(itemId: number): Observable<any> {
    return this.http.get(this.getStartTaskParametersByItemIdUrl + itemId);
  }

  /*========== Get Task Status ==========*/
  getTaskStatus(itemTaskDto: any): Observable<any> {
    return this.http.post(this.getTaskStatusCountUrl, itemTaskDto);
  }

  /*========== Get Task Details By Task Id ==========*/
  getTaskDetailsByTaskId(taskId: string): Observable<any> {
    return this.http.get(this.getTaskDetailsUrl + taskId);
  }

  /*========== Get Service Log ==========*/
  getServiceLog(criteria: LogCriteria): Observable<ServiceLogs> {
    return this.http.post<ServiceLogs>(this.getLogReportUrl, criteria);
  }

  /*========== Get Event Log ==========*/
  getEventLog(criteria: LogCriteria): Observable<EventLogs> {
    return this.http.post<EventLogs>(this.getLogReportUrl, criteria);
  }

  /*========== Marked Task As Completed ==========*/
  markTaskAsCompleted(taskDetailsDto: any): Observable<any> {
    return this.http.post<any>(this.markTaskAsCompletedUrl, taskDetailsDto);
  }

  /*========== Restart Task ==========*/
  restartTask(taskDetailsDto: any): Observable<any> {
    return this.http.post<any>(this.restartTaskUrl, taskDetailsDto);
  }

  /*========== Release Mutex By Task ==========*/
  releaseMutex(taskDetailsDto: any): Observable<any> {
    return this.http.post<any>(this.releaseMutexUrl, taskDetailsDto);
  }

  /*========== Release Mutex By Task Id ==========*/
  releaseMutexByTaskId(taskDetailsDto: any): Observable<any> {
    return this.http.post<any>(this.releaseMutexByTaskIdUrl, taskDetailsDto);
  }

  /*========== Start Task ==========*/
  startTask(startTaskDetailsDto: any): Observable<any> {
    return this.http.post<any>(this.startTaskUrl, startTaskDetailsDto);
  }

  /*========== Restart All Task ==========*/
  restartAllTask(taskDetailsDto: any): Observable<any> {
    return this.http.post<any>(this.restartAllTasksUrl, taskDetailsDto);
  }

  /*========== Update Note By Task Id ==========*/
  updateNoteByTaskId(taskDetailsDto: any): Observable<any> {
    return this.http.post<any>(this.updateNoteByTaskIdsUrl, taskDetailsDto);
  }

  /*========== Set Task Status ==========*/
  stopTask(taskUpdateDto: any): Observable<any> {
    return this.http.post<any>(this.stopTaskUrl, taskUpdateDto);
  }

  /*========== Stop All Tasks ==========*/
  stopAllTasks(stopAllTaskDto: StopAllTasksDto): Observable<any> {
    return this.http.post<any>(this.stopAllTasksUrl, stopAllTaskDto);
  }

  /*========== Get Script By Id =========*/
  getScriptById(scriptId: string, teisItemType: string, workspaceId: any): Observable<any> {
    return this.http.get(this.getScriptByIdUrl + scriptId + '/' + teisItemType + '/' + workspaceId);
  }

  /*========== Get Recent Input File Path ===========*/
  getRecentInputFilePaths(userDto: any): Observable<any> {
    return this.http.post(this.getInputFilesPathUrl, userDto);
  }

  /*========== Get Recent File ===========*/
  getRecentFiles(module: string, path: string, param: string): Observable<any> {
    return this.http.get<any>(`${this.getRecentFilesUrl}/${module}/${path}/${param}`);
  }

  /*========== Get Task Cache Status By Task Id ==========*/
  getTaskCacheStatusByTaskId(taskId: string): Observable<TaskCacheStatusDto> {
    return this.http.get<any>(`${this.getCacheStatusByTaskIdUrl}/${taskId}`);
  }

}
