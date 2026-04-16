import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { HeaderService } from 'src/app/core/service/header.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ServerQueuesComponent } from './server-queues/server-queues.component';
import { ServerItemCacheComponent } from './server-item-cache/server-item-cache.component';
import { ServerTaskCacheComponent } from './server-task-cache/server-task-cache.component';
import { ServerOverviewDataService } from '../server-overview-data.service';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-server-overview',
  templateUrl: './server-overview.component.html',
  styleUrls: ['./server-overview.component.scss']
})
export class ServerOverviewComponent implements OnInit {
  navbarOpen = false;
  haveProcessingAndDlqQueueAccess: boolean = false;
  haveProcessingItemCacheAccess: boolean = false;
  haveProcessingTaskCacheAccess: boolean = false;
  haveProcessEngineAccess: boolean = false;
  haveWebServiceAccess: boolean = false;

  constructor(
    private router: Router,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    private sharedService: SharedService,
    private serverOverviewDataService: ServerOverviewDataService
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/processingOverview/server') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.sharedService.isChangeBgColor.next(true);
    this.sharedService.showMenuBar.subscribe(res => {
      this.navbarOpen = res;
    });
    if (localStorage.getItem(Constants.PROCESSING_OVERVIEW_SERVER_QUEUE)) {
      this.haveProcessingAndDlqQueueAccess = true;
    }
    if (localStorage.getItem(Constants.PROCESSING_OVERVIEW_SERVER_ITEM_CACHE)) {
      this.haveProcessingItemCacheAccess = true;
    }
    if (localStorage.getItem(Constants.PROCESSING_OVERVIEW_SERVER_TASK_CACHE)) {
      this.haveProcessingTaskCacheAccess = true;
    }
    if (localStorage.getItem(Constants.PROCESSING_OVERVIEW_PROCESS_ENGINE)) {
      this.haveProcessEngineAccess = true;
    }
    if (localStorage.getItem(Constants.PROCESSING_OVERVIEW_WEB_SERVICE)) {
      this.haveWebServiceAccess = true;
    }

    if (this.haveProcessingAndDlqQueueAccess || this.haveProcessingItemCacheAccess || this.haveProcessingTaskCacheAccess) {
      this.router.navigate(['/processingOverview/server']);
    } else if (this.haveProcessEngineAccess) {
      this.router.navigate(['/processingOverview/processEngine']);
    } else if (this.haveWebServiceAccess) {
      this.router.navigate(['/processingOverview/webServices']);
    }
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }
}
