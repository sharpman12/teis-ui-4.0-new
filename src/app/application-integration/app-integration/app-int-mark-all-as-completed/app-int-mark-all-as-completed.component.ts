import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-app-int-mark-all-as-completed',
  templateUrl: './app-int-mark-all-as-completed.component.html',
  styleUrls: ['./app-int-mark-all-as-completed.component.scss']
})
export class AppIntMarkAllAsCompletedComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<AppIntMarkAllAsCompletedComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  onCompleted(comment: string) {
    const markedCompleted = {
      note: comment,
      isMarked: true
    };
    this.dialogRef.close(markedCompleted);
  }

  onCancel() {
    const markedCompleted = {
      note: '',
      isMarked: false
    };
    this.dialogRef.close(markedCompleted);
  }

}
