import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LogDataService {
  private flowId = new BehaviorSubject(undefined);
  private activeTabIndex = new BehaviorSubject(undefined);
  private selectedLogs = new BehaviorSubject<Array<any>>([]);
  private updatedTabs = new BehaviorSubject<Array<any>>([]);
  constructor() { }

  flowIdAnnounced$ = this.flowId.asObservable();
  activeTabIndexAnnounced$ = this.activeTabIndex.asObservable();
  selectedLogsAnnounced$ = this.selectedLogs.asObservable();
  updatedTabsAnnounced$ = this.updatedTabs.asObservable();

  setFlowId(id: string) {
    this.flowId.next(id);
  }

  setActiveTabIndex(index) {
    this.activeTabIndex.next(index);
  }

  setSelectedLogs(data) {
    this.selectedLogs.next(data);
  }

  setUpdatedTabs(data) {
    this.updatedTabs.next(data);
  }
  clearSelectedLogs() {
    this.selectedLogs.value.length = 0;
    this.updatedTabs.value.length = 0;
    this.activeTabIndex.next(undefined);
  }
}
