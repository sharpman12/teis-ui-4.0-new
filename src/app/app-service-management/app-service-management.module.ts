import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppServiceManagementRoutingModule } from './app-service-management-routing.module';
import { AppServicesMgmtComponent } from './app-services-mgmt/app-services-mgmt.component';
import { TabViewModule } from 'primeng/tabview';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [
    AppServicesMgmtComponent
  ],
  imports: [
    CommonModule,
    AppServiceManagementRoutingModule,
    TabViewModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    TableModule
  ]
})
export class AppServiceManagementModule { }
