import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-app-int-logs',
  templateUrl: './app-int-logs.component.html',
  styleUrls: ['./app-int-logs.component.scss']
})
export class AppIntLogsComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AppIntLogsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  /*=============== On Cancelled =============*/
  onCancelled(): void {
    this.dialogRef.close();
  }
  /*=============== END On Cancelled =============*/

}
