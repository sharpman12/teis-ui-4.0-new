import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AppIntegrationService } from '../app-integration.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { EventLogs } from 'src/app/core/model/log/EventLogs';
import { StoreEventLogsDto } from '../appintegration';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { Constants } from 'src/app/shared/components/constants';
import { MessageService } from 'primeng/api';
import * as $ from 'jquery';

@Component({
  selector: 'app-app-int-event-log',
  templateUrl: './app-int-event-log.component.html',
  styleUrls: ['./app-int-event-log.component.scss']
})
export class AppIntEventLogComponent implements OnInit, OnDestroy {
  @Input() itemIds: Array<any>;
  @Input() selectedItemId: number;
  @Input() tabName: string;
  eventLogFilterForm: UntypedFormGroup;
  isEventFilterOpen: boolean = true;
  selectedRowEventLog: EventLogs;
  isLoading = false;
  pageNo = 1;
  isMoreResultLinkShow: boolean = false;
  itemDto: any = null;
  totalLogsCount: number = 0;
  showedLogsCount: number = 0;
  isLogStateValid: boolean = false;

  private getEventLogSub = Subscription.EMPTY;
  private userDefineLogSearchSub = Subscription.EMPTY;

  constructor(
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) { }

  ngOnInit(): void {
    // Default values (used only if nothing in local storage)
    const defaultValues = {
      days: Constants?.SEARCH_LOG_DAYS,
      hours: Constants?.SEARCH_LOG_HOURS,
      minutes: Constants?.SEARCH_LOG_MINUTES,
      seconds: Constants?.SEARCH_LOG_SECONDS,
      logStateGroup: {
        logStateNormal: true,
        logStateWarning: true,
        logStateError: true,
        logStateInfo: true
      }
    };

    const savedCommon = this.appIntegrationDataService.loadFromStorage('commonFormData');
    const savedLogState = this.appIntegrationDataService.loadFromStorage('eventLogStateGroup');

    this.createForm(savedCommon, savedLogState);
    this.showEventLog();

    // Subscribe to BehaviorSubject (reflect changes from other components)
    this.userDefineLogSearchSub = this.appIntegrationDataService.commonData$.subscribe(data => {
      if (data) this.eventLogFilterForm.patchValue(data, { emitEvent: false });
    });

    // Watch form changes and update service
    this.eventLogFilterForm.valueChanges.subscribe(value => {
      const { logStateGroup, ...commonFields } = value;
      this.appIntegrationDataService.updateCommonData(commonFields);
      this.appIntegrationDataService.saveToStorage('eventLogStateGroup', logStateGroup);
    });
  }

  toggleEventLog() {
    // $('#collapseThree').toggle();
    $('#collapseThree-' + this.tabName).toggle();
    this.isEventFilterOpen = !this.isEventFilterOpen;
  }

  showEventLog() {
    // $('#collapseThree').show();
    $('#collapseThree-' + this.tabName).show();

  }

  hideEventLog() {
    // $('#collapseThree').hide();
    $('#collapseThree-' + this.tabName).hide();
  }

  refreshEventLogs() {
    this.selectedRowEventLog = null;
    this.appIntegrationDataService.clearEventLogs();
  }

  /*================= Create Form ==================*/
  createForm(data: any, logState: any) {
    this.eventLogFilterForm = this.fb.group({
      days: [{ value: data?.days ?? Constants?.SEARCH_LOG_DAYS, disabled: false }, {
        validators: []
      }],
      hours: [{ value: data?.hours ?? Constants?.SEARCH_LOG_HOURS, disabled: false }, {
        validators: []
      }],
      minutes: [{ value: data?.minutes ?? Constants?.SEARCH_LOG_MINUTES, disabled: false }, {
        validators: []
      }],
      seconds: [{ value: data?.seconds ?? Constants?.SEARCH_LOG_SECONDS, disabled: false }, {
        validators: []
      }],
      logStateGroup: this.fb.group({
        logStateNormal: [{ value: logState?.logStateNormal ?? false, disabled: false }, {
          validators: []
        }],
        logStateWarning: [{ value: logState?.logStateWarning ?? true, disabled: false }, {
          validators: []
        }],
        logStateError: [{ value: logState?.logStateError ?? true, disabled: false }, {
          validators: []
        }],
        logStateInfo: [{ value: logState?.logStateInfo ?? true, disabled: false }, {
          validators: []
        }]
      })
    });
    this.onChangeLogState();
  }

  // toggleEventFilter() {
  //   this.toggleEventLog();
  //   this.isEventFilterOpen = !this.isEventFilterOpen;
  // }

  /*================= Filtered Event Log ================*/
  filterEventLog(formValue) {

  }
  /*================= END Filtered Event Log ================*/

  /*============== Search Event Log =============*/
  getSearchStr(values: any) {
    const searchStr = [];
    if (values?.logStateGroup?.logStateError) {
      searchStr.push('status=error');
    }
    if (values?.logStateGroup?.logStateInfo) {
      searchStr.push('status=info');
    }
    if (values?.logStateGroup?.logStateNormal) {
      searchStr.push('status=normal');
    }
    if (values?.logStateGroup?.logStateWarning) {
      searchStr.push('status=warning');
    }
    return searchStr.toString();
  }

  getSearchDate(values: any) {
    const now = new Date();
    const someDaysAgo = new Date(now);
    someDaysAgo.setDate(now.getDate() - Number(values?.days));
    someDaysAgo.setHours(now.getHours() - Number(values?.hours));
    someDaysAgo.setMinutes(now.getMinutes() - Number(values?.minutes));
    someDaysAgo.setSeconds(now.getSeconds() - Number(values?.seconds));
    const dateObj = {
      startDate: someDaysAgo,
      endDate: now
    };
    return dateObj;
  }
  /*============== END Search Event Log =============*/

  /*============== Log State Checkbox Validation ==============*/
  onChangeLogState() {
    const searchFilterValue = this.eventLogFilterForm.value;
    const isLogStateValid = Object.values(searchFilterValue?.logStateGroup).some(value => value === true);
    this.isLogStateValid = isLogStateValid;
  }

  /*============== Get Event Log By Task Id ==============*/
  getEventLog(items?: any) {
    this.isEventFilterOpen = false;
    this.hideEventLog();
    this.itemDto = items;
    this.pageNo = 1;
    const searchFilterValue = this.eventLogFilterForm.value;
    const startToEndDate = `${this.getDateFormat(this.getSearchDate(searchFilterValue)?.startDate)} to ${this.getDateFormat(this.getSearchDate(searchFilterValue)?.endDate)}`;

    if (this.isLogStateValid) {
      this.isLoading = true;
      const eventLogStoreDto: StoreEventLogsDto = {
        itemId: items[0]?.itemId,
        itemType: items[0]?.itemType,
        workspaceId: items[0]?.workspaceId,
        timeFrame: startToEndDate,
        pageNo: this.pageNo,
        eventLogs: null
      };

      // Code for get logs in local storage code is commented due to status not refreshed after api call

      // const eventLogs = this.appIntegrationDataService.getEventLogs(eventLogStoreDto);
      // if (eventLogs) {
      //   this.isLoading = false;
      //   this.pageNo = eventLogs?.pageNo;
      //   this.selectedRowEventLog = eventLogs?.eventLogs;
      //   this.totalLogsCount = eventLogs?.eventLogs?.totalLogs;
      //   this.showedLogsCount = eventLogs?.eventLogs?.logs?.length;
      //   this.checkPagination(eventLogs?.eventLogs?.totalLogs, eventLogs?.eventLogs?.logs?.length);
      // } else { }

      const serviceLogDto = {
        actualTimeFrame: startToEndDate,
        applyAccess: true,
        defaultValue: false,
        description: '',
        error: false,
        errorCount: 0,
        id: null,
        items: items,
        logType: 'Event',
        name: '',
        pageNo: this.pageNo,
        searchText: this.getSearchStr(searchFilterValue),
        timeFrame: startToEndDate,
      };

      this.getEventLogSub = this.appIntegrationService.getEventLogByItemId(serviceLogDto).pipe(take(1)).subscribe(res => {
        this.isLoading = false;
        this.selectedRowEventLog = res;
        eventLogStoreDto.eventLogs = res;
        this.appIntegrationDataService.storeEventLogs(eventLogStoreDto);
        this.totalLogsCount = res?.totalLogs;
        this.showedLogsCount = res?.logs?.length;
        this.checkPagination(res?.totalLogs, res?.logs?.length);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    } else {
      this.messageService.add({
        key: "appIntInfoKey",
        severity: "info",
        summary: "",
        detail: 'Select at least one event state to search log(s).',
      });
    }
  }

  getNextPageLogs(event): void {
    this.isLoading = true;
    this.pageNo++;
    const searchFilterValue = this.eventLogFilterForm.value;
    const startToEndDate = `${this.getDateFormat(this.getSearchDate(searchFilterValue)?.startDate)} to ${this.getDateFormat(this.getSearchDate(searchFilterValue)?.endDate)}`;
    const eventLogStoreDto: StoreEventLogsDto = {
      itemId: this.itemDto[0]?.itemId,
      itemType: this.itemDto[0]?.itemType,
      workspaceId: this.itemDto[0]?.workspaceId,
      timeFrame: startToEndDate,
      pageNo: this.pageNo,
      eventLogs: null
    };

    const serviceLogDto = {
      actualTimeFrame: startToEndDate,
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      id: null,
      items: this.itemDto,
      logType: 'Event',
      name: '',
      pageNo: this.pageNo,
      searchText: this.getSearchStr(searchFilterValue),
      timeFrame: startToEndDate,
    };

    this.getEventLogSub = this.appIntegrationService.getEventLogByItemId(serviceLogDto).pipe(take(1)).subscribe(res => {
      this.isLoading = false;
      const moreEventLogs = {
        logs: this.selectedRowEventLog?.logs.concat(res?.logs),
        maxRecordsReached: this.selectedRowEventLog?.maxRecordsReached,
        timeFrame: this.selectedRowEventLog?.timeFrame,
        totalLogs: this.selectedRowEventLog?.totalLogs,
      };
      this.selectedRowEventLog = moreEventLogs;
      eventLogStoreDto.eventLogs = moreEventLogs;
      this.appIntegrationDataService.storeEventLogs(eventLogStoreDto);
      this.totalLogsCount = res?.totalLogs;
      this.showedLogsCount = this.selectedRowEventLog?.logs?.length;
      this.checkPagination(res?.totalLogs, this.selectedRowEventLog?.logs?.length);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============== END Get Event Log By Task Id ==============*/

  /*============= Pagination Conditions =============*/
  checkPagination(totalCount, arrLength) {
    if (arrLength > 0 && totalCount > arrLength) {
      this.isMoreResultLinkShow = true;
    } else {
      this.isMoreResultLinkShow = false;
    }
  }
  /*============= END Pagination Conditions =============*/

  /*========== Make Date Format ===========*/
  getDateFormat(date: any): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  ngOnDestroy(): void {
    this.getEventLogSub.unsubscribe();
    this.userDefineLogSearchSub.unsubscribe();
  }

}
