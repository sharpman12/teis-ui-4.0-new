import { Component, OnDestroy, OnInit } from '@angular/core';
import { ServerOverviewService } from '../../server-overview.service';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Workspace } from 'src/app/application-integration/app-integration/appintegration';
import { ServerOverviewDataService } from '../../server-overview-data.service';
import { ChartOptions } from 'chart.js';
import { ProgressiveLoaderService } from 'src/app/core/service/progressiveloader.service';

@Component({
  selector: 'app-server-item-cache',
  templateUrl: './server-item-cache.component.html',
  styleUrls: ['./server-item-cache.component.scss']
})
export class ServerItemCacheComponent implements OnInit, OnDestroy {
  currentUser: any;
  workspaces: Array<Workspace> = [];
  selectedWorkspaceId: number = 1;
  itemCacheDetails: any = null;

  // Pie chart
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabels = [];
  public pieChartDatasets = [];
  public pieChartLegend = true;
  public pieChartPlugins = [];

  getWorkspacesSub = Subscription.EMPTY;
  getItemCacheDetailsSub = Subscription.EMPTY;

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
    this.getWorkspacesByUser();
  }

  refreshWorkspaceList() {
    this.serverOverviewDataService.clearWorkspaces();
    this.serverOverviewDataService.clearItemCacheWorkspaceId();
    this.getWorkspaces();
  }

  refreshItemCacheDetails() {
    this.serverOverviewDataService.clearItemCacheInfo();
    setTimeout(() => {
      this.getItemCacheDetails(this.selectedWorkspaceId);
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
            if (aws?.accessList.some((x) => x?.key === 'PO_SRV_IC')) {
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
        const getStoredWsId = this.serverOverviewDataService.getItemCacheWorspaceId();
        defaultWS = this.workspaces.find((x) => x?.defaultWorkspace);
        if (getStoredWsId) {
          this.selectedWorkspaceId = Number(getStoredWsId);
          this.onChangeWorkspace(Number(getStoredWsId));
          return;
        } else if (defaultWS) {
          this.selectedWorkspaceId = Number(defaultWS?.id);
          this.onChangeWorkspace(Number(defaultWS?.id));
          return;
        } else {
          this.selectedWorkspaceId = Number(this.workspaces[0]?.id);
          this.onChangeWorkspace(Number(this.workspaces[0]?.id));
        }
      }
      this.serverOverviewDataService.storeWorkspaces(this.workspaces);
    }
  }

  /*=========== On Change Workspace ===========*/
  onChangeWorkspace(workspaceId: number) {
    this.itemCacheDetails = null;
    // this.workspaces.forEach((w) => {
    //   if (Number(w?.id) === Number(workspaceId)) {
    //     this.selectedWorkspaceId = Number(w?.id);
    //   }
    // });
    setTimeout(() => {
      this.getItemCacheDetails(workspaceId);
    }, 0);
    this.serverOverviewDataService.storeSelectedWsId(workspaceId);
  }

  /*=========== Get Item Cache Details ===========*/
  getItemCacheDetails(workspaceId: number) {
    this.loaderService.show();
    const itemCacheInfo = this.serverOverviewDataService.getItemCacheInfoByWorksapceId(workspaceId, this.currentUser?.userName);
    if (itemCacheInfo) {
      this.itemCacheDetails = itemCacheInfo;
      this.pieChartLabels = [['Process'], ['Integration'], ['Trigger']];
      this.pieChartDatasets = [{
        data: [
          this.itemCacheDetails?.cachedProcessCount,
          this.itemCacheDetails?.cachedIntegrationCount,
          this.itemCacheDetails?.cachedTriggerCount,
        ]
      }];
      this.loaderService.hide();
    } else {
      this.getItemCacheDetailsSub = this.serverOverviewService.getItemCacheDetails(this.currentUser?.userName, workspaceId).subscribe(res => {
        if (res?.length) {
          this.itemCacheDetails = res[0];
          this.pieChartLabels = [['Process'], ['Integration'], ['Trigger']];
          this.pieChartDatasets = [{
            data: [
              this.itemCacheDetails?.cachedProcessCount,
              this.itemCacheDetails?.cachedIntegrationCount,
              this.itemCacheDetails?.cachedTriggerCount,
            ]
          }];
          this.itemCacheDetails.workspaceId = workspaceId;
          this.itemCacheDetails.username = this.currentUser?.userName;
          this.serverOverviewDataService.storeItemCache(this.itemCacheDetails);
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

  ngOnDestroy(): void {
    this.getWorkspacesSub.unsubscribe();
    this.getItemCacheDetailsSub.unsubscribe();
  }
}
