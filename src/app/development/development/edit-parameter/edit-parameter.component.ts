import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DevelopmentService } from '../../development.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { Constants } from 'src/app/shared/components/constants';
import { HttpErrorResponse } from '@angular/common/http';
import { ScriptParameterDto } from '../../development';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
    selector: 'app-edit-parameter',
    templateUrl: './edit-parameter.component.html',
    styleUrls: ['./edit-parameter.component.scss']
})
export class EditParameterComponent implements OnInit, OnDestroy {
    currentUser: any = null;
    editParameterForm: UntypedFormGroup;
    newParameter: string = '';
    isAddUpdateValues: boolean = false;
    securityLevelArr: Array<any> = [
        { id: 'low', value: 'Low' },
        { id: 'medium', value: 'Medium' },
        { id: 'high', value: 'High' }
    ];
    parameterValuesArr: Array<any> = [];
    selectedOption: string = 'None';
    isLocked: boolean = false;

    validationMessages = {
        name: {
            required: "Name is required",
            maxlength: "Maximum 128 characters are allowed"
        },
        description: {
            maxlength: "Maximum 2000 characters are allowed"
        },
        securityLevel: {
            required: "Security level is required",
        },
        values: {
            required: "Value is required",
            pattern: "Only numbers are allowed"
        }
    };

    formErrors = {
        name: '',
        description: '',
        securityLevel: '',
        values: ''
    };

    saveParametersSub = Subscription.EMPTY;

    constructor(
        public dialogRef: MatDialogRef<EditParameterComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: any,
        private fb: UntypedFormBuilder,
        private developmentService: DevelopmentService,
        public dialog: MatDialog,
    ) {
        this.dialogRef.disableClose = true;
        this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
    }

    ngOnInit(): void {
        this.createForm();
        // this.setFormData();
        this.isLocked = this.dialogData?.lockInfo?.isLocked;
        if (this.dialogData?.lockInfo?.isLocked && Number(this.dialogData?.lockInfo?.lockedUserId) === Number(this.currentUser?.id)) {
            this.setFormData();
        } else {
            this.getFormData();
            this.editParameterForm.disable();
        }
    }

    createForm(): void {
        this.editParameterForm = this.fb.group({
            name: [{ value: '', disabled: true }, {
                validators: [
                    Validators.required,
                    Validators.maxLength(128),
                    CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
                ]
            }],
            description: [{ value: '', disabled: false }, {
                validators: [Validators.maxLength(2000)]
            }],
            securityLevel: [{ value: 'low', disabled: false }, {
                validators: []
            }],
            valuesOptions: [{ value: 'None', disabled: false }, {
                validators: []
            }],
            values: [{ value: '', disabled: false }, {
                validators: []
            }]
        });
        this.editParameterForm.valueChanges.subscribe((data: any) => {
            this.logValidationErrors(this.editParameterForm);
        });
    }

    getFormData() {
        let paramValues = [];

        if (this.dialogData?.storedValue) {
            this.selectedOption = 'Stored';
            this.editParameterForm.get('valuesOptions').patchValue('Stored');
        } else if (!this.dialogData?.storedValue && !this.dialogData?.probableValues?.length) {
            this.selectedOption = 'None';
            this.editParameterForm.get('valuesOptions').patchValue('None');
        } else if (!this.dialogData?.storedValue && this.dialogData?.probableValues?.length) {
            this.selectedOption = 'Eligible';
            this.editParameterForm.get('valuesOptions').patchValue('Eligible');
        }

        this.editParameterForm.patchValue({
            name: this.dialogData?.parameterName,
            description: this.dialogData?.description ? this.dialogData?.description : '',
            securityLevel: this.dialogData?.securityLevel.toLowerCase(),
            valuesOptions: this.selectedOption
        });

        if (this.dialogData?.probableValues && this.dialogData?.probableValues?.length) {
            paramValues = JSON.parse(JSON.stringify(this.dialogData?.probableValues));
            paramValues.forEach((x) => {
                x.isEditing = false;
            });
        }

        this.parameterValuesArr = paramValues;
    }

    setFormData() {
        this.getFormData();
        if (this.dialogData?.dataType === 'Boolean') {
            this.editParameterForm.get('securityLevel').patchValue('low');
            this.editParameterForm.get('valuesOptions').patchValue('None');
            this.editParameterForm.get('securityLevel').disable();
            this.editParameterForm.get('valuesOptions').disable();
            this.editParameterForm.get('values').disable();
        } else if (this.dialogData?.dataType === 'Integer') {
            this.editParameterForm.get('values').addValidators([
                Validators.pattern('^[0-9]*$')
            ]);
            this.editParameterForm.get('values').updateValueAndValidity();
        } else {
            this.editParameterForm.get('values').clearValidators();
            this.editParameterForm.get('values').updateValueAndValidity();
        }
        if (this.dialogData?.config) {
            this.editParameterForm.get('securityLevel').disable();
        }
        if (this.dialogData?.securityLevel?.toLowerCase() === 'high' && this.dialogData?.isScriptConnectedToPIT) {
            this.parameterValuesArr = [];
            this.isAddUpdateValues = true;
            this.editParameterForm.get('securityLevel').disable();
            this.editParameterForm.get('valuesOptions').patchValue('None');
            this.editParameterForm.get('valuesOptions').disable();
            this.editParameterForm.get('values').disable();
        } else if (this.dialogData?.securityLevel?.toLowerCase() === 'medium') {
            this.parameterValuesArr = [];
            this.isAddUpdateValues = true;
            this.editParameterForm.get('valuesOptions').patchValue('None');
            this.editParameterForm.get('valuesOptions').disable();
            this.editParameterForm.get('values').disable();
        }
        if (this.dialogData?.storedValue) {
            this.selectedOption = 'Stored';
            this.editParameterForm.get('valuesOptions').patchValue('Stored');
            this.editParameterForm.get('values').disable();
        } else if (!this.dialogData?.storedValue && !this.dialogData?.probableValues?.length) {
            this.selectedOption = 'None';
            this.editParameterForm.get('valuesOptions').patchValue('None');
            this.editParameterForm.get('values').disable();
        } else if (!this.dialogData?.storedValue && this.dialogData?.probableValues?.length) {
            this.selectedOption = 'Eligible';
            this.editParameterForm.get('valuesOptions').patchValue('Eligible');
            this.editParameterForm.get('values').enable();
        }
        // Disabled add value input box and value CRUD operation on basis of selected Values Option
        this.onChangeOptions();
    }

    logValidationErrors(group: UntypedFormGroup = this.editParameterForm): void {
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

    addParameter() {
        const paramValue = this.editParameterForm.get('values')?.value;
        if (paramValue) {
            this.parameterValuesArr.push({
                id: null,
                scriptParameterData: '',
                paramValues: paramValue.trim(),
                sequence: '',
                isEditing: false
            });
            this.editParameterForm.get('values')?.reset();
        }
    }

    editParamValue(param: any) {
        param.isEditing = true;
        param.tempName = param.name; // Store the original name
    }

    updateParamValue(param: any) {
        param.isEditing = false;
    }

    removeParamValue(param: any, index: number) {
        if (this.parameterValuesArr?.length) {
            const dialogRef = this.dialog.open(ConfirmationComponent, {
                width: "600px",
                maxHeight: "800px",
                data: `Are you sure you want to delete "${param?.paramValues}"?`
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this.parameterValuesArr.splice(index, 1);
                }
            });
        }
    }

    onChangeSecurityLevel() {
        const securityLevel = this.editParameterForm.get('securityLevel').value;
        if (securityLevel === 'high') {
            const dialogRef = this.dialog.open(ConfirmationComponent, {
                width: "600px",
                maxHeight: "800px",
                data: `Once parameter security level is set to 'High', you will not be able to change it and all the associated values (if any) will be cleared.`
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this.parameterValuesArr = [];
                    this.isAddUpdateValues = true;
                    this.editParameterForm.get('securityLevel').disable();
                    this.editParameterForm.get('valuesOptions').patchValue('None');
                    this.editParameterForm.get('valuesOptions').disable();
                    this.editParameterForm.get('values').disable();
                } else {
                    this.isAddUpdateValues = false;
                    this.editParameterForm.get('securityLevel').patchValue(this.dialogData?.securityLevel.toLowerCase());
                    this.editParameterForm.get('securityLevel').enable();
                    this.editParameterForm.get('valuesOptions').enable();
                    this.editParameterForm.get('values').enable();
                }
            });
        } else if (securityLevel === 'medium') {
            const dialogRef = this.dialog.open(ConfirmationComponent, {
                width: "600px",
                maxHeight: "800px",
                data: `Once parameter security level is set to 'Medium', all the associated values (if any) will be cleared.`
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    this.parameterValuesArr = [];
                    this.isAddUpdateValues = true;
                    // this.editParameterForm.get('securityLevel').disable();
                    this.editParameterForm.get('valuesOptions').patchValue('None');
                    this.editParameterForm.get('valuesOptions').disable();
                    this.editParameterForm.get('values').disable();
                } else {
                    this.isAddUpdateValues = false;
                    this.editParameterForm.get('securityLevel').patchValue(this.dialogData?.securityLevel.toLowerCase());
                    this.editParameterForm.get('securityLevel').enable();
                    this.editParameterForm.get('valuesOptions').enable();
                    this.editParameterForm.get('values').enable();
                }
            });
        } else if (securityLevel === 'low') {
            this.isAddUpdateValues = false;
            this.editParameterForm.get('securityLevel').patchValue('low');
            this.editParameterForm.get('securityLevel').enable();
            this.editParameterForm.get('valuesOptions').enable();
            this.editParameterForm.get('values').enable();
        }
    }

    onChangeOptions(event?: Event) {
        const option = this.editParameterForm.get('valuesOptions').value;
        if (option === 'None' || option === 'Stored') {
            this.editParameterForm.get('values').disable();
            this.isAddUpdateValues = true;
            if (option === 'None' && this.parameterValuesArr?.length) {
                const dialogRef = this.dialog.open(ConfirmationComponent, {
                    width: "600px",
                    maxHeight: "800px",
                    data: `Once option is set to 'None', all the associated values will be cleared.`
                });
                dialogRef.afterClosed().subscribe((result) => {
                    if (result) {
                        this.parameterValuesArr = [];
                    } else {
                        this.editParameterForm.get('valuesOptions').patchValue(this.selectedOption);
                        if (this.selectedOption === 'Eligible') {
                            this.editParameterForm.get('values').enable();
                            this.isAddUpdateValues = false;
                        }
                    }
                });
            }
        } else {
            this.editParameterForm.get('values').enable();
            this.isAddUpdateValues = false;
        }
    }

    onSave(): void {
        this.editParameterForm.markAllAsTouched();
        this.logValidationErrors();
        if (this.editParameterForm.valid) {
            const formData = this.editParameterForm.getRawValue();
            const paramsValues = [];
            if (this.parameterValuesArr?.length) {
                this.parameterValuesArr.forEach((x, i, arr) => {
                    paramsValues.push({
                        id: x?.id,
                        scriptParameterData: x?.scriptParameterData,
                        paramValues: x?.paramValues,
                        sequence: i + 1
                    });
                });
            }

            const paramsObj: ScriptParameterDto = {
                id: null,
                parameterName: formData?.name,
                value: '',
                scriptId: this.dialogData?.scriptId,
                config: this.dialogData?.config,
                type: this.dialogData?.type,
                optionProtected: (formData?.securityLevel === 'high' || formData?.securityLevel === 'medium') ? true : false,
                inParameter: this.dialogData?.inParameter,
                outParameter: this.dialogData?.outParameter,
                probableValues: paramsValues,
                autoComplete: this.dialogData?.autoComplete,
                storedValue: formData?.valuesOptions === 'Stored' ? true : false,
                dataType: this.dialogData?.dataType,
                description: formData?.description,
                parameterTypes: '',
                lastUpdated: '',
                updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
                securityLevel: formData?.securityLevel,
                workspaceId: this.dialogData?.workspaceId,
            };

            this.saveParametersSub = this.developmentService.saveScriptParameters(this.dialogData.workspaceId, paramsObj).subscribe((res) => {
                if (res) {
                    this.dialogRef.close({
                        isSave: true,
                        isUpdate: false
                    });
                }
            }, (err: HttpErrorResponse) => {
                if (err.error instanceof Error) {
                    // handle client side error here
                } else {
                    // handle server side error here
                }
            });
        }
    }

    onUpdate(): void {
        this.editParameterForm.markAllAsTouched();
        this.logValidationErrors();
        if (this.editParameterForm.valid) {
            const formData = this.editParameterForm.getRawValue();
            const paramsValues = [];
            if (this.parameterValuesArr?.length) {
                this.parameterValuesArr.forEach((x, i, arr) => {
                    paramsValues.push({
                        id: x?.id,
                        scriptParameterData: x?.scriptParameterData,
                        paramValues: x?.paramValues,
                        sequence: i + 1
                    });
                });
            }

            const paramsObj: ScriptParameterDto = {
                id: this.dialogData?.id,
                parameterName: formData?.name.trim(),
                value: '',
                scriptId: this.dialogData?.scriptId,
                config: this.dialogData?.config,
                type: this.dialogData?.type,
                optionProtected: (formData?.securityLevel === 'high' || formData?.securityLevel === 'medium') ? true : false,
                inParameter: this.dialogData?.inParameter,
                outParameter: this.dialogData?.outParameter,
                probableValues: paramsValues,
                autoComplete: this.dialogData?.autoComplete,
                storedValue: formData?.valuesOptions === 'Stored' ? true : false,
                dataType: this.dialogData?.dataType,
                description: formData?.description ? formData?.description.trim() : '',
                parameterTypes: '',
                lastUpdated: '',
                updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
                securityLevel: formData?.securityLevel,
                workspaceId: this.dialogData?.workspaceId,
            };

            this.saveParametersSub = this.developmentService.updateScriptParameters(this.dialogData.workspaceId, paramsObj).subscribe((res) => {
                if (res?.parameterUpdated) {
                    this.dialogRef.close({
                        isSave: false,
                        isUpdate: true
                    });
                }
            }, (err: HttpErrorResponse) => {
                if (err.error instanceof Error) {
                    // handle client side error here
                } else {
                    // handle server side error here
                }
            });
        }
    }

    onClose(): void {
        this.dialogRef.close({
            isSave: false,
            isUpdate: false
        });
    }

    ngOnDestroy(): void {
        this.saveParametersSub?.unsubscribe();
    }
}
