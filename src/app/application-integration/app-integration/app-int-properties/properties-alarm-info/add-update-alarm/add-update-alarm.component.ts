import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AppIntegrationService } from '../../../app-integration.service';
import { AppIntegrationDataService } from '../../../app-integration-data.service';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';
import { CheckNumericDays } from 'src/app/shared/validation/numeric-days.validator';
import { CheckCustomNumbers } from 'src/app/shared/validation/custom-number.validator';
import { CheckNumbericSymbols } from 'src/app/shared/validation/numeric-symbol.validator';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { HttpErrorResponse } from '@angular/common/http';
import { AlarmDto, NonSchedulerDto, SchedulerDto } from '../../../appintegration';
import { CalendarEvent } from 'angular-calendar';
import { commaSeparatedNumbersValidator } from 'src/app/shared/validation/comma-numeric.validator';

@Component({
  selector: 'app-add-update-alarm',
  templateUrl: './add-update-alarm.component.html',
  styleUrls: ['./add-update-alarm.component.scss']
})
export class AddUpdateAlarmComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  headingText: string = '';
  addEventForm: UntypedFormGroup;
  startDate = new Date();
  yearRange = '1950:2100';
  endDateErrMsg: string = '';
  alertProcesses: Array<any> = [];
  isAlarmNameValid: boolean = false;
  editScheduler: any = null;
  recurrenceTooltip: string = '';
  events: CalendarEvent[] = [];
  calendarMonthAndYear: { month: number, year: number } = { month: null, year: null };
  dayList = [
    { id: 1, name: '1st', value: 'first' },
    { id: 2, name: '2nd', value: 'second' },
    { id: 3, name: '3rd', value: 'third' },
    { id: 4, name: '4th', value: 'fourth' },
    { id: 0, name: 'last', value: 'last' },
  ];
  weekDaysList = [
    { id: 0, value: 'Sunday' },
    { id: 1, value: 'Monday' },
    { id: 2, value: 'Tuesday' },
    { id: 3, value: 'Wednesday' },
    { id: 4, value: 'Thursday' },
    { id: 5, value: 'Friday' },
    { id: 6, value: 'Saturday' }
  ];
  yearMonthList = [
    { id: 0, value: 'January' },
    { id: 1, value: 'February' },
    { id: 2, value: 'March' },
    { id: 3, value: 'April' },
    { id: 4, value: 'May' },
    { id: 5, value: 'June' },
    { id: 6, value: 'July' },
    { id: 7, value: 'August' },
    { id: 8, value: 'September' },
    { id: 9, value: 'October' },
    { id: 10, value: 'November' },
    { id: 11, value: 'December' },
  ];

  validationMessages = {
    alarmName: {
      required: 'Name is required',
      maxlength: 'Maximum 128 characters are allowed',
      hasWhitespace: 'Whitespace not allowed'
    },
    alarmHour: {
      required: 'Hours are required',
      hasNumberSymbols: 'Only numbers, commas, hyphens (-), and asterisks (*) are allowed',
      invalidFormat: 'Enter numbers, ranges, or comma-separated values',
      invalidRange: 'Make sure the start number is less than the end number and both are between 0 and 23',
      invalidNumber: 'Enter a number between 0 and 23'
    },
    alarmMinutes: {
      required: 'Minutes are required',
      hasNumberSymbols: 'Only numbers, commas, hyphens (-), and asterisks (*) are allowed',
      invalidFormat: 'Enter numbers, ranges, or comma-separated values',
      invalidRange: 'Make sure the start number is less than the end number and both are between 0 and 59',
      invalidNumber: 'Enter a number between 0 and 59'
    },
    alarmSeconds: {
      required: 'Seconds are required',
      hasNumberSymbols: 'Only numbers, commas, hyphens (-), and asterisks (*) are allowed',
      invalidFormat: 'Enter numbers, ranges, or comma-separated values',
      invalidRange: 'Make sure the start number is less than the end number and both are between 0 and 59',
      invalidNumber: 'Enter a number between 0 and 59'
    },
    alarmRecurrence: {

    },
    alarmDaily: {

    },
    alarmDaysOfWeek: {
      required: 'Day(s) are required',
    },
    alarmMonths: {
      required: 'Month(s) are required',
    },
    alarmMonthly: {

    },
    alarmDaysOfMonth: {
      required: 'Day(s) is required',
      invalidNumbers: 'Day should be number only',
      invalidNumericDay: 'Day should be between 1 to 31',
    },
    alarmMonthOfDay: {
      required: 'Day is required',
    },
    alarmMonthOfWeekDay: {
      required: 'Month is required',
    },
    alarmYearly: {

    },
    alarmYearOfMonthDay: {

    },
    alarmWeekDayOfMonthOfYear: {

    },
    alarmMonthOfYear: {

    },
    alarmMonthsOfyear: {
      required: 'Month(s) is required',
    },
    alarmDayOfYear: {
      required: 'Day(s) is required',
      invalidNumbers: 'Day should be number only',
      invalidNumericDay: 'Day should be between 1 to 31',
      invalidFormat: 'Enter only comma-separated numbers or ranges between 1 and 31',
      outOfRange: 'Day should be between 1 to 31',
      duplicate: 'Duplicate days are not allowed',
      invalidRange: 'Make sure the start number is less than the end number and both are between 1 and 31'
    },
    alarmStartDate: {
      required: 'Start date is required',
    },
    alarmYesNoEndDate: {

    },
    alarmEndDate: {
      required: 'End date is required',
    },
    alarmProcess: {
      required: 'Alert process is required',
    },
    alarmDisable: {

    },
  };

  formErrors = {
    alarmName: '',
    alarmHour: '',
    alarmMinutes: '',
    alarmSeconds: '',
    alarmRecurrence: '',
    alarmDaily: '',
    alarmDaysOfWeek: '',
    alarmMonths: '',
    alarmMonthly: '',
    alarmDaysOfMonth: '',
    alarmMonthOfDay: '',
    alarmMonthOfWeekDay: '',
    alarmYearly: '',
    alarmYearOfMonthDay: '',
    alarmWeekDayOfMonthOfYear: '',
    alarmMonthOfYear: '',
    alarmMonthsOfyear: '',
    alarmDayOfYear: '',
    alarmStartDate: '',
    alarmYesNoEndDate: '',
    alarmEndDate: '',
    alarmProcess: '',
    alarmDisable: '',
  };

  hoursTooltip = `
  <ul style='padding-left:16px; margin:0'>
    <li><b>Range:</b> start-end (e.g., 1-18 → every hour from 01:00 to 18:00)</li>
    <li><b>Step:</b> */n (e.g., */5 → every 5th hour: 00:00, 05:00, 10:00...)</li>
    <li><b>List:</b> h1,h2,... (e.g., 0,1,12,22 → 00:00, 01:00, 12:00, 22:00)</li>
  </ul>
  `;
  minutesTooltip = `
  <ul style='padding-left:16px; margin:0'>
    <li><b>Range:</b> start-end (e.g., 1-18 → HH:01 to HH:18)</li>
    <li><b>Step:</b> */n (e.g., */5 → every 5th minute: HH:00, HH:05, HH:10…)</li>
    <li><b>List:</b> m1,m2,… (e.g., 0,1,12,22 → HH:00, HH:01, HH:12, HH:22)</li>
  </ul>
  `;
  secondsTooltip = `
  <ul style='padding-left:16px; margin:0'>
    <li><b>Range:</b> start-end (e.g., 1-18 → HH:MM:01 to HH:MM:18)</li>
    <li><b>Step:</b> */n (e.g., */5 → every 5th second: HH:MM:00, HH:MM:05…)</li>
    <li><b>List:</b> s1,s2,… (e.g., 0,1,12,22 → HH:MM:00, HH:MM:01, HH:MM:12…)</li>
  </ul>
  `;
  dailyTooltip = `Select everyday or weekdays for triggering.`;
  weeklyTooltip = `Select days and months for triggering.`;
  monthlyTooltip = `Select which day of every month or what day of every month for triggering.`;
  yearlyTooltip = `Select what day of what month or which months on which days should be used for triggering.`;


  private getAlertProcessSub = Subscription.EMPTY;
  private getDeployedProcessByIdSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AddUpdateAlarmComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public router: Router,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');

    if (dialogData?.isAdd) {
      this.headingText = dialogData?.isIntegration ? 'Add alarm' : dialogData?.isTrigger ? 'Add scheduler' : '';
    } else if (dialogData?.isEdit) {
      this.headingText = dialogData?.isIntegration ? 'Update alarm' : dialogData?.isTrigger ? 'Update scheduler' : '';
    }
    this.createForm();
    if (dialogData?.isIntegration && dialogData?.workspaceId) {
      this.getAlertProcesses();
    }
    if (dialogData?.isEdit) {
      this.editOrSetEventsInCalender(dialogData?.event, dialogData?.isEdit);
    }
  }

  ngOnInit(): void {
    const recurrenceOption = this.addEventForm.get('alarmRecurrence').value;
    if (recurrenceOption.toUpperCase() === 'DAILY') {
      this.recurrenceTooltip = this.dailyTooltip;
    }
    if (recurrenceOption.toUpperCase() === 'WEEKLY') {
      this.recurrenceTooltip = this.weeklyTooltip;
    }
    if (recurrenceOption.toUpperCase() === 'MONTHLY') {
      this.recurrenceTooltip = this.monthlyTooltip;
    }
    if (recurrenceOption.toUpperCase() === 'YEARLY') {
      this.recurrenceTooltip = this.yearlyTooltip;
    }
  }

  getLastYear(): Date {
    const currentYear = new Date().getFullYear();
    const next5Years = Number(currentYear) + 5;
    this.yearRange = `1950:${next5Years}`;
    return new Date(Number(next5Years), Number(12) - 1, Number(31));
  }

  validateCalendarMonthAndYear() {
    this.calendarMonthAndYear
    if ((this.getLastYear().getMonth() + 1 === this.calendarMonthAndYear?.month) &&
      this.getLastYear().getFullYear() === this.calendarMonthAndYear?.year) {
      return true;
    } else {
      return false;
    }
  }

  createForm(): void {
    this.addEventForm = this.fb.group({
      alarmName: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      alarmHour: [{ value: 0, disabled: false }, {
        validators: [
          Validators.required,
          CheckNumbericSymbols.numericSymbolValidator({ hasNumberSymbols: true }),
          CheckCustomNumbers.customNumberValidator({ minNum: 0, maxNum: 23, isMinutesOrSeconds: false })
        ]
      }],
      alarmMinutes: [{ value: 0, disabled: false }, {
        validators: [
          Validators.required,
          CheckNumbericSymbols.numericSymbolValidator({ hasNumberSymbols: true }),
          CheckCustomNumbers.customNumberValidator({ minNum: 0, maxNum: 59, isMinutesOrSeconds: true })
        ]
      }],
      alarmSeconds: [{ value: 0, disabled: false }, {
        validators: [
          Validators.required,
          CheckNumbericSymbols.numericSymbolValidator({ hasNumberSymbols: true }),
          CheckCustomNumbers.customNumberValidator({ minNum: 0, maxNum: 59, isMinutesOrSeconds: true })
        ]
      }],
      alarmRecurrence: [{ value: 'DAILY', disabled: false }, {
        validators: []
      }],
      alarmDailyRecurrence: this.fb.group({
        alarmDaily: [{ value: 'everyDay', disabled: false }, {
          validators: []
        }]
      }),
      alarmWeeklyRecurrence: this.fb.group({
        alarmDaysOfWeek: [{ value: [], disabled: false }, {
          validators: []
        }],
        alarmMonths: [{ value: [], disabled: false }, {
          validators: []
        }]
      }),
      alarmMonthlyRecurrence: this.fb.group({
        alarmMonthly: [{ value: 'dayOfMonth', disabled: false }, {
          validators: []
        }],
        alarmDaysOfMonth: [{ value: 1, disabled: false }, {
          validators: []
        }],
        alarmMonthOfDay: [{ value: 1, disabled: false }, {
          validators: []
        }],
        alarmMonthOfWeekDay: [{ value: 0, disabled: false }, {
          validators: []
        }]
      }),
      alarmYearlyRecurrence: this.fb.group({
        alarmYearly: [{ value: 'secificDayOfMonthAndYear', disabled: false }, {
          validators: []
        }],
        alarmYearOfMonthDay: [{ value: 1, disabled: false }, {
          validators: []
        }],
        alarmWeekDayOfMonthOfYear: [{ value: 0, disabled: false }, {
          validators: []
        }],
        alarmMonthOfYear: [{ value: 0, disabled: false }, {
          validators: []
        }],
        alarmMonthsOfyear: [{ value: [], disabled: false }, {
          validators: []
        }],
        alarmDayOfYear: [{ value: 1, disabled: false }, {
          validators: [
            Validators.required,
            // CheckNumericDays.numericDaysValidator({ minNum: 1, maxNum: 31 }),
            commaSeparatedNumbersValidator.commaSepratedDaysValidator({ minNum: 1, maxNum: 31 })
          ]
        }]
      }),
      alarmStartDate: [{ value: this.startDate, disabled: false }, {
        validators: []
      }],
      alarmYesNoEndDate: [{ value: 'noEndDate', disabled: false }, {
        validators: []
      }],
      alarmEndDate: [{ value: '', disabled: true }, {
        validators: []
      }],
      alarmProcess: [{ value: '', disabled: false }, {
        validators: []
      }],
      alarmDisable: [{ value: false, disabled: false }, {
        validators: []
      }],
      color: [{ value: 'sky_magenta', disabled: false }, {
        validators: []
      }]
    });
    this.addEventForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.addEventForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.addEventForm): void {
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

  formatDate(dateStr: string): Date {
    if (dateStr) {
      const d = dateStr.split('.');
      const formattedDate = `${d[1]}/${d[0]}/${d[2]}`;
      return new Date(formattedDate);
    }
  }

  isTwoDigitNumber(str: string) {
    const regex = /^\d{1,2}$/;
    return regex.test(str);
  }

  getNumberFromStr(str: string) {
    // Regular expression to capture the number and weekday
    const regex = /(\d+)\w*\s(\w+)/;

    // Apply the regex to the string
    const match = str.match(regex);

    if (match) {
      return {
        weekdayNumber: match[1],
        weekday: match[2]
      };
    } else {
      return null;
    }
  }

  onChangeAlertProcess(selectedProcessId: number) {
    this.getDeployedProcessByIdSub = this.appIntegrationService.getDeployedProcessById(selectedProcessId).subscribe((res) => {
      if (!res.deployed) {
        this.messageService.add({
          key: "appIntInfoKey",
          severity: "success",
          summary: "",
          detail: `The selected alert process is undeployed.`,
        });
      }
    });
  }

  onChangeRecurrence() {
    const recurrenceOption = this.addEventForm.get('alarmRecurrence').value;
    const dailyRecurrenceDefaultvalues = {
      alarmDaily: 'everyDay'
    };
    const weeklyRecurrenceDefaultvalues = {
      alarmDaysOfWeek: [],
      alarmMonths: [],
    };
    const monthlyRecurrenceDefaultvalues = {
      alarmMonthly: 'dayOfMonth',
      alarmDaysOfMonth: 1,
      alarmMonthOfDay: 1,
      alarmMonthOfWeekDay: 0,
    };
    const yearlyRecurrenceDefaultvalues = {
      alarmYearly: 'secificDayOfMonthAndYear',
      alarmYearOfMonthDay: 1,
      alarmWeekDayOfMonthOfYear: 0,
      alarmMonthOfYear: 0,
      alarmMonthsOfyear: [],
      alarmDayOfYear: 1
    };
    this.addEventForm.get('alarmDailyRecurrence').reset(dailyRecurrenceDefaultvalues);
    this.addEventForm.get('alarmWeeklyRecurrence').reset(weeklyRecurrenceDefaultvalues);
    this.addEventForm.get('alarmMonthlyRecurrence').reset(monthlyRecurrenceDefaultvalues);
    this.addEventForm.get('alarmYearlyRecurrence').reset(yearlyRecurrenceDefaultvalues);

    if (recurrenceOption.toUpperCase() === 'DAILY') {
      this.recurrenceTooltip = this.dailyTooltip;
    }

    const weeklyRecurrenceGroup = this.addEventForm.get('alarmWeeklyRecurrence') as FormGroup;
    if (recurrenceOption.toUpperCase() === 'WEEKLY') {
      this.recurrenceTooltip = this.weeklyTooltip;
      weeklyRecurrenceGroup.get('alarmDaysOfWeek').setValidators([
        Validators.required
      ]);
      weeklyRecurrenceGroup.get('alarmMonths').setValidators([
        Validators.required
      ]);
      weeklyRecurrenceGroup.get('alarmDaysOfWeek').updateValueAndValidity();
      weeklyRecurrenceGroup.get('alarmMonths').updateValueAndValidity();
    } else {
      weeklyRecurrenceGroup.get('alarmDaysOfWeek').clearValidators();
      weeklyRecurrenceGroup.get('alarmMonths').clearValidators();
      weeklyRecurrenceGroup.get('alarmDaysOfWeek').updateValueAndValidity();
      weeklyRecurrenceGroup.get('alarmMonths').updateValueAndValidity();
    }

    const monthlyRecurrenceGroup = this.addEventForm.get('alarmMonthlyRecurrence') as FormGroup;
    if (recurrenceOption.toUpperCase() === 'MONTHLY') {
      this.recurrenceTooltip = this.monthlyTooltip;
      this.onChangeMonthlyRecurrence();
    } else {
      monthlyRecurrenceGroup.get('alarmDaysOfMonth').clearValidators();
      monthlyRecurrenceGroup.get('alarmDaysOfMonth').updateValueAndValidity();
    }

    const yearlyRecurrenceGroup = this.addEventForm.get('alarmYearlyRecurrence') as FormGroup;
    if (recurrenceOption.toUpperCase() === 'YEARLY') {
      this.recurrenceTooltip = this.yearlyTooltip;
      this.onChangeYearlyRecurrence();
    } else {
      yearlyRecurrenceGroup.get('alarmMonthsOfyear').clearValidators();
      yearlyRecurrenceGroup.get('alarmDayOfYear').clearValidators();
      yearlyRecurrenceGroup.get('alarmMonthsOfyear').updateValueAndValidity();
      yearlyRecurrenceGroup.get('alarmDayOfYear').updateValueAndValidity();
    }
  }

  onChangeMonthlyRecurrence() {
    const monthlyRecurrenceGroup = this.addEventForm.get('alarmMonthlyRecurrence') as FormGroup;
    if (monthlyRecurrenceGroup.get('alarmMonthly').value === 'dayOfMonth') {
      monthlyRecurrenceGroup.get('alarmDaysOfMonth').setValidators([
        Validators.required,
        CheckNumericDays.numericDaysValidator({ minNum: 1, maxNum: 31 })
      ]);
      monthlyRecurrenceGroup.get('alarmDaysOfMonth').updateValueAndValidity();
    } else {
      monthlyRecurrenceGroup.get('alarmDaysOfMonth').clearValidators();
      monthlyRecurrenceGroup.get('alarmDaysOfMonth').updateValueAndValidity();
    }
  }

  onChangeYearlyRecurrence() {
    const yearlyRecurrenceGroup = this.addEventForm.get('alarmYearlyRecurrence') as FormGroup;
    if (yearlyRecurrenceGroup.get('alarmYearly').value === 'monthOfYear') {
      yearlyRecurrenceGroup.get('alarmMonthsOfyear').setValidators([
        Validators.required
      ]);
      yearlyRecurrenceGroup.get('alarmDayOfYear').setValidators([
        Validators.required,
        // CheckNumericDays.numericDaysValidator({ minNum: 1, maxNum: 31 }),
        commaSeparatedNumbersValidator.commaSepratedDaysValidator({ minNum: 1, maxNum: 31 })
      ]);
      yearlyRecurrenceGroup.get('alarmMonthsOfyear').updateValueAndValidity();
      yearlyRecurrenceGroup.get('alarmDayOfYear').updateValueAndValidity();
    } else {
      yearlyRecurrenceGroup.get('alarmMonthsOfyear').clearValidators();
      yearlyRecurrenceGroup.get('alarmDayOfYear').clearValidators();
      yearlyRecurrenceGroup.get('alarmMonthsOfyear').updateValueAndValidity();
      yearlyRecurrenceGroup.get('alarmDayOfYear').updateValueAndValidity();
    }
  }

  onChangeEndDateOption() {
    const endDateValue = this.addEventForm.get('alarmYesNoEndDate').value;
    this.endDateErrMsg = '';
    this.addEventForm.get('alarmEndDate').reset();
    if (endDateValue === 'noEndDate') {
      this.addEventForm.get('alarmEndDate').disable();
      this.validateEndDate();
    } else {
      this.addEventForm.get('alarmEndDate').enable();
      this.validateEndDate();
    }
  }

  validateEndDate(): boolean {
    const endDateValue = this.addEventForm.get('alarmYesNoEndDate').value;
    const endDate = this.addEventForm.get('alarmEndDate').value;
    if (endDateValue === 'noEndDate') {
      return false;
    } else {
      if (!endDate || endDate === '') {
        return true;
      }
    }
  }

  // getAlertProcesses() {
  //   this.getAlertProcessSub = this.appIntegrationService.getActiveAlertProcesses(this.dialogData?.workspaceId).subscribe((res) => {
  //     this.alertProcesses = res;
  //   }, (err: HttpErrorResponse) => {
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }

  getAlertProcesses() {
    // Check cache first
    const cachedAlertProcesses = this.appIntegrationDataService.getAlertProcesses();
    if (cachedAlertProcesses?.length) {
      this.alertProcesses = cachedAlertProcesses;
      return;
    }

    // Only call API if cache is empty
    this.getAlertProcessSub = this.appIntegrationService.getActiveAlertProcesses(this.dialogData?.workspaceId).subscribe((res) => {
      this.alertProcesses = res;
      this.appIntegrationDataService.storeAlertProcesses(this.alertProcesses);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getNonSchedulerDto() {
    const nonSchedulerDto: NonSchedulerDto = {
      id: null,
      year: null,
      month: null,
      dayOfMonth: null,
      dayOfWeek: null,
      updatedBy: '',
      lastUpdated: '',
    };
    return nonSchedulerDto;
  }

  getAlarmDto(formValues: any, weekDaysIds: any, monthIds: any, dayOfMonth: any, alertProcess: any, disabled: boolean) {
    const alarmDto: AlarmDto = {
      alarmName: formValues?.alarmName,
      alarmProcessName: alertProcess?.name,
      alarmProcessId: alertProcess?.id,
      months: '',
      dayOfWeek: '',
      dayOfMonth: '',
      hour: formValues?.alarmHour,
      minutes: formValues?.alarmMinutes,
      seconds: formValues?.alarmSeconds,
      startdate: formValues?.alarmStartDate,
      enddate: formValues?.alarmYesNoEndDate === 'withEndDate' ? formValues?.alarmEndDate : '',
      disable: formValues?.alarmDisable,
      //disabled: formValues?.alarmDisable,
      id: null,
      recurrencePattern: formValues?.alarmRecurrence,
      nonSchedulerDtoList: []
    };
    return alarmDto;
  }

  getSchedulerDto(formValues: any, weekDaysIds: any, monthIds: any, dayOfMonth: any, disabled: boolean) {
    let monthRange = null;
    if (formValues?.alarmRecurrence === 'MONTHLY') {
      monthRange = `${new Date(formValues?.alarmStartDate).getMonth() + 1}-${formValues?.alarmYesNoEndDate === 'withEndDate' ? new Date(formValues?.alarmEndDate).getMonth() + 1 : '*'}`;
    }
    const schedulerDto: SchedulerDto = {
      id: null,
      dayOfMonth: dayOfMonth,
      dayOfWeek: weekDaysIds,
      endDate: formValues?.alarmYesNoEndDate === 'withEndDate' ? formValues?.alarmEndDate : '*',
      eventId: formValues?.alarmProcess,
      recurrencePatternSummary: null,
      hour: formValues?.alarmHour,
      lastUpdated: null,
      minutes: formValues?.alarmMinutes,
      // months: formValues?.alarmRecurrence === 'MONTHLY' ? monthRange : monthIds,
      // month: formValues?.alarmRecurrence === 'MONTHLY' ? monthRange : monthIds,
      // Changes made as per JIRA TEI-4964
      months: formValues?.alarmRecurrence === 'MONTHLY' ? '' : monthIds,
      month: formValues?.alarmRecurrence === 'MONTHLY' ? '' : monthIds,
      nonSchedulerDataList: formValues?.nonSchedulerDataList ? formValues?.nonSchedulerDataList : [],
      recurrencePattern: formValues?.alarmRecurrence.toUpperCase(),
      schedulerName: formValues?.alarmName.trim(),
      seconds: formValues?.alarmSeconds,
      startDate: formValues?.alarmStartDate,
      updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      // disabled: formValues?.alarmDisable,
      disable: formValues?.alarmDisable,
      sequence: 0,
      year: null,
      alarmDisable: disabled
    };

    return schedulerDto;
  }

  getLocalSchedulerDto(formValues: any, schedulerDto: SchedulerDto, disabled: boolean) {
    const schedulerLocalDto = {
      ...schedulerDto,
      localDto: {
        alarmYesNoEndDate: formValues?.alarmYesNoEndDate,
        alarmDaily: formValues?.alarmDailyRecurrence?.alarmDaily,
        alarmDaysOfWeek: formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek,
        alarmMonths: formValues?.alarmWeeklyRecurrence?.alarmMonths,
        alarmMonthly: formValues?.alarmMonthlyRecurrence?.alarmMonthly,
        alarmDaysOfMonth: formValues?.alarmMonthlyRecurrence?.alarmDaysOfMonth,
        alarmMonthOfDay: formValues?.alarmMonthlyRecurrence?.alarmMonthOfDay,
        alarmMonthOfWeekDay: formValues?.alarmMonthlyRecurrence?.alarmMonthOfWeekDay,
        alarmYearly: formValues?.alarmYearlyRecurrence?.alarmYearly,
        alarmYearOfMonthDay: formValues?.alarmYearlyRecurrence?.alarmYearOfMonthDay,
        alarmWeekDayOfMonthOfYear: formValues?.alarmYearlyRecurrence?.alarmWeekDayOfMonthOfYear,
        alarmMonthOfYear: formValues?.alarmYearlyRecurrence?.alarmMonthOfYear,
        alarmMonthsOfyear: formValues?.alarmYearlyRecurrence?.alarmMonthsOfyear,
        alarmDayOfYear: formValues?.alarmYearlyRecurrence?.alarmDayOfYear,
        alarmDisable: disabled
      }
    };
    return schedulerLocalDto;
  }

  // Function for get every day of the month
  getEveryDay(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    let current_date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let end_date = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    while (current_date <= end_date) {
      dates.push(new Date(current_date)); // Push a copy of the current date to avoid mutation issues
      current_date.setDate(current_date.getDate() + 1); // Move to the next day
    }

    return dates;
  }

  // Function for get week days only from selected start and end dates
  getWeekDays(startDate: Date, endDate: Date): Date[] {
    const weekdays = [];
    let current_date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let end_date = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    // Loop through each date from startDate to endDate
    for (current_date; current_date <= end_date; current_date.setDate(current_date.getDate() + 1)) {
      // Check if the current date is a weekday (Monday to Friday)
      const day = current_date.getDay();
      if (day >= 1 && day <= 5) {
        weekdays.push(new Date(current_date));
      }
    }

    return weekdays;
  }

  // Function for get days of months from selected start and end dates
  getDatesWithinRange(startDate: Date, endDate: Date, months: number[], daysOfWeek: number[]): Date[] {
    const result: Date[] = [];

    // Start with the startDate
    let current_date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    let end_date = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    // Iterate until the currentDate exceeds the endDate
    while (current_date <= end_date) {
      const currentMonth = current_date.getMonth(); // getMonth() is 0-based
      const currentDayOfWeek = current_date.getDay();  // getDay() is 0 for Sunday, 1 for Monday, ..., 6 for Saturday

      // Check if the current date's month and day of the week match the provided lists
      if (months.includes(currentMonth) && daysOfWeek.includes(currentDayOfWeek)) {
        result.push(new Date(current_date));
      }

      // Move to the next day
      current_date.setDate(current_date.getDate() + 1);
    }

    return result;
  }

  getDayOfMonth(start_date: Date, endDate: Date, dayOfMonth: number): Date[] {
    const dates: Date[] = [];
    const startDate = new Date(start_date.getFullYear(), start_date.getMonth(), dayOfMonth, 0, 0, 0, 0);
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), dayOfMonth, 0, 0, 0, 0);

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayOfMonth, 0, 0, 0, 0);
      if (
        targetDate.getMonth() === month && // Ensures it's a valid day for the month
        targetDate >= start_date &&
        targetDate <= endDate
      ) {
        dates.push(targetDate);
      }
      // Move to the next month
      currentDate = new Date(year, month + 1);
    }

    return dates;
  }

  getNthWeekdayOfMonth(year: number, month: number, day: number, n: number): Date {
    let count = 0;
    let date = new Date(year, month, 1);

    while (date.getMonth() === month) {
      if (date.getDay() === day) {
        count++;
        if (count === n) {
          return date;
        }
      }
      date.setDate(date.getDate() + 1);
    }
    return null!;
  }

  getLastWeekdayOfMonth(year: number, month: number, day: number): Date {
    let date = new Date(year, month + 1, 0); // Last day of the month

    while (date.getDay() !== day) {
      date.setDate(date.getDate() - 1);
    }
    return date;
  }

  getWeekdayOfMonth(year: number, month: number, week: number, day: number): Date {
    switch (week) {
      case 1:
        return this.getNthWeekdayOfMonth(year, month, day, 1);
      case 2:
        return this.getNthWeekdayOfMonth(year, month, day, 2);
      case 3:
        return this.getNthWeekdayOfMonth(year, month, day, 3);
      case 4:
        return this.getNthWeekdayOfMonth(year, month, day, 4);
      case 0:
        return this.getLastWeekdayOfMonth(year, month, day);
    }
  }

  // Function for get specific day of the month
  getDatesBetween(start_date: Date, endDate: Date, week: number, day: number): Date[] {
    let dates: Date[] = [];

    const startDate = new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate(), 0, 0, 0, 0);
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

    while (current <= endDate) {
      const date = this.getWeekdayOfMonth(current.getFullYear(), current.getMonth(), week, day);
      if (date >= startDate && date <= endDate) {
        dates.push(date);
      }
      current.setMonth(current.getMonth() + 1);
    }

    return dates;
  }

  // Get nth date of year
  getNthDayOfYear(startDate, endDate, occurrence, dayOfWeek, month) {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0, 0);
    // const start = new Date(startDate);
    // const end = new Date(endDate);
    const results = [];

    // Define a mapping for occurrences and days
    const occurrenceMap = {
      1: 0,
      2: 1,
      3: 2,
      4: 3,
      0: -1 // Special case for last occurrence
    };

    if (occurrence === 0) {
      return this.getLastDaysBetween(startDate, endDate, dayOfWeek, month);
    } else {
      // Iterate through each date from start to end
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const currentDay = d.getDay();
        const currentMonth = d.getMonth();
        const currentDate = d.getDate();

        // Check for matching day and month
        if (currentDay === dayOfWeek && currentMonth === month) {
          const dayOfWeekCount = Math.floor((currentDate - 1) / 7);

          if (dayOfWeekCount === occurrenceMap[occurrence]) {
            results.push(new Date(d));
          }
        }
      }
      return results;
    }
  }

  getLastDayOfWeek(year, month, dayOfWeek) {
    // month is 0-indexed (0 = January, 11 = December)
    let date = new Date(year, month + 1, 0); // Get last day of the month
    let lastDayOfMonth = date.getDate();

    // Go back to find the last occurrence of the specified day of the week
    while (date.getDay() !== dayOfWeek) {
      date.setDate(lastDayOfMonth--);
    }
    return date;
  }

  getLastDaysBetween(startD, endD, daysOfWeek, monthsOfYear) {
    let results = [];
    // let startDate = new Date(startD);
    // let endDate = new Date(endD);
    const startDate = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate(), 0, 0, 0, 0);
    const endDate = new Date(endD.getFullYear(), endD.getMonth(), endD.getDate(), 0, 0, 0, 0);
    let startYear = startDate.getFullYear();
    let endYear = endDate.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      let lastDay = this.getLastDayOfWeek(year, monthsOfYear, daysOfWeek);

      // Check if the date is within the specified range
      if (lastDay >= startDate && lastDay <= endDate) {
        results.push(lastDay);
      }
    }
    return results;
  }

  // Get nth day of month
  getNthDayOfMonth(start_date: Date, end_date: Date, day: number, months: Array<any>) {
    const startDate = new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate(), 0, 0, 0, 0);
    const endDate = new Date(end_date.getFullYear(), end_date.getMonth(), end_date.getDate(), 0, 0, 0, 0);
    const result: Date[] = [];

    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (const month of months) {
        // const monthIndex = monthMap[month];
        const date = new Date(year, month, day);

        if (date >= startDate && date <= endDate) {
          result.push(date);
        }
      }
    }

    return result;
  }

  validateName() {
    const name = this.addEventForm.get('alarmName').value;
    const isNameValid = this.appIntegrationDataService.validateSchedulerName(name);
    this.isAlarmNameValid = isNameValid;
  }

  addUpdateEvent(isAdd: boolean, isUpdate: boolean, disabled: boolean) {
    if (isAdd) {
      this.createEvent(disabled);
    } else if (isUpdate) {
      this.updateEvent(disabled);
    }
  }

  /*=============== Create Event ===============*/
  createEvent(disabled: boolean) {
    this.addEventForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.addEventForm.getRawValue();
    if (this.addEventForm?.valid && !this.isAlarmNameValid) {
      if (!this.validateEndDate()) {
        let weekDaysIds = null;
        let monthIds = null;
        let dayOfMonth = null;

        if (formValues?.alarmRecurrence === 'DAILY') {
          if (this.weekDaysList?.length) {
            if (formValues?.alarmDailyRecurrence?.alarmDaily === 'everyDay') {
              // Extract all ids and convert them into a string
              weekDaysIds = this.weekDaysList.map(item => item.id).join(',');
            } else {
              // Extract all ids and convert them into a string
              weekDaysIds = this.weekDaysList.slice(1, -1).map(item => item.id).join(',');
            }
          }
        }

        if (formValues?.alarmRecurrence === 'WEEKLY') {
          if (formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek?.length) {
            // Extract all ids and convert them into a string
            weekDaysIds = formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek.map(item => item.id).join(',');
          }
          if (formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek?.length) {
            // Extract all ids and convert them into a string
            monthIds = formValues?.alarmWeeklyRecurrence?.alarmMonths.map(item => item.id + 1).join(',');
          }
        }

        if (formValues?.alarmRecurrence === 'MONTHLY') {
          if (formValues?.alarmMonthlyRecurrence?.alarmMonthly === 'dayOfMonth') {
            dayOfMonth = formValues?.alarmMonthlyRecurrence?.alarmDaysOfMonth;
          } else {
            const day = this.dayList.find(x => Number(x?.id) === Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfDay));
            const weekDay = this.weekDaysList.find(x => Number(x?.id) === Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfWeekDay));
            dayOfMonth = `${day?.name} ${weekDay?.value}`;
          }
        }

        if (formValues?.alarmRecurrence === 'YEARLY') {
          if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'secificDayOfMonthAndYear') {
            const day = this.dayList.find(x => Number(x?.id) === Number(formValues?.alarmYearlyRecurrence?.alarmYearOfMonthDay));
            const weekDay = this.weekDaysList.find(x => Number(x?.id) === Number(formValues?.alarmYearlyRecurrence?.alarmWeekDayOfMonthOfYear));
            dayOfMonth = `${day?.name} ${weekDay?.value}`;
            monthIds = Number(formValues?.alarmYearlyRecurrence?.alarmMonthOfYear) + 1;
          }
          if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'monthOfYear') {
            dayOfMonth = formValues?.alarmYearlyRecurrence?.alarmDayOfYear;
            // Extract all ids and convert them into a string
            monthIds = formValues?.alarmYearlyRecurrence?.alarmMonthsOfyear.map(item => item.id + 1).join(',');
          }
        }

        const alertProcess = this.alertProcesses?.length ? this.alertProcesses.find((x) => Number(x?.id) === Number(formValues?.alarmProcess)) : '';

        const nonSchedulerDto: NonSchedulerDto = this.getNonSchedulerDto();

        const alarmDto: AlarmDto = this.getAlarmDto(formValues, weekDaysIds, monthIds, dayOfMonth, alertProcess, disabled);

        const schedulerDto: SchedulerDto = this.getSchedulerDto(formValues, weekDaysIds, monthIds, dayOfMonth, disabled);

        const schedulerLocalDto = this.getLocalSchedulerDto(formValues, schedulerDto, disabled);

        schedulerLocalDto.isNew = true;
        schedulerLocalDto.isEventDisabled = disabled;

        if (schedulerLocalDto?.recurrencePattern === 'DAILY') {
          schedulerLocalDto.month = '*';
          schedulerLocalDto.months = '*';
        }

        this.appIntegrationDataService.storeSchedulers(schedulerLocalDto, true);

        this.dialogRef.close({ isAdd: true, isUpdate: false, alarmObj: schedulerLocalDto, formValues: formValues, editScheduler: null });
      }
    }
  }

  /*=============== Edit Event ===============*/
  editOrSetEventsInCalender(scheduler: any, isEdit: boolean) {
    const dailyRecurrenceDefaultvalues = {
      alarmDaily: scheduler?.localDto?.alarmDaily
    };
    const weeklyRecurrenceDefaultvalues = {
      alarmDaysOfWeek: scheduler?.localDto?.alarmDaysOfWeek,
      alarmMonths: scheduler?.localDto?.alarmMonths,
    };
    const monthlyRecurrenceDefaultvalues = {
      alarmMonthly: scheduler?.localDto?.alarmMonthly,
      alarmDaysOfMonth: scheduler?.localDto?.alarmDaysOfMonth,
      alarmMonthOfDay: scheduler?.localDto?.alarmMonthOfDay,
      alarmMonthOfWeekDay: scheduler?.localDto?.alarmMonthOfWeekDay,
    };
    const yearlyRecurrenceDefaultvalues = {
      alarmYearly: scheduler?.localDto?.alarmYearly,
      alarmYearOfMonthDay: scheduler?.localDto?.alarmYearOfMonthDay,
      alarmWeekDayOfMonthOfYear: scheduler?.localDto?.alarmWeekDayOfMonthOfYear,
      alarmMonthOfYear: scheduler?.localDto?.alarmMonthOfYear,
      alarmMonthsOfyear: scheduler?.localDto?.alarmMonthsOfyear,
      alarmDayOfYear: scheduler?.localDto?.alarmDayOfYear
    };
    const formDto = {
      alarmName: scheduler?.schedulerName,
      alarmHour: scheduler?.hour,
      alarmMinutes: scheduler?.minutes,
      alarmSeconds: scheduler?.seconds,
      alarmStartDate: scheduler?.startDate,
      alarmYesNoEndDate: scheduler?.localDto?.alarmYesNoEndDate,
      alarmEndDate: scheduler?.localDto?.alarmYesNoEndDate === 'withEndDate' ? scheduler?.endDate : '',
      alarmRecurrence: scheduler?.recurrencePattern.toUpperCase(),
      alarmProcess: scheduler?.eventId,
      alarmDailyRecurrence: dailyRecurrenceDefaultvalues,
      alarmWeeklyRecurrence: weeklyRecurrenceDefaultvalues,
      alarmMonthlyRecurrence: monthlyRecurrenceDefaultvalues,
      alarmYearlyRecurrence: yearlyRecurrenceDefaultvalues,
      alarmDisable: scheduler.alarmDisable,
      nonSchedulerDataList: scheduler?.nonSchedulerDataList ? scheduler?.nonSchedulerDataList : []
    };
    if (scheduler?.recurrencePattern.toUpperCase() === 'DAILY') {
      this.recurrenceTooltip = this.dailyTooltip;
    }
    if (scheduler?.recurrencePattern.toUpperCase() === 'WEEKLY') {
      this.recurrenceTooltip = this.weeklyTooltip;
    }
    if (scheduler?.recurrencePattern.toUpperCase() === 'MONTHLY') {
      this.recurrenceTooltip = this.monthlyTooltip;
    }
    if (scheduler?.recurrencePattern.toUpperCase() === 'YEARLY') {
      this.recurrenceTooltip = this.yearlyTooltip;
    }
    if (isEdit) {
      this.appIntegrationService.sharedAlarmPopupOpenedFlag(true);
      // this.isAddNewEvent = true;
      // this.isEditEvent = true;
      this.editScheduler = this.appIntegrationDataService.getSchedulerById(Number(scheduler?.id));
      this.addEventForm.patchValue(formDto);
      if (scheduler?.localDto?.alarmYesNoEndDate === 'withEndDate') {
        this.addEventForm.get('alarmEndDate').enable();
      } else {
        this.addEventForm.get('alarmEndDate').disable();
      }
    } else {
      // this.setEventInCalendar(formDto, true, null);
    }
  }

  updateEvent(disabled: boolean) {
    this.addEventForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.addEventForm.getRawValue();
    if (this.addEventForm?.valid && !this.isAlarmNameValid) {
      if (!this.validateEndDate()) {
        let weekDaysIds = null;
        let monthIds = null;
        let dayOfMonth = null;

        if (formValues?.alarmRecurrence === 'DAILY') {
          if (this.weekDaysList?.length) {
            if (formValues?.alarmDailyRecurrence?.alarmDaily === 'everyDay') {
              // Extract all ids and convert them into a string
              weekDaysIds = this.weekDaysList.map(item => item.id).join(',');
            } else {
              // Extract all ids and convert them into a string
              weekDaysIds = this.weekDaysList.slice(1, -1).map(item => item.id).join(',');
            }
          }
        }

        if (formValues?.alarmRecurrence === 'WEEKLY') {
          if (formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek?.length) {
            // Extract all ids and convert them into a string
            weekDaysIds = formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek.map(item => item.id).join(',');
          }
          if (formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek?.length) {
            // Extract all ids and convert them into a string
            monthIds = formValues?.alarmWeeklyRecurrence?.alarmMonths.map(item => item.id + 1).join(',');
          }

        }

        if (formValues?.alarmRecurrence === 'MONTHLY') {
          if (formValues?.alarmMonthlyRecurrence?.alarmMonthly === 'dayOfMonth') {
            dayOfMonth = formValues?.alarmMonthlyRecurrence?.alarmDaysOfMonth;
          } else {
            const day = this.dayList.find(x => Number(x?.id) === Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfDay));
            const weekDay = this.weekDaysList.find(x => Number(x?.id) === Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfWeekDay));
            dayOfMonth = `${day?.name} ${weekDay?.value}`;
          }
        }

        if (formValues?.alarmRecurrence === 'YEARLY') {
          if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'secificDayOfMonthAndYear') {
            const day = this.dayList.find(x => Number(x?.id) === Number(formValues?.alarmYearlyRecurrence?.alarmYearOfMonthDay));
            const weekDay = this.weekDaysList.find(x => Number(x?.id) === Number(formValues?.alarmYearlyRecurrence?.alarmWeekDayOfMonthOfYear));
            dayOfMonth = `${day?.name} ${weekDay?.value}`;
            monthIds = Number(formValues?.alarmYearlyRecurrence?.alarmMonthOfYear) + 1;
          }
          if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'monthOfYear') {
            dayOfMonth = formValues?.alarmYearlyRecurrence?.alarmDayOfYear;
            // Extract all ids and convert them into a string
            monthIds = formValues?.alarmYearlyRecurrence?.alarmMonthsOfyear.map(item => item.id + 1).join(',');
          }
        }

        const alertProcess = this.alertProcesses?.length ? this.alertProcesses.find((x) => Number(x?.id) === Number(formValues?.alarmProcess)) : '';

        const nonSchedulerDto: NonSchedulerDto = this.getNonSchedulerDto();

        const alarmDto: AlarmDto = this.getAlarmDto(formValues, weekDaysIds, monthIds, dayOfMonth, alertProcess, disabled);

        const schedulerDto: SchedulerDto = this.getSchedulerDto(formValues, weekDaysIds, monthIds, dayOfMonth, disabled);

        const schedulerLocalDto = this.getLocalSchedulerDto(formValues, schedulerDto, disabled);

        schedulerLocalDto.id = this.editScheduler?.id;
        schedulerLocalDto.isNew = false;
        schedulerLocalDto.isEventDisabled = disabled;

        this.appIntegrationDataService.updateSchedulerById(schedulerLocalDto);
        // this.appIntegrationDataService.enabledDisabledSchedulers(this.isSchedulerEnabled);
        // this.events = this.events.filter((event) => event?.id !== this.editScheduler?.id);

        this.dialogRef.close({ isAdd: false, isUpdate: true, alarmObj: schedulerLocalDto, formValues: formValues, editScheduler: this.editScheduler });
        // this.setEventInCalendar(formValues, false, this.editScheduler?.id);
        // this.resetForm();
        // this.viewEvents = this.appIntegrationDataService.getSchedulers();
        // this.isAddNewEvent = false;
        // this.isEditEvent = false;
        // this.appIntegrationService.sharedAlarmPopupOpenedFlag(false);
      }
    }
  }

  onClose(): void {
    this.dialogRef.close({ isAdd: false, isUpdate: false, alarmObj: null, formValues: null, editScheduler: null });
  }

  ngOnDestroy(): void {
    this.getAlertProcessSub.unsubscribe();
    this.getDeployedProcessByIdSub.unsubscribe();
  }

}
