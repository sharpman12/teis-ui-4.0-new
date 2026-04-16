import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { ItemTaskDto } from '../tasks-management/task-mgmt';
import { TasksManagementService } from '../tasks-management/tasks-management.service';

@Component({
  selector: 'app-stop-task',
  templateUrl: './stop-task.component.html',
  styleUrls: ['./stop-task.component.scss']
})
export class StopTaskComponent implements OnInit {
  taskOption: any;
  stopTaskForm: UntypedFormGroup;
  stopAllTaskForm: UntypedFormGroup;
  currentUser: any;
  tasksStatus = ['Processing', 'ProcessingWithError'];

  getTasksByItemIdAndStatusSub = Subscription.EMPTY;
  pageNo = 1;

  constructor(
    public dialogRef: MatDialogRef<StopTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private tasksManagementService: TasksManagementService
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (dialogData?.isSelectViewedTask) {
      this.getTasksByItemIdAndStatus();
    }
  }

  ngOnInit(): void {
    this.createForm();
    this.createAllStopTaskForm();
    if (!this.dialogData?.isSelectAll && !this.dialogData?.isSelectViewedTask) {
      this.stopTaskForm.setControl('stopTaskList', this.setData(this.dialogData?.taskIds));
    }
  }

  createForm() {
    this.stopTaskForm = this.fb.group({
      stopTaskList: this.fb.array([
        this.taskList()
      ])
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
      taskId: [{ value: '', disabled: true }],
      taskOptions: [{ value: '', disabled: false }],
      note: [{ value: '', disabled: false }]
    });
  }

  setData(taskIds: any[]): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    taskIds.forEach(taskId => {
      formArray.push(
        this.fb.group({
          taskId: [{ value: taskId, disabled: true }],
          taskOptions: [{ value: 'MARK_AS_COMPLETE', disabled: false }],
          note: [{ value: '', disabled: false }]
        })
      );
    });
    return formArray;
  }

  /*========== Get Task By Item and Status ==========*/
  getTasksByItemIdAndStatus() {
    this.pageNo = 1;
    const itemTaskDto: ItemTaskDto = {
      itemIdList: this.dialogData?.itemIdList,
      executionStates: this.tasksStatus,
      // paginationCriteria: {
      //   pageNumber: this.pageNo
      // }
    };
    const taskIds = [];
    this.getTasksByItemIdAndStatusSub = this.tasksManagementService.getTasksByItemIdAndStatus(itemTaskDto).subscribe(res => {
      res?.taskShortDetailsDtoList.forEach((element, i, arr) => {
        element.is_selected = false;
        if (i === 0) {
          element.is_selected = true;
        }
        taskIds.push(element?.taskId);
      });
      this.stopTaskForm.setControl('stopTaskList', this.setData(taskIds));
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============== Stop Task ===============*/
  stopTask() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!this.dialogData?.isSelectAll && this.dialogData?.nodeType !== 'FOLDER') {
      const stopTasks = this.stopTaskForm.getRawValue();
      stopTasks.isAllTaskOrFolderSelected = false;
      stopTasks?.stopTaskList.forEach(item => {
        // item.executionState = 'Stopped';
        item.note = `Marked complete by ${this.currentUser.firstName} ${this.currentUser.lastName}: ${item.note}`;
        item.updatedBy = `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
        if (item?.taskOptions === 'MARK_AS_COMPLETE') {
          item.taskStopped = true;
          item.executionState = 'Completed';
        } else {
          // item.taskStopped = false;
          item.taskStopped = true; // Make it true for kill teis.exe after stop task with error flag (Jira TEI-3893)
          item.executionState = 'Stopped';
        }
        delete item?.taskOptions;
      });
      this.dialogRef.close(stopTasks);
    }
    if (this.dialogData?.isSelectAll || this.dialogData?.nodeType === 'FOLDER') {
      const stopTasks = this.stopAllTaskForm.getRawValue();
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
  }

  /*============== Cancel Request ===============*/
  onCancel() {
    this.dialogRef.close();
  }
  /*============== END Cancel Request ===============*/

}
