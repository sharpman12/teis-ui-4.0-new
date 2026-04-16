import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule, Route } from '@angular/router';
import {DashboardResolverService} from './dashboard-resolver.service'

const dashboardRoutes: Routes = [     
  {path:'', redirectTo:'dashboard',
   pathMatch:'full',
   resolve:{results:DashboardResolverService}
  },
  
 ];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardRoutes)      
  ],
  exports: [
    RouterModule
  ]     
})
export class DashboardRoutingModule { }
