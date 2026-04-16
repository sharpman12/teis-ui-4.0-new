import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { DevelopmentService } from '../../development.service';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Constants } from 'src/app/shared/components/constants';
import { Workspace } from 'src/app/application-integration/app-integration/appintegration';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-import-script',
  templateUrl: './import-script.component.html',
  styleUrls: ['./import-script.component.scss']
})
export class ImportScriptComponent implements OnInit, OnDestroy {
  fileName: string = '';
  importScriptForm: UntypedFormGroup;
  currentUser: any = null;
  workspaces: Array<Workspace> = [];
  isUserScript: boolean = false;
  importedFile: string = '';
  scriptEngineGroups: Array<any> = [];
  scriptEngines: Array<any> = [];

  validationMessages = {
    filePath: {
      required: "File is required",
    },
    workspace: {
      required: "Workspace is required",
    },
    scriptEngineGroup: {
      required: "Script engine group is required",
    },
    scriptEngine: {
      required: "Script engine is required",
    }
  };

  formErrors = {
    filePath: '',
    workspace: '',
    scriptEngineGroup: '',
    scriptEngine: ''
  };

  private getWorkspacesSub = Subscription.EMPTY;
  private importScriptSub = Subscription.EMPTY;
  private getScriptEngineInfoSub = Subscription.EMPTY;

  constructor(
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialogRef: MatDialogRef<ImportScriptComponent>,
    private messageService: MessageService,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    this.getScriptEnginesInfo();
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.importScriptForm = this.fb.group({
      filePath: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      workspace: [{ value: '', disabled: false }, {
        validators: []
      }],
      override: [{ value: false, disabled: false }, {
        validators: []
      }],
      scriptEngineGroup: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      scriptEngine: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
    });

    this.importScriptForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.importScriptForm);
    });
  }

  logValidationErrors(group: UntypedFormGroup = this.importScriptForm): void {
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

  /*============= Get Script Engines Info =============*/
  getScriptEnginesInfo(): void {
    this.getScriptEngineInfoSub = this.developmentService.getScriptEngineInfo().subscribe((res) => {
      if (res?.length) {
        this.scriptEngineGroups = res;
        this.importScriptForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.scriptEngineGroupId);
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
    const formValues = this.importScriptForm.getRawValue();
    const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValues?.scriptEngineGroup);
    if (selectedGroup) {
      this.scriptEngines = selectedGroup?.scriptEnginesDetails || [];
      this.importScriptForm.get('scriptEngine').patchValue(this.scriptEngines[0]?.scriptEngineId);
    }
  }

  removeFile() {
    this.isUserScript = false;
    this.fileName = '';
    this.importScriptForm.get('filePath').reset();
    this.importScriptForm.get('workspace').clearValidators();
    this.importScriptForm.get('workspace').updateValueAndValidity();
  }

  /*============ Upload File ============*/
  onFileSelected(event: any): void {
    const files: FileList = event.target.files;

    Array.from(files).forEach((file) => {
      // Check if the file is a .basx, .tplx, or .syslib file
      if (file && (file.name.endsWith('.basx') || file.name.endsWith('.tplx') || file.name.endsWith('.syslibx'))) {

        const reader = new FileReader();
        reader.onload = () => {
          const xmlContent = reader.result as string;
          this.fileName = file.name;

          // Call API with XML content
          // this.sendXmlToApi(file.name, xmlContent);
          this.importedFile = xmlContent;
        };
        reader.readAsText(file);

        if (file.name.endsWith('.basx')) {
          // Call API to get workspaces for user scripts
          this.getWorkspacesByUser();
          this.isUserScript = true;
          this.importScriptForm.get('workspace').addValidators([
            Validators.required
          ]);
          this.importScriptForm.get('workspace').updateValueAndValidity();
        } else {
          this.isUserScript = false;
          this.importScriptForm.get('workspace').clearValidators();
          this.importScriptForm.get('workspace').updateValueAndValidity();
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
              if (aws?.accessList.some((x) => x?.key === 'DEV_IX_USCRT')) {
                accessWorkspacesArr.push(ws);
              }
            }
          });
        });

        this.workspaces = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));

        if (this.workspaces.length > 0) {
          const defaultWorkspace = this.workspaces.find(x => x?.defaultWorkspace);
          if (defaultWorkspace) {
            this.importScriptForm.get('workspace').patchValue(defaultWorkspace?.id);
          } else {
            this.importScriptForm.get('workspace').patchValue(this.workspaces[0]?.id);
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

  validateAccess() {
    let isValidAccess = false;
    if (this.currentUser?.superAdminUser) {
      isValidAccess = true;
    } else if (this.currentUser?.adminUser) {
      if (this.fileName.endsWith('.basx')) {
        isValidAccess = true;
      } else if (this.fileName.endsWith('.tplx') || this.fileName.endsWith('.syslibx')) {
        isValidAccess = false;
      }
    } else {
      if (this.fileName.endsWith('.basx')) {
        isValidAccess = true;
      } else if (this.fileName.endsWith('.tplx') || this.fileName.endsWith('.syslibx')) {
        isValidAccess = false;
      }
    }
    return isValidAccess;
  }

  importScript() {
    this.importScriptForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.importScriptForm.valid) {
      const formData = this.importScriptForm.value;
      const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formData?.scriptEngineGroup);
      const selectedScriptEngine = this.scriptEngines.find(x => x.scriptEngineId === formData?.scriptEngine);
      if (this.validateAccess()) {
        let wsId = '0';
        if (this.fileName.endsWith('.basx')) {
          wsId = formData?.workspace;
        } else if (this.fileName.endsWith('.tplx')) {
          wsId = '0';
        } else if (this.fileName.endsWith('.syslibx')) {
          wsId = '0';
        }
        this.importScriptSub = this.developmentService.importScript(wsId, formData?.override, this.importedFile).subscribe((res) => {
          if (res) {
            const importedScriptRes = JSON.parse(JSON.stringify(res));
            importedScriptRes.workspaceId = formData?.workspace;
            importedScriptRes.debugSeId = selectedScriptEngine?.scriptEngineId;
            importedScriptRes.debugSeName = selectedScriptEngine?.scriptEngineKey;
            importedScriptRes.debugSeUrl = selectedScriptEngine?.debugSeUrl;
            importedScriptRes.scriptEngineGroupId = selectedGroup?.scriptEngineGroupId;
            importedScriptRes.scriptEngineGroupName = selectedGroup?.scriptEngineGroupName;

            if (this.fileName.endsWith('.basx')) {
              importedScriptRes.scriptType = 'userScript';
            } else if (this.fileName.endsWith('.tplx')) {
              importedScriptRes.scriptType = 'template';
            } else if (this.fileName.endsWith('.syslibx')) {
              importedScriptRes.scriptType = 'systemLibrary';
            }
            this.messageService.add({ key: 'devSuccessKey', severity: 'success', summary: '', detail: `Script imported successfully!` });
            this.dialogRef.close({
              isImport: true,
              data: importedScriptRes
            });
          }
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
      } else {
        let scriptType = '';
        if (this.fileName.endsWith('.basx')) {
          scriptType = 'user script';
        } else if (this.fileName.endsWith('.tplx')) {
          scriptType = 'template';
        } else if (this.fileName.endsWith('.syslibx')) {
          scriptType = 'system library';
        }
        this.messageService.add({ key: 'devInfoKey', severity: 'info', summary: '', detail: `You do not have permission to import this ${scriptType} script.` });
      }
    }
  }

  onClose(): void {
    this.dialogRef.close({
      isImport: false,
      data: null
    });
  }

  ngOnDestroy(): void {
    this.getWorkspacesSub.unsubscribe();
    this.importScriptSub.unsubscribe();
    this.getScriptEngineInfoSub.unsubscribe();
  }
}