import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';

import { StepComponent } from './step.component'

const stepsRoutes: Routes = [    
  {
    path: '',  
      component: StepComponent,
     pathMatch: 'full', canActivate:[AuthGuard],
  }
];


@NgModule({
  imports: [RouterModule.forChild(stepsRoutes)],     
  exports: [RouterModule]
})
export class StepRoutingModule { }
