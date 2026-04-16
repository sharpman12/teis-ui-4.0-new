import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WorkspaceManagementRoutingModule } from './workspace-management-routing.module';
import { WorkspaceMgmtComponent } from './workspace-mgmt/workspace-mgmt.component';
import { WorkspacesComponent } from './workspace-mgmt/workspaces/workspaces.component';
import { TabViewModule } from 'primeng/tabview';
import { AddEditWorkspacesComponent } from './workspace-mgmt/workspaces/add-edit-workspaces/add-edit-workspaces.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RemoveWorkspacesComponent } from './workspace-mgmt/workspaces/remove-workspaces/remove-workspaces.component';
import { ToastModule } from 'primeng/toast';
import { LogDetailsComponent } from './workspace-mgmt/workspaces/log-details/log-details.component';
import { SharedModule } from '../shared';
import { AutosizeModule } from 'ngx-autosize';
import { NotificationComponent } from './workspace-mgmt/workspaces/notification/notification.component';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';


@NgModule({
    declarations: [
        WorkspaceMgmtComponent,
        WorkspacesComponent,
        // AddEditWorkspacesComponent,
        // RemoveWorkspacesComponent,
        // LogDetailsComponent,
        // NotificationComponent
    ],
    imports: [
        CommonModule,
        WorkspaceManagementRoutingModule,
        TabViewModule,
        FormsModule,
        ReactiveFormsModule,
        ToastModule,
        AutosizeModule,
        DynamicDialogModule,
        DialogModule,
        SharedModule,
        TableModule
    ]
})
export class WorkspaceManagementModule { }
