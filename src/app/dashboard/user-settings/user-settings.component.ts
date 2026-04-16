import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { UserSettingService } from './user-setting.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  devlopmentSettingsForm: UntypedFormGroup;
  devSettingParams: Array<any> = [];

  getUserSettingSub = Subscription.EMPTY;
  saveUserSettingSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<UserSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private userSettingService: UserSettingService
  ) {
    dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (this.dialogData?.module === 'development') {
      this.getUserSetting();
    }
  }

  ngOnInit(): void {
    this.createDevelopmentSettingsForm();
  }

  /*========= Create Development Module Setting Form =========*/
  createDevelopmentSettingsForm() {
    this.devlopmentSettingsForm = this.fb.group({
      devSettings: this.fb.array([this.addParameters()]),
    });
  }

  addParameters(): UntypedFormGroup {
    return this.fb.group({
      id: [{ value: "", disabled: false }],
      defaultValue: [{ value: "", disabled: false }],
      dataType: [{ value: "", disabled: false }],
      newValue: [{ value: "", disabled: false }],
      function: [{ value: "", disabled: false }],
      tag: [{ value: "", disabled: false }],
      label: [{ value: "", disabled: false }],
      module: [{ value: "", disabled: false }],
    });
  }

  setExistingDevSetting(parameters: any[], isCtrlDisabled: any): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    parameters.forEach((parameter) => {
      const formGroup = this.fb.group({
        id: [{ value: parameter.id, disabled: isCtrlDisabled?.id }],
        defaultValue: [{ value: parameter.value, disabled: isCtrlDisabled?.defaultValue }],
        dataType: [{ value: parameter.dataType, disabled: false }],
        newValue: [{ value: parameter.newValue, disabled: isCtrlDisabled?.newValue }],
        function: [{ value: parameter.component, disabled: isCtrlDisabled?.function }],
        tag: [{ value: parameter.action, disabled: isCtrlDisabled?.function }],
        label: [{ value: parameter.tag, disabled: isCtrlDisabled?.label }],
        module: [{ value: parameter.module, disabled: isCtrlDisabled?.module }],
      });
      formArray.push(formGroup);
    });
    return formArray;
  }

  getUserSetting() {
    const obj = {
      function: '',
      parent_id: '',
      parameterName: '',
      moduleCode: this.dialogData?.moduleCode
    };
    this.getUserSettingSub = this.userSettingService.getUserSetting(obj).subscribe((res) => {
      if (res?.length) {
        this.devSettingParams = res;
        const devSettingsParams = JSON.parse(JSON.stringify(res));
        devSettingsParams.forEach((param: any) => {
          if (param?.dataType.toLowerCase() === 'boolean') {
            const defaultValue = param.value.toLowerCase() === 'true' ? true : false;
            param.newValue = defaultValue; // Initialize newValue with defaultValue
          }
        });
        const devSettingFormCtrlObj = {
          id: true,
          defaultValue: false,
          newValue: false,
          function: true,
          tag: true,
          label: true,
          module: true,
        };
        this.devlopmentSettingsForm.setControl("devSettings", this.setExistingDevSetting(devSettingsParams, devSettingFormCtrlObj));
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  toBoolean(value) {
    return value.toString().toLowerCase() === "true";
  }

  saveUserSetting() {
    const devSettings = this.devlopmentSettingsForm.get('devSettings').getRawValue();
    if (this.devSettingParams?.length && devSettings?.length) {
      this.devSettingParams.forEach((p, index) => {
        const existingParam = devSettings.find(param => param.id === p.id);
        if (existingParam) {
          if (p?.source.trim() === 'userModuleSetting') {
            p.id = null; // Reset ID for new parameters
          }
          // Update existing parameter
          if (existingParam.dataType.toLowerCase() === 'boolean') {
            p.value = this.toBoolean(existingParam.newValue) ? 'true' : 'false';
          } else {
            p.value = existingParam.newValue;
          }
        }
      });

      this.saveUserSettingSub = this.userSettingService.saveUserSetting(this.devSettingParams).subscribe((res) => {
        if (res) {
          const responseObj = {
            isSaved: true,
            res: res,
            module: this.dialogData?.moduleCode
          };
          this.dialogRef.close(responseObj);
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

  onCancel() {
    const obj = {
      isSaved: false
    };
    this.dialogRef.close(obj);
  }

  ngOnDestroy(): void {
    this.getUserSettingSub.unsubscribe();
    this.saveUserSettingSub.unsubscribe();
  }
}
