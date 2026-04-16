import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { ProgressiveLoaderService } from 'src/app/core/service/progressiveloader.service';

@Component({
  selector: 'app-alarm-confirmation',
  templateUrl: './alarm-confirmation.component.html',
  styleUrls: ['./alarm-confirmation.component.scss']
})
export class AlarmConfirmationComponent implements OnInit {
  removeEventForm: UntypedFormGroup;
  yearRange = '1950:2100';
  disabledDates: Array<Date> = [];
  data: any = null;

  validationMessages = {
    removeAlarm: {
      required: 'Select one of the option',
    },
    alarmDate: {
      required: 'Date is required',
    }
  };

  formErrors = {
    removeAlarm: '',
    alarmDate: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AlarmConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: FormBuilder,
    public loaderService: ProgressiveLoaderService,
  ) {
    dialogRef.disableClose = true;
    dialogData.endDate = (dialogData?.endDate === '*' || dialogData?.endDate === '') ? this.getLastYear() : dialogData.endDate;
    this.data = dialogData;
  }

  ngOnInit() {
    this.loaderService.show();
    this.createForm();
    this.getLastYear();
    this.onChangeRemoveAlarm();
    this.disableAllExceptEnabled();
  }

  createForm() {
    this.removeEventForm = this.fb.group({
      removeAlarm: [{ value: 'Single', disabled: false }, {
        validators: []
      }],
      alarmDate: [{ value: '', disabled: false }, {
        validators: []
      }]
    });
    this.removeEventForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.removeEventForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.removeEventForm): void {
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

  getLastYear() {
    const currentYear = new Date().getFullYear();
    const next5Years = Number(currentYear) + 5;
    this.yearRange = `1950:${next5Years}`;
    return new Date(Number(next5Years), Number(12) - 1, Number(31));
  }

  disableAllExceptEnabled() {
    // const start = new Date(this.data?.startDate);
    // const end = new Date(this.data?.endDate);
    // for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    //   if (!this.isDateEnabled(new Date(d))) {
    //     this.disabledDates.push(new Date(d));
    //   }
    // }
    if (this.data?.nonSchedulerDataList?.length) {
      this.data?.nonSchedulerDataList.forEach(item => {
        const date = new Date(item.year, item.month - 1, item.dayOfMonth);
        this.disabledDates.push(date);
      });
    }
    this.loaderService.hide();
  }

  isDateEnabled(date: Date): boolean {
    return this.data?.eventsDates.some(enabledDate =>
      enabledDate?.start.toDateString() === date.toDateString()
    );
  }

  onChangeRemoveAlarm() {
    this.removeEventForm.get('alarmDate').reset();
    if (this.removeEventForm.get('removeAlarm').value === 'Single') {
      this.removeEventForm.get('alarmDate').enable();
      this.removeEventForm.get('alarmDate').setValidators([
        Validators.required
      ]);
      this.removeEventForm.get('alarmDate').updateValueAndValidity();
    } else {
      this.removeEventForm.get('alarmDate').disable();
      this.removeEventForm.get('alarmDate').clearValidators();
      this.removeEventForm.get('alarmDate').updateValueAndValidity();
    }
  }

  onYesClick() {
    this.removeEventForm.markAllAsTouched();
    this.logValidationErrors();
    const formValue = this.removeEventForm.getRawValue();
    if (this.removeEventForm?.valid) {
      const alarmObj = {
        isRemove: true,
        data: formValue
      };
      this.dialogRef.close(alarmObj);
    }
  }

  onNoClick(): void {
    const alarmObj = {
      isRemove: false,
      data: true
    };
    this.dialogRef.close(alarmObj);
  }
}
