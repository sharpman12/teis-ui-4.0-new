import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, FormArray, UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AppIntegrationDataService } from '../../app-integration-data.service';
import { AppIntegrationService } from '../../app-integration.service';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { Constants } from 'src/app/shared/components/constants';
import { uniqueNameValidator } from 'src/app/shared/validation/unique-name-validator';

@Component({
  selector: 'app-properties-web-service-parameters',
  templateUrl: './properties-web-service-parameters.component.html',
  styleUrls: ['./properties-web-service-parameters.component.scss']
})
export class PropertiesWebServiceParametersComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number = null;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isProperties: boolean = false;
  webServiceParametersForm: UntypedFormGroup;
  paramsDescriptionObj: any = null;
  isAddMoreBtnEnabled: boolean = true;
  currentUser: any = null;
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

  ngOnInit(): void {
    this.createForm();
  }

  /*============= Create Form ============*/
  createForm() {
    this.webServiceParametersForm = this.fb.group({
      currentParameter: this.fb.array([
        this.addParameters(false)
      ], uniqueNameValidator())
    });
  }
  /*============= END Create Form ============*/

  /*================== Add More Parameters =================*/
  addParameters(additionalParam: boolean): UntypedFormGroup {
    return this.fb.group({
      dataType: [{ value: '', disabled: true }],
      source: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: false }],
      description: [{ value: '', disabled: false }],
      id: [{ value: '', disabled: false }],
      value: [{ value: '', disabled: false }],
      probableValues: [{ value: [], disabled: false }],
      paramType: [{ value: '', disabled: false }],
      securityLevel: [{ value: additionalParam ? 'low' : '', disabled: false }],
      isprotected: [{ value: false, disabled: false }],
      isNewParam: [{ value: additionalParam, disabled: false }],
      disable: [{ value: false, disabled: false }]
    });
  }

  addMoreParameters(): void {
    (<UntypedFormArray>this.webServiceParametersForm.get('currentParameter')).push(this.addParameters(true));
  }
  /*================== END Add More Parameters =================*/

  /*================== Set Existing Parameters =================*/
  setExistingParamerters(parameters: any[], isCtrlDisabled: any): UntypedFormArray {
    const formArray = new UntypedFormArray([], uniqueNameValidator());
    let securityLevel;
    parameters.forEach(p => {
      if (p?.securityLevel) {
        securityLevel = p?.securityLevel.toLowerCase();
      } else {
        securityLevel = p?.securityLevel;
      }
      formArray.push(this.fb.group({
        dataType: [{ value: p?.dataType, disabled: p?.currentParameterObj?.isDataType }],
        source: [{ value: p?.source, disabled: p?.currentParameterObj?.isSource }],
        name: [{ value: p?.name, disabled: p?.currentParameterObj?.isName }],
        id: [{ value: p?.id, disabled: false }],
        description: [{ value: p?.description, disabled: false }],
        value: [{ value: p?.value, disabled: p?.currentParameterObj?.isValue }],
        probableValues: [{ value: p?.probableValues, disabled: false }],
        paramType: [{ value: p?.type, disabled: false }],
        securityLevel: [{ value: securityLevel, disabled: false }],
        isprotected: [{ value: p?.optionProtected, disabled: false }],
        isNewParam: [{ value: p?.isNewParam, disabled: false }],
        disable: [{ value: p?.disable, disabled: false }],
      }));
    });
    return formArray;
  }
  /*================== END Set Existing Parameters =================*/

  /*============== Show Parameters Descriptions ==============*/
  getParamsDescription(desc: string, isNewParams: Boolean) {
    this.paramsDescriptionObj = {
      description: desc,
      isNewParams: isNewParams
    };
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
        const formsVal = this.webServiceParametersForm.get('currentParameter') as FormArray;
        formsVal.removeAt(index);
      }
    });
  }
  /*=============== END Delete Additional Parameters ===============*/

  setScriptParams(propertiesDetails: any) {
    const parameters = propertiesDetails?.appParamsDataList.filter((x) => x?.name !== 'URI');
    if (parameters?.length) {
      parameters.sort(function (a, b) {
        var textA = a.name.toUpperCase();
        var textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      if (propertiesDetails?.locked && (propertiesDetails?.lockedUserId ? Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId) : true)) {
        this.isAddMoreBtnEnabled = true;
      } else {
        this.isAddMoreBtnEnabled = false;
      }
      parameters.map((x) => {
        if (propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) {
          x.currentParameterObj = {
            isDataType: true,
            isSource: true,
            isName: Number(x?.type) === 1 ? false : true,
            isValue: Number(x?.type) === 1 ? false : true
          };
        } else {
          x.currentParameterObj = {
            isDataType: true,
            isSource: true,
            isName: true,
            isValue: true
          };
        }
      });
      this.parametersArr = parameters;
      const currentParameterObj = {
        isDataType: true,
        isSource: true,
        isName: true,
        isValue: false
      };
      this.webServiceParametersForm.setControl('currentParameter', this.setExistingParamerters(this.parametersArr, currentParameterObj));
    }
  }

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    const currentParameterObj = {
      isDataType: true,
      isSource: true,
      isName: false,
      isValue: false
    };
    if (isPITLock) {
      this.isAddMoreBtnEnabled = true;
      if (this.parametersArr?.length) {
        this.parametersArr.map((item) => {
          item.currentParameterObj = {
            isDataType: true,
            isSource: true,
            isName: Number(item?.type) === 1 ? false : true,
            isValue: Number(item?.type) === 1 ? false : true
          };
        });
      }
    } else {
      this.isAddMoreBtnEnabled = false;
      if (this.parametersArr?.length) {
        this.parametersArr.map((item) => {
          item.currentParameterObj = {
            isDataType: true,
            isSource: true,
            isName: Number(item?.type) === 1 ? false : true,
            isValue: Number(item?.type) === 1 ? false : true
          };
        });
      }
    }
  }

  /*============== Get Parameters Data ==============*/
  getWebServiceParameters() {
    this.webServiceParametersForm.markAllAsTouched();
    if (this.webServiceParametersForm?.valid) {
      const parameters = [];
      const paramsValue = this.webServiceParametersForm.getRawValue();
      const params = JSON.parse(JSON.stringify(paramsValue));
      if (params?.currentParameter?.length) {
        params?.currentParameter.forEach((x) => {
          x.appRegId = x?.id;
          x.name = x?.name ? x?.name.trim() : '';
          x.value = x?.value ? x?.value.trim() : '';
          x.type = x?.paramType ? x?.paramType : x?.isNewParam ? '1' : '0';
          delete x?.dataType;
          delete x?.isNewParam;
          delete x?.probableValues;
          delete x?.source;
          delete x?.isprotected;
          delete x?.securityLevel;
          delete x?.description;
          delete x?.paramType;
          // delete x?.currentParameterObj;
          if (x?.name && x?.value) {
            parameters.push(x);
          }
        });
      }
      return parameters;
    } else {
      return false;
    }
  }

  validateParameters() {
    this.webServiceParametersForm.markAllAsTouched();
    const nameCount = new Map<string, number>();
    let hasDuplicate = false;
    const formArray = this.webServiceParametersForm.get('currentParameter') as FormArray;
    formArray.controls.forEach((group: AbstractControl) => {
      const paramGroup = group as FormGroup;
      const paramName = paramGroup.get('name')?.value?.trim()?.toLowerCase();
      if (paramName) {
        const count = nameCount.get(paramName) || 0;
        nameCount.set(paramName, count + 1);
        if (count + 1 > 1) {
          hasDuplicate = true;
        }
      }
    });

    if (this.webServiceParametersForm?.valid) {
      return true;
    } else {
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'You have entered invalid value for parameter(s).' });
      return false;
    }
  }

  validateParametersWithError(): { errors: string[]; isValid: boolean } {
    this.webServiceParametersForm.markAllAsTouched();
    const errors: string[] = [];

    const nameCount = new Map<string, number>();
    let hasDuplicate = false;
    const formArray = this.webServiceParametersForm.get('currentParameter') as FormArray;

    formArray.controls.forEach((group: AbstractControl) => {
      const paramGroup = group as FormGroup;
      const paramName = paramGroup.get('name')?.value?.trim()?.toLowerCase();

      if (paramName) {
        const count = nameCount.get(paramName) || 0;
        nameCount.set(paramName, count + 1);
        if (count + 1 > 1) {
          hasDuplicate = true;
        }
      }
    });

    if (hasDuplicate) {
      errors.push('Duplicate parameter names are not allowed in Webservice.');
    }

    if (!this.webServiceParametersForm?.valid) {
      errors.push('You have entered invalid value for parameter(s) in Webservice.');
    }

    if (errors.length) {
      return { errors: errors, isValid: false };
    }

    return { errors: [], isValid: true };
  }

  ngOnDestroy(): void {

  }
}
