import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationRoutingModule } from './configuration-routing.module';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { AutosizeModule } from 'ngx-autosize';
import { SharedModule } from '../shared';
import { AdapterInfoComponent } from './configurations/adapter-info/adapter-info.component';
import { IdentifierInfoComponent } from './configurations/identifier-info/identifier-info.component';
import { PluginInfoComponent } from './configurations/plugin-info/plugin-info.component';
import { ApplicationServiceInfoComponent } from './configurations/application-service-info/application-service-info.component';
import { AppParamsComponent } from './configurations/app-params/app-params.component';
import { UserInterfaceComponent } from './configurations/user-interface/user-interface.component';
import { ScriptEngineComponent } from './configurations/script-engine/script-engine.component';
import { ScriptEngineGroupComponent } from './configurations/script-engine-group/script-engine-group.component';
import { ServerComponent } from './configurations/server/server.component';
import { LogMaintenanceComponent } from './configurations/log-maintenance/log-maintenance.component';
import { AddEditAppParamsComponent } from './configurations/app-params/add-edit-app-params/add-edit-app-params.component';
import { ToastModule } from 'primeng/toast';
import { AddEditScriptEngineGroupComponent } from './configurations/script-engine-group/add-edit-script-engine-group/add-edit-script-engine-group.component';
import { AddEditLogMaintenanceComponent } from './configurations/log-maintenance/add-edit-log-maintenance/add-edit-log-maintenance.component';
import { AddEditScriptEngineComponent } from './configurations/script-engine/add-edit-script-engine/add-edit-script-engine.component';
import { WebServiceInfoComponent } from './configurations/web-service-info/web-service-info.component';
import { TooltipModule } from 'primeng/tooltip';
import { TestSMTPConnectionComponent } from './configurations/server/test-smtpconnection/test-smtpconnection.component';
import { TableModule } from 'primeng/table';
import { ConfigConfirmationComponent } from './configurations/config-confirmation/config-confirmation.component';


@NgModule({
    declarations: [
        ConfigurationsComponent,
        AdapterInfoComponent,
        IdentifierInfoComponent,
        PluginInfoComponent,
        ApplicationServiceInfoComponent,
        AppParamsComponent,
        UserInterfaceComponent,
        ScriptEngineComponent,
        ScriptEngineGroupComponent,
        ServerComponent,
        LogMaintenanceComponent,
        AddEditAppParamsComponent,
        AddEditScriptEngineGroupComponent,
        AddEditLogMaintenanceComponent,
        AddEditScriptEngineComponent,
        WebServiceInfoComponent,
        TestSMTPConnectionComponent,
        ConfigConfirmationComponent
    ],
    imports: [
        CommonModule,
        ConfigurationRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        TabViewModule,
        MatDialogModule,
        AutosizeModule,
        ToastModule,
        SharedModule,
        TooltipModule,
        TableModule
    ]
})
export class ConfigurationModule { }
