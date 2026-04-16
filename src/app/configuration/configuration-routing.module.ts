import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { AdapterInfoComponent } from './configurations/adapter-info/adapter-info.component';
import { AppParamsComponent } from './configurations/app-params/app-params.component';
import { ApplicationServiceInfoComponent } from './configurations/application-service-info/application-service-info.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { IdentifierInfoComponent } from './configurations/identifier-info/identifier-info.component';
import { LogMaintenanceComponent } from './configurations/log-maintenance/log-maintenance.component';
import { PluginInfoComponent } from './configurations/plugin-info/plugin-info.component';
import { ScriptEngineGroupComponent } from './configurations/script-engine-group/script-engine-group.component';
import { ScriptEngineComponent } from './configurations/script-engine/script-engine.component';
import { ServerComponent } from './configurations/server/server.component';
import { UserInterfaceComponent } from './configurations/user-interface/user-interface.component';
import { WebServiceInfoComponent } from './configurations/web-service-info/web-service-info.component';
import { Constants } from '../shared/components/constants';

const routes: Routes = [
  {
    path: '', component: ConfigurationsComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.CONFIGURATION_CARD,
      access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
    },
    children: [
      { path: '', redirectTo: 'adapter_information', pathMatch: 'full' },
      {
        path: 'adapter_information', component: AdapterInfoComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'identifier_information', component: IdentifierInfoComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'plugin_information', component: PluginInfoComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'app_service_information', component: ApplicationServiceInfoComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'web_service_information', component: WebServiceInfoComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'app_params', component: AppParamsComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'user_interface', component: UserInterfaceComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'script_engine', component: ScriptEngineComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'script_engine_groups', component: ScriptEngineGroupComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'server', component: ServerComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
      {
        path: 'log_maintenance', component: LogMaintenanceComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.CONFIGURATION_CARD,
          access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
