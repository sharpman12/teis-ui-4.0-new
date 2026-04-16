import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-task-ids-list',
  templateUrl: './task-ids-list.component.html',
  styleUrls: ['./task-ids-list.component.scss']
})
export class TaskIdsListComponent implements OnInit {
  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<TaskIdsListComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {
    
  }

  /*============== Cancel Request ===============*/
  onCancel() {
    const resObj = {
      isClosed: true
    };
    this.dialogRef.close(resObj);
  }
  /*============== END Cancel Request ===============*/
}
