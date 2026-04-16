import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { FlowGroupGuard } from '../core/guard/flow-group.guard';
import { FlowModelGuard } from '../core/guard/flow-model.guard';
import { WebFlowGuard } from '../core/guard/web-flow.guard';
import { BusinessMgmtComponent } from './business-mgmt/business-mgmt.component';
import { AddEditFlowCompModelComponent } from './business-mgmt/flow-comp-model/add-edit-flow-comp-model/add-edit-flow-comp-model.component';
import { FlowCompModelComponent } from './business-mgmt/flow-comp-model/flow-comp-model.component';
import { AddEditFlowGroupComponent } from './business-mgmt/web-comp-flow-group/add-edit-flow-group/add-edit-flow-group.component';
import { WebCompFlowGroupComponent } from './business-mgmt/web-comp-flow-group/web-comp-flow-group.component';
import { AddEditWebFlowComponent } from './business-mgmt/web-comp-flow/add-edit-web-flow/add-edit-web-flow.component';
import { WebCompFlowComponent } from './business-mgmt/web-comp-flow/web-comp-flow.component';
import { Constants } from '../shared/components/constants';

const routes: Routes = [
  {
    path: '', component: BusinessMgmtComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.BUSSINESS_MANAGEMENT_CARD,
      access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
      access3: Constants.ENABLED_DISALED_FLOWS,
      access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
    },
    children: [
      { path: '', redirectTo: 'flow_model', pathMatch: 'full' },
      {
        path: 'flow_model', canActivate: [AuthGuard],
        data: {
          access: Constants.BUSSINESS_MANAGEMENT_CARD,
          access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
          access3: Constants.ENABLED_DISALED_FLOWS,
          access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
        },
        children: [
          {
            path: '', component: FlowCompModelComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.BUSSINESS_MANAGEMENT_CARD,
              access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
              access3: Constants.ENABLED_DISALED_FLOWS,
              access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
            },
          },
          {
            path: 'add_flow_model', component: AddEditFlowCompModelComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.BUSSINESS_MANAGEMENT_CARD,
              access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
              access3: Constants.ENABLED_DISALED_FLOWS,
              access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
            },
          },
          {
            path: 'edit_flow_model/:id',
            component: AddEditFlowCompModelComponent,
            canActivate: [AuthGuard],
            data: {
              access: Constants.BUSSINESS_MANAGEMENT_CARD,
              access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
              access3: Constants.ENABLED_DISALED_FLOWS,
              access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
            },
            resolve: { flowModel: FlowModelGuard }
          },
        ]
      },
      {
        path: 'web_flow_group', canActivate: [AuthGuard],
        data: {
          access: Constants.BUSSINESS_MANAGEMENT_CARD,
          access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
          access3: Constants.ENABLED_DISALED_FLOWS,
          access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
        },
        children: [
          {
            path: '', component: WebCompFlowGroupComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.BUSSINESS_MANAGEMENT_CARD,
              access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
              access3: Constants.ENABLED_DISALED_FLOWS,
              access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
            },
          },
          {
            path: 'add_flow_group', component: AddEditFlowGroupComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.BUSSINESS_MANAGEMENT_CARD,
              access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
              access3: Constants.ENABLED_DISALED_FLOWS,
              access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
            },
          },
          {
            path: 'edit_flow_group/:id',
            component: AddEditFlowGroupComponent,
            canActivate: [AuthGuard],
            data: {
              access: Constants.BUSSINESS_MANAGEMENT_CARD,
              access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
              access3: Constants.ENABLED_DISALED_FLOWS,
              access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
            },
            resolve: { flowGroup: FlowGroupGuard }
          },
        ]
      },
      {
        path: 'web_flow', canActivate: [AuthGuard],
        data: {
          access: Constants.BUSSINESS_MANAGEMENT_CARD,
          access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
          access3: Constants.ENABLED_DISALED_FLOWS,
          access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
        },
        children: [
          {
            path: '', component: WebCompFlowComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.BUSSINESS_MANAGEMENT_CARD,
              access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
              access3: Constants.ENABLED_DISALED_FLOWS,
              access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
            },
          },
          {
            path: 'add_flow', component: AddEditWebFlowComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.BUSSINESS_MANAGEMENT_CARD,
              access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
              access3: Constants.ENABLED_DISALED_FLOWS,
              access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
            },
          },
          {
            path: 'edit_flow/:id',
            component: AddEditWebFlowComponent,
            canActivate: [AuthGuard],
            data: {
              access: Constants.BUSSINESS_MANAGEMENT_CARD,
              access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
              access3: Constants.ENABLED_DISALED_FLOWS,
              access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP
            },
            resolve: { webFlow: WebFlowGuard }
          },
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessManagementRoutingModule { }
