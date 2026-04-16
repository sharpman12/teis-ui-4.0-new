import { NgModule, Component } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/guard/auth-guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ErrorComponent } from './shared/components/error/error.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';


import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { Constants } from './shared/components/constants';

const appRoutes: Routes = [
  {
    path: '',
    // component: LoginComponent,
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    // component: LoginComponent,
    // canActivate: [AuthGuard],
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    title: 'TEIS Dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: {
      access: Constants.USERNAME
    },
    children: [
      { path: '', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) }
    ]
  },
  {
    path: 'logs',
    title: 'TEIS Monitoring Logs',
    canActivate: [AuthGuard],
    data: {
      access: Constants.MONITOR_LOG_AND_FLOW_CARD,
      access2: Constants.EVENT_LOG,
      access3: Constants.SERVICE_LOG,
      access4: Constants.APPLICATION_LOG
    },
    children: [
      { path: '', loadChildren: () => import('./logs/logs.module').then(m => m.LogsModule) }
    ]

  },
  {
    path: 'flows',
    title: 'TEIS Monitoring Flows',
    canActivate: [AuthGuard],
    data: {
      access: Constants.FLOW_INPUT,
      access2: Constants.FLOW_MONITORING
    },
    children: [
      { path: '', loadChildren: () => import('./flows/flows.module').then(m => m.FlowsModule) }
    ]
  },
  {
    path: 'processingOverview',
    title: 'TEIS Processing Overview',
    canActivate: [AuthGuard],
    data: {
      access: Constants.PROCESSING_OVERVIEW_CARD,
      access2: Constants.PROCESSING_OVERVIEW_WEB_SERVICE,
      access3: Constants.PROCESSING_OVERVIEW_PROCESS_ENGINE,
      access4: Constants.PROCESSING_OVERVIEW_SERVER_QUEUE,
      access5: Constants.PROCESSING_OVERVIEW_SERVER_TASK_CACHE,
      access6: Constants.PROCESSING_OVERVIEW_SERVER_ITEM_CACHE,
    },
    children: [
      { path: '', loadChildren: () => import('./server-overview/server-overview.module').then(m => m.ServerOverviewModule) }
    ]
  },
  // { path: 'administration', canActivate: [AuthGuard], component: AdminDashboardComponent },
  {
    path: 'admin',
    title: 'TEIS Administration',
    canActivate: [AuthGuard],
    data: {
      access: Constants.USER_MANAGEMENT_CARD,
      access2: Constants.USER_MANAGEMENT_CRUD
    },
    children: [
      { path: '', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
    ]
  },
  {
    path: 'workspace_management',
    title: 'TEIS Workspace Management',
    canActivate: [AuthGuard],
    data: {
      access: Constants.WORKSPACE_MANAGEMENT_CARD,
      access2: Constants.WORKSPACE_MANAGEMENT_CRUD,
      access3: Constants.ENABLE_DISABLE_SCHEDULERS,
      access4: Constants.ENABLE_DISABLE_SERVICES,
      access5: Constants.DEPLOY_UNDEPLOY_WORKSPACE
    },
    children: [
      { path: '', loadChildren: () => import('./workspace-management/workspace-management.module').then(m => m.WorkspaceManagementModule) }
    ]
  },
  {
    path: 'business_management',
    title: 'TEIS Business Management',
    canActivate: [AuthGuard],
    data: {
      access: Constants.BUSSINESS_MANAGEMENT_CARD,
      access2: Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL,
      access3: Constants.ENABLED_DISALED_FLOWS,
      access4: Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP,
      access5: Constants.CUD_ACTIVITY_TYPE_AND_ACTIVITY_MODEL
    },
    children: [
      { path: '', loadChildren: () => import('./business-management/business-management.module').then(m => m.BusinessManagementModule) }
    ]
  },
  {
    path: 'application_services_management',
    title: 'TEIS Application Services Management',
    canActivate: [AuthGuard],
    data: {
      access: Constants.APP_SERVICE_MANAGEMENT_CARD
    },
    children: [
      {
        path: '', loadChildren: () => import('./app-service-management/app-service-management.module')
          .then(m => m.AppServiceManagementModule)
      }
    ]
  },
  {
    path: 'web_service_management',
    title: 'TEIS Web Services Management',
    canActivate: [AuthGuard],
    data: {
      access: Constants.WEB_SERVICE_MANAGEMENT_CARD
    },
    children: [
      {
        path: '', loadChildren: () => import('./web-service-management/web-service-management.module')
          .then(m => m.WebServiceManagementModule)
      }
    ]
  },
  {
    path: 'task_management',
    title: 'TEIS Task Management',
    canActivate: [AuthGuard],
    data: {
      access: Constants.TASK_MANAGEMENT_CARD,
      access2: Constants.TASK_MANAGEMENT_ACTIONS,
    },
    children: [
      { path: '', loadChildren: () => import('./task-management/task-management.module').then(m => m.TaskManagementModule) }
    ]
  },
  {
    path: 'application_integration',
    title: 'TEIS Application Integration',
    canActivate: [AuthGuard],
    data: {
      access: Constants.APPLICATION_INTEGRATION_CARD,
      access2: Constants.BREAK_PIT_LOCK,
      access3: Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS,
      access4: Constants.DEPLOY_UNDEPLOY_FPIT,
      access5: Constants.OPEN_UPDATE_WORKSPACE,
      access6: Constants.RESTRUCTURING_VIEW,
      access7: Constants.START_STOP_REMOVE_ERROR_FLAG_PIT,
      access8: Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST
    },
    children: [
      {
        path: '', loadChildren: () => import('./application-integration/application-integration.module')
          .then(m => m.ApplicationIntegrationModule)
      }
    ]
  },
  {
    path: 'archive_packages_log',
    title: 'TEIS Archive Logs',
    canActivate: [AuthGuard],
    data: {
      access: Constants.ARCHIVE_CARD
    },
    children: [
      {
        path: '', loadChildren: () => import('./archive-packages/archive-packages.module')
          .then(m => m.ArchivePackagesModule)
      }
    ]
  },
  {
    path: 'archive_packages_flow',
    title: 'TEIS Archive Flow',
    canActivate: [AuthGuard],
    data: {
      access: Constants.ARCHIVE_CARD
    },
    children: [
      {
        path: '', loadChildren: () => import('./archive-flows/archive-flows.module')
          .then(m => m.ArchiveFlowsModule)
      }
    ]
  },
  {
    path: 'configuration',
    title: 'TEIS System Configuration',
    canActivate: [AuthGuard],
    data: {
      access: Constants.CONFIGURATION_CARD,
      access2: Constants.APPLICATION_PARAMETER_CURD_ACCESS,
      access3: Constants.CONFIGURATION_SCRIPT_ENGINE_AND_GROUP,
      access4: Constants.CONFIGURATION_OF_SEVER,
      access5: Constants.CONFIGURATION_LOG_MAINTENANCE
    },
    children: [
      {
        path: '', loadChildren: () => import('./configuration/configuration.module')
          .then(m => m.ConfigurationModule)
      }
    ]
  },
  {
    path: 'tools',
    title: 'TEIS Tools',
    canActivate: [AuthGuard],
    data: {
      access: Constants.TOOLS_CARD,
      access2: Constants.TOOLS_IMPORT_EXPORT_WORKSPACE_ITEMS
    },
    children: [
      {
        path: '', loadChildren: () => import('./tools/tools.module')
          .then(m => m.ToolsModule)
      }
    ]
  },
  {
    path: 'development',
    title: 'TEIS Development',
    canActivate: [AuthGuard],
    data: {
      access: Constants.DEVELOPMENT_CARD,
      access2: Constants.DEV_BREAK_LOCK_ON_TEMPLATE_AND_SYSTEM_LIBRARY,
      access3: Constants.DEV_CRUD_TEMPLATE,
      access4: Constants.DEV_BREAK_LOCK_ON_USER_SCRIPT,
      access5: Constants.DEV_CRUD_USER_SCRIPT,
      access6: Constants.DEV_IMPORT_EXPORT_TEMPLATE_AND_SYSTEM_LIBRARY,
      access7: Constants.DEV_IMPORT_EXPORT_USER_SCRIPT,
      access8: Constants.DEV_CRUD_SYSTEM_LIBRARY
    },
    children: [
      {
        path: '', loadChildren: () => import('./development/development.module')
          .then(m => m.DevelopmentModule)
      }
    ]
  },
  // {
  //   path: 'addOnManager',
  //   title: 'TEIS Add On Manager',
  //   canActivate: [AuthGuard],
  //   data: {
  //     access: Constants.TOOLS_CARD
  //   },
  //   children: [
  //     {
  //       path: '', loadChildren: () => import('./add-on-manager/add-on-manager.module')
  //         .then(m => m.AddOnManagerModule)
  //     }
  //   ]
  // },
  { path: 'error', component: ErrorComponent, canActivate: [AuthGuard] },
  // { path: '**', component: NotFoundComponent },
  // { path: '**', redirectTo: 'dashboard', pathMatch: 'full' }
  { path: '**', component: NotFoundComponent, canActivate: [AuthGuard], }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { useHash: true }
      // { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
