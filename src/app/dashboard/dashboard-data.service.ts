import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardDataService {
  allWorkspaces: Array<any> = [];
  dashboardLogCardFailedCount: any = null;
  dashboardFlowCardFailedCount: any = null;

  constructor() { }

  /*============= Store All Worksapces =============*/
  storeAllWorspaces(workspaces: Array<any>) {
    this.allWorkspaces = [];
    this.allWorkspaces = workspaces;
  }

  /*============= Get All Worksapces =============*/
  getAllWorkspaces() {
    return this.allWorkspaces;
  }

  /*============= Clear All Worksapces =============*/
  clearAllWorkspaces() {
    this.allWorkspaces = [];
  }

  /*============= Store Monitor Log Card Failed Count =============*/
  storeLogCardFailedCount(logFailedCount: any) {
    this.dashboardLogCardFailedCount = null;
    this.dashboardLogCardFailedCount = logFailedCount;
  }

  /*============= Get Monitor Log Card Failed Count =============*/
  getLogCardFailedCount() {
    return this.dashboardLogCardFailedCount;
  }

  /*============= Clear Monitor Log Card Failed Count =============*/
  clearLogCardFailedCount() {
    this.dashboardLogCardFailedCount = null;
  }

  /*============= Store Monitor Flow Card Failed Count =============*/
  storeFlowCardFailedCount(flowFailedCount: any) {
    this.dashboardFlowCardFailedCount = null;
    this.dashboardFlowCardFailedCount = flowFailedCount;
  }

  /*============= Get Monitor Flow Card Failed Count =============*/
  getFlowCardFailedCount() {
    return this.dashboardFlowCardFailedCount;
  }

  /*============= Clear Monitor Flow Card Failed Count =============*/
  clearFlowCardFailedCount() {
    this.dashboardFlowCardFailedCount = null;
  }
}
