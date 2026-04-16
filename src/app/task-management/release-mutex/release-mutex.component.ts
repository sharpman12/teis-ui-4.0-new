import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-release-mutex',
  templateUrl: './release-mutex.component.html',
  styleUrls: ['./release-mutex.component.scss']
})
export class ReleaseMutexComponent implements OnInit {
  allMutex = [];

  constructor(
    public dialogRef: MatDialogRef<ReleaseMutexComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    const mutexList = this.dialogData.mutexNameList;
    const mutexArr = mutexList.map((value) => {
      return { name: value, isChecked: false };
    });
    this.allMutex = mutexArr;
  }

  get selectedMutex() {
    const selectedMutexList = [];
    const mutex = this.allMutex.filter(item => item.isChecked);
    mutex.forEach(item => {
      selectedMutexList.push(item.name);
    });
    return selectedMutexList;
  }

  /*============== Release Mutex ===============*/
  releaseMutex() {
    const mutexObj = {
      mutexNameList: this.selectedMutex,
      taskId: this.dialogData.taskId
    };
    this.dialogRef.close(mutexObj);
  }
  /*============== END Release Mutex ===============*/

  /*============== Cancel Request ===============*/
  onCancel() {
    this.dialogRef.close();
  }
  /*============== END Cancel Request ===============*/

}
