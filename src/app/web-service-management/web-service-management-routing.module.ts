import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebServiceMgmtComponent } from './web-service-mgmt/web-service-mgmt.component';
import { Constants } from '../shared/components/constants';
import { AuthGuard } from '../core/guard/auth-guard';

const routes: Routes = [
  {
    path: '', component: WebServiceMgmtComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.WEB_SERVICE_MANAGEMENT_CARD
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WebServiceManagementRoutingModule { }
