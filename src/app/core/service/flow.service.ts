import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FlowCard, FlowCardAdapter } from '../model/FlowCard';
import { FlowGroup } from '../model/flow/FlowGroup';
import { FlowCriteria } from '../model/flow/FlowCriteria';
import { FlowTransaction } from '../model/flow/FlowTransaction';
import { FlowAction } from '../model/flow/FlowAction';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FlowService {
  public verifyFlow = new Subject<string>();
  verifyVisible = false;
  passFlowData = new Subject<any>();
  constructor(private http: HttpClient,
    private adapter: FlowCardAdapter) { }

  baseUrl = environment.baseUrl;
  getCards(): Observable<FlowCard[]> {
    const url = this.baseUrl + 'flow/getGroups';
    return this.http.get(url)
      .pipe(map((flows: FlowGroup[]) => {
        return flows;
      }));
  }

  getFlowsByGroupId(id: number) {
    const url = this.baseUrl + 'flow/getFlowsByGroupId/';
    return this.http.get(url + id).pipe(map(result => {
      return result;
    }));
  }

  searchFlow(criteria: FlowCriteria) {
    return this.http.post<FlowTransaction>(this.baseUrl + 'flow/search', criteria)
      .pipe(map(result => {
        return result;
      }));
  }

  searchFlowCount(criteria: FlowCriteria) {
    return this.http.post<number>(this.baseUrl + 'flow/getSearchRecordsCount', criteria)
      .pipe(map(result => {
        return result;
      }));
  }

  getActivityOptionText(activityId, taskId) {
    const url = this.baseUrl + 'flow/getActivityOptionText/' + activityId + '/' + taskId;
    return this.http.get(url, { responseType: 'text' }).pipe(map(result => {
      return result;
    }));
  }

  updateflowAction(action: FlowAction) {
    return this.http.post<boolean>(this.baseUrl + 'flow/flowAction', action)
      .pipe(map(result => {
        return result;
      }));
  }

  searchFlowGroupByReportId(id: any) {
    const url = this.baseUrl + 'flow/getFlowGroup/';
    return this.http.get(url + id).pipe(map((result: FlowGroup) => {
      return result;
    }));
  }

  verifyFlowData(selectedflow, e) {
    this.verifyFlow.next(selectedflow);
    this.verifyVisible = true;
    this.passFlowData.next(e);
  }

  refreshFlowById(flowId: number) {
    const url = this.baseUrl + 'flow/getErrorStateByFlowGroup/' + flowId;
    return this.http.get(url).pipe(map((result: FlowGroup) => {
      return result;
    }));
  }

  getErrorCountByFlow(flowId: number) {
    const url = this.baseUrl + 'flow/getErrorCountByFlow/' + flowId;
    return this.http.get(url).pipe(map((result: FlowGroup) => {
      return result;
    }));
  }

}
