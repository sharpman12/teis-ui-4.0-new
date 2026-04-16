import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LogTree } from 'src/app/logs/adapters/tree';

@Component({
  selector: 'app-app-int-log-info',
  templateUrl: './app-int-log-info.component.html',
  styleUrls: ['./app-int-log-info.component.scss']
})
export class AppIntLogInfoComponent implements OnInit, OnDestroy {
  serviceLogs: any[] = [];
  eventLogs: any[] = [];
  isFirstEventLog: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AppIntLogInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    this.dialogRef.disableClose = true;
    const nodeArray = new LogTree(dialogData?.serviceLogs, true);
    this.serviceLogs = nodeArray.files;
    this.eventLogs = dialogData?.eventLogs || [];
    if (dialogData?.eventLogs?.totalLogs > dialogData?.eventLogs.logs.length) {
      this.isFirstEventLog = true;
    }
  }

  ngOnInit(): void {

  }

  onClosed(): void {
    this.dialogRef.close({ isClosed: false });
  }

  ngOnDestroy(): void {

  }
}
