import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { Constants } from 'src/app/shared/components/constants';
import { SharedService } from 'src/app/shared/services/shared.service';
import { LogMaintenanceDto } from '../../config';
import { ConfigurationsService } from '../../configurations.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';

@Component({
  selector: 'app-add-edit-log-maintenance',
  templateUrl: './add-edit-log-maintenance.component.html',
  styleUrls: ['./add-edit-log-maintenance.component.scss']
})
export class AddEditLogMaintenanceComponent implements OnInit {
  logMaintenanceForm: UntypedFormGroup;
  currentUser: any;
  isArchivePackInstalled: boolean;
  archiveStorage = [
    { id: true, value: 'Yes' },
    { id: false, value: 'No' },
  ];

  validationMessages = {
    name: {
      required: 'Name is required',
      maxlength: 'Maximum 128 characters are allowed',
      hasWhitespace: "Whitespace not allowed"
    },
    activeDays: {
      required: 'Active day(s) are required',
      min: 'Minimum 1 active day is required',
      max: 'Maximum 365 active days are required',
      pattern: 'Only numeric values are allowed'
    },
    archiveDays: {
      required: 'Archive day(s) are required',
      min: 'Minimum 0 archive day is required',
      max: 'Maximum 365 archive days are required',
      pattern: 'Only numeric values are allowed'
    },
    archiveStorage: {
      required: 'Archive storage is required'
    },
  };

  formErrors = {
    name: '',
    activeDays: '',
    archiveDays: '',
    archiveStorage: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AddEditLogMaintenanceComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private sharedService: SharedService,
    private messageService: MessageService,
    private configurationsService: ConfigurationsService
  ) {
    dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnInit(): void {
    this.createForm();
    this.checkIsArchivePackInstalled();
    if (!this.dialogData?.isAdd) {
      this.setFormData(this.dialogData);
    }
  }

  createForm() {
    this.logMaintenanceForm = this.fb.group({
      name: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      activeDays: [{ value: 1, disabled: false }, {
        validators: [
          Validators.required,
          Validators.min(1),
          Validators.max(365),
          Validators.pattern(/^-?(0|[1-9]\d*)?$/)
        ]
      }],
      archiveDays: [{ value: 0, disabled: false }, {
        validators: [
          Validators.required,
          Validators.min(0),
          Validators.max(365),
          Validators.pattern(/^-?(0|[1-9]\d*)?$/)
        ]
      }],
      archiveStorage: [{ value: true, disabled: false }, {
        validators: []
      }],
    });
    this.logMaintenanceForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.logMaintenanceForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.logMaintenanceForm): void {
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

  /*============ Set Form Data For Update ===========*/
  setFormData(formValues) {
    this.logMaintenanceForm.get('name').enable();
    this.logMaintenanceForm.patchValue({
      name: formValues?.name,
      activeDays: formValues?.activeDays,
      archiveDays: formValues?.archiveDays,
      archiveStorage: formValues?.archiveMode,
    });
    if (Number(formValues?.id) === 1) {
      this.logMaintenanceForm.get('name').disable();
    }
  }

  /*=========== Is Archive Packed Installed ============*/
  checkIsArchivePackInstalled() {
    this.sharedService.archivePackInstalled.subscribe(res => {
      this.isArchivePackInstalled = res;
    });
  }
  /*=========== END Is Archive Packed Installed ============*/

  /*============ Save Log Maintenance ============*/
  saveLogMaintenance() {
    this.logMaintenanceForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.logMaintenanceForm.getRawValue();
    const logMaintenanceDto: LogMaintenanceDto = {
      id: null,
      name: formValues?.name.trim(),
      activeDays: formValues?.activeDays,
      archiveDays: formValues?.archiveDays,
      archiveMode: formValues?.archiveStorage,
      lastUpdated: null,
      updatedBy: this.currentUser?.userName,
    };
    this.configurationsService.createLogMaintenanceConfig(logMaintenanceDto).subscribe(res => {
      if (res) {
        this.dialogRef.close(true);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({
          key: 'configInfoKey', severity: 'info', summary: '', detail: err?.error?.message
        });
      }
    });
  }
  /*============ Save Log Maintenance ============*/

  /*============ Update Log Maintenance ============*/
  updateLogMaintenance() {
    this.logMaintenanceForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.logMaintenanceForm.getRawValue();
    const logMaintenanceDto: LogMaintenanceDto = {
      id: this.dialogData?.id,
      name: formValues?.name.trim(),
      activeDays: formValues?.activeDays,
      archiveDays: formValues?.archiveDays,
      archiveMode: formValues?.archiveStorage,
      lastUpdated: null,
      updatedBy: this.currentUser?.userName,
    };
    this.configurationsService.updateLogMaintenanceConfig(logMaintenanceDto).subscribe(res => {
      if (res) {
        this.dialogRef.close(true);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({
          key: 'configInfoKey', severity: 'info', summary: '', detail: err?.error?.message
        });
      }
    });
  }
  /*============ END Update Log Maintenance ============*/

  onCancel() {
    this.dialogRef.close();
  }

}
