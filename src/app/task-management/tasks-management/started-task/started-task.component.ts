import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { TasksDetailsComponent } from '../tasks-details/tasks-details.component';
import { TasksManagementService } from '../tasks-management.service';
import { Workspaceitemstree } from '../workspaceitemstree';
import { take } from 'rxjs/operators';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-started-task',
  templateUrl: './started-task.component.html',
  styleUrls: ['./started-task.component.scss']
})
export class StartedTaskComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tabIndex: number;
  isExpanded = true;
  startedWorkspaceTree: TreeNode[] = [];
  selectedFile: TreeNode;
  workspaceId: number;
  nodeType: string;
  selectedNode: any;
  itemId: number;
  timeFrameList = [
    { id: 'now-1Hours', value: 'now-1Hours' },
    { id: 'Today', value: 'Today' },
    { id: 'Tomorrow', value: 'Tomorrow' },
    { id: 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss', value: 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss' },
  ];
  timeFrameForm: UntypedFormGroup;
  selectedTimeFrame: string;
  minDate = new Date();
  isDateRangeShow = false;
  isGenInfoShow = false;
  isErrMsgShow = false;
  rootId: any;
  workspaces = [];
  isTimeframeShown = false;
  selectedWSId = [];
  selectedWs: any;
  currentUser: any = null;

  getWorkspaceTreeByStatusSub = Subscription.EMPTY;

  @ViewChild(TasksDetailsComponent) tasksDetailsComponent: TasksDetailsComponent;

  constructor(
    private tasksManagementService: TasksManagementService,
    private fb: UntypedFormBuilder,
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnChanges(): void {
    if (this.tabIndex === 3) {
      if (!this.startedWorkspaceTree.length && !this.workspaces?.length) {
        this.getWorkspacesByUsername();
        // this.defaultSelection();

        // this.timeFrameForm.get('timeFrame').valueChanges.subscribe(res => {
        //   if (res === 'now-1Hours') {
        //     this.isExpanded = true;
        //     this.isErrMsgShow = false;
        //     this.isGenInfoShow = false;
        //     this.selectedTimeFrame = '';
        //     this.isDateRangeShow = false;
        //     this.startedWorkspaceTree = [];
        //     const now = new Date();
        //     const next1hours = new Date();
        //     next1hours.setHours(next1hours.getHours() + 1);
        //     const now_1Hours = `${this.getDateFormat(now)} to ${this.getDateFormat(next1hours)}`;
        //     this.selectedTimeFrame = now_1Hours;
        //     this.getWorkspaceTree(now_1Hours, now_1Hours);
        //   }
        //   if (res === 'Today') {
        //     this.isExpanded = true;
        //     this.isErrMsgShow = false;
        //     this.isGenInfoShow = false;
        //     this.selectedTimeFrame = '';
        //     this.isDateRangeShow = false;
        //     this.startedWorkspaceTree = [];
        //     const now = new Date();
        //     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        //     const now_today = `${this.getDateFormat(now)} to ${this.getDateFormat(today)}`;
        //     this.selectedTimeFrame = now_today;
        //     this.getWorkspaceTree(now_today, now_today);
        //   }
        //   if (res === 'Tomorrow') {
        //     this.isExpanded = true;
        //     this.isErrMsgShow = false;
        //     this.isGenInfoShow = false;
        //     this.selectedTimeFrame = '';
        //     this.isDateRangeShow = false;
        //     this.startedWorkspaceTree = [];
        //     const dt = new Date();
        //     const now = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1, 0, 0, 0);
        //     const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        //     const now_tomorrow = `${this.getDateFormat(now)} to ${this.getDateFormat(tomorrow)}`;
        //     this.selectedTimeFrame = now_tomorrow;
        //     this.getWorkspaceTree(now_tomorrow, now_tomorrow);
        //   }
        //   if (res === 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss') {
        //     this.isExpanded = true;
        //     this.isErrMsgShow = false;
        //     this.isGenInfoShow = false;
        //     this.selectedTimeFrame = '';
        //     this.isDateRangeShow = true;
        //     this.startedWorkspaceTree = [];
        //     let fromDate = '';
        //     let toDate = '';
        //     this.timeFrameForm.get('fromDate').reset();
        //     this.timeFrameForm.get('toDate').reset();
        //     this.timeFrameForm.get('toDate').disable();
        //     this.timeFrameForm.get('fromDate').valueChanges.pipe(take(1)).subscribe(startDate => {
        //       fromDate = startDate;
        //       if (startDate) {
        //         this.isErrMsgShow = true;
        //         this.timeFrameForm.get('toDate').enable();
        //         this.timeFrameForm.get('toDate').valueChanges.pipe(take(1)).subscribe(endDate => {
        //           toDate = endDate;
        //           if (toDate) {
        //             this.isErrMsgShow = false;
        //           }
        //           if (fromDate && toDate) {
        //             const custom_date = `${this.getDateFormat(fromDate)} to ${this.getDateFormat(toDate)}`;
        //             this.selectedTimeFrame = custom_date;
        //             // this.getWorkspaceTree(custom_date, custom_date);
        //           }
        //         });
        //       }
        //     });
        //   }
        // });
      }
    }
  }

  ngOnInit(): void {
    this.createForm();
  }

  /*========= Get Worksapces By Current User =========*/
  getWorkspacesByUsername() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    const accessWorkspacesArr = [];
    let defaultWorkspaceId = null;
    this.tasksManagementService.getWorkspacesByUser(currentUser?.userName).subscribe((res) => {
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
        this.workspaces.forEach(item => {
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
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  changeWorkspace(workspaceIds: Array<string>) {
    if (workspaceIds?.length) {
      this.startedWorkspaceTree = [];
      this.isTimeframeShown = true;
      this.selectedWSId = workspaceIds;
      this.defaultSelection();
      this.timeFrameForm.get('timeFrame').enable();
    } else {
      // this.startedWorkspaceTree = [];
      // this.isTimeframeShown = false;
      // this.selectedTimeFrame = '';
      // this.timeFrameForm.get('timeFrame').reset();
      // this.timeFrameForm.get('timeFrame').disable();
      this.refershStartedItems(false);
    }
  }

  /*========= Change Timeframe =========*/
  changeTimeframe(timeFrame: string) {
    if (timeFrame === 'now-1Hours') {
      this.isExpanded = true;
      this.isErrMsgShow = false;
      this.isGenInfoShow = false;
      this.selectedTimeFrame = '';
      this.isDateRangeShow = false;
      this.startedWorkspaceTree = [];
      const now = new Date();
      const next1hours = new Date();
      next1hours.setHours(next1hours.getHours() + 1);
      const now_1Hours = `${this.getDateFormat(now)} to ${this.getDateFormat(next1hours)}`;
      this.selectedTimeFrame = now_1Hours;
      this.getWorkspaceTree(now_1Hours, now_1Hours, this.selectedWSId);
    }
    if (timeFrame === 'Today') {
      this.isExpanded = true;
      this.isErrMsgShow = false;
      this.isGenInfoShow = false;
      this.selectedTimeFrame = '';
      this.isDateRangeShow = false;
      this.startedWorkspaceTree = [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const now_today = `${this.getDateFormat(now)} to ${this.getDateFormat(today)}`;
      this.selectedTimeFrame = now_today;
      this.getWorkspaceTree(now_today, now_today, this.selectedWSId);
    }
    if (timeFrame === 'Tomorrow') {
      this.isExpanded = true;
      this.isErrMsgShow = false;
      this.isGenInfoShow = false;
      this.selectedTimeFrame = '';
      this.isDateRangeShow = false;
      this.startedWorkspaceTree = [];
      const dt = new Date();
      const now = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + 1, 0, 0, 0);
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      const now_tomorrow = `${this.getDateFormat(now)} to ${this.getDateFormat(tomorrow)}`;
      this.selectedTimeFrame = now_tomorrow;
      this.getWorkspaceTree(now_tomorrow, now_tomorrow, this.selectedWSId);
    }
    if (timeFrame === 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss') {
      this.isExpanded = true;
      this.isErrMsgShow = false;
      this.isGenInfoShow = false;
      this.selectedTimeFrame = '';
      this.isDateRangeShow = true;
      this.startedWorkspaceTree = [];
      let fromDate = '';
      let toDate = '';
      this.timeFrameForm.get('fromDate').reset();
      this.timeFrameForm.get('toDate').reset();
      this.timeFrameForm.get('toDate').disable();
      this.timeFrameForm.get('fromDate').valueChanges.pipe(take(1)).subscribe(startDate => {
        fromDate = startDate;
        if (startDate) {
          this.isErrMsgShow = true;
          this.timeFrameForm.get('toDate').enable();
          this.timeFrameForm.get('toDate').valueChanges.pipe(take(1)).subscribe(endDate => {
            toDate = endDate;
            if (toDate) {
              this.isErrMsgShow = false;
            }
            if (fromDate && toDate) {
              const custom_date = `${this.getDateFormat(fromDate)} to ${this.getDateFormat(toDate)}`;
              this.selectedTimeFrame = custom_date;
              // this.getWorkspaceTree(custom_date, custom_date);
            }
          });
        }
      });
    }
  }

  defaultSelection() {
    this.startedWorkspaceTree = [];
    this.timeFrameForm.patchValue({
      timeFrame: this.timeFrameList[0].id,
    });
    this.isGenInfoShow = false;
    this.selectedTimeFrame = '';
    this.isDateRangeShow = false;
    const now = new Date();
    const next1hours = new Date();
    next1hours.setHours(next1hours.getHours() + 1);
    const now_1Hours = `${this.getDateFormat(now)} to ${this.getDateFormat(next1hours)}`;
    this.selectedTimeFrame = now_1Hours;
    this.getWorkspaceTree(now_1Hours, now_1Hours, this.selectedWSId);
  }

  getDateFormat(date: any): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  createForm() {
    this.timeFrameForm = this.fb.group({
      timeFrame: [{ value: '', disabled: true }, {
        validators: []
      }],
      fromDate: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      toDate: [{ value: '', disabled: true }, {
        validators: [Validators.required]
      }],
    });
  }

  /*========= Refersh Started Items ==========*/
  refershStartedItems(isRefresh: boolean) {
    this.nodeType = '';
    this.isGenInfoShow = false;
    this.startedWorkspaceTree = [];
    this.isTimeframeShown = false;
    this.selectedTimeFrame = '';
    this.timeFrameForm.get('timeFrame').reset();
    this.timeFrameForm.get('timeFrame').disable();
    if (isRefresh) {
      // this.selectedWs = '';
      // this.getWorkspacesByUsername();
      // this.defaultSelection();
      this.changeWorkspace(this.selectedWs);
    }
  }
  /*========= END Refersh Started Items ==========*/

  expandAll() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.startedWorkspaceTree.forEach(node => {
        this.expandRecursive(node, true);
      });
    } else {
      this.startedWorkspaceTree.forEach(node => {
        this.expandRecursive(node, false);
      });
    }
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  /*========== Get Workspace Tree By Status ==========*/
  getWorkspaceTree(actualTimeFrame: string, timeFrame: string, workspaceIds: Array<string>) {
    const serviceLogDto = {
      // actualTimeFrame: actualTimeFrame,
      // applyAccess: true,
      // defaultValue: false,
      // description: '',
      // error: false,
      // errorCount: 0,
      // id: null,
      // items: null,
      // logType: 'Message',
      // name: '',
      // pageNo: 1,
      // searchText: '',
      timeFrame: timeFrame,
      workspaceIds: workspaceIds
    };
    this.getWorkspaceTreeByStatusSub = this.tasksManagementService.getWorkspaceTreeForTriggers(serviceLogDto).subscribe(res => {
      this.startedWorkspaceTree = [];
      const workspaceItems = res;
      workspaceItems.forEach(element => {
        let nodeArray: TreeNode;
        nodeArray = new Workspaceitemstree(element, 0);
        this.setRootId(nodeArray);
        this.startedWorkspaceTree.push(nodeArray);
        // this.nodeSelect(this.selectTreeNode(nodeArray));
        // if (this.nodeArr?.length) {
        //   this.selectedFile = this.nodeArr[0];
        // }
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*========== END Get Workspace Tree By Status ==========*/

  /*=================== Set Root Node Id To Child Node ===================*/
  private setRootId(node: any) {
    if (node?.nodeType === 'WORKSPACE') {
      this.rootId = node?.id;
    }
    node.rootId = this.rootId;
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setRootId(node.children[m]);
      }
    }
  }
  /*=================== END Set Root Node Id To Child Node ===================*/

  /*============= Select Tree Node =============*/
  nodeSelect(item: any) {
    this.workspaceId = 0;
    this.selectedNode = '';
    this.itemId = 0;
    this.nodeType = '';
    this.isGenInfoShow = true;
    this.selectedNode = item;
    this.itemId = item?.id;
    this.nodeType = item?.nodeType;
    this.workspaceId = item?.rootId;
  }
  /*============= END Select Tree Node =============*/

  /*============= Unselected Tree Node =============*/
  nodeUnselect(item: any) {
    // console.log('UnSeletced', this.selectedFile);
  }
  /*============= END Unselected Tree Node =============*/

  search(formValue) {
    if (formValue?.fromDate && formValue?.toDate) {
      const custom_date = `${this.getDateFormat(formValue?.fromDate)} to ${this.getDateFormat(formValue?.toDate)}`;
      this.selectedTimeFrame = custom_date;
      this.getWorkspaceTree(custom_date, custom_date, this.selectedWSId);
    }
  }

  ngOnDestroy(): void {
    this.getWorkspaceTreeByStatusSub.unsubscribe();
  }

}
