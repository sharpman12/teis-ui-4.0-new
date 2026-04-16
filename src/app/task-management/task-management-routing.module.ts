import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { TasksManagementComponent } from './tasks-management/tasks-management.component';
import { Constants } from '../shared/components/constants';

const routes: Routes = [
  {
    path: '', component: TasksManagementComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.TASK_MANAGEMENT_CARD
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskManagementRoutingModule { }
