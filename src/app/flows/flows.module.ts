import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlowsRoutingModule } from './flows-routing.module';
import { FlowDashboardComponent } from './flow/feature-component/flow-dashboard/flow-dashboard.component';
import { FlowcardComponent } from './flow/card/flowcard/flowcard.component';
import { FlowGroupComponent } from './flow/feature-component/flow-group/flow-group.component';
import { FlowTransactionComponent } from './flow/feature-component/flow-transaction/flow-transaction.component';
import { SafePipe } from '../shared/pipe/safe.pipe';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MomentPipe } from '../shared/pipe/moment.pipe';
import { TreeTableModule } from 'primeng/treetable';
import { TreeModule } from 'primeng/tree';
//import {TreeNode} from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { EllipsisModule } from 'ngx-ellipsis';
import { TabViewModule } from 'primeng/tabview';
import { FlowDataService } from "./flow/state/flow-data.service";
import { OverlayPanelModule } from 'primeng/overlaypanel';
import {
  SharedModule
} from '../shared';
import { FlowTableComponent } from './flow/feature-component/flow-table/flow-table.component';
import { VerifyFlowComponent } from './flow/feature-component/verify-flow/verify-flow.component';
import { ToastModule } from 'primeng/toast';
@NgModule({
  imports: [
    CommonModule,
    FlowsRoutingModule,
    CalendarModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    TreeTableModule,
    TableModule,
    TooltipModule,
    ScrollPanelModule,
    SharedModule,
    EllipsisModule,
    TabViewModule,
    TreeModule,
    OverlayPanelModule,
    ToastModule
  ],
  providers: [FlowDataService],
  declarations: [FlowDashboardComponent, FlowcardComponent, FlowGroupComponent,
    FlowTransactionComponent, SafePipe, MomentPipe, FlowTableComponent, VerifyFlowComponent]
})
export class FlowsModule { }            
