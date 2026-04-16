import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from "@angular/material/legacy-dialog";
import { Subscription } from 'rxjs';
import { ConfigurationsService } from '../../configurations.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-test-smtpconnection',
  templateUrl: './test-smtpconnection.component.html',
  styleUrls: ['./test-smtpconnection.component.scss']
})
export class TestSMTPConnectionComponent implements OnInit, OnDestroy {
  testConnectionForm: UntypedFormGroup;

  validationMessages = {
    toMail: {
      required: "To mail address is required",
      pattern: 'Please enter valid email.',
      maxlength: "Maximum 128 characters are allowed"
    },
    fromMail: {
      required: "From mail address is required",
      pattern: 'Please enter valid email.',
      maxlength: "Maximum 128 characters are allowed",
    },
    subject: {
      required: "Mail subject is required",
      maxlength: "Maximum 128 characters are allowed",
    },
    description: {
      required: "Mail body is required",
      maxlength: "Maximum 2000 characters are allowed",
    },
  };

  formErrors = {
    toMail: "",
    fromMail: "",
    subject: "",
    description: "",
  };
  
  testSMTPConnectionSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<TestSMTPConnectionComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private configurationsService: ConfigurationsService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.testConnectionForm = this.fb.group({
      toMail: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          Validators.pattern('^[a-zA-ZÅÄÖåäö0-9._%+-]+@[a-zA-ZÅÄÖåäö0-9.-]+\\.[a-zA-ZÅÄÖåäö]{2,4}$')
        ]
      }],
      fromMail: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          Validators.pattern('^[a-zA-ZÅÄÖåäö0-9._%+-]+@[a-zA-ZÅÄÖåäö0-9.-]+\\.[a-zA-ZÅÄÖåäö]{2,4}$')
        ]
      }],
      subject: [{ value: '', disabled: false }, {
        validators: [Validators.required, Validators.maxLength(128)]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [Validators.maxLength(2000)]
      }]
    });
    this.testConnectionForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.testConnectionForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.testConnectionForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = "";
        if (abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty)) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + " ";
            }
          }
        }
      }
    });
  }
  /*============ END Check Form Validation and Display Messages ============*/

  testConnection() {
    const formValue = this.testConnectionForm.getRawValue();
    formValue.isSave = true;
    const mailDto = {
      from: formValue?.fromMail,
      to: formValue?.toMail,
      subject: formValue?.subject,
      text: formValue?.description
    };

    this.testSMTPConnectionSub = this.configurationsService.checkSMTPConnection(mailDto).subscribe(res => {
      if (res) {
        this.dialogRef.close(formValue);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onCancel() {
    const formValue = {
      isSave: false
    };
    this.dialogRef.close(formValue);
  }

  ngOnDestroy(): void {
    this.testSMTPConnectionSub.unsubscribe();
  }
}
