import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { DevelopmentComponent } from './development/development.component';
import { Constants } from '../shared/components/constants';

const routes: Routes = [
  {
    path: '', component: DevelopmentComponent,
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevelopmentRoutingModule { }
