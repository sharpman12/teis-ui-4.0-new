import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { TasksManagementService } from '../tasks-management.service';
import { EncryptDecryptService } from "src/app/shared/services/encrypt-decrypt.service";

@Component({
  selector: 'app-script-view',
  templateUrl: './script-view.component.html',
  styleUrls: ['./script-view.component.scss']
})
export class ScriptViewComponent implements OnInit {
  scriptView: any;

  constructor(
    public dialogRef: MatDialogRef<ScriptViewComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public tasksManagementService: TasksManagementService,
     private encryptDecryptService: EncryptDecryptService,
  ) {
    dialogRef.disableClose = true;
    this.getScript(this.dialogData?.scriptId);
  }

  ngOnInit(): void {
  }

  getScript(scriptId: string) {
    let teisItemType;
    if (this.dialogData?.userDefined) {
      teisItemType = 'userScript';
    } else {
      teisItemType = 'template';
    }
    this.tasksManagementService.getScriptById(scriptId, teisItemType, this.dialogData?.workspaceId).subscribe(res => {
      const scriptStr = atob(res?.scriptContents);
        // Convert binary string to percent-encoded UTF-8 string
        const percentEncodedStr = scriptStr.split('').map(char =>
          '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
        ).join('');
        // Decode percent-encoded UTF-8 string to original string
        this.scriptView  = decodeURIComponent(percentEncodedStr);

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
