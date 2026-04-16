import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";
import { HeaderService } from '../../core/service/header.service';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { Router, ActivatedRoute } from '@angular/router';
// import { MatDialog } from '@angular/material/dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MenuItem, MessageService } from 'primeng/api';
import { CreateScriptComponent } from './create-script/create-script.component';
import { Workspace } from "../../application-integration/app-integration/appintegration";
import { ScriptVersionsComponent } from './script-versions/script-versions.component';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { OpenScriptComponent } from './open-script/open-script.component';
import { ImportScriptComponent } from './import-script/import-script.component';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { ScriptItem } from '../development';
import { DevelopmentService } from '../development.service';
import { RecentFilesComponent } from './recent-files/recent-files.component';
import { Subscription } from 'rxjs';
import { ScriptEditorComponent } from './script-editor/script-editor.component';
import { Constants } from 'src/app/shared/components/constants';
import { SharedService } from 'src/app/shared/services/shared.service';
import { KeycloakSecurityService } from 'src/app/shared/services/keycloak-security.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { DebugScriptEngineComponent } from './debug-script-engine/debug-script-engine.component';
import { UserSettingService } from 'src/app/dashboard/user-settings/user-setting.service';
import { TabCommunicationService } from 'src/app/shared/services/tab-communication.service';

@Component({
  selector: 'app-development',
  templateUrl: './development.component.html',
  styleUrls: ['./development.component.scss'],
})
export class DevelopmentComponent implements OnInit, AfterViewInit, OnDestroy {
  currentUser: any = null;
  scriptData: any = null;
  activeTab: string = 'file';
  items: MenuItem[];
  workspaces: Array<Workspace> = [];
  displayScriptDialog: boolean = false;
  scriptName: string = '';
  scriptDescription: string = '';
  isScriptModule: boolean = false;
  scriptTabs: ScriptItem[] = [];
  openedScripts: Array<any> = [];
  activeScriptTab: number = 0;
  activeScriptData: any = null;
  recentFiles: Array<any> = [];
  isCRUDUserScriptPermission: boolean = false;
  isCRUDTemplateScriptPermission: boolean = false;
  isCRUDSysLibPermission: boolean = false;
  isImportExportUserScriptPermission: boolean = false;
  isImportExportTemplateAndSysLibPermission: boolean = false;
  isScriptPropertiesShow: boolean = true;
  isUserHaveImportExportPermission: boolean = false;
  userSettings: any = null;

  deleteScriptSub = Subscription.EMPTY;
  recentScriptSub = Subscription.EMPTY;
  getScriptByIdSub = Subscription.EMPTY;
  getSysLibByIdSub = Subscription.EMPTY;
  getScriptLockInfoSub = Subscription.EMPTY;
  getWorkspacesSub = Subscription.EMPTY;
  openScriptsSub = Subscription.EMPTY;
  selectedScriptSub = Subscription.EMPTY;
  createRecentScriptSub = Subscription.EMPTY;
  getDebugParameterSub = Subscription.EMPTY;
  getWorkingSysLibByIdSub = Subscription.EMPTY;
  getWorkingScriptByIdSub = Subscription.EMPTY;
  getUserSettingSub = Subscription.EMPTY;
  getUserSettingDarkModeSub = Subscription.EMPTY;
  tabMessageSub = Subscription.EMPTY;
  crossTabScriptData: any = null;

  @ViewChild(ScriptEditorComponent, { static: false }) scriptEditor: ScriptEditorComponent;

  // Show confirmation dialog when reload the page
  private unloadCallback = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = ''; // This triggers the confirmation popup
  };

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public dialog: MatDialog,
    private messageService: MessageService,
    private scriptStateService: ScriptStateService,
    private developmentService: DevelopmentService,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
    private kcService: KeycloakSecurityService,
    private sanitizer: DomSanitizer,
    private encryptDecryptService: EncryptDecryptService,
    private userSettingService: UserSettingService,
    private tabCommunicationService: TabCommunicationService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    if (localStorage.getItem(Constants?.DEV_CRUD_USER_SCRIPT)) {
      this.isCRUDUserScriptPermission = true;
    } else {
      this.isCRUDUserScriptPermission = false;
    }
    if (localStorage.getItem(Constants?.DEV_CRUD_TEMPLATE)) {
      this.isCRUDTemplateScriptPermission = true;
    } else {
      this.isCRUDTemplateScriptPermission = false;
    }
    if (localStorage.getItem(Constants?.DEV_CRUD_SYSTEM_LIBRARY)) {
      this.isCRUDSysLibPermission = true;
    } else {
      this.isCRUDSysLibPermission = false;
    }
    if (localStorage.getItem(Constants?.DEV_IMPORT_EXPORT_USER_SCRIPT)) {
      this.isImportExportUserScriptPermission = true;
    } else {
      this.isImportExportUserScriptPermission = false;
    }
    if (localStorage.getItem(Constants?.DEV_IMPORT_EXPORT_TEMPLATE_AND_SYSTEM_LIBRARY)) {
      this.isImportExportTemplateAndSysLibPermission = true;
    } else {
      this.isImportExportTemplateAndSysLibPermission = false;
    }
  }

  ngOnInit(): void {
    // Show confirmation dialog when reload the page
    // window.addEventListener('beforeunload', this.unloadCallback);
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/development') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }

    this.updateMenuItems();

    this.openScriptsSub = this.scriptStateService.openedScripts$.subscribe((openedScripts) => {
      if (openedScripts?.length > 0) {
        // Show confirmation dialog when reload the page
        window.addEventListener('beforeunload', this.unloadCallback);
      } else {
        // Remove event Show confirmation dialog when reload the page
        window.removeEventListener('beforeunload', this.unloadCallback);
      }
      this.openedScripts = openedScripts;
      const hasOpenScripts = openedScripts.length > 0;
      this.updateMenuItems(hasOpenScripts);
    });

    this.selectedScriptSub = this.scriptStateService.selectedScript$.subscribe((script) => {
      if (script) {
        this.scriptData = script;
        const accessWorkspaces = this.currentUser?.workspaceAccess;
        if (accessWorkspaces?.length) {
          accessWorkspaces.forEach((aws) => {
            if (Number(aws?.workspaceId) === Number(script?.workspaceId)) {
              const ixAccess = aws?.accessList.some((x) => x?.key === 'DEV_IX_USCRT');
              this.isUserHaveImportExportPermission = ixAccess;
            }
          });
        }
        this.updateMenuItems(true);
      }
    });
    // this.recentFiles = this.scriptStateService.getRecentFiles();
    this.getWorkspacesByUser();
    this.getUserSettings('DEV', true, null);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      // Check if script was passed via URL query parameter using ActivatedRoute
      this.activatedRoute.queryParams.subscribe(params => {
        const scriptKey = params['scriptKey'];

        if (scriptKey) {
          try {
            const scriptDataJson = localStorage.getItem(scriptKey);
            if (scriptDataJson) {
              this.crossTabScriptData = JSON.parse(scriptDataJson);
              this.crossTabScriptData.trustedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.crossTabScriptData.url);
              this.crossTabScriptData.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.crossTabScriptData.url);
              const openedScript = this.crossTabScriptData;
              this.getUserSettings('DEV', false, openedScript?.scriptId);
              this.scriptStateService.addOpenedScript(openedScript);
              this.scriptStateService.sharedSelectedScriptData(openedScript);
              this.activeScriptTab = this.openedScripts.length - 1;
              // Clean up localStorage
              localStorage.removeItem(scriptKey);
            }
          } catch (e) {
            // ignore errors
          }
        }
      });

      // Still listen for messages from other tabs as a fallback mechanism
      this.tabMessageSub = this.tabCommunicationService.data$.subscribe((msg: any) => {
        try {
          if (msg?.action === 'openScriptFromIntegration' && msg?.data) {
            this.crossTabScriptData = msg.data;
            // TODO: Handle the script opening logic here
          }
        } catch (e) {
          // ignore errors
        }
      });
    });
  }

  updateMenuItems(hasOpenScripts: boolean = false): void {
    this.items = [
      {
        label: 'New script',
        icon: 'lc-icon-Add-document',
        disabled: !this.isCRUDUserScriptPermission && !this.isCRUDTemplateScriptPermission && !this.isCRUDSysLibPermission,
        command: () => this.createScript('EMPTY_PROCESS_SCRIPT', false, false)
      },
      {
        label: 'Open script',
        icon: 'lc-icon-Folder-open',
        disabled: false,
        command: () => this.onOpenScriptClick()
      },
      {
        label: 'Import',
        icon: 'lc-icon-Download',
        disabled: this.isImportExportUserScriptPermission || this.isImportExportTemplateAndSysLibPermission ? false : true,
        command: () => this.onImportClick()
      },
      {
        label: 'Recent scripts',
        icon: 'lc-icon-History',
        disabled: false,
        command: () => this.onRecentFilesClick()
      }
    ];
  }

  selectTab(tab: string) {
    this.activeTab = tab;
  }

  /*============ Get All Workspaces ============*/
  getWorkspacesByUser(): void {
    this.getWorkspacesSub = this.developmentService.getWorkspacesByUsername(this.currentUser?.userName).subscribe((res) => {
      this.workspaces = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getUserSettings(module: string, callForTheme: boolean, scriptId: any) {
    const obj = {
      function: '',
      parent_id: '',
      parameterName: '',
      moduleCode: module
    };
    this.getUserSettingSub = this.userSettingService.getUserSetting(obj).subscribe((res) => {
      if (res?.length) {
        if (callForTheme) {
          const darkMode = res.find(item => item.action.toLowerCase() === 'setdarkmode');
          const theme = (darkMode && darkMode.value === 'true') ? true : false;
          this.scriptStateService.storeEditorTheme(theme ? 'vs-dark' : 'vs');
        } else {
          const settings = res.find(param => param.action === 'StoreRecentScript');
          if (settings?.value === 'true') {
            this.createRecentScript(Number(scriptId));
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

  createScript(scriptType: string, isCreateFromExistingScript: boolean, isCreateFromExistingTemplate: boolean): void {
    const dialogRef = this.dialog.open(CreateScriptComponent, {
      width: "600px",
      maxHeight: '95vh',
      height: '95%',
      data: {
        name: '',
        description: '',
        isScriptModule: false,
        scriptType: scriptType,
        isCreateFromExistingScript: isCreateFromExistingScript,
        isCreateFromExistingTemplate: isCreateFromExistingTemplate
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'finish') {
        const createdScript = result.data;
        this.getUserSettings('DEV', false, createdScript?.scriptId);
        this.scriptStateService.addOpenedScript(createdScript); // Update state
        this.activeScriptTab = this.openedScripts.length - 1; // Update active tab
      }
    });
  }

  hideAndShowScriptProperties() {
    this.isScriptPropertiesShow = !this.isScriptPropertiesShow;
  }

  setActiveTab(index: number): void {
    this.activeScriptTab = index;
  }

  removeScript(index: number): void {
    const updatedScripts = this.openedScripts.filter((_, i) => i !== index);

    // Update active tab before updating openedScripts
    let newActiveTab = this.activeScriptTab;

    if (this.activeScriptTab === index) {
      newActiveTab = 0;
    } else if (this.activeScriptTab > index) {
      newActiveTab = this.activeScriptTab - 1;
    }

    this.openedScripts = updatedScripts;
    this.scriptStateService.updateOpenedScripts(updatedScripts);

    // Manually trigger change detection
    this.cdr.detectChanges();
  }

  onCreateTriggerScriptClick(): void {
    const dialogRef = this.dialog.open(CreateScriptComponent, {
      width: '500px',
      data: {
        name: '',
        description: '',
        isScriptModule: true,
        scriptType: 'Trigger'
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'finish') {
        const createdScript = result.data;
        this.scriptStateService.addOpenedScript(createdScript);
        this.activeScriptTab = this.openedScripts.length - 1;
      }
    });
  }

  onCreateProcessScriptClick(): void {
    const dialogRef = this.dialog.open(CreateScriptComponent, {
      width: '500px',
      data: {
        name: '',
        description: '',
        isScriptModule: true,
        scriptType: 'Process'
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'finish') {
        const createdScript = result.data;
        this.scriptStateService.addOpenedScript(createdScript); // Update state
        this.activeScriptTab = this.openedScripts.length - 1; // Update active tab
      }
    });
  }

  handleActiveScriptChange(scriptData: any): void {
    this.activeScriptData = scriptData;
  }

  onFinish(): void {
    this.displayScriptDialog = false;
  }

  onCancel(): void {
    this.displayScriptDialog = false;
  }

  onOpenScriptClick() {
    const dialogRef = this.dialog.open(OpenScriptComponent, {
      width: "600px",
      maxHeight: '95vh',
      height: '95%',
      data: { title: 'Open Script' }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.action === 'open') {
        const openedScript = result.data;
        this.scriptStateService.addOpenedScript(openedScript);
        this.activeScriptTab = this.openedScripts.length - 1;
        if (result?.data?.type !== 'systemLibrary' && result?.data?.type !== 'SYSTEM_LIBRARY') {
          // this.createRecentScript(result?.data?.scriptId);
          this.getUserSettings('DEV', false, result?.data?.scriptId);
        }
      }
    });
  }

  /*============ Create Recent Scripts ============*/
  createRecentScript(scriptId: number) {
    this.createRecentScriptSub = this.developmentService.createRecentScripts(scriptId).subscribe((res) => {
      if (res) { }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  handleScriptSelection(selectedScript: ScriptItem): void {

  }

  onOpenTriggerScriptClick() {
    this.dialog.open(OpenScriptComponent, {
      width: '700px',
      data: { title: 'Trigger script' }
    });
  }
  onOpenProcessScriptClick() {
    this.dialog.open(OpenScriptComponent, {
      width: '700px',
      data: { title: 'Process script' }
    });
  }
  onOpenSystemLibrary() {
    this.dialog.open(OpenScriptComponent, {
      width: '700px',
      data: { title: 'System library' }
    });
  }

  onDeleteScriptClick(): void {
    const scriptToDelete = this.openedScripts[this.activeScriptTab];

    if (!scriptToDelete) {
      this.messageService.add({ key: 'devInfoKey', severity: 'success', summary: '', detail: 'No script selected for deletion.' });
      return;
    }

    this.dialog.open(ConfirmationComponent, {
      width: '700px',
      data: 'Are you sure you want to remove this script? Note: All versions will be deleted. If any uncertainty, do an export before as a backup.'
    }).afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deleteScriptSub = this.developmentService.removeScript(Number(scriptToDelete?.workspaceId), Number(scriptToDelete?.scriptId), false, scriptToDelete?.userDefined).subscribe((res) => {
          if (res) {
            this.scriptStateService.removeOpenedScript(scriptToDelete);
            this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `${scriptToDelete?.scriptName} script deleted successfully!` });
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

  onSaveClick() {

  }

  onSaveAllClick() {

  }

  onVersionHandlingClick() {
    this.dialog.open(ScriptVersionsComponent, {
      width: '700px'
    });
  }

  onImportClick() {
    this.dialog.open(ImportScriptComponent, {
      width: '700px',
      maxHeight: "800px",
      data: {}
    }).afterClosed().subscribe((result) => {
      if (result?.isImport) {
        if (this.openedScripts?.length >= 5) {
          this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `You can open a maximum of 5 scripts.` });
          return;
        } else {
          const debugSeName = result?.data?.debugSeName;
          const scriptEngineGroupName = result?.data?.scriptEngineGroupName;
          if (result?.data?.scriptType === 'userScript' || result?.data?.scriptType === 'template') {
            this.getScriptLockInfo(result?.data?.scriptId, result?.data?.scriptType, result?.data?.scriptType === 'userScript' ? result?.data?.workspaceId : 0, result?.data?.debugSeId, result?.data?.debugSeUrl, debugSeName, scriptEngineGroupName);
          } else if (result?.data?.scriptType === 'systemLibrary') {
            this.getScriptLockInfo(result?.data?.scriptId, result?.data?.scriptType, result?.data?.scriptType === 'userScript' ? result?.data?.workspaceId : 0, result?.data?.debugSeId, result?.data?.debugSeUrl, debugSeName, scriptEngineGroupName);
          }
        }
      }
    });
  }

  onPrintClick() {

  }

  onPrintSetupClick() {

  }

  onRecentFilesClick() {
    this.recentScriptSub = this.developmentService.getRecentScripts('DEV', 'ExecutableId', 'RecentScript').subscribe((res) => {
      if (res?.length) {
        const recentScripts = JSON.parse(JSON.stringify(res));
        this.recentFiles = recentScripts.map(({ scriptId, scriptName, workspaceId }) => ({
          scriptId: scriptId,
          scriptName: scriptName,
          label: scriptName?.length > 15 ? scriptName.substring(0, 15) + '...' : scriptName,
          workspaceId: workspaceId ? workspaceId : null,
        }));
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  openRecentFile(file: any) {
    if (this.openedScripts?.length >= 5) {
      this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `You can open a maximum of 5 scripts.` });
      return;
    } else {
      const scriptType = file?.workspaceId ? 'userScript' : 'template';
      this.selectDebugScriptEngine(file?.scriptId, scriptType, file?.workspaceId);
    }
  }

  /*=============== Select Debug Script Engine ===============*/
  selectDebugScriptEngine(scriptId: string, scriptType: string, workspaceId: number) {
    const dialogRef = this.dialog.open(DebugScriptEngineComponent, {
      width: "700px",
      maxHeight: "800px",
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isOpen) {
        const debugSeId = result?.debugSE?.debugSeId;
        const debugSeUrl = result?.debugSE?.debugSeUrl;
        const debugSeName = result?.debugSE?.debugSeName;
        const scriptEngineGroupName = result?.debugSE?.scriptEngineGroupName;
        this.getScriptLockInfo(scriptId, scriptType, workspaceId, debugSeId, debugSeUrl, debugSeName, scriptEngineGroupName);
      }
    });
  }

  /*=============== Get Script Lock Info ===============*/
  getScriptLockInfo(scriptId: string, type: string, workspaceId: number, debugSeId: string, debugSeUrl: string, debugSeName: string, scriptEngineGroupName: string) {
    this.getScriptLockInfoSub = this.developmentService.getScriptLockInfo(Number(workspaceId), Number(scriptId), type).subscribe((res) => {
      if (res) {
        let workspace = null;
        const lockInfo = JSON.parse(JSON.stringify(res));

        if (type === 'userScript' || type === 'USER_SCRIPT') {
          workspace = this.workspaces?.length ? this.workspaces.find((ws) => Number(ws.id) === Number(workspaceId)) : null;
        }

        if (lockInfo?.idOfLockedItem && lockInfo?.lockDate && lockInfo?.lockTime && lockInfo?.lockedBy) {
          // Below code is commented due to getting issue for showing incorrect buttons to user
          // if (Number(lockInfo?.lockedUserId) === Number(this.currentUser?.id)) {
          //   lockInfo.isLocked = true;
          // } else {
          //   lockInfo.isLocked = false;
          // }
          // Below code is added to disabled script editor if current user don't have lock
          if (Number(lockInfo?.lockedUserId) === Number(this.currentUser?.id)) {
            lockInfo.isBreakLockBtnVisible = false;
          } else {
            lockInfo.isBreakLockBtnVisible = true;
          }
          lockInfo.isLocked = true;
        } else {
          lockInfo.isLocked = false;
        }

        if (type === 'systemLibrary' || type === 'SYSTEM_LIBRARY') {
          // No system library in recent scripts
          if (lockInfo.isLocked) {
            this.getWorkingSysLibById(scriptId.toString(), false, lockInfo, res, debugSeId, debugSeUrl, debugSeName, scriptEngineGroupName);
          } else {
            this.getSysLibById(scriptId.toString(), lockInfo, res, debugSeId, debugSeUrl, debugSeName, scriptEngineGroupName);
          }
        } else {
          // Get Script Parameters only if the script is not a system library
          this.getScriptParameters(scriptId, type, workspace, lockInfo, debugSeId, debugSeUrl, debugSeName, scriptEngineGroupName);
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

  /*============== Get Script Parameters ==============*/
  getScriptParameters(scriptId: string, type: string, workspace: any, lockInfo: any, debugSeId: string, debugSeUrl: string, debugSeName: string, scriptEngineGroupName: string) {
    const clientId = this.scriptStateService.getTabId(scriptId);
    const obj = {
      jsonMap: null,
      headers: null,
      clientId: [`${clientId}`],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: (workspace && workspace?.id) ? workspace.id : 0,
      scriptId: scriptId,
      userName: this.currentUser?.userName,
      debugSeId: debugSeId,
      debugSeUrl: debugSeUrl
    };

    this.getDebugParameterSub = this.developmentService.getDebugScriptParameters(obj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res?.length) {
        res.forEach(x => {
          x.securityLevel = x?.securityLevel ? x?.securityLevel.toLowerCase() : x?.securityLevel;
          if (x?.securityLevel === 'high' || x?.securityLevel === 'medium') {
            if (x.hasOwnProperty('value') && x?.value) {
              x.value = this.encryptDecryptService.decrypt(x?.value);
            }
          }
        });
      }

      if (lockInfo.isLocked) {
        if (type === 'systemLibrary' || type === 'SYSTEM_LIBRARY') {
          this.getWorkingSysLibById(scriptId.toString(), false, lockInfo, res, debugSeId, debugSeUrl, debugSeName, scriptEngineGroupName);
        } else {
          this.getWorkingScriptById(scriptId.toString(), type, (workspace && workspace?.id) ? workspace.id : 0, workspace ? workspace.name : '', false, lockInfo, res, debugSeId, debugSeUrl, debugSeName, scriptEngineGroupName);
        }
      } else {
        if (type === 'systemLibrary' || type === 'SYSTEM_LIBRARY') {
          this.getSysLibById(scriptId.toString(), lockInfo, res, debugSeId, debugSeUrl, debugSeName, scriptEngineGroupName);
        } else {
          this.getScriptById(scriptId.toString(), type, (workspace && workspace?.id) ? workspace.id : 0, workspace ? workspace.name : '', lockInfo, res, debugSeId, debugSeUrl, debugSeName, scriptEngineGroupName);
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

  /*========= Get Working Copy of System Library By Id =========*/
  getWorkingSysLibById(sysLibId: string, deployed: boolean, lockInfo: any, debugParams: Array<any>, debugSeId: string, debugSeUrl: string, debugSeName: string, scriptEngineGroupName: string) {
    this.getWorkingSysLibByIdSub = this.developmentService.getDeployedSystemLibraryById(sysLibId, deployed).subscribe((res) => {
      if (res) {
        const updatedScript = {
          scriptName: res?.scriptName,
          type: "systemLibrary",
          scriptEngine: "All",
          description: res?.description,
          connectable: res?.connectable,
          updatedBy: res?.updatedBy,
          lastUpdated: res?.lastUpdated,
          language: res?.language,
          workspaceId: 0,
          scriptId: res?.executableRef ? res?.executableRef : res?.id,
          userDefined: res?.userDefined,
          deployedVersion: res?.deployedVersion,
          tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
          sysLibRefList: res?.sysLibRefList,
          sysLibRefNameList: res?.sysLibRefNameList,
          isSystemLibrary: true,
          deployed: deployed,
          isDeployed: deployed,
          trustedUrl: this.scriptStateService.getUrl(0, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', deployed ? true : false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo.isLocked && !lockInfo.isBreakLockBtnVisible), false),
          url: this.scriptStateService.getUrl(0, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', deployed ? true : false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo.isLocked && !lockInfo.isBreakLockBtnVisible), false),
          lockInfo: lockInfo,
          debugParameters: debugParams,
          debugSeId: debugSeId,
          debugSeUrl: debugSeUrl,
          debugSeName: debugSeName,
          scriptEngineGroupName: scriptEngineGroupName,
          latestVersion: res?.versionNumber
        };
        this.scriptStateService.setScriptCreated(updatedScript);
        this.scriptStateService.addOpenedScript(updatedScript);
        this.scriptStateService.sharedSelectedScriptData(updatedScript);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*========= Get System Library By Id =========*/
  getSysLibById(sysLibId: string, lockInfo: any, debugParams: Array<any>, debugSeId: string, debugSeUrl: string, debugSeName: string, scriptEngineGroupName: string) {
    this.getSysLibByIdSub = this.developmentService.getSystemLibraryById(sysLibId, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        const updatedScript = {
          scriptName: res?.scriptName,
          type: "systemLibrary",
          scriptEngine: "All",
          description: res?.description,
          connectable: res?.connectable,
          updatedBy: res?.updatedBy,
          lastUpdated: res?.lastUpdated,
          language: res?.language,
          workspaceId: 0,
          scriptId: res?.executableRef ? res?.executableRef : res?.id,
          userDefined: res?.userDefined,
          deployedVersion: res?.deployedVersion,
          tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
          sysLibRefList: res?.sysLibRefList,
          sysLibRefNameList: res?.sysLibRefNameList,
          isSystemLibrary: true,
          deployed: res?.deployedVersion > 0 ? true : false,
          isDeployed: res?.deployedVersion > 0 ? true : false,
          trustedUrl: this.scriptStateService.getUrl(0, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', res?.deployedVersion > 0 ? true : false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo.isLocked && !lockInfo.isBreakLockBtnVisible), false), 
          url: this.scriptStateService.getUrl(0, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', res?.deployedVersion > 0 ? true : false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo.isLocked && !lockInfo.isBreakLockBtnVisible), false),
          lockInfo: lockInfo,
          debugParameters: debugParams,
          debugSeId: debugSeId,
          debugSeUrl: debugSeUrl,
          debugSeName: debugSeName,
          scriptEngineGroupName: scriptEngineGroupName,
          latestVersion: res?.versionNumber
        };
        this.scriptStateService.setScriptCreated(updatedScript);
        this.scriptStateService.addOpenedScript(updatedScript);
        this.scriptStateService.sharedSelectedScriptData(updatedScript);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============== Get Working Copy of Script Details By Id ==============*/
  getWorkingScriptById(scriptId: string, type: string, workspaceId: number, workspaceName: string, deployed: boolean, lockInfo: any, debugParams: Array<any>, debugSeId: string, debugSeUrl: string, debugSeName: string, scriptEngineGroupName: string) {
    this.getWorkingScriptByIdSub = this.developmentService.getDeployedScriptById(scriptId, type, workspaceId, deployed).subscribe((res) => {
      if (res) {
        const updatedScript = {
          scriptName: res?.scriptName,
          type: res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template',
          scriptEngine: "All",
          description: res?.description,
          connectable: res?.connectable,
          updatedBy: res?.updatedBy,
          lastUpdated: res?.lastUpdated,
          language: res?.language,
          workspaceId: workspaceId,
          workspaceName: workspaceName,
          scriptId: res?.executableRef ? res?.executableRef : res?.id,
          userDefined: res?.userDefined,
          triggerScript: res?.triggerScript,
          deployedVersion: res?.deployedVersion,
          tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
          isSystemLibrary: false,
          sysLibRefList: res?.sysLibRefList,
          sysLibRefNameList: res?.sysLibRefNameList,
          deployed: deployed,
          isDeployed: deployed,
          trustedUrl: this.scriptStateService.getUrl(workspaceId, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo.isLocked && !lockInfo?.isBreakLockBtnVisible), false),
          url: this.scriptStateService.getUrl(workspaceId, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo.isLocked && !lockInfo?.isBreakLockBtnVisible), false),
          lockInfo: lockInfo,
          debugParameters: debugParams,
          debugSeId: debugSeId,
          debugSeUrl: debugSeUrl,
          debugSeName: debugSeName,
          scriptEngineGroupName: scriptEngineGroupName,
          latestVersion: res?.versionNumber
        };
        this.scriptStateService.setScriptCreated(updatedScript);
        this.scriptStateService.addOpenedScript(updatedScript);
        this.scriptStateService.sharedSelectedScriptData(updatedScript);
        // this.scriptStateService.setActionPerformed(true);
        // this.createRecentScript(res?.executableRef ? res?.executableRef : res?.id);
        this.getUserSettings('DEV', false, res?.executableRef ? res?.executableRef : res?.id);
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
  getScriptById(scriptId: string, type: string, workspaceId: number, workspaceName: string, lockInfo: any, debugParams: Array<any>, debugSeId: string, debugSeUrl: string, debugSeName: string, scriptEngineGroupName: string) {
    const wsId = (type.toLowerCase() === 'userscript' || type === 'USER_SCRIPT') ? Number(workspaceId) : 0;
    this.getScriptByIdSub = this.developmentService.getScriptById(scriptId, type, wsId).subscribe((res) => {
      if (res) {
        const updatedScript = {
          scriptName: res?.scriptName,
          type: res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template',
          scriptEngine: "All",
          description: res?.description,
          connectable: res?.connectable,
          updatedBy: res?.updatedBy,
          lastUpdated: res?.lastUpdated,
          language: res?.language,
          workspaceId: workspaceId,
          workspaceName: workspaceName,
          scriptId: res?.executableRef ? res?.executableRef : res?.id,
          userDefined: res?.userDefined,
          triggerScript: res?.triggerScript,
          deployedVersion: res?.deployedVersion,
          tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
          isSystemLibrary: false,
          sysLibRefList: res?.sysLibRefList,
          sysLibRefNameList: res?.sysLibRefNameList,
          deployed: res?.deployedVersion > 0 ? true : false,
          isDeployed: res?.deployedVersion > 0 ? true : false,
          trustedUrl: this.scriptStateService.getUrl(workspaceId, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', res?.deployedVersion > 0 ? true : false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo.isLocked && !lockInfo?.isBreakLockBtnVisible), false),
          url: this.scriptStateService.getUrl(workspaceId, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', res?.deployedVersion > 0 ? true : false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo.isLocked && !lockInfo?.isBreakLockBtnVisible), false),
          lockInfo: lockInfo,
          debugParameters: debugParams,
          debugSeId: debugSeId,
          debugSeUrl: debugSeUrl,
          debugSeName: debugSeName,
          scriptEngineGroupName: scriptEngineGroupName,
          latestVersion: res?.versionNumber
        };
        updatedScript.debugParameters = debugParams;
        this.scriptStateService.setScriptCreated(updatedScript);
        this.scriptStateService.addOpenedScript(updatedScript);
        this.scriptStateService.sharedSelectedScriptData(updatedScript);
        // this.scriptStateService.setActionPerformed(true);
        // this.createRecentScript(res?.executableRef ? res?.executableRef : res?.id);
        this.getUserSettings('DEV', false, res?.executableRef ? res?.executableRef : res?.id);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=============== Handle Change ===============*/
  handleChange(index: number): void {
  }

  ngOnDestroy() {
    this.deleteScriptSub.unsubscribe();
    this.recentScriptSub.unsubscribe();
    this.getScriptByIdSub.unsubscribe();
    this.getScriptLockInfoSub.unsubscribe();
    this.getWorkspacesSub.unsubscribe();
    this.openScriptsSub.unsubscribe();
    this.selectedScriptSub.unsubscribe();
    this.createRecentScriptSub.unsubscribe();
    this.getSysLibByIdSub.unsubscribe();
    this.getDebugParameterSub.unsubscribe();
    this.getWorkingSysLibByIdSub.unsubscribe();
    this.getWorkingScriptByIdSub.unsubscribe();
    this.getUserSettingSub.unsubscribe();
    this.getUserSettingDarkModeSub.unsubscribe();
    this.tabMessageSub.unsubscribe();
    // Remove event Show confirmation dialog when reload the page
    window.removeEventListener('beforeunload', this.unloadCallback);
  }
}