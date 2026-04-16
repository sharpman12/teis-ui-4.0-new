import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ExportScript } from 'src/app/development/development';
import { DevelopmentService } from 'src/app/development/development.service';
import { Constants } from 'src/app/shared/components/constants';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';

@Component({
  selector: 'app-script-version-viewer',
  templateUrl: './script-version-viewer.component.html',
  styleUrls: ['./script-version-viewer.component.scss']
})
export class ScriptVersionViewerComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  versionInfo: any = '';
  isUserHaveTemplateAndSysLibAccess: boolean = false;

  getVersionInfoSub = Subscription.EMPTY;
  getVersionByIdSub = Subscription.EMPTY;
  exportScriptSub = Subscription.EMPTY;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialogRef: MatDialogRef<ScriptVersionViewerComponent>,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    this.getVersionInfoById();
    if (this.currentUser?.superAdminUser) {
      this.isUserHaveTemplateAndSysLibAccess = true;
    } else if (this.currentUser?.adminUser && (this.dialogData?.type.toLowerCase() === 'userscript' || this.dialogData?.type === 'USER_SCRIPT')) {
      this.isUserHaveTemplateAndSysLibAccess = true;
    } else if (!this.currentUser?.superAdminUser && !this.currentUser?.adminUser && (this.dialogData?.type.toLowerCase() === 'userscript' || this.dialogData?.type === 'USER_SCRIPT')) {
      this.isUserHaveTemplateAndSysLibAccess = true;
    } else {
      this.isUserHaveTemplateAndSysLibAccess = false;
    }
  }

  ngOnInit(): void {
  }

  getVersionInfoById() {
    this.versionInfo = '';
    const teisItemType = this.dialogData?.isSystemLibrary ? 'systemLibrary' : this.dialogData?.userDefined ? 'userScript' : 'template';
    this.getVersionByIdSub = this.developmentService.getScriptVersionById(this.dialogData?.id, teisItemType).subscribe((res) => {
      if (res) {
        const version = JSON.parse(JSON.stringify(res));
        const scriptStr = atob(version?.scriptContents);
        // Convert binary string to percent-encoded UTF-8 string
        const percentEncodedStr = scriptStr.split('').map(char =>
          '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)
        ).join('');
        // Decode percent-encoded UTF-8 string to original string
        version.scriptContents = decodeURIComponent(percentEncodedStr);
        this.versionInfo = version;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============ Export Script ============*/
  exportScript() {
    const exportObj: ExportScript = {
      scriptId: this.dialogData?.scriptId,
      teisItemType: this.dialogData?.type,
      workspaceId: this.dialogData?.workspaceId,
      versionNumber: this.dialogData?.versionNumber,
      workingCopy: false
    };
    this.exportScriptSub = this.developmentService.exportScript(exportObj).subscribe((res) => {
      if (res) {
        const scriptType = this.dialogData?.type
        const fileExtension = scriptType === 'systemLibrary' ? 'syslibx' : scriptType === 'userScript' ? 'basx' : scriptType === 'template' ? 'tplx' : 'adpx';
        this.downloadXMLFile(res, `${this.dialogData?.scriptName} (v.${this.dialogData?.versionNumber}).${fileExtension}`);
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
    this.dialogRef.close({ isClose: true });
  }

  ngOnDestroy(): void {
    this.getVersionInfoSub.unsubscribe();
    this.exportScriptSub.unsubscribe();
    this.getVersionByIdSub.unsubscribe();
  }

}
