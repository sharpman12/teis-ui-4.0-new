import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogCriteria } from '../model/log/LogCriteria';
import { ServiceLogs } from '../model/log/ServiceLogs';
import { EventLogs } from '../model/log/EventLogs';
import { Report } from '../model/log/Report';
import { Item } from '../model/log/Item';
import { LogResult } from '../model/log/logResult';
import { SelectedItem } from '../model/log/SelectedItem';
import { ISelectedLog } from '../model/log/SelectedLog';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};
@Injectable({
  providedIn: 'root'
})
export class LogReportService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.baseUrl;


  searchLogByReportId(id: any) {
    const url = this.baseUrl + 'log/searchLogByReportId/';
    return this.http.get(url + id).pipe(map((result: LogResult) => {
      return result;
    }));
  }

  getLogByCardId(id: any) {
    const url = this.baseUrl + 'log/getReport/';
    return this.http.get(url + id).pipe(map((result: LogResult) => {
      return result;
    }));
  }

  /*============== Search Service Logs For Monitor Logs ===============*/
  searchServiceLogs(criteria: LogCriteria) {
    criteria.logType = 'Message';

    return this.http.post<ServiceLogs>(this.baseUrl + 'log/searchLogMonitor', criteria)
      .pipe(map(result => {
        return result;
      }));
  }

  /*============== Search Service Logs For Monitor Flow ===============*/
  searchServiceLogsForFlow(criteria: LogCriteria) {
    criteria.logType = 'Message';

    return this.http.post<ServiceLogs>(this.baseUrl + 'log/searchLog', criteria)
      .pipe(map(result => {
        return result;
      }));
  }

  /*========== Get Service Log By Task Id ==========*/
  getServiceLogByTaskId(criteria: LogCriteria): Observable<ServiceLogs> {
    return this.http.post<ServiceLogs>(`${this.baseUrl}log/searchLogByTaskId`, criteria);
  }

  /*========== Get Event Log ==========*/
  getEventLogByTaskId(criteria: LogCriteria): Observable<EventLogs> {
    return this.http.post<EventLogs>(`${this.baseUrl}log/searchLogByTaskId`, criteria);
  }

  // Gets service logs count from db
  getServiceLogsCount(criteria: LogCriteria) {
    criteria.logType = 'Message';

    return this.http.post<number>(this.baseUrl + 'log/getMonitorSearchRecordsCount', criteria)
      .pipe(map(result => {
        return result;
      }));
  }

  /*============== Search Event Logs For Monitor Logs ===============*/
  searchEventLogs(criteria: LogCriteria) {
    criteria.logType = 'Event';
    return this.http.post<EventLogs>(this.baseUrl + 'log/searchLogMonitor', criteria)
      .pipe(map(result => {
        return result;
      }));
  }

  /*============== Search Event Logs For Monitor Flow ===============*/
  searchEventLogsForFlow(criteria: LogCriteria) {
    criteria.logType = 'Event';
    return this.http.post<EventLogs>(this.baseUrl + 'log/searchLog', criteria)
      .pipe(map(result => {
        return result;
      }));
  }

  searchApplicationLogs(criteria: LogCriteria) {
    criteria.logType = 'System';
    return this.http.post<EventLogs>(this.baseUrl + 'log/searchLogMonitor', criteria)
      .pipe(map(result => {
        return result;
      }));
  }


  getTimeFrames(): Observable<string[]> {
    const url = this.baseUrl + 'log/getTimeFrames';
    return this.http.get(url).pipe(
      map((data: string[]) => data)
    );
  }

  createReport(report: Report) {
    return this.http.post<Report>(this.baseUrl + 'log/createReport', report)
      .pipe(map(result => {
        return result;
      }));
  }

  updateReport(report: Report) {
    return this.http.post<Report>(this.baseUrl + 'log/editReport', report)
      .pipe(map(result => {
        return result;
      }));
  }

  deleteReport(id: number) {
    return this.http.delete(this.baseUrl + 'log/deleteReport/' + id);
  }

  getWorkspaces() {// checkboxes
    const url = this.baseUrl + 'log/getWorkspaces';
    return this.http.get(url).pipe(
      map((data: Item[]) => data)
    );
  }


  getItemsByFolderId(id: Number) {     // wizard step 2 folders
    const url = this.baseUrl + 'log/getItemsByFolderId/';
    return this.http.get(url + id).pipe(map(result => {
      return result;
    }));
  }
  getItemTreeByWorkspace(id: Number, selected: boolean) {// create stpe2 load item on worspace expand
    const url = this.baseUrl + 'log/getItemTreeByWorkspace/';
    return this.http.get(url + id + '/' + selected).pipe(map((result: SelectedItem) => {
      return result;
    }));
  }

  getItemTree(workspaceId: number, reportId: number) {     // edit wizard step 2 get tree
    const url = this.baseUrl + 'log/getItemTree/' + workspaceId + '/' + reportId;
    return this.http.get(url).pipe(map((result: SelectedItem) => {
      return result;
    }));
  }
  // log report
  getLogReportItemDetails(itemId) {
    const url = this.baseUrl + 'log/getItemDetails' + '/' + itemId;
    return this.http.get(url).pipe(map((result: ISelectedLog) => {
      return result;
    }));
  }
}
