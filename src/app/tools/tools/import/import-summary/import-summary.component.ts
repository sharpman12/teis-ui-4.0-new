import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ExportLogDetailsComponent } from '../../export/result/export-log-details/export-log-details.component';
import { ImportResultDto } from '../../tools';
import { ToolsDataService } from '../../tools-data.service';
import { ToolsService } from '../../tools.service';

@Component({
  selector: 'app-import-summary',
  templateUrl: './import-summary.component.html',
  styleUrls: ['./import-summary.component.scss']
})
export class ImportSummaryComponent implements OnInit {
  activeTab: number = 0;
  @Output() currentTabIndex: EventEmitter<number> = new EventEmitter<number>();
  importedWsDetails: ImportResultDto;
  importFromId: string;

  constructor(
    public dialog: MatDialog,
    private toolsService: ToolsService,
    private toolsDataService: ToolsDataService
  ) { }

  ngOnInit(): void {
    this.toolsService.selectedImportDetails.subscribe(res => {
      this.importFromId = res?.importFromId;
    });
  }

  handleChange(index: number) {
    if (index === 0) {
      this.currentTabIndex.next(index);
    }
    if (index === 1) {
      this.currentTabIndex.next(index);
    }
    if (index === 2) {
      this.currentTabIndex.next(index);
    }
    if (index === 3) {
      this.currentTabIndex.next(index);
    }
    if (index === 4) {
      this.currentTabIndex.next(index);
    }
    if (index === 5) {
      this.currentTabIndex.next(index);
    }
    if (index === 6) {
      this.currentTabIndex.next(index);
    }
    if (index === 7) {
      this.currentTabIndex.next(index);
    }
  }

  /*=========== Set Tab Index ===========*/
  setTabIndex(index: number, nextTab: boolean, prevTab: boolean) {
    this.activeTab = index;
    if (index === 0) {
      this.currentTabIndex.next(index);
    }
    if (index === 1) {
      this.currentTabIndex.next(index);
    }
    if (index === 2) {
      this.currentTabIndex.next(index);
    }
    if (index === 3) {
      this.currentTabIndex.next(index);
    }
    if (index === 4) {
      this.currentTabIndex.next(index);
    }
    if (index === 5) {
      this.currentTabIndex.next(index);
    }
    if (index === 6) {
      this.currentTabIndex.next(index);
    }
    if (index === 7) {
      this.currentTabIndex.next(index);
    }
  }
  /*=========== END Set Tab Index ===========*/

  /*=========== Get Imported Workspace Details ===========*/
  getImportedWorkspaceData() {
    this.importedWsDetails = this.toolsDataService.getImportedData();
  }
  /*=========== END Get Imported Workspace Details ===========*/

  /*=========== Get Log Details By Id ===========*/
  getLogDetails(logId: number) {
    this.toolsService.getLogDetailsById(logId).subscribe(res => {
      const exportLogData = {
        logData: res,
        isImport: true
      };
      const dialogRef = this.dialog.open(ExportLogDetailsComponent, {
        width: '800px',
        height: '600px',
        data: exportLogData
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
        }
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=============== Reset Step Three ===============*/
  resetStepThree() {
    this.importedWsDetails = null;
    this.toolsDataService.clearImportedData();
  }
  /*=============== END Reset Step Three ===============*/

}
