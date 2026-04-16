import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from '../dashboard/dashboard-routing.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { UserSettingsComponent } from './user-settings/user-settings.component';

@NgModule({
    imports: [
        CommonModule,
        DashboardRoutingModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        PasswordModule,
        ToastModule,
        TooltipModule
    ],
    declarations: [
        ChangePasswordComponent,
        UserSettingsComponent
    ],
    exports: []
})
export class DashboardModule { }
