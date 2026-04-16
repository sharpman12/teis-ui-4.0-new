import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ExportedData } from '../../tools';
import { ToolsDataService } from '../../tools-data.service';
import { ToolsService } from '../../tools.service';
import { ExportLogDetailsComponent } from './export-log-details/export-log-details.component';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})
export class ResultComponent implements OnInit {
  @Input() activeTabIndex: number = 0;
  @Output() currentTabIndex: EventEmitter<number> = new EventEmitter<number>();
  activeTab: number = 0;
  exportSummary: any;

  constructor(
    public dialog: MatDialog,
    private toolsService: ToolsService,
    private toolsDataService: ToolsDataService
  ) { }

  ngOnInit(): void {
    // this.handleChange(0);
  }

  handleChange(index: number) {
    // const index = e.index;
    if (index === 0) {
      this.currentTabIndex.next(index);
    }
    if (index === 1) {
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
  }
  /*=========== END Set Tab Index ===========*/

  getExportedData(exportedData) {
    this.exportSummary = exportedData;
  }

  /*=========== Get Log Details By Id ===========*/
  getLogDetails(logId: number) {
    this.toolsService.getLogDetailsById(logId).subscribe(res => {
      const exportLogData = {
        logData: res,
        isImport: false
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

}
