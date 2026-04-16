import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LogDashboardComponent } from './feature-components/log-dashboard/log-dashboard.component';
import { CardComponent } from './feature-components/card/card.component';
import { LogReportComponent } from './feature-components/log-report/log-report.component';
import { FormsModule } from '@angular/forms';
import { StepModule } from '../steps/step.module';
import { ReactiveFormsModule } from '@angular/forms';
import { DragScrollModule } from 'ngx-drag-scroll';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { LogRoutingModule } from './logs-routing.module';
import { CarouselModule } from 'primeng/carousel';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { CardPanelComponent } from './feature-components/card-panel/card-panel.component';
// import { Ng2CarouselamosModule } from 'ng2-carouselamos';
import { AutofocusDirective } from '../shared/directive/auto-focus.directive';
import { EllipsisModule } from 'ngx-ellipsis';
import { HighlightSearch } from '../shared/pipe/highlight.pipe';
// import { ReplaceString } from '../shared/pipe/replace.pipe';
// import { LogDataService } from "../core/service/state/log-data.service";
import {
  SharedModule
} from '../shared';
import { ConfirmationComponent } from '../shared/components/confirmation/confirmation.component';

@NgModule({
    imports: [
        CommonModule,
        LogRoutingModule,
        StepModule,
        TreeTableModule,
        TableModule,
        TooltipModule,
        ToastModule,
        DialogModule,
        DropdownModule,
        MenuModule,
        TabViewModule,
        FormsModule,
        ReactiveFormsModule,
        CalendarModule,
        ScrollPanelModule,
        CarouselModule,
        // Ng2CarouselamosModule,
        DragScrollModule,
        EllipsisModule,
        SharedModule
    ],
    // providers: [LogDataService],
    declarations: [
        LogDashboardComponent,
        CardComponent,
        LogReportComponent,
        CardPanelComponent,
        AutofocusDirective,
        // HighlightSearch,
        // ReplaceString,
    ]
})
export class LogsModule { }
