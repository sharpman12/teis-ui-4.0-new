import { Component, OnInit, Input, Renderer2, EventEmitter, Output, forwardRef, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import * as constant from '../constants/constant';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
// import { Subject } from 'rxjs';
import { CustomInput } from '../base-classes/custom-input';
import { LogReportService } from '../../../../core/service/logreport.service';

const noop = () => { };
// export const CONTROL_VALUE_ACCESSOR: any = {
//   provide: NG_VALUE_ACCESSOR,
//   useExisting: forwardRef(() => TimeframeComponent),
//   multi: true
// };

@Component({
  selector: 'app-timeframe',
  templateUrl: './timeframe.component.html',
  styleUrls: ['./timeframe.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TimeframeComponent),
    multi: true
  }]
})
export class TimeframeComponent extends CustomInput implements OnInit {
  @Input() defaultTimeframe: string;
  @Input() label: string;
  @Output() readonly onblur: EventEmitter<any> = new EventEmitter();

  displayString: string;
  public showTimeFrameMenu: boolean = true;
  public showCalender: boolean = false;
  public hidetimeFrame: boolean = true;
  dateRangeFormat: boolean;
  showTime: string;
  dirtyField: boolean;
  public timeFrames: string[];
  isValid: boolean;
  calenderdisplayString: string;
  rangeStartDate: Date = null;
  rangeEndDate: Date = null;
  // @ts-ignore
  public value: string;
  rangeValidator: boolean = false;
  disableCloseIcon: boolean;
  customDates: boolean = false;

  constructor(private renderer: Renderer2,
    private logReportService: LogReportService) { super(); }

  ngOnInit() {
    this.loadTimeFrames();
    this.setError(true, this.displayString);
  }

  calculateDisplayDate(tframe, parsedDateValue) {
    let date1 = moment().subtract(1, 'day').startOf('day').toLocaleString();
    let date2 = moment().subtract(1, 'day').endOf('day').toLocaleString();
    if (parsedDateValue == 'valid') {
      this.setError(true, tframe);
    } else {
      if (!this.customDates) {// Validation for standard templates
        if (!parsedDateValue) {
          this.setError(false, constant.ERR['1']);
        } else if (parsedDateValue == constant.YESTERDAY.toLowerCase()) {
          this.setError(true, moment(date1).format(constant.TIME_FORMAT) + ' to ' + moment(date2).format(constant.TIME_FORMAT));
        } else if (parsedDateValue !== constant.YESTERDAY.toLowerCase()) {
          this.setError(true, parsedDateValue + ' to ' + moment().format(constant.TIME_FORMAT));
        } else {
          this.setError(false, constant.ERR['1']);
        }
      } else { // Validation for custom dates
        if (!parsedDateValue) {
          this.setError(false, constant.ERR['1']);
        } else if (parsedDateValue == 'valid') {
          this.setError('', tframe);
        } else if (parsedDateValue !== 'Invalid date' ||
          parsedDateValue == 'Invalid start date' ||
          parsedDateValue == 'Invalid date.Start date should be less than end date') {
          this.setError(false, parsedDateValue);
        } else {
          this.setError(false, constant.ERR['1']);
        }
      }
    }

  }

  setError(isValid?: any, display?: string): void {
    if (isValid || isValid === false) {
      this.isValid = isValid;
    }
    this.displayString = display;
  }


  getTimeFrame(tframe) {
    this.value = tframe;
    this.rangeValidator = false;
    this.openTimeFrameMenu();

    if (tframe === 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss') {
      this.showCalender = true;
      this.rangeStartDate = null;
      this.rangeEndDate = null;
      this.displayString = '';
      this.customDates = true;
      this.onblur.emit({ isValid: false, display: this.displayString });
    }
    else {
      this.customDates = false;
      const parsedDateValue = this.parseDate(tframe);
      this.calculateDisplayDate(tframe, parsedDateValue);
      this.onblur.emit({ isValid: this.isValid, display: this.displayString });
    }
  }

  openTimeFrameMenu() {
    this.showTimeFrameMenu = false;
    let onElement = this.renderer.selectRootElement('.timeFrame');
    onElement.focus();
  }

  loadTimeFrames(): void {
    let appendTFOption = 'YYYY-MM-DD hh:mm:ss to YYYY-MM-DD hh:mm:ss';
    this.logReportService.getTimeFrames()
      .subscribe(
        timeFrames => {
          this.timeFrames = timeFrames;
          this.timeFrames.push(appendTFOption);
        });
  }

  validateRange() {
    if ((this.rangeStartDate == null) && (this.rangeEndDate !== null)) {
      this.setError(false, "Please select Start date.");
      this.disableCloseIcon = true;
    } else if ((this.rangeStartDate != null) && (this.rangeEndDate == null)) {
      this.setError(false, "Please select End date.");
      this.disableCloseIcon = true;
    } else if ((this.rangeStartDate !== null) && (this.rangeEndDate !== null)) {

      var mStart = moment(this.rangeStartDate);
      var mEnd = moment(this.rangeEndDate);
      if (mStart.isBefore(mEnd)) {
        this.rangeValidator = true;
        this.setError(true, "");
        this.disableCloseIcon = false;
      } else {
        this.rangeValidator = false;
        this.setError(false, "Start date should be less than end date.");
        this.disableCloseIcon = true;
      }
    }

  }
  closeCalender() {
    if ((this.rangeStartDate !== null && this.rangeEndDate !== null) || (this.rangeValidator == true)) {

      let check = moment(this.rangeStartDate).format(constant.TIME_FORMAT)
        + ' to ' +
        moment(this.rangeEndDate).format(constant.TIME_FORMAT);
      this.rangeValidator = true;
      this.value = check;
      this.setError(true, check);
      this.showCalender = false;
      this.rangeStartDate = null;
      this.rangeEndDate = null;
    } else {
      this.showCalender = false;
      this.value = '';
      this.setError(false, constant.ERR['1']);
    }
  }

  parseDate(val: string) {
    const dateStr = val.replace(/\s+/g, '').trim().toLowerCase();
    let myMoment: moment.Moment = moment(dateStr, ['YYYY-MM-DD', `${constant.TIME_FORMAT}`, `${constant.TIME_FORMAT}-${constant.TIME_FORMAT}`], true);
    let isValidDate = myMoment.isValid() ? myMoment.toLocaleString() : false;
    this.dateRangeFormat = false;
    if (isValidDate) return isValidDate;
    if (dateStr === 'now') {
      let myMoment: moment.Moment = moment();
      return myMoment.format(constant.TIME_FORMAT);
    }
    else if (dateStr.startsWith('last')) {
      const regex = new RegExp(/(last)((days|day|months|month|week|weeks|year|years|yr|yrs|minute|minutes|min|mins|hour|hours|hr|hrs)(?=\s|$))/gi);
      const parsedExpression = regex.exec(dateStr);
      if (!parsedExpression) return false;

      let timeOffset = this.processTimeOffset(parsedExpression[2]);
      if (!timeOffset) return false;

      let mathFn = 'subtract';

      let myMoment: moment.Moment = moment();

      myMoment = myMoment[mathFn](1, timeOffset);
      return myMoment.format(constant.TIME_FORMAT);
    }
    else if (dateStr.toLowerCase() === constant.YESTERDAY.toLowerCase()) {
      return constant.YESTERDAY.toLowerCase();
    }
    else if (dateStr === constant.TODAY.toLowerCase()) {
      return moment().startOf('day').format(constant.TIME_FORMAT);
    }
    else if (dateStr.startsWith('now')) {
      const regex = new RegExp(/(now)(\+|\-)(\d+)((days|day|months|month|week|weeks|year|years|yr|yrs|minute|minutes|min|mins|hour|hours|hr|hrs)(?=\s|$))/gi);
      const parsedExpression = regex.exec(dateStr);

      if (!parsedExpression) return false;
      let myMoment: moment.Moment = moment();

      const mathFn = this.getMathFn(parsedExpression[2]);
      if (!mathFn) return false;

      let duration = parseInt(parsedExpression[3]);

      let timeOffset = this.processTimeOffset(parsedExpression[4]);
      if (!timeOffset) return false;

      myMoment = myMoment[mathFn](duration, timeOffset);
      return myMoment.format(constant.TIME_FORMAT);

    }
    else if ((val.split(' to ')).length === 2) {
      let time = val;
      let s = val && val.split(' to ');
      let returnstring: string;
      const regex = new RegExp('[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]');
      this.dateRangeFormat = true;

      returnstring = regex.test(s[0]) ? regex.test(s[1]) ? (moment(s[1]).diff(moment(s[0]), 'days')) < 0 ? 'Invalid date.Start date should be less than end date' : 'valid' : 'Invalid date' : 'Invalid start date';

      return returnstring;
    }
    return false;
  }

  onKey(event: any) {
    this.dirtyField = true;
    let { target: { value } } = event;
    const parsedDateValue = this.parseDate(value);
    this.calculateDisplayDate(value, parsedDateValue);
    this.onblur.emit({ isValid: this.isValid, display: this.displayString });
  }
  getMathFn(symbol: string) {
    const value = symbol === "+" ? 'add' : symbol == "-" ? 'subtract' : false;
    return value;
  }

  processTimeOffset(timeOffset: string) {
    if (constant.timeArray.indexOf(timeOffset) === -1) return false;
    return constant.shortHandMap[timeOffset] ? constant.shortHandMap[timeOffset] : timeOffset;
  }

  focusOutFunction() { }

  ngOnDestroy() {

  }
}