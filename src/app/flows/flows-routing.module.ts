import { NgModule } from '@angular/core';
import { Routes, RouterModule, Route } from '@angular/router';
import { FlowDashboardComponent } from './flow/feature-component/flow-dashboard/flow-dashboard.component';
import { FlowGroupComponent } from './flow/feature-component/flow-group/flow-group.component'
import { AuthGuard } from '../core/guard/auth-guard';
import { FlowsResolverService } from './resolvers/flows-resolver.service';
import { FlowsGroupIdResolverService } from './resolvers/flows-group-id-resolver.service';
import { Constants } from '../shared/components/constants';

const routes: Route[] = [
  {
    path: '',
    component: FlowDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      access: Constants.FLOW_INPUT,
      access2: Constants.FLOW_MONITORING
    },
    resolve: { cards: FlowsResolverService }
  },
  {
    path: ':id',
    component: FlowGroupComponent,
    canActivate: [AuthGuard],
    data: {
      access: Constants.FLOW_INPUT,
      access2: Constants.FLOW_MONITORING
    },
    resolve: {
      webFlow: FlowsGroupIdResolverService
    }
  },
  //   {
  //     path: ':id/:id', 
  //     component: FlowGroupComponent ,
  //     canActivate: [AuthGuard],
  //  }

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlowsRoutingModule { }
