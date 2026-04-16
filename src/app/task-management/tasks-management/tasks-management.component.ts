import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { HeaderService } from 'src/app/core/service/header.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { FailedTaskComponent } from './failed-task/failed-task.component';
import { HoldTaskComponent } from './hold-task/hold-task.component';
import { RunningTaskComponent } from './running-task/running-task.component';
import { StartedTaskComponent } from './started-task/started-task.component';
import { TaskMgmtGlobalDataService } from './task-mgmt-global-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks-management',
  templateUrl: './tasks-management.component.html',
  styleUrls: ['./tasks-management.component.scss']
})
export class TasksManagementComponent implements OnInit, OnDestroy {
  selectedTabIndex = 0;
  isItemShow = true;
  isFailedItemShow = true;
  isRunningItemShow = true;
  isHoldItemShow = true;

  @ViewChild(FailedTaskComponent, {static: false}) failedItems: FailedTaskComponent;
  @ViewChild(RunningTaskComponent, {static: false}) runningItems: RunningTaskComponent;
  @ViewChild(HoldTaskComponent, {static: false}) holdItems: HoldTaskComponent;
  @ViewChild(StartedTaskComponent, {static: false}) startedItems: StartedTaskComponent;

  constructor(
    private router: Router,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
    public cd: ChangeDetectorRef,
    private taskMgmtGlobalDataService: TaskMgmtGlobalDataService
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/task_management') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.breadcrumb.visible = false;
    // this.breadcrumb.previous(); // show hide breadcrumb
    // this.breadcrumb.hide();

    this.sharedService.isChangeBgColor.next(true);
  }

  handleChange(e) {
    const index = e.index;
    if (index === 0) {
      this.selectedTabIndex = 0;
      // this.failedItems.getWorkspacesByUsername();
    }
    if (index === 1) {
      this.selectedTabIndex = 1;
      // this.runningItems.getWorkspacesByUsername();
    }
    if (index === 2) {
      this.selectedTabIndex = 2;
      // this.holdItems.getWorkspacesByUsername();
    }
    if (index === 3) {
      this.selectedTabIndex = 3;
    }
  }

  refershItems() {
    this.taskMgmtGlobalDataService.clearWorkspaceTree();
    this.taskMgmtGlobalDataService.clearTaskItemsList();
    this.taskMgmtGlobalDataService.clearTaskDetailsArr(null, 'All');
    this.taskMgmtGlobalDataService.clearIntegrationById(null, 'All');
    this.taskMgmtGlobalDataService.clearProcessById(null, 'All');
    this.taskMgmtGlobalDataService.clearIntegrationProcessById(null, null, 'All');
    this.taskMgmtGlobalDataService.clearTriggerById(null, 'All');
    this.taskMgmtGlobalDataService.clearIntegrationTriggerById(null, null, 'All');
    this.taskMgmtGlobalDataService.clearServiceLogs(null, 'All');
    this.taskMgmtGlobalDataService.clearEventLogs(null, 'All');
    if (this.selectedTabIndex === 0) {
      this.failedItems.refershFailedItems(true);
    }
    if (this.selectedTabIndex === 1) {
      this.runningItems.refershRunningItems(true);
    }
    if (this.selectedTabIndex === 2) {
      this.holdItems.refershHoldItems(true);
    }
    if (this.selectedTabIndex === 3) {
      this.startedItems.refershStartedItems(true);
    }
  }

  toggleItems() {
    if (this.selectedTabIndex === 0) {
      this.isFailedItemShow = !this.isFailedItemShow;
    }
    if (this.selectedTabIndex === 1) {
      this.isRunningItemShow = !this.isRunningItemShow;
    }
    if (this.selectedTabIndex === 2) {
      this.isHoldItemShow = !this.isHoldItemShow;
    }
  }

  ngOnDestroy() {
    this.sharedService.isChangeBgColor.next(false);
    this.taskMgmtGlobalDataService.clearWorkspaceTree();
    this.taskMgmtGlobalDataService.clearTaskItemsList();
    this.taskMgmtGlobalDataService.clearTaskDetailsArr(null, 'All');
    this.taskMgmtGlobalDataService.clearIntegrationById(null, 'All');
    this.taskMgmtGlobalDataService.clearProcessById(null, 'All');
    this.taskMgmtGlobalDataService.clearIntegrationProcessById(null, null, 'All');
    this.taskMgmtGlobalDataService.clearTriggerById(null, 'All');
    this.taskMgmtGlobalDataService.clearIntegrationTriggerById(null, null, 'All');
    this.taskMgmtGlobalDataService.clearServiceLogs(null, 'All');
    this.taskMgmtGlobalDataService.clearEventLogs(null, 'All');
  }

}
