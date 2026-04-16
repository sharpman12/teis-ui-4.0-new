import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { ToolsService } from '../../../tools.service';

@Component({
  selector: 'app-export-log-details',
  templateUrl: './export-log-details.component.html',
  styleUrls: ['./export-log-details.component.scss']
})
export class ExportLogDetailsComponent implements OnInit {
  logDetails: any;

  constructor(
    public dialogRef: MatDialogRef<ExportLogDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private toolsService: ToolsService
  ) {
    dialogRef.disableClose = true;
    // this.getExportLogDetails(dialogData?.logId);
  }

  ngOnInit(): void {
  }

  /*=============== Get Log Details ==============*/
  getExportLogDetails(logId: number) {
    this.toolsService.getLogDetailsById(logId).subscribe(res => {
      this.logDetails = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

}
