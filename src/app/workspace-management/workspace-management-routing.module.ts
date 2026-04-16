import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { WorkspaceMgmtComponent } from './workspace-mgmt/workspace-mgmt.component';
import { Constants } from '../shared/components/constants';

const routes: Routes = [
  {
    path: '', component: WorkspaceMgmtComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.WORKSPACE_MANAGEMENT_CARD,
      access2: Constants.DEPLOY_UNDEPLOY_WORKSPACE
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkspaceManagementRoutingModule { }
