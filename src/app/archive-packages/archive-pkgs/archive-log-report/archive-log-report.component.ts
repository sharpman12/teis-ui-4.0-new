import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs/operators';
import { ArchivePakgsService } from '../archive-pakgs.service';
import { LogTree } from '../../../logs/adapters/tree';
import { MessageService, TreeNode } from 'primeng/api';
import { EventLogs } from '../../../core/model/log/EventLogs';
import { CreateReport } from '../archive-pkgs';
import { AddEditArchivePkgComponent } from '../add-edit-archive-pkg/add-edit-archive-pkg.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationComponent } from '../../../shared/components/confirmation/confirmation.component';
import { LogInfoComponent } from './log-info/log-info.component';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-archive-log-report',
  templateUrl: './archive-log-report.component.html',
  styleUrls: ['./archive-log-report.component.scss']
})
export class ArchiveLogReportComponent implements OnInit, OnChanges {
  @Input() selectedCard: any;
  @Output() updateCard: EventEmitter<any> = new EventEmitter<any>();
  searchForm: UntypedFormGroup;
  isErrMsgShow = false;
  selectedTimeFrame: string;
  showTimeframe: string;
  isDateRangeShow = false;
  isOpen = false;
  maxDate = new Date();
  selectedRowServiceLog: TreeNode[];
  selectedRowEventLog = [];
  pageNo = 1;
  eventLogPageNo = 1;
  eventLogTotalPageNo = 0;
  selectedTabIndex = 0;

  timeFrameList = [
    // { id: 'Today', value: 'Today' },
    { id: 'last-day', value: 'last-day' },
    { id: 'last-7days', value: 'last-7days' },
    { id: 'last-month', value: 'last-month' },
    { id: 'YYYY-MM-DD HH:mm:ss to YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss to YYYY-MM-DD HH:mm:ss' },
  ];
  searchList = [
    { id: 1, value: 'Text' },
    { id: 2, value: 'TaskId' },
    { id: 3, value: 'TagValue' },
  ];
  isMoreResultLinkShow = false;
  isMoreEventLogResultLinkShow = false;
  itemId: any;
  isSearchText = false;
  validateString: any;
  tagName: any;
  tagValue: any;
  searchInputValue: string;
  displaySearch: string;
  isValidSearch = true;
  validationResult = [];
  totalLogCount = 0;
  totalEventLogCount = 0;
  isLoading = false;
  isCountSpinnerLoading = false;
  selectedSearchTabIndex = 0;
  private readonly freetext = 'freetext=';
  searchTokan: string;
  pageSizeForRecordsPerPage: number;

  constructor(
    private fb: UntypedFormBuilder,
    private archivePakgsService: ArchivePakgsService,
    private dialog: MatDialog,
    private messageService: MessageService,
    public sharedService: SharedService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    // console.log('changes: ', changes);
  }

  ngOnInit(): void {
    this.createForm();
    this.setFilterValues(this.selectedCard);
    // this.searchServiceLog(this.pageNo);
    // this.searchEventLog(this.eventLogPageNo);
    this.clearUpdateCard();
    this.getPaginationSize();
  }

  /*========== Clear update card data before sent to archive pkg comp ==========*/
  clearUpdateCard() {
    this.updateCard.emit({
      cardId: null,
      cardName: null,
      cardDesc: null,
      items: null,
      isdefaultCard: false,
      isUpdate: false,
      isDelete: false,
      isLogSearched: false,
      timeFrame: '',
      searchStr: ''
    });
  }

  /*========== On Logs Tab Change =========*/
  onTabChange(e) {
    const index = e.index;
    if (index === 0) {
      this.selectedTabIndex = 0;
      if (!this.selectedRowServiceLog?.length) {
        this.searchServiceLog(this.pageNo);
        // this.getArchiveReportsCount(null, this.selectedRowServiceLog?.length, 'Message', this.pageNo);
      }
    }
    if (index === 1) {
      this.selectedTabIndex = 1;
      if (!this.selectedRowEventLog?.length) {
        this.searchEventLog(this.eventLogPageNo);
        // this.getArchiveReportsCount(null, this.selectedRowEventLog?.length, 'Event', this.eventLogPageNo);
      }
    }
  }

  /*========== On Search Tab Change =========*/
  onSearchTabChange(e) {
    const index = e.index;
    if (index === 0) {
      this.selectedSearchTabIndex = index;
    }
    if (index === 1) {
      this.selectedSearchTabIndex = index;
    }
  }

  createForm() {
    this.searchForm = this.fb.group({
      timeFrame: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      fromDate: [{ value: '', disabled: false }, {
        validators: []
      }],
      toDate: [{ value: '', disabled: true }, {
        validators: []
      }],
      searchBy: [{ value: '', disabled: false }, {
        validators: []
      }],
      freeText: [{ value: '', disabled: false }, {
        validators: []
      }],
      taskId: [{ value: '', disabled: false }, {
        validators: []
      }],
      tag: [{ value: '', disabled: false }, {
        validators: []
      }],
      value: [{ value: '', disabled: false }, {
        validators: []
      }],
      searchText: [{ value: '', disabled: false }, {
        validators: []
      }],
    });
  }

  /*========== Get Pagination Count for Showing Per Page Records in Event Logs ===========*/
  getPaginationSize() {
    this.archivePakgsService.getPageSize().subscribe(res => {
      this.pageSizeForRecordsPerPage = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onSelectTimeFrame(timeFrame: string) {
    if (timeFrame === 'Today') {
      this.clearFormDatavalidations(false);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const today_now = `${this.getDateFormat(today)} to ${this.getDateFormat(now)}`;
      this.showTimeframe = today_now;
      this.selectedTimeFrame = timeFrame;
    }
    if (timeFrame === 'last-day') {
      this.clearFormDatavalidations(false);
      const dt = new Date();
      const start_yesterday = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1, 0, 0, 0);
      const end_yesterday = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1, 23, 59, 59);
      const yesterday = `${this.getDateFormat(start_yesterday)} to ${this.getDateFormat(end_yesterday)}`;
      this.showTimeframe = yesterday;
      this.selectedTimeFrame = timeFrame;
    }
    if (timeFrame === 'last-7days') {
      this.clearFormDatavalidations(false);
      const dt = new Date();
      const start_week = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 7, 0, 0, 0);
      const end_week = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - 1, 23, 59, 59);
      const last_1Week = `${this.getDateFormat(start_week)} to ${this.getDateFormat(end_week)}`;
      this.showTimeframe = last_1Week;
      this.selectedTimeFrame = timeFrame;
    }
    if (timeFrame === 'last-month') {
      this.clearFormDatavalidations(false);
      const dt = new Date();
      const start_month = new Date(dt.getFullYear(), dt.getMonth() - 1, 1, 0, 0, 0);
      const end_month = new Date(dt.getFullYear(), dt.getMonth(), 0, 23, 23, 59);
      const last_1Month = `${this.getDateFormat(start_month)} to ${this.getDateFormat(end_month)}`;
      this.showTimeframe = last_1Month;
      this.selectedTimeFrame = timeFrame;
    }
    if (timeFrame === 'YYYY-MM-DD HH:mm:ss to YYYY-MM-DD HH:mm:ss') {
      this.clearFormDatavalidations(true);
      let fromDate = '';
      let toDate = '';
      this.searchForm.get('fromDate').valueChanges.pipe(take(1)).subscribe(startDate => {
        fromDate = startDate;
        if (startDate) {
          this.isErrMsgShow = true;
          this.searchForm.get('toDate').enable();
          this.searchForm.get('toDate').valueChanges.pipe(take(1)).subscribe(endDate => {
            toDate = endDate;
            if (toDate) {
              this.isErrMsgShow = false;
            }
            if (fromDate && toDate) {
              const custom_date = `${this.getDateFormat(fromDate)} to ${this.getDateFormat(toDate)}`;
              this.showTimeframe = custom_date;
              this.selectedTimeFrame = custom_date;
            }
          });
        }
      });
    }
  }

  OnChangeDate() {
    let fromDate = '';
    let toDate = '';
    fromDate = this.searchForm.get('fromDate').value;
    if (fromDate) {
      this.searchForm.get('toDate').enable();
      if (!this.searchForm.get('toDate').value) {
        this.isErrMsgShow = true;
      }
      toDate = this.searchForm.get('toDate').value;
      if (toDate) {
        if (fromDate > toDate) {
          this.searchForm.get('toDate').reset();
          this.isErrMsgShow = true;
        } else {
          this.isErrMsgShow = false;
          if (fromDate && toDate) {
            const custom_date = `${this.getDateFormat(fromDate)} to ${this.getDateFormat(toDate)}`;
            this.showTimeframe = custom_date;
            this.selectedTimeFrame = custom_date;
          }
        }
      }
    } else {
      this.searchForm.get('toDate').disable();
    }
  }

  /*========== Make Date Format ===========*/
  getDateFormat(date: any): string {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  /*=========== Clear Validations ============*/
  clearFormDatavalidations(isRequired: boolean) {
    this.isErrMsgShow = false;
    this.selectedTimeFrame = '';
    this.showTimeframe = '';
    this.searchForm.get('fromDate').reset();
    this.searchForm.get('toDate').reset();
    this.searchForm.get('toDate').disable();
    if (isRequired) {
      this.isDateRangeShow = true;
      this.searchForm.get('fromDate').setValidators([Validators.required]);
      this.searchForm.get('fromDate').updateValueAndValidity();
      this.searchForm.get('toDate').setValidators([Validators.required]);
      this.searchForm.get('toDate').updateValueAndValidity();
    } else {
      this.isDateRangeShow = false;
      this.searchForm.get('fromDate').clearValidators();
      this.searchForm.get('fromDate').updateValueAndValidity();
      this.searchForm.get('toDate').clearValidators();
      this.searchForm.get('toDate').updateValueAndValidity();
    }
  }

  onSelectSearchOption(searchOption: number) {
    if (Number(searchOption) === 0 || Number(searchOption) === 1 || Number(searchOption) === 2 || Number(searchOption) === 3) {
      this.displaySearch = '';
      this.searchForm.get('freeText').reset();
      this.searchForm.get('taskId').reset();
      this.searchForm.get('tag').reset();
      this.searchForm.get('value').reset();
    }
  }

  toggleFilter() {
    this.isOpen = !this.isOpen;
  }

  getArchiveReports() {
    this.archivePakgsService.getArchiveReports().subscribe(res => {
      if (this.selectedCard) {
        res.forEach(item => {
          if (Number(this.selectedCard?.id) === Number(item?.id)) {
            this.selectedCard = item;
            this.setFilterValues(item);
            this.searchServiceLog(1);
            // this.getArchiveReportsCount(null, this.selectedRowServiceLog?.length, 'Message', 1);
            this.searchEventLog(1);
            // this.getArchiveReportsCount(null, this.selectedRowEventLog?.length, 'Event', 1);
          }
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*=========== Get Archive Report Count ===========*/
  getArchiveReportsCount(searchObj: any, logLength: any, logType: string, pageNo: number) {
    this.isLoading = true;
    this.isCountSpinnerLoading = true;
    const serviceLogDto = {
      actualTimeFrame: this.showTimeframe,
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      id: this.selectedCard?.id,
      items: null,
      logType: logType,
      name: '',
      pageNo: pageNo,
      searchText: this.getSearchStr,
      timeFrame: this.selectedTimeFrame,
    };
    this.archivePakgsService.getArchiveReportCount(serviceLogDto).subscribe(res => {
      if (logType === 'Message') {
        this.totalLogCount = res;
        this.checkPagination(this.totalLogCount, logLength, logType);
      }
      if (logType === 'Event') {
        this.totalEventLogCount = res;
        this.eventLogTotalPageNo = (Number(this.totalEventLogCount) / Number(this.pageSizeForRecordsPerPage));
        this.checkPagination(this.totalEventLogCount, logLength, logType);
      }
      this.isLoading = false;
      this.isCountSpinnerLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
        this.isLoading = false;
        this.isCountSpinnerLoading = false;
      } else {
        // handle server side error here
        this.isLoading = false;
        this.isCountSpinnerLoading = false;
      }
    });
  }

  /*============= Set Default Filter Values =============*/
  setFilterValues(selectedCard: any) {
    if (selectedCard?.id) {
      const timeRange = selectedCard?.timeFrame.split(' to ');
      let searchTxt = '';
      if (selectedCard?.searchText) {
        this.selectedSearchTabIndex = 1;
        this.isSearchText = true;
        searchTxt = selectedCard?.searchText;
      } else {
        this.selectedSearchTabIndex = 0;
        this.isSearchText = false;
      }
      let selected_timeframe;
      if (selectedCard?.timeFrame === 'Today' ||
        selectedCard?.timeFrame === 'last-day' ||
        selectedCard?.timeFrame === 'last-7days' ||
        selectedCard?.timeFrame === 'last-month') {
        this.timeFrameList.forEach(item => {
          if (item?.id === selectedCard?.timeFrame) {
            selected_timeframe = item?.id;
          }
        });
      } else {
        selected_timeframe = this.timeFrameList[3]?.id;
        this.showTimeframe = selectedCard?.timeFrame;
      }
      this.searchForm.get('toDate').enable();
      this.selectedTimeFrame = selectedCard?.timeFrame;
      this.onSelectTimeFrame(selectedCard?.timeFrame);
      if (selected_timeframe === 'YYYY-MM-DD HH:mm:ss to YYYY-MM-DD HH:mm:ss') {
        this.isDateRangeShow = true;
      } else {
        this.isDateRangeShow = false;
      }
      setTimeout(() => {
        this.searchForm.patchValue({
          timeFrame: selected_timeframe,
          fromDate: new Date(timeRange[0]),
          toDate: new Date(timeRange[1]),
          searchBy: 1,
          searchText: searchTxt
        });
        this.searchServiceLog(this.pageNo);
        // this.getArchiveReportsCount(null, this.selectedRowServiceLog?.length, 'Message', this.pageNo);
      }, 0);
    }
  }
  /*============= END Set Default Filter Values =============*/

  /*============= Edit Log Card =============*/
  editCard() {
    this.clearUpdateCard();
    this.selectedCard.isAdd = false;
    const dialogRef = this.dialog.open(AddEditArchivePkgComponent, {
      width: '1150px',
      height: '650px',
      data: this.selectedCard
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.isClosed) {
        this.updateCard.emit({
          cardId: this.selectedCard?.id,
          cardName: this.selectedCard?.name,
          cardDesc: this.selectedCard?.description,
          isdefaultCard: this.selectedCard?.defaultValue,
          items: this.selectedCard?.items,
          isUpdate: true,
          isDelete: false,
          isLogSearched: false,
          timeFrame: '',
          searchStr: this.getSearchStr
        });
        this.getArchiveReports();
        this.messageService.add({ key: 'archivePkgKey', severity: 'success', summary: '', detail: 'Log updated successfully!' });
      }
    });
  }
  /*============= END Edit Log Card =============*/

  /*============= Removed Card Confirmation Popup =============*/
  removeCard() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '330px',
      panelClass: 'myapp-no-padding-dialog',
      data: 'Are you sure you want to remove this log?',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteCard();
      }
    });
  }
  /*============= END Removed Card Confirmation Popup =============*/

  /*============= Delete Card =============*/
  deleteCard() {
    this.clearUpdateCard();
    this.archivePakgsService.deleteArchiveReport(this.selectedCard?.id).subscribe(res => {
      if (res) {
        this.updateCard.emit({
          cardId: this.selectedCard?.id,
          cardName: this.selectedCard?.name,
          cardDesc: this.selectedCard?.description,
          isdefaultCard: this.selectedCard?.defaultValue,
          items: this.selectedCard?.items,
          isUpdate: false,
          isDelete: true,
          isLogSearched: false,
          timeFrame: '',
          searchStr: this.getSearchStr
        });
        this.messageService.add({ key: 'archivePkgKey', severity: 'success', summary: '', detail: 'Log deleted successfully!' });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }
  /*============= END Delete Card =============*/

  /*======== Get Search String =======*/
  get getSearchStr() {
    const formValue = this.searchForm.value;
    let searchStr = '';
    if (this.selectedSearchTabIndex === 0 && formValue?.freeText) {
      searchStr = `freetext=${formValue?.freeText}`;
    } else if (this.selectedSearchTabIndex === 0 && formValue?.taskId) {
      searchStr = `taskid=${formValue?.taskId}`;
    } else if (this.selectedSearchTabIndex === 0 && formValue?.tag && formValue?.value) {
      searchStr = `${formValue?.tag}:${formValue?.value}`;
    } else if (this.selectedSearchTabIndex === 1 && formValue?.searchText) {
      searchStr = formValue?.searchText;
    } else {
      searchStr = '';
    }
    return searchStr;
  }
  /*======== END Get Search String =======*/

  /*============= Search Logs =============*/
  searchLog() {
    this.isOpen = false;
    if (this.selectedTabIndex === 0) {
      this.searchServiceLog(1);
      // this.getArchiveReportsCount(null, this.selectedRowServiceLog?.length, 'Message', 1);
    }
    if (this.selectedTabIndex === 1) {
      this.searchEventLog(1);
      // this.getArchiveReportsCount(null, this.selectedRowEventLog?.length, 'Event', 1);
      // this.selectedTabIndex = 0;
    }
    this.clearUpdateCard();
    this.updateCard.emit({
      cardId: this.selectedCard?.id,
      cardName: this.selectedCard?.name,
      cardDesc: this.selectedCard?.description,
      isdefaultCard: this.selectedCard?.defaultValue,
      items: this.selectedCard?.items,
      isUpdate: false,
      isDelete: false,
      isLogSearched: true,
      timeFrame: this.selectedTimeFrame,
      searchStr: this.getSearchStr
    });
  }

  highlightSearchTxt() {
    const searchText = this.getSearchStr;
    if (searchText && searchText.includes(this.freetext)) {
      // Split by '|' and '&' into array
      const freetextstring = searchText.split(/\||\&/);
      // Get freetext expression from array
      let freetextValue = freetextstring.find(x => x.includes(this.freetext));
      // Get freetext expression value
      freetextValue = freetextValue.slice(freetextValue.indexOf(this.freetext) + 9);
      this.searchTokan = this.replaceSpecialChars(freetextValue);
    } else {
      this.searchTokan = '';
    }
  }

  private replaceSpecialChars(searchText: string) {
    // Remove double quotes from string to show highlited search string
    if (searchText.startsWith('"') && searchText.endsWith('"')) {
      searchText = searchText.slice(1, searchText.length - 1);
    } else {
      // Remove '*' and '?' only if its not enclosed in doube quotes
      searchText = this.replaceAll(searchText, '*', '');
      searchText = this.replaceAll(searchText, '?', '');
    }
    searchText = this.escapeRegExp(searchText);
    return searchText;
  }

  /* Define function for escaping user input to be treated as
   a literal string within a regular expression */
  private escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* Define functin to find and replace specified term with replacement string */
  private replaceAll(str, term, replacement) {
    return str.replace(new RegExp(this.escapeRegExp(term), 'g'), replacement);
  }
  /*============= Search Logs =============*/

  /*============= Search Service Logs =============*/
  searchServiceLog(pageNo: number) {
    this.totalLogCount = 0;
    this.selectedRowServiceLog = [];
    const formValue = this.searchForm.value;
    if (this.selectedCard?.timeFrame !== 'Today' &&
      this.selectedCard?.timeFrame !== 'last-day' &&
      this.selectedCard?.timeFrame !== 'last-7days' &&
      this.selectedCard?.timeFrame !== 'last-month') {
      if (formValue?.fromDate && formValue?.toDate) {
        const custom_date = `${this.getDateFormat(formValue?.fromDate)} to ${this.getDateFormat(formValue?.toDate)}`;
        this.selectedTimeFrame = custom_date;
      }
    }
    const serviceLogDto = {
      actualTimeFrame: this.showTimeframe,
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      id: this.selectedCard?.id,
      items: null,
      logType: 'Message',
      name: '',
      pageNo: pageNo,
      searchText: this.getSearchStr,
      timeFrame: this.selectedTimeFrame,
    };
    this.archivePakgsService.searchArchiveReport(serviceLogDto).subscribe(res => {
      if (res?.logs?.length) {
        this.itemId = res.logs[0].itemId;
        const nodeArray = new LogTree(res, true);
        this.selectedRowServiceLog = nodeArray.files;
        this.highlightSearchTxt();
        this.getArchiveReportsCount(serviceLogDto, this.selectedRowServiceLog?.length, 'Message', pageNo);
        // this.checkPagination(this.totalLogCount, this.selectedRowServiceLog?.length, 'Message');
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }
  /*============= END Search Service Logs =============*/

  /*============= Search Event Logs =============*/
  searchEventLog(eventLogPageNo: number) {
    this.totalEventLogCount = 0;
    this.selectedRowEventLog = [];
    const formValue = this.searchForm.value;
    if (this.selectedCard?.timeFrame !== 'Today' &&
      this.selectedCard?.timeFrame !== 'last-day' &&
      this.selectedCard?.timeFrame !== 'last-7days' &&
      this.selectedCard?.timeFrame !== 'last-month') {
      if (formValue?.fromDate && formValue?.toDate) {
        const custom_date = `${this.getDateFormat(formValue?.fromDate)} to ${this.getDateFormat(formValue?.toDate)}`;
        this.selectedTimeFrame = custom_date;
      }
    }
    const serviceLogDto = {
      actualTimeFrame: this.showTimeframe,
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      id: this.selectedCard?.id,
      items: null,
      logType: 'Event',
      name: '',
      pageNo: eventLogPageNo,
      searchText: this.getSearchStr,
      timeFrame: this.selectedTimeFrame,
    };
    this.archivePakgsService.searchArchiveReport(serviceLogDto).subscribe(res => {
      if (res?.logs?.length) {
        this.selectedRowEventLog = res?.logs;
        this.highlightSearchTxt();
        this.getArchiveReportsCount(serviceLogDto, this.selectedRowEventLog?.length, 'Event', eventLogPageNo);
        // this.checkPagination(this.totalLogCount, this.selectedRowServiceLog?.length, 'Event');
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }
  /*============= END Search Event Logs =============*/

  /*============= Search Next Page Service Logs =============*/
  getNextPageLogs(event) {
    this.pageNo++;
    const formValue = this.searchForm.value;
    if (this.selectedCard?.timeFrame !== 'Today' &&
      this.selectedCard?.timeFrame !== 'last-day' &&
      this.selectedCard?.timeFrame !== 'last-7days' &&
      this.selectedCard?.timeFrame === 'last-month') {
      if (formValue?.fromDate && formValue?.toDate) {
        const custom_date = `${this.getDateFormat(formValue?.fromDate)} to ${this.getDateFormat(formValue?.toDate)}`;
        this.selectedTimeFrame = custom_date;
      }
    }
    const serviceLogDto = {
      actualTimeFrame: this.showTimeframe,
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      id: this.selectedCard?.id,
      items: null,
      logType: 'Message',
      name: '',
      pageNo: this.pageNo,
      searchText: this.getSearchStr,
      timeFrame: this.selectedTimeFrame,
    };
    this.archivePakgsService.searchArchiveReport(serviceLogDto).subscribe(res => {
      const nodeArray = new LogTree(res, true);
      const moreServiceLog = this.selectedRowServiceLog.concat(nodeArray.files);
      this.selectedRowServiceLog = moreServiceLog;
      this.getArchiveReportsCount(serviceLogDto, this.selectedRowServiceLog?.length, 'Message', this.pageNo);
      // this.checkPagination(this.totalLogCount, this.selectedRowServiceLog?.length, 'Message');
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
    // this.getArchiveReportsCount(serviceLogDto, this.selectedRowServiceLog?.length, 'Message', this.pageNo);
  }
  /*============= END Search Next Page Service Logs =============*/

  /*============= Search Next Page Event Logs =============*/
  getNextPageEventLogs(event) {
    this.eventLogPageNo++;
    const formValue = this.searchForm.value;
    if (this.selectedCard?.timeFrame !== 'Today' &&
      this.selectedCard?.timeFrame !== 'last-day' &&
      this.selectedCard?.timeFrame !== 'last-7days' &&
      this.selectedCard?.timeFrame === 'last-month') {
      if (formValue?.fromDate && formValue?.toDate) {
        const custom_date = `${this.getDateFormat(formValue?.fromDate)} to ${this.getDateFormat(formValue?.toDate)}`;
        this.selectedTimeFrame = custom_date;
      }
    }
    const serviceLogDto = {
      actualTimeFrame: this.showTimeframe,
      applyAccess: true,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      id: this.selectedCard?.id,
      items: null,
      logType: 'Event',
      name: '',
      pageNo: this.eventLogPageNo,
      searchText: this.getSearchStr,
      timeFrame: this.selectedTimeFrame,
    };
    this.archivePakgsService.searchArchiveReport(serviceLogDto).subscribe(res => {
      const moreEventLog = this.selectedRowEventLog.concat(res?.logs);
      this.selectedRowEventLog = moreEventLog;
      this.getArchiveReportsCount(serviceLogDto, this.selectedRowEventLog?.length, 'Event', this.eventLogPageNo);
      // this.checkPagination(this.totalEventLogCount, this.selectedRowEventLog?.length, 'Event');
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
    // this.getArchiveReportsCount(serviceLogDto, this.selectedRowEventLog?.length, 'Event', this.eventLogPageNo);
  }
  /*============= END Search Next Page Event Logs =============*/

  /*============= Pagination Conditions =============*/
  checkPagination(totalCount, arrLength, logType) {
    if (logType === 'Message') {
      if (arrLength > 0 && totalCount > arrLength) {
        this.isMoreResultLinkShow = true;
      } else {
        this.isMoreResultLinkShow = false;
      }
    }
    if (logType === 'Event') {
      if (arrLength > 0 && this.eventLogTotalPageNo > this.eventLogPageNo) {
        this.isMoreEventLogResultLinkShow = true;
      } else {
        this.isMoreEventLogResultLinkShow = false;
      }
    }
  }
  /*============= END Pagination Conditions =============*/

  /*======== Update Logs On Refresh =======*/
  onRefresh(e) {
    if (this.selectedTimeFrame === 'Today' ||
      this.selectedTimeFrame === 'last-day' ||
      this.selectedTimeFrame === 'last-7days' ||
      this.selectedCard?.timeFrame === 'last-month') {
      this.onSelectTimeFrame(this.selectedTimeFrame);
    }
    this.searchServiceLog(1);
    // this.getArchiveReportsCount(null, this.selectedRowServiceLog?.length, 'Message', 1);
    this.searchEventLog(1);
    // this.getArchiveReportsCount(null, this.selectedRowEventLog?.length, 'Event', 1);
    e.stopPropagation();
  }
  /*======== END Update Logs On Refresh =======*/

  /*============= Log Information =============*/
  getRowData(taskId: string, itemId: string) {
    const infoObj = {
      itemId: itemId,
      taskId: taskId
    };
    const dialogRef = this.dialog.open(LogInfoComponent, {
      width: '1150px',
      maxWidth: '1150px',
      height: '650px',
      data: infoObj
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }
  /*============= END Log Information =============*/

  /*============= Filter Validation =============*/
  updateFreeText(value: any) {
    this.handleFreeTextEv(value);
  }

  updateTaskId(value: any, index?: number) {
    this.handleTaskIdEv(value);
  }

  updateTagName(tagName: any, index?: number) {
    this.handleTagEv(tagName);
    this.tagName = tagName;
    this.appendTagValues();
  }

  updateTagValue(tagValue: any, index?: number) {
    this.handleTagEv(tagValue);
    this.tagValue = tagValue;
    this.appendTagValues();
  }

  handleFreeTextEv(value: any, index?: number) {
    const regex = /.*?\S/gi;
    this.handleEvCommonCall(regex, value, index);
    this.searchInputValue = value ? `freetext=${value}` : value;
    // this.searchValue.emit(this.searchInputValue);
    // this.inputValue.emit(value);
  }

  handleTaskIdEv(value: any, index?: number) {
    const regex = /^[a-z0-9-]+$/g;
    this.handleEvCommonCall(regex, value, index);
    this.searchInputValue = value ? `taskid=${value}` : value;
    // this.searchValue.emit(this.searchInputValue);
    // this.inputValue.emit(value);
  }

  validateSearch(str): void {
    this.validateString = str;
    if (str) {
      const keyValPairs = str.replace(/(\r\n|\n|\r)/gm, '').split(/[&|]\s/);
      const validationStr = [
        { title: 'freetext=', regex: /.*?\S/gi },
        { title: 'taskid=', regex: /^[a-z0-9-]+$/g },
        { title: 'status=', regex: /\b(complete|error|active|hold|inputhold|done)\b/gm },
        { title: 'logtype=', regex: /\b(debug|info|warn|error)\b/gm }];
      if (keyValPairs && keyValPairs.length) {
        const colon = keyValPairs.filter(key => {
          if (key && key.indexOf('freetext=') === -1) {
            return (key && key.indexOf(':') !== -1);
          }
        });
        if (colon && colon.length) {
          const tagPair = colon[0].split(':');
          this.updateTagNameValue(tagPair[0], tagPair[1]);
        } else {
          keyValPairs.map((data, i) => {
            for (str of validationStr) {
              if (data && data.indexOf(str.title) === 0) {
                this.handleSearch(str, data, i);
                break;
              } else {
                this.validationFalse(false, 'Search text not valid');
              }
            }
          });
        }
      }
    } else if (str === '') {
      this.validationFalse(true, '');
    } else {
      this.validationFalse(false, 'Search text not valid');
    }
  }

  updateTagNameValue(tagName, tagVal): any {
    this.handleTagEv(tagName);
    this.tagName = tagName;
    this.handleTagEv(tagVal);
    this.tagValue = tagVal;
    this.appendTagValues();
  }

  handleTagEv(value: any, index?: number) {
    const regex = /.*?/gi;
    this.handleEvCommonCall(regex, value, index);
  }

  appendTagValues(index?: number) {
    if (!this.tagName || !this.tagValue) {
      this.searchInputValue = '';
      this.isValidSearch = false;
      this.validationFalse(false, 'Search text not valid');
    }
    if ((this.tagName === '') && (this.tagValue === '')) {
      this.searchInputValue = '';
      this.displaySearch = '';
      this.isValidSearch = true;
    } else {
      this.searchInputValue = this.tagName + ':' + this.tagValue;
    }
  }

  handleSearch(obj, value, index): void {
    const tagValue = value.trim().slice(obj.title.length);
    this.handleEvCommonCall(obj.regex, tagValue, index);
    this.searchInputValue = value;
  }

  handleEvCommonCall(regex, value, index?: number) {
    let m;
    while ((m = regex.exec(value))) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      m.forEach(() => {
        this.validationResult.splice(index, 1, true);
        if (this.validationResult.indexOf('false') === -1) {
          this.isValidSearch = true;
          this.validationFalse(true, 'Valid search string');
        }
      });
    }
    if (!regex.exec(value)) {
      this.validationResult.splice(index, 1, false);
      this.isValidSearch = false;
      this.validationFalse(false, 'Search text not valid');
    }
    if (!value) {
      this.displaySearch = '';
      this.isValidSearch = true;
      this.validationFalse(true, '');
    }
  }

  validationFalse(isValidSearch, error) {
    this.isValidSearch = isValidSearch;
    this.displaySearch = error;
    // this.onblur.emit({ isValid: this.isValidSearch, display: this.displaySearch, searchInputValue: this.validateString });
  }

}
