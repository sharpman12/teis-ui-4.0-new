import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToolsRoutingModule } from './tools-routing.module';
import { ToolsComponent } from './tools/tools.component';
import { ImportComponent } from './tools/import/import.component';
import { ExportComponent } from './tools/export/export.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { AutosizeModule } from 'ngx-autosize';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from '../shared/shared.module';
import { MatStepperModule } from '@angular/material/stepper';
import { TabViewModule } from 'primeng/tabview';
import { TreeModule } from 'primeng/tree';
import { IntroductionComponent } from './tools/export/introduction/introduction.component';
import { ItemsComponent } from './tools/export/items/items.component';
import { ScriptComponent } from './tools/export/script/script.component';
import { ParametersComponent } from './tools/export/parameters/parameters.component';
import { ResultComponent } from './tools/export/result/result.component';
import { ImportWorkspaceComponent } from './tools/import/import-workspace/import-workspace.component';
import { ImportDetailsComponent } from './tools/import/import-details/import-details.component';
import { ImportSummaryComponent } from './tools/import/import-summary/import-summary.component';
import { ImportAlertComponent } from './tools/import/import-alert/import-alert.component';
import { ExportLogDetailsComponent } from './tools/export/result/export-log-details/export-log-details.component';
import { ReindexingLogsComponent } from './tools/reindexing-logs/reindexing-logs.component';


@NgModule({
    declarations: [
        ToolsComponent,
        ImportComponent,
        ExportComponent,
        IntroductionComponent,
        ItemsComponent,
        ScriptComponent,
        ParametersComponent,
        ResultComponent,
        ImportWorkspaceComponent,
        ImportDetailsComponent,
        ImportSummaryComponent,
        ImportAlertComponent,
        ExportLogDetailsComponent,
        ReindexingLogsComponent
    ],
    imports: [
        CommonModule,
        ToolsRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        TabViewModule,
        TreeModule,
        MatDialogModule,
        MatStepperModule,
        AutosizeModule,
        ToastModule,
        SharedModule
    ]
})
export class ToolsModule { }
