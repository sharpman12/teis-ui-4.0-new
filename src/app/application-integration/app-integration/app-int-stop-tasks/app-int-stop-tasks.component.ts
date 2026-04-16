import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
} from "@angular/forms";
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from "@angular/material/legacy-dialog";
import { AppIntegrationService } from "../app-integration.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Subscription } from "rxjs";

@Component({
  selector: "app-app-int-stop-tasks",
  templateUrl: "./app-int-stop-tasks.component.html",
  styleUrls: ["./app-int-stop-tasks.component.scss"],
})
export class AppIntStopTasksComponent implements OnInit, OnDestroy {
  stopTaskForm: UntypedFormGroup;
  stopAllTaskForm: UntypedFormGroup;
  currentUser: any;

  getTaskListsSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AppIntStopTasksComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private appIntegrationService: AppIntegrationService
  ) {
    dialogRef.disableClose = true;
    // this.getTaskLists(dialogData);
  }

  ngOnInit(): void {
    this.createForm();
    this.createAllStopTaskForm();
  }

  createForm() {
    this.stopTaskForm = this.fb.group({
      stopTaskList: this.fb.array([this.taskList()]),
    });
  }

  createAllStopTaskForm() {
    this.stopAllTaskForm = this.fb.group({
      allTasksOption: [{ value: 'MARK_AS_COMPLETE', disabled: false }],
      allTasksNote: [{ value: '', disabled: false }]
    });
  }

  taskList(): UntypedFormGroup {
    return this.fb.group({
      taskId: [{ value: "", disabled: true }],
      taskOptions: [{ value: "", disabled: false }],
      note: [{ value: "", disabled: false }],
    });
  }

  setData(taskIds: any[]): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    taskIds.forEach((taskId) => {
      formArray.push(
        this.fb.group({
          taskId: [{ value: taskId, disabled: true }],
          taskOptions: [{ value: "MARK_AS_COMPLETE", disabled: false }],
          note: [{ value: "", disabled: false }],
        })
      );
    });
    return formArray;
  }

  /*============== Get Task Lists ==============*/
  getTaskLists(obj: any) {
    this.getTaskListsSub = this.appIntegrationService.getTaskListByItemId(obj?.processId, obj?.executionState).subscribe((res) => {
      this.stopTaskForm.setControl("stopTaskList", this.setData(res?.taskList));
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============== END Get Task Lists ==============*/

  /*======== Stop Task Send Final Data To Process Component ========*/
  stopTask() {
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    // const stopTasks = this.stopTaskForm.getRawValue();
    // stopTasks?.stopTaskList.forEach((item) => {
    //   item.note = `Marked complete by ${this.currentUser.firstName} ${this.currentUser.lastName}: ${item.note}`;
    //   item.updatedBy =
    //     `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
    //   if (item?.taskOptions === "MARK_AS_COMPLETE") {
    //     item.taskStopped = true;
    //     item.executionState = "Completed";
    //   } else {
    //     // item.taskStopped = false;
    //     item.taskStopped = true; // Make it true for kill teis.exe after stop task with error flag (Jira TEI-3893)
    //     item.executionState = "Stopped";
    //   }
    //   delete item?.taskOptions;
    // });
    // const stopTaskObj = {
    //   isStop: true,
    //   stopTasksList: stopTasks,
    // };
    // this.dialogRef.close(stopTaskObj);

    const stopTasks = this.stopAllTaskForm.getRawValue();
    stopTasks.isStop = true;
    stopTasks.isAllTaskOrFolderSelected = true;
    stopTasks.note = `Marked complete by ${this.currentUser.firstName} ${this.currentUser.lastName}: ${stopTasks.allTasksNote}`;
    stopTasks.updatedBy = `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
    if (stopTasks?.allTasksOption === 'MARK_AS_COMPLETE') {
      stopTasks.taskStopped = true;
      stopTasks.executionState = 'Completed';
    } else {
      // item.taskStopped = false;
      stopTasks.taskStopped = true; // Make it true for kill teis.exe after stop task with error flag (Jira TEI-3893)
      stopTasks.executionState = 'Stopped';
    }
    delete stopTasks?.allTasksOption;
    delete stopTasks?.allTasksNote;
    this.dialogRef.close(stopTasks);
  }
  /*======== END Stop Task Send Final Data To Process Component ========*/

  /*============== Cancel Request ===============*/
  onCancel() {
    const stopTaskObj = {
      isStop: false,
      stopTasksList: null,
    };
    this.dialogRef.close(stopTaskObj);
  }
  /*============== END Cancel Request ===============*/

  ngOnDestroy(): void {
    this.getTaskListsSub.unsubscribe();
  }
}
