import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-log-details',
  templateUrl: './log-details.component.html',
  styleUrls: ['./log-details.component.scss']
})
export class LogDetailsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LogDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  onCancel() {
    this.dialogRef.close();
  }

}
