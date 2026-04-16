import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { Export, ExportedData, Workspaces } from '../../tools';
import { ToolsDataService } from '../../tools-data.service';
import { ToolsService } from '../../tools.service';
import { Subscription } from 'rxjs';
import { DevelopmentService } from 'src/app/development/development.service';
import { InformationComponent } from 'src/app/shared/components/information/information.component';

@Component({
  selector: 'app-import-workspace',
  templateUrl: './import-workspace.component.html',
  styleUrls: ['./import-workspace.component.scss']
})
export class ImportWorkspaceComponent implements OnInit, OnDestroy {
  stepOneImportWsForm: UntypedFormGroup;
  workspaces: Array<Workspaces>;
  defaultWorkspace: Workspaces;
  selectedWorkspace: Workspaces;
  selectedExportType: number;
  isTypeChanged: boolean = false;
  selectedImportFromId: string;
  overrideId: number;
  overwriteWithDeploy: boolean = false;
  toOverwrite: boolean = false;
  overrideItemsScriptsWithDeploy: boolean = false;
  overrideOption: string;
  fileName: string;
  parseWorkspace: any;
  isSummaryVisible = false;
  docByteArr: string;
  alertEnabledForProcesses: boolean;
  alertEnabledForIntegrations: boolean;
  alertEnabledForTriggers: boolean;
  currentUser: any = null;
  systemLibraries: Array<any> = [];

  exportTo = [
    { id: '3.3', name: 'TEIS v3.2 or v3.3' },
    // { id: '3.1', name: 'TEIS v3.0 or v3.1' },
    { id: '2.x', name: 'Upto TEIS v2.x' }
  ];
  exportType = [
    { id: 1, name: 'Complete export file' },
    { id: 2, name: 'Selected items' }
  ];
  override = [
    { id: 1, name: 'No override' },
    { id: 2, name: 'Override items - override scripts' },
    { id: 3, name: 'Override items with deploy - no override of scripts' },
    { id: 4, name: 'Override items and scripts with deploy' }
  ];

  validationMessages = {
    exportTo: {
      required: 'Export to is required',
    },
    workspace: {
      required: 'Workspace is required'
    },
    exportType: {
      required: 'Export type is required',
    },
    filePath: {
      required: 'File is required'
    },
    override: {
      required: 'Override is required'
    },
  };

  formErrors = {
    exportTo: '',
    workspace: '',
    exportType: '',
    filePath: '',
    override: ''
  };

  getWorkspacesSub = Subscription.EMPTY;
  getSysLibsSub = Subscription.EMPTY;

  constructor(
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private toolsService: ToolsService,
    private messageService: MessageService,
    private toolsDataService: ToolsDataService,
    private developmentService: DevelopmentService,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit(): void {
    this.getWorkspaces();
    this.getSysLibs();
    this.createStepOneForm();
    this.onChangeImportFrom(this.exportTo[0]?.id);
    this.onChangeExportType(this.exportType[0]?.id);
    this.onChangeOverrideOption(this.override[0]?.id);
  }

  /*============ On Cancelled Reset Step One Form ============*/
  resetStepOne() {
    this.stepOneImportWsForm.patchValue({
      exportTo: '3.3',
      workspace: Number(this.defaultWorkspace?.id),
      exportType: 1,
      filePath: '',
      alertEnabledForProcesses: true,
      alertEnabledForIntegrations: true,
      alertEnabledForTriggers: true,
      override: 1
    });
    this.onChangeImportFrom(this.exportTo[0]?.id);
    this.onChangeWorkspace(Number(this.defaultWorkspace?.id));
    this.onChangeExportType(this.exportType[0]?.id);
    this.onChangeOverrideOption(this.override[0]?.id);
    this.removeFile();
    this.toolsDataService.clearImportParseWorkspace();
  }
  /*============ END On Cancelled Reset Step One Form ============*/

  createStepOneForm() {
    this.stepOneImportWsForm = this.fb.group({
      exportTo: [{ value: '3.3', disabled: false }, {
        validators: [Validators.required]
      }],
      workspace: [{ value: Number(this.defaultWorkspace?.id), disabled: false }, {
        validators: [Validators.required]
      }],
      exportType: [{ value: 1, disabled: false }, {
        validators: [Validators.required]
      }],
      filePath: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      alertEnabledForProcesses: [{ value: true, disabled: false }, {
        validators: []
      }],
      alertEnabledForIntegrations: [{ value: true, disabled: false }, {
        validators: []
      }],
      alertEnabledForTriggers: [{ value: true, disabled: false }, {
        validators: []
      }],
      // attachedFilePath: [{ value: '', disabled: false }, {
      //   validators: []
      // }],
      override: [{ value: 1, disabled: false }, {
        validators: [Validators.required]
      }],
    });
    this.stepOneImportWsForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.stepOneImportWsForm);
      this.alertEnabledForProcesses = data?.alertEnabledForProcesses;
      this.alertEnabledForIntegrations = data?.alertEnabledForIntegrations;
      this.alertEnabledForTriggers = data?.alertEnabledForTriggers;
      this.sendFormDataToOtherComponent(
        this.selectedImportFromId,
        Number(this.selectedWorkspace?.id),
        this.selectedWorkspace?.name,
        this.selectedExportType,
        this.isTypeChanged,
        this.overrideId,
        this.overwriteWithDeploy,
        this.toOverwrite,
        this.overrideOption,
        this.overrideItemsScriptsWithDeploy,
        this.alertEnabledForProcesses,
        this.alertEnabledForIntegrations,
        this.alertEnabledForTriggers
      );
    });
  }

  /*============Check Form Validation and Display Messages============*/
  logValidationErrors(group: UntypedFormGroup = this.stepOneImportWsForm): void {
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
  /*============END Check Form Validation and Display Messages============*/

  /*============ Get Workspaces ============*/
  getWorkspaces() {
    let defaultWS = null;
    const accessWorkspacesArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;

    this.getWorkspacesSub = this.toolsService.getActiveWorkspaces().subscribe((res) => {

      if (res?.length && accessWorkspaces?.length) {
        // Filter out archived workspaces
        const workspacesArr = JSON.parse(JSON.stringify(res)).filter((x) => !x?.archived);
        accessWorkspaces.forEach((aws) => {
          workspacesArr.forEach((ws) => {
            if (Number(aws?.workspaceId) === Number(ws?.id)) {
              if (aws?.accessList.some((x) => x?.key === 'TLS_IX_WI')) {
                accessWorkspacesArr.push(ws);
              }
            }
          });
        });

        this.workspaces = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));

        if (this.workspaces?.length) {
          defaultWS = this.workspaces.find((x) => x?.defaultWorkspace);
          if (defaultWS) {
            this.defaultWorkspace = defaultWS;
            this.stepOneImportWsForm.get('workspace').patchValue(Number(defaultWS?.id));
            this.onChangeWorkspace(Number(defaultWS?.id));
          } else {
            this.defaultWorkspace = this.workspaces[0];
            this.stepOneImportWsForm.get('workspace').patchValue(Number(this.workspaces[0]?.id));
            this.onChangeWorkspace(Number(this.workspaces[0]?.id));
          }
        }
      }

      // if (res?.length) {
      //   // Filter out archived workspaces
      //   const workspacesArr = JSON.parse(JSON.stringify(res)).filter((x) => !x?.archived);
      //   this.workspaces = workspacesArr;
      //   if (this.workspaces?.length) {
      //     defaultWS = this.workspaces.find((x) => x?.defaultWorkspace);
      //     if (defaultWS) {
      //       this.defaultWorkspace = defaultWS;
      //       this.stepOneImportWsForm.get('workspace').patchValue(Number(defaultWS?.id));
      //       this.onChangeWorkspace(Number(defaultWS?.id));
      //     } else {
      //       this.defaultWorkspace = this.workspaces[0];
      //       this.stepOneImportWsForm.get('workspace').patchValue(Number(this.workspaces[0]?.id));
      //       this.onChangeWorkspace(Number(this.workspaces[0]?.id));
      //     }
      //   }
      // }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Get Workspaces ============*/

  /*============ Get System Libraries List ============*/
  getSysLibs() {
    this.getSysLibsSub = this.developmentService.getSystemLibraries().subscribe((res) => {
      const sysLibs = JSON.parse(JSON.stringify(res));
      if (sysLibs?.length) {
        this.systemLibraries = sysLibs;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Get System Libraries List ============*/

  /*============ On Select Export To ============*/
  onChangeImportFrom(importFromId: string) {
    this.selectedImportFromId = importFromId;
    this.removeFile();
    if (this.selectedImportFromId === '2.x') {
      this.stepOneImportWsForm.get('exportType').disable();
    } else {
      this.stepOneImportWsForm.get('exportType').enable();
    }
    // this.toolsService.sendSelectedImportedData({
    //   importFromId: this.selectedImportFromId,
    //   workspaceId: Number(this.selectedWorkspace?.id),
    //   workspaceName: this.selectedWorkspace?.name,
    //   allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
    //   typeId: this.selectedExportType,
    //   override: this.overrideId,
    //   overwriteWithDeploy: this.overwriteWithDeploy,
    //   toOverwrite: this.toOverwrite,
    //   overrideOption: this.overrideOption,
    //   alertEnabledForProcesses: this.alertEnabledForProcesses,
    //   alertEnabledForIntegrations: this.alertEnabledForIntegrations,
    //   alertEnabledForTriggers: this.alertEnabledForTriggers
    // });
    this.sendFormDataToOtherComponent(
      this.selectedImportFromId,
      Number(this.selectedWorkspace?.id),
      this.selectedWorkspace?.name,
      this.selectedExportType,
      this.isTypeChanged,
      this.overrideId,
      this.overwriteWithDeploy,
      this.toOverwrite,
      this.overrideOption,
      this.overrideItemsScriptsWithDeploy,
      this.alertEnabledForProcesses,
      this.alertEnabledForIntegrations,
      this.alertEnabledForTriggers
    );
  }
  /*============ END On Select Export To ============*/

  /*============ On Select Workspace ============*/
  onChangeWorkspace(workspaceId: number) {
    const workspace: Workspaces = this.workspaces.find(x => Number(x?.id) === Number(workspaceId));
    this.selectedWorkspace = workspace;
    // this.toolsService.sendSelectedImportedData({
    //   importFromId: this.selectedImportFromId,
    //   workspaceId: Number(this.selectedWorkspace?.id),
    //   workspaceName: this.selectedWorkspace?.name,
    //   allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
    //   typeId: this.selectedExportType,
    //   override: this.overrideId,
    //   overwriteWithDeploy: this.overwriteWithDeploy,
    //   toOverwrite: this.toOverwrite,
    //   overrideOption: this.overrideOption,
    //   alertEnabledForProcesses: false,
    //   alertEnabledForIntegrations: false,
    //   alertEnabledForTriggers: false
    // });
    this.sendFormDataToOtherComponent(
      this.selectedImportFromId,
      Number(this.selectedWorkspace?.id),
      this.selectedWorkspace?.name,
      this.selectedExportType,
      this.isTypeChanged,
      this.overrideId,
      this.overwriteWithDeploy,
      this.toOverwrite,
      this.overrideOption,
      this.overrideItemsScriptsWithDeploy,
      this.alertEnabledForProcesses,
      this.alertEnabledForIntegrations,
      this.alertEnabledForTriggers
    );
  }
  /*============ END On Select Workspace ============*/

  /*============ On Select Export Type ============*/
  onChangeExportType(exportTypeId: number) {
    this.selectedExportType = exportTypeId;
    this.isTypeChanged = true;
    // this.toolsService.sendSelectedImportedData({
    //   importFromId: this.selectedImportFromId,
    //   workspaceId: Number(this.selectedWorkspace?.id),
    //   workspaceName: this.selectedWorkspace?.name,
    //   allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
    //   typeId: this.selectedExportType,
    //   override: this.overrideId,
    //   overwriteWithDeploy: this.overwriteWithDeploy,
    //   toOverwrite: this.toOverwrite,
    //   overrideOption: this.overrideOption,
    //   alertEnabledForProcesses: false,
    //   alertEnabledForIntegrations: false,
    //   alertEnabledForTriggers: false
    // });
    this.sendFormDataToOtherComponent(
      this.selectedImportFromId,
      Number(this.selectedWorkspace?.id),
      this.selectedWorkspace?.name,
      this.selectedExportType,
      this.isTypeChanged,
      this.overrideId,
      this.overwriteWithDeploy,
      this.toOverwrite,
      this.overrideOption,
      this.overrideItemsScriptsWithDeploy,
      this.alertEnabledForProcesses,
      this.alertEnabledForIntegrations,
      this.alertEnabledForTriggers
    );
  }
  /*============ END On Select Export Type ============*/

  /*============ On Select Override Option ============*/
  onChangeOverrideOption(overrideId: number) {
    // this.removeFile();
    this.overrideId = overrideId;
    if (Number(overrideId) === 1) {
      this.overwriteWithDeploy = false;
      this.toOverwrite = false;
      this.overrideOption = this.override.find(x => Number(x?.id) === Number(overrideId))?.name;
      this.overrideItemsScriptsWithDeploy = false;
    }
    if (Number(overrideId) === 2) {
      this.overwriteWithDeploy = false;
      this.toOverwrite = true;
      this.overrideOption = this.override.find(x => Number(x?.id) === Number(overrideId))?.name;
      this.overrideItemsScriptsWithDeploy = false;
    }
    if (Number(overrideId) === 3) {
      this.overwriteWithDeploy = true;
      this.toOverwrite = true;
      this.overrideOption = this.override.find(x => Number(x?.id) === Number(overrideId))?.name;
      this.overrideItemsScriptsWithDeploy = false;
    }
    if (Number(overrideId) === 4) {
      this.overwriteWithDeploy = true;
      this.toOverwrite = true;
      this.overrideOption = this.override.find(x => Number(x?.id) === Number(overrideId))?.name;
      this.overrideItemsScriptsWithDeploy = true;
    }
    // this.toolsService.sendSelectedImportedData({
    //   importFromId: this.selectedImportFromId,
    //   workspaceId: Number(this.selectedWorkspace?.id),
    //   workspaceName: this.selectedWorkspace?.name,
    //   allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
    //   typeId: this.selectedExportType,
    //   override: this.overrideId,
    //   overwriteWithDeploy: this.overwriteWithDeploy,
    //   toOverwrite: this.toOverwrite,
    //   overrideOption: this.overrideOption,
    //   alertEnabledForProcesses: false,
    //   alertEnabledForIntegrations: false,
    //   alertEnabledForTriggers: false
    // });
    this.sendFormDataToOtherComponent(
      this.selectedImportFromId,
      Number(this.selectedWorkspace?.id),
      this.selectedWorkspace?.name,
      this.selectedExportType,
      this.isTypeChanged,
      this.overrideId,
      this.overwriteWithDeploy,
      this.toOverwrite,
      this.overrideOption,
      this.overrideItemsScriptsWithDeploy,
      this.alertEnabledForProcesses,
      this.alertEnabledForIntegrations,
      this.alertEnabledForTriggers
    );
  }
  /*============ END On Select Override Option ============*/

  /*============ Upload File ============*/
  uploadFile(event, fileType) {
    let fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const fileArr = file.name.split('.');
      if (fileArr[fileArr?.length - 1] !== fileType) {
        this.stepOneImportWsForm.get('filePath').reset();
        if (fileType === 'expx') {
          this.messageService.add({ key: 'toolsErrorKey', severity: 'success', summary: '', detail: `Invalid file format. Please upload valid TEIS v3.2 or v3.3 file.` });
        }
        if (fileType === 'exp') {
          this.messageService.add({ key: 'toolsErrorKey', severity: 'success', summary: '', detail: `Invalid file format. Please upload valid TEIS v2.x file.` });
        }
        return false;
      }
      this.fileName = fileList[0]?.name;
      this.handleInputChange(file); //turn into base64
    }
    else {
      alert("No file selected");
    }
  }

  handleInputChange(files) {
    var file = files;
    var pattern = /-*/;
    var reader = new FileReader();
    // if (!file.type.match(pattern)) {
    //   alert('invalid format');
    //   return;
    // }
    reader.onloadend = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e) {
    let reader = e.target;
    var base64result = reader.result.substr(reader.result.indexOf(',') + 1);
    const docByteArray = base64result;
    this.docByteArr = docByteArray;
    if (this.selectedImportFromId !== '2.x') {
      this.getWorkspaceSummary(docByteArray);
    }
  }

  getDocDetails() {
    return {
      fileName: this.fileName,
      byteArr: this.docByteArr
    };
  }

  removeFile() {
    this.fileName = '';
    this.isSummaryVisible = false;
    this.parseWorkspace = null;
    this.stepOneImportWsForm.get('filePath').reset();
  }

  /*=========== Get Workspace Summary ===========*/
  getWorkspaceSummary(byteStr: string) {
    const exportObj: ExportedData = {
      applicationVersion: this.selectedImportFromId,
      workspaceId: Number(this.selectedWorkspace?.id),
      workspaceName: this.selectedWorkspace?.name,
      overwriteWithDeploy: this.overwriteWithDeploy,
      overrideOption: this.overrideOption,
      toOverwrite: this.toOverwrite,
      overrideItemsScriptsWithDeploy: this.overrideItemsScriptsWithDeploy,
      encryptedContents: byteStr
    };
    this.toolsService.parseWorkspace(exportObj).subscribe(res => {
      if (res) {
        this.isSummaryVisible = true;
        this.parseWorkspace = res;

        this.toolsDataService.storeImportParseWorkspace(this.parseWorkspace);
        if (this.parseWorkspace?.teisVersion === '3.2') {
          this.parseWorkspace.teisVersion = '3.3';
        }

        if (this.parseWorkspace?.teisVersion === '3.0') {
          this.parseWorkspace.teisVersion = '3.1';
        }

        if (this.parseWorkspace?.teisVersion !== this.selectedImportFromId) {
          this.removeFile();
          this.messageService.add({ key: 'toolsInfoKey', severity: 'success', summary: '', detail: 'Selected file version is mismatched with import versions. Please select the correct version of file.' });
        }

        if (this.parseWorkspace?.importContentDto?.systemLibrary) {
          let result = null;
          const sysLibsArr = this.parseWorkspace?.importContentDto?.systemLibrary.split(',').map(item => item.trim());
          const isMatched = sysLibsArr.every(str =>
            this.systemLibraries.some(obj => obj.scriptName === str)
          );
          // Extract names from arr2
          const arr2Names = this.systemLibraries.map(item => item.scriptName);
          // Find missing names
          const missing = sysLibsArr.filter(name => !arr2Names.includes(name));

          if (isMatched) {
            result = {
              isMatched: true,
              missingSysLibs: []
            };
          } else {
            result = {
              isMatched: isMatched,
              missingSysLibs: missing
            };
          }

          if (!result.isMatched) {
            this.dialog.open(InformationComponent, {
              width: '700px',
              data: {
                message: '',
                module: 'ImportWorkspace',
                isOkButton: true,
                isCancelButton: false,
                data: result
              }
            }).afterClosed().subscribe((res) => {
              if (res?.isConfirmed) {

              } else {

              }
            });
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
  /*=========== END Get Workspace Summary ===========*/

  /*=========== Validation for Next Step ===========*/
  getValidateStepOne() {
    this.stepOneImportWsForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.stepOneImportWsForm?.valid) {
      return true;
    } else {
      return false;
    }
  }
  /*=========== END Validation for Next Step ===========*/

  /*============= Send Workspace Current Form To Other Component ============*/
  sendFormDataToOtherComponent(
    importFromId: string,
    workspaceId: number,
    workspaceName: string,
    typeId: number,
    isTypeChanged: boolean,
    override: number,
    overwriteWithDeploy: boolean,
    toOverwrite: boolean,
    overrideOption: string,
    overrideItemsScriptsWithDeploy: boolean,
    alertEnabledForProcesses: boolean,
    alertEnabledForIntegrations: boolean,
    alertEnabledForTriggers: boolean
  ) {
    this.toolsService.sendSelectedImportedData({
      importFromId: importFromId,
      workspaceId: Number(workspaceId),
      workspaceName: workspaceName,
      allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
      typeId: Number(typeId),
      isTypeChanged: isTypeChanged,
      override: override,
      overwriteWithDeploy: overwriteWithDeploy,
      toOverwrite: toOverwrite,
      overrideOption: overrideOption,
      overrideItemsScriptsWithDeploy: overrideItemsScriptsWithDeploy,
      alertEnabledForProcesses: alertEnabledForProcesses,
      alertEnabledForIntegrations: alertEnabledForIntegrations,
      alertEnabledForTriggers: alertEnabledForTriggers
    });
  }
  /*============= END Send Workspace Current Form To Other Component ============*/

  ngOnDestroy(): void {
    this.getWorkspacesSub.unsubscribe();
  }
}
