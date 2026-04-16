import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { AppIntegrationService } from '../../app-integration.service';
import { Subject, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AppIntegrationDataService } from '../../app-integration-data.service';
import { Router } from '@angular/router';
import { Constants } from 'src/app/shared/components/constants';
import { take } from 'rxjs/operators';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { pipeOperatorNotAllowedValidator } from 'src/app/shared/validation/pipe-operator.validator';
import { uniqueNameValidator } from 'src/app/shared/validation/unique-name-validator';
import { GlobalParametersComponent } from '../../global-parameters/global-parameters.component';

interface Parameter {
  id: string;
  parameterName: string;
  scriptName: string | null;
  [key: string]: any;
}

@Component({
  selector: 'app-properties-parameters',
  templateUrl: './properties-parameters.component.html',
  styleUrls: ['./properties-parameters.component.scss']
})
export class PropertiesParametersComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number = null;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isProperties: boolean = false;
  @Input() isProcessCreateFromIntegration: boolean = false;
  parametersForm: UntypedFormGroup;
  scriptsParameters: Array<any> = [];
  isAddMoreBtnEnabled: boolean = true;
  showHidden: boolean = false;
  currentUser: any = null;
  paramsDescriptionObj: any = null;
  isGlobalHiddenParamEnabled: boolean = true;
  initialFormValue: any = null;
  isShowGroupParameters: boolean[] = [];

  getScriptParamsSub = Subscription.EMPTY;
  private destroy$ = new Subject<void>();

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private encryptDecryptService: EncryptDecryptService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }


  // Returns true if all parameters in the group are 'Private'

  // checkHiddenParameter(group: FormGroup): boolean {
  //   const formArray = Object.values(group.controls)
  //     .find(c => c instanceof FormArray) as FormArray;

  //   if (!formArray) return false;

  //   const params = formArray.controls as FormGroup[];
  //   return params.length > 0 &&
  //     params.every(p => p.get('paramType')?.value === 'Private');
  // }
  checkHiddenParameter(group: FormGroup): boolean {
    const formArray = Object.values(group.controls)
      .find(c => c instanceof FormArray) as FormArray;

    if (!formArray) return false;

    const params = formArray.controls as FormGroup[];

    let hasHidden = false;
    let hasVisible = false;

    params.forEach(p => {
      const type = p.get('paramType')?.value;
      const value = p.get('value')?.value;

      // hidden ONLY if private AND no value
      if (type === 'Private' && (value === null || value === '')) {
        hasHidden = true;
      } else {
        hasVisible = true;
      }
    });

    // show message only if everything visible is hidden
    return hasHidden && !hasVisible;
  }


  ngOnInit(): void {
    this.createForm();
    this.appIntegrationService.scriptParams.subscribe((res) => {
      this.storeCurrentParamsData();
      let scriptParams = [];
      const existingStoreParams = this.appIntegrationDataService.getCurrentParamsData();
      if (res?.selectedExecutables?.length) {
        res?.selectedExecutables.forEach(item => {
          if (item?.scriptParameterDataList?.length) {
            item?.scriptParameterDataList.forEach(x => {
              x.parameterName = x?.parameterName?.trim();
              const paramWithScript = { ...x, scriptName: item.scriptName, order: item.order };
              if (this.itemType === 'trigger') {
                if (!x?.config) {
                  if (!x?.outParameter || (x?.inParameter && x?.outParameter)) {
                    scriptParams.push(paramWithScript);
                  }
                }
              } else {
                if (!x?.config) {
                  if (!x?.outParameter || (x?.inParameter && x?.outParameter)) {
                    scriptParams.push(paramWithScript);
                  }
                }
              }
              // delete x.scriptName;
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
                  parameterName: item?.name.trim(),
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

      if (!this.isProcessCreateFromIntegration) {
        /*---- Code For Additional Parameters Get Additional Parameters ----*/
        this.appIntegrationService.additionalScriptParams.pipe(take(1)).subscribe((additioanlParam) => {
          if (additioanlParam?.length) {
            additioanlParam.forEach(x => {
              x.isNewParam = true;
              x.scriptName = null; // ✅ Explicitly set scriptName for Custom Parameters
              x.order = null;
              scriptParams.push(x);
            });

          }
        });
      }

      /*---- Code For Deleted Script Parameters ----*/
      this.appIntegrationService.deletedScriptParams.pipe(take(1)).subscribe((deletedParam) => {
        if (deletedParam?.length) {
          if (this.router?.url.includes("properties") || res?.isProperties) {
            if (deletedParam?.length && res?.propertiesDetails?.scriptList?.length) {
              res?.propertiesDetails?.scriptList.forEach((x) => {
                deletedParam.forEach((p) => {
                  if (Number(x?.id) === Number(p.id)) {
                    if (p?.scriptParameterDataList?.length) {
                      p?.scriptParameterDataList.forEach(s => {
                        if (s?.type === 'Public' && s?.value) {
                          s.isNewParam = true;
                          s.dataType = null;
                          s.scriptName = null; // ✅ Explicitly set scriptName for Custom Parameters
                          s.order = null;
                          scriptParams.push(s);
                        }
                      });
                    }
                  }
                });
              });

              deletedParam.forEach((p) => {
                if (p?.scriptParameterDataList?.length) {
                  p?.scriptParameterDataList.forEach((dsp) => {
                    if (scriptParams?.length) {
                      scriptParams.forEach((sp) => {
                        if (dsp?.parameterName.trim() === sp?.parameterName.trim()) {
                          sp.value = dsp?.value;
                        }
                      });
                    }
                  });
                }
              });

            }
          } else {
            if (res?.scriptParameterDataList?.length) {
              res?.scriptParameterDataList.forEach(s => {
                if (s?.type === 'Public') {
                  s.isNewParam = true;
                  s.dataType = null;
                  s.scriptName = null; // ✅ Explicitly set scriptName for Custom Parameters
                  s.order = null;
                  scriptParams.push(s);
                }
              });

            }
          }
        }
      });
      this.setScriptParameters(scriptParams, res?.propertiesDetails, res?.isProperties, res?.selectedExecutables);
    });
  }

  hasCustomParametersGroup(): boolean {
    const grouped = this.parametersForm?.get('groupedParameters')?.value || [];
    return grouped.some((g: any) => g.scriptName === 'Custom Parameters');
  }

  initializeGroupToggles() {
    const groupedArray = this.parametersForm.get('groupedParameters') as FormArray;
    if (!groupedArray?.length) {
      this.isShowGroupParameters = [];
      return;
    }

    // Initialize all as closed
    this.isShowGroupParameters = groupedArray.controls.map(() => true);

    // Find first non-Shared Parameters group
    // const openIndex = groupedArray.controls.findIndex(ctrl =>
    //   ctrl.get('scriptName')?.value !== 'Shared Parameters'
    // );

    // Open it if found
    // if (openIndex !== -1) {
    //   this.isShowGroupParameters[openIndex] = true;
    // }
  }

  // Create the main form structure
  createForm() {
    this.parametersForm = this.fb.group({
      groupedParameters: this.fb.array([]) // initially empty
    });
  }

  /*================== Add More Parameters =================*/
  addParameters(additionalParam: boolean): UntypedFormGroup {
    // Jira TEI-5532 Removed Pipe Operator Validator as per new Victor requirement pipeOperatorNotAllowedValidator()
    return this.fb.group({
      dataType: [{ value: '', disabled: true }],
      source: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: false }],
      description: [{ value: '', disabled: false }],
      id: [{ value: '', disabled: false }],
      value: [{ value: '', disabled: false }, {
        validators: [],
      }],
      probableValues: [{ value: [], disabled: false }],
      paramType: [{ value: '', disabled: false }],
      securityLevel: [{ value: additionalParam ? 'low' : '', disabled: false }],
      isprotected: [{ value: false, disabled: false }],
      isNewParam: [{ value: additionalParam, disabled: false }],
      displayDataType: [{ value: '', disabled: false }],
      isShared: [{ value: false, disabled: false }],
      storedValue: [{ value: false, disabled: false }]
    });
  }

  addMoreParameters(): void {
    const groupedArray = this.parametersForm.get('groupedParameters') as UntypedFormArray;
    if (!groupedArray) return;

    // Check if Shared Parameters group exists
    const sharedGroupIndex = groupedArray.controls.findIndex(
      (group: AbstractControl) =>
        (group.get('scriptName')?.value || '') === 'Shared Parameters'
    );

    // Find Custom Parameters group & its index
    let customGroupIndex = groupedArray.controls.findIndex(
      (group: AbstractControl) =>
        (group.get('scriptName')?.value || '') === 'Custom Parameters'
    );

    let customGroup: UntypedFormGroup;

    // Decide insert index
    const insertIndex = sharedGroupIndex !== -1 ? 1 : 0;

    // If Custom Parameters group doesn't exist, create it
    if (customGroupIndex === -1) {
      const newFormArray = this.fb.array([], uniqueNameValidator(this.showHidden));

      customGroup = this.fb.group({
        scriptName: ['Custom Parameters'],
        formArray: newFormArray
      });

      groupedArray.insert(insertIndex, customGroup);
      customGroupIndex = insertIndex;

      if (!this.isShowGroupParameters) {
        this.isShowGroupParameters = [];
      }

      this.isShowGroupParameters.splice(customGroupIndex, 0, true);
    } else {
      customGroup = groupedArray.at(customGroupIndex) as UntypedFormGroup;
    }

    // Ensure Custom Parameters group is expanded
    this.isShowGroupParameters[customGroupIndex] = true;

    // Add new parameter row
    const formArray = customGroup.get('formArray') as UntypedFormArray;
    formArray.push(this.addParameters(true));
  }


  // groupWithSharedParams(parameters: Parameter[]) {
  //   // 1. Group by scriptName
  //   const group: Record<string, Parameter[]> = parameters.reduce((acc, p) => {
  //     const key = p.scriptName || "Custom Parameters";
  //     if (!acc[key]) acc[key] = [];
  //     acc[key].push(p);
  //     return acc;
  //   }, {} as Record<string, Parameter[]>);

  //   // 2. Track scripts using parameterName
  //   const paramCount: Record<string, Set<string>> = {};

  //   Object.keys(group).forEach(script => {
  //     group[script].forEach(param => {
  //       const name = param.parameterName;
  //       if (!paramCount[name]) {
  //         paramCount[name] = new Set<string>();
  //       }
  //       paramCount[name].add(script);
  //     });
  //   });

  //   // 3. Find shared parameter names
  //   const sharedNames = new Set(
  //     Object.entries(paramCount)
  //       .filter(([_, scripts]) => scripts.size > 1)
  //       .map(([name]) => name)
  //   );

  //   // 4. Extract shared params
  //   const sharedParams: Parameter[] = [];

  //   Object.keys(group).forEach(script => {
  //     group[script] = group[script].filter(param => {
  //       if (sharedNames.has(param.parameterName)) {
  //         sharedParams.push(param);
  //         return false; // remove from script section
  //       }
  //       return true;
  //     });
  //   });

  //   // 5. Add shared parameters section
  //   group["Shared Parameters"] = sharedParams;

  //   return group;
  // }


  groupWithSharedParams(parameters: Parameter[], executables: any[]) {
    /** Utility: normalize parameter names for comparison */
    const normalizeParamName = (name: string) =>
      name?.trim();

    /** 1. Create base groups from executables */
    const groups: Record<string, {
      scriptName: string;
      order: number;
      userDefined: boolean;
      language?: string;
      params: Parameter[];
    }> = {};

    executables.forEach(exec => {
      const key = `${exec.scriptName}__${exec.order ?? 0}`;

      groups[key] = {
        scriptName: exec.scriptName,
        order: exec.order ?? 0,
        userDefined: exec.userDefined,
        language: exec.language || '',
        params: []
      };
    });

    /** 2. Push parameters into their executable groups */
    parameters.forEach(param => {
      const scriptName = param.scriptName || 'Custom Parameters';
      const order = param.order ?? 0;
      const key = `${scriptName}__${order}`;

      if (!groups[key]) {
        groups[key] = {
          scriptName,
          order,
          userDefined: false,
          language: '',
          params: []
        };
      }

      groups[key].params.push(param);
    });

    /** 3. Build normalizedParamName -> Set of script keys */
    const paramUsage: Record<string, Set<string>> = {};

    Object.entries(groups).forEach(([key, group]) => {
      group.params.forEach(param => {
        const normalizedName = normalizeParamName(param.parameterName.trim());

        if (!normalizedName) return;

        if (!paramUsage[normalizedName]) {
          paramUsage[normalizedName] = new Set();
        }

        paramUsage[normalizedName].add(key);
      });
    });

    /** 4. Find shared parameter names */
    const sharedParamNames = new Set(
      Object.entries(paramUsage)
        .filter(([_, scripts]) => scripts.size > 1)
        .map(([name]) => name)
    );

    /** 5. Extract shared parameters (unique, original object kept) */
    const sharedParamsMap = new Map<string, Parameter>();

    Object.values(groups).forEach(group => {
      group.params.forEach(param => {
        const normalizedName = normalizeParamName(param.parameterName);

        if (sharedParamNames.has(normalizedName)) {
          param.isShared = true;

          if (!sharedParamsMap.has(normalizedName)) {
            sharedParamsMap.set(normalizedName, {
              ...param,
              parameterName: param.parameterName.trim()
            });
          }
        }
      });
    });

    /** 6. Build final result */
    const finalResult: any[] = [];
    const sharedParams = Array.from(sharedParamsMap.values());

    // Add Shared Parameters first
    if (sharedParams.length > 0) {
      finalResult.push({
        scriptName: 'Shared Parameters',
        scriptInfo: null,
        params: sharedParams
      });
    }

    // Custom Parameters group
    const customParamsGroup = Object.values(groups).find(
      g => g.scriptName === 'Custom Parameters'
    );

    // Other script groups
    const otherGroups = Object.values(groups).filter(
      g =>
        g.scriptName !== 'Custom Parameters' &&
        g.scriptName !== 'Shared Parameters'
    );

    otherGroups.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    if (customParamsGroup) {
      finalResult.push(customParamsGroup);
    }

    finalResult.push(...otherGroups);
    return finalResult;
  }


  displayScriptName(scriptName: any) {
    return scriptName.replace(/__\d+$/, '');
  }


  getDisplayIndex(groups: any[], index: number): number {
    // Count how many previous items are NOT shared/custom
    let count = 0;

    for (let i = 0; i <= index; i++) {
      const name = groups[i].scriptName;
      if (name !== 'Shared Parameters' && name !== 'Custom Parameters') {
        count++;
      }
    }
    return count;
  }

  // setExistingParamerters(parameters: any[], isCtrlDisabled: any, selectedExecutables: any[]) {
  //   const params = JSON.parse(JSON.stringify(parameters));
  //   const executables = JSON.parse(JSON.stringify(selectedExecutables));
  //   const groupedParams = this.groupWithSharedParams(params, executables);
  //   // FIX: Shared → 1st, Custom → 2nd, rest in original order
  //   const groupNames = Object.keys(groupedParams);
  //   const sortedGroupNames = [
  //     ...groupNames.filter(name => name === 'Shared Parameters'),
  //     ...groupNames.filter(name => name === 'Custom Parameters'),
  //     ...groupNames.filter(
  //       name => name !== 'Shared Parameters' && name !== 'Custom Parameters'
  //     )
  //   ];

  //   const groupedArray = this.fb.array([]);

  //   sortedGroupNames.forEach((scriptName) => {
  //     let params = groupedParams[scriptName];

  //     // Sort parameters inside group:
  //     // Non-Private first (alphabetical), Private last
  //     if (params.length) {
  //     params = [...params].sort((a, b) => {
  //       if (a.type === 'Private' && b.type !== 'Private') return 1;
  //       if (b.type === 'Private' && a.type !== 'Private') return -1;

  //       return (a.parameterName || '').localeCompare(
  //         b.parameterName || '',
  //         undefined,
  //         { sensitivity: 'base' }
  //       );
  //     });
  //     }

  //     const formArray = this.fb.array([], uniqueNameValidator(this.showHidden));
  //     const existingNames = new Set<string>();
  //     const parameter = params.map(data => {
  //       const trimmedParamName = String(data.parameterName).trim();
  //       return { ...data, parameterName: trimmedParamName };
  //     });
  //     parameter.forEach((p: any) => {
  //       const paramNameLower = (p.parameterName || '').toLowerCase();
  //       if (existingNames.has(paramNameLower)) return;
  //       existingNames.add(paramNameLower);

  //       let securityLevel = p.securityLevel;
  //       let value = p.value;

  //       if (p.securityLevel && p.value) {
  //         securityLevel = p.securityLevel.toLowerCase();
  //         value =
  //           securityLevel === 'high' || securityLevel === 'medium'
  //             ? this.encryptDecryptService.decrypt(p.value)
  //             : p.value;
  //       }

  //       if (p.value && p?.dataType?.toLowerCase() === 'boolean') {
  //         value = p?.value.toLowerCase();
  //       }

  //       const paramGroup = this.fb.group({
  //         dataType: [{ value: p.dataType, disabled: p?.currentParameterObj?.isDataType }],
  //         source: [{ value: p.source, disabled: p?.currentParameterObj?.isSource }],
  //         name: [{
  //           value: p.parameterName,
  //           disabled:
  //             p?.currentParameterObj?.isName ||
  //             (scriptName !== 'Shared Parameters' && p?.isShared)
  //         }],
  //         id: [{ value: p.id, disabled: false }],
  //         description: [{ value: p.description, disabled: false }],
  //         value: [{
  //           value: value,
  //           disabled: this.isProcessCreateFromIntegration
  //             ? false
  //             : p?.currentParameterObj?.isValue ||
  //             (scriptName !== 'Shared Parameters' && p?.isShared)
  //         }],
  //         probableValues: [{ value: p.probableValues, disabled: false }],
  //         paramType: [{ value: p.type, disabled: false }],
  //         securityLevel: [{ value: securityLevel, disabled: false }],
  //         isprotected: [{ value: p.optionProtected, disabled: false }],
  //         isNewParam: [{
  //           value: p?.isProcessParam ? false : p?.isNewParam,
  //           disabled: false
  //         }],
  //         displayDataType: [{
  //           value: p?.isProcessParam
  //             ? 'Process' + (p?.dataType ? ', ' + p?.dataType : '')
  //             : p?.dataType,
  //           disabled: p?.currentParameterObj?.isDataType
  //         }],
  //         isShared: p?.isShared ? p.isShared : false,
  //         storedValue: p?.storedValue
  //       });

  //       formArray.push(paramGroup);
  //     });

  //     groupedArray.push(
  //       this.fb.group({
  //         scriptName: [scriptName],
  //         formArray: formArray
  //       })
  //     );
  //   });

  //   // Assign final form
  //   this.parametersForm = this.fb.group({
  //     groupedParameters: groupedArray
  //   });

  //   this.initialFormValue = this.parametersForm.getRawValue();
  //   this.initializeGroupToggles();
  // }

  setExistingParamerters(
    parameters: any[],
    isCtrlDisabled: any,
    selectedExecutables: any[]
  ) {
    const params = JSON.parse(JSON.stringify(parameters));
    const executables = JSON.parse(JSON.stringify(selectedExecutables));
    const groupedParams = this.groupWithSharedParams(params, executables);
    const groupedArray = this.fb.array([]);
    groupedParams.forEach(group => {
      const scriptName = group.scriptName;
      let params = group.params || [];

      // Sort parameters inside group
      if (params.length) {
        params = [...params].sort((a, b) => {
          if (a.type === 'Private' && b.type !== 'Private') return 1;
          if (b.type === 'Private' && a.type !== 'Private') return -1;

          return (a.parameterName.trim() || '').localeCompare(
            b.parameterName.trim() || '',
            undefined,
            { sensitivity: 'base' }
          );
        });
      }

      const formArray = this.fb.array([], uniqueNameValidator(this.showHidden));
      const existingNames = new Set<string>();

      // ✅ EMPTY SCRIPT SUPPORT
      if (!params.length) {
        groupedArray.push(
          this.fb.group({
            scriptName: [scriptName],
            userDefined: [group?.userDefined],
            language: [group?.language],
            formArray
          })
        );
        return;
      }

      // Parameters exist
      const normalizedParams = params.map(data => {
        const trimmedParamName = String(data.parameterName).trim();
        return { ...data, parameterName: trimmedParamName };
      });

      normalizedParams.forEach((p: any) => {
        const paramNameLower = (p.parameterName || '');
        if (existingNames.has(paramNameLower)) return;
        existingNames.add(paramNameLower);

        let securityLevel = p.securityLevel;
        let value = p.value;

        if (p.securityLevel && p.value !== null && p.value !== undefined && p.value !== '') {
          securityLevel = p.securityLevel.toLowerCase();
          const valueAsString = String(p.value);
          value =
            securityLevel === 'high' || securityLevel === 'medium'
              ? this.encryptDecryptService.decrypt(valueAsString)
              : p.value;
        }

        // Normalize boolean values for UI select (yes/no)
        if ((p?.dataType || '').toLowerCase() === 'boolean') {
          const raw = p?.value;
          const normalized = String(raw ?? '').trim().toLowerCase();

          if (raw === true || normalized === 'true' || normalized === '1') {
            value = 'yes';
          } else if (raw === false || normalized === 'false' || normalized === '0') {
            value = 'no';
          } else if (normalized === 'yes' || normalized === 'no') {
            value = normalized;
          } else {
            value = '';
          }
        }

        const paramGroup = this.fb.group({
          dataType: [{ value: p.dataType, disabled: p?.currentParameterObj?.isDataType }],
          source: [{ value: p.source, disabled: p?.currentParameterObj?.isSource }],
          name: [{
            value: p.parameterName,
            disabled:
              p?.currentParameterObj?.isName ||
              (scriptName !== 'Shared Parameters' && p?.isShared)
          }],
          id: [{ value: p.id, disabled: false }],
          description: [{ value: p.description, disabled: false }],
          value: [{
            value,
            disabled: this.isProcessCreateFromIntegration
              ? false
              : p?.currentParameterObj?.isValue ||
              (scriptName !== 'Shared Parameters' && p?.isShared)
          }],
          probableValues: [{ value: p.probableValues, disabled: false }],
          paramType: [{ value: p.type, disabled: false }],
          securityLevel: [{ value: securityLevel, disabled: false }],
          isprotected: [{ value: p.optionProtected, disabled: false }],
          isNewParam: [{
            value: p?.isProcessParam ? false : p?.isNewParam,
            disabled: false
          }],
          displayDataType: [{
            value: p?.isProcessParam
              ? 'Process' + (p?.dataType ? ', ' + p?.dataType : '')
              : p?.dataType,
            disabled: p?.currentParameterObj?.isDataType
          }],
          isShared: p?.isShared || false,
          storedValue: p?.storedValue
        });

        formArray.push(paramGroup);
      });

      groupedArray.push(
        this.fb.group({
          scriptName: [scriptName],
          userDefined: [group?.userDefined],
          language: [group?.language],
          formArray
        })
      );
    });

    // Final form
    this.parametersForm = this.fb.group({
      groupedParameters: groupedArray
    });

    this.initialFormValue = this.parametersForm.getRawValue();
    this.initializeGroupToggles();
  }


  toggleGroup(index: number) {
    this.isShowGroupParameters[index] = !this.isShowGroupParameters[index];
  }

  expandAllParams() {
    this.isShowGroupParameters = this.isShowGroupParameters.map(() => true);
  }

  collapseAllParams() {
    this.isShowGroupParameters = this.isShowGroupParameters.map(() => false);
  }

  /*================== END Set Existing Parameters =================*/

  // onCheckHiddenCheckbox(event: Event) {
  //   const checked = (event.target as HTMLInputElement).checked;
  //   this.showHidden = checked;
  //   const formArray = this.parametersForm.get('currentParameter') as FormArray;
  //   formArray.setValidators(uniqueNameValidator(this.showHidden));
  //   formArray.updateValueAndValidity();

  // }


  onCheckHiddenCheckbox(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.showHidden = checked;
    const groupedArray = this.parametersForm.get('groupedParameters') as FormArray;
    if (groupedArray && groupedArray.length > 0) {
      groupedArray.controls.forEach((group: FormGroup) => {
        const formArray = group.get('formArray') as FormArray;
        if (formArray) {
          formArray.setValidators(uniqueNameValidator(this.showHidden));
          formArray.updateValueAndValidity({ emitEvent: false });
        }
      });
    }
  }

  /*============== Get Script Parameters ==============*/
  getScriptParameters(propertiesDetails?: any, isProperties?: boolean) {
    let scriptParams = [];
    const existingStoreParams = this.appIntegrationDataService.getCurrentParamsData();
    this.appIntegrationService.scriptParams.pipe(take(1)).subscribe((params) => {
      // const parameters = params.filter(x => !x?.triggerScript);
      if (params?.length) {
        params.forEach(item => {
          if (item?.scriptParameterDataList?.length) {
            item?.scriptParameterDataList.forEach(x => {
              if (this.itemType === 'trigger') {
                if (x?.type === 'Public' && !x?.config) {
                  if (!x?.outParameter || (x?.inParameter && x?.outParameter)) {
                    scriptParams.push(x);
                  }
                }
              } else {
                if (x?.type === 'Public' && !x?.config) {
                  if (!x?.outParameter || (x?.inParameter && x?.outParameter)) {
                    scriptParams.push(x);
                  }
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
                  storedValue: item?.storedValue,
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

    /*---- Code For Additional Parameters Get Additional Parameters ----*/
    this.appIntegrationService.additionalScriptParams.pipe(take(1)).subscribe((res) => {
      res.forEach(x => {
        x.isNewParam = true;
        scriptParams.push(x);
      });

    });

    /*---- Code For Deleted Script Parameters ----*/
    this.appIntegrationService.deletedScriptParams.pipe(take(1)).subscribe(res => {
      if (this.router?.url.includes("properties") || isProperties) {
        if (res?.length && propertiesDetails?.scriptList?.length) {
          propertiesDetails?.scriptList.forEach((x) => {
            res.forEach((p) => {
              if (Number(x?.id) === Number(p.id)) {
                if (p?.scriptParameterDataList?.length) {
                  p?.scriptParameterDataList.forEach(s => {
                    if (s?.type === 'Public' && s?.value) {
                      s.isNewParam = true;
                      s.dataType = null;
                      scriptParams.push(s);
                    }
                  });
                }
              }
            });
          });

          res.forEach((p) => {
            if (p?.scriptParameterDataList?.length) {
              p?.scriptParameterDataList.forEach((dsp) => {
                if (scriptParams?.length) {
                  scriptParams.forEach((sp) => {
                    if (dsp?.parameterName === sp?.parameterName) {
                      sp.value = dsp?.value;
                    }
                  });
                }
              });
            }
          });

        }
      } else {
        if (res?.scriptParameterDataList?.length) {
          res?.scriptParameterDataList.forEach(s => {
            if (s?.type === 'Public') {
              s.isNewParam = true;
              s.dataType = null;
              scriptParams.push(s);
            }
          });

        }
      }
    });

    this.setScriptParameters(scriptParams, propertiesDetails, isProperties, propertiesDetails?.selectedExecutables);
  }

  setScriptParameters(scriptParams: Array<any>, propertiesDetails: any, isProperties: boolean, selectedExecutables: any[]) {
    this.scriptsParameters = [];
    const currentParameterObj = {
      isDataType: true,
      isSource: true,
      isName: true,
      isValue: false
    };
    if (this.router?.url.includes("properties") || isProperties) {
      if (propertiesDetails?.locked && (propertiesDetails?.lockedUserId ? Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId) : true)) {
        this.isAddMoreBtnEnabled = true;
        this.isGlobalHiddenParamEnabled = true;
      } else {
        this.isAddMoreBtnEnabled = false;
        this.isGlobalHiddenParamEnabled = false;
      }
      if (this.isProcessCreateFromIntegration) {
        this.isAddMoreBtnEnabled = true;
        this.isGlobalHiddenParamEnabled = true;
      }
    } else {
      this.isAddMoreBtnEnabled = true;
      this.isGlobalHiddenParamEnabled = true;
    }
    if (scriptParams?.length) {
      // Below code is commented for show parameters as per script order

      // scriptParams = scriptParams.filter(
      //   (x, index, arr) => index === arr.findIndex(
      //     e => x.parameterName === e.parameterName
      //   ));
      // scriptParams.sort(function (a, b) {
      //   var textA = a.parameterName.toUpperCase();
      //   var textB = b.parameterName.toUpperCase();
      //   return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      // });

      //const clonedScriptParamsArray = JSON.parse(JSON.stringify(scriptParams));
      // this.scriptsParameters = scriptParams;


      if (this.itemType === 'integration') {
        const clonedIntParamsArray = propertiesDetails?.paramsData ? JSON.parse(JSON.stringify(propertiesDetails?.paramsData)) : [];
        if (scriptParams?.length) {
          scriptParams?.forEach((x) => {
            x.isProcessParam = x?.value ? true : false;

            if (clonedIntParamsArray?.length) {

              clonedIntParamsArray.forEach((z) => {
                if (x?.parameterName.trim() === z?.paramName.trim()) {
                  x.isProcessParam = false;
                  if (x?.securityLevel.toLowerCase() === 'high' && z?.securityLevel.toLowerCase() === 'low') {
                    z.value = this.encryptDecryptService.encrypt(z?.value);
                  } else if (x?.securityLevel.toLowerCase() === 'medium' && z?.securityLevel.toLowerCase() === 'low') {
                    z.value = this.encryptDecryptService.encrypt(z?.value);
                  } else if (x?.securityLevel.toLowerCase() === 'low' && z?.securityLevel.toLowerCase() === 'medium') {
                    z.value = this.encryptDecryptService.decrypt(z?.value);
                  }
                  x.value = z?.value;
                } else {
                  const exists = scriptParams.some(x => x?.parameterName.trim() === z?.paramName.trim());
                  if (!exists) {
                    scriptParams.push({
                      parameterName: z.paramName.trim(),
                      value: z.value,
                      isProcessParam: false,
                      isNewParam: true
                    });
                  }
                }
              });
            }
          });
        }
      } else {
        scriptParams?.forEach((x) => {
          delete x.isProcessParam;
        });
      }
      if (this.router?.url.includes("properties") || isProperties) {

        scriptParams.map(x => ((this.router?.url.includes("properties") || isProperties) && propertiesDetails?.locked && (propertiesDetails?.lockedUserId ? Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId) : true)) ? currentParameterObj.isValue = false : currentParameterObj.isValue = true);

        scriptParams.map((item) => {
          if (propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) {
            item.currentParameterObj = {
              isDataType: true,
              isSource: true,
              // isName: item?.isNewParam ? false : true,
              isName: false,
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
        // Requirement change - Parameters should delete in add and update case
        this.isAddMoreBtnEnabled = true;
        scriptParams.map(x => currentParameterObj.isValue = false);

        scriptParams.map((item) => {
          item.currentParameterObj = {
            isDataType: true,
            isSource: true,
            // isName: item?.isNewParam ? false : true,
            isName: false,
            isValue: false
          };
        });
      }
      this.scriptsParameters = scriptParams;
      this.parametersForm.setControl('currentParameter', this.setExistingParamerters(scriptParams, currentParameterObj, selectedExecutables));
    } else {
      if (this.itemType === 'integration') {
        const clonedIntParamsArray = propertiesDetails?.paramsData ? JSON.parse(JSON.stringify(propertiesDetails?.paramsData)) : [];
        if (clonedIntParamsArray?.length) {

          clonedIntParamsArray.forEach((z) => {
            scriptParams.push({
              parameterName: z.paramName.trim(),
              value: z.value,
              isProcessParam: false,
              isNewParam: true
            });
          });
          scriptParams.map(x => ((this.router?.url.includes("properties") || isProperties) && propertiesDetails?.locked && (propertiesDetails?.lockedUserId ? Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId) : true)) ? currentParameterObj.isValue = false : currentParameterObj.isValue = true);

          scriptParams.map((item) => {
            if (propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) {
              item.currentParameterObj = {
                isDataType: true,
                isSource: true,
                // isName: item?.isNewParam ? false : true,
                isName: false,
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
          this.scriptsParameters = scriptParams;
          this.parametersForm.setControl('currentParameter', this.setExistingParamerters(scriptParams, currentParameterObj, selectedExecutables));
        }
      }
    }
  }
  /*============== END Get Script Parameters ==============*/

  /*============== Set display data type in form ==============*/
  setParametersDataType() {
    const formArray = this.parametersForm.get('currentParameter') as FormArray;
    if (!formArray) {
      console.warn('currentParameter FormArray not found!');
      return;
    }

    const processParams = this.appIntegrationDataService.getProcessParamsData();
    formArray.controls.forEach((group: AbstractControl) => {
      const paramGroup = group as FormGroup;
      const dataType = paramGroup.get('dataType')?.value;
      const paramName = paramGroup.get('name')?.value;
      const value = paramGroup.get('value')?.value;
      const isProcessParam = processParams.some(p => p.paramName.toString() === paramName.toString() && p.value.toString() === value.toString());
      const newDisplay = isProcessParam
        ? 'Process' + (dataType ? ', ' + dataType : '')
        : dataType;
      paramGroup.get('displayDataType')?.setValue(newDisplay);
    });
  }

  /*============== End Set display data type in form ==============*/
  resetIntialFormValue() {
    this.initialFormValue = this.parametersForm.getRawValue();
  }

  /*============== Show Parameters Descriptions ==============*/
  getParamsDescription(control: FormGroup, scriptName: string): string {
    const currentDesc = control.get('description')?.value || '';
    let results: { scriptName: string; description: string; gi: number }[] = [];

    // If NOT Shared Parameters → return own description
    if (scriptName !== 'Shared Parameters') {
      return currentDesc.replace(/\n/g, '<br>');
    }

    const groupedArray = this.parametersForm.get('groupedParameters') as FormArray;
    if (!groupedArray) return currentDesc.replace(/\n/g, '<br>');

    const controlName = control.get('name')?.value;

    groupedArray.controls.forEach((groupCtrl, index) => {
      const group = groupCtrl as FormGroup;
      const groupName = group.get('scriptName')?.value;

      if (groupName === 'Shared Parameters') return;

      const formArray = group.get('formArray') as FormArray;
      if (!formArray) return;

      const matchedParam = formArray.controls.find(p => p.get('name')?.value === controlName);

      if (matchedParam) {
        // Compute display index using your getDisplayIndex function
        const displayIndex = this.getDisplayIndex(groupedArray.value, index);

        results.push({
          scriptName: groupName,
          description: matchedParam.get('description')?.value || '',
          gi: displayIndex
        });
      }
    });

    if (!results.length) return currentDesc.replace(/\n/g, '<br>');

    const htmlResults = results
      .map(r => `${r.gi}. ${r.scriptName}<br>${r.description.replace(/\n/g, '<br>')}`)
      .join('<br>');

    return htmlResults;
  }


  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    const currentParameterObj = {
      isDataType: true,
      isSource: true,
      //isName: true,
      isName: false,
      isValue: false
    };;
    this.isGlobalHiddenParamEnabled = isPITLock;
    if (isPITLock) {
      this.isAddMoreBtnEnabled = true;
      if (this.scriptsParameters?.length) {
        // this.scriptsParameters.map(x => currentParameterObj.isValue = false);

        this.scriptsParameters.map((item) => {
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
      this.showHidden = false
      this.isAddMoreBtnEnabled = false;
      this.isGlobalHiddenParamEnabled = false;
      if (this.scriptsParameters?.length) {
        // this.scriptsParameters.map(x => currentParameterObj.isValue = true);

        this.scriptsParameters.map((item) => {
          item.currentParameterObj = {
            isDataType: true,
            isSource: true,
            isName: true,
            isValue: true
          };
        });
      }
    }
    this.parametersForm.setControl('currentParameter', this.setExistingParamerters(this.scriptsParameters, currentParameterObj, []));
  }
  /*============ END Get PIT Lock and Enable/Disable Form Feilds ============*/

  /*============== Reset Parameters Data ==============*/
  resetParameters() {
    this.parametersForm.reset();
  }
  /*============== END Reset Parameters Data ==============*/

  /*=============== Delete Additional Parameters ===============*/

  resetParamValue(groupIndex: number, paramIndex: number): void {
    const groupedArray = this.parametersForm.get('groupedParameters') as UntypedFormArray;
    const group = groupedArray.at(groupIndex) as UntypedFormGroup;
    const formArray = group.get('formArray') as UntypedFormArray;
    const paramGroup = formArray.at(paramIndex) as UntypedFormGroup;
    const originalValue = this.initialFormValue.groupedParameters[groupIndex].formArray[paramIndex].value;
    paramGroup.patchValue({ value: originalValue });
  }


  // removeAdditionalParams(groupIndex: number, paramIndex: number) {
  //   const dialogRef = this.dialog.open(ConfirmationComponent, {
  //     width: '700px',
  //     maxHeight: '600px',
  //     data: `Are you sure you want to remove additional parameter?`
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       const groupedArray = this.parametersForm.get('groupedParameters') as FormArray;
  //       if (groupedArray && groupedArray.at(groupIndex)) {
  //         const paramArray = groupedArray.at(groupIndex).get('formArray') as FormArray;
  //         if (paramArray && paramArray.length > paramIndex) {
  //           // Remove from form
  //           paramArray.removeAt(paramIndex);
  //           // Remove from initial snapshot
  //           this.initialFormValue.groupedParameters[groupIndex].formArray.splice(paramIndex, 1);
  //         }
  //       }
  //     }
  //   });
  // }

  removeAdditionalParams(groupIndex: number, paramIndex: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `Are you sure you want to remove additional parameter?`
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const groupedArray = this.parametersForm.get('groupedParameters') as FormArray;
        if (groupedArray && groupedArray.at(groupIndex)) {
          const group = groupedArray.at(groupIndex) as FormGroup;
          const scriptName = group.get('scriptName')?.value;
          const paramArray = group.get('formArray') as FormArray;

          if (paramArray && paramArray.length > paramIndex) {
            // Remove from form
            paramArray.removeAt(paramIndex);

            // Remove from initial snapshot
            this.initialFormValue.groupedParameters[groupIndex].formArray.splice(paramIndex, 1);

            // If Custom Parameters group is now empty, remove the entire group
            if (scriptName === 'Custom Parameters' && paramArray.length === 0) {
              groupedArray.removeAt(groupIndex);
              this.initialFormValue.groupedParameters.splice(groupIndex, 1);
              this.isShowGroupParameters.splice(groupIndex, 1);
            }
          }
        }
      }
    });
  }

  /*=============== END Delete Additional Parameters ===============*/

  // validateParameters(): boolean {
  //   this.parametersForm.markAllAsTouched();

  //   let hasDuplicate = false;
  //   const duplicateNames = new Set<string>();

  //   const groupedArray = this.parametersForm.get('groupedParameters') as FormArray;
  //   if (!groupedArray) return false;

  //   // name → list of occurrences
  //   const paramMap = new Map<
  //     string,
  //     { control: AbstractControl; scriptName: string; index: number }[]
  //   >();

  //   // STEP 1: Clear previous duplicate errors ONLY from Custom Parameters
  //   groupedArray.controls.forEach(groupControl => {
  //     const groupForm = groupControl as FormGroup;
  //     const scriptName = groupForm.get('scriptName')?.value;
  //     const formArray = groupForm.get('formArray') as FormArray;

  //     if (scriptName !== 'Custom Parameters') return;

  //     formArray.controls.forEach(paramControl => {
  //       const nameControl = (paramControl as FormGroup).get('name');
  //       const errors = nameControl?.errors;

  //       if (errors?.['duplicateName']) {
  //         delete errors['duplicateName'];
  //         nameControl?.setErrors(
  //           Object.keys(errors).length ? errors : null
  //         );
  //       }
  //     });
  //   });

  //   // STEP 2: Collect all parameters
  //   groupedArray.controls.forEach(groupControl => {
  //     const groupForm = groupControl as FormGroup;
  //     const scriptName = groupForm.get('scriptName')?.value;
  //     const formArray = groupForm.get('formArray') as FormArray;

  //     formArray.controls.forEach((paramControl, index) => {
  //       const paramGroup = paramControl as FormGroup;
  //       const nameControl = paramGroup.get('name');

  //       const name = nameControl?.value?.trim();
  //       if (!name) return;

  //       const p = paramGroup.value;
  //       if (
  //         p?.currentParameterObj?.isName ||
  //         (scriptName !== 'Shared Parameters' && p?.isShared)
  //       ) {
  //         return;
  //       }

  //       if (!paramMap.has(name)) {
  //         paramMap.set(name, []);
  //       }

  //       paramMap.get(name)!.push({
  //         control: nameControl!,
  //         scriptName,
  //         index,
  //       });
  //     });
  //   });

  //   // STEP 3: Apply duplicate error with PRIORITY
  //   paramMap.forEach((entries, name) => {
  //     if (entries.length < 2) return;

  //     hasDuplicate = true;
  //     duplicateNames.add(name);

  //     // 1️⃣ Prefer Custom Parameters
  //     const customEntries = entries.filter(
  //       e => e.scriptName === 'Custom Parameters'
  //     );

  //     let target;

  //     if (customEntries.length > 0) {
  //       // If multiple customs → mark the last added
  //       target = customEntries[customEntries.length - 1];
  //     } else {
  //       // No custom → mark the last added overall
  //       target = entries[entries.length - 1];
  //     }

  //     target.control.setErrors({
  //       ...(target.control.errors || {}),
  //       duplicateName: true,
  //     });
  //   });

  //   // STEP 4: Message handling
  //   if (hasDuplicate) {
  //     const duplicateList = Array.from(duplicateNames)
  //       .map(name => `${name}`)
  //       .join(', ');
  //     this.messageService.add({
  //       key: 'appIntErrorKey',
  //       severity: 'error',
  //       summary: '',
  //       // detail: 'Parameters with the same name are not allowed.',
  //       detail: `Parameters with same name are not allowed. Duplicate parameters found. ${duplicateList}. Please ensure all parameter names are unique. Rename or remove the duplicate to resolve this issue.`,
  //     });
  //     return false;
  //   }

  //   // STEP 5: Normal validation
  //   if (this.parametersForm.valid) {
  //     return true;
  //   }

  //   this.messageService.add({
  //     key: 'appIntInfoKey',
  //     severity: 'warn',
  //     summary: '',
  //     detail: 'You have entered invalid value for one or more parameters.',
  //   });

  //   return false;
  // }

  // ...existing code...

  private validateParametersCore(): { errors: string[]; isValid: boolean; duplicateNames: string[] } {
    this.parametersForm.markAllAsTouched();

    const errors: string[] = [];
    const duplicateNames = new Set<string>();

    const groupedArray = this.parametersForm.get('groupedParameters') as FormArray;
    if (!groupedArray) {
      return {
        errors: ['Parameters form is not available.'],
        isValid: false,
        duplicateNames: []
      };
    }

    const paramMap = new Map<string, { control: AbstractControl; scriptName: string; index: number }[]>();

    // Clear old duplicate errors only from Custom Parameters
    groupedArray.controls.forEach(groupControl => {
      const groupForm = groupControl as FormGroup;
      const scriptName = groupForm.get('scriptName')?.value;
      const formArray = groupForm.get('formArray') as FormArray;

      if (scriptName !== 'Custom Parameters') return;

      formArray.controls.forEach(paramControl => {
        const nameControl = (paramControl as FormGroup).get('name');
        const ctrlErrors = nameControl?.errors;
        if (ctrlErrors?.['duplicateName']) {
          delete ctrlErrors['duplicateName'];
          nameControl?.setErrors(Object.keys(ctrlErrors).length ? ctrlErrors : null);
        }
      });
    });

    // Collect parameters
    groupedArray.controls.forEach(groupControl => {
      const groupForm = groupControl as FormGroup;
      const scriptName = groupForm.get('scriptName')?.value;
      const formArray = groupForm.get('formArray') as FormArray;

      formArray.controls.forEach((paramControl, index) => {
        const paramGroup = paramControl as FormGroup;
        const nameControl = paramGroup.get('name');
        const name = nameControl?.value?.trim();
        if (!name) return;

        const p = paramGroup.value;
        if (p?.currentParameterObj?.isName || (scriptName !== 'Shared Parameters' && p?.isShared)) {
          return;
        }

        if (!paramMap.has(name)) {
          paramMap.set(name, []);
        }

        paramMap.get(name)?.push({ control: nameControl, scriptName, index });
      });
    });

    // Apply duplicate errors with same priority
    paramMap.forEach((entries, name) => {
      if (entries.length < 2) return;

      duplicateNames.add(name);
      const customEntries = entries.filter(e => e.scriptName === 'Custom Parameters');
      const target = customEntries.length
        ? customEntries[customEntries.length - 1]
        : entries[entries.length - 1];

      target.control.setErrors({
        ...(target.control.errors || {}),
        duplicateName: true
      });
    });

    if (duplicateNames.size) {
      errors.push(
        `Parameters with same name are not allowed. Duplicate parameters found: ${Array.from(duplicateNames).join(', ')}.`
      );
    }

    else if (!this.parametersForm.valid) {
      errors.push('You have entered invalid value for one or more parameters.');
    }

    return {
      errors,
      isValid: errors.length === 0,
      duplicateNames: Array.from(duplicateNames)
    };
  }

  validateParameters(): boolean {
    const result = this.validateParametersCore();

    if (!result.isValid) {
      if (result.duplicateNames.length) {
        this.messageService.add({
          key: 'appIntErrorKey',
          severity: 'error',
          summary: '',
          detail: `Parameters with same name are not allowed. Duplicate parameters found. ${result.duplicateNames.join(', ')}. Please ensure all parameter names are unique. Rename or remove the duplicate to resolve this issue.`,
        });
        return false;
      }

      this.messageService.add({
        key: 'appIntInfoKey',
        severity: 'warn',
        summary: '',
        detail: 'You have entered invalid value for one or more parameters.',
      });
      return false;
    }

    return true;
  }

  validateParametersWithError(): { errors: string[]; isValid: boolean } {
    const { errors, isValid } = this.validateParametersCore();
    return { errors, isValid };
  }

  private isValueAlreadyEncrypted(value: string): boolean {
    if (!value) {
      return false;
    }

    try {
      const decryptedValue = this.encryptDecryptService.decrypt(value);
      if (!decryptedValue) {
        return false;
      }

      const reEncryptedValue = this.encryptDecryptService.encrypt(decryptedValue);
      return reEncryptedValue === value;
    } catch {
      return false;
    }
  }

  /*============== Get Parameters Data ==============*/
  // getParametersData() {
  //   this.parametersForm.markAllAsTouched();

  //   if (!this.parametersForm?.valid) {
  //     return false;
  //   }

  //   const parameters = [];
  //   const paramsValue = this.parametersForm.value; // get all form data
  //   const processParamData = this.appIntegrationDataService.getProcessParamsData();
  //   if (paramsValue?.groupedParameters?.length) {
  //     paramsValue.groupedParameters.forEach(group => {
  //       const scriptName = group.scriptName;
  //       const paramList = group.formArray || [];

  //       paramList.forEach(x => {
  //         // Trim and set paramName
  //         x.paramName = x?.name ? x.name.trim() : '';

  //         // Encrypt if needed
  //         x.value = x?.value
  //           ? (x?.securityLevel &&
  //             (x.securityLevel.toLowerCase() === 'high' || x.securityLevel.toLowerCase() === 'medium'))
  //             ? this.encryptDecryptService.encrypt(x.value.trim())
  //             : x.value.trim()
  //           : '';

  //         // Set type
  //         x.type = x?.paramType;

  //         // Delete unwanted keys to match original behavior
  //         delete x.dataType;
  //         delete x.isNewParam;
  //         delete x.probableValues;
  //         delete x.source;
  //         delete x.name;
  //         delete x.description;
  //         delete x.paramType;
  //         delete x.displayDataType;
  //         delete x.scriptName;
  //         delete x?.isShared;
  //         delete x?.storedValue;
  //         // Skip duplicates that already exist in processParamData
  //         const existsInProcessParamData = processParamData.some(
  //           p => p.paramName === x.paramName && p.value === x.value
  //         );

  //         if (x.paramName && x.value && !existsInProcessParamData) {
  //           parameters.push(x);
  //         }
  //       });
  //     });
  //   }
  //   return parameters;
  // }

  getParametersData() {
    this.parametersForm.markAllAsTouched();

    if (!this.parametersForm?.valid) {
      return false;
    }

    const parameters = [];
    const paramsValue = this.parametersForm.value; // Get all form data
    const processParamData = this.appIntegrationDataService.getProcessParamsData();

    if (paramsValue?.groupedParameters?.length) {
      paramsValue.groupedParameters.forEach(group => {
        const paramList = group.formArray || [];

        paramList.forEach(x => {
          x.paramName = x?.name ? String(x.name).trim() : '';

          // Normalize value first (do not lose boolean false)
          const isBooleanType = (x?.dataType || '').toLowerCase() === 'boolean';
          let normalizedValue: any = x?.value;

          if (isBooleanType) {
            const normalized = String(normalizedValue ?? '').trim().toLowerCase();

            if (normalizedValue === true || normalized === 'true' || normalized === '1') {
              normalizedValue = 'yes';
            } else if (normalizedValue === false || normalized === 'false' || normalized === '0') {
              normalizedValue = 'no';
            } else if (normalized === 'yes' || normalized === 'no') {
              normalizedValue = normalized;
            } else {
              normalizedValue = '';
            }
          }

          const valueAsString =
            normalizedValue === null || normalizedValue === undefined
              ? ''
              : String(normalizedValue).trim();

          const isSecureValue = x?.securityLevel &&
            (x.securityLevel.toLowerCase() === 'high' || x.securityLevel.toLowerCase() === 'medium');

          x.value = valueAsString
            ? isSecureValue
              ? this.isValueAlreadyEncrypted(valueAsString)
                ? valueAsString
                : this.encryptDecryptService.encrypt(valueAsString)
              : valueAsString
            : '';

          x.type = x?.paramType;

          const existsInProcessParamData = processParamData.some(
            p => p.paramName === x.paramName && p.value === x.value
          );

          if (x.paramName && x.value && !existsInProcessParamData) {
            const cleanedParam = {
              id: x.id,
              isprotected: x.isprotected,
              paramName: x.paramName,
              securityLevel: x.securityLevel,
              type: x.type,
              value: x.value,
            };

            parameters.push(cleanedParam);
          }
        });
      });
    }

    return parameters;
  }

  /*============== END Get Parameters Data ==============*/

  handleBlur(currentValue: string, parameterFormGroup) {
    if (currentValue == "") {
      const processParamData = this.appIntegrationDataService.getProcessParamsData();
      const processData = processParamData.find((param) => param.paramName.toString() === parameterFormGroup.controls.name.value.toString())
      if (processData) {
        parameterFormGroup.get('value')?.setValue(processData.value);
      }
    }
  }

  /*============== Store Current Data For Back and Forth ==============*/
  storeCurrentParamsData() {
    this.parametersForm.markAllAsTouched();
    if (this.parametersForm?.valid) {
      const paramsValue = this.parametersForm.getRawValue();
      this.appIntegrationDataService.storeCurrentParamsData(paramsValue?.groupedParameters);
    }
  }
  /*============== END Store Current Data For Back and Forth ==============*/

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
    this.getScriptParamsSub.unsubscribe();
  }

}
