import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';

import { LogDashboardComponent } from './feature-components/log-dashboard/log-dashboard.component';
import { LogReportComponent } from './feature-components/log-report/log-report.component';
import { LogResolverService } from './resolvers/logs-resolver.service';
import { LogReportResolverService } from './resolvers/logs-report-resolver.service';
import { WorkSpaceResolverService } from './resolvers/workspace-resolver.service';

import { StepComponent } from '../steps/step.component';
import { Constants } from '../shared/components/constants';
const logsRoutes: Routes = [
  {
    path: '',
    component: LogDashboardComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard],
    data: {
      access: Constants.MONITOR_LOG_AND_FLOW_CARD,
      access2: Constants.EVENT_LOG,
      access3: Constants.SERVICE_LOG,
      access4: Constants.APPLICATION_LOG
    },
    resolve: {
      workspaces: WorkSpaceResolverService
    }
  },
  {
    path: 'logreport/:id',
    component: LogReportComponent,
    canActivate: [AuthGuard],
    data: {
      access: Constants.MONITOR_LOG_AND_FLOW_CARD,
      access2: Constants.EVENT_LOG,
      access3: Constants.SERVICE_LOG,
      access4: Constants.APPLICATION_LOG
    },
  },
  // {
  //   path: 'createLog',
  //   canActivate: [AuthGuard],
  //   component: StepComponent,
  //   resolve: {
  //     workspaces: WorkSpaceResolverService
  //   }
  // },
  // {
  //   path: 'editLog/:id',
  //   canActivate: [AuthGuard],
  //   component: StepComponent,
  //   resolve: {
  //     results : LogReportResolverService,
  //     workspaces: WorkSpaceResolverService
  //   }
  // },
];


@NgModule({
  imports: [RouterModule.forChild(logsRoutes)],
  exports: [RouterModule]
})
export class LogRoutingModule { }
