import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { PasswordStrength } from 'src/app/shared/validation/password-strength.validator';
import { AppIntegrationService } from '../app-integration.service';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { GlobalParameter } from '../appintegration';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { CheckBlank } from 'src/app/shared/validation/check-blank.validator';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { pipeOperatorNotAllowedValidator } from 'src/app/shared/validation/pipe-operator.validator';

@Component({
  selector: 'app-global-parameters',
  templateUrl: './global-parameters.component.html',
  styleUrls: ['./global-parameters.component.scss']
})
export class GlobalParametersComponent implements OnInit, OnDestroy {
  globalParameterForm: UntypedFormGroup;
  currentUser: any;
  globalParameters: Array<GlobalParameter> = [];
  isEdit: boolean = false;
  isAddGlobalParameter: boolean = false;
  editedGlobalParams: GlobalParameter;
  searchGlobalParam: string = '';
  prevSecurityLevel: string = 'Low';
  securityLevelArr = [
    { id: "low", value: "Low" },
    { id: "medium", value: "Medium" },
    { id: "high", value: "High" },
  ];

  validationMessages = {
    parameterName: {
      required: 'Parameter name is required',
      maxlength: 'Maximum 128 characters are allowed',
      hasString: 'Name of the parameter must start with "global."',
      hasBlank: 'Name of the parameter should not be blank after "global."',
      hasWhitespace: "Whitespace not allowed",
      pipeOperatorNotAllowed: 'Pipe operator (|) is not allowed.'
    },
    description: {
      required: 'Description is required',
      maxlength: 'Maximum 2000 characters are allowed'
    },
    securityLevel: {
      required: 'Security level is required'
    },
    value: {
      required: 'Value is required',
      maxlength: 'Maximum 1000 characters are allowed',
      hasWhitespace: "Whitespace not allowed"
    }
  };

  formErrors = {
    parameterName: '',
    description: '',
    securityLevel: '',
    value: ''
  };

  getParameterSub = Subscription.EMPTY;
  createParameterSub = Subscription.EMPTY;
  updateParameterSub = Subscription.EMPTY;
  deleteParameterSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<GlobalParametersComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private messageService: MessageService,
    private encryptDecryptService: EncryptDecryptService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.dialogRef.disableClose = true;
    this.getGlobalParameters(null, false, false);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {
    this.createForm();
  }

  /*============== Create Form ===============*/
  createForm(): void {
    // Jira TEI-5532 Removed Pipe Operator Validator as per new Victor requirement pipeOperatorNotAllowedValidator()
    this.globalParameterForm = this.fb.group({
      parameterName: [{ value: 'global.', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          PasswordStrength.patternValidator(/^global./, { hasString: true }),
          CheckBlank.blankValidator({ hasBlank: true }),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [
          Validators.maxLength(2000)
        ]
      }],
      securityLevel: [
        { value: "low", disabled: false },
        {
          validators: [],
        },
      ],
      value: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(1000),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }]
    });
    this.globalParameterForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.globalParameterForm);
    });
  }
  /*============== END Create Form ===============*/

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.globalParameterForm): void {
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

  /*============ On Change Security Level ============*/
  onChangeSecurityLevel() {
    // this.globalParameterForm.get("value").reset();

    const currentLevel = this.globalParameterForm.get('securityLevel')?.value;
    const valueControl = this.globalParameterForm.get('value');

    // CASE: Moving away from HIGH → clear value
    if (this.prevSecurityLevel.toLowerCase() === 'high' && currentLevel.toLowerCase() !== 'high') {
      valueControl?.reset();
    }

    // Update previous level
    this.prevSecurityLevel = currentLevel;
  }

  /*=============== Get Global Parameters =============*/
  getGlobalParameters(globalParamId: number, isCreated: boolean, isUpdated: boolean) {
    this.getParameterSub = this.appIntegrationService.getGlobalParameters(this.dialogData?.workspace?.id).subscribe((params) => {
      if (params?.length) {
        const res = JSON.parse(JSON.stringify(params));
        res.forEach((x) => {
          if (x?.securityLevel.toLowerCase() === "high" || x?.securityLevel.toLowerCase() === "medium") {
            if (x?.value) {
              x.value = this.encryptDecryptService.decrypt(x?.value ? x?.value.trim() : x?.value);
            }
          } else {
            x.value = x?.value;
          }
          if (Number(x?.id) === Number(globalParamId)) {
            x.recentlyCreated = isCreated;
            x.recentlyUpdated = isUpdated;
          } else {
            x.recentlyCreated = false;
            x.recentlyUpdated = false;
          }
        });
        const sortedGlobalParams = res.sort((a, b) => a.parameterName.localeCompare(b.parameterName));
        this.globalParameters = sortedGlobalParams;
        const globalParamsDto = {
          workspaceId: this.dialogData?.workspace?.id,
          globalParams: sortedGlobalParams
        };
        this.appIntegrationDataService.storeGlobalParameter(globalParamsDto);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=============== END Get Global Parameters =============*/

  /*=============== Add Global Parameter =============*/
  createGlobalParameters() {
    this.globalParameterForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.globalParameterForm?.valid) {
      const formValues = this.globalParameterForm.getRawValue();
      let isProtected = false;
      let encryptedValue = "";
      if (formValues?.securityLevel.toLowerCase() === "high" || formValues?.securityLevel.toLowerCase() === "medium") {
        isProtected = true;
        encryptedValue = formValues?.value ? this.encryptDecryptService.encrypt(formValues?.value.trim()) : formValues?.value;
      } else {
        isProtected = false;
        encryptedValue = formValues?.value ? formValues?.value.trim() : formValues?.value;
      }
      const globalParamsDto: GlobalParameter = {
        autoComplete: false,
        config: false,
        dataType: null,
        description: formValues?.description ? formValues?.description.trim() : formValues?.description,
        inParameter: false,
        lastUpdated: '',
        optionProtected: isProtected,
        outParameter: false,
        parameterName: formValues?.parameterName ? formValues?.parameterName.trim() : formValues?.parameterName,
        parameterTypes: 'globalParam',
        probableValues: null,
        scriptId: null,
        securityLevel: formValues?.securityLevel,
        storedValue: false,
        type: null,
        updatedBy: this.currentUser?.userName,
        value: encryptedValue,
        workspaceId: this.dialogData?.workspace?.id
      };
      this.createParameterSub = this.appIntegrationService.createGlobalParameter(globalParamsDto).subscribe(res => {
        this.isAddGlobalParameter = false;
        this.appIntegrationDataService.createGlobalParam(this.dialogData?.workspace?.id, res);
        this.getGlobalParameters(res?.id, true, false);
        this.globalParameterForm.reset({
          parameterName: 'global.',
          securityLevel: 'low'
        });
        this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Global parameter created successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
          this.messageService.add({ key: 'appIntErrorKey', severity: 'success', summary: '', detail: err?.error?.message });
        }
      });
    }
  }
  /*=============== END Add Global Parameter =============*/

  /*============= Edit Global Parameters =============*/
  editGlobalParameters(parameter: GlobalParameter) {
    if (this.dialogData?.isCRUDGlobalParamsAccess) {
      this.isEdit = true;
      this.isAddGlobalParameter = true;
      this.editedGlobalParams = parameter;
      this.globalParameterForm.patchValue({
        parameterName: parameter?.parameterName,
        securityLevel: parameter?.securityLevel.toLowerCase(),
        value: parameter?.value,
        description: parameter?.description
      });
    }
  }

  updateGlobalParameter() {
    this.globalParameterForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.globalParameterForm.getRawValue();
    let isProtected = false;
    let encryptedValue = "";
    if (formValues?.securityLevel.toLowerCase() === "high" || formValues?.securityLevel.toLowerCase() === "medium") {
      isProtected = true;
      encryptedValue = formValues?.value ? this.encryptDecryptService.encrypt(formValues?.value.trim()) : formValues?.value;
    } else {
      isProtected = false;
      encryptedValue = formValues?.value ? formValues?.value.trim() : formValues?.value;
    }
    if (this.globalParameterForm?.valid) {
      const globalParamsDto: GlobalParameter = {
        autoComplete: false,
        config: false,
        dataType: null,
        description: formValues?.description ? formValues?.description.trim() : formValues?.description,
        id: this.editedGlobalParams?.id ? this.editedGlobalParams?.id : null,
        inParameter: false,
        lastUpdated: '',
        optionProtected: isProtected,
        outParameter: false,
        parameterName: formValues?.parameterName ? formValues?.parameterName.trim() : formValues?.parameterName,
        parameterTypes: 'globalParam',
        probableValues: null,
        scriptId: null,
        securityLevel: formValues?.securityLevel,
        storedValue: false,
        type: null,
        updatedBy: this.currentUser?.userName,
        value: encryptedValue,
        workspaceId: this.dialogData?.workspace?.id
      };
      this.createParameterSub = this.appIntegrationService.updateGlobalParameter(globalParamsDto).subscribe(res => {
        this.appIntegrationDataService.updateGlobalParam(this.dialogData?.workspace?.id, res);
        this.isEdit = false;
        this.isAddGlobalParameter = false;
        this.getGlobalParameters(res?.id, false, true);
        this.globalParameterForm.reset({
          parameterName: 'global.',
          securityLevel: 'low'
        });
        this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Global parameter updated successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
          this.messageService.add({ key: 'appIntErrorKey', severity: 'success', summary: '', detail: err?.error?.message });
        }
      });
    }
  }
  /*============= END Edit Global Parameters =============*/

  /*============= Delete Global Parameter =============*/
  deleteGlobalParameter(id: number) {
    if (this.dialogData?.isCRUDGlobalParamsAccess) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '700px',
        maxHeight: '600px',
        data: 'Are you sure you want to delete this global parameter?'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteParameterSub = this.appIntegrationService.deleteGlobalParameter(id).subscribe(res => {
            this.appIntegrationDataService.deleteGlobalParameter(this.dialogData?.workspace?.id, id);
            this.getGlobalParameters(res?.id, false, false);
            this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Global parameter deleted successfully!' });
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
  }

  resetForm() {
    this.isEdit = false;
    this.globalParameterForm.reset({
      parameterName: 'global.',
      securityLevel: 'low'
    });
  }

  /*============= Add Global Parameters =============*/
  addGlobalParameter() {
    this.isAddGlobalParameter = true;
    this.isEdit = false;
  }
  /*============= END Add Global Parameters =============*/

  onCancel() {
    this.isAddGlobalParameter = false;
    if (this.globalParameters?.length) {
      this.globalParameters.forEach(p => {
        p.recentlyCreated = false;
        p.recentlyUpdated = false;
      });
      this.globalParameterForm.reset({
        parameterName: 'global.',
        securityLevel: 'low'
      });
    }
  }

  /*=============== On Cancelled =============*/
  onClosed(): void {
    this.isAddGlobalParameter = false;
    this.dialogRef.close();
  }
  /*=============== END On Cancelled =============*/

  ngOnDestroy(): void {
    this.getParameterSub.unsubscribe();
    this.createParameterSub.unsubscribe();
    this.updateParameterSub.unsubscribe();
    this.deleteParameterSub.unsubscribe();
  }

}
