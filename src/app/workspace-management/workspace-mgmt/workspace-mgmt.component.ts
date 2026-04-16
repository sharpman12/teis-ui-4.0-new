import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../../shared/services/shared.service';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { HeaderService } from '../../core/service/header.service';
import { WorkspacesComponent } from './workspaces/workspaces.component';
import { Constants } from 'src/app/shared/components/constants';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workspace-mgmt',
  templateUrl: './workspace-mgmt.component.html',
  styleUrls: ['./workspace-mgmt.component.scss']
})
export class WorkspaceMgmtComponent implements OnInit, OnDestroy {
  @ViewChild(WorkspacesComponent) workspacesComp: WorkspacesComponent;
  selectedWsLength: number;
  enableDeployUndeployActionBtn = false;
  enableCreateUpdateDeleteActionBtn = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/workspace_management') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.breadcrumb.visible = false;
    // this.breadcrumb.previous(); // show hide breadcrumb
    // this.breadcrumb.hide();
    if (localStorage.getItem(Constants.SOURCE) === 'MC') {
      this.getPermissions(localStorage.getItem(Constants.USERNAME), false);
    } else {
      this.setActionPermissions();
    }
    this.sharedService.isChangeBgColor.next(true);
  }

  getPermissions(userName, root) {
    this.sharedService.getUserPermissions(userName, root).subscribe(res => {
      res?.permissions.forEach((permission) => {
        switch (permission) {
          case 'Create, Update and Delete Workspace':
            localStorage.setItem(Constants.WORKSPACE_MANAGEMENT_CARD, permission);
            break;
          case 'Deploy Undeploy of Workspace':
            localStorage.setItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE, permission);
            break;
        }
      });
      this.setActionPermissions();
      this.workspacesComp.setActionPermissions();
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });

    const KEYCLOAK_USERINFO = JSON.parse(localStorage.getItem('KEYCLOAK_USERINFO'));
    const USERNAME = localStorage.getItem('USERNAME');
    const userObj = { 'userName': USERNAME, 'password': '', 'profileRef': KEYCLOAK_USERINFO?.profileId };
    this.sharedService.getUserAccess(userObj).subscribe((res) => {
      if (res) {
        const output = Object.entries(res?.workspaceModules).map(([key, value]) => ({
          workspaceId: Number(key),
          accessList: value
        }));
        res.workspaceAccess = output;
        if (res?.workspaceAccess?.length) {
          res?.workspaceAccess.forEach((x) => {
            if (x?.accessList?.length) {

            }
          });
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

  private setActionPermissions() {
    if (localStorage.getItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE)) {
      this.enableDeployUndeployActionBtn = true;
    }
    if (localStorage.getItem(Constants.WORKSPACE_MANAGEMENT_CARD)) {
      this.enableCreateUpdateDeleteActionBtn = true;
    }
  }

  refreshWorkspace() {
    // this.workspacesComp.getWorkspaces('', false, false, this.currentUser?.workspaceAccess);
    this.workspacesComp.getLoginUserAccessData('', false, false, false);
  }

  addEditWorkspace(isAdd: boolean) {
    this.workspacesComp.addEditWorkspace(isAdd, '');
  }

  disableScheduler() {
    this.workspacesComp.disableScheduler();
  }

  enableScheduler() {
    this.workspacesComp.enableScheduler();
  }

  disableWebServices() {
    this.workspacesComp.disableWebServices();
  }

  enableWebServices() {
    this.workspacesComp.enableWebServices();
  }

  undeployItems() {
    this.workspacesComp.undeployWs();
  }

  deployItems() {
    this.workspacesComp.deployWs();
  }

  ngOnDestroy() {
    this.sharedService.isChangeBgColor.next(false);
  }

}
