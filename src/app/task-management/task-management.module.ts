import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TaskManagementRoutingModule } from './task-management-routing.module';
import { TasksManagementComponent } from './tasks-management/tasks-management.component';
import { TabViewModule } from 'primeng/tabview';
import { FailedTaskComponent } from './tasks-management/failed-task/failed-task.component';
import { RunningTaskComponent } from './tasks-management/running-task/running-task.component';
import { HoldTaskComponent } from './tasks-management/hold-task/hold-task.component';
import { TreeModule } from 'primeng/tree';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RestartTaskComponent } from './restart-task/restart-task.component';
import { AddNoteComponent } from './add-note/add-note.component';
import { CurrentParametersComponent } from './current-parameters/current-parameters.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { TreeTableModule } from 'primeng/treetable';
import { MarkAsCompletedComponent } from './mark-as-completed/mark-as-completed.component';
import { StopTaskComponent } from './stop-task/stop-task.component';
import { ReleaseMutexComponent } from './release-mutex/release-mutex.component';
// import { ReplaceString } from '../shared/pipe/replace.pipe';
import { TableModule } from 'primeng/table';
import { ServiceLogComponent } from './tasks-management/service-log/service-log.component';
import { EventLogComponent } from './tasks-management/event-log/event-log.component';
import { SharedModule } from '../shared/shared.module';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { TasksDetailsComponent } from './tasks-management/tasks-details/tasks-details.component';
import { GeneralInformationComponent } from './tasks-management/general-information/general-information.component';
import { AutosizeModule } from 'ngx-autosize';
import { ScriptViewComponent } from './tasks-management/script-view/script-view.component';
import { ToastModule } from 'primeng/toast';
import { StartedTaskComponent } from './tasks-management/started-task/started-task.component';
import { FlowCorelationComponent } from './tasks-management/tasks-details/flow-corelation/flow-corelation.component';
import { CalendarModule } from 'primeng/calendar';
import { AccordionModule } from 'primeng/accordion';
// import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
// import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
// import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TaskIdsListComponent } from './task-ids-list/task-ids-list.component';
import { SubfolderItemsConfirmationComponent } from './subfolder-items-confirmation/subfolder-items-confirmation.component';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

@NgModule({
    declarations: [
        TasksManagementComponent,
        FailedTaskComponent,
        RunningTaskComponent,
        HoldTaskComponent,
        RestartTaskComponent,
        AddNoteComponent,
        CurrentParametersComponent,
        MarkAsCompletedComponent,
        StopTaskComponent,
        ReleaseMutexComponent,
        // ReplaceString,
        ServiceLogComponent,
        EventLogComponent,
        TasksDetailsComponent,
        GeneralInformationComponent,
        ScriptViewComponent,
        StartedTaskComponent,
        FlowCorelationComponent,
        TaskIdsListComponent,
        SubfolderItemsConfirmationComponent
    ],
    imports: [
        CommonModule,
        TaskManagementRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        TabViewModule,
        TreeTableModule,
        TreeModule,
        NgSelectModule,
        TableModule,
        MatDialogModule,
        AutosizeModule,
        ToastModule,
        CalendarModule,
        AccordionModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        SharedModule,
        MatMenuModule
    ],
    exports: [
        RestartTaskComponent
    ]
})
export class TaskManagementModule { }
