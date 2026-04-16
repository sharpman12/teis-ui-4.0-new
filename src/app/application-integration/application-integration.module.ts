import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApplicationIntegrationRoutingModule } from './application-integration-routing.module';
import { AppIntegrationComponent } from './app-integration/app-integration.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { TreeTableModule } from 'primeng/treetable';
import { TreeModule } from 'primeng/tree';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedModule } from '../shared/shared.module';
import { IntegrationComponent } from './app-integration/integration/integration.component';
import { SearchItemComponent } from './app-integration/search-item/search-item.component';
import { NetUserComponent } from './app-integration/net-user/net-user.component';
import { GlobalParametersComponent } from './app-integration/global-parameters/global-parameters.component';
// import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { AutosizeModule } from 'ngx-autosize';
import { ProcessComponent } from './app-integration/process/process.component';
import { TriggerComponent } from './app-integration/trigger/trigger.component';
import { EditWorkspaceComponent } from './app-integration/edit-workspace/edit-workspace.component';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { AppIntLogsComponent } from './app-integration/app-int-logs/app-int-logs.component';
import { AppIntServiceLogComponent } from './app-integration/app-int-service-log/app-int-service-log.component';
import { AppIntEventLogComponent } from './app-integration/app-int-event-log/app-int-event-log.component';
import { AppIntPropertiesComponent } from './app-integration/app-int-properties/app-int-properties.component';
import { PropertiesGeneralComponent } from './app-integration/app-int-properties/properties-general/properties-general.component';
import { PropertiesProcessComponent } from './app-integration/app-int-properties/properties-process/properties-process.component';
import { PropertiesIdentifiersComponent } from './app-integration/app-int-properties/properties-identifiers/properties-identifiers.component';
import { PropertiesParametersComponent } from './app-integration/app-int-properties/properties-parameters/properties-parameters.component';
import { PropertiesNetUserComponent } from './app-integration/app-int-properties/properties-net-user/properties-net-user.component';
import { PropertiesAlarmInfoComponent } from './app-integration/app-int-properties/properties-alarm-info/properties-alarm-info.component';
import { PropertiesVersionInfoComponent } from './app-integration/app-int-properties/properties-version-info/properties-version-info.component';
import { PropertiesBusinessFlowComponent } from './app-integration/app-int-properties/properties-business-flow/properties-business-flow.component';
import { AppIntLandingComponent } from './app-int-landing/app-int-landing.component';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { AppIntMarkAllAsCompletedComponent } from './app-integration/app-int-mark-all-as-completed/app-int-mark-all-as-completed.component';
import { AppIntCreateFolderComponent } from './app-integration/app-int-create-folder/app-int-create-folder.component';
import { AppIntAddEditItemComponent } from './app-integration/app-int-add-edit-item/app-int-add-edit-item.component';
import { MatStepperModule } from '@angular/material/stepper';
import { AppIntAddEditProcessComponent } from './app-integration/app-int-add-edit-process/app-int-add-edit-process.component';
import { PropertiesProcessExecutablesComponent } from './app-integration/app-int-properties/properties-process-executables/properties-process-executables.component';
import { NetUsersComponent } from './app-integration/app-int-properties/properties-net-user/net-users/net-users.component';
// import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
// import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
// import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { TaskManagementModule } from '../task-management/task-management.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { AppIntConfirmationComponent } from './app-integration/app-int-confirmation/app-int-confirmation.component';
import { AppIntPasteItemComponent } from './app-integration/app-int-paste-item/app-int-paste-item.component';
import { AppIntMoveItemComponent } from './app-integration/app-int-move-item/app-int-move-item.component';
import { AppIntStopTasksComponent } from './app-integration/app-int-stop-tasks/app-int-stop-tasks.component';
import { AUTO_SIZE_INPUT_OPTIONS, AutoSizeInputModule, AutoSizeInputOptions } from 'ngx-autosize-input';
import { AppIntAddNoteComponent } from './app-integration/app-int-add-note/app-int-add-note.component';
import { CalendarModule as SchedulerModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule } from 'primeng/calendar';
import { AlarmConfirmationComponent } from './app-integration/app-int-properties/properties-alarm-info/alarm-confirmation/alarm-confirmation.component';
import { PropertiesTriggerConfigureComponent } from './app-integration/app-int-properties/properties-trigger-configure/properties-trigger-configure.component';
import { PropertiesTriggerIdentifiersComponent } from './app-integration/app-int-properties/properties-trigger-identifiers/properties-trigger-identifiers.component';
import { PropertiesTriggerActivatorsComponent } from './app-integration/app-int-properties/properties-trigger-activators/properties-trigger-activators.component';
import { AppIntProcessPropertiesComponent } from './app-integration/app-int-process-properties/app-int-process-properties.component';
import { AppIntServicesComponent } from './app-integration/app-int-services/app-int-services.component';
import { PropertiesWebServiceParametersComponent } from './app-integration/app-int-properties/properties-web-service-parameters/properties-web-service-parameters.component';
import { InteractiveModeComponent } from './app-integration/interactive-mode/interactive-mode.component';
import { AppIntManualAutoDeployComponent } from './app-integration/app-int-manual-auto-deploy/app-int-manual-auto-deploy.component';
import { ExitInteractiveConfirmationComponent } from './app-integration/interactive-mode/exit-interactive-confirmation/exit-interactive-confirmation.component';
import { AppIntLogInfoComponent } from './app-integration/app-int-service-log/app-int-log-info/app-int-log-info.component';
import { AddUpdateIdentifiersComponent } from './app-integration/app-int-properties/properties-identifiers/add-update-identifiers/add-update-identifiers.component';
import { AddUpdateTriggerConfigComponent } from './app-integration/app-int-properties/properties-trigger-configure/add-update-trigger-config/add-update-trigger-config.component';
import { AddUpdateAlarmComponent } from './app-integration/app-int-properties/properties-alarm-info/add-update-alarm/add-update-alarm.component';

const CUSTOM_AUTO_SIZE_INPUT_OPTIONS: AutoSizeInputOptions = {
    extraWidth: 0,
    includeBorders: false,
    includePadding: true,
    includePlaceholder: true,
    maxWidth: -1,
    minWidth: -1,
    setParentWidth: false,
    usePlaceHolderWhenEmpty: false,
}

@NgModule({
    declarations: [
        AppIntegrationComponent,
        IntegrationComponent,
        SearchItemComponent,
        NetUserComponent,
        GlobalParametersComponent,
        ProcessComponent,
        TriggerComponent,
        EditWorkspaceComponent,
        AppIntLogsComponent,
        AppIntServiceLogComponent,
        AppIntEventLogComponent,
        AppIntPropertiesComponent,
        PropertiesGeneralComponent,
        PropertiesProcessComponent,
        PropertiesIdentifiersComponent,
        PropertiesParametersComponent,
        PropertiesNetUserComponent,
        PropertiesAlarmInfoComponent,
        PropertiesVersionInfoComponent,
        PropertiesBusinessFlowComponent,
        AppIntLandingComponent,
        AppIntMarkAllAsCompletedComponent,
        AppIntCreateFolderComponent,
        AppIntAddEditItemComponent,
        AppIntAddEditProcessComponent,
        PropertiesProcessExecutablesComponent,
        NetUsersComponent,
        AppIntConfirmationComponent,
        AppIntPasteItemComponent,
        AppIntMoveItemComponent,
        AppIntStopTasksComponent,
        AppIntAddNoteComponent,
        AlarmConfirmationComponent,
        PropertiesTriggerConfigureComponent,
        PropertiesTriggerIdentifiersComponent,
        PropertiesTriggerActivatorsComponent,
        AppIntProcessPropertiesComponent,
        AppIntServicesComponent,
        PropertiesWebServiceParametersComponent,
        InteractiveModeComponent,
        AppIntManualAutoDeployComponent,
        ExitInteractiveConfirmationComponent,
        AppIntLogInfoComponent,
        AddUpdateIdentifiersComponent,
        AddUpdateTriggerConfigComponent,
        AddUpdateAlarmComponent
    ],
    imports: [
        CommonModule,
        ApplicationIntegrationRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        TabViewModule,
        TreeTableModule,
        TreeModule,
        TableModule,
        NgSelectModule,
        // MatDialogModule,
        MatDialogModule,
        MatMenuModule,
        MatStepperModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        AutosizeModule,
        AccordionModule,
        SharedModule,
        ToastModule,
        TaskManagementModule,
        DragDropModule,
        TooltipModule,
        AutoSizeInputModule,
        SchedulerModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
        CalendarModule
    ],
    providers: [
        { provide: AUTO_SIZE_INPUT_OPTIONS, useValue: CUSTOM_AUTO_SIZE_INPUT_OPTIONS }
    ]
})
export class ApplicationIntegrationModule { }
