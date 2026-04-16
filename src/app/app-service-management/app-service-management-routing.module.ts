import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { AppServicesMgmtComponent } from './app-services-mgmt/app-services-mgmt.component';
import { Constants } from '../shared/components/constants';

const routes: Routes = [
  {
    path: '', component: AppServicesMgmtComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.APP_SERVICE_MANAGEMENT_CARD
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppServiceManagementRoutingModule { }
