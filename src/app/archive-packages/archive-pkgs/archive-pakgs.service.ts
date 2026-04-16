import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReport, Workspaces } from './archive-pkgs';

@Injectable({
  providedIn: 'root'
})
export class ArchivePakgsService {
  readonly getArchiveReportsUrl = environment.baseUrl + 'log/getArchiveReports';
  readonly getArchiveWorkspacesUrl = environment.baseUrl + 'log/getArchiveWorkspaces';
  readonly getArchiveItemTreeByWorkspaceUrl = environment.baseUrl + 'log/getArchiveItemTreeByWorkspace';
  readonly createArchiveReportUrl = environment.baseUrl + 'log/createArchiveReport';
  readonly editArchiveReportUrl = environment.baseUrl + 'log/editArchiveReport';
  readonly deleteArchiveReportUrl = environment.baseUrl + 'log/deleteArchiveReport';
  readonly getArchiveItemTreeUrl = environment.baseUrl + 'log/getArchiveItemTree';
  readonly searchArchiveLogUrl = environment.baseUrl + 'log/searchArchiveLog';
  readonly getArchiveItemDetailsUrl = environment.baseUrl + 'log/getArchiveItemDetails';
  readonly getArchiveTimeFramesUrl = environment.baseUrl + 'log/getArchiveTimeFrames';
  readonly duplicateReportUrl = environment.baseUrl + 'log/isReportExist';
  readonly getArchiveSearchRecordCountUrl = environment.baseUrl + 'log/getArchiveSearchRecordCount';
  readonly getPageSizeUrl = environment.baseUrl + 'log/getPageSize';

  constructor(private http: HttpClient) { }

  /*========== Get Archive Reports =========*/
  getArchiveReports(): Observable<any> {
    return this.http.get(this.getArchiveReportsUrl);
  }

  /*========== Get Workspaces =========*/
  getWorkspaces(): Observable<Workspaces[]> {
    return this.http.get<Workspaces[]>(this.getArchiveWorkspacesUrl);
  }

  /*========== Get Archive Item By Workspaces =========*/
  getArchiveWsTree(wsIds: Array<any>, selected: boolean): Observable<any> {
    return this.http.post<any>(`${this.getArchiveItemTreeByWorkspaceUrl}/${selected}`, wsIds);
  }

  /*========== Get Archive Item Tree =========*/
  getArchiveItemTree(wsIds: Array<any>, reportId: number): Observable<any> {
    return this.http.post<any>(`${this.getArchiveItemTreeUrl}/${reportId}`, wsIds);
  }

  /*========== Create Archive Report =========*/
  createArchiveReport(reportData: CreateReport): Observable<CreateReport> {
    return this.http.post<CreateReport>(this.createArchiveReportUrl, reportData);
  }

  /*========== Edit Archive Report =========*/
  editArchiveReport(reportData: CreateReport): Observable<CreateReport> {
    return this.http.post<CreateReport>(this.editArchiveReportUrl, reportData);
  }

  /*========== Delete Archive Report =========*/
  deleteArchiveReport(reportId: number): Observable<any> {
    return this.http.delete<any>(`${this.deleteArchiveReportUrl}/${reportId}`);
  }

  /*========== Search Archive Logs =========*/
  searchArchiveReport(searchObj: any): Observable<any> {
    return this.http.post<any>(`${this.searchArchiveLogUrl}`, searchObj);
  }

  /*========== Get Archive Report Count =========*/
  getArchiveReportCount(searchObj): Observable<any> {
    return this.http.post(`${this.getArchiveSearchRecordCountUrl}`, searchObj);
  }

  /*========== Get Archive Item Details =========*/
  getArchiveItemDetails(itemId: string): Observable<any> {
    return this.http.get(`${this.getArchiveItemDetailsUrl}/${itemId}`);
  }

  /*========== Get Archive Timeframe =========*/
  getArchiveTimeFrames(): Observable<any> {
    return this.http.get(`${this.getArchiveTimeFramesUrl}`);
  }

  /*========== Check Duplicate Report ==========*/
  checkDuplicateReport(report_name: string): Observable<any> {
    return this.http.get(`${this.duplicateReportUrl}/${report_name}`);
  }

  /*========== Get Page Size ==========*/
  getPageSize(): Observable<any> {
    return this.http.get(`${this.getPageSizeUrl}`);
  }
}
