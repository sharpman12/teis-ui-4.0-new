import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MessageService, TreeNode } from "primeng/api";
import { Subject, Subscription, EMPTY, of } from "rxjs";
import { switchMap, map, catchError } from "rxjs/operators";
import { Constants } from "src/app/shared/components/constants";
import { AddNoteComponent } from "../../add-note/add-note.component";
import { MarkAsCompletedComponent } from "../../mark-as-completed/mark-as-completed.component";
import { ReleaseMutexComponent } from "../../release-mutex/release-mutex.component";
import { RestartTaskComponent } from "../../restart-task/restart-task.component";
import { StopTaskComponent } from "../../stop-task/stop-task.component";
import { EventLogComponent } from "../event-log/event-log.component";
import { GeneralInformationComponent } from "../general-information/general-information.component";
import { ServiceLogComponent } from "../service-log/service-log.component";
import {
  ItemTaskDto,
  StartTaskDetailsDto,
  TaskDetailsDto,
  TaskItemsListDto,
} from "../task-mgmt";
import { TasksDetailsComponent } from "../tasks-details/tasks-details.component";
import { TasksManagementService } from "../tasks-management.service";
import { Workspaceitemstree } from "../workspaceitemstree";
import { TaskMgmtGlobalDataService } from "../task-mgmt-global-data.service";
import { TaskIdsListComponent } from "../../task-ids-list/task-ids-list.component";
import { SubfolderItemsConfirmationComponent } from "../../subfolder-items-confirmation/subfolder-items-confirmation.component";

@Component({
  selector: "app-hold-task",
  templateUrl: "./hold-task.component.html",
  styleUrls: ["./hold-task.component.scss"],
})
export class HoldTaskComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tabIndex: number;
  @Input() isItemsShow: boolean;
  activeHoldTaskIndex: number = 0;
  activeTask: any = 1;
  pageNo = 1;
  selectedFile: TreeNode;
  holdWorkspaceTree: TreeNode[] = [];
  select_all = false;
  select_viewed_task = false;
  holdTask: Array<any> = [];
  allHoldTask: Array<any> = [];
  selectedTaskId = "";
  taskIds: Array<any> = [];
  tasksStatus = ["Hold", "InputHold"];
  isExpanded = true;
  itemId: number;
  nodeArr = [];
  isTaskLoading = false;
  selectedTaskDetails: any;
  checkedTaskDetails: any; // after selected the checkbox get task details & passed it for performing action
  selectedTaskStatus: any;
  workspaceId: number;
  nodeType: string;
  getNote: any;
  isLoading: boolean;
  isWsTreeLoading: boolean;
  isTriggerDeployed: any;
  selectedNode: any;
  currentUser: any;
  isMoreResultLinkShow = false;
  totalCount: number;
  currentTaskStatus: any;
  isMultipleTaskSelected = false;
  isActionBtnEnable = false;
  isRefershBtnDisabled = true;
  itemIds = [];
  workspaces = [];
  selectedWs: any;
  isManualSelection: boolean;
  recordsPerPage = Constants?.RECORDS_PER_PAGE;

  private itemSelection$ = new Subject<{
    taskId: number;
    pageNo: number;
    isNextPageCall: boolean;
    taskItemsList: any;
  }>();

  getWorkspaceByUsernameSub = Subscription.EMPTY;
  getWorkspaceTreeByStatusSub = Subscription.EMPTY;
  getTasksByItemIdAndStatusSub = Subscription.EMPTY;
  startTaskSub = Subscription.EMPTY;
  releaseMutexByTaskIdSub = Subscription.EMPTY;
  markTaskAsCompletedSub = Subscription.EMPTY;
  restartTaskSub = Subscription.EMPTY;
  updateNoteByTaskIdSub = Subscription.EMPTY;
  getTaskStatusSub = Subscription.EMPTY;

  @ViewChild(TasksDetailsComponent)
  tasksDetailsComponent: TasksDetailsComponent;
  @ViewChild(GeneralInformationComponent)
  generalInformationComponent: GeneralInformationComponent;
  @ViewChild(ServiceLogComponent) serviceLogComponent: ServiceLogComponent;
  @ViewChild(EventLogComponent) eventLogComponent: EventLogComponent;

  constructor(
    public dialog: MatDialog,
    private messageService: MessageService,
    public tasksManagementService: TasksManagementService,
    private taskMgmtGlobalDataService: TaskMgmtGlobalDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnChanges(): void {
    if (this.tabIndex === 2) {
      if (!this.holdWorkspaceTree.length && !this.workspaces?.length) {
        this.getWorkspacesByUsername();
        // this.getWorkspaceTree();
      }
    }
  }

  ngOnInit(): void {
    this.getTasksByItemIdAndStatusSub = this.itemSelection$
      .pipe(
        switchMap(({ taskId, pageNo, isNextPageCall, taskItemsList }) => {
          if (taskItemsList && !isNextPageCall) {
            return of({
              fromCache: true,
              res: taskItemsList.taskItemLists,
              requestPageNo: taskItemsList.pageNumber || 1,
              isNextPageCall,
              taskItemsList,
            });
          }

          const requestPageNo =
            taskItemsList && isNextPageCall
              ? taskItemsList.pageNumber + 1
              : pageNo;

          const itemTaskDto: ItemTaskDto = {
            itemIdList: this.itemIds,
            executionStates: this.tasksStatus,
            workspaceId: this.selectedNode?.workspaceId,
            paginationCriteria: { pageNumber: requestPageNo },
          };

          this.isTaskLoading = true;

          return this.tasksManagementService.getTasksByItemIdAndStatus(itemTaskDto).pipe(
            map((res) => ({
              fromCache: false,
              res,
              requestPageNo,
              isNextPageCall,
              taskItemsList,
            })),
            catchError(() => {
              this.isTaskLoading = false;
              return EMPTY;
            })
          );
        })
      )
      .subscribe(({ fromCache, res, requestPageNo, isNextPageCall, taskItemsList }) => {
        this.isTaskLoading = false;

        const taskList = res?.taskShortDetailsDtoList || [];
        this.totalCount = res?.totalCount || 0;

        taskList.forEach((element, i) => {
          element.is_selected = false;
          element.is_checked = i === 0;
          element.is_disabled = false;
        });

        if (!taskList.length) {
          this.holdTask = [];
          this.allHoldTask = [];
          return;
        }

        if (!fromCache) {
          const merged = isNextPageCall
            ? {
              taskShortDetailsDtoList:
                taskItemsList?.taskItemLists?.taskShortDetailsDtoList.concat(taskList),
              totalCount: res.totalCount,
            }
            : res;

          const tasksListDto: TaskItemsListDto = {
            taskType: "Hold",
            itemId: this.itemId,
            taskItemLists: merged,
            pageNumber: requestPageNo,
          };

          this.taskMgmtGlobalDataService.storeTaskItemsList(tasksListDto);
        }

        if (isNextPageCall) {
          this.allHoldTask = this.allHoldTask.concat(taskList);
        } else {
          this.allHoldTask = taskList;
          this.holdTask = [];
          this.pagination(0, this.recordsPerPage, false);

          if (this.holdTask.length) {
            this.updateSelection(0, this.holdTask[0]);
            this.getTaskById(this.holdTask[0], false);
          }
        }
      });
  }

  handleChange(index: number) {
    this.activeHoldTaskIndex = index;
    if (index === 0) {
    }
    if (index === 1) {
    }
    if (index === 2) {
      // this.serviceLogComponent.getServiceLog(this.selectedTaskId);
      if (this.selectedTaskId !== "") {
        this.serviceLogComponent.getServiceLog(this.selectedTaskId);
      }

      if (this.selectedTaskId === "") {
        this.serviceLogComponent.resetServiceLogs();
      }
    }
    if (index === 3) {
      // this.eventLogComponent.getEventLog(this.selectedTaskId);
      if (this.selectedTaskId !== "") {
        this.eventLogComponent.getEventLog(this.selectedTaskId);
      }

      if (this.selectedTaskId === "") {
        this.eventLogComponent.resetEventLogs();
      }
    }
  }

  /*=========== Get Current Status From Task Details Component ===========*/
  getCurrentTaskStatus(event: any) {
    this.currentTaskStatus = event;
  }
  /*=========== END Get Current Status From Task Details Component ===========*/

  /*========= Get Worksapces By Current User =========*/
  getWorkspacesByUsername() {
    const username = localStorage.getItem(Constants.USERNAME);
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    const accessWorkspacesArr = [];
    let defaultWorkspaceId = null;
    this.getWorkspaceByUsernameSub = this.tasksManagementService.getWorkspacesByUser(username).subscribe((res) => {
      if (res?.length && accessWorkspaces?.length) {
        // Filter out archived workspaces
        const workspacesArr = JSON.parse(JSON.stringify(res)).filter((x) => !x?.archived);
        accessWorkspaces.forEach((aws) => {
          workspacesArr.forEach((ws) => {
            if (Number(aws?.workspaceId) === Number(ws?.id)) {
              if (aws?.accessList.some((x) => x?.key === 'TM_ACTNS')) {
                accessWorkspacesArr.push(ws);
              }
            }
          });
        });
      }

      this.workspaces = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));

      if (this.workspaces?.length) {
        this.workspaces.forEach((item) => {
          if (item?.defaultWorkspace) {
            if (item?.defaultWorkspace) {
              defaultWorkspaceId = item?.id;
            }
          }
        });
        if (defaultWorkspaceId) {
          this.selectedWs = [defaultWorkspaceId];
        } else {
          this.selectedWs = [this.workspaces[0]?.id];
        }
      }

      this.changeWorkspace(this.selectedWs);
    },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      }
    );
  }

  changeWorkspace(workspaceIds: Array<string>) {
    this.refershHoldItems(false);
    this.getWorkspaceTree(workspaceIds);
  }

  /*========= Refersh Hold Items ==========*/
  refershHoldItems(isRefresh: boolean) {
    this.selectedNode = "";
    this.holdWorkspaceTree = [];
    this.holdTask = [];
    this.allHoldTask = [];
    this.nodeArr = [];
    this.taskIds = [];
    this.itemIds = [];
    this.selectedTaskId = "";
    this.totalCount = 0;
    this.select_all = false;
    this.select_viewed_task = false;
    this.isActionBtnEnable = false;
    this.isRefershBtnDisabled = true;
    this.isMultipleTaskSelected = false;
    this.isExpanded = true;
    /*------------ Added condition for call workspace list only on root refresh -----------*/
    if (isRefresh) {
      // this.selectedWs = '';
      // this.getWorkspacesByUsername();
      // this.getWorkspaceTree('');
      // this.nodeSelect(this.selectedNode);
      if (this.workspaces?.length && !this.selectedWs?.length) {
        this.workspaces.forEach((item) => {
          if (item?.defaultWorkspace) {
            this.selectedWs = [item?.id];
          }
        });
      }
      this.changeWorkspace(this.selectedWs);
    }
  }
  /*========= END Refersh Hold Items ==========*/

  /*============= Select Tree Node =============*/
  nodeSelect(item: any) {
    this.activeHoldTaskIndex = 0;
    this.selectedTaskId = "";
    this.workspaceId = 0;
    this.selectedNode = "";
    this.itemId = 0;
    this.nodeType = "";
    this.taskIds = [];
    this.itemIds = [];
    this.getNote = "";
    this.select_all = false;
    this.select_viewed_task = false;
    this.isMultipleTaskSelected = false;
    this.isActionBtnEnable = false;
    this.isRefershBtnDisabled = true;
    this.selectedNode = item;
    this.itemId = item.id;
    this.nodeType = item.nodeType;
    this.getItemIds(item);
    /*---------- Logic for enable/disable action button on node selection ----------*/
    // if (item?.children?.length) {
    //   item?.children.forEach(element => {
    //     if (element?.nodeType !== 'FOLDER') {
    //       this.isActionBtnEnable = true;
    //     }
    //   });
    // }
    if (
      item?.nodeType !== "INTEGRATION" &&
      item?.nodeType !== "PROCESS" &&
      item?.nodeType !== "TRIGGER"
    ) {
      this.holdTask = [];
      this.allHoldTask = [];
      this.totalCount = 0;
    }
    if (
      item?.id &&
      (item?.nodeType === "INTEGRATION" ||
        item?.nodeType === "PROCESS" ||
        item?.nodeType === "TRIGGER")
    ) {
      this.isActionBtnEnable = false;
      this.isRefershBtnDisabled = false;
      this.getTasksByItemIdAndStatus(item.id, 1, false);
    }
    if (item?.nodeType === "WORKSPACE") {
      this.isActionBtnEnable = false;
    }
    // if (item?.nodeType === 'INTEGRATION' || item?.nodeType === 'PROCESS' || item?.nodeType === 'TRIGGER') {
    //   this.isRefershBtnDisabled = false;
    // }
  }
  /*============= END Select Tree Node =============*/

  /*============= Get Item Ids of Folder Level ==============*/
  getItemIds(node: any) {
    this.isActionBtnEnable = true;
    if (node?.nodeType !== 'WORKSPACE' && node?.nodeType !== 'FOLDER') {
      this.itemIds.push(node?.id);
    }

    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.getItemIds(node.children[m]);
      }
    }
  }

  /*============= Skip Sub Folders Items If User Select Respective Option =============*/
  skipSubFoldersItemIds(node: any) {
    if (node.children?.length) {
      node.children.forEach((x) => {
        if (x?.nodeType !== 'FOLDER') {
          this.itemIds.push(x?.id);
        }
      });
    }
  }

  /*============= Unselected Tree Node =============*/
  nodeUnselect(itemId: number) {
    // console.log('UnSeletced', this.selectedFile);
  }
  /*============= END Unselected Tree Node =============*/

  /*========== Get Workspace Tree By Status ==========*/
  getWorkspaceTree(workspaceIds: Array<any>) {
    if (workspaceIds?.length) {
      this.holdWorkspaceTree = [];
      let isWsId = false;
      const workspaceTreeItems =
        this.taskMgmtGlobalDataService.getWorkspaceTreeById(workspaceIds, "Hold");
      if (workspaceIds?.length && workspaceTreeItems?.length) {
        workspaceIds.forEach((wsId) => {
          workspaceTreeItems.forEach((item) => {
            if (Number(wsId) === Number(item?.id)) {
              isWsId = true;
            } else {
              isWsId = false;
            }
          });
        });
      }
      if (workspaceTreeItems?.length && isWsId) {
        let wsId = null;
        workspaceTreeItems.forEach((element) => {
          if (element?.type === 'WORKSPACE') {
            wsId = element?.id;
          }
          let nodeArray: TreeNode;
          nodeArray = new Workspaceitemstree(element, wsId);
          this.holdWorkspaceTree.push(nodeArray);
        });
      } else {
        const taskDetailsDto: TaskDetailsDto = {
          executionStates: this.tasksStatus,
          workspaceIds: workspaceIds,
          timeFrame: "",
        };
        this.isWsTreeLoading = true;
        this.getWorkspaceTreeByStatusSub = this.tasksManagementService.getWorkspaceTreeByStatus(taskDetailsDto).subscribe((res) => {
          const workspaceItems = res;
          if (workspaceIds?.length && workspaceItems?.length) {
            workspaceIds.forEach((wsId) => {
              workspaceItems.forEach((item) => {
                if (Number(wsId) === Number(item?.id)) {
                  const workspaceTreeObj = {
                    workspaceId: item?.id,
                    workspaceTree: item,
                    taskType: "Hold",
                  };
                  this.taskMgmtGlobalDataService.storeWorkspaceTree(
                    workspaceTreeObj
                  );
                }
              });
            });
          }
          if (workspaceItems?.length) {
            let wsId = null;
            workspaceItems.forEach((element) => {
              if (element?.type === 'WORKSPACE') {
                wsId = element?.id;
              }
              let nodeArray: TreeNode;
              nodeArray = new Workspaceitemstree(element, wsId);
              this.holdWorkspaceTree.push(nodeArray);
              // this.nodeSelect(this.selectTreeNode(nodeArray));
              // if (this.nodeArr?.length) {
              //   this.selectedFile = this.nodeArr[0];
              // }
            });
          }
          this.isWsTreeLoading = false;
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
      }
    }
  }

  selectTreeNode(node: TreeNode) {
    if (node?.children) {
      node.children.forEach((childNode) => {
        this.selectTreeNode(childNode);
      });
    }
    if (node?.children === null || node?.children?.length === 0) {
      this.nodeArr.push(node);
    }
    return this.nodeArr[0].id;
  }
  /*========== END Get Workspace Tree By Status ==========*/

  /*========== Get Task By Item and Status ==========*/
  // getTasksByItemIdAndStatus(
  //   taskId: number,
  //   pageNo: number,
  //   isNextPageCall: boolean
  // ) {
  //   if (isNextPageCall) {
  //     this.pageNo = pageNo;
  //   } else {
  //     this.holdTask = [];
  //     this.allHoldTask = [];
  //     this.pageNo = 1;
  //   }
  //   const taskItemsList = this.taskMgmtGlobalDataService.getTaskItemsList(
  //     this.itemId,
  //     "Hold"
  //   );
  //   if (taskItemsList && !isNextPageCall) {
  //     this.allHoldTask = [];
  //     if (taskItemsList?.taskItemLists?.taskShortDetailsDtoList?.length) {
  //       taskItemsList?.taskItemLists?.taskShortDetailsDtoList.forEach(
  //         (element, i, arr) => {
  //           element.is_selected = false; // is_selected used for select or deselect the checkbox
  //           element.is_checked = false; // is_checked used for select the task timestamp and view the task details
  //           element.is_disabled = false; // is_disabled used for disabled the checkbox
  //           if (i === 0) {
  //             // element.is_selected = true;
  //             element.is_checked = true;
  //           }
  //         }
  //       );
  //       this.totalCount = taskItemsList?.taskItemLists.totalCount;
  //       if (isNextPageCall) {
  //         this.allHoldTask = this.allHoldTask.concat(
  //           taskItemsList?.taskItemLists?.taskShortDetailsDtoList
  //         );
  //       } else {
  //         this.allHoldTask =
  //           taskItemsList?.taskItemLists?.taskShortDetailsDtoList; // added this for client side pagination
  //         this.pagination(0, this.recordsPerPage, false);
  //         this.updateSelection(0, this.holdTask[0]);
  //         this.getTaskById(this.holdTask[0], false);
  //         // this.holdTask = res?.taskShortDetailsDtoList;
  //         // this.checkPagination(res.totalCount, this.holdTask.length);
  //         // this.isTaskLoading = false;
  //       }
  //     }
  //   } else {
  //     if (taskItemsList && isNextPageCall) {
  //       this.pageNo = taskItemsList?.pageNumber + 1;
  //     }
  //     const itemTaskDto: ItemTaskDto = {
  //       // itemId: taskId,
  //       itemIdList: this.itemIds,
  //       executionStates: this.tasksStatus,
  //       workspaceId: this.selectedNode?.workspaceId,
  //       paginationCriteria: {
  //         pageNumber: this.pageNo,
  //       },
  //     };
  //     this.isTaskLoading = true;
  //     this.getTasksByItemIdAndStatusSub = this.tasksManagementService
  //       .getTasksByItemIdAndStatus(itemTaskDto)
  //       .subscribe(
  //         (res) => {
  //           this.isTaskLoading = false;
  //           if (res?.taskShortDetailsDtoList?.length) {
  //             let taskItems: any;
  //             if (isNextPageCall) {
  //               taskItems = {
  //                 taskShortDetailsDtoList:
  //                   taskItemsList?.taskItemLists?.taskShortDetailsDtoList.concat(
  //                     res?.taskShortDetailsDtoList
  //                   ),
  //                 totalCount: res.totalCount,
  //               };
  //             } else {
  //               taskItems = res;
  //             }
  //             const tasksListDto: TaskItemsListDto = {
  //               taskType: "Hold",
  //               itemId: this.itemId,
  //               taskItemLists: taskItems,
  //               pageNumber: this.pageNo,
  //             };
  //             this.taskMgmtGlobalDataService.storeTaskItemsList(tasksListDto); // store data locally
  //             res?.taskShortDetailsDtoList.forEach((element, i, arr) => {
  //               element.is_selected = false; // is_selected used for select or deselect the checkbox
  //               element.is_checked = false; // is_checked used for select the task timestamp and view the task details
  //               element.is_disabled = false; // is_disabled used for disabled the checkbox
  //               if (i === 0) {
  //                 // element.is_selected = true;
  //                 element.is_checked = true;
  //               }
  //             });
  //             this.totalCount = res.totalCount;
  //             if (isNextPageCall) {
  //               this.allHoldTask = this.allHoldTask.concat(
  //                 res?.taskShortDetailsDtoList
  //               );
  //             } else {
  //               this.allHoldTask = res?.taskShortDetailsDtoList; // added this for client side pagination
  //               this.pagination(0, this.recordsPerPage, false);
  //               this.updateSelection(0, this.holdTask[0]);
  //               this.getTaskById(this.holdTask[0], false);
  //               // this.holdTask = res?.taskShortDetailsDtoList;
  //               // this.checkPagination(res.totalCount, this.holdTask.length);
  //             }
  //           }
  //         },
  //         (err: HttpErrorResponse) => {
  //           this.isTaskLoading = false;
  //           if (err.error instanceof Error) {
  //             // handle client side error here
  //           } else {
  //             this.isTaskLoading = false;
  //             // handle server side error here
  //           }
  //         }
  //       );
  //   }
  // }

  getTasksByItemIdAndStatus(
    taskId: number,
    pageNo: number,
    isNextPageCall: boolean
  ) {
    if (isNextPageCall) {
      this.pageNo = pageNo;
    } else {
      this.holdTask = [];
      this.allHoldTask = [];
      this.pageNo = 1;
    }

    const taskItemsList = this.taskMgmtGlobalDataService.getTaskItemsList(
      this.itemId,
      "Hold"
    );

    this.itemSelection$.next({
      taskId,
      pageNo: this.pageNo,
      isNextPageCall,
      taskItemsList,
    });
  }

  /*========== Client Side Pagination ==========*/
  pagination(startIndex: number, endIndex: number, isNextPage: boolean): void {
    this.allHoldTask.slice(startIndex, endIndex).map((item, i) => {
      if (isNextPage) {
        if (this.select_all) {
          item.is_selected = true;
        } else {
          item.is_selected = false;
        }
      }
      this.holdTask.push(item);
    });
  }

  nextPage() {
    const lastIndex = this.holdTask?.length;
    const endIndex = lastIndex + this.recordsPerPage;
    if (this.select_viewed_task) {
      this.selectViewedTasks();
    }
    this.pagination(lastIndex, endIndex, true);
    if (this.holdTask?.length) {
      this.holdTask.forEach((item) => {
        if (item?.is_selected && this.currentTaskStatus === "COMPLETED") {
          item.is_selected = false;
          item.is_disabled = true;
          this.getTaskById(item, false);
        }
      });
    }
    if (
      this.holdTask?.length === this.allHoldTask?.length &&
      this.totalCount > this.allHoldTask?.length
    ) {
      // this.pageNo++;
      // this.getTasksByItemIdAndStatus(null, this.pageNo, true);
      if (this.holdTask?.length === 5000 || this.holdTask?.length > 5000) {
        this.messageService.add({
          key: "TaskMgmtInfoKey",
          severity: "info",
          summary: "",
          detail:
            "Please handle these current tasks and then refresh to load more tasks!",
        });
      } else {
        this.pageNo++;
        this.getTasksByItemIdAndStatus(null, this.pageNo, true);
      }
    }
  }
  /*========== END Client Side Pagination ==========*/

  // getNextPageUser(event) {
  //   this.pageNo++;
  //   const itemTaskDto: ItemTaskDto = {
  //     itemId: this.itemId,
  //     executionStates: this.tasksStatus,
  //     paginationCriteria: {
  //       pageNumber: this.pageNo
  //     }
  //   };
  //   this.getTasksByItemIdAndStatusSub = this.tasksManagementService.getTasksByItemIdAndStatus(itemTaskDto).subscribe(res => {
  //     res?.taskShortDetailsDtoList.forEach((element, i, arr) => {
  //       if (this.select_all) {
  //         element.is_selected = true;
  //       } else {
  //         element.is_selected = false;
  //       }
  //     });
  //     const holdTaskList = this.holdTask.concat(res?.taskShortDetailsDtoList);
  //     this.holdTask = holdTaskList;
  //     this.checkPagination(res.totalCount, this.holdTask.length);
  //   }, (err: HttpErrorResponse) => {
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }

  // checkPagination(totalCount, arrLength) {
  //   if (arrLength > 0 && totalCount > arrLength) {
  //     this.isMoreResultLinkShow = true;
  //   } else {
  //     this.isMoreResultLinkShow = false;
  //   }
  // }
  /*========== END Get Task By Item and Status ==========*/

  /*============== Select All Task ==============*/
  selectAll() {
    this.select_all = !this.select_all;
    for (let i = 0; i < this.holdTask.length; i++) {
      const item = this.holdTask[i];
      if (!item.is_disabled) {
        item.is_selected = this.select_all;
      }
      this.getSelectedTaskIds(item);
    }
    if (this.select_all) {
      // this.tasksDetailsComponent.getTaskStatus();
    }
    if (!this.select_all) {
      // this.selectedTaskId = '';
      // this.taskIds = [];
      // this.getTasksByItemIdAndStatus(this.selectedNode?.id, 1, false);
      /*---------- After deselected all task not call api -----------*/
      this.holdTask.forEach((element, i, arr) => {
        element.is_selected = false;
        element.is_checked = false;
        if (i === 0) {
          // element.is_selected = true;
          element.is_checked = true;
        }
      });
      this.updateSelection(0, this.holdTask[0]);
      this.getTaskById(this.holdTask[0], false);
      // this.checkPagination(this.totalCount, this.holdTask.length);
    }
  }

  updateSelection(itemIndex: any, task: any) {
    /*---------- commented for multiple selection ----------*/
    this.holdTask.forEach((item, index) => {
      if (Number(itemIndex) === Number(index)) {
        item.is_checked = true;
      } else {
        item.is_checked = false;
      }
      // if (itemIndex !== index) {
      //   item.is_selected = false;
      // }
    });
    this.selectedTaskId = task.taskId;
    this.selectedTaskDetails = task;
    this.workspaceId = task.workspaceId;
    // this.tasksDetailsComponent.getTaskStatus();
    /*------------ Call service log api if service log tab is selected ------------*/
    if (Number(this.activeHoldTaskIndex) === 2) {
      if (this.selectedTaskId !== "") {
        this.serviceLogComponent.getServiceLog(this.selectedTaskId);
      }

      if (this.selectedTaskId === "") {
        this.serviceLogComponent.resetServiceLogs();
      }
    }
    /*------------ Call event log api if event log tab is selected ------------*/
    if (Number(this.activeHoldTaskIndex) === 3) {
      if (this.selectedTaskId !== "") {
        this.eventLogComponent.getEventLog(this.selectedTaskId);
      }

      if (this.selectedTaskId === "") {
        this.eventLogComponent.resetEventLogs();
      }
    }
  }
  /*============== END Select All Task ==============*/

  /*============== Select viewed Task ==============*/
  selectViewedTasks() {
    this.select_viewed_task = !this.select_viewed_task;
    this.isManualSelection = false;
    for (let i = 0; i < this.holdTask.length; i++) {
      const item = this.holdTask[i];
      item.is_selected = this.select_viewed_task;
      this.getSelectedTaskIds(item);
    }
    if (this.select_viewed_task) {
      // this.tasksDetailsComponent.getTaskStatus();
    }
    if (!this.select_viewed_task) {
      // this.selectedTaskId = '';
      // this.taskIds = [];
      // this.getTasksByItemIdAndStatus(this.selectedNode?.id, 1, false);
      /*---------- After deselected all task not call api -----------*/
      this.holdTask.forEach((element, i, arr) => {
        element.is_selected = false;
        element.is_checked = false;
        if (i === 0) {
          // element.is_selected = true;
          element.is_checked = true;
        }
      });
      this.updateSelection(0, this.holdTask[0]);
      this.getTaskById(this.holdTask[0], false);
      // this.checkPagination(this.totalCount, this.failedTask.length);
    }
  }
  /*============== END Select viewed Task ==============*/

  /*=================== Expand/Collaps Workspace Item Tree =====================*/
  expandAll() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.holdWorkspaceTree.forEach((node) => {
        this.expandRecursive(node, true);
      });
    } else {
      this.holdWorkspaceTree.forEach((node) => {
        this.expandRecursive(node, false);
      });
    }
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }
  /*=================== END Expand/Collaps Workspace Item Tree =====================*/

  /*============== Get Task By Id ==============*/
  getTaskById(task: any, isTaskManuallySelected: boolean) {
    // this.taskIds = []; // commented for select multiple task
    if (task) {
      // this.isManualSelection = isTaskManuallySelected;
      // this.selectedTaskId = task.taskId;
      // this.selectedTaskDetails = task;
      // this.workspaceId = task.workspaceId;
      this.getSelectedTaskIds(task);
      // this.tasksDetailsComponent.getTaskStatus();
      // if (!this.taskIds?.length) {
      //   this.isManualSelection = false;
      // }
    }
  }
  /*============== END Get Task By Id ==============*/

  /*========== Get Selected Task Id in Array ==========*/
  getSelectedTaskIds(task: any) {
    if (task.is_selected) {
      this.checkedTaskDetails = task;
      /*----------- We removed status checks for action button that's why comment these 2 lines -----------*/
      // this.tasksDetailsComponent.storeSelectedTaskDetails(task?.taskId);
      // this.tasksDetailsComponent.getSelectedTaskStatus(task);
      this.taskIds.push(task.taskId);
      this.taskIds = this.taskIds.filter(
        (element, i, arr) => i === arr.indexOf(element)
      );
    } else {
      const index = this.taskIds.indexOf(task.taskId);
      if (index > -1) {
        this.taskIds.splice(index, 1);
      }
      /*----------- Code for select last selected task after unchecked task -----------*/
      this.holdTask.forEach((item) => {
        if (
          item?.taskId === this.taskIds[this.taskIds?.length - 1] &&
          item?.is_selected
        ) {
          this.getTaskById(item, this.isManualSelection);
        }
      });
    }
    // if (this.taskIds?.length > 1) {
    //   this.isMultipleTaskSelected = true;
    // } else {
    //   this.isMultipleTaskSelected = false;
    // }
    /*------------- Code for show 'all (number) task or selected (number) tasks' --------------*/
    // this.taskIds?.length ? this.isManualSelection = true : this.isManualSelection = false;
    // if (Number(this.taskIds?.length) === Number(this.totalCount)) {
    //   this.isManualSelection = false;
    // }
  }
  /*========== END Get Selected Task Id in Array ==========*/

  /*============= Show Failed Task Ids ============*/
  showFailedTaskIds(obj: any) {
    const dialogRef = this.dialog.open(TaskIdsListComponent, {
      width: "700px",
      maxHeight: "700px",
      data: obj,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isClosed) {
        this.refershTaskDetails();
      }
    });
  }
  /*============= END Show Failed Task Ids ============*/

  /*============= Add Note ==============*/
  addNote() {
    if (this.nodeType === 'FOLDER') {
      this.checkFoldersItems('AddNotesForAllTasks');
    } else {
      this.updateNote();
    }
  }

  updateNote() {
    let noteData;
    if (this.getNote) {
      this.getNote.isSelectAll = this.select_all;
      if (this.taskIds?.length > 1) {
        this.getNote.multipleSelection = true;
      } else {
        this.getNote.multipleSelection = false;
      }
      noteData = this.getNote;
    } else {
      noteData = {
        isSelectAll: true,
      };
    }
    const dialogRef = this.dialog.open(AddNoteComponent, {
      width: "700px",
      maxHeight: "600px",
      data: noteData,
    });
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateNoteByTaskId(result.newNote);
      }
    });
  }
  /*============= END Add Note ==============*/

  /*============= Start Task ==============*/
  startTask() {
    const dialogRef = this.dialog.open(RestartTaskComponent, {
      width: "800px",
      maxHeight: '95vh',
      height: '95%',
      data: {
        taskId: this.checkedTaskDetails.taskId,
        itemId: this.itemId,
        isStart: true,
        isInteractive: false,
        item: null,
        itemType: this.selectedNode?.nodeType || null,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.startTasks();
      }
    });
  }
  /*============= END Start Task ==============*/

  /*============= Restart Task ==============*/
  restartTask() {
    const dialogRef = this.dialog.open(RestartTaskComponent, {
      width: "800px",
      maxHeight: '95vh',
      height: '95%',
      data: {
        taskId: this.checkedTaskDetails.taskId,
        itemId: this.itemId,
        isStart: false,
        isInteractive: false,
        item: null,
        itemType: this.selectedNode?.nodeType || null,
      },
    });
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.restartTaskById("");
      }
    });
  }
  /*============= END Restart Task ==============*/

  /*============= Mark As Completed ==============*/
  markAsCompleted() {
    if (this.nodeType === 'FOLDER') {
      this.checkFoldersItems('MarkAsComplete');
    } else {
      this.markedTasksCompleted();
    }
  }

  markedTasksCompleted() {
    const dialogRef = this.dialog.open(MarkAsCompletedComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        msg: "Mark the selected task(s) with status Hold as Complete",
      },
    });
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isMarked) {
        this.markTaskAsCompleted(result?.note);
      }
    });
  }
  /*============= END Mark As Completed ==============*/

  // Check Sub Folders Items Includes Or Not
  checkFoldersItems(actionType: string) {
    const dialogRef = this.dialog.open(SubfolderItemsConfirmationComponent, {
      width: "550px",
      maxHeight: "600px",
      data: {
        message: `Do you want to include sub folder(s) items if any?`
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isClosed) {
        this.itemIds = [];
        if (actionType === 'MarkAsComplete') {
          if (result?.isSubFoldersItemsInclude) {
            this.getItemIds(this.selectedNode);
            if (this.itemIds?.length) {
              this.markedTasksCompleted();
            } else {
              this.messageService.add({
                key: "TaskMgmtInfoKey",
                severity: "info",
                summary: "",
                detail: "No tasks found to mark as complete under selected folder",
              });
            }
          } else {
            this.skipSubFoldersItemIds(this.selectedNode);
            if (this.itemIds?.length) {
              this.markedTasksCompleted();
            } else {
              this.messageService.add({
                key: "TaskMgmtInfoKey",
                severity: "info",
                summary: "",
                detail: "No tasks found to mark as complete under selected folder",
              });
            }
          }
        }
      }
      if (actionType === 'AddNotesForAllTasks') {
        if (result?.isSubFoldersItemsInclude) {
          this.getItemIds(this.selectedNode);
          if (this.itemIds?.length) {
            this.updateNote();
          } else {
            this.messageService.add({
              key: "TaskMgmtInfoKey",
              severity: "info",
              summary: "",
              detail: "No tasks found to add a note under selected folder",
            });
          }
        } else {
          this.skipSubFoldersItemIds(this.selectedNode);
          if (this.itemIds?.length) {
            this.updateNote();
          } else {
            this.messageService.add({
              key: "TaskMgmtInfoKey",
              severity: "info",
              summary: "",
              detail: "No tasks found to add a note under selected folder",
            });
          }
        }
      }
    });
  }

  /*============= Stop Task ==============*/
  stopTask() {
    const dialogRef = this.dialog.open(StopTaskComponent, {
      width: "950px",
      maxHeight: "600px",
      data: {
        taskIds: this.taskIds,
        itemId: this.itemId,
        isSelectAll: this.select_all,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.stopTasks(result);
      }
    });
  }
  /*============= END Stop Task ==============*/

  /*============= Release Mutex ==============*/
  releaseMutex() {
    const dialogRef = this.dialog.open(ReleaseMutexComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        taskId: this.checkedTaskDetails.taskId,
        mutexNameList: this.checkedTaskDetails.mutexNameList,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.isTaskLoading = true;
        this.tasksManagementService.releaseMutex(result).subscribe(
          (res) => {
            if (res) {
              this.messageService.add({
                key: "taskMgmtKey",
                severity: "success",
                summary: "",
                detail: "Release Mutex Successfully!",
              });
            }
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // handle client side error here
            } else {
              // handle server side error here
            }
          }
        );
      }
    });
  }
  /*============= END Release Mutex ==============*/

  /*============= Release Mutex By Id ==============*/
  releaseMutexById() {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
    const taskDetailsDto: TaskDetailsDto = {
      taskIdList: this.taskIds,
      note: "",
      updatedBy:
        `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      // itemId: this.itemId,
      itemIdList: this.itemIds,
      allTasksSelected:
        (this.select_all && !this.select_viewed_task) ||
          this.itemIds?.length > 1
          ? true
          : false,
      executionStates: this.tasksStatus,
    };
    // this.isTaskLoading = true;
    this.releaseMutexByTaskIdSub = this.tasksManagementService
      .releaseMutexByTaskId(taskDetailsDto)
      .subscribe(
        (res) => {
          if (res) {
            if (this.select_all) {
              this.select_all = true;
            } else {
              this.select_all = false;
            }
            this.messageService.add({
              key: "taskMgmtKey",
              severity: "success",
              summary: "",
              detail: "Release Mutex Successfully!",
            });
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        }
      );
  }
  /*============= END Release Mutex By Id ==============*/

  /*============= Mark Task As Completed ==============*/
  markTaskAsCompleted(note: string) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
    const comments = `Marked complete by ${this.currentUser.firstName} ${this.currentUser.lastName}: ${note}`;
    const taskDetailsDto: TaskDetailsDto = {
      taskIdList: (this.select_all && !this.select_viewed_task) || this.itemIds?.length > 1 ? [] : this.taskIds,
      note: comments,
      updatedBy:
        `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      // itemId: this.itemId,
      itemIdList: this.itemIds,
      allTasksSelected: (this.select_all && !this.select_viewed_task) || this.itemIds?.length > 1 || this.selectedNode?.nodeType === 'FOLDER' ? true : false,
      executionStates: this.tasksStatus,
    };
    // this.isTaskLoading = true;
    this.markTaskAsCompletedSub = this.tasksManagementService.markTaskAsCompleted(taskDetailsDto).subscribe((res) => {
      if (res) {
        if (this.select_all || this.itemIds?.length > 1 || this.selectedNode?.nodeType === 'FOLDER') {
          if (this.selectedNode?.nodeType !== 'FOLDER') {
            this.tasksDetailsComponent.getTaskStatus();
            this.refershTaskDetails();
          }
          this.select_all = true;

          // If all task is selected then async call is happened and show msg as per response
          this.messageService.add({
            key: "TaskMgmtInfoKey",
            severity: "info",
            summary: "",
            detail: res?.message,
          });
        } else {
          this.select_all = false;

          // If single or multiple task is selected then show failed task id's on popup window else show success msg
          if (res?.length) {
            const holdTasksArr = [];
            const completedTaskArr = [];
            const isTaskFailed = res.some(t => !t?.status);
            if (isTaskFailed) {
              res.forEach(x => {
                if (!x?.status) {
                  holdTasksArr.push(x);
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
                taskIds: holdTasksArr
              };
              this.showFailedTaskIds(failedTaskObj);
              if (this.holdTask?.length && completedTaskArr?.length) {
                this.holdTask.forEach((item) => {
                  completedTaskArr.forEach(cmp => {
                    if (item?.taskId === cmp?.id) {
                      if (item?.is_selected) {
                        item.is_selected = false;
                        item.is_disabled = true;
                        this.getTaskById(item, false);
                      }
                    }
                  });
                });
              }
            } else {
              if (this.holdTask?.length) {
                this.holdTask.forEach((item) => {
                  if (item?.is_selected) {
                    item.is_selected = false;
                    item.is_disabled = true;
                    this.getTaskById(item, false);
                  }
                });
              }
              this.messageService.add({
                key: "taskMgmtKey",
                severity: "success",
                summary: "",
                detail: "Task Marked As Completed Successfully!",
              });
            }
          }
        }


        // if (!res[0].status || !res?.length) {
        //   this.messageService.add({
        //     key: "taskMgmtErrKey",
        //     severity: "error",
        //     summary: "",
        //     detail: "Selected Task(s) are Already Marked As Completed!",
        //   });
        // } else {
        //   if (this.holdTask?.length) {
        //     this.holdTask.forEach((item) => {
        //       if (item?.is_selected) {
        //         item.is_selected = false;
        //         item.is_disabled = true;
        //         this.getTaskById(item, false);
        //       }
        //     });
        //   }
        //   this.messageService.add({
        //     key: "taskMgmtKey",
        //     severity: "success",
        //     summary: "",
        //     detail: "Task Marked As Completed Successfully!",
        //   });
        // }
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Mark Task As Completed ==============*/

  /*========== Get Task Status ==========*/
  // getTaskStatus() {
  //   const taskIdArr = [];
  //   const task = this.selectedTaskDetails;
  //   if (!this.select_all && !this.select_viewed_task && !this.isMultipleTaskSelected) {
  //     taskIdArr.push(task.taskId);
  //   }
  //   const taskDetailsDto: TaskDetailsDto = {
  //     taskIdList: (this.select_all || this.select_viewed_task || this.isMultipleTaskSelected) ? this.taskIds : taskIdArr,
  //     workspaceId: task.workspaceId,
  //     updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
  //     // itemId: this.itemId,
  //     itemIdList: this.itemIds,
  //     allTasksSelected: ((this.select_all && !this.select_viewed_task) || this.itemIds?.length > 1) ? true : false,
  //     executionStates: this.tasksStatus
  //   };
  //   this.getTaskStatusSub = this.tasksManagementService.getTaskStatus(taskDetailsDto).subscribe(res => {
  //     const statusArr = [];
  //     res.forEach(element => {
  //       let objKey = `${Object.keys(element)}`;
  //       const objVal = `${Object.values(element)} ${Object.keys(element)}`;
  //       objKey = objKey.split(' ')[0];
  //       statusArr.push({ [objKey]: objVal });
  //     });
  //     this.selectedTaskStatus = statusArr;
  //   }, (err: HttpErrorResponse) => {
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }
  /*========== END Get Task Status ==========*/

  /*============= Restart Task ==============*/
  restartTaskById(note: string) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
    const taskDetailsDto: TaskDetailsDto = {
      taskIdList: this.taskIds,
      note: note,
      updatedBy:
        `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
    };
    this.tasksManagementService.restartTask(taskDetailsDto).subscribe(
      (res) => {
        this.messageService.add({
          key: "taskMgmtKey",
          severity: "success",
          summary: "",
          detail: "Task Restarted Successfully!",
        });
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      }
    );
  }
  /*============= END Restart Task ==============*/

  /*============= Restart All Tasks =============*/
  restartAllTasks() {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
    const taskDetailsDto: TaskDetailsDto = {
      taskIdList: this.taskIds,
      note: "",
      updatedBy:
        `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      // itemId: this.itemId,
      itemIdList: this.itemIds,
      allTasksSelected:
        (this.select_all && !this.select_viewed_task) ||
          this.itemIds?.length > 1
          ? true
          : false,
      executionStates: this.tasksStatus,
    };
    this.tasksManagementService.restartAllTask(taskDetailsDto).subscribe(
      (res) => {
        this.messageService.add({
          key: "taskMgmtKey",
          severity: "success",
          summary: "",
          detail: "All Task Restarted Successfully!",
        });
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      }
    );
  }
  /*============= END Restart All Tasks =============*/

  /*============= Start Task ==============*/
  startTasks() {
    const ParameterDto = {};
    const startTaskDetailsDto: StartTaskDetailsDto = {
      workspaceID: null,
      tiesItemID: null,
      parameterDto: ParameterDto,
      currentScript: 1,
      teisItemType: "",
      priority: null,
      updatedTriggerConfigList: [],
    };
    this.startTaskSub = this.tasksManagementService
      .startTask(startTaskDetailsDto)
      .subscribe(
        (res) => {
          this.messageService.add({
            key: "taskMgmtKey",
            severity: "success",
            summary: "",
            detail: "Task Started Successfully!",
          });
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        }
      );
  }
  /*============= END Start Task ==============*/

  /*============= Update Note By Task Id ==============*/
  updateNoteByTaskId(note: string) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
    const taskDetailsDto: TaskDetailsDto = {
      taskIdList: (this.select_all && !this.select_viewed_task) || this.itemIds?.length > 1 ? [] : this.taskIds,
      note: note,
      updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      // itemId: this.itemId,
      itemIdList: this.itemIds,
      allTasksSelected: (this.select_all && !this.select_viewed_task) || this.itemIds?.length > 1 || this.selectedNode?.nodeType === 'FOLDER' ? true : false,
      executionStates: this.tasksStatus,
    };
    this.updateNoteByTaskIdSub = this.tasksManagementService.updateNoteByTaskId(taskDetailsDto).subscribe((res) => {
      if (res) {
        if (this.select_all || this.itemIds?.length > 1 || this.selectedNode?.nodeType === 'FOLDER') {
          this.messageService.add({
            key: "TaskMgmtInfoKey",
            severity: "info",
            summary: "",
            detail: res?.message,
          });
        } else {
          const holdTasksArr = [];
          if (this.selectedTaskId) {
            this.serviceLogComponent.getServiceLog(this.selectedTaskId);
          }

          const isTaskHold = res.some(t => !t?.status);
          if (isTaskHold) {
            res.forEach(x => {
              if (!x?.status) {
                holdTasksArr.push(x);
              }
            });
            const holdTaskObj = {
              message: `
                        One or several task actions could not be performed.<br/>
                        <b>Reason:</b> Task status has changed.<br/>
                        Refresh to check the current status.
                        `,
              taskIds: holdTasksArr
            };
            this.showFailedTaskIds(holdTaskObj);
          } else {
            if (this.selectedNode?.nodeType !== 'FOLDER') {
              this.tasksDetailsComponent.getTaskStatus();
            }
            this.messageService.add({
              key: "taskMgmtKey",
              severity: "success",
              summary: "",
              detail: "Note Added Successfully!",
            });
          }
        }
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Update Note By Task Id ==============*/

  /*============= Stop Tasks ===============*/
  stopTasks(stopData: any) {
    stopData?.stopTaskList.forEach((item) => {
      item.workspaceId = this.workspaceId;
    });
    const taskUpdateDto = stopData?.stopTaskList;
    this.tasksManagementService.stopTask(taskUpdateDto).subscribe(
      (res) => {
        if (res) {
          this.messageService.add({
            key: "taskMgmtKey",
            severity: "success",
            summary: "",
            detail: "Task Stopped Successfully!",
          });
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      }
    );
  }
  /*============= END Stop Tasks ===============*/

  /*=========== Refersh Task Details ===========*/
  refershTaskDetails() {
    this.select_all = false;
    this.taskIds = [];
    this.holdTask = [];
    this.allHoldTask = [];
    this.totalCount = 0;
    this.taskMgmtGlobalDataService.clearTaskItemsList();
    this.getTasksByItemIdAndStatus(null, 1, false);
    // this.taskMgmtGlobalDataService.clearTaskDetailsArr(
    //   this.selectedTaskId,
    //   "Hold"
    // );
    // this.taskMgmtGlobalDataService.clearIntegrationById(this.itemId, "Hold");
    // this.taskMgmtGlobalDataService.clearProcessById(this.itemId, "Hold");
    // this.taskMgmtGlobalDataService.clearIntegrationProcessById(
    //   this.workspaceId,
    //   this.itemId,
    //   "Hold"
    // );
    // this.taskMgmtGlobalDataService.clearTriggerById(this.itemId, "Hold");
    // this.taskMgmtGlobalDataService.clearIntegrationTriggerById(
    //   this.workspaceId,
    //   this.itemId,
    //   "Hold"
    // );
    // this.taskMgmtGlobalDataService.clearServiceLogs(
    //   this.selectedTaskId,
    //   "Hold"
    // );
    // this.taskMgmtGlobalDataService.clearEventLogs(this.selectedTaskId, "Hold");
    if (this.selectedNode?.nodeType !== 'FOLDER') {
      this.isActionBtnEnable = false;
      if (this.activeHoldTaskIndex === 0) {
        this.taskMgmtGlobalDataService.clearTaskDetailsArr(
          this.selectedTaskId,
          "Hold"
        );
        this.tasksDetailsComponent.refershDetails(this.selectedTaskId);
        this.tasksDetailsComponent.getTaskStatus();
      } else if (this.activeHoldTaskIndex === 1) {
        if (this.nodeType === 'INTEGRATION') {
          this.taskMgmtGlobalDataService.clearIntegrationById(
            this.itemId,
            "Hold"
          );
        } else if (this.nodeType === 'PROCESS') {
          this.taskMgmtGlobalDataService.clearProcessById(this.itemId, "Hold");
          this.taskMgmtGlobalDataService.clearIntegrationProcessById(
            this.workspaceId,
            this.itemId,
            "Hold"
          );

        } else if (this.nodeType === 'TRIGGER') {
          this.taskMgmtGlobalDataService.clearTriggerById(this.itemId, "Hold");
          this.taskMgmtGlobalDataService.clearIntegrationTriggerById(
            this.workspaceId,
            this.itemId,
            "Hold"
          );
        }

        this.generalInformationComponent.refershGenInfo(
          this.workspaceId,
          this.itemId,
          this.nodeType
        );

      } else if (this.activeHoldTaskIndex === 2) {
        this.taskMgmtGlobalDataService.clearServiceLogs(
          this.selectedTaskId,
          "Hold"
        );
        // this.serviceLogComponent.getServiceLog(this.selectedTaskId);
      } else if (this.activeHoldTaskIndex === 3) {
        this.taskMgmtGlobalDataService.clearEventLogs(
          this.selectedTaskId,
          "Hold"
        );
        // this.eventLogComponent.getEventLog(this.selectedTaskId);
      }
      // this.tasksDetailsComponent.refershDetails(this.selectedTaskId);
      // this.tasksDetailsComponent.getTaskStatus();
      // this.generalInformationComponent.refershGenInfo(
      //   this.workspaceId,
      //   this.itemId,
      //   this.nodeType
      // );
      // this.serviceLogComponent.getServiceLog(this.selectedTaskId);
      // this.eventLogComponent.getEventLog(this.selectedTaskId);
    }
  }
  /*=========== END Refersh Task Details ===========*/

  ngOnDestroy() {
    // this.holdWorkspaceTree = [];
    this.taskIds = [];
    this.itemIds = [];
    this.getWorkspaceByUsernameSub.unsubscribe();
    this.getWorkspaceTreeByStatusSub.unsubscribe();
    this.getTasksByItemIdAndStatusSub.unsubscribe();
    this.releaseMutexByTaskIdSub.unsubscribe();
    this.markTaskAsCompletedSub.unsubscribe();
    this.startTaskSub.unsubscribe();
    this.restartTaskSub.unsubscribe();
    this.updateNoteByTaskIdSub.unsubscribe();
    this.getTaskStatusSub.unsubscribe();
  }
}
