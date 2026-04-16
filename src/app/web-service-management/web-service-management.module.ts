import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WebServiceManagementRoutingModule } from './web-service-management-routing.module';
import { WebServiceMgmtComponent } from './web-service-mgmt/web-service-mgmt.component';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { AddEditWebServiceComponent } from './web-service-mgmt/add-edit-web-service/add-edit-web-service.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [
    WebServiceMgmtComponent,
    AddEditWebServiceComponent
  ],
  imports: [
    CommonModule,
    WebServiceManagementRoutingModule,
    TabViewModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    ToastModule,
    TableModule
  ]
})
export class WebServiceManagementModule { }
