import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddOnManagerComponent } from './add-on-manager/add-on-manager.component';
import { AuthGuard } from '../core/guard/auth-guard';
import { Constants } from '../shared/components/constants';
import { AddOnAdaptersComponent } from './add-on-manager/add-on-adapters/add-on-adapters.component';

const routes: Routes = [
  {
    path: '', component: AddOnManagerComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.TOOLS_CARD
    },
    // children: [
    //   { path: '', redirectTo: 'adapters', pathMatch: 'full' },
    //   {
    //     path: 'adapters', component: AddOnAdaptersComponent, canActivate: [AuthGuard],
    //     data: {
    //       access: Constants.TOOLS_CARD
    //     }
    //   },
    // ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddOnManagerRoutingModule { }
