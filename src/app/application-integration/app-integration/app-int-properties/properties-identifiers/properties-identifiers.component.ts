import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AppIntegrationService } from '../../app-integration.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { IdentifierDto } from '../../appintegration';
import { Router } from '@angular/router';
import { Constants } from 'src/app/shared/components/constants';
import { pipeOperatorNotAllowedValidator } from 'src/app/shared/validation/pipe-operator.validator';
import { AddUpdateIdentifiersComponent } from './add-update-identifiers/add-update-identifiers.component';
import { AppIntegrationDataService } from '../../app-integration-data.service';

@Component({
  selector: 'app-properties-identifiers',
  templateUrl: './properties-identifiers.component.html',
  styleUrls: ['./properties-identifiers.component.scss']
})
export class PropertiesIdentifiersComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isProperties: boolean = false;
  identifierForm: UntypedFormGroup;
  identifiers: Array<any> = [];
  identifiersParams: any = null;
  selectedIdentifiersStrArr: Array<any> = [];
  identifiersParamsArr: Array<any> = [];
  isEditIdentifier: boolean = false;
  isCheckedIdentifier: boolean = false;
  isNewIdentifierCreation: boolean = false;
  isEditIdentifierParams: boolean = false;
  identifiersParamsForEdit: any;
  isIntegrationLocked: boolean = false;
  currentUser: any = null;
  propertiesDetails: any = null;

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
    private router: Router,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnInit(): void {
    this.createForm();
    if (this.router?.url.includes("properties")) {
      this.isIntegrationLocked = false;
      this.identifierForm.disable();
    } else {
      this.isIntegrationLocked = true;
      this.identifierForm.enable();
    }
  }

  /*============ Form Creation ============*/
  createForm() {
    this.identifierForm = this.fb.group({
      identifier: [{ value: '', disabled: false }, {
        validators: []
      }],
      selectAll: [{ value: false, disabled: false }, {
        validators: []
      }],
      identifyStr: this.fb.array([
        this.addIdentifyString()
      ])
    });
  }
  /*============ END Form Creation ============*/

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    this.isIntegrationLocked = isPITLock;
    this.appIntegrationService.sharedIdentifierSelected(false);
    if (isPITLock) {
      this.identifierForm.enable();
    } else {
      this.identifiersParams = null;
      this.isEditIdentifierParams = false;
      this.isCheckedIdentifier = false;
      this.identifierForm.disable();
    }
  }

  addIdentifyString() {
    return this.fb.group({
      selected: [{ value: false, disabled: false }],
      parameterName: [{ value: '', disabled: true }],
      value: [{ value: '', disabled: true }, {
        validators: [pipeOperatorNotAllowedValidator()],
      }],
    });
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

  /*=========== Add New Identifier ===========*/
  addNewIdentifier() {
    this.isNewIdentifierCreation = true;
    this.isEditIdentifierParams = false;
    this.isCheckedIdentifier = false;
    this.identifierForm.patchValue({
      identifier: 1,
      selectAll: false
    });
    this.onChangeIdentifiers(1, false, null);
  }
  /*=========== END Add New Identifier ===========*/

  /*=========== Cancelled Identifier Creation ===========*/
  cancelIdentifier() {
    this.isNewIdentifierCreation = false;
  }
  /*=========== END Cancelled Identifier Creation ===========*/

  /*=========== Get Identifiers Strings for Properties ============*/
  getIdentifierStrings(propertiesDetails: any) {
    this.propertiesDetails = propertiesDetails;
    if (propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) {
      this.isIntegrationLocked = propertiesDetails?.locked;
      this.identifierForm.enable();
    } else {
      this.isIntegrationLocked = propertiesDetails?.locked;
      this.identifierForm.disable();
    }
    this.selectedIdentifiersStrArr = propertiesDetails?.identifiers ? propertiesDetails?.identifiers : [];
  }

  changeValue(event) {
    if (this.isEditIdentifierParams) {
      this.handleSharedIdentifierSelection(true);
    }
  }

  /*=========== Create Identifier ===========*/
  addIdentifier(isAdd: boolean, isUpdate: boolean, isCopy: boolean, identifier: any) {
    const dialogRef = this.dialog.open(AddUpdateIdentifiersComponent, {
      width: "800px",
      maxHeight: '95vh',
      data: {
        isAdd: isAdd,
        isEdit: isUpdate,
        isCopy: isCopy,
        identifier: identifier,
        selectedIdentifiersStr: this.selectedIdentifiersStrArr,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.isAdd) {
          this.selectedIdentifiersStrArr.push(result?.identifiersDto);
          this.selectedIdentifiersStrArr.map((currentValue, index, array) => currentValue.order = index);
        } else if (result.isUpdate || result.isCopy) {
          const foundIndex = this.selectedIdentifiersStrArr.findIndex(x => Number(x.order) === Number(identifier?.order));
          if (foundIndex !== -1) {
            result.identifiersDto.order = foundIndex;
            this.selectedIdentifiersStrArr[foundIndex] = result.identifiersDto;
          }
        }
      }
    });
  }

  addUpdateIdentifier(isAdd: boolean) {
    const identifierStr = this.identifierForm.getRawValue();
    const selectedIdentifiersStr = [];
    const generatedStr = [];
    const paramsArr = [];
    // this.identifiersParamsArr.push();
    if (identifierStr?.identifyStr?.length) {
      identifierStr?.identifyStr.forEach(x => {
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
      // const allParamsStr = paramsArr.toString().replace(/,/g, '|');
      const allParamsStr = paramsArr.join('|');

      selectedIdentifiersStr.forEach(item => {
        const str = `${item?.parameterName}=${item?.value}`;
        generatedStr.push(str);
      });
      // const newStr = generatedStr.toString().replace(/,/g, '|');
      const newStr = generatedStr.join('|');

      const identifiersDto = {
        id: identifierStr?.identifier,
        methodName: this.identifiers.find(x => Number(x?.id) === Number(identifierStr?.identifier))?.methodName,
        identifierStr: newStr,
        order: null,
        identifierName: this.identifiers.find(x => Number(x?.id) === Number(identifierStr?.identifier))?.identifierName,
        methodVersion: this.identifiers.find(x => Number(x?.id) === Number(identifierStr?.identifier))?.methodVersion,
        identifierAllParamsStrArr: allParamsStr
      };

      const isDuplicate = this.selectedIdentifiersStrArr?.length ? this.selectedIdentifiersStrArr.some(e => e?.identifierStr === identifiersDto?.identifierStr) : false;
      const identifierStrData = this.identifierForm.getRawValue()?.identifyStr;
      if (isAdd) {
        if (isDuplicate) {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Identifier already attached to the integration.' });
        } else {
          this.selectedIdentifiersStrArr.push(identifiersDto);
          this.selectedIdentifiersStrArr.map((currentValue, index, array) => currentValue.order = index);
          this.isNewIdentifierCreation = false;
          if (identifierStrData?.length) {
            identifierStrData.forEach(x => {
              x.selected = false;
              x.value = '';
            });
          }

          this.identifierForm.patchValue({
            selectAll: false
          });
          this.handleSharedIdentifierSelection(false);
          this.isCheckedIdentifier = false;
          this.identifierForm.setControl('identifyStr', this.setExistingIdentifiers(identifierStrData));
        }
      } else {
        if (isDuplicate) {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Identifier already attached to the integration.' });
        } else {
          const foundIndex = this.selectedIdentifiersStrArr.findIndex(x => Number(x.order) === Number(this.identifiersParamsForEdit?.order));
          if (foundIndex !== -1) {
            identifiersDto.order = foundIndex;
            this.selectedIdentifiersStrArr[foundIndex] = identifiersDto;
            this.isNewIdentifierCreation = false;
            if (identifierStrData?.length) {
              identifierStrData.forEach(x => {
                x.selected = false,
                  x.value = ''
              });
            }
            this.identifierForm.patchValue({
              selectAll: false
            });
            this.isCheckedIdentifier = false;
            this.handleSharedIdentifierSelection(false);
            this.identifierForm.setControl('identifyStr', this.setExistingIdentifiers(identifierStrData));
          }
        }
      }
    }
  }
  /*=========== END Add Identifier ===========*/

  /*=========== Edit Identifier ===========*/
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

  editIdentifier(identifier) {
    this.identifiersParamsForEdit = identifier;
    this.isNewIdentifierCreation = true;
    this.isEditIdentifierParams = true;
    let subStrings = identifier?.identifierStr.split('|');
    // let superSubStrings = subStrings.map(x => x.split('='));
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
    this.identifierForm.patchValue({
      identifier: identifier?.id
    });
    this.onChangeIdentifiers(identifier?.id, true, identifierArr);
  }
  /*=========== END Edit Identifier ===========*/

  /*=========== Remove Identifier ===========*/
  removeIdentifier(identifier) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: 'Are you sure you want to delete this identifier?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const foundIndex = this.selectedIdentifiersStrArr.findIndex(x => Number(x.order) === Number(identifier?.order));
        if (foundIndex > -1) {
          this.selectedIdentifiersStrArr.splice(foundIndex, 1);
          this.selectedIdentifiersStrArr.map((currentValue, index, array) => currentValue.order = index);
        }
      }
    });
  }
  /*=========== END Remove Identifier ===========*/
  clearIdentifier() {
    this.isCheckedIdentifier = false;
    const identifierStr = this.identifierForm.getRawValue()?.identifyStr;
    this.identifierForm.patchValue({
      selectAll: false
    });
    if (identifierStr?.length) {
      identifierStr.forEach(x => {
        x.selected = false,
          x.value = ''
      });
    }
    this.handleSharedIdentifierSelection(false);
    this.identifierForm.setControl('identifyStr', this.setExistingIdentifiers(identifierStr));
  }

  onSelectDeselectAll(isSelected: boolean) {
    this.isCheckedIdentifier = isSelected;
    const identifierStr = this.identifierForm.getRawValue()?.identifyStr;
    if (isSelected) {
      if (identifierStr?.length) {
        identifierStr.forEach(x => {
          x.selected = true
        });
      }
      this.handleSharedIdentifierSelection(true);

      this.identifierForm.setControl('identifyStr', this.setExistingIdentifiers(identifierStr));
    } else {
      if (identifierStr?.length) {
        identifierStr.forEach(x => {
          x.selected = false
        });
      }
      this.handleSharedIdentifierSelection(false);
      this.identifierForm.setControl('identifyStr', this.setExistingIdentifiers(identifierStr));
    }
  }

  handleSharedIdentifierSelection(isChecked) {
    let isDuplicate = false;
    if (this.isEditIdentifierParams) {
      const identifierStr = this.identifierForm.getRawValue();
      const selectedIdentifiersStr = [];
      const generatedStr = [];
      const paramsArr = [];
      // this.identifiersParamsArr.push();
      if (identifierStr?.identifyStr?.length) {
        identifierStr?.identifyStr.forEach(x => {
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
        // const allParamsStr = paramsArr.toString().replace(/,/g, '|');
        const allParamsStr = paramsArr.join('|');

        selectedIdentifiersStr.forEach(item => {
          const str = `${item?.parameterName}=${item?.value}`;
          generatedStr.push(str);
        });
        // const newStr = generatedStr.toString().replace(/,/g, '|');
        const newStr = generatedStr.join('|');
        const identifierStr = this.identifierForm.getRawValue();
        const identifiersDto = {
          id: identifierStr?.identifier,
          methodName: this.identifiers.find(x => Number(x?.id) === Number(identifierStr?.identifier))?.methodName,
          identifierStr: newStr,
          order: null,
          identifierName: this.identifiers.find(x => Number(x?.id) === Number(identifierStr?.identifier))?.identifierName,
          methodVersion: this.identifiers.find(x => Number(x?.id) === Number(identifierStr?.identifier))?.methodVersion,
          identifierAllParamsStrArr: allParamsStr
        };
        isDuplicate = this.selectedIdentifiersStrArr?.length ? this.selectedIdentifiersStrArr.some(e => e?.identifierStr === identifiersDto?.identifierStr) : false;
      }
    }
    this.appIntegrationService.sharedIdentifierSelected(isDuplicate ? false : isChecked);

  }

  onSelectIdentifier() {
    const identifierStrArr = this.identifierForm.getRawValue()?.identifyStr;
    let result = identifierStrArr.every(element => element?.selected === true);
    let isChecked = identifierStrArr.some(item => item?.selected === true);
    this.isCheckedIdentifier = isChecked;
    this.handleSharedIdentifierSelection(isChecked);
    this.identifierForm.patchValue({
      selectAll: result
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.identifierForm): void {
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
  /*============ END Check Form Validation and Display Messages ============*/

  /*============ Get Identifiers ============*/
  /*============ Get Identifiers ============*/
  getIdentifiers() {
    // Check cache first
    const identifiers = this.appIntegrationDataService.getIdentifiers();
    if (identifiers?.length) {
      this.identifiers = identifiers;
      return;
    }

    // Only call API if cache is empty
    this.getIdentifiersSub = this.appIntegrationService.getIdentifiers().subscribe(res => {
      if (res?.length) {
        const identifiersArr = JSON.parse(JSON.stringify(res));
        this.appIntegrationDataService.storeIdentifiers(identifiersArr);
        this.identifiers = identifiersArr;
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
    this.isCheckedIdentifier = false;
    this.isEditIdentifierParams = isIdentifierEdit;
    this.getParamsByIdentifiersId(selectedIdentifier, isIdentifierEdit, identifierArr);
  }
  /*============ END Get Identifiers ============*/

  /*============ Get Parameters By Identifiers Id ============*/
  getParamsByIdentifiersId(identifiersId: number, isIdentifierEdit: boolean, identifierArr?: Array<any>) {
    this.getIdentifiersParameterSub = this.appIntegrationService.getParametersByIdentifiersId(identifiersId).subscribe(res => {
      if (this.identifiers?.length) {
        this.identifiers.forEach((x) => {
          if (Number(x?.id) === Number(identifiersId)) {
            x.detectorParametersData = res;
          }
        });
      }
      if (res?.identifierParameterDataList?.length) {
        this.identifierForm.patchValue({
          selectAll: false
        });
        res?.identifierParameterDataList.forEach(x => {
          x.selected = false;
        });
        this.identifiersParams = res;
        this.identifierForm.setControl('identifyStr', this.setExistingIdentifiers(res?.identifierParameterDataList));
        if (isIdentifierEdit) {
          this.isCheckedIdentifier = true;
          const identifierStrArr = this.identifierForm.getRawValue();
          identifierStrArr?.identifyStr.forEach(item => {
            identifierArr.forEach(e => {
              if (item?.parameterName === e?.parameterName) {
                item.selected = true;
                item.value = e.value;
              }
            });
          });
          this.identifierForm.setControl('identifyStr', this.setExistingIdentifiers(identifierStrArr?.identifyStr));
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

  /*============ Edit/Update Identifiers ============*/
  editIdentifierStr() {
    this.isEditIdentifier = !this.isEditIdentifier;
  }
  /*============ END Edit/Update Identifiers ============*/

  onCancel() {
    this.isCheckedIdentifier = false;
    this.identifiersParams = null;
    this.selectedIdentifiersStrArr = [];
  }

  createRegExp(obj: any) {
    const paramsArr = [];
    let identifiers = null;
    let allParamsStr = '';

    // if (this.isCreatePIT) {
    //   identifiers = this.identifiers;
    // } else {
    //   identifiers = this.propertiesDetails?.identifiers;
    // }
    identifiers = this.identifiers;

    if (identifiers?.length) {
      identifiers.forEach((x) => {
        if (Number(x?.id) === Number(obj?.id)) {
          let subStrings = obj?.identifierStr.split('|');
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

          if (x?.detectorParametersData?.identifierParameterDataList?.length && identifierArr?.length) {
            // Set params value if present else map * as param value JIRA TEI-5016
            const allParamsArr = x?.detectorParametersData?.identifierParameterDataList.map(obj1 => {
              const match = identifierArr.find(obj2 => obj2.parameterName === obj1.parameterName && obj2.value);
              return match ? { ...obj1, value: match.value } : { ...obj1, value: '*' };
            });

            allParamsArr.forEach((p) => {
              const paramStr = `${p?.parameterName}=${p?.value}`;
              paramsArr.push(paramStr);
            });
            allParamsStr = paramsArr.join('|');
          }
        }
      });

      return allParamsStr;
    }
  }

  /*============ Get Selected Identifiers ============*/
  getSelectedIdentifiers() {
    const identifiers = [];
    if (this.selectedIdentifiersStrArr?.length) {
      this.selectedIdentifiersStrArr.forEach((x, i) => {
        // this.createRegExp(x);
        const identifierDto: IdentifierDto = {
          name: '',
          id: x?.id,
          parameterNameValue: null,
          identifierName: x?.identifierName,
          fileName: '',
          order: i,
          methodVersion: x?.methodVersion,
          methodName: x?.methodName,
          detectorParametersData: null,
          content: '',
          identifierClassName: '',
          referenceComponentId: '',
          identifierConfigStr: '',
          lastUpdated: '',
          updatedBy: '',
          identifierStr: x?.identifierStr,
          regexStr: this.createRegExp(x),
          enabled: false,
          scriptEngineId: '',
          scriptEngineName: '',
          identifierType: '',
          serverIdentity: '',
          scriptEngineKey: '',
        };
        identifiers.push(identifierDto);
      });
    }

    return identifiers;
  }

  ngOnDestroy(): void {
    this.getIdentifiersSub.unsubscribe();
  }

}
