import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { DevelopmentService } from '../../development.service';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ExportScript } from '../../development';

@Component({
  selector: 'app-export-script',
  templateUrl: './export-script.component.html',
  styleUrls: ['./export-script.component.scss']
})
export class ExportScriptComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  scriptsList: any = [];

  getScriptsHistorySub = Subscription.EMPTY;
  exportScriptSub = Subscription.EMPTY;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialogRef: MatDialogRef<ExportScriptComponent>,
    private messageService: MessageService,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    this.getScriptsHistory();
  }

  ngOnInit(): void {

  }

  getScriptsHistory() {
    const teisItemType = this.dialogData?.isSystemLibrary ? 'systemLibrary' : this.dialogData?.userDefined ? 'userScript' : 'template';
    this.getScriptsHistorySub = this.developmentService.getScriptVersionInfo(Number(this.dialogData?.workspaceId), Number(this.dialogData?.scriptId), teisItemType, true).subscribe((res) => {
      if (res) {
        if (res?.versionInfoList?.length) {
          res?.versionInfoList.map((x) => x.isWorkingCopy = x.versionNumber === 0 ? true : false);
        }
        this.scriptsList = res?.versionInfoList?.length ? res?.versionInfoList.sort((a, b) => Number(a.versionNumber) - Number(b.versionNumber)) : [];
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  exportScript(ver: any) {
    if (ver?.isWorkingCopy) {
      if (this.dialogData?.lockInfo?.isLocked && this.dialogData?.lockInfo?.lockedUserId !== this.currentUser?.id) {
        this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `Working copy is locked by ${this.dialogData?.lockInfo?.lockedBy}.` });
      } else {
        this.export(ver);
      }
    } else {
      this.export(ver);
    }
  }

  export(ver: any) {
    const exportObj: ExportScript = {
      scriptId: this.dialogData?.scriptId,
      teisItemType: this.dialogData?.type,
      workspaceId: this.dialogData?.workspaceId,
      versionNumber: ver?.versionNumber,
      workingCopy: ver?.isWorkingCopy
    };
    this.exportScriptSub = this.developmentService.exportScript(exportObj).subscribe((res) => {
      if (res) {
        const scriptType = this.dialogData?.type
        const fileExtension = scriptType === 'systemLibrary' ? 'syslibx' : scriptType === 'userScript' ? 'basx' : scriptType === 'template' ? 'tplx' : 'adpx';
        this.downloadXMLFile(res, `${this.dialogData?.scriptName} (v.${ver?.versionNumber === 0 ? 'WC' : ver?.versionNumber}).${fileExtension}`);
        this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `Script exported successfully!` });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  downloadXMLFile(xmlContent, filename) {
    // Create a Blob from the XML content
    const blob = new Blob([xmlContent], { type: 'application/xml' });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create an anchor element and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Needed for Firefox
    a.click();
    document.body.removeChild(a);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  }

  onClose(): void {
    this.dialogRef.close({
      isAction: false,
      isExport: false,
      scriptId: null,
      workspaceId: null,
      verId: null,
      versionNumber: null,
    });
  }

  ngOnDestroy(): void {
    this.getScriptsHistorySub.unsubscribe();
    this.exportScriptSub.unsubscribe();
  }
}
