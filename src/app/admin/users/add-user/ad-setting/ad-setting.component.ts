import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/components/constants';
import { Utility } from '../../users';
import { UsersService } from '../../users.service';
import { BreadCrumbService } from '../../../../core/service/breadcrumb.service';

@Component({
  selector: 'app-ad-setting',
  templateUrl: './ad-setting.component.html',
  styleUrls: ['./ad-setting.component.scss']
})
export class AdSettingComponent implements OnInit, OnDestroy {
  adSesstingForm: UntypedFormGroup;

  validationMessages = {
    ldapUsername: {
      required: 'User name is required',
      maxlength: 'Username must not be more than 128 characters',
    },
    ldapUrl: {
      required: 'URL is required'
    },
    ldapPassword: {
      required: 'Password is required'
    },
    ldapDomain: {
      required: 'Domain is required'
    }
  };

  formErrors = {
    ldapUsername: '',
    ldapUrl: '',
    ldapPassword: '',
    ldapDomain: ''
  };
  updatedBy: string;
  utility: Utility;

  utilitySubscription = Subscription.EMPTY;
  updateUtilitySubscription = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AdSettingComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    // private breadcrumb: BreadCrumbService,
    private fb: UntypedFormBuilder,
    private usersService: UsersService,
    private messageService: MessageService,
  ) {
    this.createForm();
    this.dialogRef.disableClose = true;
    this.getUtilities();
  }

  ngOnInit(): void {
    // this.breadcrumb.visible = false;
    // this.breadcrumb.previous(); // show hide breadcrumb
    /*---------------- Get Current User Data From LocalStroage ----------------*/
    this.updatedBy = localStorage.getItem(Constants.USERNAME);
    /*---------------- Get Current User Data From LocalStroage ----------------*/
  }

  createForm() {
    this.adSesstingForm = this.fb.group({
      ldapUsername: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      ldapUrl: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      ldapPassword: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      ldapDomain: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
    });
  }

  /*============Check Form Validation and Display Messages============*/
  logValidationErrors(group: UntypedFormGroup = this.adSesstingForm): void {
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

  /*============ Get Utilities ==============*/
  getUtilities() {
    this.utilitySubscription = this.usersService.getUtilityByType().subscribe((res: Utility) => {
      this.utility = res;
      if (res) {
        this.adSesstingForm.patchValue({
          ldapUsername: res.ldapUsername,
          ldapUrl: res.ldapUrl,
          ldapPassword: res.ldapPassword,
          ldapDomain: res.ldapDomain
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
  /*============ END Get Utilities ==============*/

  /*============ Save AD Settings ==============*/
  updateAdSettings(formValue: Utility) {
    const utility = this.utility;
    formValue.ldapDomainId = utility.ldapDomainId;
    formValue.ldapPasswordId = utility.ldapPasswordId;
    formValue.ldapUrlId = utility.ldapUrlId;
    formValue.ldapUsernameId = utility.ldapUsernameId;
    formValue.updatedBy = this.updatedBy;
    this.updateUtilitySubscription = this.usersService.updateUtility(formValue).subscribe(res => {
      this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'AD Setting Updated Successfully!' });
      this.dialogRef.close();
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Save AD Settings ==============*/

  /*========== Request Cancelled ==========*/
  onCancel() {
    this.dialogRef.close();
  }
  /*========== END Request Cancelled ==========*/

  ngOnDestroy() {
    this.utilitySubscription.unsubscribe();
    this.updateUtilitySubscription.unsubscribe();
    // this.breadcrumb.visible = true;
    // this.breadcrumb.previousHide(); // show hide breadcrumb
  }

}
