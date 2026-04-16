import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { DevelopmentService } from '../../development.service';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { HttpErrorResponse } from '@angular/common/http';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { UserSettingService } from 'src/app/dashboard/user-settings/user-setting.service';

@Component({
  selector: 'app-debug-parameter',
  templateUrl: './debug-parameter.component.html',
  styleUrls: ['./debug-parameter.component.scss']
})
export class DebugParameterComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  parametersForm: UntypedFormGroup;
  applicationParametersForm: UntypedFormGroup;
  globalParametersForm: UntypedFormGroup;
  removedParams: Array<any> = [];
  debugParameters: any[] = [];
  isScriptDebugParameterShow: boolean = true;
  scriptEngineGrpName: string = '';
  scriptEngineName: string = '';

  private saveDebugParameterSub = Subscription.EMPTY;
  private getUserSettingSub = Subscription.EMPTY;
  private getAdditionalInfoSub = Subscription.EMPTY;
  private getScriptEngineInfoSub = Subscription.EMPTY;

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private dialogRef: MatDialogRef<DebugParameterComponent>,
    private fb: UntypedFormBuilder,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService,
    private encryptDecryptService: EncryptDecryptService,
    private userSettingService: UserSettingService
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit(): void {
    // Initialize any necessary data or state here
    this.createForm();

    this.scriptEngineGrpName = this.dialogData?.script?.scriptEngineGroupName;
    this.scriptEngineName = this.dialogData?.script?.debugSeName;

    const currentParameterObj = {
      isDataType: true,
      isSource: true,
      isName: false,
      isValue: false
    };

    this.parametersForm.setControl('currentParameter', this.setExistingParamerters(this.dialogData?.parameters, currentParameterObj));
  }

  hideAndShowScriptDebugParameters() {
    this.isScriptDebugParameterShow = !this.isScriptDebugParameterShow;

    if (!this.isScriptDebugParameterShow) {
      this.getAdditionalInfo();
    }
  }

  /*================== Create Form =================*/
  createForm(): void {
    this.parametersForm = this.fb.group({
      currentParameter: this.fb.array([
        this.addParameters(false)
      ])
    });

    this.applicationParametersForm = this.fb.group({
      appParameter: this.fb.array([
        this.addParameters(false)
      ])
    });

    this.globalParametersForm = this.fb.group({
      globalParameter: this.fb.array([
        this.addParameters(false)
      ])
    });
  }
  /*================== END Create Form =================*/

  /*================== Add More Parameters =================*/
  addParameters(additionalParam: boolean): UntypedFormGroup {
    return this.fb.group({
      paramId: [{ value: '', disabled: true }],
      dataType: [{ value: '', disabled: true }],
      // source: [{ value: '', disabled: true }],
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

  /*================== Set Existing Parameters =================*/
  setExistingParamerters(parameters: any[], isCtrlDisabled: any): UntypedFormArray {
    // Sort parameters A–Z by parameterName
    parameters.sort((a, b) =>
      (a?.parameterName || '').localeCompare(b?.parameterName || '')
    );

    const formArray = new UntypedFormArray([]);
    let securityLevel;
    parameters.forEach((p) => {
      securityLevel = (p.hasOwnProperty('securityLevel') && p?.securityLevel) ? p?.securityLevel.toLowerCase() : p?.securityLevel;

      if (p.hasOwnProperty('value') && p?.value && p.hasOwnProperty('dataType') && p?.dataType) {
        if (p.value && p?.dataType.toLowerCase() === 'boolean') {
          p.value = p?.value.toLowerCase() === 'yes' ? 'true' : p?.value.toLowerCase() === 'no' ? 'false' : p?.value === '1' ? 'true' : p?.value === '0' ? 'false' : p?.value;
        }
      }

      formArray.push(this.fb.group({
        paramId: [{ value: p?.id, disabled: true }],
        dataType: [{ value: p?.dataType, disabled: isCtrlDisabled.isDataType }],
        // source: [{ value: '', disabled: isCtrlDisabled.isSource }],
        name: [{ value: p?.parameterName, disabled: isCtrlDisabled.isName }],
        value: [{ value: p?.value, disabled: isCtrlDisabled.isValue }],
        probableValues: [{ value: p?.probableValues, disabled: false }],
        paramType: [{ value: p?.type, disabled: false }],
        securityLevel: [{ value: securityLevel, disabled: false }],
        isNewParam: [{ value: false, disabled: false }],
      }));
    });
    return formArray;
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

  getUserSettings(module: string, paramsArr: Array<any>, debugSeId: string, debugSeUrl: string): void {
    const obj = {
      function: '',
      parent_id: '',
      parameterName: '',
      moduleCode: module
    };
    this.getUserSettingSub = this.userSettingService.getUserSetting(obj).subscribe((res) => {
      if (res?.length) {
        const settings = res.find(param => param.action === 'StoreParameter');
        if (settings?.value.toLowerCase() === 'true' || settings?.value.toLowerCase() === 'yes') {
          this.saveDebugParameters(paramsArr, debugSeId, debugSeUrl);
        } else {
          this.dialogData.script.debugParameters = paramsArr;
          this.scriptStateService.updateScripts(this.dialogData?.script, this.dialogData?.script?.lockInfo);
          this.scriptStateService.sharedSelectedScriptData(this.dialogData?.script);
          this.dialogRef.close({ isSave: true, data: res });
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

  /*================== Get Additional Information =================*/
  getAdditionalInfo(): void {
    const clientId = this.dialogData?.script?.tabId;
    const obj = {
      jsonMap: null,
      headers: null,
      clientId: [`${clientId}`],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: this.dialogData?.script?.type.toLowerCase() === 'userscript' ? this.dialogData?.script?.workspaceId : null,
      scriptId: this.dialogData?.script?.scriptId,
      userName: this.currentUser?.userName,
      scriptType: this.dialogData?.script?.isSystemLibrary ? 'systemLibrary' : this.dialogData?.script?.type,
      debugSettingUse: true,
      triggerScript: this.dialogData?.script?.triggerScript,
      debugSeId: this.dialogData?.script?.debugSeId,
      debugSeUrl: this.dialogData?.script?.debugSeUrl,
      superAdmin: this.currentUser?.superAdminUser,
      adminOrOuUser: this.currentUser?.adminUser ? true : (!this.currentUser?.superAdminUser && !this.currentUser?.adminUser) ? true : false,
      attachSysLibIds: [],
      attachedReferenceIds: [],
      deployedCopy: false,
      versionId: 0,
      versionCopy: false,
    };
    this.getAdditionalInfoSub = this.developmentService.getAdditionalInfo(obj).subscribe((res) => {
      if (res) {
        const applicationParams = [];
        const globalParams = [];
        const additionalParameterObj = {
          isDataType: true,
          isSource: true,
          isName: true,
          isValue: true
        };

        if (res?.applicationParam?.length) {
          res?.applicationParam.forEach((app) => {
            const params = {
              autoComplete: false,
              config: false,
              dataType: 'String',
              id: null,
              inParameter: false,
              lastUpdated: null,
              optionProtected: false,
              outParameter: false,
              parameterName: app?.paramName,
              securityLevel: 'low',
              storedValue: false,
              type: 'Public',
              updatedBy: null,
              value: app?.paramValue,
              workspaceId: null
            };
            applicationParams.push(params);
          });
          this.applicationParametersForm.setControl('appParameter', this.setExistingParamerters(applicationParams, additionalParameterObj));
        }

        if (res?.globalParam?.length) {
          res?.globalParam.forEach((glb) => {
            const params = {
              autoComplete: false,
              config: false,
              dataType: 'String',
              id: null,
              inParameter: false,
              lastUpdated: null,
              optionProtected: false,
              outParameter: false,
              parameterName: glb?.paramName,
              securityLevel: 'low',
              storedValue: false,
              type: 'Public',
              updatedBy: null,
              value: glb?.paramValue,
              workspaceId: null
            };
            globalParams.push(params);
          });
          this.globalParametersForm.setControl('globalParameter', this.setExistingParamerters(globalParams, additionalParameterObj));
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

  onSave() {
    const debugParams = [];
    const additionalParameters = [];
    const currentParameters = (<UntypedFormArray>this.parametersForm.get('currentParameter')).getRawValue();
    const parametersArr = JSON.parse(JSON.stringify(this.dialogData?.parameters));
    if (parametersArr?.length && currentParameters?.length) {
      currentParameters.forEach((param, i) => {
        if (param?.isNewParam && !param?.paramId && (param?.dataType === undefined || !param?.dataType)) {
          additionalParameters.push({
            parameterName: param.name,
            value: param.value,
            dataType: '',
            type: null,
            securityLevel: 'low'
          });
        }
      });
      currentParameters.forEach((param) => {
        parametersArr.forEach((p) => {
          if (param.name === p.parameterName) {
            debugParams.push({
              autoComplete: p?.autoComplete,
              config: p?.config,
              dataType: p?.dataType,
              id: p?.id,
              inParameter: p?.inParameter,
              optionProtected: p?.optionProtected,
              outParameter: p?.outParameter,
              parameterName: p?.parameterName,
              probableValues: p?.probableValues,
              securityLevel: (p.hasOwnProperty('securityLevel') && p?.securityLevel) ? p?.securityLevel.toLowerCase() : 'low',
              storedValue: p?.storedValue,
              type: p?.type,
              value: param?.value,
            });
          }
        });
      });
    }
    const paramsArr = [...debugParams, ...additionalParameters].filter(param => param.parameterName);
    const debugSeId = this.dialogData?.script?.debugSeId || '';
    const debugSeUrl = this.dialogData?.script?.debugSeUrl || '';
    this.getUserSettings('DEV', paramsArr, debugSeId, debugSeUrl);
    // this.saveDebugParameterSub = this.developmentService.saveDebugParameters(this.currentUser?.userName, this.dialogData?.script?.scriptId, this.dialogData?.script?.tabId, paramsArr, debugSeId, debugSeUrl).subscribe((res) => {
    //   if (res) {
    //     this.dialogData.script.debugParameters = paramsArr;
    //     this.scriptStateService.updateScripts(this.dialogData?.script, this.dialogData?.script?.lockInfo);
    //     this.scriptStateService.sharedSelectedScriptData(this.dialogData?.script);
    //     this.dialogRef.close({ isSave: true, data: res });
    //   }
    // }, (err: HttpErrorResponse) => {
    //   if (err.error instanceof Error) {
    //     // handle client side error here
    //   } else {
    //     // handle server side error here
    //   }
    // });
  }

  saveDebugParameters(paramsArr: Array<any>, debugSeId: string, debugSeUrl: string) {
    this.saveDebugParameterSub = this.developmentService.saveDebugParameters(this.currentUser?.userName, this.dialogData?.script?.scriptId, this.dialogData?.script?.tabId, paramsArr, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        this.dialogData.script.debugParameters = paramsArr;
        this.scriptStateService.updateScripts(this.dialogData?.script, this.dialogData?.script?.lockInfo);
        this.scriptStateService.sharedSelectedScriptData(this.dialogData?.script);
        this.dialogRef.close({ isSave: true, data: res });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onClose(): void {
    this.dialogRef.close({ isSave: false, data: null });
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or resources here
    this.saveDebugParameterSub.unsubscribe();
    this.getUserSettingSub.unsubscribe();
    this.getAdditionalInfoSub.unsubscribe();
    this.getScriptEngineInfoSub.unsubscribe();
  }
}
