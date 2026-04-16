import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DevelopmentService } from '../../development.service';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Workspace } from 'src/app/application-integration/app-integration/appintegration';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { CreateScriptDto, ScriptItem } from '../../development';
import { MessageService } from 'primeng/api';
import { KeycloakSecurityService } from 'src/app/shared/services/keycloak-security.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { ConfigurationsService } from 'src/app/configuration/configurations/configurations.service';
import { ScriptTemplates } from '../script-templates';

@Component({
  selector: 'app-create-script',
  templateUrl: './create-script.component.html',
  styleUrls: ['./create-script.component.scss'],
})
export class CreateScriptComponent implements OnInit, OnDestroy {
  createScriptForm: UntypedFormGroup;
  workspaces: Array<Workspace> = [];
  fileName: string = '';
  currentUser: any = null;
  scriptTypesArr: Array<any> = [
    { id: 1, value: 'Process' },
    { id: 2, value: 'Trigger' }
  ];
  scriptSourcesArr: Array<any> = [
    { id: 1, value: 'Standard template' },
    { id: 2, value: 'Copy existing user script' },
    { id: 3, value: 'Copy existing template script' }
  ];
  scriptCodeSrc: Array<any> = [];
  scriptsOrTemplatesLists: Array<any> = [];
  scriptSubType: string = 'Script';
  scriptType: number = 1;
  scriptSource: number = 1;
  isCRUDUserScriptPermission: boolean = false;
  isCRUDTemplateScriptPermission: boolean = false;
  isCRUDSysLibPermission: boolean = false;
  isScriptNameValid: boolean = true;
  openedScripts: Array<any> = [];
  scriptEngineGroups: Array<any> = [];
  scriptEngines: Array<any> = [];
  debugSeStatus: number = 1;

  private getWorkspacesSub = Subscription.EMPTY;
  private createScriptSub = Subscription.EMPTY;
  private createScriptFromExistingScriptSub = Subscription.EMPTY;
  private createSysLibSub = Subscription.EMPTY;
  private getScriptsByWsIdSub = Subscription.EMPTY;
  private getScriptsSub = Subscription.EMPTY;
  private validateScriptsNameSub = Subscription.EMPTY;
  private getScriptLockInfoSub = Subscription.EMPTY;
  private getLockSub = Subscription.EMPTY;
  private createRecentScriptSub = Subscription.EMPTY;
  private getDebugParameterSub = Subscription.EMPTY;
  private getScriptEngineGroupsSub = Subscription.EMPTY;
  private getScriptEngineSub = Subscription.EMPTY;
  private getScriptEngineInfoSub = Subscription.EMPTY;
  private getUserSettingDarkModeSub = Subscription.EMPTY;
  private getScriptByIdSub = Subscription.EMPTY;
  private getWorkingScriptByIdSub = Subscription.EMPTY;
  private getWorkingSysLibByIdSub = Subscription.EMPTY;
  private getSysLibByIdSub = Subscription.EMPTY;

  validationMessages = {
    workspace: {
      required: "Workspace is required",
    },
    scriptType: {
      required: "Script type is required",
    },
    scriptSubType: {
      required: "Script sub type is required",
    },
    scriptSource: {
      required: "Script source is required",
    },
    userDefinedScripts: {
      required: "Script is required",
    },
    name: {
      required: "Name is required",
      maxlength: "Maximum 128 characters are allowed",
      hasWhitespace: "Whitespace not allowed"
    },
    description: {
      maxlength: "Maximum 2000 characters are allowed",
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
    scriptSubType: '',
    scriptSource: '',
    userDefinedScripts: '',
    name: '',
    description: '',
    scriptEngineGroup: '',
    scriptEngine: ''
  };

  constructor(
    public dialogRef: MatDialogRef<CreateScriptComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
    private kcService: KeycloakSecurityService,
    private sanitizer: DomSanitizer,
    private encryptDecryptService: EncryptDecryptService,
    private configurationsService: ConfigurationsService
  ) {
    this.dialogRef.disableClose = true;
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
    setTimeout(() => {
      this.getWorkspacesByUser();
      this.getScriptEnginesInfo();
    });
  }

  ngOnInit(): void {
    this.createForm();

    this.scriptStateService.openedScripts$.subscribe((openScripts) => {
      if (openScripts?.length) {
        this.openedScripts = openScripts;
      }
    });

    if (this.isCRUDTemplateScriptPermission && !this.isCRUDUserScriptPermission) {
      this.createScriptForm.get('scriptSubType').disable();
      this.createScriptForm.get('scriptSubType').patchValue('Template');
    }
    if (this.isCRUDUserScriptPermission && !this.isCRUDTemplateScriptPermission) {
      this.createScriptForm.get('scriptSubType').disable();
      this.createScriptForm.get('scriptSubType').patchValue('Script');
    }
    if (this.currentUser?.superAdminUser) {
      if (this.isCRUDSysLibPermission && this.currentUser?.superAdminUser) {
        this.scriptTypesArr.push({ id: 3, value: 'System library' });
      }
      this.setScriptCodeSource();
    }

  }

  createForm() {
    this.createScriptForm = this.fb.group({
      name: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [Validators.maxLength(2000)]
      }],
      workspace: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      scriptType: [{ value: 1, disabled: false }, {
        validators: [Validators.required]
      }],
      scriptSubType: [{ value: 'Script', disabled: false }, {
        validators: []
      }],
      scriptSource: [{ value: 1, disabled: false }, {
        validators: [Validators.required]
      }],
      userDefinedScripts: [{ value: 1, disabled: false }, {
        validators: []
      }],
      scriptEngineGroup: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      scriptEngine: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
    });

    this.createScriptForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.createScriptForm);
    });
    this.setScriptCodeSource();
  }

  logValidationErrors(group: UntypedFormGroup = this.createScriptForm): void {
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
            this.createScriptForm.get('workspace').patchValue(defaultWorkspace?.id);
          } else {
            this.createScriptForm.get('workspace').patchValue(this.workspaces[0]?.id);
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

  onChangeScriptType() {
    const formValues = this.createScriptForm.getRawValue();
    this.scriptType = Number(formValues?.scriptType);
    this.setScriptCodeSource();
    if (Number(formValues?.scriptSource) === 2 || Number(formValues?.scriptSource) === 3) {
      this.onChangeScriptSource();
    }
  }

  onChangeScriptSubType() {
    const formValues = this.createScriptForm.getRawValue();
    this.scriptSubType = formValues?.scriptSubType;
    this.setScriptCodeSource();
    if (Number(formValues?.scriptSource) === 2 || Number(formValues?.scriptSource) === 3) {
      this.onChangeScriptSource();
    }
  }

  setScriptCodeSource() {
    this.scriptCodeSrc = [];
    const formValues = this.createScriptForm.getRawValue();
    let scriptSourceOption = JSON.parse(JSON.stringify(this.scriptSourcesArr));

    // Below code is commented out as it was change request track in Jira TEI-5413
    // Admin and Ordinary user can create user script from existing template script
    // if (!this.currentUser?.superAdminUser) {
    //   scriptSourceOption = [...scriptSourceOption.filter(obj => Number(obj.id) !== 3)];
    // }

    if (Number(formValues?.scriptType) === 1 && formValues?.scriptSubType === 'Script') {
      const teisRs = { id: 4, value: 'TEIS Rs template' };

      // Create new array without modifying original
      const updatedArr = [
        ...scriptSourceOption.slice(0, 1),  // take elements before index 1
        teisRs,                             // insert new object
        ...scriptSourceOption.slice(1)      // take elements from index 1 onward
      ];

      // Unique by 'id'
      const uniqueArr = [
        ...new Map(updatedArr.map(item => [item.id, item])).values()
      ];

      this.scriptCodeSrc = [...uniqueArr];
    } else if ((Number(formValues?.scriptType) === 1 && formValues?.scriptSubType === 'Template') ||
      (Number(formValues?.scriptType) === 2 && formValues?.scriptSubType === 'Script') ||
      (Number(formValues?.scriptType) === 2 && formValues?.scriptSubType === 'Template')) {
      this.scriptCodeSrc = [...scriptSourceOption.filter(obj => Number(obj.id) !== 4)];
    } else if (Number(formValues?.scriptType) === 3) {
      this.scriptCodeSrc = [...scriptSourceOption.filter(obj => Number(obj.id) === 1)];
    }
    this.createScriptForm.get('scriptSource').patchValue(1);
  }

  onChangeWorkspace() {
    const formValues = this.createScriptForm.getRawValue();
    this.scriptSource = Number(formValues?.scriptSource);
    if (Number(formValues?.scriptSource) === 2 || Number(formValues?.scriptSource) === 3) {
      this.onChangeScriptSource();
    }
  }

  onChangeScriptSource() {
    this.scriptsOrTemplatesLists = [];
    const formValues = this.createScriptForm.getRawValue();
    const wsId = formValues?.workspace;
    this.scriptSource = Number(formValues?.scriptSource);

    if ((Number(formValues?.scriptType) === 1 || Number(formValues?.scriptType) === 2) && (Number(formValues?.scriptSource) === 2 || Number(formValues?.scriptSource) === 3)) {
      let scriptType = formValues?.scriptSubType === 'Script' ? 'userScript' : formValues?.scriptSubType === 'Template' ? 'template' : '';
      let isUserScript = Number(formValues?.scriptSource) === 2 ? true : false;
      let itemType = Number(formValues?.scriptType) === 1 ? 'Process' : Number(formValues?.scriptType) === 2 ? 'Trigger' : 'systemLibrary';
      let workspaceId = Number(formValues?.scriptSource) === 2 ? formValues?.workspace : 0;

      this.getScriptsSub = this.developmentService.getScripts(scriptType, isUserScript, itemType, workspaceId).subscribe((res) => {
        if (res?.length) {
          this.scriptsOrTemplatesLists = res;
          this.createScriptForm.get('userDefinedScripts').patchValue(this.scriptsOrTemplatesLists[0]?.id);
          this.setExistingScriptsFormValues();
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }


    // if (Number(formValues?.scriptSource) === 2 || Number(formValues?.scriptSource) === 3) {
    //   this.getScriptsByWsIdSub = this.developmentService.getScriptsByWorkspaceId(wsId, 'ALL').subscribe((res) => {
    //     if (res?.length) {
    //       // Filter scripts list if user select script type 'Process' and 'Copy Existing Script' Options
    //       if (Number(formValues?.scriptType) === 1 && Number(formValues?.scriptSource) === 2) {
    //         this.scriptsOrTemplatesLists = res.filter((x) => x?.userDefined && !x?.triggerScript && x?.language !== 'C#');
    //         if (this.scriptsOrTemplatesLists?.length) {
    //           this.createScriptForm.get('userDefinedScripts').patchValue(this.scriptsOrTemplatesLists[0]?.id);
    //           this.setExistingScriptsFormValues();
    //         }
    //       }

    //       // Filter scripts list if user select script type 'Process' and 'Copy Existing Template' Options
    //       if (Number(formValues?.scriptType) === 1 && Number(formValues?.scriptSource) === 3) {
    //         this.scriptsOrTemplatesLists = res.filter((x) => !x?.userDefined && !x?.triggerScript && x?.language !== 'C#');
    //         if (this.scriptsOrTemplatesLists?.length) {
    //           this.createScriptForm.get('userDefinedScripts').patchValue(this.scriptsOrTemplatesLists[0]?.id);
    //           this.setExistingScriptsFormValues();
    //         }
    //       }

    //       // Filter scripts list if user select script type 'Trigger' and 'Copy Existing Script' Options
    //       if (Number(formValues?.scriptType) === 2 && Number(formValues?.scriptSource) === 2) {
    //         this.scriptsOrTemplatesLists = res.filter((x) => x?.userDefined && x?.triggerScript && x?.language !== 'C#');
    //         if (this.scriptsOrTemplatesLists?.length) {
    //           this.createScriptForm.get('userDefinedScripts').patchValue(this.scriptsOrTemplatesLists[0]?.id);
    //           this.setExistingScriptsFormValues();
    //         }
    //       }

    //       // Filter scripts list if user select script type 'Trigger' and 'Copy Existing Template' Options
    //       if (Number(formValues?.scriptType) === 2 && Number(formValues?.scriptSource) === 3) {
    //         this.scriptsOrTemplatesLists = res.filter((x) => !x?.userDefined && x?.triggerScript && x?.language !== 'C#');
    //         if (this.scriptsOrTemplatesLists?.length) {
    //           this.createScriptForm.get('userDefinedScripts').patchValue(this.scriptsOrTemplatesLists[0]?.id);
    //           this.setExistingScriptsFormValues();
    //         }
    //       }
    //     }
    //   }, (err: HttpErrorResponse) => {
    //     if (err.error instanceof Error) {
    //       // handle client side error here
    //     } else {
    //       // handle server side error here
    //     }
    //   });
    // } else {
    //   this.setExistingScriptsFormValues();
    // }
  }

  onChangeUserDefinedScript() {
    this.setExistingScriptsFormValues();
  }

  setExistingScriptsFormValues() {
    const formValues = this.createScriptForm.getRawValue();
    if (Number(formValues?.scriptSource) === 2) {
      if (this.scriptsOrTemplatesLists?.length) {
        const selectedScript = this.scriptsOrTemplatesLists.find((x) => Number(formValues?.userDefinedScripts) === Number(x?.id));
        // this.createScriptForm.get('name').patchValue(selectedScript?.scriptName);
        // this.createScriptForm.get('description').patchValue(selectedScript?.description);
      }
    } else {
      // this.createScriptForm.get('name').reset();
      // this.createScriptForm.get('description').reset();
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onBack(): void {
    this.dialogRef.close({ action: 'back' });
  }

  convertStringToByteArray(input: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(input);
  }

  // getUrl(wsId: number, sId: number, tId: string, sType: string) {
  //   const baseUrl = window.location.origin;
  //   const workspaceId = wsId;
  //   const scriptId = sId;
  //   const tabId = tId;
  //   const scriptType = sType;
  //   const token = this.kcService.getToken();
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(`${baseUrl}/winwrap/?clientid=${tabId}&wId=${workspaceId}&exeId=${scriptId}&type=${scriptType}&token=${token}`);
  // }

  validateScriptName() {
    // this.isScriptNameValid = true;
    this.createScriptForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.createScriptForm.valid) {
      const formValue = this.createScriptForm.getRawValue();
      const selectedScriptEngine = this.scriptEngines.find(x => Number(x.scriptEngineId) === Number(formValue?.scriptEngine));
      if (selectedScriptEngine?.debugSeStatus === 0 || !selectedScriptEngine?.debugSeStatus) {
        this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `The Debug Engine component is either not running or is not installed for the selected process engine. Please ensure that Debug Engine is properly installed and running.` });
        return;
      } else {
        const obj = {
          scriptName: formValue?.name,
          scriptId: "",
          workspaceId: (Number(formValue?.scriptType) === 3 || formValue?.scriptSubType === 'Template') ? "" : formValue?.workspace,
          scriptType: Number(formValue?.scriptType) === 3 ? 'systemLibrary' : formValue?.scriptSubType === 'Script' ? 'userScript' : 'template',
          language: 'VBScript'
        };
        this.validateScriptsNameSub = this.developmentService.validateScriptName(obj).subscribe((res) => {
          if (res) {
            if (Number(formValue?.scriptSource) === 2 || Number(formValue?.scriptSource) === 3) {
              // if create script from existing script then call this function
              this.createScriptFromExistingScript();
            } else {
              if (Number(formValue?.scriptType) === 3) {
                this.createSysLib();
              } else {
                this.createScript();
              }
            }
          } else {
            // this.isScriptNameValid = false;
            this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `Script name already present.` });
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

  getScriptContent() {
    this.createScriptForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.createScriptForm.valid) {
      const formValues = this.createScriptForm.getRawValue();
      if (Number(formValues?.scriptSource) === 1) {
        if (Number(formValues?.scriptType) === 1 && formValues?.scriptSubType === 'Script') {
          return ScriptTemplates?.processScript;
        } else if (Number(formValues?.scriptType) === 1 && formValues?.scriptSubType === 'Template') {
          return ScriptTemplates?.processTemplate;
        } else if (Number(formValues?.scriptType) === 2 && formValues?.scriptSubType === 'Script') {
          return ScriptTemplates?.triggerScript;
        } else if (Number(formValues?.scriptType) === 2 && formValues?.scriptSubType === 'Template') {
          return ScriptTemplates?.triggerTemplate;
        } else if (Number(formValues?.scriptType) === 3 && formValues?.scriptSubType === 'Script') {
          return ScriptTemplates?.syslibScript;
        }
      } else if (Number(formValues?.scriptSource) === 4) {
        if (Number(formValues?.scriptType) === 1 && formValues?.scriptSubType === 'Script') {
          return ScriptTemplates?.teisRsScript;
        }
      } else {
        return ScriptTemplates?.baseScript;
      }
    }
  }

  createScript() {
    this.createScriptForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.createScriptForm.valid) {
      const formValue = this.createScriptForm.getRawValue();
      const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValue?.scriptEngineGroup);
      const selectedScriptEngine = this.scriptEngines.find(x => Number(x.scriptEngineId) === Number(formValue?.scriptEngine));
      // const code = 'Option Explicit\r\n\r\n\r\nSub Main\r\n\r\nEnd Sub\r\n';
      const code = this.getScriptContent();
      const base64Encoded = btoa(code);
      const scriptData: CreateScriptDto = {
        description: formValue.description?.trim(),
        scriptModule: false,
        scriptName: formValue.name.trim(),
        updatedBy: this.currentUser.userName,
        connectable: true,
        deployedVersion: 0,
        thisDeployedVersion: false,
        language: "VBScript",
        order: 0,
        userDefined: formValue?.scriptSubType === 'Script' ? true : false,
        triggerScript: Number(formValue?.scriptType) === 2 ? true : false,
        scriptContentsAsString: base64Encoded,
        releaseOnly: false,
        releaseAndDeploy: false,
        saveOnly: false,
        note: '',
        scriptType: '',
        sysLibRefList: ['91'],
        sysLibRefNameList: [],
        debugSeId: selectedScriptEngine?.debugSeId,
        debugSeUrl: selectedScriptEngine?.debugSeUrl,
        // clientId: []
      };

      // Ensure workspaceId is selected and valid
      const workspaceId = (formValue?.scriptSubType === 'Script' && formValue.workspace) ? formValue.workspace : 0;
      const workspace = this.workspaces?.length ? this.workspaces.find(x => Number(x?.id) === Number(workspaceId)) : null;

      this.createScriptSub = this.developmentService.createScript(workspaceId, scriptData).subscribe((response) => {
        const scriptType = formValue?.scriptType === 3 ? 'systemLibrary' : formValue?.scriptSubType === 'Script' ? 'userScript' : 'template';
        scriptData.scriptId = response?.scriptId;
        scriptData.workspaceId = workspaceId;
        scriptData.workspaceName = workspace?.name;
        scriptData.tabId = this.scriptStateService.getTabId(response?.scriptId);
        scriptData.isSystemLibrary = false;
        scriptData.url = this.scriptStateService.getUrl(Number(formValue?.workspace), Number(response?.scriptId), scriptData.tabId, scriptType, false, '0', false, selectedScriptEngine?.debugSeId, selectedScriptEngine?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false);
        // Update the state with the new script data
        // this.scriptStateService.setScriptCreated(scriptData);
        // this.scriptStateService.addOpenedScript(scriptData);

        // Close the dialog with success action
        // this.dialogRef.close({ action: 'finish', data: scriptData });

        const scriptObj = {
          scriptName: formValue.name.trim(),
          type: formValue?.scriptType === 3 ? 'systemLibrary' : formValue?.scriptSubType === 'Script' ? 'userScript' : 'template',
          scriptEngine: "All",
          description: formValue.description?.trim(),
          workspaceId: (formValue?.scriptSubType === 'Script' && formValue?.workspace) ? formValue?.workspace : 0,
          workspaceName: workspace?.name,
          scriptId: Number(response?.scriptId),
          userDefined: formValue?.scriptSubType === 'Script' ? true : false,
          connectable: true,
          updatedBy: this.currentUser.userName,
          lastUpdated: null,
          language: 'VBScript',
          deployedVersion: 0,
          tabId: this.scriptStateService.getTabId(response?.scriptId),
          isSystemLibrary: false,
          triggerScript: Number(formValue?.scriptType) === 2 ? true : false,
          lockInfo: {
            idOfLockedItem: null,
            lockedBy: null,
            lockTime: null,
            lockDate: null,
            lockedUserId: null,
            isLocked: false
          },
          url: this.scriptStateService.getUrl(Number(formValue?.workspace), Number(response?.scriptId), scriptData.tabId, scriptType, false, '0', false, selectedScriptEngine?.debugSeId, selectedScriptEngine?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false),
          debugParameters: [],
          debugSeId: selectedScriptEngine?.debugSeId,
          debugSeUrl: selectedScriptEngine?.debugSeUrl,
          debugSeName: selectedScriptEngine?.scriptEngineKey,
          scriptEngineGroupId: selectedGroup?.scriptEngineGroupId,
          scriptEngineGroupName: selectedGroup?.scriptEngineGroupName,
        };
        this.getLock(scriptObj);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  createScriptFromExistingScript() {
    this.createScriptForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.createScriptForm.valid) {
      const formValue = this.createScriptForm.getRawValue();
      const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValue?.scriptEngineGroup);
      const selectedScriptEngine = this.scriptEngines.find(x => Number(x.scriptEngineId) === Number(formValue?.scriptEngine));
      if (Number(formValue?.scriptSource) === 2 || Number(formValue?.scriptSource) === 3) {
        const scriptData: CreateScriptDto = {
          description: formValue.description?.trim(),
          scriptModule: false,
          scriptName: formValue.name.trim(),
          updatedBy: this.currentUser.userName,
          connectable: true,
          deployedVersion: 0,
          thisDeployedVersion: false,
          language: "VBScript",
          order: 0,
          userDefined: formValue?.scriptSubType === 'Script' ? true : false,
          triggerScript: Number(formValue?.scriptType) === 2 ? true : false,
          scriptContentsAsString: '',
          releaseOnly: false,
          releaseAndDeploy: false,
          saveOnly: false,
          note: '',
          scriptType: '',
          existingScriptId: formValue?.userDefinedScripts,
          workspaceId: formValue?.workspace ? formValue?.workspace : '',
          debugSeId: selectedScriptEngine?.debugSeId,
          debugSeUrl: selectedScriptEngine?.debugSeUrl,
          // clientId: []
          // sysLibRefList: [],
          // sysLibRefNameList: []
        };

        const workspace = (this.workspaces?.length && formValue?.scriptSubType === 'Script') ? this.workspaces.find(x => Number(x?.id) === Number(formValue?.workspace)) : null;
        this.createScriptFromExistingScriptSub = this.developmentService.createScriptFromExisting(scriptData).subscribe((res) => {
          if (res) {
            scriptData.scriptId = res?.scriptId;
            scriptData.workspaceId = (formValue?.scriptSubType === 'Script' && formValue?.workspace) ? formValue?.workspace : '';
            scriptData.workspaceName = (formValue?.scriptSubType === 'Script' && formValue?.workspace) ? workspace?.name : '';
            scriptData.tabId = this.scriptStateService.getTabId(res?.scriptId);
            scriptData.isSystemLibrary = false;
            scriptData.url = this.scriptStateService.getUrl(Number(formValue?.workspace), Number(res?.scriptId), this.scriptStateService.getTabId(res?.scriptId), formValue?.scriptType === 3 ? 'systemLibrary' : formValue?.scriptSubType === 'Script' ? 'userScript' : 'template', false, '0', false, selectedScriptEngine?.debugSeId, selectedScriptEngine?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false);
            const scriptObj = {
              scriptName: formValue.name.trim(),
              type: formValue?.scriptType === 3 ? 'systemLibrary' : formValue?.scriptSubType === 'Script' ? 'userScript' : 'template',
              scriptEngine: "All",
              description: formValue.description?.trim(),
              workspaceId: (formValue?.scriptSubType === 'Script' && formValue?.workspace) ? formValue?.workspace : '',
              workspaceName: (formValue?.scriptSubType === 'Script' && formValue?.workspace) ? workspace?.name : '',
              scriptId: Number(res?.scriptId),
              userDefined: formValue?.scriptSubType === 'Script' ? true : false,
              connectable: true,
              updatedBy: this.currentUser.userName,
              lastUpdated: null,
              language: 'VBScript',
              deployedVersion: 0,
              tabId: this.scriptStateService.getTabId(res?.scriptId),
              isSystemLibrary: false,
              triggerScript: Number(formValue?.scriptType) === 2 ? true : false,
              lockInfo: {
                idOfLockedItem: null,
                lockedBy: null,
                lockTime: null,
                lockDate: null,
                lockedUserId: null,
                isLocked: false
              },
              url: this.scriptStateService.getUrl(Number(formValue?.workspace), Number(res?.scriptId), this.scriptStateService.getTabId(res?.scriptId), formValue?.scriptType === 3 ? 'systemLibrary' : formValue?.scriptSubType === 'Script' ? 'userScript' : 'template', false, '0', false, selectedScriptEngine?.debugSeId, selectedScriptEngine?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false),
              debugParameters: [],
              debugSeId: selectedScriptEngine?.debugSeId,
              debugSeUrl: selectedScriptEngine?.debugSeUrl,
              debugSeName: selectedScriptEngine?.scriptEngineKey,
              scriptEngineGroupId: selectedGroup?.scriptEngineGroupId,
              scriptEngineGroupName: selectedGroup?.scriptEngineGroupName,
            };
            this.getLock(scriptObj);
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

  createSysLib() {
    this.createScriptForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.createScriptForm.valid) {
      const formValue = this.createScriptForm.getRawValue();
      const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValue?.scriptEngineGroup);
      const selectedScriptEngine = this.scriptEngines.find(x => Number(x.scriptEngineId) === Number(formValue?.scriptEngine));
      // const code = 'Option Explicit\r\n\r\n\r\nSub Main\r\n\r\nEnd Sub\r\n';
      const code = this.getScriptContent();
      const base64Encoded = btoa(code);
      const scriptData: CreateScriptDto = {
        description: formValue.description?.trim(),
        scriptModule: false,
        scriptName: formValue.name.trim(),
        updatedBy: this.currentUser.userName,
        connectable: true,
        deployedVersion: 0,
        thisDeployedVersion: false,
        language: "VBScript",
        order: 0,
        userDefined: false,
        triggerScript: false,
        scriptContentsAsString: base64Encoded,
        releaseOnly: false,
        releaseAndDeploy: false,
        saveOnly: false,
        note: '',
        scriptType: 'systemLibrary',
        sysLibRefList: [],
        sysLibRefNameList: [],
        debugSeId: selectedScriptEngine?.debugSeId,
        debugSeUrl: selectedScriptEngine?.debugSeUrl,
        // clientId: []
      };

      const debugSeId = selectedScriptEngine?.debugSeId;
      const debugSeUrl = selectedScriptEngine?.debugSeUrl;

      this.createSysLibSub = this.developmentService.createSystemLib(scriptData, debugSeId, debugSeUrl).subscribe((res) => {
        scriptData.scriptId = res?.systemLibId;
        scriptData.tabId = this.scriptStateService.getTabId(res?.systemLibId);
        scriptData.isSystemLibrary = true;
        scriptData.url = this.scriptStateService.getUrl(Number(formValue?.workspace), Number(res?.systemLibId), this.scriptStateService.getTabId(res?.systemLibId), 'systemLibrary', false, '0', false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), false, false);
        // Update the state with the new script data
        // this.scriptStateService.setScriptCreated(scriptData);
        // this.scriptStateService.addOpenedScript(scriptData);

        // Close the dialog with success action
        // this.dialogRef.close({ action: 'finish', data: scriptData });

        const scriptObj = {
          scriptName: formValue.name.trim(),
          type: Number(formValue?.scriptType) === 3 ? 'systemLibrary' : formValue?.scriptSubType === 'Script' ? 'userScript' : 'template',
          scriptEngine: "",
          description: formValue.description?.trim(),
          workspaceId: null,
          scriptId: Number(res?.systemLibId),
          connectable: true,
          userDefined: false,
          language: "VBScript",
          deployedVersion: 0,
          tabId: this.scriptStateService.getTabId(res?.systemLibId),
          isSystemLibrary: true,
          lockInfo: {
            idOfLockedItem: null,
            lockedBy: null,
            lockTime: null,
            lockDate: null,
            lockedUserId: null,
            isLocked: false
          },
          url: this.scriptStateService.getUrl(Number(formValue?.workspace), Number(res?.systemLibId), this.scriptStateService.getTabId(res?.systemLibId), 'systemLibrary', false, '0', false, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), false, false),
          debugParameters: [],
          debugSeId: debugSeId,
          debugSeUrl: debugSeUrl,
          debugSeName: selectedScriptEngine?.scriptEngineKey,
          scriptEngineGroupId: selectedGroup?.scriptEngineGroupId,
          scriptEngineGroupName: selectedGroup?.scriptEngineGroupName,
        };
        this.getLock(scriptObj);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  getLock(script: any) {
    this.getLockSub = this.developmentService.getScriptLock(Number(script?.workspaceId), Number(script?.scriptId), script?.type).subscribe((res) => {
      if (res) {
        if (this.openedScripts?.length >= 5) {
          this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `You can open a maximum of 5 scripts.` });
          this.dialogRef.close({ action: 'back' });
          return;
        } else {
          this.openItem(script);
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

  openItem(item: ScriptItem | null): void {
    if (item) {
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

          if (item?.type === 'systemLibrary' || item?.type === 'SYSTEM_LIBRARY') {
            // this.scriptStateService.setScriptCreated(item);
            // this.scriptStateService.addOpenedScript(item);
            // this.scriptStateService.sharedSelectedScriptData(item);
            // this.dialogRef.close({ action: 'finish', data: item });
            if (item?.lockInfo.isLocked) {
              this.getWorkingSysLibById(item.scriptId.toString(), false, lockInfo, [], item?.debugSeId, item?.debugSeUrl, item?.debugSeName, item?.scriptEngineGroupName);
            } else {
              this.getSysLibById(item.scriptId.toString(), lockInfo, [], item?.debugSeId, item?.debugSeUrl, item?.debugSeName, item?.scriptEngineGroupName);
            }
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

  /*============== Get Script Parameters ==============*/
  getScriptParameters(script: any, workspace: any, lockInfo: any) {
    const clientId = script?.tabId;
    const obj = {
      jsonMap: null,
      headers: null,
      clientId: [`${clientId}`],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: script?.workspaceId,
      scriptId: script?.scriptId,
      userName: this.currentUser?.userName,
      scriptType: script?.type,
      deployedCopy: script?.lockInfo.isLocked ? false : true,
      versionId: 0,
      versionCopy: false,
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

      if (script?.lockInfo.isLocked) {
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


      // script.debugParameters = res;
      // this.scriptStateService.setScriptCreated(script);
      // this.scriptStateService.addOpenedScript(script);
      // this.scriptStateService.sharedSelectedScriptData(script);
      // this.createRecentScript(Number(script?.scriptId));
      // this.dialogRef.close({ action: 'finish', data: script });
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
        // this.dialogRef.close({ action: 'open', data: updatedScript });
        this.dialogRef.close({ action: 'finish', data: updatedScript });
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
    this.getWorkingScriptByIdSub = this.developmentService.getDeployedScriptById(scriptId, type, workspaceId ? workspaceId : 0, deployed).subscribe((res) => {
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
        // this.dialogRef.close({ action: 'open', data: updatedScript });
        this.dialogRef.close({ action: 'finish', data: updatedScript });
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
        // this.dialogRef.close({ action: 'open', data: updatedScript });
        this.dialogRef.close({ action: 'finish', data: updatedScript });
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
          isSystemLibrary: true,
          sysLibRefList: res?.sysLibRefList,
          sysLibRefNameList: res?.sysLibRefNameList,
          deployed: res?.deployedVersion > 0 ? true : false,
          isDeployed: res?.deployedVersion > 0 ? true : false,
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
        // this.dialogRef.close({ action: 'open', data: updatedScript });
        this.dialogRef.close({ action: 'finish', data: updatedScript });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
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

  /*============= Get Script Engines Info =============*/
  getScriptEnginesInfo(): void {
    this.getScriptEngineInfoSub = this.developmentService.getScriptEngineInfo().subscribe((res) => {
      if (res?.length) {
        this.scriptEngineGroups = res;
        this.createScriptForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.scriptEngineGroupId);
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
    const formValues = this.createScriptForm.getRawValue();
    const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValues?.scriptEngineGroup);
    if (selectedGroup) {
      this.scriptEngines = selectedGroup?.scriptEnginesDetails || [];
      this.createScriptForm.get('scriptEngine').patchValue(this.scriptEngines[0]?.scriptEngineId);
      this.onChangeDebugSE();
    }
  }

  onChangeDebugSE() {
    const formValues = this.createScriptForm.getRawValue();
    const selectedScriptEngine = this.scriptEngines.find(x => x.scriptEngineId === formValues?.scriptEngine);
    this.debugSeStatus = selectedScriptEngine?.debugSeStatus;
  }

  ngOnDestroy(): void {
    this.getWorkspacesSub.unsubscribe();
    this.createScriptSub.unsubscribe();
    this.createSysLibSub.unsubscribe();
    this.getScriptsByWsIdSub.unsubscribe();
    this.validateScriptsNameSub.unsubscribe();
    this.getScriptLockInfoSub.unsubscribe();
    this.createRecentScriptSub.unsubscribe();
    this.getDebugParameterSub.unsubscribe();
    this.getScriptsSub.unsubscribe();
    this.getScriptEngineGroupsSub.unsubscribe();
    this.getScriptEngineSub.unsubscribe();
    this.getUserSettingDarkModeSub.unsubscribe();
  }
}
