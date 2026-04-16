import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { ArchiveFlowDetailsComponent } from './archive-flow/archive-flow-details/archive-flow-details.component';
import { ArchiveFlowComponent } from './archive-flow/archive-flow.component';
import { Constants } from '../shared/components/constants';

const routes: Routes = [
  {
    path: '', component: ArchiveFlowComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.ARCHIVE_CARD
    }
  },
  {
    path: ':id', component: ArchiveFlowDetailsComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.ARCHIVE_CARD
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArchiveFlowsRoutingModule { }
