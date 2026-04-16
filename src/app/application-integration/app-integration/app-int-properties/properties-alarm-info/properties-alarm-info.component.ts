import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';
import { addDays, addHours, endOfDay, endOfMonth, isSameDay, isSameMonth, startOfDay, subDays } from 'date-fns';
import { EventColor } from 'calendar-utils';
import { Subject, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AppIntegrationService } from '../../app-integration.service';
import { AppIntegrationDataService } from '../../app-integration-data.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AlarmDto, NonSchedulerDto, SchedulerDto } from '../../appintegration';
import { CheckNumbericSymbols } from 'src/app/shared/validation/numeric-symbol.validator';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { CheckCustomNumbers } from 'src/app/shared/validation/custom-number.validator';
import { CheckNumericDays } from 'src/app/shared/validation/numeric-days.validator';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AlarmConfirmationComponent } from './alarm-confirmation/alarm-confirmation.component';
import { ProgressiveLoaderService } from 'src/app/core/service/progressiveloader.service';
import { Router } from '@angular/router';
import { AddUpdateAlarmComponent } from './add-update-alarm/add-update-alarm.component';

class EventColors {
  constructor() { }
  sky_magenta = '#db75b4';
  pale_purple = '#bc8ad0';
  electric_lavender = '#e9bdfa';
  baby_blue = '#99d3f7';
  tiffany_blue = '#86d8e2';
  pale_olive_green = '#9cd983';
  jasmine = '#f4e27a';
  burly_wood = '#e0b881';
  coral_reef = '#c9bbab';
  sand = '#fcbe85';
  colors: Record<string, EventColor> = {
    sky_magenta: {
      primary: this.sky_magenta,
      secondary: this.sky_magenta,
    },
    pale_purple: {
      primary: this.pale_purple,
      secondary: this.pale_purple,
    },
    electric_lavender: {
      primary: this.electric_lavender,
      secondary: this.electric_lavender,
    },
    baby_blue: {
      primary: this.baby_blue,
      secondary: this.baby_blue,
    },
    tiffany_blue: {
      primary: this.tiffany_blue,
      secondary: this.tiffany_blue,
    },
    pale_olive_green: {
      primary: this.pale_olive_green,
      secondary: this.pale_olive_green,
    },
    jasmine: {
      primary: this.jasmine,
      secondary: this.jasmine,
    },
    burly_wood: {
      primary: this.burly_wood,
      secondary: this.burly_wood,
    },
    coral_reef: {
      primary: this.coral_reef,
      secondary: this.coral_reef,
    },
    sand: {
      primary: this.sand,
      secondary: this.sand,
    }
  };
  colorsArr = [
    {
      name: 'sky_magenta',
      value: '#db75b4'
    },
    {
      name: 'pale_purple',
      value: '#bc8ad0'
    },
    {
      name: 'electric_lavender',
      value: '#e9bdfa'
    },
    {
      name: 'baby_blue',
      value: '#99d3f7'
    },
    {
      name: 'tiffany_blue',
      value: '#86d8e2'
    },
    {
      name: 'pale_olive_green',
      value: '#9cd983'
    },
    {
      name: 'jasmine',
      value: '#f4e27a'
    },
    {
      name: 'burly_wood',
      value: '#e0b881'
    },
    {
      name: 'coral_reef',
      value: '#c9bbab'
    },
    {
      name: 'sand',
      value: '#fcbe85'
    },
  ];
}

@Component({
  selector: 'app-properties-alarm-info',
  templateUrl: './properties-alarm-info.component.html',
  styleUrls: ['./properties-alarm-info.component.scss'],
  viewProviders: [EventColors]
})
export class PropertiesAlarmInfoComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() workspaceId: number;
  @Input() isCreatePIT: boolean = false;
  @Input() itemId: number = null;
  @Input() isProperties: boolean = false;

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;
  // @ViewChild(AddEventsComponent, { static: false }) addEventsComponent: AddEventsComponent;
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();
  modalData: {
    action: string;
    event: CalendarEvent;
  };
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fas fa-fw fa-pencil-alt"></i>',
      a11yLabel: 'Edit',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      },
    },
    {
      label: '<i class="fas fa-fw fa-trash-alt"></i>',
      a11yLabel: 'Delete',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter((iEvent) => iEvent !== event);
        this.handleEvent('Deleted', event);
      },
    },
  ];
  refresh = new Subject<void>();

  events: CalendarEvent[] = [];

  currentUser: any = null;
  activeDayIsOpen: boolean = false;
  viewEvents: Array<any> = [];
  isAddNewEvent: boolean = false;
  isEditEvent: boolean = false;
  addEventForm: UntypedFormGroup;
  alertProcesses: Array<any> = [];
  isSchedulerEnabled: boolean = false;
  startDate = new Date();
  yearRange = '1950:2100';
  endDateErrMsg: string = '';
  editScheduler: any = null;
  isAlarmNameValid: boolean = false;
  isAlarmLocked: boolean = false;
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

  getAlertProcessSub = Subscription.EMPTY;

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private eColors: EventColors,
    private messageService: MessageService,
    public loaderService: ProgressiveLoaderService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.createForm();
    if (this.router?.url.includes("properties")) {
      this.isAlarmLocked = false;
    } else {
      this.isAlarmLocked = true;
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
            CheckNumericDays.numericDaysValidator({ minNum: 1, maxNum: 31 })
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

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    this.isAlarmLocked = isPITLock;
    if (isPITLock) {
      this.addEventForm.enable();
    } else {
      this.addEventForm.disable();
    }
  }

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

  isValidDayList(str) {
    // return str
    //   .split(",")
    //   .map(s => s.trim())
    //   .every(s => /^(0?[1-9]|[12][0-9]|3[01])$/.test(s));

    const pattern = /^( *(0?[1-9]|[12][0-9]|3[01]) *(?:- *(0?[1-9]|[12][0-9]|3[01]) *)?)( *(, *(0?[1-9]|[12][0-9]|3[01]) *(?:- *(0?[1-9]|[12][0-9]|3[01]) *)?))*$/;
    return pattern.test(str);
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

  getAlarmLists(data: any) {
    this.isAlarmLocked = data?.locked;
    if (data?.locked && Number(this.currentUser?.id) === Number(data?.lockedUserId)) {
      this.addEventForm.enable();
    } else {
      this.addEventForm.disable();
    }
    this.events = [];
    this.appIntegrationDataService.clearSchedulers();
    const alarmDaysOfWeek = [];
    const alarmMonths = [];
    let alarmMonthly = 'dayOfMonth';
    let alarmYearly = 'secificDayOfMonthAndYear';
    let alarmDaysOfMonth = 1;
    let alarmMonthOfDay = 1;
    let alarmMonthOfWeekDay = 0;
    let alarmYearOfMonthDay = 1;
    let alarmWeekDayOfMonthOfYear = 0;
    let alarmMonthOfYear = 0;
    let alarmMonthsOfyear = [];
    let alarmDayOfYear = 1;
    this.getAlertProcesses();
    if (data?.schedulerList?.length) {
      data?.schedulerList.forEach((x) => {
        if (x?.recurrencePattern.toUpperCase() === 'WEEKLY') {
          const daysOfWeek = x?.dayOfWeek.split(',').map(Number);
          const months = x?.month.split(',').map(Number);
          if (daysOfWeek?.length) {
            daysOfWeek.forEach((d) => {
              this.weekDaysList.forEach((w) => {
                if (Number(d) === Number(w?.id)) {
                  alarmDaysOfWeek.push(w);
                }
              });
            });
          }
          if (months?.length) {
            months.forEach((m) => {
              this.yearMonthList.forEach((ml) => {
                if ((Number(m) - 1) === Number(ml?.id)) {
                  alarmMonths.push(ml);
                }
              });
            });
          }
        }
        if (x?.recurrencePattern.toUpperCase() === 'MONTHLY') {
          if (this.isTwoDigitNumber(x?.dayOfMonth)) {
            alarmMonthly = 'dayOfMonth';
            alarmDaysOfMonth = Number(x?.dayOfMonth);
          } else {
            alarmDaysOfMonth = 1;
            alarmMonthly = 'secificDayOfMonth';
            const obj = this.getNumberFromStr(x?.dayOfMonth);
            alarmMonthOfDay = Number(obj?.weekdayNumber);
            alarmMonthOfWeekDay = this.weekDaysList.find((wd) => wd?.value === obj?.weekday)?.id;
          }
        }
        if (x?.recurrencePattern.toUpperCase() === 'YEARLY') {
          if (this.isValidDayList(x?.dayOfMonth)) {
            alarmYearly = 'monthOfYear';
            const months = x?.month.split(',').map(Number);
            if (months?.length) {
              months.forEach((m) => {
                this.yearMonthList.forEach((ml) => {
                  if ((Number(m) - 1) === Number(ml?.id)) {
                    alarmMonthsOfyear.push(ml);
                  }
                });
              });
            }
            // alarmDayOfYear = Number(x?.dayOfMonth);
            alarmDayOfYear = x?.dayOfMonth;
          } else {
            alarmYearly = 'secificDayOfMonthAndYear';
            alarmMonthsOfyear = [];
            const obj = this.getNumberFromStr(x?.dayOfMonth);
            alarmYearOfMonthDay = Number(obj?.weekdayNumber);
            alarmWeekDayOfMonthOfYear = this.weekDaysList.find((wd) => wd?.value === obj?.weekday)?.id;
            alarmMonthOfYear = Number(x?.month) - 1;
          }
        }
        x.isNew = false;
        x.startDate = this.formatDate(x.startDate);
        x.alarmDisable = x.disable;
        x.isEventDisabled = x.disable;
        x.endDate = (x?.endDate === '*' || x?.endDate === '') ? x.endDate : this.formatDate(x.endDate);
        x.localDto = {
          alarmYesNoEndDate: (x?.endDate === '*' || x?.endDate === '') ? 'noEndDate' : 'withEndDate',
          alarmDaily: x?.dayOfWeek === '0,1,2,3,4,5,6' ? 'everyDay' : x?.dayOfWeek === '1,2,3,4,5' ? 'everyWeekday' : '',
          alarmDaysOfWeek: alarmDaysOfWeek,
          alarmMonths: alarmMonths,
          alarmMonthly: alarmMonthly,
          alarmDaysOfMonth: alarmDaysOfMonth,
          alarmMonthOfDay: alarmMonthOfDay,
          alarmMonthOfWeekDay: alarmMonthOfWeekDay,
          alarmYearly: alarmYearly,
          alarmYearOfMonthDay: alarmYearly === 'secificDayOfMonthAndYear' ? alarmYearOfMonthDay : 1,
          alarmWeekDayOfMonthOfYear: alarmYearly === 'secificDayOfMonthAndYear' ? alarmWeekDayOfMonthOfYear : 0,
          alarmMonthOfYear: alarmYearly === 'secificDayOfMonthAndYear' ? alarmMonthOfYear : 0,
          alarmMonthsOfyear: alarmYearly === 'monthOfYear' ? alarmMonthsOfyear : [],
          alarmDayOfYear: alarmDayOfYear,
        };
        delete x?.disabled;
        this.appIntegrationDataService.storeSchedulers(x, false);
      });
    }
    this.isSchedulerDisabled();
    this.viewEvents = this.appIntegrationDataService.getSchedulers();
    if (this.viewEvents?.length) {
      this.viewEvents.forEach((x) => {
        this.editOrSetEventsInCalender(x, false);
      });
    }
  }

  onChangeAlertProcess(selectedProcessId: number) {
    this.appIntegrationService.getDeployedProcessById(selectedProcessId).subscribe((res) => {
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

  resetForm() {
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

    this.addEventForm.reset({
      alarmName: '',
      alarmHour: 0,
      alarmMinutes: 0,
      alarmSeconds: 0,
      alarmRecurrence: 'DAILY',
      alarmStartDate: this.startDate,
      alarmYesNoEndDate: 'noEndDate',
      alarmEndDate: '',
      alarmDailyRecurrence: dailyRecurrenceDefaultvalues,
      alarmWeeklyRecurrence: weeklyRecurrenceDefaultvalues,
      alarmMonthlyRecurrence: monthlyRecurrenceDefaultvalues,
      alarmYearlyRecurrence: yearlyRecurrenceDefaultvalues,
      alarmProcess: '',
      alarmDisable: false
    });
  }

  enabledDisabledSchedulers() {
    this.isSchedulerEnabled = !this.isSchedulerEnabled;
    this.appIntegrationDataService.enabledDisabledSchedulers(this.isSchedulerEnabled);
  }

  isSchedulerDisabled() {
    const schedulerList = this.appIntegrationDataService.getSchedulers();
    if (schedulerList?.length) {
      const isDisabled = schedulerList.some(x => x.isEventDisabled);
      this.isSchedulerEnabled = isDisabled;
    }
  }

  enabledDisabledSingleScheduler(scheduler: SchedulerDto, isDisable: boolean) {
    this.appIntegrationDataService.enabledDisabledSingleSchedulers(scheduler, isDisable);
    this.isSchedulerDisabled();
  }

  getSchdulerLength() {
    return this.appIntegrationDataService.getSchedulerArrLength();
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

    const weeklyRecurrenceGroup = this.addEventForm.get('alarmWeeklyRecurrence') as FormGroup;
    if (recurrenceOption === 'WEEKLY') {
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
    if (recurrenceOption === 'MONTHLY') {
      this.onChangeMonthlyRecurrence();
    } else {
      monthlyRecurrenceGroup.get('alarmDaysOfMonth').clearValidators();
      monthlyRecurrenceGroup.get('alarmDaysOfMonth').updateValueAndValidity();
    }

    const yearlyRecurrenceGroup = this.addEventForm.get('alarmYearlyRecurrence') as FormGroup;
    if (recurrenceOption === 'YEARLY') {
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
        CheckNumericDays.numericDaysValidator({ minNum: 1, maxNum: 31 })
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

  addEvent(isAdd: boolean, isUpdate: boolean, eventObj: any): void {
    const dialogRef = this.dialog.open(AddUpdateAlarmComponent, {
      width: "60%",
      maxHeight: '95vh',
      data: {
        isAdd: isAdd,
        isEdit: isUpdate,
        isIntegration: this.itemType.toLowerCase() === 'integration' ? true : false,
        isTrigger: this.itemType.toLowerCase() === 'trigger' ? true : false,
        event: eventObj,
        workspaceId: this.workspaceId
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result?.isAdd) {
          this.isSchedulerDisabled();
          // this.appIntegrationDataService.enabledDisabledSchedulers(this.isSchedulerEnabled);
          this.setEventInCalendar(result?.formValues, true, null);
          this.resetForm();
          this.viewEvents = this.appIntegrationDataService.getSchedulers();
          this.isAddNewEvent = false;
          this.isEditEvent = false;
          this.appIntegrationService.sharedAlarmPopupOpenedFlag(false);
        } else if (result?.isUpdate) {
          this.isSchedulerDisabled();
          // this.appIntegrationDataService.enabledDisabledSchedulers(this.isSchedulerEnabled);
          this.events = this.events.filter((event) => event?.id !== result?.editScheduler?.id);
          this.setEventInCalendar(result?.formValues, false, this.editScheduler?.id);
          this.resetForm();
          this.viewEvents = this.appIntegrationDataService.getSchedulers();
          this.isAddNewEvent = false;
          this.isEditEvent = false;
          this.appIntegrationService.sharedAlarmPopupOpenedFlag(false);
        }
      }
    });
  }

  addEvents() {
    this.appIntegrationService.sharedAlarmPopupOpenedFlag(true);
    this.isAddNewEvent = true;
    this.isEditEvent = false;
    this.resetForm();
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    this.isAddNewEvent = false;
    this.isEditEvent = false;
    this.viewEvents = this.appIntegrationDataService.getSchedulers();
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        // this.activeDayIsOpen = false;
      } else {
        // this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    // this.modal.open(this.modalContent, { size: 'lg' });
  }

  // addScheduler(eventObj: any) {
  //   this.events.push(eventObj);
  //   const allEvents = this.appIntegrationDataService.getSchedulers();
  //   if (allEvents?.length && this.events?.length) {
  //     this.events.forEach((x) => {
  //       allEvents.forEach((y) => {
  //         if (x?.title === y?.schedulerName) {
  //           x.id = y?.id;
  //         }
  //       });
  //     });
  //   }
  //   this.events = [...this.events];
  // }

  // updateScheduler(eventObj: any) {
  //   this.events.push(eventObj);
  //   const allEvents = this.appIntegrationDataService.getSchedulers();
  //   if (allEvents?.length && this.events?.length) {
  //     this.events.forEach((x) => {
  //       allEvents.forEach((y) => {
  //         if (x?.title === y?.schedulerName) {
  //           x.id = y?.id;
  //         }
  //       });
  //     });
  //   }
  //   this.events = [...this.events];
  // }

  /*============ Get Alert Processes ============*/
  getAlertProcesses() {
    // Check cache first
    const cachedAlertProcesses = this.appIntegrationDataService.getAlertProcesses();
    if (cachedAlertProcesses?.length) {
      this.alertProcesses = cachedAlertProcesses;
      return;
    }

    // Only call API if cache is empty
    this.getAlertProcessSub = this.appIntegrationService.getActiveAlertProcesses(this.workspaceId).subscribe((res) => {
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
  /*============ END Get Alert Processes ============*/


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

  getAlarmDto(formValues: any, weekDaysIds: any, monthIds: any, dayOfMonth: any, alertProcess: any) {
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

  getSchedulerDto(formValues: any, weekDaysIds: any, monthIds: any, dayOfMonth: any) {
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
      alarmDisable: formValues?.alarmDisable
    };

    return schedulerDto;
  }

  getLocalSchedulerDto(formValues: any, schedulerDto: SchedulerDto) {
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
        alarmDisable: formValues?.alarmDisable
      }
    };
    return schedulerLocalDto;
  }

  // Set Created Events In Calender
  // setEventInCalendar(formValues: any, isAdd: boolean, id: number) {
  //   let alarmEndDate = null;
  //   if (formValues?.alarmYesNoEndDate === 'withEndDate') {
  //     alarmEndDate = formValues?.alarmEndDate;
  //   } else {
  //     alarmEndDate = this.getLastYear();
  //   }
  //   // Code for DAILY alarm recurrence
  //   if (formValues?.alarmRecurrence.toUpperCase() === 'DAILY') {
  //     if (formValues?.alarmDailyRecurrence?.alarmDaily === 'everyDay') {
  //       const everyDay = this.getEveryDay(formValues?.alarmStartDate, alarmEndDate);
  //       if (everyDay?.length) {
  //         everyDay.forEach((x) => {
  //           if (isAdd) {
  //             this.addScheduler({
  //               id: null,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           } else {
  //             this.updateScheduler({
  //               id: id,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           }
  //         });
  //       }
  //     } else {
  //       const weekdaysEvents = [];
  //       const weekDays = this.getWeekDays(formValues?.alarmStartDate, alarmEndDate);
  //       if (weekDays?.length) {
  //         weekDays.forEach((x) => {
  //           if (isAdd) {
  //             this.addScheduler({
  //               id: null,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           } else {
  //             this.updateScheduler({
  //               id: id,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           }
  //         });
  //       }
  //     }
  //   }
  //   // Code for WEEKLY alarm recurrence
  //   if (formValues?.alarmRecurrence.toUpperCase() === 'WEEKLY') {
  //     const selectedDaysOfWeek = formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek;
  //     const selectedMonths = formValues?.alarmWeeklyRecurrence?.alarmMonths;
  //     if (selectedDaysOfWeek?.length && selectedMonths?.length) {
  //       // Extract only the ids
  //       const daysOfWeekIds = selectedDaysOfWeek.map((d) => d.id);
  //       const monthsIds = selectedMonths.map((m) => m.id);
  //       const monthDaysOfWeek = this.getDatesWithinRange(formValues?.alarmStartDate, alarmEndDate, monthsIds, daysOfWeekIds);
  //       if (monthDaysOfWeek?.length) {
  //         monthDaysOfWeek.forEach((x) => {
  //           if (isAdd) {
  //             this.addScheduler({
  //               id: null,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           } else {
  //             this.updateScheduler({
  //               id: id,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           }
  //         });
  //       }
  //     }
  //   }
  //   // Code for MONTHLY alarm recurrence
  //   if (formValues?.alarmRecurrence.toUpperCase() === 'MONTHLY') {
  //     if (formValues?.alarmMonthlyRecurrence?.alarmMonthly === 'dayOfMonth') {
  //       const dayOfMonth = this.getDayOfMonth(formValues?.alarmStartDate, alarmEndDate, Number(formValues?.alarmMonthlyRecurrence?.alarmDaysOfMonth));
  //       if (dayOfMonth?.length) {
  //         dayOfMonth.forEach((x) => {
  //           if (isAdd) {
  //             this.addScheduler({
  //               id: null,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           } else {
  //             this.updateScheduler({
  //               id: id,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           }
  //         });
  //       }
  //     }
  //     if (formValues?.alarmMonthlyRecurrence?.alarmMonthly === 'secificDayOfMonth') {
  //       const specificDayOfMonth = this.getDatesBetween(formValues?.alarmStartDate, alarmEndDate, Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfDay), Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfWeekDay));
  //       if (specificDayOfMonth?.length) {
  //         specificDayOfMonth.forEach((x) => {
  //           if (isAdd) {
  //             this.addScheduler({
  //               id: null,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           } else {
  //             this.updateScheduler({
  //               id: id,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           }
  //           // this.events = [
  //           //   ...this.events,
  //           //   {
  //           //     title: formValues?.alarmName,
  //           //     start: startOfDay(x),
  //           //     end: endOfDay(x),
  //           //     color: this.eColors?.colors[formValues?.color],
  //           //     draggable: false,
  //           //     resizable: {
  //           //       beforeStart: true,
  //           //       afterEnd: true,
  //           //     },
  //           //   },
  //           // ];
  //         });
  //       }
  //     }
  //   }
  //   // Code for YEARLY alarm recurrence
  //   if (formValues?.alarmRecurrence.toUpperCase() === 'YEARLY') {
  //     if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'secificDayOfMonthAndYear') {
  //       const nthDayOfYear = this.getNthDayOfYear(formValues?.alarmStartDate, alarmEndDate, Number(formValues?.alarmYearlyRecurrence?.alarmYearOfMonthDay), Number(formValues?.alarmYearlyRecurrence?.alarmWeekDayOfMonthOfYear), Number(formValues?.alarmYearlyRecurrence?.alarmMonthOfYear));
  //       if (nthDayOfYear?.length) {
  //         nthDayOfYear.forEach((x) => {
  //           if (isAdd) {
  //             this.addScheduler({
  //               id: null,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           } else {
  //             this.updateScheduler({
  //               id: id,
  //               title: formValues?.alarmName,
  //               start: startOfDay(x),
  //               end: endOfDay(x),
  //             });
  //           }
  //         });
  //       }
  //     }
  //     if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'monthOfYear') {
  //       if (formValues?.alarmYearlyRecurrence?.alarmMonthsOfyear?.length) {
  //         // Extract only the ids
  //         const monthsIds = formValues?.alarmYearlyRecurrence?.alarmMonthsOfyear.map(obj => obj.id);
  //         const nthDayOfMonths = this.getNthDayOfMonth(formValues?.alarmStartDate, alarmEndDate, Number(formValues?.alarmYearlyRecurrence?.alarmDayOfYear), monthsIds);
  //         if (nthDayOfMonths?.length) {
  //           nthDayOfMonths.forEach((x) => {
  //             if (isAdd) {
  //               this.addScheduler({
  //                 id: null,
  //                 title: formValues?.alarmName,
  //                 start: startOfDay(x),
  //                 end: endOfDay(x),
  //               });
  //             } else {
  //               this.updateScheduler({
  //                 id: id,
  //                 title: formValues?.alarmName,
  //                 start: startOfDay(x),
  //                 end: endOfDay(x),
  //               });
  //             }
  //             // this.events = [
  //             //   ...this.events,
  //             //   {
  //             //     title: formValues?.alarmName,
  //             //     start: startOfDay(x),
  //             //     end: endOfDay(x),
  //             //     color: this.eColors?.colors[formValues?.color],
  //             //     draggable: false,
  //             //     resizable: {
  //             //       beforeStart: true,
  //             //       afterEnd: true,
  //             //     },
  //             //   },
  //             // ];
  //           });
  //         }
  //       }
  //     }
  //   }
  // }

  expandRangeString(input: string): number[] {
    const result: number[] = [];

    input.split(',').forEach(part => {
      const trimmed = part.trim();

      // If it's a range like "6-11"
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(Number);

        for (let i = start; i <= end; i++) {
          result.push(i);
        }
      }
      // Single number like "2"
      else {
        const num = Number(trimmed);
        if (!isNaN(num)) result.push(num);
      }
    });

    return result;
  }


  setEventInCalendar(formValues: any, isAdd: boolean, id: number) {
    let alarmEndDate = null;
    if (formValues?.alarmYesNoEndDate === 'withEndDate') {
      alarmEndDate = formValues?.alarmEndDate;
    } else {
      alarmEndDate = this.getLastYear();
    }
    const eventsToAdd = [];

    const createEventObj = (date: Date) => ({
      id: isAdd ? null : id,
      title: formValues?.alarmName,
      start: startOfDay(date),
      end: endOfDay(date),
    });

    const recurrence = formValues?.alarmRecurrence?.toUpperCase();

    if (recurrence === 'DAILY') {
      const dates = formValues?.alarmDailyRecurrence?.alarmDaily === 'everyDay'
        ? this.getEveryDay(formValues?.alarmStartDate, alarmEndDate)
        : this.getWeekDays(formValues?.alarmStartDate, alarmEndDate);

      dates?.forEach(date => eventsToAdd.push(createEventObj(date)));
    }

    else if (recurrence === 'WEEKLY') {
      const daysOfWeek = formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek?.map(d => d.id) || [];
      const months = formValues?.alarmWeeklyRecurrence?.alarmMonths?.map(m => m.id) || [];

      if (daysOfWeek.length && months.length) {
        const dates = this.getDatesWithinRange(formValues?.alarmStartDate, alarmEndDate, months, daysOfWeek);
        dates?.forEach(date => eventsToAdd.push(createEventObj(date)));
      }
    }

    else if (recurrence === 'MONTHLY') {
      const monthlyType = formValues?.alarmMonthlyRecurrence?.alarmMonthly;

      if (monthlyType === 'dayOfMonth') {
        const day = Number(formValues?.alarmMonthlyRecurrence?.alarmDaysOfMonth);
        const dates = this.getDayOfMonth(formValues?.alarmStartDate, alarmEndDate, day);
        dates?.forEach(date => eventsToAdd.push(createEventObj(date)));
      }

      if (monthlyType === 'secificDayOfMonth') {
        const week = Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfWeekDay);
        const weekday = Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfDay);
        const dates = this.getDatesBetween(formValues?.alarmStartDate, alarmEndDate, weekday, week);
        dates?.forEach(date => eventsToAdd.push(createEventObj(date)));
      }
    }

    else if (recurrence === 'YEARLY') {
      const yearlyType = formValues?.alarmYearlyRecurrence?.alarmYearly;

      if (yearlyType === 'secificDayOfMonthAndYear') {
        const week = Number(formValues?.alarmYearlyRecurrence?.alarmWeekDayOfMonthOfYear);
        const weekday = Number(formValues?.alarmYearlyRecurrence?.alarmYearOfMonthDay);
        const month = Number(formValues?.alarmYearlyRecurrence?.alarmMonthOfYear);
        const dates = this.getNthDayOfYear(formValues?.alarmStartDate, alarmEndDate, weekday, week, month);
        dates?.forEach(date => eventsToAdd.push(createEventObj(date)));
      }

      if (yearlyType === 'monthOfYear') {
        const months = formValues?.alarmYearlyRecurrence?.alarmMonthsOfyear?.map(m => m.id) || [];
        // const day = Number(formValues?.alarmYearlyRecurrence?.alarmDayOfYear);
        const daysArr = formValues?.alarmYearlyRecurrence?.alarmDayOfYear.split(',').map(Number);
        const uniqueDaysArr = this.expandRangeString(formValues?.alarmYearlyRecurrence?.alarmDayOfYear);
        const dates = this.getNthDayOfMonth(formValues?.alarmStartDate, alarmEndDate, uniqueDaysArr, months);
        dates?.forEach(date => eventsToAdd.push(createEventObj(date)));
      }
    }

    if (formValues?.nonSchedulerDataList?.length) {
      formValues?.nonSchedulerDataList.forEach(item => {
        const date = new Date(item.year, item.month - 1, item.dayOfMonth);
        let index = eventsToAdd.findIndex(obj => (obj.start.toDateString() === date.toDateString() && obj.end.toDateString() === date.toDateString()));
        if (index !== -1) {
          eventsToAdd.splice(index, 1);
        }
      });

    }

    // Final batch add or update
    if (eventsToAdd.length) {
      this.addUpdateSchedulers(eventsToAdd);
    }
  }

  addUpdateSchedulers(eventsArray: any[]) {
    const allEvents = this.appIntegrationDataService.getSchedulers() || [];
    const mapped = eventsArray.map(x => {
      const match = allEvents.find(y => y?.schedulerName === x.title);
      return { ...x, id: match?.id ?? x.id };
    });
    this.events = [...this.events, ...mapped];
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

  // Function for get day of months from selected start and end dates
  // getDayOfMonth(start_date: Date, endDate: Date, dayOfMonth: number): Date[] {
  //   const startDate = new Date(start_date.getFullYear(), start_date.getMonth(), dayOfMonth, 0, 0, 0, 0);
  //   const dates: Date[] = [];

  //   let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), dayOfMonth, 0, 0, 0, 0);

  //   while (currentDate <= endDate) {
  //     if (currentDate.getDate() === dayOfMonth && currentDate >= startDate) {
  //       dates.push(new Date(currentDate));
  //     }

  //     // Move to the next month
  //     currentDate.setMonth(currentDate.getMonth() + 1);
  //   }

  //   return dates;
  // }

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
  getNthDayOfMonth(start_date: Date, end_date: Date, days: Array<number>, months: Array<any>) {
    // const startDate = new Date(start_date.getFullYear(), start_date.getMonth(), start_date.getDate(), 0, 0, 0, 0);
    // const endDate = new Date(end_date.getFullYear(), end_date.getMonth(), end_date.getDate(), 0, 0, 0, 0);
    // const result: Date[] = [];

    // for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
    //   for (const month of months) {
    //     // const monthIndex = monthMap[month];
    //     const date = new Date(year, month, day);

    //     if (date >= startDate && date <= endDate) {
    //       result.push(date);
    //     }
    //   }
    // }

    // return result;

    const startDate = new Date(
      start_date.getFullYear(),
      start_date.getMonth(),
      start_date.getDate(),
      0, 0, 0, 0
    );

    const endDate = new Date(
      end_date.getFullYear(),
      end_date.getMonth(),
      end_date.getDate(),
      0, 0, 0, 0
    );

    const result: Date[] = [];

    // Clean list (remove duplicates, sort)
    const uniqueDays = [...new Set(days)].sort((a, b) => a - b);

    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (const month of months) {

        for (const day of uniqueDays) {
          const date = new Date(year, month, day);

          // Skip invalid dates (e.g., Feb 30 → goes to March 2)
          if (date.getMonth() !== month) continue;

          if (date >= startDate && date <= endDate) {
            result.push(date);
          }
        }

      }
    }

    return result;
  }

  onClosed() {
    this.isAddNewEvent = false;
    this.isEditEvent = false;
    this.appIntegrationService.sharedAlarmPopupOpenedFlag(false);
  }

  validateName() {
    const name = this.addEventForm.get('alarmName').value;
    const isNameValid = this.appIntegrationDataService.validateSchedulerName(name);
    this.isAlarmNameValid = isNameValid;
  }

  /*=============== Create Event ===============*/
  // createEvent() {
  //   this.addEventForm.markAllAsTouched();
  //   this.logValidationErrors();
  //   const formValues = this.addEventForm.getRawValue();
  //   if (this.addEventForm?.valid && !this.isAlarmNameValid) {
  //     if (!this.validateEndDate()) {
  //       let weekDaysIds = null;
  //       let monthIds = null;
  //       let dayOfMonth = null;

  //       if (formValues?.alarmRecurrence === 'DAILY') {
  //         if (this.weekDaysList?.length) {
  //           if (formValues?.alarmDailyRecurrence?.alarmDaily === 'everyDay') {
  //             // Extract all ids and convert them into a string
  //             weekDaysIds = this.weekDaysList.map(item => item.id).join(',');
  //           } else {
  //             // Extract all ids and convert them into a string
  //             weekDaysIds = this.weekDaysList.slice(1, -1).map(item => item.id).join(',');
  //           }
  //         }
  //       }

  //       if (formValues?.alarmRecurrence === 'WEEKLY') {
  //         if (formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek?.length) {
  //           // Extract all ids and convert them into a string
  //           weekDaysIds = formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek.map(item => item.id).join(',');
  //         }
  //         if (formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek?.length) {
  //           // Extract all ids and convert them into a string
  //           monthIds = formValues?.alarmWeeklyRecurrence?.alarmMonths.map(item => item.id + 1).join(',');
  //         }
  //       }

  //       if (formValues?.alarmRecurrence === 'MONTHLY') {
  //         if (formValues?.alarmMonthlyRecurrence?.alarmMonthly === 'dayOfMonth') {
  //           dayOfMonth = formValues?.alarmMonthlyRecurrence?.alarmDaysOfMonth;
  //         } else {
  //           const day = this.dayList.find(x => Number(x?.id) === Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfDay));
  //           const weekDay = this.weekDaysList.find(x => Number(x?.id) === Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfWeekDay));
  //           dayOfMonth = `${day?.name} ${weekDay?.value}`;
  //         }
  //       }

  //       if (formValues?.alarmRecurrence === 'YEARLY') {
  //         if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'secificDayOfMonthAndYear') {
  //           const day = this.dayList.find(x => Number(x?.id) === Number(formValues?.alarmYearlyRecurrence?.alarmYearOfMonthDay));
  //           const weekDay = this.weekDaysList.find(x => Number(x?.id) === Number(formValues?.alarmYearlyRecurrence?.alarmWeekDayOfMonthOfYear));
  //           dayOfMonth = `${day?.name} ${weekDay?.value}`;
  //           monthIds = Number(formValues?.alarmYearlyRecurrence?.alarmMonthOfYear) + 1;
  //         }
  //         if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'monthOfYear') {
  //           dayOfMonth = formValues?.alarmYearlyRecurrence?.alarmDayOfYear;
  //           // Extract all ids and convert them into a string
  //           monthIds = formValues?.alarmYearlyRecurrence?.alarmMonthsOfyear.map(item => item.id + 1).join(',');
  //         }
  //       }

  //       const alertProcess = this.alertProcesses?.length ? this.alertProcesses.find((x) => Number(x?.id) === Number(formValues?.alarmProcess)) : '';

  //       const nonSchedulerDto: NonSchedulerDto = this.getNonSchedulerDto();

  //       const alarmDto: AlarmDto = this.getAlarmDto(formValues, weekDaysIds, monthIds, dayOfMonth, alertProcess);

  //       const schedulerDto: SchedulerDto = this.getSchedulerDto(formValues, weekDaysIds, monthIds, dayOfMonth);

  //       const schedulerLocalDto = this.getLocalSchedulerDto(formValues, schedulerDto);
  //       schedulerLocalDto.isNew = true;
  //       if (schedulerLocalDto?.recurrencePattern === 'DAILY') {
  //         schedulerLocalDto.month = '*';
  //         schedulerLocalDto.months = '*';
  //       }

  //       this.appIntegrationDataService.storeSchedulers(schedulerLocalDto, true);
  //       // this.appIntegrationDataService.enabledDisabledSchedulers(this.isSchedulerEnabled);
  //       this.setEventInCalendar(formValues, true, null);
  //       this.resetForm();
  //       this.viewEvents = this.appIntegrationDataService.getSchedulers();
  //       this.isAddNewEvent = false;
  //       this.isEditEvent = false;
  //       this.appIntegrationService.sharedAlarmPopupOpenedFlag(false);
  //     }
  //   }
  // }

  /*=============== Delete Event ===============*/
  deleteEvent(schedulerToDelete: SchedulerDto) {
    //this.loaderService.show();
    const dialogRef = this.dialog.open(AlarmConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: {
        option1: `Remove this ${this.itemType === 'integration' ? 'Alarm' : 'scheduler'} occurrence`,
        option2: `Remove this ${this.itemType === 'integration' ? 'Alarm' : 'scheduler'}  series`,
        startDate: schedulerToDelete?.startDate,
        endDate: schedulerToDelete?.endDate ? schedulerToDelete?.endDate : this.getLastYear(),
        // eventsDates: this.events?.length ? this.events.filter((x) => Number(x?.id) === Number(schedulerToDelete?.id)) : [],
        nonSchedulerDataList: schedulerToDelete?.nonSchedulerDataList
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isRemove) {
        if (result?.data?.removeAlarm === 'Single') {
          this.removeSingleAlarm(result?.data);
          this.loaderService.hide();
        } else {
          if (this.events?.length) {
            for (let i = 0; i < this.events.length; i++) {
              if (Number(this.events[i]?.id) === Number(schedulerToDelete?.id)) {
                this.events.splice(i, 1);
                i--;
              }
            }
          }
          this.events = [...this.events];
          this.viewEvents = this.appIntegrationDataService.deleteSchedulerById(Number(schedulerToDelete?.id));
          this.loaderService.hide();
        }
      }
    });
  }

  removeSingleAlarm(alarmData: any) {
    if (this.events?.length) {
      // Find the index of the object where the date matches
      let index = this.events.findIndex(obj => (obj.start.toDateString() === alarmData?.alarmDate.toDateString() && obj.end.toDateString() === alarmData?.alarmDate.toDateString()));

      // If the index is found, remove the object using splice
      if (index !== -1) {
        const nonScheduler = this.events.splice(index, 1);
        const schedulerArr = this.appIntegrationDataService.updateNonScheduler(nonScheduler[0]);
      }
    }
    this.events = [...this.events];
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
    if (isEdit) {
      this.appIntegrationService.sharedAlarmPopupOpenedFlag(true);
      this.isAddNewEvent = true;
      this.isEditEvent = true;
      this.editScheduler = this.appIntegrationDataService.getSchedulerById(Number(scheduler?.id));
      this.addEventForm.patchValue(formDto);
      if (scheduler?.localDto?.alarmYesNoEndDate === 'withEndDate') {
        this.addEventForm.get('alarmEndDate').enable();
      } else {
        this.addEventForm.get('alarmEndDate').disable();
      }
    } else {
      this.setEventInCalendar(formDto, true, null);
    }
  }

  /*============= Update Event =============*/
  // updateEvent() {
  //   this.addEventForm.markAllAsTouched();
  //   this.logValidationErrors();
  //   const formValues = this.addEventForm.getRawValue();
  //   if (this.addEventForm?.valid && !this.isAlarmNameValid) {
  //     if (!this.validateEndDate()) {
  //       let weekDaysIds = null;
  //       let monthIds = null;
  //       let dayOfMonth = null;

  //       if (formValues?.alarmRecurrence === 'DAILY') {
  //         if (this.weekDaysList?.length) {
  //           if (formValues?.alarmDailyRecurrence?.alarmDaily === 'everyDay') {
  //             // Extract all ids and convert them into a string
  //             weekDaysIds = this.weekDaysList.map(item => item.id).join(',');
  //           } else {
  //             // Extract all ids and convert them into a string
  //             weekDaysIds = this.weekDaysList.slice(1, -1).map(item => item.id).join(',');
  //           }
  //         }
  //       }

  //       if (formValues?.alarmRecurrence === 'WEEKLY') {
  //         if (formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek?.length) {
  //           // Extract all ids and convert them into a string
  //           weekDaysIds = formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek.map(item => item.id).join(',');
  //         }
  //         if (formValues?.alarmWeeklyRecurrence?.alarmDaysOfWeek?.length) {
  //           // Extract all ids and convert them into a string
  //           monthIds = formValues?.alarmWeeklyRecurrence?.alarmMonths.map(item => item.id + 1).join(',');
  //         }

  //       }

  //       if (formValues?.alarmRecurrence === 'MONTHLY') {
  //         if (formValues?.alarmMonthlyRecurrence?.alarmMonthly === 'dayOfMonth') {
  //           dayOfMonth = formValues?.alarmMonthlyRecurrence?.alarmDaysOfMonth;
  //         } else {
  //           const day = this.dayList.find(x => Number(x?.id) === Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfDay));
  //           const weekDay = this.weekDaysList.find(x => Number(x?.id) === Number(formValues?.alarmMonthlyRecurrence?.alarmMonthOfWeekDay));
  //           dayOfMonth = `${day?.name} ${weekDay?.value}`;
  //         }
  //       }

  //       if (formValues?.alarmRecurrence === 'YEARLY') {
  //         if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'secificDayOfMonthAndYear') {
  //           const day = this.dayList.find(x => Number(x?.id) === Number(formValues?.alarmYearlyRecurrence?.alarmYearOfMonthDay));
  //           const weekDay = this.weekDaysList.find(x => Number(x?.id) === Number(formValues?.alarmYearlyRecurrence?.alarmWeekDayOfMonthOfYear));
  //           dayOfMonth = `${day?.name} ${weekDay?.value}`;
  //           monthIds = Number(formValues?.alarmYearlyRecurrence?.alarmMonthOfYear) + 1;
  //         }
  //         if (formValues?.alarmYearlyRecurrence?.alarmYearly === 'monthOfYear') {
  //           dayOfMonth = formValues?.alarmYearlyRecurrence?.alarmDayOfYear;
  //           // Extract all ids and convert them into a string
  //           monthIds = formValues?.alarmYearlyRecurrence?.alarmMonthsOfyear.map(item => item.id + 1).join(',');
  //         }
  //       }

  //       const alertProcess = this.alertProcesses?.length ? this.alertProcesses.find((x) => Number(x?.id) === Number(formValues?.alarmProcess)) : '';

  //       const nonSchedulerDto: NonSchedulerDto = this.getNonSchedulerDto();

  //       const alarmDto: AlarmDto = this.getAlarmDto(formValues, weekDaysIds, monthIds, dayOfMonth, alertProcess);

  //       const schedulerDto: SchedulerDto = this.getSchedulerDto(formValues, weekDaysIds, monthIds, dayOfMonth);

  //       const schedulerLocalDto = this.getLocalSchedulerDto(formValues, schedulerDto);
  //       schedulerLocalDto.id = this.editScheduler?.id;
  //       schedulerLocalDto.isNew = false;

  //       this.appIntegrationDataService.updateSchedulerById(schedulerLocalDto);
  //       // this.appIntegrationDataService.enabledDisabledSchedulers(this.isSchedulerEnabled);
  //       this.events = this.events.filter((event) => event?.id !== this.editScheduler?.id);
  //       this.setEventInCalendar(formValues, false, this.editScheduler?.id);
  //       this.resetForm();
  //       this.viewEvents = this.appIntegrationDataService.getSchedulers();
  //       this.isAddNewEvent = false;
  //       this.isEditEvent = false;
  //       this.appIntegrationService.sharedAlarmPopupOpenedFlag(false);
  //     }
  //   }
  // }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay(event) {
    this.activeDayIsOpen = false;
    this.calendarMonthAndYear = {
      month: new Date(event).getMonth() + 1,
      year: new Date(event).getFullYear()
    };
  }

  onCancel() {
    this.events = [];
    this.viewEvents = [];
    this.appIntegrationDataService.clearSchedulers();
  }

  ngOnDestroy(): void {
    this.getAlertProcessSub.unsubscribe();
  }

}
