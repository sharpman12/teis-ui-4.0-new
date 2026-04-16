import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';
import { AppIntegrationService } from '../app-integration.service';
import { take } from 'rxjs/operators';
import { LogTree } from 'src/app/logs/adapters/tree';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService, TreeNode } from 'primeng/api';
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { AppIntMarkAllAsCompletedComponent } from '../app-int-mark-all-as-completed/app-int-mark-all-as-completed.component';
import { AddNoteDto, MarkAllTaskAsCompletedDto, RestartTaskDto, SelectedItemDto, StoreServcieLogsDto } from '../appintegration';
import { Constants } from 'src/app/shared/components/constants';
import { RestartTaskComponent } from 'src/app/task-management/restart-task/restart-task.component';
import { AppIntAddNoteComponent } from '../app-int-add-note/app-int-add-note.component';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { TaskIdsListComponent } from 'src/app/task-management/task-ids-list/task-ids-list.component';
import * as $ from 'jquery';
import { AppIntLogInfoComponent } from './app-int-log-info/app-int-log-info.component';

@Component({
  selector: 'app-app-int-service-log',
  templateUrl: './app-int-service-log.component.html',
  styleUrls: ['./app-int-service-log.component.scss']
})
export class AppIntServiceLogComponent implements OnInit, OnDestroy {
  @Input() itemIds: Array<SelectedItemDto>;
  @Input() selectedItemId: number;
  @Input() isItemDisabled: boolean;
  @Input() tabName: string;
  serviceLogFilterForm: UntypedFormGroup;
  isServiceFilterOpen: boolean = true;
  selectedRowServiceLog: TreeNode[];
  isLoading = false;
  pageNo: number = 1;
  items: any;
  isMoreResultLinkShow: boolean = false;
  selectAll: boolean = false;
  isLogSelected: boolean = false;
  isLogFailed: boolean = false;
  totalLogsCount: number = 0;
  showedLogsCount: number = 0;
  selectedLogsCount: number = 0;
  currentUser: any;
  isLogStateValid: boolean = false;

  private serviceLogSub = Subscription.EMPTY;
  private getServiceLogNotesSub = Subscription.EMPTY;
  private getLogsSub = Subscription.EMPTY;
  private markTasksAsCompletedSub = Subscription.EMPTY;
  private addNoteByTaskIdSub = Subscription.EMPTY;
  private restartTaskByIdSub = Subscription.EMPTY;
  private restartAllTasksSub = Subscription.EMPTY;
  private userDefineLogSearchSub = Subscription.EMPTY;

  constructor(
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    // Default values (used only if nothing in local storage)
    const defaultValues = {
      days: Constants?.SEARCH_LOG_DAYS,
      hours: Constants?.SEARCH_LOG_HOURS,
      minutes: Constants?.SEARCH_LOG_MINUTES,
      seconds: Constants?.SEARCH_LOG_SECONDS,
      logStateGroup: {
        logStateComplete: true,
        logStateActive: true,
        logStateHold: true,
        logStateError: true
      }
    };

    const savedCommon = this.appIntegrationDataService.loadFromStorage('commonFormData');
    const savedLogState = this.appIntegrationDataService.loadFromStorage('serviceLogStateGroup');

    this.createForm(savedCommon, savedLogState);
    this.showServiceLog();

    // Subscribe to BehaviorSubject (reflect changes from other components)
    this.userDefineLogSearchSub = this.appIntegrationDataService.commonData$.subscribe(data => {
      if (data) {
        this.serviceLogFilterForm.patchValue(data, { emitEvent: false });
      }
    });

    // Watch form changes and update service
    this.serviceLogFilterForm.valueChanges.subscribe(value => {
      const { logStateGroup, ...commonFields } = value;
      this.appIntegrationDataService.updateCommonData(commonFields);
      this.appIntegrationDataService.saveToStorage('serviceLogStateGroup', logStateGroup);
    });
  }

  toggleSerivceLog() {
    // $('#collapseTwo').toggle();
    $('#collapseTwo-' + this.tabName).toggle();
    this.isServiceFilterOpen = !this.isServiceFilterOpen;
  }

  showServiceLog() {
    // $('#collapseTwo').show();
    $('#collapseTwo-' + this.tabName).show();
  }

  hideServiceLog() {
    // $('#collapseTwo').hide();
    $('#collapseTwo-' + this.tabName).hide();
  }

  refreshServiceLogs() {
    this.selectAll = false;
    this.isLogSelected = false;
    this.selectedRowServiceLog = [];
    this.appIntegrationDataService.clearServiceLogs();
    this.getSelectedLogsCount(this.selectedRowServiceLog);
  }

  /*================= Create Form ==================*/
  createForm(data: any, logState: any) {
    this.serviceLogFilterForm = this.fb.group({
      days: [{ value: data?.days ?? Constants?.SEARCH_LOG_DAYS, disabled: false }, {
        validators: []
      }],
      hours: [{ value: data?.hours ?? Constants?.SEARCH_LOG_HOURS, disabled: false }, {
        validators: []
      }],
      minutes: [{ value: data?.minutes ?? Constants?.SEARCH_LOG_MINUTES, disabled: false }, {
        validators: []
      }],
      seconds: [{ value: data?.seconds ?? Constants?.SEARCH_LOG_SECONDS, disabled: false }, {
        validators: []
      }],
      logStateGroup: this.fb.group({
        logStateComplete: [{ value: logState?.logStateComplete ?? true, disabled: false }, {
          validators: []
        }],
        logStateActive: [{ value: logState?.logStateActive ?? true, disabled: false }, {
          validators: []
        }],
        logStateHold: [{ value: logState?.logStateHold ?? true, disabled: false }, {
          validators: []
        }],
        logStateError: [{ value: logState?.logStateError ?? true, disabled: false }, {
          validators: []
        }]
      })
    });
    this.onChangeLogState();
  }

  // toggleServiceFilter() {
  //   this.isServiceFilterOpen = !this.isServiceFilterOpen;
  // }

  /*================= Filtered Service Log ================*/
  filterServiceLog(formValue) {

  }
  /*================= END Filtered Service Log ================*/

  /*============== Search Service Log =============*/
  getSearchStr(values: any) {
    const searchStr = [];
    if (values?.logStateGroup?.logStateActive) {
      searchStr.push('status=active');
    }
    if (values?.logStateGroup?.logStateComplete) {
      searchStr.push('status=complete');
    }
    if (values?.logStateGroup?.logStateError) {
      searchStr.push('status=error');
    }
    if (values?.logStateGroup?.logStateHold) {
      searchStr.push('status=hold');
    }
    return searchStr.toString();
  }

  getSearchDate(values: any) {
    const now = new Date();
    const someDaysAgo = new Date(now);
    someDaysAgo.setDate(now.getDate() - Number(values?.days));
    someDaysAgo.setHours(now.getHours() - Number(values?.hours));
    someDaysAgo.setMinutes(now.getMinutes() - Number(values?.minutes));
    someDaysAgo.setSeconds(now.getSeconds() - Number(values?.seconds));
    const dateObj = {
      startDate: someDaysAgo,
      endDate: now
    };
    return dateObj;
  }
  /*============== END Search Service Log =============*/

  /*============== Log State Checkbox Validation ==============*/
  onChangeLogState() {
    const searchFilterValue = this.serviceLogFilterForm.value;
    const isLogStateValid = Object.values(searchFilterValue?.logStateGroup).some(value => value === true);
    this.isLogStateValid = isLogStateValid;
  }

  /*============== Get Service Log ==============*/
  getServiceLog(items?: any) {
    this.isServiceFilterOpen = false;
    this.hideServiceLog();
    this.items = items;
    const searchFilterValue = this.serviceLogFilterForm.value;
    if (this.isLogStateValid) {
      this.isLoading = true;
      this.selectAll = false;
      const startToEndDate = `${this.getDateFormat(this.getSearchDate(searchFilterValue)?.startDate)} to ${this.getDateFormat(this.getSearchDate(searchFilterValue)?.endDate)}`;
      this.pageNo = 1;
      const sreviceLogStoreDto: StoreServcieLogsDto = {
        itemId: items[0]?.itemId,
        itemType: items[0]?.itemType,
        workspaceId: items[0]?.workspaceId,
        timeFrame: startToEndDate,
        pageNo: this.pageNo,
        serviceLogs: null
      };

      // Code for get logs in local storage code is commented due to status not refreshed after api call

      // const serviceLogs = this.appIntegrationDataService.getServiceLogs(sreviceLogStoreDto);
      // if (serviceLogs && serviceLogs?.serviceLogs?.files?.length) {
      //   this.isLoading = false;
      //   this.pageNo = serviceLogs?.pageNo;
      //   const nodeArray = serviceLogs?.serviceLogs;
      //   this.totalLogsCount = nodeArray.data?.totalLogs;
      //   this.showedLogsCount = nodeArray?.files?.length;
      //   this.selectedRowServiceLog = nodeArray.files;
      //   this.checkPagination(nodeArray.data?.totalLogs, nodeArray?.files?.length);
      //   this.isLogFailed = this.selectedRowServiceLog.some(item => item?.data?.status === 'Failed');
      // } else { }

      const serviceLogDto = {
        actualTimeFrame: startToEndDate,
        applyAccess: true,
        defaultValue: false,
        description: '',
        error: false,
        errorCount: 0,
        id: null,
        items: items,
        logType: 'Message',
        name: '',
        pageNo: this.pageNo,
        searchText: this.getSearchStr(searchFilterValue),
        timeFrame: startToEndDate,
      };

      this.serviceLogSub = this.appIntegrationService.getServiceLogByItemId(serviceLogDto).pipe(take(1)).subscribe(res => {
        const nodeArray = new LogTree(res, true);
        if (nodeArray.files?.length) {
          nodeArray.files.forEach(x => {
            x.data.selected = false;
          });
        }
        this.totalLogsCount = nodeArray.data?.totalLogs;
        this.showedLogsCount = nodeArray?.files?.length;
        this.selectedRowServiceLog = nodeArray.files;
        this.isLogFailed = this.selectedRowServiceLog.some(item => item?.data?.status === 'Failed');
        sreviceLogStoreDto.serviceLogs = nodeArray;
        this.appIntegrationDataService.storeServiceLogs(sreviceLogStoreDto);
        this.checkPagination(nodeArray.data?.totalLogs, nodeArray?.files?.length);
        this.getSelectedLogsCount(this.selectedRowServiceLog);
        this.isLoading = false;
        // this.loading.next(false);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    } else {
      this.messageService.add({
        key: "appIntInfoKey",
        severity: "info",
        summary: "",
        detail: 'Select at least one log state to search log(s).',
      });
    }
  }
  /*============== END Get Service Log ==============*/

  /*============== Get Service Log Next Page Call ==============*/
  getNextPageLogs(event): void {
    this.isLoading = true;
    const searchFilterValue = this.serviceLogFilterForm.value;
    const startToEndDate = `${this.getDateFormat(this.getSearchDate(searchFilterValue)?.startDate)} to ${this.getDateFormat(this.getSearchDate(searchFilterValue)?.endDate)}`;
    this.pageNo++;

    const serviceLogDto = {
      actualTimeFrame: startToEndDate,
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      id: null,
      items: this.items,
      logType: 'Message',
      name: '',
      pageNo: this.pageNo,
      searchText: this.getSearchStr(searchFilterValue),
      timeFrame: startToEndDate,
    };

    this.serviceLogSub = this.appIntegrationService.getServiceLogByItemId(serviceLogDto).pipe(take(1)).subscribe(res => {
      const nodeArray = new LogTree(res, true);
      if (nodeArray.files?.length) {
        nodeArray.files.forEach(x => {
          if (this.selectAll && x?.data?.status === 'Failed') {
            x.data.selected = true;
          } else {
            x.data.selected = false;
          }
        });
      }
      const moreServiceLog = this.selectedRowServiceLog.concat(nodeArray.files);
      this.totalLogsCount = nodeArray.data?.totalLogs;
      this.showedLogsCount = moreServiceLog?.length;
      this.selectedRowServiceLog = moreServiceLog;
      this.isLogFailed = this.selectedRowServiceLog.some(item => item?.data?.status === 'Failed');
      this.checkPagination(nodeArray.data?.totalLogs, moreServiceLog?.length);
      this.getSelectedLogsCount(this.selectedRowServiceLog);
      this.isLoading = false;
      // this.loading.next(false);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============== END Get Service Log Next Page Call ==============*/

  /*============= Pagination Conditions =============*/
  checkPagination(totalCount, arrLength) {
    if (arrLength > 0 && totalCount > arrLength) {
      this.isMoreResultLinkShow = true;
    } else {
      this.isMoreResultLinkShow = false;
    }
  }
  /*============= END Pagination Conditions =============*/

  /*============= On Selecte All =============*/
  onSelectAllLogs() {
    if (this.selectedRowServiceLog?.length) {
      this.selectedRowServiceLog.forEach(x => {
        if (x?.data?.status === 'Failed') {
          x.data.selected = this.selectAll;
        }
      });
    }

    this.isLogSelected = this.selectedRowServiceLog.some(item => item?.data?.selected && item?.data?.status === 'Failed');
    this.getSelectedLogsCount(this.selectedRowServiceLog);
  }
  /*============= END On Selecte All =============*/

  /*============= Check Selecte All =============*/
  onSelectLog() {
    const isAllLogsSelected = this.selectedRowServiceLog.some(x => !x?.data?.selected && x?.data?.status === 'Failed');
    this.isLogSelected = this.selectedRowServiceLog.some(item => item?.data?.selected && item?.data?.status === 'Failed');
    if (!isAllLogsSelected) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
    this.getSelectedLogsCount(this.selectedRowServiceLog);
  }
  /*============= END Check Selecte All =============*/

  /*============= Calculate Selected Records Length =============*/
  getSelectedLogsCount(logs: Array<any>) {
    let selectedRecords = 0;
    if (logs?.length) {
      logs.forEach(x => {
        if (x?.data?.selected) {
          selectedRecords += 1;
        }
      });
    }
    this.selectedLogsCount = selectedRecords
  }
  /*============= END Calculate Selected Records Length =============*/

  /*============= Get Selected Logs =============*/
  getSelectedLogs() {
    const selectedLogs = [];
    if (this.selectedRowServiceLog?.length) {
      this.selectedRowServiceLog.forEach(x => {
        if (x.data.selected) {
          selectedLogs.push(x);
        }
      });
    }
    return selectedLogs;
  }
  /*============= END Get Selected Logs =============*/

  /*============= Marked Selected Task As Completed =============*/
  markedTaskAsCompleted() {
    const dialogRef = this.dialog.open(AppIntMarkAllAsCompletedComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        isMarkedAllTaskIsCompleted: false
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isMarked) {
        this.markedAsCompleted(result?.note);
      }
    });
  }

  markedAsCompleted(comment: string) {
    const selectedLogsTaskids = this.selectedRowServiceLog.filter(x => x.data.selected).map(a => a.data?.taskId);
    const markTaskCompletedDto: MarkAllTaskAsCompletedDto = {
      allTasksSelected: (this.selectAll && selectedLogsTaskids?.length > 1) ? true : false,
      executionStates: ['Failed'],
      itemIdList: [this.selectedItemId],
      note: `Marked complete by ${this.currentUser?.firstName ? this.currentUser?.firstName : ""
        } ${this.currentUser?.lastName ? this.currentUser?.lastName : ""
        }: ${comment}`,
      taskIdList: selectedLogsTaskids,
      updatedBy: this.currentUser?.userName,
    };
    this.markTasksAsCompletedSub = this.appIntegrationService.markTaskAsCompleted(markTaskCompletedDto).subscribe((res) => {
      if (res) {
        if (this.selectAll && selectedLogsTaskids?.length > 1) {
          this.messageService.add({
            key: "appIntInfoKey",
            severity: "info",
            summary: "",
            detail: res?.message,
          });
        } else {
          if (res?.length) {
            const failedTasksArr = [];
            const completedTaskArr = [];
            const isTaskFailed = res.some(t => !t?.status);
            if (isTaskFailed) {
              res.forEach(x => {
                if (!x?.status) {
                  failedTasksArr.push(x);
                }
                if (x?.status) {
                  completedTaskArr.push(x);
                }
              });
              const failedTaskObj = {
                message: `
                          One or several task actions could not be performed.<br/>
                          <b>Reason:</b> Task status has changed.<br/>
                          Refresh to check the current status.
                          `,
                taskIds: failedTasksArr
              };
              this.showFailedTaskIds(failedTaskObj);
            } else {
              this.messageService.add({
                key: "appIntSuccessKey",
                severity: "success",
                summary: "",
                detail: "All selected task(s) marked as completed successfully!",
              });
            }
          }
        }
      }
      this.getSelectedLogsCount(this.selectedRowServiceLog);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Marked Selected Task As Completed =============*/

  /*============= Add Note =============*/
  addNote() {
    const selectedLogs = this.getSelectedLogs()?.length ? this.getSelectedLogs() : [];
    const dialogRef = this.dialog.open(AppIntAddNoteComponent, {
      width: "700px",
      maxHeight: "600px",
      data: {
        isValidationAdd: true,
        isSelectAll: this.selectAll,
        isServiceLog: true,
        multipleSelection: selectedLogs?.length > 1 ? true : false,
        note: selectedLogs?.length === 1 ? selectedLogs[0]?.data?.note : '',
        taskStatus: selectedLogs?.length === 1 ? selectedLogs[0]?.data?.status : 'Failed'
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addLogNote(result?.newNote, false, null);
      }
    });
  }

  checkAndAddNote(log: any) {
    const searchtxt = `taskId=${log?.taskId}`;
    const serviceLogDto = {
      actualTimeFrame: '',
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      id: null,
      items: [{
        itemId: log?.itemId,
        workspaceId: log?.workspaceId,
        itemType: ''
      }],
      logType: 'Message',
      name: '',
      pageNo: this.pageNo,
      searchText: searchtxt,
      timeFrame: '',
    };
    this.getServiceLogNotesSub = this.appIntegrationService.getServiceLogsByTaskId(serviceLogDto).subscribe((res) => {
      if (res) {
        if (res?.logs?.length) {
          const notes = res?.logs[0]?.note ? res?.logs[0]?.note : '';
          const dialogRef = this.dialog.open(AppIntAddNoteComponent, {
            width: "700px",
            maxHeight: "600px",
            data: {
              isValidationAdd: true,
              isSelectAll: false,
              isServiceLog: true,
              multipleSelection: false,
              note: notes,
              taskStatus: log?.status
            },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.addLogNote(result?.newNote, true, log?.taskId);
            }
          });
        }
      }
    });
  }

  addLogNote(note: string, isNoteUpdate: boolean, taskId: string) {
    const selectedLogsTaskids = this.selectedRowServiceLog.filter(x => x.data.selected).map(a => a.data?.taskId);
    const taskDetailsDto: AddNoteDto = {
      taskIdList: isNoteUpdate ? [taskId] : selectedLogsTaskids,
      note: note,
      updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      itemIdList: [this.selectedItemId],
      allTasksSelected: (this.selectAll && selectedLogsTaskids?.length > 1) ? true : false,
      executionStates: ['Failed'],
    };
    this.addNoteByTaskIdSub = this.appIntegrationService.addNoteByTaskId(taskDetailsDto).subscribe(res => {
      if (res) {
        if (this.selectAll && selectedLogsTaskids?.length > 1) {
          this.messageService.add({
            key: "appIntInfoKey",
            severity: "info",
            summary: "",
            detail: res?.message,
          });
        } else {
          if (res?.length) {
            const failedTasksArr = [];
            const completedTaskArr = [];
            const isTaskFailed = res.some(t => !t?.status);
            if (isTaskFailed) {
              res.forEach(x => {
                if (!x?.status) {
                  failedTasksArr.push(x);
                }
                if (x?.status) {
                  completedTaskArr.push(x);
                }
              });
              const failedTaskObj = {
                message: `
                          One or several task actions could not be performed.<br/>
                          <b>Reason:</b> Task status has changed.<br/>
                          Refresh to check the current status.
                          `,
                taskIds: failedTasksArr
              };
              this.showFailedTaskIds(failedTaskObj);
            } else {
              this.messageService.add({
                key: "appIntSuccessKey",
                severity: "success",
                summary: "",
                detail: "Note Added Successfully!",
              });
            }
          }
        }
      }
      this.getSelectedLogsCount(this.selectedRowServiceLog);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Add Note =============*/

  /*============= Restart Task =============*/
  restartTask() {
    if (this.isItemDisabled) {
      this.messageService.add({
        key: "appIntInfoKey",
        severity: "info",
        summary: "",
        detail: "This item is disabled. You can not perform this action. Refresh tree to get current status.",
      });
    } else {
      const selectedLogs = this.getSelectedLogs()?.length ? this.getSelectedLogs() : [];
      if (selectedLogs?.length > 1) {
        this.restartAllTasks();
      } else {
        const selectedLogsTaskids = this.selectedRowServiceLog.filter(x => x.data.selected).map(a => a.data?.taskId);
        const dialogRef = this.dialog.open(RestartTaskComponent, {
          width: "800px",
          maxHeight: '95vh',
          height: '95%',
          data: {
            taskId: selectedLogsTaskids[0],
            itemId: this.selectedItemId,
            isStart: false,
            isInteractive: false,
            item: null,
            itemType: this.tabName
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.restartTaskById(result);
          }
        });
      }
    }
  }

  restartTaskById(restartTaskDto: any) {
    restartTaskDto.instanceIdentity = this.currentUser?.instanceIdentity;
    restartTaskDto.taskStatus = ['Failed'];
    delete restartTaskDto.debugSeId;
    delete restartTaskDto.debugSeUrl;
    this.restartTaskByIdSub = this.appIntegrationService.restartTask(restartTaskDto).subscribe(res => {
      if (res) {
        this.messageService.add({
          key: "appIntSuccessKey",
          severity: "success",
          summary: "",
          detail: "Task Restarted Successfully!",
        });
        this.getSelectedLogsCount(this.selectedRowServiceLog);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  restartAllTasks() {
    const selectedLogsTaskids = this.selectedRowServiceLog.filter(x => x.data.selected).map(a => a.data?.taskId);
    const restartTaskDto: RestartTaskDto = {
      taskIdList: this.selectAll ? [] : selectedLogsTaskids,
      note: "",
      updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      itemIdList: [this.selectedItemId],
      allTasksSelected: this.selectAll,
      executionStates: ['Failed'],
    };
    this.restartAllTasksSub = this.appIntegrationService.restartAllTasks(restartTaskDto).subscribe(res => {
      if (res) {
        if (this.selectAll) {
          this.messageService.add({
            key: "appIntInfoKey",
            severity: "success",
            summary: "",
            detail: res?.message,
          });
        } else {
          const failedTasksArr = [];
          if (res?.length) {
            const isTaskFailed = res.some(t => !t?.status);
            if (isTaskFailed) {
              res.forEach(x => {
                if (!x?.status) {
                  failedTasksArr.push(x);
                }
              });
              const failedTaskObj = {
                message: `
                          One or several task actions could not be performed.<br/>
                          <b>Reason:</b> Task status has changed.<br/>
                          Refresh to check the current status.
                          `,
                taskIds: failedTasksArr
              };
              this.showFailedTaskIds(failedTaskObj);
            } else {
              this.messageService.add({
                key: "appIntSuccessKey",
                severity: "success",
                summary: "",
                detail: "All Task Restarted Successfully!",
              });
            }
          }
        }
      }
      this.getSelectedLogsCount(this.selectedRowServiceLog);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Restart Task =============*/

  /*============= Show Failed Task Ids ============*/
  showFailedTaskIds(obj: any) {
    const dialogRef = this.dialog.open(TaskIdsListComponent, {
      width: "700px",
      maxHeight: "700px",
      data: obj,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isClosed) {

      }
    });
  }
  /*============= END Show Failed Task Ids ============*/

  getRowData(log: any) {
    const searchtxt = `taskId=${log?.taskId}`;
    const serviceLogDto = {
      actualTimeFrame: '',
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      id: null,
      items: [{
        itemId: log?.itemId,
        workspaceId: log?.workspaceId,
        itemType: ''
      }],
      logType: 'Message',
      name: '',
      pageNo: this.pageNo,
      searchText: searchtxt,
      timeFrame: '',
    };

    const eventLogDto = { ...serviceLogDto, logType: 'Event' };

    this.getLogsSub = forkJoin({
      itemDetails: this.appIntegrationService.getItemDetailsById(log?.itemId).pipe(take(1)),
      serviceLogs: this.appIntegrationService.getServiceLogsByTaskId(serviceLogDto),
      eventLogs: this.appIntegrationService.getServiceLogsByTaskId(eventLogDto)
    }).subscribe(result => {
      this.getLogInfo(log?.taskId, result.itemDetails, result.serviceLogs, result.eventLogs);
    });
  }

  getLogInfo(taskId: string, info: any, serviceLogs: any, eventLogs: any) {
    const dialogRef = this.dialog.open(AppIntLogInfoComponent, {
      width: "60%",
      maxHeight: '95vh',
      data: { taskId: taskId, logInfo: info, serviceLogs: serviceLogs, eventLogs: eventLogs },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isClosed) {

      }
    });
  }

  /*========== Make Date Format ===========*/
  getDateFormat(date: any): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  /*========== END Make Date Format ===========*/

  ngOnDestroy(): void {
    this.serviceLogSub.unsubscribe();
    this.getLogsSub.unsubscribe();
    this.addNoteByTaskIdSub.unsubscribe();
    this.markTasksAsCompletedSub.unsubscribe();
    this.userDefineLogSearchSub.unsubscribe();
  }

}
