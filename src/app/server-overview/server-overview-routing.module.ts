import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServerOverviewComponent } from './server-overview/server-overview.component';
import { AuthGuard } from '../core/guard/auth-guard';
import { Constants } from '../shared/components/constants';
import { ServerCompComponent } from './server-overview/server-comp/server-comp.component';
import { CompOverviewProcessEngineComponent } from './server-overview/comp-overview-process-engine/comp-overview-process-engine.component';
import { CompOverviewWebServicesComponent } from './server-overview/comp-overview-web-services/comp-overview-web-services.component';

const routes: Routes = [
  {
    path: '', component: ServerOverviewComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.PROCESSING_OVERVIEW_CARD,
      access2: Constants.PROCESSING_OVERVIEW_WEB_SERVICE,
      access3: Constants.PROCESSING_OVERVIEW_PROCESS_ENGINE,
      access4: Constants.PROCESSING_OVERVIEW_SERVER_QUEUE,
      access5: Constants.PROCESSING_OVERVIEW_SERVER_TASK_CACHE,
      access6: Constants.PROCESSING_OVERVIEW_SERVER_ITEM_CACHE,
    },
    children: [
      { path: '', redirectTo: 'server', pathMatch: 'full' },
      {
        path: 'server', component: ServerCompComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.PROCESSING_OVERVIEW_CARD,
          access2: Constants.PROCESSING_OVERVIEW_WEB_SERVICE,
          access3: Constants.PROCESSING_OVERVIEW_PROCESS_ENGINE,
          access4: Constants.PROCESSING_OVERVIEW_SERVER_QUEUE,
          access5: Constants.PROCESSING_OVERVIEW_SERVER_TASK_CACHE,
          access6: Constants.PROCESSING_OVERVIEW_SERVER_ITEM_CACHE,
        },
      },
      {
        path: 'processEngine', component: CompOverviewProcessEngineComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.PROCESSING_OVERVIEW_CARD,
          access2: Constants.PROCESSING_OVERVIEW_WEB_SERVICE,
          access3: Constants.PROCESSING_OVERVIEW_PROCESS_ENGINE,
          access4: Constants.PROCESSING_OVERVIEW_SERVER_QUEUE,
          access5: Constants.PROCESSING_OVERVIEW_SERVER_TASK_CACHE,
          access6: Constants.PROCESSING_OVERVIEW_SERVER_ITEM_CACHE,
        },
      },
      {
        path: 'webServices', component: CompOverviewWebServicesComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.PROCESSING_OVERVIEW_CARD,
          access2: Constants.PROCESSING_OVERVIEW_WEB_SERVICE,
          access3: Constants.PROCESSING_OVERVIEW_PROCESS_ENGINE,
          access4: Constants.PROCESSING_OVERVIEW_SERVER_QUEUE,
          access5: Constants.PROCESSING_OVERVIEW_SERVER_TASK_CACHE,
          access6: Constants.PROCESSING_OVERVIEW_SERVER_ITEM_CACHE,
        },
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServerOverviewRoutingModule { }
