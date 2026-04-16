import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArchivePkgsComponent } from './archive-pkgs/archive-pkgs.component';
import { AuthGuard } from '../core/guard/auth-guard';
import { Constants } from '../shared/components/constants';

const routes: Routes = [
  {
    path: '', component: ArchivePkgsComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.ARCHIVE_CARD
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArchivePackagesRoutingModule { }
