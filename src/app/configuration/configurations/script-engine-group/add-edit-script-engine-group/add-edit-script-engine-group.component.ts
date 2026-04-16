import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/components/constants';
import { ScriptEngineGroupDto } from '../../config';
import { ConfigurationsService } from '../../configurations.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';

@Component({
  selector: 'app-add-edit-script-engine-group',
  templateUrl: './add-edit-script-engine-group.component.html',
  styleUrls: ['./add-edit-script-engine-group.component.scss']
})
export class AddEditScriptEngineGroupComponent implements OnInit, OnDestroy {
  scriptEngineGrpForm: UntypedFormGroup;
  currentUser: any;
  scriptEngines: any;

  validationMessages = {
    groupName: {
      required: 'Group name is required',
      maxlength: 'Maximum 100 characters are allowed',
      hasWhitespace: "Whitespace not allowed"
    },
    description: {
      required: 'Description is required',
      maxlength: 'Maximum 2000 characters are allowed'
    },
    enabled: {
      required: 'Enabled is required'
    },
  };

  formErrors = {
    groupName: '',
    description: '',
    enabled: ''
  };

  scriptEngineSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AddEditScriptEngineGroupComponent>,
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
    setTimeout(() => {
      if (this.dialogData?.isAdd) {
        this.getScriptEngine([]);
      } else {
        this.setData(this.dialogData);
      }
    });
  }

  createForm() {
    this.scriptEngineGrpForm = this.fb.group({
      groupName: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(100),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [Validators.maxLength(2000)]
      }],
      enabled: [{ value: false, disabled: false }, {
        validators: []
      }]
    });
    this.scriptEngineGrpForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.scriptEngineGrpForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.scriptEngineGrpForm): void {
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

  /*============ Set Data For Update ============*/
  setData(formValues) {
    this.scriptEngineGrpForm.get('groupName').enable();
    this.scriptEngineGrpForm.patchValue({
      groupName: formValues?.groupName,
      description: formValues?.description,
      enabled: formValues?.enabled,
    });
    if (Number(formValues?.id) === 1) {
      this.scriptEngineGrpForm.get('groupName').disable();
    }
    this.getScriptEngine(formValues?.scriptEngines);
  }

  /*============ Get Script Engine List ===========*/
  getScriptEngine(scriptEngines: Array<any>) {
    this.scriptEngineSub = this.configurationsService.getScriptEngine().subscribe(res => {
      if (res?.length) {
        res.forEach(el => {
          el.checked = false;
        });
        if (scriptEngines?.length) {
          scriptEngines.forEach(item => {
            res.forEach(el => {
              if (Number(item?.id) === Number(el.id)) {
                el.checked = true;
              }
            });
          });
        }
      }
      this.scriptEngines = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Get Script Engine List ===========*/

  /*=========== Add SE Group ===========*/
  saveSEGroup() {
    this.scriptEngineGrpForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.scriptEngineGrpForm.getRawValue();
    const scriptEngineArr = [];
    if (this.scriptEngines?.length) {
      this.scriptEngines.forEach(item => {
        if (item?.checked) {
          delete item?.checked;
          scriptEngineArr.push(item);
        }
      });

    }

    if (scriptEngineArr?.length) {
      const scriptEngineGroupDto: ScriptEngineGroupDto = {
        id: null,
        groupName: formValues?.groupName.trim(),
        description: formValues?.description.trim(),
        enabled: formValues?.enabled,
        tempPath: null,
        scriptEngines: scriptEngineArr,
        updatedBy: this.currentUser?.userName,
      };
      this.configurationsService.createSEGroup(scriptEngineGroupDto).subscribe(res => {
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
    } else {
      this.messageService.add({
        key: 'configInfoKey', severity: 'success', summary: '', detail: 'Please select atleast one script engine'
      });
    }
  }

  /*=========== Update SE Group ===========*/
  updateSEGroup() {
    this.scriptEngineGrpForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.scriptEngineGrpForm.getRawValue();
    const scriptEngineArr = [];
    this.scriptEngines.forEach(item => {
      if (item?.checked) {
        delete item?.checked;
        scriptEngineArr.push(item);
      }
    });
    if (scriptEngineArr?.length) {
      const scriptEngineGroupDto: ScriptEngineGroupDto = {
        id: this.dialogData?.id,
        groupName: formValues?.groupName.trim(),
        description: formValues?.description.trim(),
        enabled: formValues?.enabled,
        tempPath: null,
        scriptEngines: scriptEngineArr,
        updatedBy: this.currentUser?.userName,
      };
      this.configurationsService.updateSEGroup(scriptEngineGroupDto).subscribe(res => {
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
    } else {
      this.messageService.add({
        key: 'configInfoKey', severity: 'success', summary: '', detail: 'Please select atleast one script engine'
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.scriptEngineSub.unsubscribe();
  }

}
