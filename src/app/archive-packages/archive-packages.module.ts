import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ArchivePackagesRoutingModule } from './archive-packages-routing.module';
import { ArchivePkgsComponent } from './archive-pkgs/archive-pkgs.component';
import { TabViewModule } from 'primeng/tabview';
import { AddEditArchivePkgComponent } from './archive-pkgs/add-edit-archive-pkg/add-edit-archive-pkg.component';
import { AutosizeModule } from 'ngx-autosize';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TreeModule } from 'primeng/tree';
import { CalendarModule } from 'primeng/calendar';
import { ArchiveLogReportComponent } from './archive-pkgs/archive-log-report/archive-log-report.component';
import { TreeTableModule } from 'primeng/treetable';
import { SharedModule } from '../shared';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { LogInfoComponent } from './archive-pkgs/archive-log-report/log-info/log-info.component';
import { TooltipModule } from 'primeng/tooltip';
import { EllipsisModule } from 'ngx-ellipsis';

@NgModule({
    declarations: [
        ArchivePkgsComponent,
        ArchiveLogReportComponent,
        // LogInfoComponent,
        // AddEditArchivePkgComponent
    ],
    imports: [
        CommonModule,
        ArchivePackagesRoutingModule,
        TabViewModule,
        FormsModule,
        ReactiveFormsModule,
        AutosizeModule,
        TreeModule,
        ToastModule,
        TreeTableModule,
        TableModule,
        CalendarModule,
        TooltipModule,
        SharedModule,
        EllipsisModule
    ]
})
export class ArchivePackagesModule { }
