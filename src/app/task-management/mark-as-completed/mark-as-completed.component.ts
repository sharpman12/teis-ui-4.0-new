import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-mark-as-completed',
  templateUrl: './mark-as-completed.component.html',
  styleUrls: ['./mark-as-completed.component.scss']
})
export class MarkAsCompletedComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<MarkAsCompletedComponent>,
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
