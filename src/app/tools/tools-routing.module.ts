import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guard/auth-guard';
import { ExportComponent } from './tools/export/export.component';
import { ImportComponent } from './tools/import/import.component';
import { ToolsComponent } from './tools/tools.component';
import { Constants } from '../shared/components/constants';
import { ReindexingLogsComponent } from './tools/reindexing-logs/reindexing-logs.component';

const routes: Routes = [
  {
    path: '', component: ToolsComponent, canActivate: [AuthGuard],
    data: {
      access: Constants.TOOLS_CARD
    },
    children: [
      { path: '', redirectTo: 'export', pathMatch: 'full' },
      {
        path: 'export', component: ExportComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.TOOLS_CARD
        },
      },
      {
        path: 'import', component: ImportComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.TOOLS_CARD
        },
      },
      {
        path: 'reindexlogs', component: ReindexingLogsComponent, canActivate: [AuthGuard],
        data: {
          access: Constants.TOOLS_REINDEXING,
        },
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
