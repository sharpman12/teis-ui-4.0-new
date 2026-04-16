import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { AppIntPropertiesComponent } from './app-integration/app-int-properties/app-int-properties.component';
import { AppIntegrationComponent } from './app-integration/app-integration.component';
import { AppIntLandingComponent } from './app-int-landing/app-int-landing.component';
import { AppIntAddEditItemComponent } from './app-integration/app-int-add-edit-item/app-int-add-edit-item.component';
import { Constants } from '../shared/components/constants';
import { AppIntPropertiesGuard } from '../core/guard/app-int-properties.guard';

const routes: Routes = [
  {
    path: '', component: AppIntLandingComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.APPLICATION_INTEGRATION_CARD,
      access2: Constants.BREAK_PIT_LOCK,
      access3: Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS,
      access4: Constants.DEPLOY_UNDEPLOY_FPIT,
      access5: Constants.OPEN_UPDATE_WORKSPACE,
      access6: Constants.RESTRUCTURING_VIEW,
      access7: Constants.START_STOP_REMOVE_ERROR_FLAG_PIT,
      access8: Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST
    },
    children: [
      {
        path: '', component: AppIntegrationComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.APPLICATION_INTEGRATION_CARD,
          access2: Constants.BREAK_PIT_LOCK,
          access3: Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS,
          access4: Constants.DEPLOY_UNDEPLOY_FPIT,
          access5: Constants.OPEN_UPDATE_WORKSPACE,
          access6: Constants.RESTRUCTURING_VIEW,
          access7: Constants.START_STOP_REMOVE_ERROR_FLAG_PIT,
          access8: Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST
        }
      },
      {
        path: 'properties/:itemType/:isCreatePIT/:workspaceId/:belongsToFolderId/:itemId', component: AppIntPropertiesComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.APPLICATION_INTEGRATION_CARD,
          access2: Constants.BREAK_PIT_LOCK,
          access3: Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS,
          access4: Constants.DEPLOY_UNDEPLOY_FPIT,
          access5: Constants.OPEN_UPDATE_WORKSPACE,
          access6: Constants.RESTRUCTURING_VIEW,
          access7: Constants.START_STOP_REMOVE_ERROR_FLAG_PIT,
          access8: Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST
        },
        resolve: { propertiesDetails: AppIntPropertiesGuard }
      },
      {
        path: 'item/:itemType/:isCreatePIT/:workspaceId/:belongsToFolderId/:itemId', component: AppIntAddEditItemComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.APPLICATION_INTEGRATION_CARD,
          access2: Constants.BREAK_PIT_LOCK,
          access3: Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS,
          access4: Constants.DEPLOY_UNDEPLOY_FPIT,
          access5: Constants.OPEN_UPDATE_WORKSPACE,
          access6: Constants.RESTRUCTURING_VIEW,
          access7: Constants.START_STOP_REMOVE_ERROR_FLAG_PIT,
          access8: Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApplicationIntegrationRoutingModule { }
