import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AuthService } from 'src/app/core/service/auth.service';
import { MustMatch } from 'src/app/shared/validation/must-match.validator';
import { ChangePasswordService } from './change-password.service';
import { KeycloakSecurityService } from 'src/app/shared/services/keycloak-security.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  hideoldpw = false;
  hidenewpw = false;
  hidepw = false;
  changePwForm: UntypedFormGroup;

  validationMessages = {
    oldPassword: {
      required: 'Old password is required'
    },
    newPassword: {
      required: 'New password is required'
    },
    confirmPassword: {
      required: 'Confirm password is required',
      mustMatch: 'Password must match',
    }
  };

  formErrors = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private changePasswordService: ChangePasswordService,
    private auth: AuthService,
    private messageService: MessageService,
    private kcService: KeycloakSecurityService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.createForm();

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  /*============== Create Form ===============*/
  createForm() {
    // tslint:disable-next-line: deprecation
    this.changePwForm = this.fb.group({
      oldPassword: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      newPassword: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      confirmPassword: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
    }, {
      validator: MustMatch('newPassword', 'confirmPassword')
    });
    // tslint:disable-next-line: deprecation
    this.changePwForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.changePwForm);
    });
  }
  /*============== END Create Form ===============*/

  /*============Check Form Validation and Display Messages============*/
  logValidationErrors(group: UntypedFormGroup = this.changePwForm): void {
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
  /*============END Check Form Validation and Display Messages============*/

  /*============== On Clear ===============*/
  onClear() {
    this.changePwForm.reset();
  }

  /*============== On Cancel ===============*/
  onCancel() {
    this.dialogRef.close();
    if (this.dialogData?.isNewUserPasswordChange) {
      // this.auth.logout();
      this.kcService.logout();
    }
  }
  /*============== END On Cancel ===============*/

  updatePassword(formValue) {
    this.changePwForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.changePwForm.valid) {
      const userPassword = {
        userName: this.currentUser.userName,
        changePassword: false,
        password: formValue.oldPassword,
        newPassword: formValue.newPassword
      };
      // tslint:disable-next-line: deprecation
      this.changePasswordService.updatePassword(userPassword).subscribe(res => {
        this.dialogRef.close();
        // this.auth.logout();
        this.messageService.add({ key: 'dashboardSuccessKey', severity: 'success', summary: '', detail: 'Password Updated Successfully!' });
        this.kcService.logout();
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

}
