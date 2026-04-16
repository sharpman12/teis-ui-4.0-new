import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MessageService, TreeNode } from 'primeng/api';
import { LogTree } from '../../../../logs/adapters/tree';
import { ArchivePakgsService } from '../../archive-pakgs.service';

@Component({
  selector: 'app-log-info',
  templateUrl: './log-info.component.html',
  styleUrls: ['./log-info.component.scss']
})
export class LogInfoComponent implements OnInit {
  selectedRowData: any;
  selectedRowServiceLog: TreeNode[];
  selectedRowEventLog = [];

  constructor(
    public dialogRef: MatDialogRef<LogInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private archivePakgsService: ArchivePakgsService,
    private messageService: MessageService,
  ) {
    this.getTaskInfo(dialogData?.itemId);
  }

  ngOnInit(): void {
  }

  getTaskInfo(itemId: string) {
    this.archivePakgsService.getArchiveItemDetails(itemId).subscribe(res => {
      res.taskId = this.dialogData?.taskId;
      this.selectedRowData = res;
      this.getServiceLogs();
      this.getEventLogs();
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  closeShowModal(): void {
    this.dialogRef.close();
  }

  getServiceLogs() {
    const serviceLogDto = {
      actualTimeFrame: '',
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      flowId: null,
      id: null,
      items: null,
      logType: 'Message',
      name: '',
      pageNo: 1,
      searchText: `taskid=${this.dialogData?.taskId}`,
      timeFrame: '',
      userId: null
    };
    this.archivePakgsService.searchArchiveReport(serviceLogDto).subscribe(res => {
      const nodeArray = new LogTree(res, true);
      this.selectedRowServiceLog = nodeArray.files;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  getEventLogs() {
    const eventLogDto = {
      actualTimeFrame: '',
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      flowId: null,
      id: null,
      items: null,
      logType: 'Event',
      name: '',
      pageNo: 1,
      searchText: `taskid=${this.dialogData?.taskId}`,
      timeFrame: '',
      userId: null
    };
    this.archivePakgsService.searchArchiveReport(eventLogDto).subscribe(res => {
      this.selectedRowEventLog = res?.logs;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  onClosed() {
    this.dialogRef.close();
  }

}
