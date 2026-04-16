import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { Workspace } from 'src/app/application-integration/app-integration/appintegration';
import { DevelopmentService } from '../../development.service';
import { Constants } from 'src/app/shared/components/constants';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { ScriptItem, WinwrapRequestDto } from '../../development';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { KeycloakSecurityService } from 'src/app/shared/services/keycloak-security.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { ConfigurationsService } from 'src/app/configuration/configurations/configurations.service';

@Component({
  selector: 'app-open-script',
  templateUrl: './open-script.component.html',
  styleUrls: ['./open-script.component.scss']
})
export class OpenScriptComponent implements OnInit, OnDestroy {
  openScriptForm: UntypedFormGroup;
  workspaces: Array<Workspace> = [];
  selectedWorkspaceId: string | null = null;
  currentUser: any = null;
  scriptTypesArr: Array<any> = [
    { id: 1, value: 'Process' },
    { id: 2, value: 'Trigger' },
    { id: 3, value: 'System library' }
  ];
  optionsArr: Array<any> = [
    { id: 'ALL', value: 'All' },
    { id: 'USER', value: 'User script' },
    { id: 'TEMPLATE', value: 'Template script' },
  ];
  selectedScriptType: number = 1;
  selectedOption: string = 'ALL';
  searchQuery: string = '';
  filteredItems: ScriptItem[] = [];
  selectedItem: ScriptItem | null = null;
  openedScripts: Array<any> = [];
  scriptEngineGroups: Array<any> = [];
  scriptEngines: Array<any> = [];
  debugSeStatus: number = 1;

  validationMessages = {
    workspace: {
      required: "Workspace is required",
    },
    scriptType: {
      required: "Script type is required",
    },
    scriptOption: {
      required: "Script option is required",
    },
    scriptEngineGroup: {
      required: "Script engine group is required",
    },
    scriptEngine: {
      required: "Script engine is required",
    }
  };

  formErrors = {
    workspace: '',
    scriptType: '',
    scriptOption: '',
    scriptEngineGroup: '',
    scriptEngine: ''
  };

  private getWorkspacesSub = Subscription.EMPTY;
  private getAllScriptsSub = Subscription.EMPTY;
  private getAllSysLibSub = Subscription.EMPTY;
  private getScriptLockInfoSub = Subscription.EMPTY;
  private getScriptByIdSub = Subscription.EMPTY;
  private getWorkingScriptByIdSub = Subscription.EMPTY;
  private getWorkingSysLibByIdSub = Subscription.EMPTY;
  private getSysLibByIdSub = Subscription.EMPTY;
  private getDebugParameterSub = Subscription.EMPTY;
  private getScriptEngineGroupsSub = Subscription.EMPTY;
  private getScriptEngineSub = Subscription.EMPTY;
  private getScriptEngineInfoSub = Subscription.EMPTY;
  private getUserSettingDarkModeSub = Subscription.EMPTY;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialogRef: MatDialogRef<OpenScriptComponent>,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private kcService: KeycloakSecurityService,
    private sanitizer: DomSanitizer,
    private encryptDecryptService: EncryptDecryptService,
    private configurationsService: ConfigurationsService
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    setTimeout(() => {
      this.getWorkspacesByUser();
      this.getScriptEnginesInfo();
    });
  }

  ngOnInit(): void {
    this.scriptStateService.openedScripts$.subscribe((openScripts) => {
      if (openScripts?.length) {
        this.openedScripts = openScripts;
      }
    });
    this.createForm();

  }

  createForm() {
    this.openScriptForm = this.fb.group({
      scriptType: [{ value: 1, disabled: false }, {
        validators: [Validators.required]
      }],
      workspace: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      scriptOption: [{ value: 'ALL', disabled: false }, {
        validators: [Validators.required]
      }],
      scriptEngineGroup: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      scriptEngine: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
    });
    this.openScriptForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.openScriptForm);
    });
  }

  logValidationErrors(group: UntypedFormGroup = this.openScriptForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = '';
        if (abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty)) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    });
  }

  getWorkspacesByUser(): void {
    const accessWorkspacesArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    this.getWorkspacesSub = this.developmentService.getWorkspacesByUsername(this.currentUser?.userName).subscribe((res) => {

      if (res?.length && accessWorkspaces?.length) {
        // Filter out archived workspaces
        const workspacesArr = JSON.parse(JSON.stringify(res)).filter((x) => !x?.archived);
        // Get workspaces based on user access Jira 5453
        accessWorkspaces.forEach((aws) => {
          workspacesArr.forEach((ws) => {
            if (Number(aws?.workspaceId) === Number(ws?.id)) {
              if (aws?.accessList.some((x) => x?.key === 'DEV_CRUD_USRS')) {
                accessWorkspacesArr.push(ws);
              }
            }
          });
        });

        this.workspaces = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));

        if (this.workspaces?.length) {
          const defaultWorkspace = this.workspaces.find((x) => x?.defaultWorkspace);
          if (defaultWorkspace) {
            this.selectedWorkspaceId = defaultWorkspace?.id;
            this.openScriptForm.get('workspace').patchValue(defaultWorkspace?.id);
          } else {
            this.selectedWorkspaceId = this.workspaces[0].id;
            this.openScriptForm.get('workspace').patchValue(this.workspaces[0]?.id);
          }
          this.onChangeGetScripts();
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

  /*============= Get Script Engines Info =============*/
  getScriptEnginesInfo(): void {
    this.getScriptEngineInfoSub = this.developmentService.getScriptEngineInfo().subscribe((res) => {
      if (res?.length) {
        this.scriptEngineGroups = res;
        this.openScriptForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.scriptEngineGroupId);
        this.onChangeSEGroup();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onChangeSEGroup(): void {
    const formValues = this.openScriptForm.getRawValue();
    const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValues?.scriptEngineGroup);
    if (selectedGroup) {
      this.scriptEngines = selectedGroup?.scriptEnginesDetails || [];
      this.openScriptForm.get('scriptEngine').patchValue(this.scriptEngines[0]?.scriptEngineId);
      this.onChangeDebugSE();
    }
  }

  onChangeDebugSE() {
    const formValues = this.openScriptForm.getRawValue();
    const selectedScriptEngine = this.scriptEngines.find(x => x.scriptEngineId === formValues?.scriptEngine);
    this.debugSeStatus = selectedScriptEngine?.debugSeStatus;
  }

  onWorkspaceChange(): void {
    this.onChangeGetScripts();
  }

  onChangeGetScripts() {
    const formValues = this.openScriptForm.getRawValue();
    this.selectedScriptType = Number(formValues?.scriptType);
    this.selectedOption = formValues?.scriptOption;
    const wsId = formValues?.scriptOption === 'TEMPLATE' ? null : Number(formValues?.workspace);
    const workspace = this.workspaces?.length ? this.workspaces.find(x => Number(x?.id) === Number(wsId)) : null;
    if (Number(formValues?.scriptType) === 1) {
      // Call api fro process scripts
      const scriptType = 'BUSINESS';
      const isRequireTemplateScript = formValues?.scriptOption === 'USER' ? false : true
      this.getAllScripts(wsId, workspace?.name, scriptType, isRequireTemplateScript);
    } else if (Number(formValues?.scriptType) === 2) {
      // Call api for trigger scripts
      const scriptType = 'TRIGGER';
      const isRequireTemplateScript = formValues?.scriptOption === 'USER' ? false : true
      this.getAllScripts(wsId, workspace?.name, scriptType, isRequireTemplateScript);
    } else {
      // Call api for system libraries
      this.getAllSystemLibraries();
    }
  }

  getAllScripts(workspaceId: any, workspaceName: string, scriptType: string, isRequireTemplateScript: boolean): void {
    let scriptsArr = [];
    const formValues = this.openScriptForm.getRawValue();
    const selectedScriptEngine = this.scriptEngines.find(x => Number(x.scriptEngineId) === Number(formValues?.scriptEngine));
    this.getAllScriptsSub = this.developmentService.getAllScripts(workspaceId, scriptType, isRequireTemplateScript).subscribe((res) => {
      if (res?.length) {
        const filteredScripts = res.filter((s) => s?.language !== 'C#');
        scriptsArr = filteredScripts.map((script: any) => ({
          scriptName: script.scriptName,
          type: script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template',
          scriptEngine: script.scriptEngineName || 'All',
          description: script.description,
          connectable: script.connectable,
          updatedBy: script.updatedBy,
          lastUpdated: script.lastUpdated,
          language: script.language,
          workspaceId: workspaceId,
          workspaceName: workspaceName,
          scriptId: script?.executableRef ? script?.executableRef : script?.id,
          userDefined: script?.userDefined,
          triggerScript: script?.triggerScript,
          deployedVersion: script?.deployedVersion,
          tabId: this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id),
          isSystemLibrary: false,
          sysLibRefList: script?.sysLibRefList,
          sysLibRefNameList: script?.sysLibRefNameList,
          url: this.scriptStateService.getUrl(workspaceId, script?.executableRef ? script?.executableRef : script?.id, this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id), script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template', false, '0', script?.deployedVersion > 0 ? true : false, selectedScriptEngine?.debugSeId, selectedScriptEngine?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, true),
          deployed: script?.deployedVersion > 0 ? true : false,
          latestVersion: script?.versionNumber
        }));
        this.filteredItems = scriptsArr.sort((a, b) => a.scriptName.localeCompare(b.scriptName));
      } else {
        this.filteredItems = scriptsArr;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getAllSystemLibraries() {
    let sysLibsArr = [];
    const formValues = this.openScriptForm.getRawValue();
    const selectedScriptEngine = this.scriptEngines.find(x => Number(x.scriptEngineId) === Number(formValues?.scriptEngine));
    this.getAllSysLibSub = this.developmentService.getSystemLibraries().subscribe((res) => {
      if (res?.length) {
        sysLibsArr = res.map((script: any) => ({
          scriptName: script.scriptName,
          type: 'systemLibrary',
          scriptEngine: script.scriptEngineName || 'All',
          description: script.description,
          connectable: script.connectable,
          updatedBy: script.updatedBy,
          lastUpdated: script.lastUpdated,
          language: script.language,
          workspaceId: null,
          scriptId: script?.executableRef ? script?.executableRef : script?.id,
          userDefined: script?.userDefined,
          deployedVersion: script?.deployedVersion,
          tabId: this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id),
          isSystemLibrary: true,
          url: this.scriptStateService.getUrl(0, script?.executableRef ? script?.executableRef : script?.id, this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id), 'systemLibrary', false, '0', script?.deployedVersion > 0 ? true : false, selectedScriptEngine?.debugSeId, selectedScriptEngine?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, true),
          deployed: script?.deployedVersion > 0 ? true : false,
          latestVersion: script?.versionNumber
        }));
        this.filteredItems = sysLibsArr.sort((a, b) => a.scriptName.localeCompare(b.scriptName));
      } else {
        this.filteredItems = sysLibsArr
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  selectItem(item: ScriptItem): void {
    this.selectedItem = item;
  }

  openItem(item: ScriptItem | null): void {
    const formValues = this.openScriptForm.getRawValue();
    const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValues?.scriptEngineGroup);
    const selectedScriptEngine = this.scriptEngines.find(x => Number(x.scriptEngineId) === Number(formValues?.scriptEngine));
    if (item) {
      if (selectedScriptEngine?.debugSeStatus === 0 || !selectedScriptEngine?.debugSeStatus) {
        this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `The Debug Engine component is either not running or is not installed for the selected process engine. Please ensure that Debug Engine is properly installed and running.` });
        return;
      } else {
        if (this.openedScripts?.length >= 5) {
          this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `You can open a maximum of 5 scripts.` });
          return;
        } else {
          this.getScriptLockInfoSub = this.developmentService.getScriptLockInfo(Number(item?.workspaceId), Number(item?.scriptId), item?.type).subscribe((res) => {
            if (res) {
              const lockInfo = JSON.parse(JSON.stringify(res));
              let workspace = null;

              if (item?.type === 'userScript' || item?.type === 'USER_SCRIPT') {
                workspace = this.workspaces?.length ? this.workspaces.find(ws => Number(ws.id) === Number(item.workspaceId)) : null;
              }

              if (lockInfo?.idOfLockedItem && lockInfo?.lockDate && lockInfo?.lockTime && lockInfo?.lockedBy) {
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

              item.lockInfo = lockInfo;
              item.debugSeId = selectedScriptEngine?.scriptEngineId;
              item.debugSeUrl = selectedScriptEngine?.debugSeUrl;
              item.debugSeName = selectedScriptEngine?.scriptEngineKey;
              item.scriptEngineGroupId = selectedGroup?.scriptEngineGroupId;
              item.scriptEngineGroupName = selectedGroup?.scriptEngineGroupName;

              if (item?.type === 'systemLibrary' || item?.type === 'SYSTEM_LIBRARY') {
                if (lockInfo.isLocked) {
                  setTimeout(() => {
                    this.getWorkingSysLibById(item.scriptId.toString(), false, lockInfo, [], item.debugSeId, item.debugSeUrl, selectedScriptEngine?.scriptEngineKey, selectedGroup?.scriptEngineGroupName);
                  }, 1000);
                } else {
                  setTimeout(() => {
                    this.getSysLibById(item.scriptId.toString(), lockInfo, [], item.debugSeId, item.debugSeUrl, selectedScriptEngine?.scriptEngineKey, selectedGroup?.scriptEngineGroupName);
                  }, 1000);
                }

                this.scriptStateService.setScriptCreated(item);
                this.scriptStateService.addOpenedScript(item);
                this.scriptStateService.sharedSelectedScriptData(item);
                this.dialogRef.close({ action: 'open', data: item });
              } else {
                // Get Script Parameters only if the script is not a system library
                this.getScriptParameters(item, workspace, lockInfo);
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
    }
  }

  /*============== Get Script Parameters ==============*/
  getScriptParameters(script: any, workspace: any, lockInfo: any) {
    const clientId = script?.tabId;
    const obj: WinwrapRequestDto = {
      jsonMap: null,
      headers: null,
      clientId: [`${clientId}`],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: script?.workspaceId,
      scriptId: script?.scriptId,
      attachSysLibIds: [],
      attachedReferenceIds: [],
      userName: this.currentUser?.userName,
      scriptType: script?.type,
      deployedCopy: lockInfo.isLocked ? false : true,
      versionId: 0,
      versionCopy: false,
      debugSettingUse: true,
      triggerScript: script?.triggerScript,
      debugSeId: script?.debugSeId,
      debugSeUrl: script?.debugSeUrl
    };

    const debugSeId = script?.debugSeId;
    const debugSeUrl = script?.debugSeUrl;

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
        if (script?.type === 'systemLibrary' || script?.type === 'SYSTEM_LIBRARY') {
          this.getWorkingSysLibById(script.scriptId.toString(), false, lockInfo, res, script?.debugSeId, script?.debugSeUrl, script?.debugSeName, script?.scriptEngineGroupName);
        } else {
          this.getWorkingScriptById(script.scriptId.toString(), script.type, script.workspaceId, workspace ? workspace.name : '', false, lockInfo, res, script?.debugSeId, script?.debugSeUrl, script?.debugSeName, script?.scriptEngineGroupName);
        }
      } else {
        if (script?.type === 'systemLibrary' || script?.type === 'SYSTEM_LIBRARY') {
          this.getSysLibById(script.scriptId.toString(), lockInfo, res, script?.debugSeId, script?.debugSeUrl, script?.debugSeName, script?.scriptEngineGroupName);
        } else {
          this.getScriptById(script.scriptId.toString(), script.type, script.workspaceId, workspace ? workspace.name : '', lockInfo, res, script?.debugSeId, script?.debugSeUrl, script?.debugSeName, script?.scriptEngineGroupName);
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

  /*============== Get Script Details By Id ==============*/
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
          url: this.scriptStateService.getUrl(workspaceId, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', res?.deployedVersion > 0 ? true : false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo?.isLocked && !lockInfo?.isBreakLockBtnVisible), false),
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
        this.dialogRef.close({ action: 'open', data: updatedScript });
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
          url: this.scriptStateService.getUrl(workspaceId, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo?.isLocked && !lockInfo?.isBreakLockBtnVisible), false),
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
        this.dialogRef.close({ action: 'open', data: updatedScript });
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
          triggerScript: res?.triggerScript,
          deployedVersion: res?.deployedVersion,
          tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
          isSystemLibrary: true,
          sysLibRefList: res?.sysLibRefList,
          sysLibRefNameList: res?.sysLibRefNameList,
          deployed: deployed,
          isDeployed: deployed,
          url: this.scriptStateService.getUrl(0, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', deployed ? true : false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo?.isLocked && !lockInfo?.isBreakLockBtnVisible), false),
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
        this.dialogRef.close({ action: 'open', data: updatedScript });
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
          triggerScript: res?.triggerScript,
          deployedVersion: res?.deployedVersion,
          tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
          isSystemLibrary: true,
          sysLibRefList: res?.sysLibRefList,
          sysLibRefNameList: res?.sysLibRefNameList,
          deployed: res?.deployedVersion > 0 ? true : false,
          isDeployed: res?.deployedVersion > 0 ? true : false,
          url: this.scriptStateService.getUrl(0, res?.executableRef ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', res?.deployedVersion > 0 ? true : false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), (lockInfo?.isLocked && !lockInfo?.isBreakLockBtnVisible), false),
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
        this.dialogRef.close({ action: 'open', data: updatedScript });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============== Get Script Lock Info ===============*/
  // getLockInfo(item: any) {
  //   this.getScriptLockInfoSub = this.developmentService.getScriptLockInfo(Number(item?.workspaceId), Number(item?.scriptId), item?.type).subscribe((res) => {
  //     if (res) {
  //       const lockInfo = JSON.parse(JSON.stringify(res));
  //       if (lockInfo?.idOfLockedItem && lockInfo?.lockDate && lockInfo?.lockTime && lockInfo?.lockedBy) {
  //         lockInfo.isLocked = true;
  //       } else {
  //         lockInfo.isLocked = false;
  //       }
  //       item.lockInfo = lockInfo;
  //       this.scriptStateService.setScriptCreated(item);
  //       this.scriptStateService.addOpenedScript(item);
  //       this.scriptStateService.sharedSelectedScriptData(item);
  //       this.dialogRef.close({ action: 'open', data: item });
  //     }
  //   }, (err: HttpErrorResponse) => {
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }

  onClose(): void {
    this.dialogRef.close({ action: 'close' });
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'close' });
  }

  ngOnDestroy(): void {
    this.getWorkspacesSub.unsubscribe();
    this.getAllScriptsSub.unsubscribe();
    this.getAllSysLibSub.unsubscribe();
    this.getScriptLockInfoSub.unsubscribe();
    this.getScriptByIdSub.unsubscribe();
    this.getWorkingScriptByIdSub.unsubscribe();
    this.getWorkingSysLibByIdSub.unsubscribe();
    this.getSysLibByIdSub.unsubscribe();
    this.getDebugParameterSub.unsubscribe();
    this.getScriptEngineGroupsSub.unsubscribe();
    this.getScriptEngineSub.unsubscribe();
    this.getScriptEngineInfoSub.unsubscribe();
    this.getUserSettingDarkModeSub.unsubscribe();
  }
}