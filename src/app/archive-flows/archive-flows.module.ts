import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArchiveFlowsRoutingModule } from './archive-flows-routing.module';
import { ArchiveFlowComponent } from './archive-flow/archive-flow.component';
import { ArchiveFlowDetailsComponent } from './archive-flow/archive-flow-details/archive-flow-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutosizeModule } from 'ngx-autosize';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { SharedModule } from '../shared';
import { TabViewModule } from 'primeng/tabview';
import { TreeTableModule } from 'primeng/treetable';
import { TreeModule } from 'primeng/tree';
import { TableModule } from 'primeng/table';


@NgModule({
  declarations: [
    ArchiveFlowComponent,
    ArchiveFlowDetailsComponent
  ],
  imports: [
    CommonModule,
    ArchiveFlowsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AutosizeModule,
    ToastModule,
    CalendarModule,
    TooltipModule,
    SharedModule,
    TabViewModule,
    TreeTableModule,
    TreeModule,
    TableModule
  ]
})
export class ArchiveFlowsModule { }
