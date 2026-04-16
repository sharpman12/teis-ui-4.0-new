import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ArchiveSearch, LogSearch } from './archiveflow';

@Injectable({
  providedIn: 'root'
})
export class ArchiveFlowService {
  readonly getArchiveFlowGroupUrl = environment.baseUrl + 'flow/getArchiveFlowGroups';
  readonly getArchiveFlowsByGroupNameUrl = environment.baseUrl + 'flow/getArchiveFlowsByGroupName';
  readonly getArchiveDefaultTimeFramesUrl = environment.baseUrl + 'flow/getArchiveDefaultTimeFrames';
  readonly archiveSearchUrl = environment.baseUrl + 'flow/archiveSearch';
  readonly getArchiveSearchRecordsCountUrl = environment.baseUrl + 'flow/getArchiveSearchRecordsCount';
  readonly searchArchiveLogUrl = environment.baseUrl + 'log/searchArchiveLog';

  constructor(private http: HttpClient) { }

  /*========== Get Archive Flows =========*/
  getArchiveFlowGroups(): Observable<any> {
    return this.http.get(this.getArchiveFlowGroupUrl);
  }

  /*========== Get Archive Flows By Group Name =========*/
  getArchiveFlowsByGName(groupName: string): Observable<any> {
    return this.http.get(`${this.getArchiveFlowsByGroupNameUrl}/${groupName}`);
  }

  /*========== Get Archive Search =========*/
  archiveSearch(searchObj: ArchiveSearch) {
    return this.http.post<any>(this.archiveSearchUrl, searchObj);
  }

  /*========== Get Archive Search Count =========*/
  archiveSearchCount(searchObj: ArchiveSearch) {
    return this.http.post<any>(this.getArchiveSearchRecordsCountUrl, searchObj);
  }

  /*========== Search Archive Logs =========*/
  searchArchiveReport(searchObj: LogSearch): Observable<any> {
    return this.http.post<any>(`${this.searchArchiveLogUrl}`, searchObj);
  }
}
