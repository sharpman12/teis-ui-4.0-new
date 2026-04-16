import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/components/constants';
import { SharedService } from 'src/app/shared/services/shared.service';
import { TaskDetailsDto } from '../task-mgmt';
import { TaskMgmtGlobalDataService } from '../task-mgmt-global-data.service';
import { TasksManagementService } from '../tasks-management.service';
import { FlowCorelationComponent } from './flow-corelation/flow-corelation.component';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';

@Component({
  selector: 'app-tasks-details',
  templateUrl: './tasks-details.component.html',
  styleUrls: ['./tasks-details.component.scss']
})
export class TasksDetailsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() select_all: boolean;
  @Input() isMultipleTaskSelected: boolean;
  @Input() taskId: string;
  @Input() taskStatus: any;
  @Input() nodeType: string;
  @Input() selectedTaskDetails: any;
  @Input() select_viewed_task: boolean;
  @Input() taskIds: any;
  @Input() itemIds: any;
  @Input() tasksStatus: any;
  @Output() currentTaskStatus: EventEmitter<any> = new EventEmitter<any>();
  taskDetailsParams: any = null;
  status: string;
  statusArr = [];
  getNote: any;
  errMsg: string;
  currentUser: any;

  getTaskStatusSub = Subscription.EMPTY;
  getTaskDeatilsByTaskIdSub = Subscription.EMPTY;
  getTaskDeatilsSub = Subscription.EMPTY;

  constructor(
    public dialog: MatDialog,
    public tasksManagementService: TasksManagementService,
    public sharedService: SharedService,
    private taskMgmtGlobalDataService: TaskMgmtGlobalDataService,
    private encryptDecryptService: EncryptDecryptService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.taskId?.currentValue) {
      this.getTaskDetails(changes?.taskId?.currentValue);
      this.getTaskStatus();
    }

    if (this.taskId === '') {
      this.taskDetailsParams = '';
    }

    // if (changes?.taskStatus?.currentValue) {
    //   this.statusArr = [];
    //   changes?.taskStatus?.currentValue.forEach(item => {
    //     const objKey = `${Object.keys(item)}`;
    //     const objVal = `${Object.values(item)}`;
    //     const statusObj = {
    //       key: objKey,
    //       value: objVal
    //     };
    //     this.statusArr.push(statusObj);
    //   });
    //   // const status = this.getStatus(this.taskStatus);
    //   // this.status = status[1];
    // }
    // this.getTaskStatus();
  }

  ngOnInit(): void {
    // this.getTaskStatus();
  }

  getStatus(status: string) {
    return status.split(' ');
  }

  /*============ Refersh Task Details ============*/
  refershDetails(taskId: string) {
    this.getTaskDetails(taskId);
  }

  /*============ Get Task Details By Task Id =============*/
  getTaskDetails(taskId: string) {
    this.taskDetailsParams = null;
    // const taskDetailsArr = this.taskMgmtGlobalDataService.getStoreTaskDetails();
    // let taskDetailsObj;
    // if (taskDetailsArr?.length) {
    //   taskDetailsArr.forEach(item => {
    //     if (item?.TaskId?.value === taskId || item?.TaskIdentity?.value === taskId) {
    //       taskDetailsObj = item;
    //     }
    //   });
    // }
    // if (taskDetailsObj) {
    //   this.taskDetailsParams = taskDetailsObj;
    // } else {

    // }

    // Now call api every time due to cache and DB issue
    if (taskId) {
      this.getTaskDeatilsByTaskIdSub = this.tasksManagementService.getTaskDetailsByTaskId(taskId).subscribe(res => {
        const obj = res.map;
        if (Object.keys(obj).length) {
          Object.keys(obj).forEach((key) => {
            const replacedKey = key.trim().replace(/\s+/g, '');
            if (key !== replacedKey) {
              obj[replacedKey] = obj[key];
              delete obj[key];
            }
            // Decrypted data here if security level is High
            if (obj[key]?.securityLevel === 'high' || obj[key]?.securityLevel === 'medium') {
              obj[key].value = this.encryptDecryptService.decrypt(obj[key].value);
            }
          });
          this.taskMgmtGlobalDataService.storeTaskDetails(obj);
          this.taskDetailsParams = obj;
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============ END Get Task Details By Task Id =============*/

  /*============ Store Selected Task Details ============*/
  storeSelectedTaskDetails(taskId: string) {
    // const taskDetailsArr = this.taskMgmtGlobalDataService.getStoreTaskDetails();
    // let selectedTaskDetailsObj;
    // if (taskDetailsArr?.length) {
    //   taskDetailsArr.forEach(item => {
    //     if (item?.TaskId?.value === taskId || item?.TaskIdentity?.value === taskId) {
    //       selectedTaskDetailsObj = item;
    //     }
    //   });
    // }
    // if (!selectedTaskDetailsObj) {

    // }

    // Now call api every time due to cache and DB issue
    this.getTaskDeatilsSub = this.tasksManagementService.getTaskDetailsByTaskId(taskId).subscribe(res => {
      const obj = res.map;
      if (Object.keys(obj).length) {
        Object.keys(obj).forEach((key) => {
          const replacedKey = key.trim().replace(/\s+/g, '');
          if (key !== replacedKey) {
            obj[replacedKey] = obj[key];
            delete obj[key];
          }
          // Decrypted data here if security level is High
          if (obj[key]?.securityLevel === 'high' || obj[key]?.securityLevel === 'medium') {
            obj[key].value = this.encryptDecryptService.decrypt(obj[key].value);
          }
        });
        this.taskMgmtGlobalDataService.storeTaskDetails(obj);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  viewFlowName(flowName: any) {
    const dialogRef = this.dialog.open(FlowCorelationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: flowName
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  /*========== Get Task Status ==========*/
  getTaskStatus() {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
    const taskIdArr = [];
    const task = this.selectedTaskDetails;
    taskIdArr.push(task.taskId);
    /*--------------- Commented Code for select multiple or select all ----------------*/
    // if (!this.select_all && !this.select_viewed_task && !this.isMultipleTaskSelected) {
    //   taskIdArr.push(task.taskId);
    // }
    // const taskDetailsDto: TaskDetailsDto = {
    //   taskIdList: (this.select_all || this.select_viewed_task || this.isMultipleTaskSelected) ? this.taskIds : taskIdArr,
    //   workspaceId: task.workspaceId,
    //   updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
    //   // itemId: this.itemId,
    //   itemIdList: this.itemIds,
    //   allTasksSelected: ((this.select_all && !this.select_viewed_task) || this.itemIds?.length > 1) ? true : false,
    //   executionStates: this.tasksStatus
    // };
    /*------------- Code for show selected single task status ------------*/
    const taskDetailsDto: TaskDetailsDto = {
      taskIdList: taskIdArr,
      workspaceId: task.workspaceId,
      updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      itemIdList: this.itemIds,
      allTasksSelected: false,
      executionStates: this.tasksStatus
    };
    this.getTaskStatusSub = this.tasksManagementService.getTaskStatus(taskDetailsDto).subscribe(res => {
      const statusArr = [];
      res.forEach(element => {
        let objKey = `${Object.keys(element)}`;
        const objVal = `${Object.values(element)} ${Object.keys(element)}`;
        const newObjVal = objVal.substring(1);
        objKey = objKey.split(' ')[0];
        statusArr.push({ [objKey]: newObjVal });
      });
      this.updateStatus(statusArr);
      // this.selectedTaskStatus = statusArr;
      /*--------- Disabled/Enabled Action Buttons on the basis of current status ---------*/
      this.currentTaskStatus.emit(Object.keys(statusArr[0])[0]);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  updateStatus(statusArray: Array<any>) {
    this.statusArr = [];
    if (statusArray?.length) {
      statusArray.forEach(item => {
        const objKey = `${Object.keys(item)}`;
        const objVal = `${Object.values(item)}`;
        const newObjVal = objVal.substring(1);
        const statusObj = {
          key: objKey,
          value: newObjVal
        };
        this.statusArr.push(statusObj);
      });
    }
  }
  /*========== END Get Task Status ==========*/

  /*========== Get Selected Task Status ==========*/
  getSelectedTaskStatus(task: any) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
    const taskIdArr = [];
    taskIdArr.push(task.taskId);
    const taskDetailsDto: TaskDetailsDto = {
      taskIdList: taskIdArr,
      workspaceId: task.workspaceId,
      updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      itemIdList: this.itemIds,
      allTasksSelected: false,
      executionStates: this.tasksStatus
    };
    this.getTaskStatusSub = this.tasksManagementService.getTaskStatus(taskDetailsDto).subscribe(res => {
      const statusArr = [];
      res.forEach(element => {
        let objKey = `${Object.keys(element)}`;
        const objVal = `${Object.values(element)} ${Object.keys(element)}`;
        const newObjVal = objVal.substring(1);
        objKey = objKey.split(' ')[0];
        statusArr.push({ [objKey]: newObjVal });
      });
      /*--------- Disabled/Enabled Action Buttons on the basis of current status ---------*/
      this.currentTaskStatus.emit(Object.keys(statusArr[0])[0]);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*========== END Get Selected Task Status ==========*/

  ngOnDestroy(): void {
    // this.taskMgmtGlobalDataService.clearTaskDetailsArr();
    this.getTaskStatusSub.unsubscribe();
    this.getTaskDeatilsSub.unsubscribe();
    this.getTaskDeatilsByTaskIdSub.unsubscribe();
  }

}
