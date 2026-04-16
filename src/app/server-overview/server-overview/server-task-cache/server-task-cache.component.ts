import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Workspace } from 'src/app/application-integration/app-integration/appintegration';
import { ServerOverviewService } from '../../server-overview.service';
import { Constants } from 'src/app/shared/components/constants';
import { ServerOverviewDataService } from '../../server-overview-data.service';
import { ProgressiveLoaderService } from 'src/app/core/service/progressiveloader.service';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-server-task-cache',
  templateUrl: './server-task-cache.component.html',
  styleUrls: ['./server-task-cache.component.scss']
})
export class ServerTaskCacheComponent implements OnInit, OnDestroy {
  currentUser: any;
  workspaces: Array<Workspace> = [];
  selectedTaskCacheWorkspaceId: number = 1;
  taskCacheDetails: any = null;

  // Pie chart
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabels = [];
  public pieChartDatasets = [];
  public pieChartLegend = true;
  public pieChartPlugins = [];

  getWorkspacesSub = Subscription.EMPTY;
  getTaskCacheDetailsSub = Subscription.EMPTY;

  constructor(
    public loaderService: ProgressiveLoaderService,
    private serverOverviewService: ServerOverviewService,
    private serverOverviewDataService: ServerOverviewDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.getWorkspaces();
  }

  refreshTaskCacheWorkspaceList() {
    this.serverOverviewDataService.clearWorkspaces();
    this.serverOverviewDataService.clearWorkspaceIdTaskCache();
    this.getWorkspaces();
  }

  refreshTaskCacheDetails() {
    this.serverOverviewDataService.clearTaskCacheInfo();
    setTimeout(() => {
      this.getTaskCacheDetails(this.selectedTaskCacheWorkspaceId);
    }, 0);
  }

  /*============ Get Workspaces By Username ============*/
  getWorkspacesByUser() {
    const workspaces = this.serverOverviewDataService.getWorkspaces();
    if (workspaces?.length) {
      // Get workspaces as per login user have access
      this.getValidateWorkspaces(JSON.parse(JSON.stringify(workspaces)));
    } else {
      this.getWorkspaces();
    }
  }

  getWorkspaces() {
    this.getWorkspacesSub = this.serverOverviewService.getWorkspacesByUsername(this.currentUser?.userName).subscribe((res) => {
      if (res?.length) {
        // Get workspaces as per login user have access
        this.getValidateWorkspaces(JSON.parse(JSON.stringify(res)));
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  // Validate workspaces as per login user access
  getValidateWorkspaces(workspaces: Array<any>) {
    let defaultWS = null;
    const accessWorkspacesArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;

    if (workspaces?.length && accessWorkspaces?.length) {
      // Filter out archived workspaces
      const workspacesArr = JSON.parse(JSON.stringify(workspaces)).filter((x) => !x?.archived);
      accessWorkspaces.forEach((aws) => {
        workspacesArr.forEach((ws) => {
          if (Number(aws?.workspaceId) === Number(ws?.id)) {
            if (aws?.accessList.some((x) => x?.key === 'PO_SRV_TC')) {
              accessWorkspacesArr.push(ws);
            }
          }
        });
      });

      const sortWorkspaces = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));

      let ws = [];
      if (!this.currentUser?.superAdminUser) {
        ws = sortWorkspaces.filter((item) => Number(item?.id) !== 1);
      } else {
        ws = sortWorkspaces;
      }

      this.workspaces = ws;

      if (this.workspaces?.length) {
        const getStoredWsId = this.serverOverviewDataService.getTaskCacheWorspaceId();
        defaultWS = this.workspaces.find((x) => x?.defaultWorkspace);
        if (getStoredWsId) {
          this.selectedTaskCacheWorkspaceId = Number(getStoredWsId);
          this.onChangeWorkspace(Number(getStoredWsId));
          return;
        } else if (defaultWS) {
          this.selectedTaskCacheWorkspaceId = Number(defaultWS?.id);
          this.onChangeWorkspace(Number(defaultWS?.id));
          return;
        } else {
          this.selectedTaskCacheWorkspaceId = Number(this.workspaces[0]?.id);
          this.onChangeWorkspace(Number(this.workspaces[0]?.id));
        }
      }
      this.serverOverviewDataService.storeWorkspaces(this.workspaces);
    }
  }

  /*============== On Change Workspace ===========*/
  onChangeWorkspace(workspaceId: number) {
    this.taskCacheDetails = null;
    this.serverOverviewDataService.storeSelectedWsIdTaskCache(Number(workspaceId));
    setTimeout(() => {
      this.getTaskCacheDetails(workspaceId);
    }, 0);
  }

  /*=========== Get Task Cache Details ===========*/
  getTaskCacheDetails(workspaceId: number) {
    this.loaderService.show();
    const taskCacheInfo = this.serverOverviewDataService.getTaskCacheInfoByWorksapceId(workspaceId, this.currentUser?.userName);
    if (taskCacheInfo) {
      this.taskCacheDetails = taskCacheInfo;
      this.drawGraph(this.taskCacheDetails);
      this.loaderService.hide();
    } else {
      this.getTaskCacheDetailsSub = this.serverOverviewService.getTaskCacheDetails(this.currentUser?.userName, workspaceId).subscribe((res: any) => {
        if (res) {
          res.workspaceId = workspaceId;
          res.username = this.currentUser?.userName;
          this.taskCacheDetails = res;
          this.drawGraph(this.taskCacheDetails);
          this.serverOverviewDataService.storeTaskCache(this.taskCacheDetails);
        }
        this.loaderService.hide();
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  drawGraph(taskCacheInfo: any) {
    this.pieChartLabels = [
      ['Failed'],
      ['Hold'],
      ['Initiate'],
      ['InputHold'],
      ['Processing'],
      ['ProcessingWithError']
    ];
    this.pieChartDatasets = [{
      data: [
        Number(taskCacheInfo?.Failed),
        Number(taskCacheInfo?.Hold),
        Number(taskCacheInfo?.Initiate),
        Number(taskCacheInfo?.InputHold),
        Number(taskCacheInfo?.Processing),
        Number(taskCacheInfo?.ProcessingWithError)
      ]
    }];
  }

  ngOnDestroy(): void {
    this.getWorkspacesSub.unsubscribe();
    this.getTaskCacheDetailsSub.unsubscribe();
  }
}
