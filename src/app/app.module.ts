import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule, ErrorHandler, APP_INITIALIZER } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

import { GlobalErrorHandlerService } from "./core/interceptors/global-error-handler.service";

// import { AppRoutes } from './app-routing.module';
import { AppRoutingModule } from "./app-routing.module";
// components
import { AppComponent } from "./app.component";
import { LoginComponent } from "./login/login.component";

import { LoaderInterceptor } from "./core/interceptors/loader-interceptor";
import { TokenInterceptor } from "./core/interceptors/jwt-interceptor";
import { ErrorInterceptor } from "./core/interceptors/error-interceptor";
import { AlertComponent } from "./shared/components/alert/alert.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
// services
import { DashboardResolverService } from "./dashboard/dashboard-resolver.service";
import { HeaderService } from "./core/service/header.service";
import { ProgressiveLoaderService } from "./core/service/progressiveloader.service";
import { BreadCrumbService } from "./core/service/breadcrumb.service";
import { ModalService } from "./core/service/modal.service";

import { AlertService } from "./core/service/alert.service";
import { LogDataService } from "./core/service/state/log-data.service";
// import { NoCacheInterceptor } from './helper/nocache-interceptor.service';
import { InputTextModule } from "primeng/inputtext";
import { NgForTrackByIdDirective } from "../app/shared/directive/ng-for-trackby-id.directive";

/*PRIMENG COMPONENTS */
// import { AccordionModule } from 'primeng/primeng';
import { StepsModule } from "primeng/steps";
import { MessageService } from "primeng/api";
// import { Ng2CarouselamosModule } from 'ng2-carouselamos';
import { ProgressBarModule } from "primeng/progressbar";
/*SHARED COMPONENT */
import { AuthGuard } from "./core/guard/auth-guard";
import { AuthService } from "./core/service/auth.service";
// import{ AuthModule } from '../app/auth/auth.module'

import {
  FooterComponent,
  HeaderComponent,
  BreadCrumbComponent,
  ProgressiveLoader,
  ModalComponent,
  SharedModule,
} from "./shared";

import { NotFoundComponent } from "./shared/components/not-found/not-found.component";
import { ErrorComponent } from "./shared/components/error/error.component";

import { ScrollPanelModule } from "primeng/scrollpanel";
import { ToastModule } from "primeng/toast";
import { TreeViewModule } from "@syncfusion/ej2-angular-navigations";
import { AccordionModule } from "primeng/accordion";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { DashboardModule } from "./dashboard/dashboard.module";
import { SharedService } from "./shared/services/shared.service";
import { AdminDashboardComponent } from "./admin-dashboard/admin-dashboard.component";
import { AddEditWorkspacesComponent } from "./workspace-management/workspace-mgmt/workspaces/add-edit-workspaces/add-edit-workspaces.component";
import { RemoveWorkspacesComponent } from "./workspace-management/workspace-mgmt/workspaces/remove-workspaces/remove-workspaces.component";
import { LogDetailsComponent } from "./workspace-management/workspace-mgmt/workspaces/log-details/log-details.component";
import { NotificationComponent } from "./workspace-management/workspace-mgmt/workspaces/notification/notification.component";
import { ConfirmationComponent } from "./shared/components/confirmation/confirmation.component";
import { AutosizeModule } from "ngx-autosize";
import { MatStepperModule } from "@angular/material/stepper";
import { AddEditArchivePkgComponent } from "./archive-packages/archive-pkgs/add-edit-archive-pkg/add-edit-archive-pkg.component";
import { TreeModule } from "primeng/tree";
import { CalendarModule } from "primeng/calendar";
import { LogInfoComponent } from "./archive-packages/archive-pkgs/archive-log-report/log-info/log-info.component";
import { TreeTableModule } from "primeng/treetable";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";


import { KeycloakAngularModule, KeycloakService } from "keycloak-angular";
import { KeycloakSecurityService } from "./shared/services/keycloak-security.service";
import { KeycloakTokenInterceptor } from "./core/interceptors/keycloak-token.interceptor";
import { NgChartsModule } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { NoCacheInterceptor } from "./core/interceptors/nocache-interceptor.service";
import { Overlay, OverlayModule } from "@angular/cdk/overlay";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MAT_AUTOCOMPLETE_SCROLL_STRATEGY, MatAutocompleteModule } from "@angular/material/autocomplete";

class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    if (error?.message?.includes('ChunkLoadError')) {
      window.location.reload();
    } else {
      console.error('Unhandled error:', error);
    }
  }
}

export function kcFactory(kcSecurity: KeycloakSecurityService) {
  return () => kcSecurity.init();
}

export function matAutocompleteScrollStrategyFactory(overlay: Overlay): () => import('@angular/cdk/overlay').ScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AlertComponent,
    DashboardComponent,
    FooterComponent,
    HeaderComponent,
    BreadCrumbComponent,
    NotFoundComponent,
    ErrorComponent,
    ProgressiveLoader,
    ModalComponent,
    NgForTrackByIdDirective,
    AdminDashboardComponent,
    AddEditWorkspacesComponent,
    RemoveWorkspacesComponent,
    LogDetailsComponent,
    NotificationComponent,
    AddEditArchivePkgComponent,
    LogInfoComponent,
  ],
  imports: [
    BrowserModule,
    // AuthModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastModule,
    FormsModule,
    AccordionModule,
    StepsModule,
    AppRoutingModule,
    ProgressBarModule,
    InputTextModule,
    ScrollPanelModule,
    TreeViewModule,
    MatDialogModule,
    MatStepperModule,
    DashboardModule,
    SharedModule,
    TreeModule,
    TableModule,
    TreeTableModule,
    CalendarModule,
    AutosizeModule,
    TooltipModule,
    KeycloakAngularModule,
    NgChartsModule,
    // Ng2CarouselamosModule
    ScrollingModule,
    OverlayModule,
    MatAutocompleteModule,
  ],
  providers: [
    AuthGuard,
    AuthService,
    AlertService,
    DashboardResolverService,
    HeaderService,
    BreadCrumbService,
    ModalService,
    MessageService,
    ProgressiveLoaderService,
    LogDataService,
    SharedService,
    CookieService,
    // { provide: ErrorHandler, useClass: GlobalErrorHandlerService},
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: APP_INITIALIZER,
      useFactory: kcFactory,
      multi: true,
      deps: [KeycloakSecurityService],
    },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakTokenInterceptor,
      multi: true,
    },
    // { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoCacheInterceptor,
      multi: true,
    },
    {
      provide: MAT_AUTOCOMPLETE_SCROLL_STRATEGY,
      useFactory: matAutocompleteScrollStrategyFactory,
      deps: [Overlay],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
