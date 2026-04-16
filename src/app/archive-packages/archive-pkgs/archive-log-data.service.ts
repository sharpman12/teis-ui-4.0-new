import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ArchiveLogDataService {
  // private flowId = new BehaviorSubject(undefined);
  // private activeTabIndex = new BehaviorSubject(undefined);
  // private selectedLogs = new BehaviorSubject<Array<any>>([]);
  // private updatedTabs = new BehaviorSubject<Array<any>>([]);

  private openArchiveLogsArr = [];

  constructor() { }

  // flowIdAnnounced$ = this.flowId.asObservable();
  // activeTabIndexAnnounced$ = this.activeTabIndex.asObservable();
  // selectedLogsAnnounced$ = this.selectedLogs.asObservable();
  // updatedTabsAnnounced$ = this.updatedTabs.asObservable();

  openArchiveLogs(selectedLog: any) {
    this.openArchiveLogsArr.push(selectedLog);
  }

  closeArchiveLogs(index: number) {
    this.openArchiveLogsArr.forEach((item, i, arr) => {
      setTimeout(() => {
        if (i === (index - 1)) {
          arr.splice(i, 1);
        }
      }, 0);
    });
  }

  getOpenArchiveLogs() {
    return this.openArchiveLogsArr;
  }

  // setFlowId(id: string) {
  //   this.flowId.next(id);
  // }

  // setActiveTabIndex(index) {
  //   this.activeTabIndex.next(index);
  // }

  // setSelectedLogs(data) {
  //   this.selectedLogs.next(data);
  // }

  // setUpdatedTabs(data) {
  //   this.updatedTabs.next(data);
  // }

  // clearSelectedLogs() {
  //   this.selectedLogs.value.length = 0;
  //   this.updatedTabs.value.length = 0;
  //   this.activeTabIndex.next(undefined);
  // }
}
