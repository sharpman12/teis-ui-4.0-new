import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
import { User } from '../model/user';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogCard, LogCardAdapter } from '../model/LogsCard';

import { Report } from '../model/log/Report';
import { LogCriteria } from '../model/log/LogCriteria';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(private http: HttpClient,
    private adapter: LogCardAdapter) { }

  baseUrl = environment.baseUrl;
  getCards(): Observable<Report[]> {
    const url = this.baseUrl + 'log/getReports';
    return this.http.get(url)
      .pipe(map((logs: Report[]) => {
        return logs;
      }));
  }

  getSearchLog(id: number): Observable<LogCard[]> {
    const url = this.baseUrl + 'log/getReports';
    return this.http.get(url).pipe(
      map((data: LogCard[]) => data.map(items => this.adapter.adapt(items.id))),
    );
  }

  refreshLogById(logId: number, criteria: LogCriteria) {
    // const url = this.baseUrl + 'log/getErrorStateByReport/' + logId;
    const url = this.baseUrl + 'log/searchLogMonitorCount/' + logId;
    return this.http.post(url, criteria).pipe(delay(1000)).pipe(map((result: Report) => {
      return result;
    }));
  }

  // Define this method for get all logs reports card simultaneously
  getLogsReportCountsById(logId: number, criteria: LogCriteria): Observable<any> {
    const url = `${this.baseUrl}log/searchLogMonitorCount/${logId}`;
    return this.http.post<any>(url, criteria);
  }
}
