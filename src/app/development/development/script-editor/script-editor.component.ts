import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, Subscription } from 'rxjs';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { DevelopmentService } from '../../development.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { KeycloakSecurityService } from 'src/app/shared/services/keycloak-security.service';
import { WebSocketService } from 'src/app/shared/services/web-socket.service';
import { DebugParameterComponent } from '../debug-parameter/debug-parameter.component';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { MessageService } from 'primeng/api';
import { Constants } from 'src/app/shared/components/constants';
import { WinwrapRequestDto } from '../../development';
import { SystemLibraryReferencesComponent } from '../system-library-references/system-library-references.component';

@Component({
  selector: 'app-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.scss']
})
export class ScriptEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() openedScripts: any[] = [];
  @Input() activeScriptTab: number = 0;
  @Output() scriptSelected = new EventEmitter<any>();
  @Output() scriptClosed = new EventEmitter<number>();
  @Output() activeScriptChange = new EventEmitter<any>();
  trustedUrl: SafeResourceUrl = null;
  activeScriptLockInfo: any = null;
  scriptView: string = '';
  scriptData: any = null;
  currentUser: any = null;

  private previousOpenedScriptsLength = 0;
  @ViewChild('myIframe', { static: false }) iframe!: ElementRef<HTMLIFrameElement>;

  @HostListener('window:resize')
  onResize() {
    // this.setIframeHeight();
  }

  private openedScriptsSub = Subscription.EMPTY;
  private selectedScriptsSub = Subscription.EMPTY;
  private closedScriptsSub = Subscription.EMPTY;
  private isActionPerformedSub = Subscription.EMPTY;
  private isDeleteActionPerformedSub = Subscription.EMPTY;
  private getDebugParameterSub = Subscription.EMPTY;
  private getDebugParamsSub = Subscription.EMPTY;
  private getScriptParsedParametersSub = Subscription.EMPTY;
  private isCloseScriptTabSub = Subscription.EMPTY;
  private getAllocatedIdsSub = Subscription.EMPTY;
  private attachReferencesSub = Subscription.EMPTY;
  private attachSysLibListSub = Subscription.EMPTY;

  constructor(
    public dialog: MatDialog,
    private scriptStateService: ScriptStateService,
    private developmentService: DevelopmentService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private kcService: KeycloakSecurityService,
    private encryptDecryptService: EncryptDecryptService,
    private messageService: MessageService,
    // private webSocketService: WebSocketService,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
  }

  ngOnInit(): void {
    this.openedScriptsSub = this.scriptStateService.openedScripts$.subscribe((scripts) => {
      this.openedScripts = scripts;
      const currentLength = scripts.length;
      const isAddition = currentLength > this.previousOpenedScriptsLength;

      this.openedScripts = scripts;
      this.previousOpenedScriptsLength = currentLength;

      if (isAddition) {
        setTimeout(() => {
          this.activeScriptTab = currentLength - 1;
          this.scriptStateService.sharedActiveTabId(this.activeScriptTab);
          this.activeScriptChange.emit(this.openedScripts[this.activeScriptTab]);
          // this.openScript();
        });
      }
    });

    // Subscribe to selected script changes
    // This will update the lock info of the currently selected script
    // We can hide and show iframe based on this lock info
    this.selectedScriptsSub = this.scriptStateService.selectedScript$.subscribe((script) => {
      if (script) {
        this.scriptData = script;
        this.openedScripts = this.openedScripts.map((x) => {
          if (Number(x?.scriptId) === Number(script?.scriptId)) {
            let scriptNameWithType = '';
            x.scriptName = script?.scriptName;
            scriptNameWithType = x.scriptName;
            if (script?.type === 'userScript') {
              scriptNameWithType = `${x.scriptName} (bas)`
            } else if (script?.type === 'template') {
              scriptNameWithType = `${x.scriptName} (tpl)`
            } else if (script?.isSystemLibrary && script?.type === 'systemLibrary') {
              scriptNameWithType = `${x.scriptName} (syslib)`
            }
            x.scriptNameWithType = scriptNameWithType;
            x.label = scriptNameWithType?.length > 12 ? scriptNameWithType.substring(0, 12) + '...' : scriptNameWithType;
            x.description = script?.description;
            x.deployedVersion = script?.deployedVersion;
            x.version = script?.deployed ? `${script?.deployedVersion} DPD` : Number(script?.latestVersion) > 0 ? script?.latestVersion : 'WC';
            x.lockInfo = script?.lockInfo;
            x.sysLibRefList = script?.sysLibRefList;
            x.sysLibRefNameList = script?.sysLibRefNameList;
            x.trustedUrl = script?.url;
          }
          return x;
        });
        const activeScriptId = this.openedScripts[this.activeScriptTab]?.scriptId;
        if (Number(activeScriptId) === Number(script?.scriptId)) {
          this.activeScriptLockInfo = script?.lockInfo;
          // this.openScript();
        }
      }
    });

    // Subscribe to action changes
    this.isActionPerformedSub = this.scriptStateService.isActionPerformed$.subscribe((action) => {
      if (action) {
        this.refreshIframe(this.activeScriptTab, false);
        this.scriptStateService.setActionPerformed(false);
      }
    });

    this.isDeleteActionPerformedSub = this.scriptStateService.isDeleteActionPerformed$.subscribe((action) => {
      if (action?.isDeleted) {
        const scriptId = action?.scriptId;
        const index = this.openedScripts.findIndex((obj) => Number(obj.scriptId) === Number(scriptId));
        this.removeScript(index, true);
        this.scriptStateService.removeOpenedScript(scriptId);
        this.scriptStateService.setDeleteActionPerformed({ isDelete: false, scriptId: null });
        this.cdr.detectChanges();
      }
    });

    this.isCloseScriptTabSub = this.scriptStateService.isClosedScriptTab$.subscribe((res) => {
      if (res) {
        // Removed all open script tab allocation ids (clientIds) if user click on Home link
        this.removeAllocationId(0, true);
      }
    });
  }

  ngAfterViewInit() {
    // const iframeDoc = this.iframe.nativeElement.contentDocument;
    // const iframeData = iframeDoc.querySelector('#scriptIframe')?.textContent;
  }

  getReferencesList(genId: number) {
    const dialogRef = this.dialog.open(SystemLibraryReferencesComponent, {
      width: "700px",
      maxHeight: "800px",
      data: { ...this.scriptData, isSysLibClick: false, genId: genId }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isReferenceAttached) {
        this.getGenId(false, true, result?.attachedReferenceIds);
      }
    });
  }

  attachedReferences(genId: number, refIds: Array<any>) {
    const attachRefObj: WinwrapRequestDto = {
      jsonMap: null,
      headers: null,
      clientId: [this.scriptData?.tabId],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: this.scriptData?.workspaceId,
      scriptId: this.scriptData?.scriptId,
      attachSysLibIds: [],
      attachedReferenceIds: refIds,
      debugSeId: this.scriptData?.debugSeId,
      debugSeUrl: this.scriptData?.debugSeUrl,
      genId: genId
    };

    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;

    this.attachReferencesSub = this.developmentService.attachReferences(attachRefObj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        // Handle result if needed
        this.scriptData.attachedReferenceIds = refIds;
        this.scriptStateService.updateScripts(this.scriptData, this.scriptData?.lockInfo);
        this.scriptStateService.sharedSelectedScriptData(this.scriptData);
        this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `Reference(s) attached successfully!` });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getGenId(isGetRef: boolean, isAttachedRef: boolean, attachedRefIds: Array<any>) {
    const obj = {
      jsonMap: null,
      headers: null,
      clientId: [`${this.scriptData?.tabId}`],
      contentType: 'application/winwrap;charset=utf-8',
      debugSeId: this.scriptData?.debugSeId,
      debugSeUrl: this.scriptData?.debugSeUrl
    };

    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;

    this.getAllocatedIdsSub = this.developmentService.getAllocatedIdsByClientId(obj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res?.length) {
        res.forEach((x) => {
          if (this.scriptData?.tabId === x?.clientId) {
            const genId = (this.iframe.nativeElement.contentWindow as any).getGenId(x?.allocatedId);
            if (isGetRef) {
              this.getReferencesList(genId);
            } else if (isAttachedRef) {
              this.attachedReferences(genId, attachedRefIds);
            }
          }
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  openScript() {
    if (this.openedScripts.length > 0) {
      const baseUrl = window.location.origin;
      const workspaceId = this.openedScripts[this.activeScriptTab]?.workspaceId;
      const scriptId = this.openedScripts[this.activeScriptTab]?.scriptId;
      const tabId = this.openedScripts[this.activeScriptTab]?.tabId;
      const scriptType = this.openedScripts[this.activeScriptTab]?.type;
      const token = this.kcService.getToken();
      // this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/winwrap/?clientid=${tabId}&wId=${workspaceId}&exeId=${scriptId}&type=${scriptType}&token=${token}`);
      // this.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://wpg02xvfx:8693/winwrap/?clientid=${tabId}&wId=${workspaceId}&exeId=${scriptId}`);
    }
  }

  setActiveTab(index: number): void {
    this.activeScriptTab = index;
    this.scriptStateService.sharedActiveTabId(this.activeScriptTab);
    const activeScript = this.openedScripts[index];
    this.activeScriptChange.emit(activeScript); // Notify about the active script change
    this.openScript();
  }

  removeAllocationId(index: number, isRemoveAll: boolean) {
    let clientIds = [];
    if (isRemoveAll) {
      const tabIds = this.openedScripts.map((s) => s?.tabId);
      clientIds = tabIds;
    } else {
      const closedScript = this.openedScripts.find((x, i) => i === index);
      clientIds = [`${closedScript?.tabId}`]
    }

    const obj = {
      jsonMap: null,
      headers: null,
      clientId: clientIds,
      contentType: 'application/winwrap;charset=utf-8',
      debugSeId: this.scriptData?.debugSeId || '',
      debugSeUrl: this.scriptData?.debugSeUrl || '',
    };

    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;

    // Remove close tab id from script engine that's why call this api
    this.closedScriptsSub = this.developmentService.closeTab(obj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res?.length) {
        if (isRemoveAll) {
          this.router.navigate(['dashboard']);
          this.scriptStateService.closedAllScriptOpenTabs(false);
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

  removeScript(index: number, isDeleted: boolean): void {
    if (index < 0 || index >= this.openedScripts.length) return;

    if (isDeleted) {
      // const closedScript = this.openedScripts.find((x, i) => i === index);

      // const obj = {
      //   jsonMap: null,
      //   headers: null,
      //   clientId: [`${closedScript?.tabId}`],
      //   contentType: 'application/winwrap;charset=utf-8',
      //   debugSeId: this.scriptData?.debugSeId || '',
      //   debugSeUrl: this.scriptData?.debugSeUrl || '',
      // };

      // const debugSeId = this.scriptData?.debugSeId;
      // const debugSeUrl = this.scriptData?.debugSeUrl;

      // Remove allocation id once refresh script
      this.removeAllocationId(index, false);
      // this.closedScriptsSub = this.developmentService.closeTab(obj, debugSeId, debugSeUrl).subscribe((res) => {
      //   if (res?.length) { }
      // }, (err: HttpErrorResponse) => {
      //   if (err.error instanceof Error) {
      //     // handle client side error here
      //   } else {
      //     // handle server side error here
      //   }
      // });

      const updatedScripts = this.openedScripts.filter((x, i) => i !== index);

      // Only adjust active tab if we're removing the current active tab
      let newActiveTab = this.activeScriptTab;
      // if (this.activeScriptTab === index) {
      //   newActiveTab = Math.max(updatedScripts.length - 1, 0);
      // } else if (this.activeScriptTab > index) {
      //   newActiveTab = this.activeScriptTab - 1;
      // }

      if (this.activeScriptTab === index) {
        newActiveTab = 0;
      } else if (this.activeScriptTab > index) {
        newActiveTab = this.activeScriptTab - 1;
      }

      this.openedScripts = updatedScripts;
      this.activeScriptTab = newActiveTab;
      this.scriptStateService.sharedActiveTabId(this.activeScriptTab);

      // Emit events
      this.scriptClosed.emit(index);
      this.activeScriptChange.emit(updatedScripts[newActiveTab] || null);

      // Update service
      this.scriptStateService.updateOpenedScripts(updatedScripts);
      this.scriptStateService.sharedSelectedScriptData(updatedScripts[newActiveTab] || null);

      // Trigger change detection
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    } else {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: "600px",
        maxHeight: "800px",
        data: `Are you sure you want to close this script? Unsaved changes will be lost.`
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          // const closedScript = this.openedScripts.find((x, i) => i === index);

          // const obj = {
          //   jsonMap: null,
          //   headers: null,
          //   clientId: [`${closedScript?.tabId}`],
          //   contentType: 'application/winwrap;charset=utf-8',
          //   debugSeId: this.scriptData?.debugSeId || '',
          //   debugSeUrl: this.scriptData?.debugSeUrl || '',
          // };

          // const debugSeId = this.scriptData?.debugSeId;
          // const debugSeUrl = this.scriptData?.debugSeUrl;

          // Remove allocation id once refresh script
          this.removeAllocationId(index, false);
          // this.closedScriptsSub = this.developmentService.closeTab(obj, debugSeId, debugSeUrl).subscribe((res) => {
          //   if (res?.length) { }
          // }, (err: HttpErrorResponse) => {
          //   if (err.error instanceof Error) {
          //     // handle client side error here
          //   } else {
          //     // handle server side error here
          //   }
          // });

          const updatedScripts = this.openedScripts.filter((x, i) => i !== index);

          // Only adjust active tab if we're removing the current active tab
          let newActiveTab = this.activeScriptTab;
          // if (this.activeScriptTab === index) {
          //   newActiveTab = Math.max(updatedScripts.length - 1, 0);
          // } else if (this.activeScriptTab > index) {
          //   newActiveTab = this.activeScriptTab - 1;
          // }

          if (this.activeScriptTab === index) {
            newActiveTab = 0;
          } else if (this.activeScriptTab > index) {
            newActiveTab = this.activeScriptTab - 1;
          }

          this.openedScripts = updatedScripts;
          this.activeScriptTab = newActiveTab;
          this.scriptStateService.sharedActiveTabId(this.activeScriptTab);

          // Emit events
          this.scriptClosed.emit(index);
          this.activeScriptChange.emit(updatedScripts[newActiveTab] || null);

          // Update service
          this.scriptStateService.updateOpenedScripts(updatedScripts);
          this.scriptStateService.sharedSelectedScriptData(updatedScripts[newActiveTab] || null);

          // Trigger change detection
          setTimeout(() => {
            this.cdr.detectChanges();
          });
        }
      });
    }
  }

  handleChange(index: number): void {
    this.setActiveTab(index);
    const selectedScript = this.openedScripts.find((x, i) => i === index);
    this.scriptStateService.sharedSelectedScriptData(selectedScript);
  }

  refreshIframe(index: number, isReloadClick: boolean): void {
    const tab = this.openedScripts.find((t, i, arr) => i === index);

    if (tab?.lockInfo?.isLocked && isReloadClick) {
      if (Number(tab?.lockInfo?.lockedUserId) === Number(this.currentUser?.id)) {
        // User has the lock, allow refresh
        const dialogRef = this.dialog.open(ConfirmationComponent, {
          width: "600px",
          maxHeight: "800px",
          data: `Are you sure you want to reload? Any unsaved changes to the executable code (including added/removed references) will be lost if you reload.`
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            // Remove allocation id once refresh script
            this.removeAllocationId(index, false);

            // Added back allocation id after 5 seconds of refresh script. This is temporary fix for now. Remove after testing.
            // setTimeout(() => {
            //   this.getGenId(false, true, this.scriptData?.attachedReferenceIds ? this.scriptData?.attachedReferenceIds : []);
            // }, 5000);

            this.attachedSysLibs(tab);

            if (tab) {
              if (this.activeScriptTab === index) {
                // Temporarily set url to '' and reset
                const temp = tab.trustedUrl;
                tab.trustedUrl = '';
                setTimeout(() => {
                  tab.trustedUrl = temp;
                }, 100); // Short delay to force reload
              }
            }
          }
        });
      } else {
        // Remove allocation id once refresh script
        this.removeAllocationId(index, false);

        // Added back allocation id after 5 seconds of refresh script. This is temporary fix for now. Remove after testing.
        // setTimeout(() => {
        //   this.getGenId(false, true, this.scriptData?.attachedReferenceIds ? this.scriptData?.attachedReferenceIds : []);
        // }, 5000);

        this.attachedSysLibs(tab);

        if (tab) {
          if (this.activeScriptTab === index) {
            // Temporarily set url to '' and reset
            const temp = tab.trustedUrl;
            tab.trustedUrl = '';
            setTimeout(() => {
              tab.trustedUrl = temp;
            }, 100); // Short delay to force reload
          }
        }
      }
    } else {
      // Remove allocation id once refresh script
      this.removeAllocationId(index, false);

      // Added back allocation id after 5 seconds of refresh script. This is temporary fix for now. Remove after testing.
      // setTimeout(() => {
      //   this.getGenId(false, true, this.scriptData?.attachedReferenceIds ? this.scriptData?.attachedReferenceIds : []);
      // }, 5000);

      this.attachedSysLibs(tab);

      if (tab) {
        if (this.activeScriptTab === index) {
          // Temporarily set url to '' and reset
          const temp = tab.trustedUrl;
          tab.trustedUrl = '';
          setTimeout(() => {
            tab.trustedUrl = temp;
          }, 100); // Short delay to force reload
        }
      }
    }
  }

  attachedSysLibs(script: any): void {
    const attachSysLibObj: WinwrapRequestDto = {
      jsonMap: null,
      headers: null,
      clientId: [script?.tabId],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: script?.workspaceId,
      scriptId: script?.scriptId,
      attachSysLibIds: script?.sysLibRefList || [],
      attachedReferenceIds: [],
      debugSeId: script?.debugSeId,
      debugSeUrl: script?.debugSeUrl
    };

    const debugSeId = script?.debugSeId;
    const debugSeUrl = script?.debugSeUrl;

    this.attachSysLibListSub = this.developmentService.attachSysLib(attachSysLibObj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        // this.dialogRef.close({
        //   isSysLibAttached: true,
        //   isReferenceAttached: false,
        //   selectedSysLibs: this.sysLibsArr.filter((x) => x.selected),
        //   selectedRefernces: [],
        //   attachedReferenceIds: []
        // });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  // Get parsed and debug parameters and merge both parameters
  getDebugParameter(): void {
    const clientId = this.scriptData?.tabId;
    const obj: WinwrapRequestDto = {
      jsonMap: null,
      headers: null,
      clientId: [`${clientId}`],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: this.scriptData?.workspaceId,
      scriptId: this.scriptData?.scriptId,
      attachSysLibIds: [],
      attachedReferenceIds: [],
      userName: this.currentUser?.userName,
      scriptType: this.scriptData?.type,
      deployedCopy: this.scriptData?.lockInfo.isLocked ? false : true,
      versionId: 0,
      versionCopy: false,
      debugSettingUse: false,
      triggerScript: this.scriptData?.triggerScript,
      debugSeId: this.scriptData?.debugSeId,
      debugSeUrl: this.scriptData?.debugSeUrl
    };

    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;

    this.getDebugParamsSub = forkJoin({
      parsedParams: this.developmentService.getParsedScriptParameters(obj, debugSeId, debugSeUrl),
      debugParams: this.developmentService.getDebugScriptParameters({ ...obj, debugSettingUse: true }, debugSeId, debugSeUrl)
    }).subscribe((res) => {

      const parsedParams = res?.parsedParams || [];
      const debugParams = res?.debugParams || [];

      // User can open debug setting window even after there is no debug parameters
      // if (!parsedParams?.length && !debugParams?.length) {
      //   this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `No Debug parameters found!` });
      //   return;
      // }

      // Merge both parameters
      const mergedParameters = this.mergeArrays(parsedParams, debugParams);

      if (mergedParameters?.length) {
        mergedParameters.forEach(x => {
          x.securityLevel = (x.hasOwnProperty('securityLevel') && x?.securityLevel) ? x?.securityLevel.toLowerCase() : x?.securityLevel;
          if (x?.securityLevel === 'high' || x?.securityLevel === 'medium') {
            if (x.hasOwnProperty('value') && x?.value) {
              x.value = this.encryptDecryptService.decrypt(x?.value);
            }
          }
        });
      }

      // Assign merged parameters to script data
      this.scriptData.debugParameters = mergedParameters;

      this.openDebugParams(this.scriptData?.debugParameters || []);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  // Function to merge two arrays parsed and debug parameters based on parameterName
  mergeArrays(parsedArr: any[], debugArr: any[]): any[] {
    const mergedMap = new Map<string, any>();

    // Step 1: Add parsedArr items to map
    parsedArr.forEach(item => {
      mergedMap.set(item.parameterName, { ...item });
    });

    // Step 2: Merge debugArr items
    debugArr.forEach(debugItem => {

      if (mergedMap.has(debugItem.parameterName)) {
        // Case 2: Both exist → prefer parsedArr object but check for debug value
        const existing = mergedMap.get(debugItem.parameterName);

        // Add probableValues from debugArr to mergedMap object
        existing.probableValues = debugItem?.probableValues?.length ? debugItem.probableValues : [];

        // If debug has a value, use it
        if (debugItem.hasOwnProperty("value")) {
          existing.value = debugItem.value;
        }

        mergedMap.set(debugItem.parameterName, existing);
      } else {
        // Item only in debugArr → add it
        mergedMap.set(debugItem.parameterName, { ...debugItem });
      }
    });

    // Convert map back to array
    return Array.from(mergedMap.values());
  }

  // Show debug parameter dialog
  openDebugParams(debugParameters: Array<any>): void {
    const dialogRef = this.dialog.open(DebugParameterComponent, {
      width: "800px",
      maxHeight: '95vh',
      height: '95%',
      data: {
        script: this.scriptData,
        parameters: debugParameters || [],
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isSave) {
        this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `Debug parameters saved successfully!` });
      }
    });
  }

  // debugParameter(): void {
  //   const clientId = this.scriptData?.tabId;
  //   const obj: WinwrapRequestDto = {
  //     jsonMap: null,
  //     headers: null,
  //     clientId: [`${clientId}`],
  //     contentType: 'application/winwrap;charset=utf-8',
  //     workspaceId: this.scriptData?.workspaceId,
  //     scriptId: this.scriptData?.scriptId,
  //     attachSysLibIds: [],
  //     attachedReferenceIds: [],
  //     userName: this.currentUser?.userName,
  //     scriptType: this.scriptData?.type,
  //     deployedCopy: this.scriptData?.lockInfo.isLocked ? false : true,
  //     versionId: 0,
  //     versionCopy: false,
  //     debugSettingUse: false,
  //     triggerScript: this.scriptData?.triggerScript,
  //     debugSeId: this.scriptData?.debugSeId,
  //     debugSeUrl: this.scriptData?.debugSeUrl
  //   };

  //   const debugSeId = this.scriptData?.debugSeId;
  //   const debugSeUrl = this.scriptData?.debugSeUrl;

  //   this.scriptData.debugParameters = [];

  //   this.getScriptParsedParametersSub = this.developmentService.getParsedScriptParameters(obj, debugSeId, debugSeUrl).subscribe((res) => {
  //     // if (!this.scriptData?.debugParameters?.length && !res?.length) {
  //     //   this.messageService.add({ key: 'devInfoKey', severity: 'success', summary: '', detail: `No Debug parameters found!` });
  //     //   return;
  //     // }

  //     // Create a Map from arr1 for fast lookup
  //     const map1 = new Map(this.scriptData?.debugParameters.map((obj) => [obj.parameterName, obj]));

  //     // Iterate over arr2
  //     res.forEach((obj2) => {
  //       const existingObj = map1.get(obj2.parameterName);

  //       if (existingObj) {
  //         // Update existing object values (excluding parameterName)
  //         Object.keys(obj2).forEach(key => {
  //           if (key !== 'parameterName') {
  //             existingObj[key] = obj2[key];
  //           }
  //         });
  //       } else {
  //         // Push unmatched object to arr1
  //         this.scriptData?.debugParameters.push({ ...obj2 });
  //       }
  //     });

  //     this.getDebugParams(this.scriptData?.debugParameters);
  //   }, (err: HttpErrorResponse) => {
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }

  // getDebugParams(parsedParams: Array<any>) {
  //   const clientId = this.scriptData?.tabId;
  //   const obj = {
  //     jsonMap: null,
  //     headers: null,
  //     clientId: [`${clientId}`],
  //     contentType: 'application/winwrap;charset=utf-8',
  //     workspaceId: this.scriptData?.workspaceId,
  //     scriptId: this.scriptData?.scriptId,
  //     userName: this.currentUser?.userName,
  //     debugSettingUse: true,
  //     triggerScript: this.scriptData?.triggerScript,
  //     debugSeId: this.scriptData?.debugSeId,
  //     debugSeUrl: this.scriptData?.debugSeUrl
  //   };
  //   const debugSeId = this.scriptData?.debugSeId;
  //   const debugSeUrl = this.scriptData?.debugSeUrl;
  //   this.getDebugParameterSub = this.developmentService.getDebugScriptParameters(obj, debugSeId, debugSeUrl).subscribe((res) => {
  //     if (res?.length) {
  //       res.forEach(x => {
  //         x.securityLevel = (x.hasOwnProperty('securityLevel') && x?.securityLevel) ? x?.securityLevel.toLowerCase() : x?.securityLevel;
  //         if (x?.securityLevel === 'high' || x?.securityLevel === 'medium') {
  //           if (x.hasOwnProperty('value') && x?.value) {
  //             x.value = this.encryptDecryptService.decrypt(x?.value);
  //           }
  //         }
  //       });

  //       // Find config parameter
  //       const configParameters = res.filter((x) => x?.config);


  //       // Update parsed parameters with debug parameters DB values
  //       const updatedParams = parsedParams.map(item1 => {
  //         const match = res.find(item2 => item2.parameterName === item1.parameterName);
  //         return match ? { ...item1, value: match?.value, probableValues: match?.probableValues } : item1;
  //       });

  //       // Merge parameter
  //       const parameters = [...updatedParams, ...configParameters];


  //       // If store parameter is false in user settings, then we'll check value is available in DB else will take value from state local service if available
  //       if (this.scriptData.debugParameters?.length && parameters?.length) {
  //         // Merge existing debug parameters with updated parameters
  //         this.scriptData.debugParameters.forEach((param) => {
  //           const updatedParam = parameters.find((p) => p.parameterName === param.parameterName);
  //           if (updatedParam) {
  //             param.value = param.value ? param.value : updatedParam.value;
  //           }
  //         });
  //       }

  //       // Merge parameter with config parameters
  //       this.scriptData.debugParameters = [...this.scriptData.debugParameters, ...configParameters];
  //     }
  //     const dialogRef = this.dialog.open(DebugParameterComponent, {
  //       width: "800px",
  //       maxHeight: '95vh',
  //       height: '95%',
  //       data: {
  //         script: this.scriptData,
  //         parameters: this.scriptData?.debugParameters || [],
  //       }
  //     });
  //     dialogRef.afterClosed().subscribe((result) => {
  //       if (result?.isSave) {
  //         this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `Debug parameters saved successfully!` });
  //       }
  //     });
  //   }, (err: HttpErrorResponse) => {
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }

  ngOnDestroy(): void {
    this.openedScriptsSub.unsubscribe();
    this.closedScriptsSub.unsubscribe();
    this.isActionPerformedSub.unsubscribe();
    this.isDeleteActionPerformedSub.unsubscribe();
    this.selectedScriptsSub.unsubscribe();
    this.getDebugParameterSub.unsubscribe();
    this.getDebugParamsSub.unsubscribe();
    this.getScriptParsedParametersSub.unsubscribe();
    this.isCloseScriptTabSub.unsubscribe();
    this.getAllocatedIdsSub.unsubscribe();
    this.attachReferencesSub.unsubscribe();
    this.attachSysLibListSub.unsubscribe();
  }
}