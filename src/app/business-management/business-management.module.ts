import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BusinessManagementRoutingModule } from './business-management-routing.module';
import { BusinessMgmtComponent } from './business-mgmt/business-mgmt.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { AutosizeModule } from 'ngx-autosize';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from 'primeng/api';
import { FlowCompModelComponent } from './business-mgmt/flow-comp-model/flow-comp-model.component';
import { WebCompFlowGroupComponent } from './business-mgmt/web-comp-flow-group/web-comp-flow-group.component';
import { WebCompFlowComponent } from './business-mgmt/web-comp-flow/web-comp-flow.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddEditFlowCompModelComponent } from './business-mgmt/flow-comp-model/add-edit-flow-comp-model/add-edit-flow-comp-model.component';
import { AddEditFlowGroupComponent } from './business-mgmt/web-comp-flow-group/add-edit-flow-group/add-edit-flow-group.component';
import { AddEditWebFlowComponent } from './business-mgmt/web-comp-flow/add-edit-web-flow/add-edit-web-flow.component';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';

@NgModule({
  declarations: [
    BusinessMgmtComponent,
    FlowCompModelComponent,
    WebCompFlowGroupComponent,
    WebCompFlowComponent,
    AddEditFlowCompModelComponent,
    AddEditFlowGroupComponent,
    AddEditWebFlowComponent
  ],
  imports: [
    CommonModule,
    BusinessManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TabViewModule,
    MatDialogModule,
    DragDropModule,
    AutosizeModule,
    ToastModule,
    TooltipModule,
    AccordionModule,
    SharedModule
  ]
})
export class BusinessManagementModule { }
