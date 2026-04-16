import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGroupGuard } from '../core/guard/admin-group.guard';
import { AdminProfileGuard } from '../core/guard/admin-profile.guard';
import { AdminRoleGuard } from '../core/guard/admin-role.guard';
import { AdminUserGuard } from '../core/guard/admin-user.guard';
import { AuthGuard } from '../core/guard/auth-guard';
import { GroupGuard } from '../core/guard/group.guard';
import { ProfileGuard } from '../core/guard/profile.guard';
import { RoleGuard } from '../core/guard/role.guard';
import { UserGuard } from '../core/guard/user.guard';
import { AdministratorComponent } from './administrator/administrator.component';
import { AddGroupComponent } from './groups/add-group/add-group.component';
import { GroupsComponent } from './groups/groups.component';
import { AddProfileComponent } from './profiles/add-profile/add-profile.component';
import { ProfilesComponent } from './profiles/profiles.component';
import { AddRoleComponent } from './roles/add-role/add-role.component';
import { RolesComponent } from './roles/roles.component';
import { AddUserComponent } from './users/add-user/add-user.component';
import { UsersComponent } from './users/users.component';
import { Constants } from '../shared/components/constants';

const routes: Routes = [
  {
    path: '', component: AdministratorComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.USER_MANAGEMENT_CARD
    },
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      {
        path: 'users', canActivate: [AuthGuard],
        data: {
          access: Constants.USER_MANAGEMENT_CARD
        },
        children: [
          {
            path: '', component: UsersComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
            resolve: { adminUsers: AdminUserGuard }
          },
          {
            path: 'adduser', component: AddUserComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
          },
          {
            path: 'edituser/:id', component: AddUserComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
            resolve: { user: UserGuard }
          }
        ]
      },
      {
        path: 'profiles', canActivate: [AuthGuard],
        data: {
          access: Constants.USER_MANAGEMENT_CARD
        },
        children: [
          {
            path: '', component: ProfilesComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
            resolve: { adminProfiles: AdminProfileGuard }
          },
          {
            path: 'addprofile', component: AddProfileComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
          },
          {
            path: 'editprofile/:id', component: AddProfileComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
            resolve: { profile: ProfileGuard }
          }
        ]
      },
      {
        path: 'roles', canActivate: [AuthGuard],
        data: {
          access: Constants.USER_MANAGEMENT_CARD
        },
        children: [
          {
            path: '', component: RolesComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
            resolve: { adminRoles: AdminRoleGuard }
          },
          {
            path: 'addrole', component: AddRoleComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
          },
          {
            path: 'editrole/:id', component: AddRoleComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
            resolve: { role: RoleGuard }
          }
        ]
      },
      {
        path: 'groups', canActivate: [AuthGuard],
        data: {
          access: Constants.USER_MANAGEMENT_CARD
        },
        children: [
          {
            path: '', component: GroupsComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
            resolve: { adminGroups: AdminGroupGuard }
          },
          {
            path: 'addgroup', component: AddGroupComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
          },
          {
            path: 'editgroup/:id', component: AddGroupComponent, canActivate: [AuthGuard],
            data: {
              access: Constants.USER_MANAGEMENT_CARD
            },
            resolve: { group: GroupGuard }
          }
        ]
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
