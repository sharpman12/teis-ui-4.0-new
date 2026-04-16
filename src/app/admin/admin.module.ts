import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { UsersComponent } from './users/users.component';
import { AddUserComponent } from './users/add-user/add-user.component';
import { AdministratorComponent } from './administrator/administrator.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProfilesComponent } from './profiles/profiles.component';
import { AddProfileComponent } from './profiles/add-profile/add-profile.component';
import { RolesComponent } from './roles/roles.component';
import { AddRoleComponent } from './roles/add-role/add-role.component';
import { GroupsComponent } from './groups/groups.component';
import { AddGroupComponent } from './groups/add-group/add-group.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { ToastModule } from 'primeng/toast';
import { EditGroupMembersComponent } from './groups/add-group/edit-group-members/edit-group-members.component';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { TreeViewModule } from '@syncfusion/ej2-angular-navigations';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgSelectModule } from '@ng-select/ng-select';
import { TreeModule } from 'primeng/tree';
import { PasswordModule } from 'primeng/password';
import { SharedModule } from '../shared';
import { ConfirmationComponent } from '../shared/components/confirmation/confirmation.component';
import { AdImportComponent } from './users/add-user/ad-import/ad-import.component';
import { ProfileDetailsComponent } from './profiles/profile-details/profile-details.component';
import { AdSettingComponent } from './users/add-user/ad-setting/ad-setting.component';
import { AutosizeModule } from 'ngx-autosize';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
    declarations: [
        UsersComponent,
        AddUserComponent,
        AdministratorComponent,
        ProfilesComponent,
        AddProfileComponent,
        RolesComponent,
        AddRoleComponent,
        GroupsComponent,
        AddGroupComponent,
        EditGroupMembersComponent,
        AdImportComponent,
        ProfileDetailsComponent,
        AdSettingComponent,
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        Ng2SearchPipeModule,
        ToastModule,
        TabViewModule,
        MatDialogModule,
        TreeViewModule,
        MultiSelectModule,
        NgSelectModule,
        TreeModule,
        PasswordModule,
        SharedModule,
        AutosizeModule,
    ]
})
export class AdminModule { }
