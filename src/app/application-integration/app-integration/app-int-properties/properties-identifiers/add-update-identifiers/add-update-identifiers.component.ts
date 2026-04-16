import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { pipeOperatorNotAllowedValidator } from 'src/app/shared/validation/pipe-operator.validator';
import { AppIntegrationService } from '../../../app-integration.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { AppIntegrationDataService } from '../../../app-integration-data.service';

@Component({
  selector: 'app-add-update-identifiers',
  templateUrl: './add-update-identifiers.component.html',
  styleUrls: ['./add-update-identifiers.component.scss']
})
export class AddUpdateIdentifiersComponent implements OnInit, OnDestroy {
  identifiersForm: UntypedFormGroup;
  identifiers: Array<any> = [];
  identifiersParams: any = null;

  validationMessages = {
    identifier: {
      required: 'Please select the connected process.',
    }
  };

  formErrors = {
    identifier: ''
  };

  getIdentifiersSub = Subscription.EMPTY;
  getIdentifiersParameterSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AddUpdateIdentifiersComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService,
  ) {
    this.dialogRef.disableClose = true;
    this.createForm();
    this.getIdentifiers();
  }

  ngOnInit(): void {
    if ((this.dialogData?.isEdit || this.dialogData?.isCopy) && this.dialogData?.identifier) {
      this.editIdentifier(this.dialogData?.identifier);
      this.identifiersForm.get('identifier')?.disable();
    }
  }

  /*============ Form Creation ============*/
  createForm() {
    this.identifiersForm = this.fb.group({
      identifier: [{ value: '', disabled: false }, {
        validators: []
      }],
      selectAll: [{ value: false, disabled: false }, {
        validators: []
      }],
      identifiersStr: this.fb.array([
        this.addIdentifyString()
      ])
    });
  }
  /*============ END Form Creation ============*/

  addIdentifyString() {
    return this.fb.group({
      selected: [{ value: false, disabled: false }],
      parameterName: [{ value: '', disabled: true }],
      value: [{ value: '', disabled: true }, {
        validators: [pipeOperatorNotAllowedValidator()],
      }],
    });
  }

  splitStrAtFirstEqual(strArr: Array<string>) {
    const identifierStr = [];
    if (strArr?.length) {
      strArr.forEach((x) => {
        const index = x.indexOf('=');
        if (index === -1) {
          // If '=' is not found, return the original string in an array
          identifierStr.push(x);
        }
        identifierStr.push([x.slice(0, index), x.slice(index + 1)]);
      });
    }
    return identifierStr;
  }

  editIdentifier(identifier: any) {
    let subStrings = identifier?.identifierStr.split('|');
    let superSubStr = this.splitStrAtFirstEqual(subStrings);
    const res = {};
    const identifierArr = [];
    for (let pair of superSubStr) {
      const [key, value] = pair;
      res[key] = value;
    };
    for (const key in res) {
      if (res.hasOwnProperty(key)) {
        identifierArr.push({
          parameterName: `${key}`,
          value: `${res[key]}`
        });
      }
    }
    this.identifiersForm.patchValue({
      identifier: identifier?.id
    });
    this.onChangeIdentifiers(identifier?.id, true, identifierArr);
  }

  setExistingIdentifiers(identifiers: Array<any>) {
    const formArray = new UntypedFormArray([]);
    if (identifiers?.length) {
      identifiers.forEach(x => {
        formArray.push(this.fb.group({
          selected: [{ value: x.selected, disabled: false }],
          parameterName: [{ value: x?.parameterName, disabled: true }],
          value: [{ value: x?.value ? x?.value : '', disabled: false }, {
            validators: [pipeOperatorNotAllowedValidator()],
          }],
        }));
      });
    }
    return formArray;
  }

  /*============ Get Identifiers ============*/
  /*============ Get Identifiers ============*/
  getIdentifiers() {
    // Check cache first
    const cachedIdentifiers = this.appIntegrationDataService.getIdentifiers();
    if (cachedIdentifiers?.length) {
      const identifiersArr = JSON.parse(JSON.stringify(cachedIdentifiers));
      this.identifiers = identifiersArr;
      return;
    }

    // Only call API if cache is empty
    this.getIdentifiersSub = this.appIntegrationService.getIdentifiers().subscribe(res => {
      if (res?.length) {
        const identifiersArr = JSON.parse(JSON.stringify(res));
        this.identifiers = identifiersArr;
        this.appIntegrationDataService.storeIdentifiers(identifiersArr);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Get Identifiers ============*/

  onChangeIdentifiers(selectedIdentifier: number, isIdentifierEdit: boolean, identifierArr?: Array<any>) {
    this.getParamsByIdentifiersId(selectedIdentifier, isIdentifierEdit, identifierArr);
  }
  /*============ END Get Identifiers ============*/

  /*============ Get Parameters By Identifiers Id ============*/
  getParamsByIdentifiersId(identifiersId: number, isIdentifierEdit: boolean, identifierArr?: Array<any>) {
    this.getIdentifiersParameterSub = this.appIntegrationService.getParametersByIdentifiersId(identifiersId).subscribe((res) => {
      if (this.identifiers?.length) {
        this.identifiers.forEach((x) => {
          if (Number(x?.id) === Number(identifiersId)) {
            x.detectorParametersData = res;
          }
        });
      }
      if (res?.identifierParameterDataList?.length) {
        this.identifiersForm.patchValue({
          selectAll: false
        });
        res?.identifierParameterDataList.forEach(x => {
          x.selected = false;
        });
        this.identifiersParams = res;
        this.identifiersForm.setControl('identifiersStr', this.setExistingIdentifiers(res?.identifierParameterDataList));
        if (isIdentifierEdit) {
          // this.isCheckedIdentifier = true;
          const identifierStrArr = this.identifiersForm.getRawValue();
          identifierStrArr?.identifiersStr.forEach(item => {
            identifierArr.forEach(e => {
              if (item?.parameterName === e?.parameterName) {
                item.selected = true;
                item.value = e.value;
              }
            });
          });
          this.identifiersForm.setControl('identifiersStr', this.setExistingIdentifiers(identifierStrArr?.identifiersStr));
          this.onSelectIdentifier();
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
  /*============ Get Parameters By Identifiers Id ============*/

  onSelectIdentifier() {
    const identifierStrArr = this.identifiersForm.getRawValue()?.identifiersStr;
    let result = identifierStrArr.every(element => element?.selected === true);
    let isChecked = identifierStrArr.some(item => item?.selected === true);
    // this.isCheckedIdentifier = isChecked;
    // this.handleSharedIdentifierSelection(isChecked);
    this.identifiersForm.patchValue({
      selectAll: result
    });
  }

  onSelectDeselectAll(isSelected: boolean) {
    // this.isCheckedIdentifier = isSelected;
    const identifierStr = this.identifiersForm.getRawValue()?.identifiersStr;
    if (isSelected) {
      if (identifierStr?.length) {
        identifierStr.forEach(x => {
          x.selected = true
        });
      }
      // this.handleSharedIdentifierSelection(true);

      this.identifiersForm.setControl('identifiersStr', this.setExistingIdentifiers(identifierStr));
    } else {
      if (identifierStr?.length) {
        identifierStr.forEach(x => {
          x.selected = false
        });
      }
      // this.handleSharedIdentifierSelection(false);
      this.identifiersForm.setControl('identifiersStr', this.setExistingIdentifiers(identifierStr));
    }
  }

  changeValue(event) {
    // if (this.isEditIdentifierParams) {
    //   this.handleSharedIdentifierSelection(true);
    // }
  }

  addUpdateIdentifiersStr() {
    const identifiers = this.identifiersForm.getRawValue();
    const selectedIdentifiersStr = [];
    const generatedStr = [];
    const paramsArr = [];
    if (identifiers?.identifiersStr?.length) {
      identifiers?.identifiersStr.forEach(x => {
        if (x.selected) {
          selectedIdentifiersStr.push(x);
        }
      });
    }

    if (this.identifiersParams?.identifierParameterDataList?.length && selectedIdentifiersStr?.length) {
      // Set params value if present else map * as param value JIRA TEI-5016
      const allParamsArr = this.identifiersParams?.identifierParameterDataList.map(obj1 => {
        const match = selectedIdentifiersStr.find(obj2 => obj2.parameterName === obj1.parameterName && obj2.value);
        return match ? { ...obj1, value: match.value } : { ...obj1, value: '*' };
      });

      allParamsArr.forEach((p) => {
        const paramStr = `${p?.parameterName}=${p?.value}`;
        paramsArr.push(paramStr);
      });

      const allParamsStr = paramsArr.join('|');

      selectedIdentifiersStr.forEach(item => {
        const str = `${item?.parameterName}=${item?.value}`;
        generatedStr.push(str);
      });

      const newStr = generatedStr.join('|');

      const identifiersDto = {
        id: identifiers?.identifier,
        methodName: this.identifiers.find(x => Number(x?.id) === Number(identifiers?.identifier))?.methodName,
        identifierStr: newStr,
        order: null,
        identifierName: this.identifiers.find(x => Number(x?.id) === Number(identifiers?.identifier))?.identifierName,
        methodVersion: this.identifiers.find(x => Number(x?.id) === Number(identifiers?.identifier))?.methodVersion,
        identifierAllParamsStrArr: allParamsStr
      };

      const isDuplicate = this.dialogData.selectedIdentifiersStr?.length ? this.dialogData.selectedIdentifiersStr.some(e => e?.identifierStr === identifiersDto?.identifierStr) : false;
      const identifierStrData = this.identifiersForm.getRawValue()?.identifyStr;

      if (isDuplicate) {
        this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Identifier already attached to the integration.' });
        return;
      } else {
        if (this.dialogData?.isAdd || this.dialogData?.isCopy) {
          this.dialogRef.close({ isAdd: true, isUpdate: false, identifiersDto });
          return;
        } else if (this.dialogData?.isEdit) {
          this.dialogRef.close({ isAdd: false, isUpdate: true, identifiersDto });
          return;
        }
      }
    } else {
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Please select an identifier and at least one parameter.' });
    }
  }

  onClose(): void {
    this.dialogRef.close({ isAdd: false, isUpdate: false, identifiersDto: null });
  }

  ngOnDestroy(): void {

  }
}
