import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServerOverviewRoutingModule } from './server-overview-routing.module';
import { ServerOverviewComponent } from './server-overview/server-overview.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from '../shared/shared.module';
import { ServerQueuesComponent } from './server-overview/server-queues/server-queues.component';
import { ServerItemCacheComponent } from './server-overview/server-item-cache/server-item-cache.component';
import { ServerTaskCacheComponent } from './server-overview/server-task-cache/server-task-cache.component';
import { NgChartsModule } from 'ng2-charts';
import { ServerCompComponent } from './server-overview/server-comp/server-comp.component';
import { CompOverviewProcessEngineComponent } from './server-overview/comp-overview-process-engine/comp-overview-process-engine.component';
import { CompOverviewWebServicesComponent } from './server-overview/comp-overview-web-services/comp-overview-web-services.component';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { ServerDlqQueuesComponent } from './server-overview/server-dlq-queues/server-dlq-queues.component';


@NgModule({
  declarations: [
    ServerOverviewComponent,
    ServerQueuesComponent,
    ServerItemCacheComponent,
    ServerTaskCacheComponent,
    ServerCompComponent,
    CompOverviewProcessEngineComponent,
    CompOverviewWebServicesComponent,
    ServerDlqQueuesComponent
  ],
  imports: [
    CommonModule,
    ServerOverviewRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    TabViewModule,
    ToastModule,
    SharedModule,
    NgChartsModule,
    CalendarModule,
    TableModule
  ]
})
export class ServerOverviewModule { }
