import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, UntypedFormArray, UntypedFormBuilder, FormControl, FormArray, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { Constants } from 'src/app/shared/components/constants';
import { CurrentParametersComponent } from '../current-parameters/current-parameters.component';
import { TasksManagementService } from '../tasks-management/tasks-management.service';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { Subscription } from 'rxjs';
import { DevelopmentService } from 'src/app/development/development.service';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { uniqueNameValidator } from 'src/app/shared/validation/unique-name-validator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-restart-task',
  templateUrl: './restart-task.component.html',
  styleUrls: ['./restart-task.component.scss']
})
export class RestartTaskComponent implements OnInit, OnDestroy {
  selectedFile: any;
  isCheck = false;
  sellersPermitFile: File;
  sellersPermitString: any;
  docByteArray: any;
  restartParamForm: UntypedFormGroup;
  parametersForm: UntypedFormGroup;
  otherParametersForm: UntypedFormGroup;
  parametersArr = [];
  fileName: string = '';
  selectedFilesArr = [];
  taskParams = [];
  isChangableColShow = false;
  isOtherColShow = false;

  // Declare height and width variables
  scrHeight: any;
  scrWidth: any;
  isBtnShow = true;
  changeableParamsArr = [];
  removedParams = [];
  scriptEngineGroups: Array<any> = [];
  scriptEngines: Array<any> = [];
  debugSeStatus: number = 1;
  currentUser: any = null;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
  }

  validationMessages = {
    scriptEngineGroup: {
      required: "Script engine group is required",
    },
    scriptEngine: {
      required: "Script engine is required",
    }
  };

  formErrors = {
    scriptEngineGroup: '',
    scriptEngine: ''
  };

  private getStartTaskParamsSub = Subscription.EMPTY;
  private getRestartTaskParamsSub = Subscription.EMPTY;
  private getRecentFilesSub = Subscription.EMPTY;
  private getScriptEngineInfoSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<RestartTaskComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private tasksManagementService: TasksManagementService,
    private messageService: MessageService,
    private encryptDecryptService: EncryptDecryptService,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
  ) {
    dialogRef.disableClose = true;
    if (dialogData?.isStart) {
      this.getStartTaskParams();
    } else {
      this.getRestartTaskParams();
    }
    if (dialogData?.isInteractive) {
      this.getScriptEnginesInfo();
    }
    this.getScreenSize();
    if (this.scrWidth <= 760) {
      this.isChangableColShow = true;
      this.isOtherColShow = true;
      this.isBtnShow = false;
    }
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
  }

  ngOnInit(): void {
    this.createForm();
    this.createRestartParamForm();
  }

  toggleColumn(value: string) {
    if (value === 'CHANGEABLE') {
      this.isChangableColShow = !this.isChangableColShow;
    }
    if (value === 'OTHER') {
      this.isOtherColShow = !this.isOtherColShow;
    }
  }

  /*================== Create Form =================*/
  createRestartParamForm(): void {
    this.restartParamForm = this.fb.group({
      scriptEngineGroup: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      scriptEngine: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
    });

    this.restartParamForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.restartParamForm);
    });
  }

  createForm(): void {
    this.parametersForm = this.fb.group({
      currentParameter: this.fb.array([
        this.addParameters(false)
      ], uniqueNameValidator())
    });

    this.otherParametersForm = this.fb.group({
      otherParameter: this.fb.array([
        this.addParameters(false)
      ])
    });
  }
  /*================== END Create Form =================*/

  logValidationErrors(group: UntypedFormGroup = this.restartParamForm): void {
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
        if (this.dialogData?.item?.scriptEngineGroup) {
          this.restartParamForm.get('scriptEngineGroup').patchValue(this.dialogData?.item?.scriptEngineGroup);
        } else {
          this.restartParamForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.scriptEngineGroupId);
        }
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
    const formValues = this.restartParamForm.getRawValue();
    const selectedGroup = this.scriptEngineGroups.find(x => x.scriptEngineGroupId === formValues?.scriptEngineGroup);
    if (selectedGroup) {
      this.scriptEngines = selectedGroup?.scriptEnginesDetails || [];
      this.restartParamForm.get('scriptEngine').patchValue(this.scriptEngines[0]?.scriptEngineId);
      this.onChangeDebugSE();
    }
  }

  onChangeDebugSE() {
    const formValues = this.restartParamForm.getRawValue();
    const selectedScriptEngine = this.scriptEngines.find(x => x.scriptEngineId === formValues?.scriptEngine);
    this.debugSeStatus = selectedScriptEngine?.debugSeStatus;
  }

  /*=============== Get Restart Task Parameters ===============*/
  getRestartTaskParams() {
    this.changeableParamsArr = [];
    const taskId = this.dialogData?.taskId;
    this.getRestartTaskParamsSub = this.tasksManagementService.getRestartTaskParams(taskId).subscribe((res) => {
      const changeableParams = [];
      const otherParams = [];
      if (res?.length) {
        if (this.dialogData?.scriptList?.length) {
          this.dialogData?.scriptList.forEach((script, index) => {
            if (script?.scriptParameterDataList?.length) {
              script?.scriptParameterDataList.forEach(param => {
                res.forEach((item) => {
                  if (param?.parameterName === item?.name) {
                    if (param?.securityLevel.toLowerCase() === 'high' && item?.securityLevel.toLowerCase() === 'low') {
                      item.securityLevel = param?.securityLevel;
                      item.value = this.encryptDecryptService.encrypt(item?.value);
                    } else if (param?.securityLevel.toLowerCase() === 'medium' && item?.securityLevel.toLowerCase() === 'low') {
                      item.securityLevel = param?.securityLevel;
                      item.value = this.encryptDecryptService.encrypt(item?.value);
                    } else if (param?.securityLevel.toLowerCase() === 'high' && item?.securityLevel.toLowerCase() === 'medium') {
                      item.securityLevel = param?.securityLevel;
                      item.value = this.encryptDecryptService.encrypt(item?.value);
                    } else if (param?.securityLevel.toLowerCase() === 'low' && item?.securityLevel.toLowerCase() === 'medium') {
                      item.securityLevel = param?.securityLevel;
                      item.value = this.encryptDecryptService.decrypt(item?.value);
                    }
                  }
                });
              });
            }
          });
        }
        res.forEach(x => {
          if (x?.securityLevel === 'high' || x?.securityLevel === 'medium') {
            if (x.hasOwnProperty('value') && x?.value) {
              x.value = this.encryptDecryptService.decrypt(x?.value);
            }
          }
        });
        this.taskParams = res;
        res.forEach(item => {
          if (item?.originType === 'Ordinary') {
            changeableParams.push(item);
          }
          if (item?.originType === 'System') {
            otherParams.push(item);
          }
        });
      }
      if (changeableParams?.length) {
        this.changeableParamsArr = changeableParams;
        const currentParameterObj = {
          isDataType: true,
          isSource: true,
          isName: false,
          isValue: false
        };
        this.parametersForm.setControl('currentParameter', this.setExistingParamerters(changeableParams, currentParameterObj));
      }
      if (otherParams?.length) {
        const otherParameterObj = {
          isDataType: true,
          isSource: true,
          isName: true,
          isValue: true
        };
        this.otherParametersForm.setControl('otherParameter', this.setExistingParamerters(otherParams, otherParameterObj));
      }
      this.getRecentInputFile();
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=============== END Get Restart Task Parameters ===============*/

  /*=============== Get Start Task Parameters ===============*/
  getStartTaskParams() {
    this.changeableParamsArr = [];
    const itemId = this.dialogData?.itemId;
    this.getStartTaskParamsSub = this.tasksManagementService.getStartTaskParams(itemId).subscribe((res) => {
      const changeableParams = [];
      const otherParams = [];
      if (res?.length) {
        if (this.dialogData?.item?.scriptList?.length) {
          this.dialogData?.item?.scriptList.forEach((script, index) => {
            if (script?.scriptParameterDataList?.length) {
              script?.scriptParameterDataList.forEach((param) => {
                res.forEach((item) => {
                  if (param?.parameterName === item?.name) {
                    if (param?.securityLevel.toLowerCase() === 'high' && item?.securityLevel.toLowerCase() === 'low') {
                      item.securityLevel = param?.securityLevel;
                      item.value = this.encryptDecryptService.encrypt(item?.value);
                    } else if (param?.securityLevel.toLowerCase() === 'medium' && item?.securityLevel.toLowerCase() === 'low') {
                      item.securityLevel = param?.securityLevel;
                      item.value = this.encryptDecryptService.encrypt(item?.value);
                    } else if (param?.securityLevel.toLowerCase() === 'high' && item?.securityLevel.toLowerCase() === 'medium') {
                      item.securityLevel = param?.securityLevel;
                      const decryptedValue = this.encryptDecryptService.decrypt(item?.value);
                      item.value = this.encryptDecryptService.encrypt(decryptedValue);
                    } else if (param?.securityLevel.toLowerCase() === 'low' && item?.securityLevel.toLowerCase() === 'medium') {
                      item.securityLevel = param?.securityLevel;
                      item.value = this.encryptDecryptService.decrypt(item?.value);
                    }
                  }
                });
              });
            }
          });
        }
        res.forEach(x => {
          x.securityLevel = x?.securityLevel ? x?.securityLevel.toLowerCase() : x?.securityLevel;
          if (x?.securityLevel === 'high' || x?.securityLevel === 'medium') {
            if (x.hasOwnProperty('value') && x?.value) {
              x.value = this.encryptDecryptService.decrypt(x?.value);
            }
          }
        });
        this.taskParams = res;
        res.forEach(item => {
          if (item?.originType === 'Ordinary') {
            changeableParams.push(item);
          }
          if (item?.originType === 'System') {
            otherParams.push(item);
          }
        });
      }
      if (changeableParams?.length) {
        this.changeableParamsArr = changeableParams;
        const currentParameterObj = {
          isDataType: true,
          isSource: true,
          isName: false,
          isValue: false
        };
        this.parametersForm.setControl('currentParameter', this.setExistingParamerters(changeableParams, currentParameterObj));
      }
      if (otherParams?.length) {
        const otherParameterObj = {
          isDataType: true,
          isSource: true,
          isName: true,
          isValue: true
        };
        this.otherParametersForm.setControl('otherParameter', this.setExistingParamerters(otherParams, otherParameterObj));
      }
      this.getRecentInputFile();
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*================== Add More Parameters =================*/
  addParameters(additionalParam: boolean): UntypedFormGroup {
    return this.fb.group({
      dataType: [{ value: '', disabled: true }],
      source: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: false }],
      value: [{ value: '', disabled: false }],
      probableValues: [{ value: [], disabled: false }],
      paramType: [{ value: '', disabled: false }],
      securityLevel: [{ value: '', disabled: false }],
      isNewParam: [{ value: additionalParam, disabled: false }],
    });
  }

  addMoreParameters(): void {
    (<UntypedFormArray>this.parametersForm.get('currentParameter')).push(this.addParameters(true));
  }
  /*================== END Add More Parameters =================*/

  addInputFile(fileName: string) {
    const changeableFormValue = this.parametersForm.getRawValue().currentParameter;
    const otherFormValue = this.otherParametersForm.getRawValue().otherParameter;
    const taskParameters = changeableFormValue.concat(otherFormValue);
    let isInputFile = false;
    let rowIndex;
    if (taskParameters?.length) {
      taskParameters.forEach((item, i, arr) => {
        if (item?.name === 'InputFile') {
          isInputFile = true;
          rowIndex = i;
        }
      });
    }
    if (isInputFile) {
      // (<FormArray>this.parametersForm.get('currentParameter')).removeAt(rowIndex);
      ((this.parametersForm.get('currentParameter') as UntypedFormArray).at(rowIndex) as UntypedFormGroup).get('value').patchValue(fileName);
    } else {
      (<UntypedFormArray>this.parametersForm.get('currentParameter')).push(
        this.fb.group({
          dataType: [{ value: 'String', disabled: true }],
          source: [{ value: 'Application', disabled: true }],
          name: [{ value: 'InputFile', disabled: false }],
          value: [{ value: fileName, disabled: false }],
          probableValues: [{ value: [], disabled: false }],
          paramType: [{ value: '', disabled: false }],
          securityLevel: [{ value: '', disabled: false }],
          isNewParam: [{ value: false, disabled: false }],
        })
      );
    }
  }

  onChange() {
    if (this.fileName !== '') {
      this.addInputFile(this.fileName);
    }
    if (this.fileName === '') {
      let index;
      (<UntypedFormArray>this.parametersForm.get('currentParameter'))?.value.forEach((item, i, arr) => {
        if (item?.name === 'InputFile') {
          index = i;
          this.removeParameter(index);
        }
      });
      // this.removeParameter(index);
    }
  }

  /*================== Set Existing Parameters =================*/
  setExistingParamerters(parameters: any[], isCtrlDisabled: any): UntypedFormArray {
    if (parameters?.length) {
      const paramsArr = parameters.some(o => o.name === "CurrentConfig") && !(this.dialogData?.item?.configData?.length > 0) ? parameters.filter(o => o.name !== "CurrentConfig") : parameters;

      const formArray = new UntypedFormArray([], uniqueNameValidator(true));
      let securityLevel;
      paramsArr.forEach(p => {
        if (p.securityLevel) {
          securityLevel = p.securityLevel.toLowerCase();
        } else {
          securityLevel = p.securityLevel;
        }
        formArray.push(this.fb.group({
          dataType: [{ value: p.dataType, disabled: isCtrlDisabled.isDataType }],
          source: [{ value: p.source, disabled: isCtrlDisabled.isSource }],
          name: [{ value: p.name, disabled: isCtrlDisabled.isName }],
          value: [{ value: p.value, disabled: isCtrlDisabled.isValue }],
          probableValues: [{ value: p.probableValues, disabled: false }],
          paramType: [{ value: p.type, disabled: false }],
          securityLevel: [{ value: securityLevel, disabled: false }],
          isNewParam: [{ value: false, disabled: false }],
        }));
      });
      return formArray;
    }
  }
  /*================== Set Existing Parameters =================*/

  /*================== Remove Parameters =================*/
  removeParameter(i: number) {
    (<UntypedFormArray>this.parametersForm.get('currentParameter'))?.value.forEach((item, index, arr) => {
      if (index === i) {
        item.securityLevel = 'Low';
        this.removedParams.push(item);
      }
    });
    (<UntypedFormArray>this.parametersForm.get('currentParameter')).removeAt(i);
  }
  /*================== END Remove Parameters =================*/

  /*============= Get Input File =============*/
  getRecentInputFile() {
    // Change Get Recent Files API Jira TEI-5057
    let isInputFile = false;
    let matchedFile = '';
    let fileName = '';
    this.getRecentFilesSub = this.tasksManagementService.getRecentFiles('AI', 'FilePath', 'RecentFile').subscribe((res) => {
      if (res?.length) {
        this.changeableParamsArr.forEach((item) => {
          if (item?.name === 'InputFile') {
            isInputFile = true;
            fileName = item?.value;
          }
        });
        if (isInputFile) {
          matchedFile = res.find((item) => item === fileName);
          if (!matchedFile) {
            res.push(fileName);
          }
          this.fileName = res.find(item => item === fileName);
        } else {
          this.fileName = '';
        }
        this.selectedFilesArr = res;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
    // const currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
    // const userDto = {
    //   id: currentUser?.id,
    //   instanceIdentity: currentUser?.instanceIdentity
    // };
    // let isInputFile = false;
    // let matchedFile = '';
    // let fileName = '';
    // this.tasksManagementService.getRecentInputFilePaths(userDto).subscribe(res => {
    //   if (res?.length) {
    //     this.changeableParamsArr.forEach(item => {
    //       if (item?.name === 'InputFile') {
    //         isInputFile = true;
    //         fileName = item?.value;
    //       }
    //     });
    //     if (isInputFile) {
    //       matchedFile = res.filter(item => item === fileName);
    //       if (!matchedFile?.length) {
    //         res.push(fileName);
    //       }
    //       this.fileName = res.filter(item => item === fileName).toString();
    //     } else {
    //       this.fileName = '';
    //     }
    //     this.selectedFilesArr = res;
    //   }
    // }, (err: HttpErrorResponse) => {
    //   if (err.error instanceof Error) {
    //     // handle client side error here
    //   } else {
    //     // handle server side error here
    //   }
    // });
  }

  /*============== Cancel Request ===============*/
  onCancel() {
    this.dialogRef.close(null);
  }
  /*============== END Cancel Request ===============*/

  validateCurrentScriptValue() {
    const changeableFormValue = this.parametersForm.getRawValue()?.currentParameter;
    const currentScriptValue = changeableFormValue?.find((item: any) => item.name === 'CurrentScript');
    if (Number(currentScriptValue?.value) > Number(this.dialogData?.item?.scriptList?.length) || Number(currentScriptValue?.value) <= 0) {
      if (Number(this.dialogData?.item?.scriptList?.length)) {
        this.messageService.add({ key: 'appInfoMsgKey', severity: 'error', summary: '', detail: `The current script number you entered is out of range.`, life: 5000 });
      } else {
        this.messageService.add({ key: 'appInfoMsgKey', severity: 'error', summary: '', detail: `The current script number you entered is out of range. Please enter a valid number between 1 and ${this.dialogData?.item?.scriptList?.length}.`, life: 5000 });
      }
      return false;
    } else {
      return true;
    }
  }

  validateCurrentConfigValue() {
    const changeableFormValue = this.parametersForm.getRawValue()?.currentParameter;
    if (this.dialogData?.itemType.toLowerCase() === 'trigger') {
      const currentConfigValue = changeableFormValue?.find((item: any) => item.name === 'CurrentConfig');
      if (currentConfigValue && currentConfigValue?.value) {
        if (Number(currentConfigValue?.value) > Number(this.dialogData?.item?.configData?.length) || Number(currentConfigValue?.value) <= 0) {
          if (Number(this.dialogData?.item?.configData?.length) === 1) {
            this.messageService.add({ key: 'appInfoMsgKey', severity: 'error', summary: '', detail: `The current config number you entered is out of range.`, life: 5000 });
          } else {
            this.messageService.add({ key: 'appInfoMsgKey', severity: 'error', summary: '', detail: `The current config number you entered is out of range. Please enter a valid number between 1 and ${this.dialogData?.item?.configData?.length}.`, life: 5000 });
          }
          return false;
        } else {
          return true;
        }
      } else {
        return true; // If CurrentConfig is not present, return true
      }
    } else {
      return true; // If itemType is not 'trigger', return true
    }
  }

  validateParameters() {
    this.parametersForm.markAllAsTouched();
    const nameCount = new Map<string, number>();
    let hasDuplicate = false;
    const formArray = this.parametersForm.get('currentParameter') as FormArray;
    formArray.controls.forEach((group: AbstractControl) => {
      const paramGroup = group as FormGroup;
      const paramName = paramGroup.get('name')?.value ? paramGroup.get('name')?.value?.trim()?.toLowerCase() : paramGroup.get('name')?.value?.trim();
      if (paramName) {
        const count = nameCount.get(paramName) || 0;
        nameCount.set(paramName, count + 1);
        if (count + 1 > 1) {
          hasDuplicate = true;
        }
      }
    });

    if (this.parametersForm?.valid) {
      return true;
    } else {
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'You have entered invalid value for parameter(s).' });
      return false;
    }
  }

  /*============== Restart Task ===============*/
  restartTask(isRestart: boolean) {
    const isValid = this.validateParameters();
    if (!isValid) {
      return false;
    }
    const formValue = this.restartParamForm.getRawValue();
    // Remove below condition as per new requirement Jira TEI-5447
    //  || (this.dialogData.isStart && this.dialogData.itemType.toLowerCase() === 'trigger')
    if (this.dialogData.isInteractive) {
      const selectedScriptEngine = this.scriptEngines.find(x => Number(x.scriptEngineId) === Number(formValue?.scriptEngine));
      if (selectedScriptEngine?.debugSeStatus === 0 || !selectedScriptEngine?.debugSeStatus) {
        this.messageService.add({ key: 'appInfoMsgKey', severity: 'info', summary: '', detail: `The Debug Engine component is either not running or is not installed for the selected process engine. Please ensure that Debug Engine is properly installed and running.` });
        return;
      } else {
        if (isRestart) {
          if (this.validateCurrentScriptValue() && this.validateCurrentConfigValue()) {
            this.restart(isRestart);
          }
        } else {
          if (this.validateCurrentConfigValue()) {
            this.restart(isRestart);
          }
        }
      }
    } else {
      if (this.validateCurrentConfigValue()) {
        this.restart(isRestart);
      }
    }
  }

  restart(isRestart: boolean) {
    let taskParameters;
    const changeableFormValue = this.parametersForm.getRawValue()?.currentParameter;
    const otherFormValue = this.otherParametersForm.getRawValue()?.otherParameter;
    const formValue = this.restartParamForm.getRawValue();
    const selectedScriptEngine = this.scriptEngines.find(x => Number(x.scriptEngineId) === Number(formValue?.scriptEngine));
    if (isRestart) {
      taskParameters = changeableFormValue.concat(otherFormValue);
    } else {
      taskParameters = this.taskParams;
    }
    this.removedParams = this.removedParams.map(res => res.name);
    let currentScript;
    const nonEmptyParams = [];
    taskParameters.forEach(item => {
      delete item?.dataType;
      delete item?.probableValues;
      delete item?.protectedParam;
      delete item?.type;
      delete item?.originType;
      delete item?.paramType;
      // delete item?.securityLevel;
      delete item?.isNewParam;
      if (!this.dialogData?.isStart) {
        delete item?.source;
      }
      // item.securityLevel = 'Low';
      if (item?.securityLevel === 'high' || item?.securityLevel === 'medium') {
        item.value = this.encryptDecryptService.encrypt(item?.value);
      }
      if (item?.name === 'CurrentScript') {
        currentScript = item?.value;
      }
      if (item?.name !== '') {
        nonEmptyParams.push(item);
      }
    });
    const url = new URL(environment.webSocketBaseUrl);
    const host = url.hostname; // e.g., "localhost" or "example.com"
    const defaultParams = [
      { name: 'ActivatedBy', securityLevel: 'low', value: `User - ${this.currentUser?.userName}` },
      { name: 'ActivatedByHost', securityLevel: 'low', value: `${host}` },
      { name: 'ActivatedByPID', securityLevel: 'low', value: '' }
    ];
    nonEmptyParams.unshift(...defaultParams);
    if (nonEmptyParams?.length) {
      nonEmptyParams.forEach(obj => {
        if (obj.name === "CurrentConfig") {
          obj.value = this.dialogData?.item?.configData?.length > 0 ? obj.value : null;
        }
      });
    }
    const restartTaskDetailsDto = {
      taskId: this.dialogData?.taskId,
      parameters: nonEmptyParams,
      currentScript: currentScript,
      removedParams: this.removedParams,
      debugSeId: selectedScriptEngine?.debugSeId || '',
      debugSeUrl: selectedScriptEngine?.debugSeUrl || ''
    };
    this.dialogRef.close(restartTaskDetailsDto);
    this.removedParams = [];
  }
  /*============== END Restart Task ===============*/

  /*============== Open Current Parameters Popup ===============*/
  // currentParametersModel() {
  //   const dialogRef = this.dialog.open(CurrentParametersComponent, {
  //     width: '800px',
  //     maxHeight: '600px',
  //     data: ''
  //   });
  //   // tslint:disable-next-line: deprecation
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {

  //     }
  //   });
  // }
  /*============== END Open Current Parameters Popup ===============*/

  /*===================Select File===================*/
  // uploadFile(event) {
  //   const fileList: FileList = event.target.files;
  //   this.fileName = fileList[0]['name'];
  //   this.selectedFilesArr.push(fileList[0]['name']);
  //   if (this.fileName) {
  //     this.addInputFile(this.fileName);
  //   }
  //   this.fileType = fileList[0]['type'];
  //   this.docName = fileList[0]['name'];
  //   this.fileName = fileList[0]['name'];
  //   this.fileSize = fileList[0]['size'];
  //   const fType = fileList[0]['name'].split('.');
  //   // this.fType = fType;
  //   if (fileList.length > 0) {
  //     const file: File = fileList[0];
  //     this.sellersPermitFile = file;
  //     this.handleInputChange(file); // turn into base64
  //   } else {
  //     this.messageService.add({ key: 'taskMgmtKey', severity: 'error', summary: '', detail: 'No file selected' });
  //   }
  // }

  // handleInputChange(files) {
  //   const file = files;
  //   const pattern = /-*/;
  //   const reader = new FileReader();
  //   if (!file.type.match(pattern)) {
  //     this.messageService.add({ key: 'taskMgmtKey', severity: 'error', summary: '', detail: 'Invalid format' });
  //     return;
  //   }
  //   reader.onloadend = this._handleReaderLoaded.bind(this);
  //   reader.readAsDataURL(file);
  // }

  // _handleReaderLoaded(e) {
  //   const reader = e.target;
  //   const base64result = reader.result.substr(reader.result.indexOf(',') + 1);
  //   this.sellersPermitString = base64result;
  //   this.docByteArray = this.sellersPermitString;
  // }
  /*===================END Upload Resume===================*/

  ngOnDestroy(): void {
    this.getStartTaskParamsSub.unsubscribe();
    this.getRestartTaskParamsSub.unsubscribe();
    this.getRecentFilesSub.unsubscribe();
    this.getScriptEngineInfoSub.unsubscribe();
  }

}
