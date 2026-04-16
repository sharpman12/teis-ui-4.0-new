import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ParametersComponent } from '../parameters/parameters.component';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DevelopmentService } from '../../development.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { ScriptVersionsComponent } from '../script-versions/script-versions.component';
import { Constants } from 'src/app/shared/components/constants';
import { forkJoin, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SystemLibraryReferencesComponent } from '../system-library-references/system-library-references.component';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { CreateScriptDto, WinwrapRequestDto } from '../../development';
import { MessageService } from 'primeng/api';
import { AppIntAddNoteComponent } from 'src/app/application-integration/app-integration/app-int-add-note/app-int-add-note.component';
import { Workspace } from 'src/app/application-integration/app-integration/appintegration';
import { GetLockConfirmationComponent } from '../get-lock-confirmation/get-lock-confirmation.component';
import { ConnectedItemsConfirmationComponent } from '../connected-items-confirmation/connected-items-confirmation.component';
import { ReleaseNoteComponent } from '../release-note/release-note.component';
import { ExportScriptComponent } from '../export-script/export-script.component';
import { TabCommunicationService } from 'src/app/shared/services/tab-communication.service';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-script-properties',
  templateUrl: './script-properties.component.html',
  styleUrls: ['./script-properties.component.scss']
})
export class ScriptPropertiesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() scriptData: any = null;
  activeTabId: number = 0;
  openedScripts: any[] = [];
  workspaces: Array<Workspace> = [];
  scriptPropertiesForm: UntypedFormGroup;
  currentUser: any = null;
  isGetLock: boolean = false;
  isBreakLock: boolean = false;
  isCancelLock: boolean = false;
  isBreakUserScriptLockPermission: boolean = false;
  isBreakTempAndSysLibLockPermission: boolean = false;
  isUserHavePermission: boolean = true;
  isUserHaveImportExportUserScriptPermission: boolean = false;
  isCURDTemplatePermission: boolean = false;
  isImportExportTemplateAndSysLibPermission: boolean = false;
  isCURDSysLibPermission: boolean = false;
  isCURDUserScriptPermission: boolean = false;
  genId: number = null;

  validationMessages = {
    workspace: {
      required: "Workspace is required"
    },
    name: {
      required: "Name is required",
      maxlength: "Maximum 128 characters are allowed",
      hasWhitespace: "Whitespace not allowed"
    },
    description: {
      maxlength: "Maximum 2000 characters are allowed",
    },
    version: {
      required: "Version is required",
    },
    language: {
      required: "Language is required",
    },
    connectable: {
      required: "Connectable is required",
    }
  };

  formErrors = {
    workspace: '',
    name: '',
    description: '',
    version: '',
    language: '',
    connectable: ''
  };

  private getWorkspacesSub = Subscription.EMPTY;
  private getLockSub = Subscription.EMPTY;
  private breakLockSub = Subscription.EMPTY;
  private cancelLockSub = Subscription.EMPTY;
  private getScriptLockInfoSub = Subscription.EMPTY;
  private getAllocatedIdsSub = Subscription.EMPTY;
  private saveSysLibSub = Subscription.EMPTY;
  private saveScriptSub = Subscription.EMPTY;
  private deleteSysLibScriptSub = Subscription.EMPTY;
  private deleteScriptSub = Subscription.EMPTY;
  private getSysLibConnectionSub = Subscription.EMPTY;
  private getScriptConnectionSub = Subscription.EMPTY;
  private getScriptByIdSub = Subscription.EMPTY;
  private getDeployedScriptByIdSub = Subscription.EMPTY;
  private getSysLibByIdSub = Subscription.EMPTY;
  private getDeployedSysLibByIdSub = Subscription.EMPTY;
  private exportScriptSub = Subscription.EMPTY;
  private getConnectionPITItemsSub = Subscription.EMPTY;
  private validateScriptContentSub = Subscription.EMPTY;
  private validateSysLibScriptContentSub = Subscription.EMPTY;
  private getLatestVersionInfoSub = Subscription.EMPTY;
  private getVersionByIdSub = Subscription.EMPTY;
  private getDebugParameterSub = Subscription.EMPTY;
  private getAttachedSysLibSub = Subscription.EMPTY;
  private getUserSettingDarkModeSub = Subscription.EMPTY;

  constructor(
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
    private tabCommunicationService: TabCommunicationService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
  }

  ngOnInit(): void {
    this.getWorkspacesByUser();
    this.createForm();

    this.scriptStateService.openedScripts$.subscribe((openScripts) => {
      if (openScripts?.length) {
        this.openedScripts = openScripts;
      }
    });

    this.scriptStateService.scriptCreated$.subscribe((data) => {
      if (data) {
        this.scriptData = data;
        this.setDataInForm(this.scriptData);
        this.lockMgmt();
      }
    });

    this.scriptStateService.selectedScript$.subscribe((script) => {
      if (script) {
        const accessWorkspaces = this.currentUser?.workspaceAccess;
        this.scriptData = script;
        this.getScriptLockDetails(this.scriptData?.workspaceId, this.scriptData?.scriptId, this.scriptData?.type);
        this.setDataInForm(this.scriptData);
        this.lockMgmt();
        if (accessWorkspaces?.length) {
          accessWorkspaces.forEach((aws) => {
            if (script?.type === 'userScript' || script?.type === 'USER_SCRIPT') {
              if (Number(aws?.workspaceId) === Number(this.scriptData?.workspaceId)) {
                // Create, Update and Delete Template Access
                const curdTemplateAccess = aws?.accessList.some((x) => x?.key === 'DEV_CRUD_TPL');
                this.isCURDTemplatePermission = curdTemplateAccess;

                // Break Lock Template and System Library Access
                const breakLockTempAndSysLibAccess = aws?.accessList.some((x) => x?.key === 'DEV_LOCK_SCRT');
                this.isBreakTempAndSysLibLockPermission = breakLockTempAndSysLibAccess;

                // Break Lock User Script Access
                const breakLockUserScriptAccess = aws?.accessList.some((x) => x?.key === 'DEV_LOCK_USCRT');
                this.isBreakUserScriptLockPermission = breakLockUserScriptAccess;

                // Import or Export Template and System Library Access
                const ixTemplateAndSysLibAccess = aws?.accessList.some((x) => x?.key === 'DEV_IX_SCRT');
                this.isImportExportTemplateAndSysLibPermission = ixTemplateAndSysLibAccess;

                // Import or Export User Script Access
                const ixUserScriptAccess = aws?.accessList.some((x) => x?.key === 'DEV_IX_USCRT');
                this.isUserHaveImportExportUserScriptPermission = ixUserScriptAccess;

                // Create, Update and Delete System Library Access
                const curdSysLibAccess = aws?.accessList.some((x) => x?.key === 'DEV_CRUD_SYSL');
                this.isCURDSysLibPermission = curdSysLibAccess;

                // Create, Update and Delete User Script Access
                const curdUserScriptAccess = aws?.accessList.some((x) => x?.key === 'DEV_CRUD_USRS');
                this.isCURDUserScriptPermission = curdUserScriptAccess;
              }
            } else {
              // Create, Update and Delete Template Access
              const curdTemplateAccess = aws?.accessList.some((x) => x?.key === 'DEV_CRUD_TPL');
              this.isCURDTemplatePermission = curdTemplateAccess;

              // Create, Update and Delete System Library Access
              const curdSysLibAccess = aws?.accessList.some((x) => x?.key === 'DEV_CRUD_SYSL');
              this.isCURDSysLibPermission = curdSysLibAccess;

              // Break Lock Template and System Library Access
              const breakLockTempAndSysLibAccess = aws?.accessList.some((x) => x?.key === 'DEV_LOCK_SCRT');
              this.isBreakTempAndSysLibLockPermission = breakLockTempAndSysLibAccess;

              // Import or Export Template and System Library Access
              const ixTemplateAndSysLibAccess = aws?.accessList.some((x) => x?.key === 'DEV_IX_SCRT');
              this.isImportExportTemplateAndSysLibPermission = ixTemplateAndSysLibAccess;
            }
          });
        }
        if (this.currentUser?.superAdminUser) {
          this.isUserHavePermission = true;
        } else if (this.currentUser?.adminUser && (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT')) {
          // Admin user can break lock on user scripts
          this.isUserHavePermission = true;
        } else if (!this.currentUser?.superAdminUser && !this.currentUser?.adminUser && (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT')) {
          this.isUserHavePermission = true;
        } else {
          this.isUserHavePermission = false;
        }
      } else {
        // Reset the component state when scriptData is null
        this.scriptData = null;
      }
    });

    this.scriptStateService.activeTabId$.subscribe((tabId) => {
      this.activeTabId = tabId;
    });

    this.scriptStateService.scriptGenId$.subscribe((genId) => {
      this.genId = genId;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['scriptData'] && changes['scriptData'].currentValue) {
      this.setDataInForm(this.scriptData);
      this.lockMgmt();
    } else {
      // Reset the component state when scriptData is null
      this.scriptData = null;
    }
  }

  get shouldShowLockMessage(): boolean {
    const { adminUser, superAdminUser } = this.currentUser || {};

    return (
      (superAdminUser &&
        (this.scriptData?.type === 'userScript' ||
          this.scriptData?.type === 'template' ||
          this.scriptData?.type === 'systemLibrary')) ||
      (adminUser && this.scriptData?.type === 'userScript') ||
      ((!adminUser || !superAdminUser) && this.scriptData?.type === 'userScript')
    );
  }

  createForm() {
    this.scriptPropertiesForm = this.fb.group({
      workspace: [{ value: '', disabled: true }, {
        validators: []
      }],
      name: [{ value: '', disabled: true }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      description: [{ value: '', disabled: true }, {
        validators: [Validators.maxLength(2000)]
      }],
      version: [{ value: '', disabled: true }, {
        validators: []
      }],
      language: [{ value: '', disabled: true }, {
        validators: []
      }],
      connectable: [{ value: true, disabled: true }, {
        validators: []
      }]
    });
    this.scriptPropertiesForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.scriptPropertiesForm);
    });
  }

  logValidationErrors(group: UntypedFormGroup = this.scriptPropertiesForm): void {
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

  setDataInForm(data: any) {
    this.scriptPropertiesForm.patchValue({
      workspace: data?.workspaceId,
      name: data?.scriptName,
      description: data?.description,
      version: Number(data?.deployedVersion) > 0 ? data?.deployedVersion : 'Working copy',
      language: data?.language,
      connectable: data?.connectable
    });
  }

  /*============ Disabled Non Editable Form Fields ============*/
  disabledFormFields() {
    this.scriptPropertiesForm.get('workspace').disable();
    this.scriptPropertiesForm.get('version').disable();
    this.scriptPropertiesForm.get('language').disable();
  }

  /*============ On Change Script Name and Description Save it Locally for Save All ============*/
  onChangeScriptNameAndDesc() {
    const scriptName = this.scriptPropertiesForm.get('name')?.value;
    const scriptDesc = this.scriptPropertiesForm.get('description')?.value;
    if (scriptName) {
      this.scriptData.scriptName = scriptName;
    }
    if (scriptDesc) {
      this.scriptData.description = scriptDesc;
    }
    this.scriptStateService.updateScripts(this.scriptData, this.scriptData?.lockInfo);
  }

  getScriptLockDetails(workspaceId: number, scriptId: number, scriptType: string): any {
    this.getScriptLockInfoSub = this.developmentService.getScriptLockInfo(workspaceId, scriptId, scriptType).subscribe((res) => {
      const lockInfo = JSON.parse(JSON.stringify(res));
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
      this.scriptData.lockInfo = lockInfo;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
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

  getLockInfo() {
    const scriptInfo = this.scriptData;
    const workspaceId = (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT') ? Number(this.scriptData?.workspaceId) : 0;
    this.getScriptLockInfoSub = this.developmentService.getScriptLockInfo(Number(workspaceId), Number(scriptInfo?.scriptId), scriptInfo?.type).subscribe((res) => {
      if (res) {
        const lockInfo = JSON.parse(JSON.stringify(res));
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
        scriptInfo.lockInfo = lockInfo;

        if (this.scriptData?.type === 'systemLibrary' || this.scriptData?.type === 'SYSTEM_LIBRARY') {
          this.scriptStateService.sharedSelectedScriptData(scriptInfo);
        } else {
          // Get Script Parameters only if the script is not a system library
          this.getScriptParameters(scriptInfo);
        }

        // this.scriptStateService.sharedSelectedScriptData(scriptInfo);
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
  getScriptParameters(script: any) {
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
      deployedCopy: script?.lockInfo.isLocked ? false : true,
      versionId: 0,
      versionCopy: false,
      debugSeId: this.scriptData?.debugSeId,
      debugSeUrl: this.scriptData?.debugSeUrl
    };

    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;

    this.getDebugParameterSub = this.developmentService.getDebugScriptParameters(obj, debugSeId, debugSeUrl).subscribe((res) => {
      const parameters = JSON.parse(JSON.stringify(res));
      script.debugParameters = parameters || [];
      this.scriptStateService.updateScripts(script, script?.lockInfo);
      this.scriptStateService.sharedSelectedScriptData(script);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  lockMgmt() {
    const scriptInfo = this.scriptData;
    if (scriptInfo?.lockInfo?.isLocked && (Number(this.currentUser?.id) === Number(scriptInfo?.lockInfo?.lockedUserId))) {
      this.isGetLock = scriptInfo?.lockInfo.isLocked;
      this.isCancelLock = !scriptInfo?.lockInfo.isLocked;
      this.isBreakLock = false;
      this.scriptPropertiesForm.enable();
      this.disabledFormFields();
    } else if (scriptInfo?.lockInfo.isLocked && (Number(this.currentUser?.id) !== Number(scriptInfo?.lockInfo?.lockedUserId)) && (!this.isBreakUserScriptLockPermission && !this.isBreakTempAndSysLibLockPermission)) {
      this.isGetLock = false;
      this.isCancelLock = false;
      this.isBreakLock = false;
      this.scriptPropertiesForm.disable();
    } else if (scriptInfo?.lockInfo.isLocked && (Number(this.currentUser?.id) !== Number(scriptInfo?.lockInfo?.lockedUserId)) && (this.isBreakUserScriptLockPermission || this.isBreakTempAndSysLibLockPermission)) {
      this.isGetLock = false;
      this.isCancelLock = false;
      this.isBreakLock = true;
      this.scriptPropertiesForm.disable();
    } else {
      this.isGetLock = false;
      this.isCancelLock = true;
      this.isBreakLock = false;
      this.scriptPropertiesForm.disable();
    }
  }

  /*============ Get Deployed Script By Id ============*/
  getDeployedScriptById(scriptId: string, type: string, workspaceId: number, deployed: boolean, isSaved: boolean, LockInfo: any) {
    this.getDeployedScriptByIdSub = this.developmentService.getDeployedScriptById(scriptId, type, workspaceId, deployed).subscribe((res) => {
      if (res) {
        if (this.openedScripts?.length) {
          this.openedScripts.forEach((x) => {
            if (Number(x?.scriptId) === Number(res?.id)) {
              x = res;
            }
          });
          this.scriptStateService.updateOpenedScripts(this.openedScripts);

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
            scriptId: deployed ? res?.executableRef : res?.id,
            userDefined: res?.userDefined,
            deployedVersion: res?.deployedVersion,
            tabId: this.scriptStateService.getTabId(deployed ? res?.executableRef : res?.id),
            isSystemLibrary: false,
            triggerScript: res?.triggerScript,
            sysLibRefList: res?.sysLibRefList,
            sysLibRefNameList: res?.sysLibRefNameList,
            deployed: deployed,
            isDeployed: deployed,
            trustedUrl: isSaved ? this.scriptData?.trustedUrl : this.scriptStateService.getUrl(workspaceId, deployed ? res?.executableRef : res?.id, this.scriptStateService.getTabId(deployed ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', deployed ? true : false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), (LockInfo?.isLocked && !LockInfo?.isBreakLockBtnVisible), false),
            url: isSaved ? this.scriptData?.url : this.scriptStateService.getUrl(workspaceId, deployed ? res?.executableRef : res?.id, this.scriptStateService.getTabId(deployed ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', deployed ? true : false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), (LockInfo?.isLocked && !LockInfo?.isBreakLockBtnVisible), false),
            lockInfo: LockInfo,
            debugSeId: this.scriptData?.debugSeId,
            debugSeUrl: this.scriptData?.debugSeUrl,
            latestVersion: deployed ? res?.versionNumber : 0,
            scriptEngineGroupName: this.scriptData?.scriptEngineGroupName,
            debugSeName: this.scriptData?.debugSeName
          };
          this.scriptData = updatedScript;
          if (res?.scriptName) {
            this.scriptData.scriptName = res?.scriptName;
          }
          if (res?.description) {
            this.scriptData.description = res?.description;
          }

          // this.getLockInfo();

          if (this.scriptData?.type === 'systemLibrary' || this.scriptData?.type === 'SYSTEM_LIBRARY') {
            this.scriptStateService.sharedSelectedScriptData(this.scriptData);
          } else {
            // Get Script Parameters only if the script is not a system library
            this.getScriptParameters(this.scriptData);
          }

          // this.scriptStateService.updateScripts(this.scriptData, this.scriptData?.lockInfo);
          if (!isSaved && !deployed) {
            this.scriptStateService.setActionPerformed(true);
          }
          // Below code is commented to avoid 'releaseAllocation' API call on Save Action
          // this.scriptStateService.setActionPerformed(true);
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

  getLock() {
    const dialogRef = this.dialog.open(GetLockConfirmationComponent, {
      width: "600px",
      maxHeight: "800px",
      data: {
        message: `${Number(this.scriptData?.deployedVersion) === 0 ? 'Executable has no deployed version. Do you want to continue with getting working copy?' : 'Which script do you want to load?'}`,
        scriptInfo: this.scriptData,
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isGetLock) {
        const workspaceId = (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT') ? Number(this.scriptData?.workspaceId) : 0;

        this.getLockSub = this.developmentService.getScriptLock(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).pipe(
          switchMap(lock => {
            return this.developmentService.getScriptLockInfo(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).pipe(
              map(lockInfoRes => ({ isLock: lock, getLockInfo: lockInfoRes }))
            );
          })
        ).subscribe(({ isLock, getLockInfo }) => {
          // const lockInfo = JSON.parse(JSON.stringify(getLockInfo));
          const lockInfo = getLockInfo;

          if (isLock) {
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

            if (Number(this.scriptData?.deployedVersion) === 0) {
              if (isLock) {
                this.scriptPropertiesForm.enable();
                const isDeployed = false;
                if (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'template') {
                  this.getDeployedScriptById(this.scriptData?.scriptId, this.scriptData?.type, (this.scriptData?.type === 'userScript' && this.scriptData?.workspaceId) ? this.scriptData?.workspaceId : 0, isDeployed, false, lockInfo);
                }
                if (this.scriptData?.isSystemLibrary) {
                  // this.getSysLibScriptById(this.scriptData?.scriptId);
                  this.getDeployedSysLibById(this.scriptData?.scriptId, isDeployed, false, lockInfo);
                }
              }
            } else {
              if (isLock) {
                this.scriptPropertiesForm.enable();
                const isDeployed = result?.scriptCopy === 'Deployed' ? true : false;
                if (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'template') {
                  this.getDeployedScriptById(this.scriptData?.scriptId, this.scriptData?.type, (this.scriptData?.type === 'userScript' && this.scriptData?.workspaceId) ? this.scriptData?.workspaceId : 0, isDeployed, false, lockInfo);
                }
                if (this.scriptData?.isSystemLibrary) {
                  // this.getSysLibScriptById(this.scriptData?.scriptId);
                  this.getDeployedSysLibById(this.scriptData?.scriptId, isDeployed, false, lockInfo);
                }
                // this.scriptStateService.setActionPerformed(true);
              }
            }
          } else {
            this.messageService.add({ key: 'devInfoKey', severity: 'success', summary: '', detail: `The script is currently locked by user - ${lockInfo?.lockedBy}. Click refresh to see the latest status.` });
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


    // const workspaceId = (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT') ? Number(this.scriptData?.workspaceId) : 0;

    // this.getLockSub = this.developmentService.getScriptLock(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).pipe(
    //   switchMap(lock => {
    //     return this.developmentService.getScriptLockInfo(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).pipe(
    //       map(lockInfoRes => ({ isLock: lock, getLockInfo: lockInfoRes }))
    //     );
    //   })
    // ).subscribe(({ isLock, getLockInfo }) => {
    //   // const lockInfo = JSON.parse(JSON.stringify(getLockInfo));
    //   const lockInfo = getLockInfo;

    //   if (isLock) {
    //     if (lockInfo?.idOfLockedItem && lockInfo?.lockDate && lockInfo?.lockTime && lockInfo?.lockedBy) {
    //       // Below code is commented due to getting issue for showing incorrect buttons to user
    //       // if (Number(lockInfo?.lockedUserId) === Number(this.currentUser?.id)) {
    //       //   lockInfo.isLocked = true;
    //       // } else {
    //       //   lockInfo.isLocked = false;
    //       // }
    //       // Below code is added to disabled script editor if current user don't have lock
    //       if (Number(lockInfo?.lockedUserId) === Number(this.currentUser?.id)) {
    //         lockInfo.isBreakLockBtnVisible = false;
    //       } else {
    //         lockInfo.isBreakLockBtnVisible = true;
    //       }
    //       lockInfo.isLocked = true;
    //     } else {
    //       lockInfo.isLocked = false;
    //     }

    //     if (Number(this.scriptData?.deployedVersion) === 0) {
    //       if (isLock) {
    //         this.scriptPropertiesForm.enable();
    //         const isDeployed = false;
    //         if (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'template') {
    //           this.getDeployedScriptById(this.scriptData?.scriptId, this.scriptData?.type, (this.scriptData?.type === 'userScript' && this.scriptData?.workspaceId) ? this.scriptData?.workspaceId : 0, isDeployed, false, lockInfo);
    //         }
    //         if (this.scriptData?.isSystemLibrary) {
    //           // this.getSysLibScriptById(this.scriptData?.scriptId);
    //           this.getDeployedSysLibById(this.scriptData?.scriptId, isDeployed, false, lockInfo);
    //         }
    //       }
    //     } else {
    //       const dialogRef = this.dialog.open(GetLockConfirmationComponent, {
    //         width: "600px",
    //         maxHeight: "800px",
    //         data: {
    //           message: `${Number(this.scriptData?.deployedVersion) === 0 ? 'Executable has no deployed version. Do you want to continue with getting working copy?' : 'Which script do you want to load?'}`,
    //           scriptInfo: this.scriptData,
    //         }
    //       });
    //       dialogRef.afterClosed().subscribe((result) => {
    //         if (result?.isGetLock) {
    //           if (isLock) {
    //             this.scriptPropertiesForm.enable();
    //             const isDeployed = result?.scriptCopy === 'Deployed' ? true : false;
    //             if (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'template') {
    //               this.getDeployedScriptById(this.scriptData?.scriptId, this.scriptData?.type, (this.scriptData?.type === 'userScript' && this.scriptData?.workspaceId) ? this.scriptData?.workspaceId : 0, isDeployed, false, lockInfo);
    //             }
    //             if (this.scriptData?.isSystemLibrary) {
    //               // this.getSysLibScriptById(this.scriptData?.scriptId);
    //               this.getDeployedSysLibById(this.scriptData?.scriptId, isDeployed, false, lockInfo);
    //             }
    //             // this.scriptStateService.setActionPerformed(true);
    //           }
    //         }
    //       });
    //     }
    //   } else {
    //     this.messageService.add({ key: 'devInfoKey', severity: 'success', summary: '', detail: `The script is currently locked by user - ${lockInfo?.lockedBy}. Click refresh to see the latest status.` });
    //   }
    // }, (err: HttpErrorResponse) => {
    //   if (err.error instanceof Error) {
    //     // handle client side error here
    //   } else {
    //     // handle server side error here
    //   }
    // });


    // if (Number(this.scriptData?.deployedVersion) === 0) {
    //   const workspaceId = (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT') ? Number(this.scriptData?.workspaceId) : 0;
    //   this.getLockSub = this.developmentService.getScriptLock(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).subscribe((res) => {
    //     if (res) {
    //       this.scriptPropertiesForm.enable();
    //       const isDeployed = false;
    //       if (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'template') {
    //         this.getDeployedScriptById(this.scriptData?.scriptId, this.scriptData?.type, (this.scriptData?.type === 'userScript' && this.scriptData?.workspaceId) ? this.scriptData?.workspaceId : 0, isDeployed, false);
    //       }
    //       if (this.scriptData?.isSystemLibrary) {
    //         // this.getSysLibScriptById(this.scriptData?.scriptId);
    //         this.getDeployedSysLibById(this.scriptData?.scriptId, isDeployed, false);
    //       }
    //       // this.scriptStateService.setActionPerformed(true);
    //     }
    //   }, (err: HttpErrorResponse) => {
    //     if (err.error instanceof Error) {
    //       // handle client side error here
    //     } else {
    //       // handle server side error here
    //     }
    //   });
    // } else {
    //   const dialogRef = this.dialog.open(GetLockConfirmationComponent, {
    //     width: "600px",
    //     maxHeight: "800px",
    //     data: {
    //       message: `${Number(this.scriptData?.deployedVersion) === 0 ? 'Executable has no deployed version. Do you want to continue with getting working copy?' : 'Which script do you want to load?'}`,
    //       scriptInfo: this.scriptData,
    //     }
    //   });
    //   dialogRef.afterClosed().subscribe((result) => {
    //     if (result?.isGetLock) {
    //       const workspaceId = (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT') ? Number(this.scriptData?.workspaceId) : 0;
    //       this.getLockSub = this.developmentService.getScriptLock(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).subscribe((res) => {
    //         if (res) {
    //           this.scriptPropertiesForm.enable();
    //           const isDeployed = result?.scriptCopy === 'Deployed' ? true : false;
    //           if (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'template') {
    //             this.getDeployedScriptById(this.scriptData?.scriptId, this.scriptData?.type, (this.scriptData?.type === 'userScript' && this.scriptData?.workspaceId) ? this.scriptData?.workspaceId : 0, isDeployed, false);
    //           }
    //           if (this.scriptData?.isSystemLibrary) {
    //             // this.getSysLibScriptById(this.scriptData?.scriptId);
    //             this.getDeployedSysLibById(this.scriptData?.scriptId, isDeployed, false);
    //           }
    //           // this.scriptStateService.setActionPerformed(true);
    //         }
    //       }, (err: HttpErrorResponse) => {
    //         if (err.error instanceof Error) {
    //           // handle client side error here
    //         } else {
    //           // handle server side error here
    //         }
    //       });
    //     }
    //   });
    // }
  }

  breakLock() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: "600px",
      maxHeight: "800px",
      data: `${this.scriptData?.scriptName} script is already locked by ${this.scriptData?.lockInfo?.lockedBy}. Are you sure you want to break the lock?`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const workspaceId = (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT') ? Number(this.scriptData?.workspaceId) : 0;

        this.breakLockSub = this.developmentService.breakScriptLock(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).pipe(
          switchMap(lock => {
            return this.developmentService.getScriptLockInfo(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).pipe(
              map(lockInfoRes => ({ isLock: lock, getLockInfo: lockInfoRes }))
            );
          })
        ).subscribe(({ isLock, getLockInfo }) => {
          // const lockInfo = JSON.parse(JSON.stringify(getLockInfo));
          const lockInfo = getLockInfo;

          if (isLock) {
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

            if (Number(this.scriptData?.deployedVersion) === 0) {
              if (isLock) {
                this.scriptPropertiesForm.enable();
                const isDeployed = false;
                if (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'template') {
                  this.getDeployedScriptById(this.scriptData?.scriptId, this.scriptData?.type, (this.scriptData?.type === 'userScript' && this.scriptData?.workspaceId) ? this.scriptData?.workspaceId : 0, isDeployed, false, lockInfo);
                }
                if (this.scriptData?.isSystemLibrary) {
                  // this.getSysLibScriptById(this.scriptData?.scriptId);
                  this.getDeployedSysLibById(this.scriptData?.scriptId, isDeployed, false, lockInfo);
                }
              }
            } else {
              if (isLock) {
                this.scriptPropertiesForm.enable();
                const isDeployed = result?.scriptCopy === 'Deployed' ? true : false;
                if (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'template') {
                  this.getDeployedScriptById(this.scriptData?.scriptId, this.scriptData?.type, (this.scriptData?.type === 'userScript' && this.scriptData?.workspaceId) ? this.scriptData?.workspaceId : 0, isDeployed, false, lockInfo);
                }
                if (this.scriptData?.isSystemLibrary) {
                  // this.getSysLibScriptById(this.scriptData?.scriptId);
                  this.getDeployedSysLibById(this.scriptData?.scriptId, isDeployed, false, lockInfo);
                }
                // this.scriptStateService.setActionPerformed(true);
              }
            }
          } else {
            this.messageService.add({ key: 'devInfoKey', severity: 'success', summary: '', detail: `The script is currently locked by user - ${lockInfo?.lockedBy}. Click refresh to see the latest status.` });
          }
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });

        // Old code

        // this.breakLockSub = this.developmentService.breakScriptLock(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).subscribe((res) => {
        //   if (res) {
        //     this.scriptPropertiesForm.enable();
        //     this.disabledFormFields();
        //     this.getLockInfo();
        //     this.scriptStateService.setActionPerformed(true);
        //   }
        // }, (err: HttpErrorResponse) => {
        //   if (err.error instanceof Error) {
        //     // handle client side error here
        //   } else {
        //     // handle server side error here
        //   }
        // });
      }
    });
  }

  cancelLock() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: "600px",
      maxHeight: "800px",
      data: `Are you sure you want to cancel lock? <br/> Any changes, not saved will be lost, and script will be restored to its latest version.`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.unlock();
        this.scriptStateService.setActionPerformed(true);
      }
    });
  }

  unlock() {
    const workspaceId = (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT') ? Number(this.scriptData?.workspaceId) : 0;

    this.cancelLockSub = this.developmentService.cancelScriptLock(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).pipe(
      switchMap(cancelLock => {
        return this.developmentService.getScriptLockInfo(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).pipe(
          map(lockInfoRes => ({ cancelLock: cancelLock, getLockInfo: lockInfoRes }))
        );
      })
    ).subscribe(({ cancelLock, getLockInfo }) => {
      const lockInfo = JSON.parse(JSON.stringify(getLockInfo));
      if (cancelLock) {
        this.scriptPropertiesForm.disable();
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
        this.scriptData.lockInfo = lockInfo;
        const itemType = this.scriptData?.isSystemLibrary ? 'systemLibrary' : this.scriptData?.userDefined ? 'userScript' : 'template';
        if (this.scriptData?.isSystemLibrary) {
          this.getSysLibScriptById(this.scriptData?.scriptId, lockInfo);
        } else {
          this.getScriptById(this.scriptData?.scriptId, itemType, this.scriptData?.workspaceId, lockInfo);
        }
      } else {
        this.messageService.add({ key: 'devInfoKey', severity: 'success', summary: '', detail: `The script is not in locked currently, click refresh to check latest status.` });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });

    // this.cancelLockSub = forkJoin({
    //   cancelLock: this.developmentService.cancelScriptLock(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type),
    //   getLockInfo: this.developmentService.getScriptLockInfo(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type)
    // }).subscribe(({ cancelLock, getLockInfo }) => {
    //   if (cancelLock) {
    //     this.scriptPropertiesForm.disable();
    //     const lockInfo = JSON.parse(JSON.stringify(getLockInfo));
    //     if (lockInfo?.idOfLockedItem && lockInfo?.lockDate && lockInfo?.lockTime && lockInfo?.lockedBy) {
    //       if (Number(lockInfo?.lockedUserId) === Number(this.currentUser?.id)) {
    //         lockInfo.isLocked = true;
    //       } else {
    //         lockInfo.isLocked = false;
    //       }
    //     } else {
    //       lockInfo.isLocked = false;
    //     }
    //     this.scriptData.lockInfo = lockInfo;
    //     const itemType = this.scriptData?.isSystemLibrary ? 'systemLibrary' : this.scriptData?.userDefined ? 'userScript' : 'template';
    //     if (this.scriptData?.isSystemLibrary) {
    //       this.getSysLibScriptById(this.scriptData?.scriptId, lockInfo);
    //     } else {
    //       this.getScriptById(this.scriptData?.scriptId, itemType, this.scriptData?.workspaceId, lockInfo);
    //     }
    //   }
    // }, (err: HttpErrorResponse) => {
    //   if (err.error instanceof Error) {
    //     // handle client side error here
    //   } else {
    //     // handle server side error here
    //   }
    // });

    // this.cancelLockSub = this.developmentService.cancelScriptLock(Number(workspaceId), Number(this.scriptData?.scriptId), this.scriptData?.type).subscribe((res) => {
    //   if (res) {
    //     this.scriptPropertiesForm.disable();
    //     const itemType = this.scriptData?.isSystemLibrary ? 'systemLibrary' : this.scriptData?.userDefined ? 'userScript' : 'template';
    //     if (this.scriptData?.isSystemLibrary) {
    //       this.getSysLibScriptById(this.scriptData?.scriptId);
    //     } else {
    //       this.getScriptById(this.scriptData?.scriptId, itemType, this.scriptData?.workspaceId);
    //     }
    //   }
    // }, (err: HttpErrorResponse) => {
    //   if (err.error instanceof Error) {
    //     // handle client side error here
    //   } else {
    //     // handle server side error here
    //   }
    // });
  }

  onParameters(): void {
    const winwrapObj: WinwrapRequestDto = {
      jsonMap: null,
      headers: null,
      clientId: [this.scriptData?.tabId],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: this.scriptData?.workspaceId,
      scriptId: this.scriptData?.scriptId,
      attachSysLibIds: [],
      attachedReferenceIds: [],
      debugSeId: this.scriptData?.debugSeId,
      debugSeUrl: this.scriptData?.debugSeUrl
      // userName: this.currentUser?.userName,
      // scriptType: this.scriptData?.type,
      // deployedCopy: this.scriptData?.lockInfo.isLocked ? false : true,
      // versionId: 0,
      // isVersionCopy: false

    };
    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;
    this.validateScriptContentSub = this.developmentService.validateScript(winwrapObj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res?.errorInfo) {
        this.messageService.add({ key: 'devInfoKey', severity: 'success', summary: '', detail: `${res?.errorInfo}` });
      } else {
        const dialogRef = this.dialog.open(ParametersComponent, {
          width: "600px",
          maxHeight: '95vh',
          height: '95%',
          data: { ...this.scriptData }
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            // Handle result if needed
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

  getSysLibList() {
    const dialogRef = this.dialog.open(SystemLibraryReferencesComponent, {
      width: "700px",
      maxHeight: "800px",
      data: { ...this.scriptData, isSysLibClick: true }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isSysLibAttached) {
        let selectedSysLibsIds = [];
        let selectedSysLibsNames = [];
        selectedSysLibsIds = result?.selectedSysLibs.map((s) => s?.id);
        selectedSysLibsNames = result?.selectedSysLibs.map((s) => s?.scriptName);
        this.scriptData.sysLibRefList = selectedSysLibsIds;
        this.scriptData.sysLibRefNameList = selectedSysLibsNames;
      }
      this.scriptStateService.updateScripts(this.scriptData, this.scriptData?.lockInfo);
      this.scriptStateService.sharedSelectedScriptData(this.scriptData);
    });
  }

  getReferencesList() {
    const dialogRef = this.dialog.open(SystemLibraryReferencesComponent, {
      width: "700px",
      maxHeight: "800px",
      data: { ...this.scriptData, isSysLibClick: false }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isReferenceAttached) {
        // Handle result if needed
        this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `Reference(s) attached successfully!` });
      }
    });
  }

  getVersionHistory() {
    const dialogRef = this.dialog.open(ScriptVersionsComponent, {
      width: "900px",
      maxHeight: '95vh',
      height: '95%',
      data: {
        ...this.scriptData,
        isIXUserScriptAccess: this.isUserHaveImportExportUserScriptPermission,
        isIXTemplateAndSysLibAccess: this.isImportExportTemplateAndSysLibPermission,
        isBreakUserScriptLockAccess: this.isBreakUserScriptLockPermission,
        isBreakTempAndSysLibLockAccess: this.isBreakTempAndSysLibLockPermission,
        isCURDTemplateAccess: this.isCURDTemplatePermission,
        isCURDSysLibAccess: this.isCURDSysLibPermission,
        isCURDUserScriptAccess: this.isCURDUserScriptPermission,
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isAction) {
        // Handle result if needed
        const workspaceId = (this.scriptData?.type === 'userScript' || this.scriptData?.type === 'USER_SCRIPT') ? Number(this.scriptData?.workspaceId) : 0;

        this.getScriptLockInfoSub = this.developmentService.getScriptLockInfo(workspaceId, Number(this.scriptData?.scriptId), this.scriptData?.type).subscribe((res) => {
          const lockInfo = JSON.parse(JSON.stringify(res));
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

          const itemType = this.scriptData?.isSystemLibrary ? 'systemLibrary' : this.scriptData?.userDefined ? 'userScript' : 'template';
          if (result?.isRestored) {
            this.getScriptVersionInfoById(result?.verId, result?.scriptType, this.scriptData?.workspaceId, lockInfo);
          } else {
            if (this.scriptData?.isSystemLibrary) {
              this.getSysLibScriptById(this.scriptData?.scriptId, lockInfo);
            } else {
              this.getScriptById(this.scriptData?.scriptId, itemType, this.scriptData?.workspaceId, lockInfo);
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
    });
  }

  onDelete() {
    if (this.scriptData?.isSystemLibrary) {
      this.getSysLibConnectionSub = this.developmentService.getSysLibConnectionStatusById(Number(this.scriptData?.scriptId)).subscribe((res) => {
        if (res) {
          this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `System library can not be deleted because it is connected to any script(s) or any of it's version(s).` });
        } else {
          setTimeout(() => {
            this.deleteSysLib();
          }, 0);
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    } else {
      this.getScriptConnectionSub = this.developmentService.scriptConnectedToPIT(Number(this.scriptData?.scriptId)).subscribe((res) => {
        if (res) {
          this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `Script can not be deleted because it is connected to any PIT item(s).` });
        } else {
          setTimeout(() => {
            this.deleteScript();
          }, 0);
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

  deleteScript() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: "600px",
      maxHeight: "800px",
      data: `Are you sure you want to remove ${this.scriptData?.scriptName} script? <br/> Note: All version(s) will be deleted. If any uncertainty, do an export before as a backup.`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => {
          this.deleteScriptSub = this.developmentService.removeScript(Number(this.scriptData?.workspaceId), Number(this.scriptData?.scriptId), false, this.scriptData?.userDefined).subscribe((res) => {
            if (res) {
              this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `${this.scriptData?.scriptName} script deleted successfully!` });
              this.scriptStateService.setDeleteActionPerformed({
                isDeleted: true,
                scriptId: this.scriptData?.scriptId,
              });
              // const updatedScripts = this.openedScripts.filter((x, i) => Number(x?.scriptId) !== Number(this.scriptData?.scriptId));
              // this.scriptStateService.removeOpenedScript(this.scriptData);
              // Update service
              // this.scriptStateService.updateOpenedScripts(updatedScripts);
              // this.scriptStateService.sharedSelectedScriptData(updatedScripts?.length ? updatedScripts[0] : null);
            }
          });
        });
      }
    });
  }

  deleteSysLib() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: "600px",
      maxHeight: "800px",
      data: `Are you sure you want to remove ${this.scriptData?.scriptName} script? <br/> Note: All version(s) will be deleted. If any uncertainty, do an export before as a backup.`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => {
          const debugSeId = this.scriptData?.debugSeId;
          const debugSeUrl = this.scriptData?.debugSeUrl;
          this.deleteSysLibScriptSub = this.developmentService.deleteSysLibById(Number(this.scriptData?.scriptId), debugSeId, debugSeUrl).subscribe((res) => {
            if (res) {
              this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `${this.scriptData?.scriptName} system library script deleted successfully!` });
              this.scriptStateService.setDeleteActionPerformed({
                isDeleted: true,
                scriptId: this.scriptData?.scriptId,
              });
              // const updatedScripts = this.openedScripts.filter((x, i) => Number(x?.scriptId) !== Number(this.scriptData?.scriptId));
              // this.scriptStateService.removeOpenedScript(this.scriptData);
              // Update service
              // this.scriptStateService.updateOpenedScripts(updatedScripts);
              // this.scriptStateService.sharedSelectedScriptData(updatedScripts?.length ? updatedScripts[0] : null);
            }
          }, (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // handle client side error here
            } else {
              // handle server side error here
            }
          });
        });
      }
    });
  }

  /*=============== Get Version Info By Id ===============*/
  getScriptVersionInfoById(verId: string, type: string, workspaceId: number, lockInfo: any) {
    this.getVersionByIdSub = this.developmentService.getScriptVersionById(Number(verId), type).subscribe((version) => {
      if (version) {
        const res = JSON.parse(JSON.stringify(version));

        if (this.openedScripts?.length) {
          this.openedScripts.forEach((x) => {
            if (Number(x?.scriptId) === Number(res?.id)) {
              x = res;
            }
          });
          this.scriptStateService.updateOpenedScripts(this.openedScripts);
          const updatedScript = {
            scriptName: res?.scriptName,
            type: type === 'systemLibrary' ? 'systemLibrary' : res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template',
            scriptEngine: "All",
            description: res?.description,
            connectable: res?.connectable,
            updatedBy: res?.updatedBy,
            lastUpdated: res?.lastUpdated,
            language: res?.language,
            workspaceId: workspaceId,
            scriptId: res?.executableRef,
            userDefined: res?.userDefined,
            deployedVersion: res?.deployedVersion,
            triggerScript: res?.triggerScript,
            tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
            isSystemLibrary: type === 'systemLibrary' ? true : false,
            sysLibRefList: res?.sysLibRefList,
            sysLibRefNameList: res?.sysLibRefNameList,
            deployed: false,
            isDeployed: false,
            trustedUrl: this.scriptStateService.getUrl(workspaceId, res?.executableRef, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), type === 'systemLibrary' ? 'systemLibrary' : res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', true, verId, false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false),
            url: this.scriptStateService.getUrl(workspaceId, res?.executableRef, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), type === 'systemLibrary' ? 'systemLibrary' : res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', true, verId, false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false),
            lockInfo: lockInfo,
            debugSeId: this.scriptData?.debugSeId,
            debugSeUrl: this.scriptData?.debugSeUrl,
            scriptEngineGroupName: this.scriptData?.scriptEngineGroupName,
            debugSeName: this.scriptData?.debugSeName
          };
          this.scriptData = updatedScript;
          if (res?.scriptName) {
            this.scriptData.scriptName = res?.scriptName;
          }
          if (res?.description) {
            this.scriptData.description = res?.description;
          }

          // this.getLockInfo();

          if (this.scriptData?.type === 'systemLibrary' || this.scriptData?.type === 'SYSTEM_LIBRARY') {
            this.scriptStateService.sharedSelectedScriptData(this.scriptData);
          } else {
            // Get Script Parameters only if the script is not a system library
            this.getScriptParameters(this.scriptData);
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
  getScriptById(scriptId: string, type: string, workspaceId: number, lockInfo: any) {
    const wsId = (type.toLowerCase() === 'userscript' || type === 'USER_SCRIPT') ? Number(this.scriptData?.workspaceId) : 0;
    this.getScriptByIdSub = this.developmentService.getScriptById(scriptId, type, wsId).subscribe((res) => {
      if (res) {
        if (this.openedScripts?.length) {
          this.openedScripts.forEach((x) => {
            if (Number(x?.scriptId) === Number(res?.id)) {
              x = res;
            }
          });
          this.scriptStateService.updateOpenedScripts(this.openedScripts);
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
            scriptId: res?.thisDeployedVersion ? res?.executableRef : res?.id,
            userDefined: res?.userDefined,
            deployedVersion: res?.deployedVersion,
            tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
            triggerScript: res?.triggerScript,
            isSystemLibrary: false,
            sysLibRefList: res?.sysLibRefList,
            sysLibRefNameList: res?.sysLibRefNameList,
            deployed: res?.deployedVersion > 0 ? true : false,
            isDeployed: res?.deployedVersion > 0 ? true : false,
            trustedUrl: this.scriptStateService.getUrl(workspaceId, res?.thisDeployedVersion ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', res?.deployedVersion > 0 ? true : false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false),
            url: this.scriptStateService.getUrl(workspaceId, res?.thisDeployedVersion ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), res?.userDefined ? 'userScript' : res?.language === 'C#' ? 'adapter' : 'template', false, '0', res?.deployedVersion > 0 ? true : false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false),
            lockInfo: lockInfo,
            debugSeId: this.scriptData?.debugSeId,
            debugSeUrl: this.scriptData?.debugSeUrl,
            latestVersion: res?.versionNumber,
            scriptEngineGroupName: this.scriptData?.scriptEngineGroupName,
            debugSeName: this.scriptData?.debugSeName
          };
          this.scriptData = updatedScript;
          if (res?.scriptName) {
            this.scriptData.scriptName = res?.scriptName;
          }
          if (res?.description) {
            this.scriptData.description = res?.description;
          }

          // this.getLockInfo();

          if (this.scriptData?.type === 'systemLibrary' || this.scriptData?.type === 'SYSTEM_LIBRARY') {
            this.scriptStateService.sharedSelectedScriptData(this.scriptData);
          } else {
            // Get Script Parameters only if the script is not a system library
            this.getScriptParameters(this.scriptData);
          }
          // this.scriptStateService.updateScripts(this.scriptData, this.scriptData?.lockInfo);
          // this.scriptStateService.sharedSelectedScriptData(updatedScript);
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

  /*=============== Get SysLib Script By Id ===============*/
  getSysLibScriptById(sysLibId: string, lockInfo: any) {
    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;
    this.getSysLibByIdSub = this.developmentService.getSystemLibraryById(sysLibId, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        if (this.openedScripts?.length) {
          this.openedScripts.forEach((x) => {
            if (Number(x?.scriptId) === Number(res?.id)) {
              x = res;
            }
          });
          this.scriptStateService.updateOpenedScripts(this.openedScripts);
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
            scriptId: res?.thisDeployedVersion ? res?.executableRef : res?.id,
            userDefined: res?.userDefined,
            deployedVersion: res?.deployedVersion,
            tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
            isSystemLibrary: true,
            sysLibRefList: res?.sysLibRefList,
            sysLibRefNameList: res?.sysLibRefNameList,
            deployed: res?.deployedVersion > 0 ? true : false,
            isDeployed: res?.deployedVersion > 0 ? true : false,
            trustedUrl: this.scriptStateService.getUrl(0, res?.thisDeployedVersion ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', res?.deployedVersion > 0 ? true : false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false),
            url: this.scriptStateService.getUrl(0, res?.thisDeployedVersion ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', res?.deployedVersion > 0 ? true : false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), false, false),
            lockInfo: lockInfo,
            debugSeId: this.scriptData?.debugSeId,
            debugSeUrl: this.scriptData?.debugSeUrl,
            latestVersion: res?.versionNumber,
            scriptEngineGroupName: this.scriptData?.scriptEngineGroupName,
            debugSeName: this.scriptData?.debugSeName
          };
          this.scriptData = updatedScript;

          // this.getLockInfo();

          if (this.scriptData?.type === 'systemLibrary' || this.scriptData?.type === 'SYSTEM_LIBRARY') {
            this.scriptStateService.sharedSelectedScriptData(this.scriptData);
          } else {
            // Get Script Parameters only if the script is not a system library
            this.getScriptParameters(this.scriptData);
          }

          // this.scriptStateService.updateScripts(this.scriptData, this.scriptData?.lockInfo);
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

  /*========= Get Deployed System Library By Id =========*/
  getDeployedSysLibById(sysLibId: string, deployed: boolean, isSaved: boolean, LockInfo: any) {
    this.getDeployedSysLibByIdSub = this.developmentService.getDeployedSystemLibraryById(sysLibId, deployed).subscribe((res) => {
      if (res) {
        if (this.openedScripts?.length) {
          this.openedScripts.forEach((x) => {
            if (Number(x?.scriptId) === Number(res?.id)) {
              x = res;
            }
          });
          this.scriptStateService.updateOpenedScripts(this.openedScripts);
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
            scriptId: deployed ? res?.executableRef : res?.id,
            userDefined: res?.userDefined,
            deployedVersion: res?.deployedVersion,
            tabId: this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id),
            isSystemLibrary: true,
            sysLibRefList: res?.sysLibRefList,
            sysLibRefNameList: res?.sysLibRefNameList,
            deployed: deployed,
            isDeployed: deployed,
            trustedUrl: isSaved ? this.scriptData?.trustedUrl : this.scriptStateService.getUrl(0, deployed ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', deployed ? true : false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), (LockInfo?.isLocked && !LockInfo?.isBreakLockBtnVisible), false),
            url: isSaved ? this.scriptData?.url : this.scriptStateService.getUrl(0, deployed ? res?.executableRef : res?.id, this.scriptStateService.getTabId(res?.executableRef ? res?.executableRef : res?.id), 'systemLibrary', false, '0', deployed ? true : false, this.scriptData?.debugSeId, this.scriptData?.debugSeUrl, this.scriptStateService.getEditorTheme(), (LockInfo?.isLocked && !LockInfo?.isBreakLockBtnVisible), false),
            lockInfo: LockInfo,
            debugSeId: this.scriptData?.debugSeId,
            debugSeUrl: this.scriptData?.debugSeUrl,
            latestVersion: res?.versionNumber,
            scriptEngineGroupName: this.scriptData?.scriptEngineGroupName,
            debugSeName: this.scriptData?.debugSeName
          };
          this.scriptData = updatedScript;
          if (res?.scriptName) {
            this.scriptData.scriptName = res?.scriptName;
          }
          if (res?.description) {
            this.scriptData.description = res?.description;
          }

          // this.getLockInfo();

          if (this.scriptData?.type === 'systemLibrary' || this.scriptData?.type === 'SYSTEM_LIBRARY') {
            this.scriptStateService.sharedSelectedScriptData(this.scriptData);
          } else {
            // Get Script Parameters only if the script is not a system library
            this.getScriptParameters(this.scriptData);
          }

          // this.scriptStateService.updateScripts(this.scriptData, this.scriptData?.lockInfo);
          if (!isSaved && !deployed) {
            this.scriptStateService.setActionPerformed(true);
          }
          // Below code is commented to avoid 'releaseAllocation' API call on Save Action
          // this.scriptStateService.setActionPerformed(true);
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

  /*=============== Validate Script Content ===============*/
  validateScriptContent(saveOnly: boolean, releaseOnly: boolean, releaseAndDeploy: boolean) {
    const winwrapObj: WinwrapRequestDto = {
      jsonMap: null,
      headers: null,
      clientId: [this.scriptData?.tabId],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: this.scriptData?.workspaceId,
      scriptId: this.scriptData?.scriptId,
      attachSysLibIds: [],
      attachedReferenceIds: [],
      debugSeId: this.scriptData?.debugSeId,
      debugSeUrl: this.scriptData?.debugSeUrl
      // userName: this.currentUser?.userName,
      // scriptType: this.scriptData?.type,
      // deployedCopy: this.scriptData?.lockInfo.isLocked ? false : true,
      // versionId: 0,
      // isVersionCopy: false
    };
    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;
    this.validateScriptContentSub = this.developmentService.validateScript(winwrapObj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res?.errorInfo) {
        this.messageService.add({ key: 'devInfoKey', severity: 'success', summary: '', detail: `${res?.errorInfo}` });
      } else {
        if (releaseAndDeploy) {
          this.getConnectedPITItems(saveOnly, releaseOnly, releaseAndDeploy);
        } else {
          this.onSave(saveOnly, releaseOnly, releaseAndDeploy);
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

  /*=============== Validate System Library Content ===============*/
  validateSysLibContent(saveOnly: boolean, releaseOnly: boolean, releaseAndDeploy: boolean) {
    const winwrapObj: WinwrapRequestDto = {
      jsonMap: null,
      headers: null,
      clientId: [this.scriptData?.tabId],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: this.scriptData?.workspaceId,
      scriptId: this.scriptData?.scriptId,
      attachSysLibIds: [],
      attachedReferenceIds: [],
      debugSeId: this.scriptData?.debugSeId,
      debugSeUrl: this.scriptData?.debugSeUrl
      // userName: this.currentUser?.userName,
      // scriptType: this.scriptData?.type,
      // deployedCopy: this.scriptData?.lockInfo.isLocked ? false : true,
      // versionId: 0,
      // isVersionCopy: false
    };

    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;

    this.validateSysLibScriptContentSub = this.developmentService.validateSysLibContent(winwrapObj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res?.errorInfo) {
        const dialogRef = this.dialog.open(ConfirmationComponent, {
          width: "700px",
          maxHeight: "600px",
          data: `${res?.errorInfo}`,
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.onSave(saveOnly, releaseOnly, releaseAndDeploy);
          }
        });
      } else {
        this.onSave(saveOnly, releaseOnly, releaseAndDeploy);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
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

  /*=============== Get Connected PIT Items By Script Id ===============*/
  getConnectedPITItems(saveOnly: boolean, releaseOnly: boolean, releaseAndDeploy: boolean) {
    this.getConnectionPITItemsSub = this.developmentService.getConnectedPITItemsByScriptId(Number(this.scriptData?.scriptId), this.scriptData?.type, this.scriptData?.triggerScript).subscribe((res) => {
      if (res?.length) {
        const connectedPITItems = JSON.parse(JSON.stringify(res));

        if (connectedPITItems?.length) {
          const dialogRef = this.dialog.open(ConnectedItemsConfirmationComponent, {
            width: "900px",
            maxHeight: '95vh',
            height: '95%',
            data: {
              scriptName: this.scriptData?.scriptName,
              workspaceId: this.scriptData?.workspaceId,
              // message: `Deploy of script <b>${this.scriptData?.scriptName}</b> will affect: </br> ${integrationsItemsCount} integrations, ${processesItemsCount} processes, ${triggersItemsCount} triggers. <br/><br/> Do you want to proceed?`,
              connectedItems: connectedPITItems,
            },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result?.isConfirmed) {
              this.onSave(saveOnly, releaseOnly, releaseAndDeploy);
            }
          });
        } else {
          this.onSave(saveOnly, releaseOnly, releaseAndDeploy);
        }
      } else {
        this.onSave(saveOnly, releaseOnly, releaseAndDeploy);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=============== Get Attached SysLibs Status ===============*/
  getAttachedSysLibsStatus(saveOnly: boolean, releaseOnly: boolean, releaseAndDeploy: boolean) {
    const attachedSysLibIds = this.scriptData?.sysLibRefList || [];
    if (attachedSysLibIds?.length) {
      this.getAttachedSysLibSub = this.developmentService.getSysLibStatus(attachedSysLibIds).subscribe((res) => {
        if (res?.length) {
          const isUndeployedSysLibAttached = res.some((lib) => !lib?.IsDeployed);
          if (isUndeployedSysLibAttached) {
            this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `One or more connected system libraries for this script are not deployed. As a result, release and deploy operations cannot be performed. However, you can still release and create a version of this script.` });
          } else {
            // Validate System Library Content
            if (this.scriptData?.isSystemLibrary) {
              this.validateSysLibContent(saveOnly, releaseOnly, releaseAndDeploy);
            } else {
              this.validateScriptContent(saveOnly, releaseOnly, releaseAndDeploy);
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
    } else {
      // Validate System Library Content
      if (this.scriptData?.isSystemLibrary) {
        this.validateSysLibContent(saveOnly, releaseOnly, releaseAndDeploy);
      } else {
        this.validateScriptContent(saveOnly, releaseOnly, releaseAndDeploy);
      }
    }
  }

  /*=============== Update Dev Script ===============*/
  updateDevScript(saveOnly: boolean, releaseOnly: boolean, releaseAndDeploy: boolean) {
    if (releaseAndDeploy) {
      this.getAttachedSysLibsStatus(saveOnly, releaseOnly, releaseAndDeploy);
    } else {
      // Validate System Library Content
      if (this.scriptData?.isSystemLibrary) {
        this.validateSysLibContent(saveOnly, releaseOnly, releaseAndDeploy);
      } else {
        this.validateScriptContent(saveOnly, releaseOnly, releaseAndDeploy);
      }
    }
  }

  onSave(saveOnly: boolean, releaseOnly: boolean, releaseAndDeploy: boolean) {
    this.scriptPropertiesForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.scriptPropertiesForm.valid) {
      const script = this.scriptPropertiesForm.getRawValue();
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
          if (saveOnly) {
            if (this.scriptData?.isSystemLibrary) {
              this.saveSystemLibrary(saveOnly, releaseOnly, releaseAndDeploy, '', [], []);
            } else {
              this.saveScript(saveOnly, releaseOnly, releaseAndDeploy, '', [], []);
            }
          } else {
            this.releaseOrReleaseAndDeploy(saveOnly, releaseOnly, releaseAndDeploy, this.scriptData?.isSystemLibrary);
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

  saveScript(saveOnly: boolean, releaseOnly: boolean, releaseAndDeploy: boolean, note: string, sysLibIds: Array<string>, sysLibNames: Array<string>) {
    const script = this.scriptPropertiesForm.getRawValue();
    let sysLibIdsArr = [];
    let sysLibNamesArr = [];
    if (this.scriptData && this.scriptData?.sysLibRefList?.length || sysLibIds?.length) {
      sysLibIdsArr = [...new Set([...this.scriptData?.sysLibRefList, ...sysLibIds])];
      sysLibNamesArr = [...new Set([...this.scriptData?.sysLibRefNameList, ...sysLibNames])];
    }
    const updateScriptObj: CreateScriptDto = {
      id: Number(this.scriptData?.scriptId),
      description: script.description?.trim(),
      scriptModule: false,
      scriptName: script.name.trim(),
      updatedBy: this.currentUser.userName,
      connectable: script.connectable,
      deployedVersion: 0,
      thisDeployedVersion: false,
      language: "VBScript",
      order: 0,
      userDefined: this.scriptData?.userDefined,
      triggerScript: this.scriptData?.triggerScript,
      scriptContentsAsString: null,
      releaseOnly: releaseOnly,
      releaseAndDeploy: releaseAndDeploy,
      saveOnly: saveOnly,
      note: note,
      scriptType: this.scriptData?.userDefined ? 'userScript' : this.scriptData?.language === 'C#' ? 'adapter' : 'template',
      sysLibRefList: sysLibIdsArr,
      sysLibRefNameList: sysLibNamesArr,
      debugSeId: this.scriptData?.debugSeId,
      debugSeUrl: this.scriptData?.debugSeUrl,
      clientId: [`${this.scriptData?.tabId}`]
    };
    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;
    const workspaceId = (updateScriptObj?.scriptType === 'userScript') ? Number(this.scriptData?.workspaceId) : 0;
    this.saveScriptSub = this.developmentService.updateScript(workspaceId, updateScriptObj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `${this.scriptData?.scriptName} script updated successfully!` });
        const itemType = this.scriptData?.isSystemLibrary ? 'systemLibrary' : this.scriptData?.userDefined ? 'userScript' : 'template';
        if (saveOnly) {
          this.getDeployedScriptById(this.scriptData?.scriptId, itemType, (this.scriptData?.type === 'userScript' && this.scriptData?.workspaceId) ? this.scriptData?.workspaceId : 0, false, saveOnly, this.scriptData?.lockInfo);
        }
        if (releaseOnly || releaseAndDeploy) {
          this.unlock();
          this.scriptStateService.setActionPerformed(true);
        }
        // Below code is commented to avoid 'releaseAllocation' API call on Save Action
        // this.scriptStateService.setActionPerformed(true);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  saveSystemLibrary(saveOnly: boolean, releaseOnly: boolean, releaseAndDeploy: boolean, note: string, sysLibIds: Array<string>, sysLibNames: Array<string>) {
    const script = this.scriptPropertiesForm.getRawValue();
    let sysLibIdsArr = [];
    let sysLibNamesArr = [];
    if (this.scriptData && this.scriptData?.sysLibRefList?.length || sysLibIds?.length) {
      sysLibIdsArr = [...new Set([...this.scriptData?.sysLibRefList, ...sysLibIds])];
      sysLibNamesArr = [...new Set([...this.scriptData?.sysLibRefNameList, ...sysLibNames])];
    }
    const saveSysLibObj: CreateScriptDto = {
      id: Number(this.scriptData?.scriptId),
      description: script.description?.trim(),
      scriptModule: false,
      scriptName: script.name.trim(),
      updatedBy: this.currentUser.userName,
      connectable: script.connectable,
      deployedVersion: 0,
      thisDeployedVersion: false,
      language: "VBScript",
      order: 0,
      userDefined: false,
      triggerScript: false,
      scriptContentsAsString: null,
      releaseOnly: releaseOnly,
      releaseAndDeploy: releaseAndDeploy,
      saveOnly: saveOnly,
      note: note,
      scriptType: 'systemLibrary',
      sysLibRefList: sysLibIdsArr,
      sysLibRefNameList: sysLibNamesArr,
      debugSeId: this.scriptData?.debugSeId,
      debugSeUrl: this.scriptData?.debugSeUrl,
      clientId: [`${this.scriptData?.tabId}`]
    };

    const debugSeId = this.scriptData?.debugSeId;
    const debugSeUrl = this.scriptData?.debugSeUrl;

    this.saveSysLibSub = this.developmentService.updateSystemLib(Number(this.scriptData?.scriptId), saveSysLibObj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `${this.scriptData?.scriptName} script updated successfully!` });
        // this.getSysLibScriptById(this.scriptData?.scriptId);
        if (releaseOnly || releaseAndDeploy) {
          this.unlock();
          this.scriptStateService.setActionPerformed(true);
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

  releaseOrReleaseAndDeploy(saveOnly: boolean, releaseOnly: boolean, releaseAndDeploy: boolean, isSysLib: boolean) {
    const itemType = this.scriptData?.isSystemLibrary ? 'systemLibrary' : this.scriptData?.userDefined ? 'userScript' : 'template';
    this.getLatestVersionInfoSub = this.developmentService.getLatestVersionInfo(this.scriptData?.scriptId, itemType).subscribe((res) => {
      if (res) {
        const dialogRef = this.dialog.open(ReleaseNoteComponent, {
          width: "700px",
          maxHeight: "600px",
          data: {
            message: `Please enter release note`,
            title: releaseOnly ? `Release v.${res?.lastCreatedVersion + 1} Note` : `Release and deploy v.${res?.lastCreatedVersion + 1} Note`,
            scriptInfo: this.scriptData,
            isSysLib: isSysLib,
            saveOnly: saveOnly,
            releaseOnly: releaseOnly,
            releaseAndDeploy: releaseAndDeploy,
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            if (isSysLib) {
              this.saveSystemLibrary(saveOnly, releaseOnly, releaseAndDeploy, result?.note, [], []);
            } else {
              this.saveScript(saveOnly, releaseOnly, releaseAndDeploy, result?.note, [], []);
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

  /*============ Export Script ============*/
  exportScript() {
    const dialogRef = this.dialog.open(ExportScriptComponent, {
      width: "900px",
      maxHeight: '95vh',
      height: '95%',
      data: {
        ...this.scriptData,
        isIXUserScriptAccess: this.isUserHaveImportExportUserScriptPermission,
        isIXTemplateAndSysLibAccess: this.isImportExportTemplateAndSysLibPermission,
        isBreakUserScriptLockAccess: this.isBreakUserScriptLockPermission,
        isBreakTempAndSysLibLockAccess: this.isBreakTempAndSysLibLockPermission,
        isCURDTemplateAccess: this.isCURDTemplatePermission,
        isCURDSysLibAccess: this.isCURDSysLibPermission,
        isCURDUserScriptAccess: this.isCURDUserScriptPermission,
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isAction) {
        // Handle result if needed
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

  ngOnDestroy(): void {
    this.getWorkspacesSub.unsubscribe();
    this.getLockSub.unsubscribe();
    this.breakLockSub.unsubscribe();
    this.cancelLockSub.unsubscribe();
    this.getScriptLockInfoSub.unsubscribe();
    this.getAllocatedIdsSub.unsubscribe();
    this.saveSysLibSub.unsubscribe();
    this.saveScriptSub.unsubscribe();
    this.deleteSysLibScriptSub.unsubscribe();
    this.deleteScriptSub.unsubscribe();
    this.getSysLibConnectionSub.unsubscribe();
    this.getScriptByIdSub.unsubscribe();
    this.getDeployedScriptByIdSub.unsubscribe();
    this.getSysLibByIdSub.unsubscribe();
    this.getDeployedSysLibByIdSub.unsubscribe();
    this.exportScriptSub.unsubscribe();
    this.validateScriptContentSub.unsubscribe();
    this.validateSysLibScriptContentSub.unsubscribe();
    this.getVersionByIdSub.unsubscribe();
    this.getDebugParameterSub.unsubscribe();
    this.getAttachedSysLibSub.unsubscribe();
    this.getUserSettingDarkModeSub.unsubscribe();
  }
}