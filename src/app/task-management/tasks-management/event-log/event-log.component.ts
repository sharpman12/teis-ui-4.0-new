import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';
import { EventLogs } from '../../../core/model/log/EventLogs';
import { TasksManagementService } from '../tasks-management.service';
import { TaskMgmtGlobalDataService } from '../task-mgmt-global-data.service';

@Component({
  selector: 'app-event-log',
  templateUrl: './event-log.component.html',
  styleUrls: ['./event-log.component.scss']
})
export class EventLogComponent implements OnInit, OnChanges {
  @Input() select_all: boolean;
  @Input() isMultipleTaskSelected: boolean;
  @Input() taskId: string;
  @Input() itemId: number;
  @Input() workspaceId: number;
  selectedRowEventLog: EventLogs;
  isloading = false;
  pageNo = 1;
  isMoreResultLinkShow: boolean = false;

  constructor(
    public tasksManagementService: TasksManagementService,
    private taskMgmtGlobalDataService: TaskMgmtGlobalDataService,
  ) { }

  ngOnChanges(): void {
    // if (this.taskId !== '') {
    //   this.getEventLog(this.taskId);
    // }

    // if (this.taskId === '') {
    //   this.selectedRowEventLog = {
    //     timeFrame: '',
    //     totalLogs: 0,
    //     logs: []
    //   };
    // }
  }

  resetEventLogs() {
    this.selectedRowEventLog = {
      timeFrame: '',
      totalLogs: 0,
      logs: []
    };
  }

  ngOnInit(): void {
  }

  /*============== Get Event Log By Task Id ==============*/
  getEventLog(taskId: string) {
    if (taskId) {
      this.isloading = true;
      const searchtxt = 'taskId=' + taskId;
      const eventLogs = this.taskMgmtGlobalDataService.getEventLogsByTaskId(taskId);
      if (eventLogs) {
        this.selectedRowEventLog = eventLogs?.eventLogs;
        this.checkPagination(eventLogs?.eventLogs?.totalLogs, eventLogs?.eventLogs?.logs?.length);
        this.isloading = false;
      } else {
        const serviceLogDto = {
          actualTimeFrame: '',
          applyAccess: true,
          defaultValue: false,
          description: '',
          error: false,
          errorCount: 0,
          id: null,
          items: [{
            itemId: this.itemId.toString(),
            workspaceId: this.workspaceId.toString(),
            itemType: ''
          }],
          logType: 'Event',
          name: '',
          pageNo: 1,
          searchText: searchtxt,
          timeFrame: '',
        };
        // tslint:disable-next-line: deprecation
        this.tasksManagementService.getEventLog(serviceLogDto).pipe(take(1)).subscribe(res => {
          this.selectedRowEventLog = res;
          const eventLogsDto = {
            taskId: taskId,
            eventLogs: res
          };
          this.taskMgmtGlobalDataService.storeEventLogs(eventLogsDto);
          this.checkPagination(res?.totalLogs, res?.logs?.length);
          this.isloading = false;
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
      }
    }
  }
  /*============== END Get Event Log By Task Id ==============*/

  getNextPageLogs(event): void {
    if (this.taskId) {
      this.pageNo++;
      this.isloading = true;
      const searchtxt = 'taskId=' + this.taskId;
      const serviceLogDto = {
        actualTimeFrame: '',
        applyAccess: true,
        defaultValue: false,
        description: '',
        error: false,
        errorCount: 0,
        id: null,
        items: [{
          itemId: this.itemId.toString(),
          workspaceId: this.workspaceId.toString(),
          itemType: ''
        }],
        logType: 'Event',
        name: '',
        pageNo: this.pageNo,
        searchText: searchtxt,
        timeFrame: '',
      };
      this.tasksManagementService.getEventLog(serviceLogDto).pipe(take(1)).subscribe(res => {
        const moreServiceLog = {
          logs: this.selectedRowEventLog?.logs.concat(res?.logs),
          timeFrame: this.selectedRowEventLog?.timeFrame,
          totalLogs: this.selectedRowEventLog?.totalLogs,
        }
        this.selectedRowEventLog = moreServiceLog;
        const eventLogsDto = {
          taskId: this.taskId,
          eventLogs: moreServiceLog
        };
        this.taskMgmtGlobalDataService.storeEventLogs(eventLogsDto);
        this.checkPagination(res?.totalLogs, this.selectedRowEventLog?.logs?.length);
        this.isloading = false;
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  /*============= Pagination Conditions =============*/
  checkPagination(totalCount, arrLength) {
    if (arrLength > 0 && totalCount > arrLength) {
      this.isMoreResultLinkShow = true;
    } else {
      this.isMoreResultLinkShow = false;
    }
  }
  /*============= END Pagination Conditions =============*/

}
