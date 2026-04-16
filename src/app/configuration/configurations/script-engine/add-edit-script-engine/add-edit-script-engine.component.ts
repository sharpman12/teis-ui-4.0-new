import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { Constants } from 'src/app/shared/components/constants';
import { SEConfigurationDto } from '../../config';
import { ConfigurationsService } from '../../configurations.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';

@Component({
  selector: 'app-add-edit-script-engine',
  templateUrl: './add-edit-script-engine.component.html',
  styleUrls: ['./add-edit-script-engine.component.scss']
})
export class AddEditScriptEngineComponent implements OnInit {
  currentUser: any;
  scriptEngineForm: UntypedFormGroup;

  validationMessages = {
    name: {
      required: 'Group name is required',
      maxlength: 'Maximum 128 characters are allowed',
      hasWhitespace: "Whitespace not allowed"
    },
    enabled: {
      required: 'Enabled is required'
    },
    processPoolSize: {
      required: 'Process pool size is required',
      min: 'Minimum process pool size is 30',
      max: 'Maximum process pool size is 120',
      maxlength: 'Maximum 100 characters are allowed',
    },
  };

  formErrors = {
    name: '',
    enabled: '',
    processPoolSize: '',
  };

  constructor(
    public dialogRef: MatDialogRef<AddEditScriptEngineComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private configurationsService: ConfigurationsService
  ) {
    dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnInit(): void {
    this.createForm();
    this.setExistingData(this.dialogData);
  }

  createForm() {
    this.scriptEngineForm = this.fb.group({
      name: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      enabled: [{ value: false, disabled: false }, {
        validators: []
      }],
      processPoolSize: [{ value: '', disabled: false }, {
        validators: [
          Validators.min(30),
          Validators.max(120),
          Validators.maxLength(100)
        ]
      }],
    });
    this.scriptEngineForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.scriptEngineForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.scriptEngineForm): void {
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

  /*============ Set Existing Data ==============*/
  setExistingData(formValues: any) {
    this.scriptEngineForm.patchValue({
      name: formValues?.newName,
      enabled: formValues?.newEnabled,
      processPoolSize: formValues?.processPoolNew,
    });
  }

  updateScriptEngine() {
    this.scriptEngineForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.scriptEngineForm.value;
    const seConfigurationDto: SEConfigurationDto = {
      id: this.dialogData?.id,
      name: this.dialogData?.name.trim(),
      ipAddress: this.dialogData?.ipAddress,
      key: this.dialogData?.key,
      type: this.dialogData?.type,
      url: this.dialogData?.url,
      lastUpdated: new Date(),
      enabled: this.dialogData?.enabled,
      startUpTime: this.dialogData?.startUpTime,
      newName: formValues?.name.trim(),
      newEnabled: formValues?.enabled,
      cacheDefault: this.dialogData?.cacheDefault,
      cacheNew: this.dialogData?.cacheNew,
      processPoolDefault: this.dialogData?.processPoolDefault,
      processPoolNew: formValues?.processPoolSize,
      updatedBy: this.currentUser?.userName,
    };
    this.configurationsService.updateSE(seConfigurationDto).subscribe(res => {
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

  onCancel() {
    this.dialogRef.close();
  }

}
