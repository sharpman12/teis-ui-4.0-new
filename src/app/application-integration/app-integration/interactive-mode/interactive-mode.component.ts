import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { interval, Subject, Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/components/constants';
import { KeycloakSecurityService } from 'src/app/shared/services/keycloak-security.service';
import { WebSocketService } from 'src/app/shared/services/web-socket.service';
import { AppIntegrationService } from '../app-integration.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DevelopmentService } from 'src/app/development/development.service';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { filter, mapTo, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { ExitInteractiveConfirmationComponent } from './exit-interactive-confirmation/exit-interactive-confirmation.component';

@Component({
  selector: 'app-interactive-mode',
  templateUrl: './interactive-mode.component.html',
  styleUrls: ['./interactive-mode.component.scss']
})
export class InteractiveModeComponent implements OnInit, OnDestroy {
  trustedUrl: SafeResourceUrl = null;
  currentUser: any = null;
  currentIndex = 0;
  currentScript: any = null;
  currentScriptDebugExe: any = null;
  isScriptPropertiesShow: boolean = true;
  taskParams: any = null;
  private destroy$ = new Subject<void>();
  private pollingStop$ = new Subject<void>(); // to control polling
  // 👇 condition (can be dynamic)
  shouldFetch: boolean = true;
  scriptLanguage: string = '';
  sentToEngine: boolean = false;

  private createTaskSub = Subscription.EMPTY;
  private getWorkingScriptByIdSub = Subscription.EMPTY;
  private getWebSocketResSub = Subscription.EMPTY;
  private getScriptExeSub = Subscription.EMPTY;
  private closedScriptsSub = Subscription.EMPTY;
  private getTaskParamsByIdSub = Subscription.EMPTY;
  private stopTaskSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<InteractiveModeComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private webSocketService: WebSocketService,
    private kcService: KeycloakSecurityService,
    private appIntegrationService: AppIntegrationService,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
    private encryptDecryptService: EncryptDecryptService
  ) {
    this.dialogRef.disableClose = true;
    if (this.dialogData?.item?.scriptList?.length) {
      this.dialogData?.item?.scriptList.forEach((script: any, i: number) => {
        script.order = i;
        script.sId = Number(script?.executableRef ? script?.executableRef : script?.id);
        script.tabId = this.scriptStateService.getTabId(script.sId);;
      });
    }
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    const scriptType = this.dialogData?.taskObj?.userDefinedScript ? 'userScript' : 'template';
    this.getWorkingScriptById(this.dialogData?.taskObj?.scriptId, scriptType, this.dialogData?.taskObj?.workspaceId, true, this.dialogData?.taskObj?.taskId);
    this.getTaskParamsById(this.dialogData?.taskObj?.taskId);
  }

  ngOnInit(): void {
    this.currentIndex = this.dialogData?.taskObj?.currentScript;
    this.scriptLanguage = this.dialogData?.taskObj?.language;
    this.sentToEngine = this.dialogData?.taskObj?.sentToEngine;
    // Connect web socket after user login to portal
    if (!this.webSocketService?.isWSConnected()) {
      this.webSocketService.connect();
    }
    this.getWebSocketResSub = this.webSocketService.webSocketResponse$.subscribe((res) => {
      if (res) {
        const webSocketRes = JSON.parse(res);
        if (webSocketRes?.module.toLowerCase() === 'interactive') {
          if (webSocketRes?.responseStatus === '!notify_end') {
            this.releaseAllocationId(false, '');
          }
        }
      }
    });

    if ((this.scriptLanguage === 'C#')) {
      this.startPolling(this.currentIndex, this.sentToEngine);
    }
  }

  // Start polling
  startPolling(currentIndex: number, sentToEngine: boolean) {
    this.currentIndex = currentIndex;
    if ((this.scriptLanguage === 'C#')) {

      // const obj = {
      //   scriptIndex: currentIndex,
      //   taskId: this.dialogData?.taskObj?.taskId,
      //   debugSeUrl: this.dialogData?.debugSeUrl || '',
      //   sentToEngine: sentToEngine
      // };

      interval(10000).pipe(
        takeUntil(this.pollingStop$),
        takeUntil(this.destroy$),
        mapTo(null), // clear old value
        // switchMap(() => this.appIntegrationService.getDebugExe({...obj})),
        switchMap(() => {
          const obj = {
            scriptIndex: this.currentIndex,
            taskId: this.dialogData?.taskObj?.taskId,
            debugSeUrl: this.dialogData?.debugSeUrl || '',
            sentToEngine: this.sentToEngine
          };
          return this.appIntegrationService.getDebugExe(obj);
        }),
        tap((res) => {
          if (res && (res?.language === 'C#')) {
            this.startPolling(res?.currentScript, res?.sentToEngine);
            this.shouldFetch = (res?.language === 'C#') ? true : false;
            this.currentScriptDebugExe = res;
            this.currentIndex = Number(res?.currentScript);
            this.sentToEngine = res?.sentToEngine;
            const scriptType = res?.userDefinedScript ? 'userScript' : 'template';
            this.getWorkingScriptById(res?.scriptId, scriptType, res?.workspaceId, false, res?.taskId);
          }
          // Stop if condition is met
          if (res.language !== 'C#') {
            this.stopPolling();
            // if script is not C# and task is still processing then call getDebugExecutables api else close the dialog
            if (res?.taskStatus.toLowerCase() === 'processing') {
              this.getDebugExecutables(this.currentIndex, this.sentToEngine);
            } else {
              this.onClose(false);
            }
          }
        })
      ).subscribe();
    }
  }

  // Stop polling
  stopPolling() {
    this.pollingStop$.next(); // triggers stop
  }

  hideAndShowScriptProperties() {
    this.isScriptPropertiesShow = !this.isScriptPropertiesShow;
  }

  getTaskParamsById(taskId: string) {
    this.getTaskParamsByIdSub = this.appIntegrationService.getTaskParametersByTaskId(taskId).subscribe((res) => {
      if (res) {
        const obj = res.map;
        if (Object.keys(obj).length) {
          Object.keys(obj).forEach((key) => {
            const replacedKey = key.trim().replace(/\s+/g, '');
            if (key !== replacedKey) {
              obj[replacedKey] = obj[key];
              delete obj[key];
            }
            // Decrypted data here if security level is High
            if (obj[key]?.securityLevel === 'high' || obj[key]?.securityLevel === 'medium') {
              obj[key].value = this.encryptDecryptService.decrypt(obj[key].value);
            }
          });
          this.taskParams = obj;
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

  getWorkingScriptById(scriptId: string, type: string, workspaceId: number, deployed: boolean, tsakId: string) {
    this.getWorkingScriptByIdSub = this.developmentService.getDeployedScriptById(scriptId, type, workspaceId, deployed).subscribe((res) => {
      if (res) {
        const scriptList = this.dialogData?.item?.scriptList || [];
        const script = JSON.parse(JSON.stringify(res));
        script.sId = Number(script?.executableRef ? script?.executableRef : script?.id);
        if (scriptList?.length) {
          const s = scriptList.find((s: any) => s.sId === script.sId);
          script.order = s?.order;
        }
        this.currentScript = script;
        const tabId = this.scriptStateService.getTabId(scriptId);
        const debugSeId = this.dialogData?.debugSeId || '';
        const debugSeUrl = this.dialogData?.debugSeUrl || '';
        const url = this.getUrl(workspaceId, Number(scriptId), tabId, type, tsakId, true, debugSeId, debugSeUrl);
        this.trustedUrl = url;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  // Call this api for get next script data
  getDebugExecutables(currentScript: number, sentToEngine: boolean) {
    const obj = {
      scriptIndex: currentScript,
      taskId: this.dialogData?.taskObj?.taskId,
      debugSeUrl: this.dialogData?.debugSeUrl || '',
      sentToEngine: sentToEngine
    }
    this.getScriptExeSub = this.appIntegrationService.getDebugExe(obj).subscribe((res) => {
      this.scriptLanguage = res ? res?.language : '';
      this.sentToEngine = res ? res?.sentToEngine : false;
      if (res && (res?.language === 'C#')) {
        this.startPolling(res?.currentScript, res?.sentToEngine);
        this.shouldFetch = (res?.language === 'C#') ? true : false;
        this.currentScriptDebugExe = res;
        this.currentIndex = Number(res?.currentScript);
        this.sentToEngine = res?.sentToEngine;
        const scriptType = res?.userDefinedScript ? 'userScript' : 'template';
        this.getWorkingScriptById(res?.scriptId, scriptType, res?.workspaceId, false, res?.taskId);
      } else {
        if (res && (res?.taskStatus.toLowerCase() === 'processing')) {
          this.currentScriptDebugExe = res;
          this.currentIndex = Number(res?.currentScript);
          this.sentToEngine = res?.sentToEngine;
          const scriptType = res?.userDefinedScript ? 'userScript' : 'template';
          this.getWorkingScriptById(res?.scriptId, scriptType, res?.workspaceId, false, res?.taskId);
        } else {
          this.onClose(false);
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

  /*======== Release Allocation Id Once Script Execution is Done ========*/
  releaseAllocationId(isExit: boolean, status: string) {
    let tabId = '';
    const scriptList = this.dialogData?.item?.scriptList || [];
    const previousScriptIndex = this.currentIndex;
    if (scriptList?.length) {
      scriptList.forEach((script: any, i: number) => {
        if (i === previousScriptIndex) {
          tabId = this.scriptStateService.getTabId(this.currentScript?.sId);
        }
      });
    }

    const obj = {
      jsonMap: null,
      headers: null,
      clientId: [`${tabId}`],
      contentType: 'application/winwrap;charset=utf-8',
      debugSeId: this.dialogData?.debugSeId || '',
      debugSeUrl: this.dialogData?.debugSeUrl || '',
    };

    const debugSeId = this.dialogData?.debugSeId || '';
    const debugSeUrl = this.dialogData?.debugSeUrl || '';

    this.closedScriptsSub = this.developmentService.closeTab(obj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        if (isExit) {
          this.stopTask(status);
        } else {
          this.getDebugExecutables(this.currentIndex, this.sentToEngine);
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

  getUrl(wsId: number, sId: number, tId: string, sType: string, taskId: string, isDeployed: boolean, debugSeId: string, debugSeUrl: string): SafeResourceUrl {
    const baseUrl = window.location.origin;
    const workspaceId = wsId;
    const scriptId = sId;
    const tabId = tId;
    const scriptType = sType;
    const token = this.kcService.getToken();
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/winwrap/?clientid=${tabId}&wId=${workspaceId}&exeId=${scriptId}&type=${scriptType}&taskId=${taskId}&isDeployed=${isDeployed}&debugSeId=${debugSeId}&debugSeUrl=${debugSeUrl}&theme=${'vs'}`);
  }

  refreshScript() {
    // Temporarily set url to '' and reset
    const temp = this.trustedUrl;
    this.trustedUrl = '';
    setTimeout(() => {
      this.trustedUrl = temp;
    }, 100); // Short delay to force reload
  }

  getScripts() {
    if (this.dialogData?.item?.scriptList?.length) {
      const scripts = JSON.parse(JSON.stringify(this.dialogData.item.scriptList));
      scripts?.forEach((script: any) => {
        const scriptId = script.executableRef ? script.executableRef : script.id;
        const workspaceId = script.workspaceId ? script.workspaceId : 0;
        const tabId = this.scriptStateService.getTabId(scriptId);
        const scriptType = script.userDefined ? 'userScript' : 'template';
        const debugSeId = this.dialogData?.debugSeId || '';
        const debugSeUrl = this.dialogData?.debugSeUrl || '';
        script.url = this.getUrl(workspaceId, scriptId, tabId, scriptType, this.dialogData?.taskObj?.taskId, true, debugSeId, debugSeUrl);
      });
      return scripts;
    }
  }

  jumpToScript() {
    const scripts = this.getScripts();
    if (this.currentIndex < scripts.length - 1) {
      this.currentIndex++;
      this.currentScript = scripts[this.currentIndex];
      this.trustedUrl = this.currentScript?.url;
    }
  }

  onClose(isExit: boolean) {
    if (isExit) {
      this.onExit();
    } else {
      this.dialogRef.close({ isAction: false });
      this.webSocketService.setWebSocketReceivedRes(null);
    }
  }

  onExit() {
    // Exiting the script execution will immediately mark your task as failed. Are you sure you want to proceed?
    const dialogRef = this.dialog.open(ExitInteractiveConfirmationComponent, {
      width: "600px",
      panelClass: "myapp-no-padding-dialog",
      data: {
        title: "Would you like to mark these tasks as complete, or keep the error flag on them?"
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isConfirm) {
        const status = result?.status === 'MARK_AS_COMPLETE' ? 'Completed' : 'Stopped';
        this.releaseAllocationId(true, status);
      }
    });
  }

  stopTask(status: string) {
    const taskUpdateDto = {
      executionState: status,
      note: `The task has been stopped by the user ${this.currentUser.firstName} ${this.currentUser.lastName} in interactive mode.`,
      taskId: this.dialogData?.taskObj?.taskId,
      taskStatus: ['Initiate', 'Processing', 'ProcessingWithError'],
      taskStopped: true,
      updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      workspaceId: this.dialogData?.taskObj?.workspaceId
    };
    this.stopTaskSub = this.appIntegrationService.stopTask([taskUpdateDto]).subscribe((res) => {
      if (res) {
        this.dialogRef.close({ isAction: false });
        this.webSocketService.setWebSocketReceivedRes(null);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  ngOnDestroy(): void {
    // Cleanup logic if needed
    this.createTaskSub.unsubscribe();
    this.getWebSocketResSub.unsubscribe();
    this.getScriptExeSub.unsubscribe();
    this.closedScriptsSub.unsubscribe();
    this.getTaskParamsByIdSub.unsubscribe();
    this.stopTaskSub.unsubscribe();
    // cleanup when component destroyed
    this.destroy$.next();
    this.destroy$.complete();
    this.stopPolling(); // ensure cleanup
  }
}
