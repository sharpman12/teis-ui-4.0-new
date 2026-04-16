import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LogTree } from '../../../logs/adapters/tree';
import { AddNoteComponent } from '../../add-note/add-note.component';
import { TaskDetailsDto } from '../task-mgmt';
import { TasksManagementService } from '../tasks-management.service';
import { TaskMgmtGlobalDataService } from '../task-mgmt-global-data.service';

@Component({
  selector: 'app-service-log',
  templateUrl: './service-log.component.html',
  styleUrls: ['./service-log.component.scss']
})
export class ServiceLogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() select_all: boolean;
  @Input() isMultipleTaskSelected: boolean;
  @Input() taskId: string;
  @Input() itemId: number;
  @Input() workspaceId: number;
  @Output() noteObj = new EventEmitter<any>();
  @Output() loading = new EventEmitter<boolean>(true);
  selectedRowServiceLog: TreeNode[];
  nodeArr: LogTree;
  cols: any[];
  taskNote: string;
  isloading = false;
  pageNo = 1;
  isMoreResultLinkShow: boolean = false;

  updateNoteByTaskIdSub = Subscription.EMPTY;
  serviceLogSub = Subscription.EMPTY;

  constructor(
    public dialog: MatDialog,
    public sharedService: SharedService,
    public tasksManagementService: TasksManagementService,
    private taskMgmtGlobalDataService: TaskMgmtGlobalDataService,
  ) { }

  ngOnChanges(): void {
    // if (this.taskId !== '') {
    //   this.getServiceLog(this.taskId);
    // }

    // if (this.taskId === '') {
    //   this.selectedRowServiceLog = [];
    // }
  }

  resetServiceLogs() {
    this.selectedRowServiceLog = [];
  }

  ngOnInit(): void {
    this.cols = [
      { field: 'status', header: 'Status' },
      { field: 'note', header: 'Note' },
      { field: 'date', header: 'Date' },
      { field: 'name', header: 'Name' },
      { field: 'message', header: 'Message' }
    ];
  }

  /*============== Get Service Log By Task Id ==============*/
  getServiceLog(taskId: string) {
    if (taskId) {
      this.isloading = true;
      this.loading.next(true);
      this.taskNote = '';
      this.pageNo = 1;
      const searchtxt = 'taskId=' + taskId;
      const serviceLogs = this.taskMgmtGlobalDataService.getServiceLogsByTaskId(taskId);
      if (serviceLogs) {
        // const nodeArray = new LogTree(serviceLogs?.serviceLogs, true);
        const nodeArray = serviceLogs?.serviceLogs;
        this.nodeArr = nodeArray;
        this.selectedRowServiceLog = nodeArray.files;
        this.taskNote = nodeArray.data.logs[0]?.note;
        this.noteObj.emit({ note: this.taskNote, isServiceLog: false });
        this.checkPagination(nodeArray.data?.totalCount, nodeArray?.files?.length);
        this.isloading = false;
        this.loading.next(false);
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
          logType: 'Message',
          name: '',
          pageNo: this.pageNo,
          searchText: searchtxt,
          timeFrame: '',
        };
        this.serviceLogSub = this.tasksManagementService.getServiceLog(serviceLogDto).pipe(take(1)).subscribe(res => {
          const nodeArray = new LogTree(res, true);
          this.nodeArr = nodeArray;
          this.selectedRowServiceLog = nodeArray.files;
          this.taskNote = nodeArray.data.logs[0]?.note;
          this.noteObj.emit({ note: this.taskNote, isServiceLog: false });
          const serviceLogsDto = {
            taskId: taskId,
            serviceLogs: nodeArray
          };
          this.taskMgmtGlobalDataService.storeServiceLogs(serviceLogsDto);
          this.checkPagination(nodeArray.data?.totalCount, nodeArray?.files?.length);
          this.isloading = false;
          this.loading.next(false);
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
  /*============== END Get Service Log By Task Id ==============*/

  getNextPageLogs(event): void {
    if (this.taskId) {
      this.pageNo++;
      this.isloading = true;
      const searchTxt = 'taskId=' + this.taskId;
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
        logType: 'Message',
        name: '',
        pageNo: this.pageNo,
        searchText: searchTxt,
        timeFrame: '',
      };
      this.serviceLogSub = this.tasksManagementService.getServiceLog(serviceLogDto).pipe(take(1)).subscribe(res => {
        const nodeArray = new LogTree(res, true);
        const moreServiceLog = this.selectedRowServiceLog.concat(nodeArray.files);
        this.selectedRowServiceLog = moreServiceLog;
        this.taskNote = nodeArray.data.logs[0]?.note;
        this.noteObj.emit({ note: this.taskNote, isServiceLog: false });
        const serviceLogsDto = {
          taskId: this.taskId,
          serviceLogs: {
            data: this.nodeArr?.data,
            expand: this.nodeArr?.expand,
            files: moreServiceLog
          }
        };
        this.taskMgmtGlobalDataService.storeServiceLogs(serviceLogsDto);
        this.checkPagination(nodeArray.data?.totalCount, moreServiceLog?.length);
        this.isloading = false;
        this.loading.next(false);
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

  /*============= Add Note ==============*/
  addNote() {
    const noteObj = {
      note: this.taskNote,
      isServiceLog: true
    };
    const dialogRef = this.dialog.open(AddNoteComponent, {
      width: '700px',
      maxHeight: '600px',
      data: noteObj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateNoteByTaskId(result.newNote);
      }
    });
  }
  /*============= END Add Note ==============*/

  /*============= Update Note By Task Id ==============*/
  updateNoteByTaskId(note: string) {
    const taskDetailsDto: TaskDetailsDto = {
      taskIdList: [this.taskId],
      note: note
    };
    this.updateNoteByTaskIdSub = this.tasksManagementService.updateNoteByTaskId(taskDetailsDto).subscribe(res => {
      this.getServiceLog(this.taskId);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Update Note By Task Id ==============*/

  ngOnDestroy() {
    this.serviceLogSub.unsubscribe();
    this.updateNoteByTaskIdSub.unsubscribe();
  }

}
