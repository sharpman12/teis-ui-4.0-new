import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ServerQueuesComponent } from '../server-queues/server-queues.component';
import { ServerItemCacheComponent } from '../server-item-cache/server-item-cache.component';
import { ServerTaskCacheComponent } from '../server-task-cache/server-task-cache.component';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ServerOverviewDataService } from '../../server-overview-data.service';
import { ServerDlqQueuesComponent } from '../server-dlq-queues/server-dlq-queues.component';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-server-comp',
  templateUrl: './server-comp.component.html',
  styleUrls: ['./server-comp.component.scss']
})
export class ServerCompComponent implements OnInit, OnDestroy {
  activeTab: number = 0;
  serverOverviewActiveTab: number = 0;
  currentTabIndex: number = 0;
  haveProcessingAndDlqQueueAccess: boolean = false;
  haveProcessingItemCacheAccess: boolean = false;
  haveProcessingTaskCacheAccess: boolean = false;

  @ViewChild(ServerQueuesComponent, { static: false }) serverQueuesComponent: ServerQueuesComponent;
  @ViewChild(ServerItemCacheComponent, { static: false }) serverItemCacheComponent: ServerItemCacheComponent;
  @ViewChild(ServerTaskCacheComponent, { static: false }) serverTaskCacheComponent: ServerTaskCacheComponent;
  @ViewChild(ServerDlqQueuesComponent, { static: false }) serverDlqQueuesComponent: ServerDlqQueuesComponent;

  constructor(
    private router: Router,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    private sharedService: SharedService,
    private serverOverviewDataService: ServerOverviewDataService
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/processingOverview/server') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.sharedService.isChangeBgColor.next(true);
    if (localStorage.getItem(Constants.PROCESSING_OVERVIEW_SERVER_QUEUE)) {
      this.haveProcessingAndDlqQueueAccess = true;
    }
    if (localStorage.getItem(Constants.PROCESSING_OVERVIEW_SERVER_ITEM_CACHE)) {
      this.haveProcessingItemCacheAccess = true;
    }
    if (localStorage.getItem(Constants.PROCESSING_OVERVIEW_SERVER_TASK_CACHE)) {
      this.haveProcessingTaskCacheAccess = true;
    }
  }

  handleChange(index: number) {
    this.currentTabIndex = index;
    if (index === 0) {

    }
    if (index === 1) {
      this.serverItemCacheComponent.getWorkspacesByUser();
    }
    if (index === 2) {
      this.serverTaskCacheComponent.getWorkspacesByUser();
    }
    if (index === 3) {
      this.serverDlqQueuesComponent.getDlqQueuesCounts();
    }
  }

  refreshServerOverview() {
    // this.serverOverviewDataService.clearWorkspaces();
    // this.serverOverviewDataService.clearWorkspaceId();
    this.serverOverviewDataService.clearItemCacheInfo();
    this.serverOverviewDataService.clearTaskCacheInfo();
    if (this.currentTabIndex === 0) {
      this.serverQueuesComponent.getQueueCounts();
    }
    if (this.currentTabIndex === 1) {
      this.serverItemCacheComponent.refreshItemCacheDetails();
    }
    if (this.currentTabIndex === 2) {
      this.serverTaskCacheComponent.getWorkspacesByUser();
    }
  }

  ngOnDestroy(): void {

  }
}
