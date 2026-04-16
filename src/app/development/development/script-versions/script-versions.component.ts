import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DevelopmentService } from '../../development.service';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ScriptVersionViewerComponent } from './script-version-viewer/script-version-viewer.component';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { MessageService } from 'primeng/api';
import { ConnectedItemsConfirmationComponent } from '../connected-items-confirmation/connected-items-confirmation.component';

@Component({
  selector: 'app-script-versions',
  templateUrl: './script-versions.component.html',
  styleUrls: ['./script-versions.component.scss']
})
export class ScriptVersionsComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  versionsList: any = [];
  openedScripts: Array<any> = [];
  isUserHaveTemplateAndSysLibAccess: boolean = false;

  getScriptVersionHistorySub = Subscription.EMPTY;
  restoreScriptVersionSub = Subscription.EMPTY;
  deployScriptVersionSub = Subscription.EMPTY;
  removeScriptVersionSub = Subscription.EMPTY;
  getConnectionPITItemsSub = Subscription.EMPTY;
  getScriptByIdSub = Subscription.EMPTY;
  getSysLibByIdSub = Subscription.EMPTY;
  getAttachedSysLibSub = Subscription.EMPTY;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialogRef: MatDialogRef<ScriptVersionsComponent>,
    private messageService: MessageService,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    this.getVersionHistory();
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
    this.scriptStateService.openedScripts$.subscribe((openScripts) => {
      if (openScripts?.length) {
        this.openedScripts = openScripts;
      }
    });
  }

  getVersionHistory() {
    const teisItemType = this.dialogData?.isSystemLibrary ? 'systemLibrary' : this.dialogData?.userDefined ? 'userScript' : 'template';
    this.getScriptVersionHistorySub = this.developmentService.getScriptVersionInfo(Number(this.dialogData?.workspaceId), Number(this.dialogData?.scriptId), teisItemType, false).subscribe((res) => {
      if (res) {
        this.versionsList = res?.versionInfoList?.length ? res?.versionInfoList : [];
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  viewVersionHistory(version: any): void {
    version.isSystemLibrary = this.dialogData?.isSystemLibrary;
    version.userDefined = this.dialogData?.userDefined;
    version.language = this.dialogData?.language;
    version.workspaceId = this.dialogData?.workspaceId;
    version.scriptId = this.dialogData?.scriptId;
    version.scriptName = this.dialogData?.scriptName;
    version.triggerScript = this.dialogData?.triggerScript;
    version.type = this.dialogData?.type;
    const dialogRef = this.dialog.open(ScriptVersionViewerComponent, {
      width: "900px",
      maxHeight: '95vh',
      height: '95%',
      data: {
        ...version,
        isIXUserScriptAccess: this.dialogData?.isIXUserScriptAccess,
        isIXTemplateAndSysLibAccess: this.dialogData?.isIXTemplateAndSysLibAccess,
        isBreakUserScriptLockAccess: this.dialogData?.isBreakUserScriptLockAccess,
        isBreakTempAndSysLibLockAccess: this.dialogData?.isBreakTempAndSysLibLockAccess,
        isCURDTemplateAccess: this.dialogData?.isCURDTemplateAccess,
        isCURDSysLibAccess: this.dialogData?.isCURDSysLibAccess,
        isCURDUserScriptAccess: this.dialogData?.isCURDUserScriptAccess,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  /*============= Get Attached SysLibs Status =============*/
  getAttachedSysLibsStatus(versionInfo: any) {
    const attachedSysLibIds = versionInfo?.connectedIds || [];
    if (attachedSysLibIds.length) {
      this.getAttachedSysLibSub = this.developmentService.getSysLibStatus(attachedSysLibIds).subscribe((res) => {
        if (res?.length) {
          const isUndeployedSysLibAttached = res.some((lib) => !lib?.IsDeployed);
          if (isUndeployedSysLibAttached) {
            this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `One or more connected system libraries for this script are not deployed. As a result, deploy operations cannot be performed.` });
          } else {
            this.getConnectedPITItems(versionInfo);
          }
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  /*============= Deploy Script Version =============*/
  deployScriptVersion(versionInfo: any) {
    if (versionInfo?.connectedIds?.length) {
      // Check if there are any attached system libraries status is it deployed or not
      this.getAttachedSysLibsStatus(versionInfo);
    } else {
      this.getConnectedPITItems(versionInfo);
    }
  }

  /*=============== Create String ===============*/
  createString(arr: Array<any>) {
    let formattedHTML = '';
    const grouped: { [key: string]: string[] } = {};

    arr.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item.name);
    });

    return formattedHTML = Object.entries(grouped).map(([type, names]) => {
      const title = type === 'Processes' ? 'Process(es):' : type === 'Triggers' ? 'Trigger(s):' : type === 'Integrations' ? 'Integration(s):' : type;
      const nameList = names.map(n => `<div style="margin-left: 20px">${n}</div>`).join('');
      return `<div><strong>${title}</strong><small>${nameList}</small></div>`;
    }).join('');
  }

  /*============= Get Connected PIT Items By Script Id =============*/
  getConnectedPITItems(versionInfo: any) {
    this.getConnectionPITItemsSub = this.developmentService.getConnectedPITItemsByScriptId(Number(this.dialogData?.scriptId), this.dialogData?.type, this.dialogData?.triggerScript).subscribe((res) => {
      if (res?.length) {
        const connectedPITItems = JSON.parse(JSON.stringify(res));

        if (connectedPITItems?.length) {
          const dialogRef = this.dialog.open(ConnectedItemsConfirmationComponent, {
            width: "900px",
            maxHeight: '95vh',
            height: '95%',
            data: {
              scriptName: this.dialogData?.scriptName,
              workspaceId: this.dialogData?.workspaceId,
              connectedItems: connectedPITItems,
            },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result?.isConfirmed) {
              this.deployScriptVer(versionInfo);
            }
          });
        } else {
          this.deployScriptVer(versionInfo);
        }
      } else {
        this.deployScriptVer(versionInfo);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============= Deploy Script Version =============*/
  deployScriptVer(versionInfo: any) {
    const deployObj = {
      workspaceId: Number(this.dialogData?.workspaceId),
      deploymentDetails: [{
        teisItemID: Number(this.dialogData?.scriptId),
        teisItemType: this.dialogData?.isSystemLibrary ? 'systemLibrary' : this.dialogData?.userDefined ? 'userScript' : this.dialogData?.language === 'C#' ? 'adapter' : 'template',
        teisVersionNumber: Number(versionInfo?.versionNumber),
        deployed: false
      }],
      reportRequired: false,
      redeployRequired: false,
    };
    this.deployScriptVersionSub = this.developmentService.deployScriptVersionById(deployObj).subscribe((res) => {
      if (res) {
        this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `Script version deployed successfully!` });
        this.getVersionHistory();
        // Jira TEI-5438 and TEI-5430 Change Below code is commented because after deployment of version we are not updating the deployed version in opened script until user reopen the script.
        if (!this.dialogData?.lockInfo?.isLocked) {
          if (this.dialogData?.isSystemLibrary) {
            this.getSysLibScriptById(this.dialogData?.scriptId, true);
          } else {
            this.getScriptById(this.dialogData?.scriptId, this.dialogData?.isSystemLibrary ? 'systemLibrary' : this.dialogData?.userDefined ? 'userScript' : this.dialogData?.language === 'C#' ? 'adapter' : 'template', this.dialogData?.workspaceId, true);
          }
        }
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=============== Get Script By Id ===============*/
  getScriptById(scriptId: string, type: string, workspaceId: number, isDeployed: boolean) {
    const wsId = (type.toLowerCase() === 'userscript' || type === 'USER_SCRIPT') ? Number(this.dialogData?.workspaceId) : 0;
    this.getScriptByIdSub = this.developmentService.getScriptById(scriptId, type, wsId).subscribe((res) => {
      if (res) {
        this.dialogData.scriptName = res?.scriptName;
        this.dialogData.description = res?.description;
        this.dialogData.deployed = isDeployed;
        this.dialogData.deployedVersion = res?.deployedVersion;
        this.dialogData.latestVersion = res?.versionNumber;
        this.dialogData.url = this.scriptStateService.getUrl(this.dialogData?.workspaceId, this.dialogData?.scriptId, this.dialogData?.tabId, this.dialogData?.type, false, '0', true, this.dialogData?.debugSeId, this.dialogData?.debugSeUrl, this.scriptStateService.getEditorTheme(),this.dialogData?.lockInfo?.isLocked, false);
        this.dialogData.trustedUrl = this.scriptStateService.getUrl(this.dialogData?.workspaceId, this.dialogData?.scriptId, this.dialogData?.tabId, this.dialogData?.type, false, '0', true, this.dialogData?.debugSeId, this.dialogData?.debugSeUrl, this.scriptStateService.getEditorTheme(), this.dialogData?.lockInfo?.isLocked, false);
        this.scriptStateService.sharedSelectedScriptData(this.dialogData);
        this.scriptStateService.setActionPerformed(true);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=============== Get SysLib Script By Id ===============*/
  getSysLibScriptById(sysLibId: string, isDeployed: boolean) {
    const debugSeId = this.dialogData?.debugSeId;
    const debugSeUrl = this.dialogData?.debugSeUrl;
    this.getSysLibByIdSub = this.developmentService.getSystemLibraryById(sysLibId, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        this.dialogData.scriptName = res?.scriptName;
        this.dialogData.description = res?.description;
        this.dialogData.deployed = isDeployed;
        this.dialogData.deployedVersion = res?.deployedVersion;
        this.dialogData.latestVersion = res?.versionNumber;
        this.dialogData.url = this.scriptStateService.getUrl(this.dialogData?.workspaceId, this.dialogData?.scriptId, this.dialogData?.tabId, this.dialogData?.type, false, '0', true, this.dialogData?.debugSeId, this.dialogData?.debugSeUrl, this.scriptStateService.getEditorTheme(), this.dialogData?.lockInfo?.isLocked, false);
        this.dialogData.trustedUrl = this.scriptStateService.getUrl(this.dialogData?.workspaceId, this.dialogData?.scriptId, this.dialogData?.tabId, this.dialogData?.type, false, '0', true, this.dialogData?.debugSeId, this.dialogData?.debugSeUrl, this.scriptStateService.getEditorTheme(), this.dialogData?.lockInfo?.isLocked, false);
        this.scriptStateService.sharedSelectedScriptData(this.dialogData);
        this.scriptStateService.setActionPerformed(true);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============= Restore Script Version =============*/
  restoreScriptVersion(versionInfo: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: "600px",
      maxHeight: "800px",
      data: `Restore will overwrite existing working copy. Are you sure want to restore?`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.restoreScriptVersionSub = this.developmentService.restoreScriptVersionById(Number(this.dialogData?.scriptId), Number(versionInfo?.versionNumber), this.dialogData?.isSystemLibrary ? 'systemLibrary' : this.dialogData?.userDefined ? 'userScript' : this.dialogData?.language === 'C#' ? 'adapter' : 'template').subscribe((res) => {
          if (res) {
            this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `Script version restored successfully!` });
            this.dialogRef.close({
              isAction: true,
              isRestored: true,
              verId: versionInfo?.id,
              versionNumber: versionInfo?.versionNumber,
              scriptType: this.dialogData?.isSystemLibrary ? 'systemLibrary' : this.dialogData?.userDefined ? 'userScript' : this.dialogData?.language === 'C#' ? 'adapter' : 'template',
            });
            this.scriptStateService.setActionPerformed(true);
          }
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
      }
    });
  }

  /*============= Remove Script Version =============*/
  removeScriptVersion(versionInfo: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: "600px",
      maxHeight: "800px",
      data: `Are you sure you want to delete selected version?`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.removeScriptVersionSub = this.developmentService.deleteScriptVersionById(versionInfo?.id, this.dialogData?.isSystemLibrary ? 'SYSTEMLIBRARY' : this.dialogData?.userDefined ? 'USERSCRIPT' : 'TEMPLATE').subscribe((res) => {
          if (res) {
            this.getVersionHistory();
            this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `Script version deleted successfully!` });
          }
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
      }
    });
  }

  onClose(): void {
    this.dialogRef.close({
      isAction: false,
      isRestored: false,
      verId: null,
      versionNumber: null,
    });
  }

  ngOnDestroy(): void {
    this.getScriptVersionHistorySub.unsubscribe();
    this.restoreScriptVersionSub.unsubscribe();
    this.deployScriptVersionSub.unsubscribe();
    this.removeScriptVersionSub.unsubscribe();
    this.getScriptByIdSub.unsubscribe();
    this.getSysLibByIdSub.unsubscribe();
    this.getAttachedSysLibSub.unsubscribe();
  }
}
