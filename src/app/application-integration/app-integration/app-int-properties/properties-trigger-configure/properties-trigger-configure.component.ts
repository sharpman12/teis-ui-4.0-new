import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { AppIntegrationService } from '../../app-integration.service';
import { AppIntegrationDataService } from '../../app-integration-data.service';
import { Constants } from 'src/app/shared/components/constants';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { take } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { pipeOperatorNotAllowedValidator } from 'src/app/shared/validation/pipe-operator.validator';
import { uniqueNameValidator } from 'src/app/shared/validation/unique-name-validator';
import { GlobalParametersComponent } from '../../global-parameters/global-parameters.component';
import { AddUpdateTriggerConfigComponent } from './add-update-trigger-config/add-update-trigger-config.component';

@Component({
  selector: 'app-properties-trigger-configure',
  templateUrl: './properties-trigger-configure.component.html',
  styleUrls: ['./properties-trigger-configure.component.scss']
})
export class PropertiesTriggerConfigureComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isProperties: boolean = false;
  configureForm: UntypedFormGroup;
  currentUser: any = null;
  isAddMoreBtnEnabled: boolean = true;
  triggerScriptsParameters: Array<any> = [];
  paramsDescriptionObj: any = null;
  configStrArr: Array<any> = [];
  updateConfigStr: any = null;
  isEditConfigStr: boolean = false;
  isPITLock: boolean = true;
  propertiesDetails: any = null;
  showHidden: boolean = false;
  parametersArr: Array<any> = [];

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  get currentParameterFormArray(): FormArray {
    return this.configureForm.get('currentParameter') as FormArray;
  }
  get isAddConfigDisabled(): boolean {
    return this.currentParameterFormArray.length === 0;
  }
  get checkHiddenParameter(): boolean {
    const currentParameters = this.configureForm.get('currentParameter') as FormArray;
    if (currentParameters.controls.length) {
      return currentParameters.controls.every(para => para.get('paramType')?.value === 'Private');
    } else {
      return false;
    }
  }

  ngOnInit(): void {
    this.createForm();
    this.appIntegrationService.scriptParams.subscribe((res) => {
      this.propertiesDetails = res?.propertiesDetails;
      let scriptParams = [];
      const existingStoreParams = this.appIntegrationDataService.getCurrentTriggerConfigParamsData();
      const parameters = (res?.selectedExecutables || []).filter(x => x?.triggerScript);
      if (parameters?.length) {
        this.parametersArr = parameters;
        parameters.forEach((item) => {
          if (item?.scriptParameterDataList?.length) {

            item?.scriptParameterDataList.forEach(x => {
              if (x?.config) {
                if (!x?.outParameter || (x?.inParameter && x?.outParameter)) {
                  scriptParams.push(x);
                }
              }
            });
          } else {
            this.createForm();
          }
        });

        if (existingStoreParams?.length && scriptParams?.length) {
          existingStoreParams.forEach(item => {
            scriptParams.forEach((x, i, arr) => {
              if (item?.isNewParam) {
                const obj = {
                  autoComplete: false,
                  config: false,
                  dataType: item?.dataType,
                  description: item?.description,
                  id: item?.id,
                  inParameter: false,
                  lastUpdated: null,
                  optionProtected: false,
                  outParameter: false,
                  parameterName: item?.name,
                  parameterTypes: item?.paramType,
                  probableValues: item?.probableValues,
                  scriptId: null,
                  securityLevel: item?.securityLevel,
                  storedValue: false,
                  type: '',
                  updatedBy: '',
                  value: item?.value,
                  workspaceId: null,
                  isNewParam: item?.isNewParam
                };
                arr.push(obj);
              }
              if (!item?.isNewParam && (Number(item?.id) === Number(x?.id))) {
                x.value = item?.value;
              }
            });
          });
        }
      } else {
        this.createForm();
      }
      this.setScriptParameters(scriptParams, this.propertiesDetails);
    });

    this.appIntegrationService.removedTriggerScript.subscribe((res) => {
      if (res) {
        if (res?.isTriggerScriptDeleted) {
          this.configStrArr = [];
        }
      }
    });
  }

  /*============= Create Form ============*/
  createForm() {
    this.configureForm = this.fb.group({
      currentParameter: this.fb.array([
        this.addParameters(false)
      ], uniqueNameValidator())
    });
  }
  /*============= END Create Form ============*/

  get configParametersFormArr(): FormArray {
    return this.configureForm.get('currentParameter') as FormArray;
  }

  clearConfigParams(): void {
    this.configParametersFormArr.controls.forEach((param: UntypedFormGroup, index) => {
      param.patchValue({
        value: ''
      });
    });
  }

  /*================== Add More Parameters =================*/
  addParameters(additionalParam: boolean): UntypedFormGroup {
    return this.fb.group({
      dataType: [{ value: '', disabled: true }],
      source: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: false }, Validators.required],
      description: [{ value: '', disabled: false }],
      id: [{ value: '', disabled: false }],
      value: [{ value: '', disabled: false }, {
        validators: [pipeOperatorNotAllowedValidator()],
      }],
      probableValues: [{ value: [], disabled: false }],
      paramType: [{ value: '', disabled: false }],
      securityLevel: [{ value: additionalParam ? 'low' : '', disabled: false }],
      isprotected: [{ value: false, disabled: false }],
      isNewParam: [{ value: additionalParam, disabled: false }],
    });
  }

  addMoreParameters(): void {
    (<UntypedFormArray>this.configureForm.get('currentParameter')).push(this.addParameters(true));
  }
  /*================== END Add More Parameters =================*/

  /*================== Set Existing Parameters =================*/
  setExistingParamerters(parameters: any[], isCtrlDisabled: any): UntypedFormArray {
    const formArray = this.fb.array([], uniqueNameValidator());
    let securityLevel;
    let value;
    parameters.forEach((p) => {
      if (p.securityLevel) {
        securityLevel = p.securityLevel.toLowerCase();
      } else {
        securityLevel = p.securityLevel;
      }
      if (p.value && (p?.dataType && p?.dataType.toLowerCase() === 'boolean')) {
        value = p?.value ? p?.value.toLowerCase() : p?.value;
      } else {
        value = p.value;
      }
      formArray.push(this.fb.group({
        dataType: [{ value: p.dataType, disabled: p?.currentParameterObj?.isDataType }],
        source: [{ value: p.source, disabled: p?.currentParameterObj?.isSource }],
        name: [{ value: p.parameterName, disabled: p?.currentParameterObj?.isName }],
        id: [{ value: p.id, disabled: false }],
        description: [{ value: p.description, disabled: false }],
        value: [{ value: value, disabled: p?.currentParameterObj?.isValue }, {
          validators: [pipeOperatorNotAllowedValidator()],
        }],
        probableValues: [{ value: p.probableValues, disabled: false }],
        paramType: [{ value: p.type, disabled: false }],
        securityLevel: [{ value: securityLevel, disabled: false }],
        isprotected: [{ value: p.optionProtected, disabled: false }],
        isNewParam: [{ value: p?.isNewParam, disabled: false }],
      }));
    });
    return formArray;
  }
  /*================== END Set Existing Parameters =================*/

  /*============== Get Trigger Script Parameters ==============*/
  getTriggerScriptParameters(propertiesDetails?: any) {
    this.propertiesDetails = propertiesDetails;
    let scriptParams = [];
    const existingStoreParams = this.appIntegrationDataService.getCurrentTriggerConfigParamsData();
    this.appIntegrationService.scriptParams.pipe(take(1)).subscribe((params) => {
      const parameters = (params || []).filter(x => x?.triggerScript);
      if (parameters?.length) {
        parameters.forEach((item) => {
          if (item?.scriptParameterDataList?.length) {
            item?.scriptParameterDataList.forEach(x => {
              if (x?.type === 'Public' && x?.config) {
                if (!x?.outParameter || (x?.inParameter && x?.outParameter)) {
                  scriptParams.push(x);
                }
              }
            });
          } else {
            this.createForm();
          }
        });

        if (existingStoreParams?.length && scriptParams?.length) {
          existingStoreParams.forEach(item => {
            scriptParams.forEach((x, i, arr) => {
              if (item?.isNewParam) {
                const obj = {
                  autoComplete: false,
                  config: false,
                  dataType: item?.dataType,
                  description: item?.description,
                  id: item?.id,
                  inParameter: false,
                  lastUpdated: null,
                  optionProtected: false,
                  outParameter: false,
                  parameterName: item?.name,
                  parameterTypes: item?.paramType,
                  probableValues: item?.probableValues,
                  scriptId: null,
                  securityLevel: item?.securityLevel,
                  storedValue: false,
                  type: '',
                  updatedBy: '',
                  value: item?.value,
                  workspaceId: null,
                  isNewParam: item?.isNewParam
                };
                arr.push(obj);
              }
              if (!item?.isNewParam && (Number(item?.id) === Number(x?.id))) {
                x.value = item?.value;
              }
            });
          });
        }
      } else {
        this.createForm();
      }
    });

    this.setScriptParameters(scriptParams, propertiesDetails);
  }

  setScriptParameters(scriptParams: Array<any>, propertiesDetails: any) {
    if (scriptParams?.length) {
      scriptParams = scriptParams.filter(
        (x, index, arr) => index === arr.findIndex(
          e => x.parameterName === e.parameterName
        ));
      scriptParams.sort(function (a, b) {
        var textA = a.parameterName.toUpperCase();
        var textB = b.parameterName.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      const currentParameterObj = {
        isDataType: true,
        isSource: true,
        isName: true,
        isValue: false
      };

      const clonedScriptParamsArray = JSON.parse(JSON.stringify(scriptParams));
      this.triggerScriptsParameters = scriptParams;
      if (this.router?.url.includes("properties")) {
        if (propertiesDetails?.locked && (propertiesDetails?.lockedUserId ? Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId) : true)) {
          this.isAddMoreBtnEnabled = true;
        } else {
          this.isAddMoreBtnEnabled = false;
        }
        scriptParams.map(x => (this.router?.url.includes("properties") && propertiesDetails?.locked && (propertiesDetails?.lockedUserId ? Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId) : true)) ? currentParameterObj.isValue = false : currentParameterObj.isValue = true);

        this.triggerScriptsParameters.map((item) => {
          if (propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) {
            item.currentParameterObj = {
              isDataType: true,
              isSource: true,
              isName: false,
              //isName: item?.isNewParam ? false : true,
              isValue: false
            };
          } else {
            item.currentParameterObj = {
              isDataType: true,
              isSource: true,
              isName: true,
              isValue: true
            };
          }
        });
      } else {
        this.isAddMoreBtnEnabled = false;
        scriptParams.map(x => currentParameterObj.isValue = false);

        this.triggerScriptsParameters.map((item) => {
          item.currentParameterObj = {
            isDataType: true,
            isSource: true,
            // isName: item?.isNewParam ? false : true,
            isName: false,
            isValue: false
          };
        });
      }
      this.configureForm.setControl('currentParameter', this.setExistingParamerters(scriptParams, currentParameterObj));
    }
  }

  /*=============== Delete Additional Parameters ===============*/
  removeAdditionalParams(index: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `Are you sure you want to remove additional parameter?`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const formsVal = this.configureForm.get('currentParameter') as FormArray;
        const formsValData = formsVal.at(index)?.value;
        const id = formsValData?.id;
        if (this.paramsDescriptionObj && (id === this.paramsDescriptionObj?.id)) {
          this.paramsDescriptionObj = {};
        }
        formsVal.removeAt(index);
      }
    });
  }
  /*=============== END Delete Additional Parameters ===============*/

  onCheckHiddenCheckbox(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (!checked && this.paramsDescriptionObj?.type === 'Private') {
      this.paramsDescriptionObj = {};
    }
    this.showHidden = checked;
    const formArray = this.configureForm.get('currentParameter') as FormArray;
    formArray.setValidators(uniqueNameValidator(this.showHidden));
    formArray.updateValueAndValidity();
  }

  /*============== Show Parameters Descriptions ==============*/
  getParamsDescription(id: string, desc: string, isNewParams: Boolean, type: any) {
    this.paramsDescriptionObj = {
      id: id,
      description: desc,
      isNewParams: isNewParams,
      type: type
    };
  }

  handleSharedConfigPending(isPending: boolean) {
    const strArr = [];
    let isDuplicate = false;
    const config = this.configureForm.getRawValue();
    if (config?.currentParameter?.length) {
      config?.currentParameter.forEach((x) => {
        x.paramName = x?.name ? x?.name.trim() : '';
        x.value = x?.value ? x?.value.trim() : '';
        x.type = x?.paramType;
        if (x.paramName) {
          const str = `${x.paramName}=${x.value}`;
          strArr.push(str);
        }
      });

      const configStrObj = {
        order: null,
        // str: strArr.toString().replace(/,/g, '|'),
        str: strArr.join('|'),
        disabled: false
      };

      isDuplicate = this.configStrArr?.length ? this.configStrArr.some((str) => str?.str === configStrObj?.str) : false;
      this.appIntegrationService.sharedConfigPending(isDuplicate ? false : isPending);
    }
  }

  changeValue(event) {
    this.handleSharedConfigPending(true);
  }

  /*============= Add Configuration =============*/
  addConfig(isAdd: boolean, isUpdate: boolean, isCopy: boolean, configStr: any) {
    const dialogRef = this.dialog.open(AddUpdateTriggerConfigComponent, {
      width: "900px",
      maxHeight: '95vh',
      data: {
        isAdd: isAdd,
        isEdit: isUpdate,
        isCopy: isCopy,
        config: configStr,
        configStrArr: this.configStrArr,
        workspaceId: this.workspaceId
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.isAdd || result.isCopy) {
          this.configStrArr.push(result?.configStrObj);
          const clonedConfigStrArr = JSON.parse(JSON.stringify(this.configStrArr));
          clonedConfigStrArr.forEach((x, i) => {
            x.order = i;
          });
          this.configStrArr = clonedConfigStrArr;
        } else if (result.isUpdate) {
          const foundIndex = this.configStrArr.findIndex(x => Number(x.order) === Number(result.configStrObj?.order));
          if (foundIndex !== -1) {
            result.configStrObj.order = foundIndex;
            this.configStrArr[foundIndex] = result?.configStrObj;
          }
        }
      }
    });
  }

  addUpdateConfig(isAdd: boolean) {
    const strArr = [];
    const config = this.configureForm.getRawValue();
    if (config?.currentParameter?.length) {
      config?.currentParameter.forEach((x) => {
        x.paramName = x?.name ? x?.name.trim() : '';
        x.value = x?.value ? x?.value.trim() : '';
        x.type = x?.paramType;
        if (x.paramName) {
          const str = `${x.paramName}=${x.value}`;
          strArr.push(str);
        }
      });

      const configStrObj = {
        order: null,
        // str: strArr.toString().replace(/,/g, '|'),
        str: strArr.join('|'),
        disabled: false
      };

      const isDuplicate = this.configStrArr?.length ? this.configStrArr.some((str) => str?.str === configStrObj?.str) : false;
      if (isAdd) {
        if (isDuplicate) {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'The configuration already connected.' });
        } else {
          this.isEditConfigStr = false;
          this.configStrArr.push(configStrObj);
          const clonedConfigStrArr = JSON.parse(JSON.stringify(this.configStrArr));
          clonedConfigStrArr.forEach((x, i) => {
            x.order = i;
          });
          this.configStrArr = clonedConfigStrArr;
          const paramsArray = this.configureForm.get('currentParameter') as FormArray;
          paramsArray.controls.forEach((paramGroup: UntypedFormGroup) => {
            paramGroup.patchValue({
              value: ''
            });
          });
          this.handleSharedConfigPending(false);
        }
      } else {
        if (isDuplicate) {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'The configuration already connected.' });
        } else {
          this.isEditConfigStr = false;
          const foundIndex = this.configStrArr.findIndex(x => Number(x.order) === Number(this.updateConfigStr?.order));
          if (foundIndex !== -1) {
            configStrObj.order = foundIndex;
            this.configStrArr[foundIndex] = configStrObj;
            const paramsArray = this.configureForm.get('currentParameter') as FormArray;
            paramsArray.controls.forEach((paramGroup: UntypedFormGroup) => {
              paramGroup.patchValue({
                value: ''
              });
            });
            this.handleSharedConfigPending(false);
          }
        }
      }
    }
  }

  /*============ Drag and Drop Table Row =============*/
  dropRow(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.configStrArr, event.previousIndex, event.currentIndex);
    this.normalizeConfigOrder();

  }

  editConfigStr(strObj: any) {
    this.isEditConfigStr = true;
    this.updateConfigStr = strObj;

    let subStrings = strObj?.str.split('|');

    // let superSubStrings = subStrings.map(x => x.split(/=(.+)/));
    const superSubStrings = subStrings.map(str => {
      const index = str.indexOf('=');
      return index !== -1 ? [str.substring(0, index), str.substring(index + 1)] : [str];
    });
    const currentParameterObj = {
      isDataType: true,
      isSource: true,
      isName: true,
      isValue: true
    };
    //const res = {};
    const configArr = [];
    // for (let pair of superSubStrings) {
    //   const [key, value] = pair;
    //   res[key] = value;
    // };

    // const res = [];

    for (let pair of superSubStrings) {
      const [key, value] = pair;
      configArr.push({
        parameterName: key,
        value: value
      });
    }

    const hiddenParams = this.triggerScriptsParameters.filter((hidden) => hidden.type.toLowerCase() === 'private');

    if (hiddenParams && hiddenParams.length) {
      hiddenParams.forEach((x) => {
        const match = configArr.some((con) => (con.parameterName === x.parameterName));
        this.showHidden = match;
        return true;
      });
    }

    const paramsArr = this.parametersArr.reduce((acc, item) => acc.concat(item.scriptParameterDataList), []);

    // Create a map for fast lookup
    const descMap = new Map(paramsArr.map(item => [item.parameterName, item.description]));

    const configParams = configArr.map(obj => ({
      ...obj,
      description: descMap.get(obj.parameterName) || ''
    }));

    // for (const key in res) {
    //   if (res.hasOwnProperty(key)) {
    //     configParams.push({
    //       parameterName: `${key}`,
    //       value: `${res[key]}`
    //     });
    //   }
    // }

    if (configParams?.length && this.triggerScriptsParameters?.length) {
      this.triggerScriptsParameters.forEach((x) => {
        // configParams.forEach((s) => {
        //   if (s?.parameterName === x?.parameterName) {
        //     s.dataType = x?.dataType;
        //   }
        // });

        const match = configParams.find((config) => config.parameterName === x.parameterName);

        if (match) {
          // Update dataType if matched
          match.dataType = x?.dataType;
          match.probableValues = x?.probableValues?.length ? x?.probableValues : [];
          match.type = x?.type;
        } else {
          // Push unmatched parameter into configParams
          configParams.push({
            currentParameterObj: x?.currentParameterObj,
            dataType: x?.dataType,
            description: x?.description,
            isNewParam: false,
            parameterName: x?.parameterName,
            value: x?.value,
            probableValues: x?.probableValues?.length ? x?.probableValues : [],
            type: x?.type
          });
        }
      });
      // Iterate over array1 and add a flag if the name is not in array2
      configParams.forEach(obj1 => {
        const isMatched = this.triggerScriptsParameters.some(obj2 => obj1.parameterName === obj2.parameterName);
        obj1.isNewParam = !isMatched; // Set the flag to true if no match is found
      });
      configParams.forEach((p) => {
        p.currentParameterObj = {
          isDataType: true,
          isSource: true,
          //isName: p?.isNewParam ? false : true,
          isName: this.router?.url.includes("properties") ? (this.propertiesDetails?.locked && Number(this.currentUser?.id) === Number(this.propertiesDetails?.lockedUserId) && p?.isNewParam) ? false : true : false,
          isValue: this.router?.url.includes("properties") ? (this.propertiesDetails?.locked && Number(this.currentUser?.id) === Number(this.propertiesDetails?.lockedUserId)) ? false : true : false
        };
      });
      this.configureForm.setControl('currentParameter', this.setExistingParamerters(configParams, currentParameterObj));
    } else {
      this.configureForm.setControl('currentParameter', this.setExistingParamerters(configParams, currentParameterObj));
    }
  }

  private normalizeConfigOrder(): void {
    this.configStrArr = this.configStrArr.map((x, i) => ({
      ...x,
      order: i
    }));
  }

  removeConfigStr(strObj: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: 'Are you sure you want to delete this config?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isEditConfigStr = false;
        const foundIndex = this.configStrArr.findIndex((x) => x?.str === strObj?.str);
        if (foundIndex > -1) {
          this.configStrArr.splice(foundIndex, 1);
          this.normalizeConfigOrder();
        }
      }
    });
  }

  getConfigStr() {
    const configData = [];
    if (this.configStrArr?.length) {
      this.configStrArr.forEach((x) => {
        const configObj = {
          configValue: x?.str,
          sequence: x?.order
        };
        configData.push(configObj);
      });
    }
    return configData;
  }

  /*============== Set Trigger Configuration ==============*/
  setTriggerConfiguration(propertiesDetails: any) {
    this.propertiesDetails = propertiesDetails;
    this.isPITLock = propertiesDetails?.locked;
    this.configStrArr = [];
    if (propertiesDetails?.configData?.length) {
      propertiesDetails?.configData.forEach((x, i) => {
        const configObj = {
          str: x?.configValue,
          //order: x?.sequence,
          order:i,
          disabled: (this.router?.url.includes("properties") && propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? false : true
        };
        this.configStrArr.push(configObj);
      });
      if (this.configStrArr?.length) {
        this.editConfigStr(this.configStrArr[0]);
      }
    }
  }

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    const currentParameterObj = {
      isDataType: true,
      isSource: true,
      isName: true,
      isValue: false
    };
    this.isPITLock = isPITLock;
    this.handleSharedConfigPending(false);
    if (isPITLock) {
      if (this.configStrArr?.length) {
        this.configStrArr.map(x => x.disabled = false);
      }
      if (this.triggerScriptsParameters?.length) {
        this.triggerScriptsParameters.map((item) => {
          item.currentParameterObj = {
            isDataType: true,
            isSource: true,
            // isName: item?.isNewParam ? false : true,
            isName: false,
            isValue: false
          };
        });
      }
    } else {
      if (this.configStrArr?.length) {
        this.configStrArr.map(x => x.disabled = true);
      }
      if (this.triggerScriptsParameters?.length) {
        this.triggerScriptsParameters.map((item) => {
          item.currentParameterObj = {
            isDataType: true,
            isSource: true,
            isName: true,
            isValue: true
          };
        });
      }
    }
  }

  /*============== Reset Parameters Data ==============*/
  resetConfigure() {
    this.configStrArr = [];
    this.configureForm.reset();
  }
  /*============== END Reset Parameters Data ==============*/

  /*============== Get Parameters Data ==============*/
  getParametersData() {
    this.configureForm.markAllAsTouched();
    if (this.configureForm?.valid) {
      const parameters = [];
      const paramsValue = this.configureForm.getRawValue();
      if (paramsValue?.currentParameter?.length) {
        paramsValue?.currentParameter.forEach(x => {
          x.paramName = x?.name ? x?.name.trim() : '';
          x.value = x?.value ? x?.value.trim() : '';
          x.type = x?.paramType;
          delete x?.dataType;
          delete x?.isNewParam;
          delete x?.probableValues;
          delete x?.source;
          delete x?.name;
          delete x?.description;
          delete x?.paramType;
          if (x?.paramName && x?.value) {
            parameters.push(x);
          }
        });
      }
      return parameters;
    } else {
      return false;
    }
  }
  /*============== END Get Parameters Data ==============*/

  /*============== Store Current Data For Back and Forth ==============*/
  storeCurrentConfigParamsData() {
    this.configureForm.markAllAsTouched();
    if (this.configureForm?.valid) {
      const paramsValue = this.configureForm.getRawValue();
      this.appIntegrationDataService.storeTriggerConfigParamsData(paramsValue?.currentParameter);
    }
  }

  /*================= Global Parameters ==================*/
  globalParameters() {
    const dialogRef = this.dialog.open(GlobalParametersComponent, {
      width: "800px",
      maxHeight: "600px",
      data: {
        workspace: { id: this.workspaceId },
        isCRUDGlobalParamsAccess: false,
        singleColumnMode: true
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }
  /*================= END Global Parameters ==================*/

  ngOnDestroy(): void {

  }

}
