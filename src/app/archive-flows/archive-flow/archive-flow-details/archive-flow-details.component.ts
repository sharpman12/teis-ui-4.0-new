import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { first, take } from 'rxjs/operators';
import { Tree } from 'src/app/flows/adapters/tree';
import { BreadCrumbService } from '../../../core/service/breadcrumb.service';
import { HeaderService } from '../../../core/service/header.service';
import { SharedService } from '../../../shared/services/shared.service';
import { ArchiveFlowService } from '../archive-flow.service';
import { ArchiveFlow, ArchiveSearch, LogSearch } from '../archiveflow';

@Component({
  selector: 'app-archive-flow-details',
  templateUrl: './archive-flow-details.component.html',
  styleUrls: ['./archive-flow-details.component.scss']
})
export class ArchiveFlowDetailsComponent implements OnInit, OnDestroy {
  navbarOpen = false;
  isOpen = false;
  searchForm: UntypedFormGroup;
  isErrMsgShow = false;
  selectedTimeFrame: string;
  showTimeframe: string;
  isDateRangeShow = false;
  isSearchText = false;
  maxDate = new Date();
  pageNo = 1;
  isLoading = false;

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
  flowsList = [];
  flowGroup: any;
  showResults = [];
  selectedFlow: ArchiveFlow;
  searchInputValue: any;
  validationResult = [];
  isValidSearch = true;
  displaySearch: any;
  tagName: any;
  tagValue: any;
  flowLogDetails = [];
  selectedRowServiceLog = [];
  selectedRowEventLog = [];
  flowItemTabView: boolean;
  isMoreResultLinkShow = false;
  totalFlowLogCount: any;
  searchTaskId: any;

  constructor(
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private archiveFlowService: ArchiveFlowService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.header.show(); // show hide header
    if (localStorage.getItem('source')) {
      this.breadcrumb.visible = true;
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.sharedService.isChangeBgColor.next(true);
    this.breadcrumb.flowItemVisible.subscribe(
      result => {
        this.flowItemTabView = result;
        this.cdr.detectChanges();
      });
    this.getFlowsByFlowGroupName();
  }

  onChangeTab(e) {
    const index = e.index;
    if (index === 1) {
      if (this.searchTaskId) {
        this.searchServiceLog(this.searchTaskId);
      }
    }
    if (index === 2) {
      if (this.searchTaskId) {
        this.searchEventLog(this.searchTaskId);
      }
    }
  }

  /*=========== Form Creation ===========*/
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
      searchBy: [{ value: this.searchList[0]?.id, disabled: false }, {
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

  /*========== Get Flows By Flow Group Name ==========*/
  getFlowsByFlowGroupName() {
    this.route.params.subscribe(params => {
      this.archiveFlowService.getArchiveFlowsByGName(params.id).subscribe(res => {
        res.forEach(item => {
          item.timeFrame = 'last-7days';
        });
        this.flowsList = res;
        this.getArchiveFlowGroups(params.id);
        this.selectedFlows(this.flowsList[0]);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
          this.messageService.add({ key: 'archiveFlowDetailsInfoKey', severity: 'success', summary: '', detail: err.error });
        }
      });
    });
  }

  /*========= Get Archive Flow Groups ==========*/
  getArchiveFlowGroups(params: any) {
    this.archiveFlowService.getArchiveFlowGroups().subscribe(res => {
      this.flowGroup = res.find(item => item?.name === params);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archiveFlowDetailsInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*========== Time Frame Selection from Dropdown ===========*/
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
      this.searchForm.get('freeText').reset('');
      this.searchForm.get('taskId').reset('');
      this.searchForm.get('tag').reset('');
      this.searchForm.get('value').reset('');
    }
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  toggleFilter() {
    this.isOpen = !this.isOpen;
  }

  /*=========== Filter validation ============*/
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

  handleTagEv(value: any, index?: number) {
    const regex = /.*?/gi;
    this.handleEvCommonCall(regex, value, index);
    // this.inputValue.emit(value);
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
      // const search = this.tagName + ':' + this.tagValue;
      // this.searchValue.emit(search);
      // this.inputValue.emit(search);
    }

  }

  handleTaskIdEv(value: any, index?: number) {
    const regex = /^[a-z0-9-]+$/g;
    this.handleEvCommonCall(regex, value, index);
    this.searchInputValue = value ? `taskid=${value}` : value;
    // this.searchValue.emit(this.searchInputValue);
    // this.inputValue.emit(value);
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
    // this.onblur.emit({ isValid: this.isValidSearch, display: this.displaySearch });
  }

  /*========== Search Log ==========*/
  searchLog() {
    this.isOpen = false;
    this.pageNo = 1;
    const formValues = this.searchForm.value;
    let searchStr = '';
    if (formValues?.freeText) {
      searchStr = `freetext=${formValues?.freeText}`;
    } else if (formValues?.taskId) {
      searchStr = `taskid=${formValues?.taskId}`;
    } else if (formValues?.tag && formValues?.value) {
      searchStr = `${formValues?.tag}:${formValues?.value}`;
    } else {
      searchStr = '';
    }
    if (formValues?.timeFrame === 'YYYY-MM-DD HH:mm:ss to YYYY-MM-DD HH:mm:ss') {
      if (formValues?.fromDate && formValues?.toDate) {
        const custom_date = `${this.getDateFormat(formValues?.fromDate)} to ${this.getDateFormat(formValues?.toDate)}`;
        this.selectedTimeFrame = custom_date;
      }
    }
    const searchObj: ArchiveSearch = {
      error: false,
      flowId: this.selectedFlow?.id,
      pageNo: this.pageNo,
      searchText: searchStr,
      startActivity: false,
      timeFrame: this.selectedTimeFrame
    };
    this.searchArchiveLog(searchObj);
    // this.searchArchiveLogCount(searchObj, this.showResults?.length);
  }

  /*========== Search Archive Log ==========*/
  searchArchiveLog(searchObj: ArchiveSearch) {
    this.isLoading = true;
    this.archiveFlowService.archiveSearch(searchObj).subscribe(res => {
      const currentTransaction = res;
      for (const key in currentTransaction) {
        if (key === 'transactions') {
          this.showResults = currentTransaction[key];
        }
      }
      this.searchArchiveLogCount(searchObj, this.showResults?.length);
      this.isLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
        this.isLoading = false;
      } else {
        // handle server side error here
        this.isLoading = false;
        this.messageService.add({ key: 'archiveFlowDetailsInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*========== Search Archive Log Count ==========*/
  searchArchiveLogCount(searchObj: ArchiveSearch, showLogCount: any) {
    this.isLoading = true;
    this.totalFlowLogCount = 0;
    this.archiveFlowService.archiveSearchCount(searchObj).subscribe(res => {
      this.totalFlowLogCount = res;
      // this.checkPagination(this.totalFlowLogCount, showLogCount);
      this.checkPagination(this.totalFlowLogCount, this.showResults?.length);
      this.isLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
        this.isLoading = false;
      } else {
        // handle server side error here
        this.isLoading = false;
        this.messageService.add({ key: 'archiveFlowDetailsInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*========== Selected Archive Log ===========*/
  selectedFlows(selectedFlow: ArchiveFlow) {
    this.selectedFlow = selectedFlow;
    this.breadcrumb.flowItemVisible.next(false);
    this.breadcrumb.setTitle('');
    this.pageNo = 1;
    const searchObj: ArchiveSearch = {
      error: false,
      flowId: selectedFlow?.id,
      pageNo: this.pageNo,
      searchText: '',
      startActivity: false,
      timeFrame: selectedFlow?.timeFrame
    };
    this.searchArchiveLog(searchObj);
    this.setDefaultData(selectedFlow);
  }

  /*========== Set Default Data in Filter ===========*/
  setDefaultData(flowObj: any) {
    this.onSelectTimeFrame(flowObj?.timeFrame);
    this.searchForm.patchValue({
      timeFrame: flowObj?.timeFrame,
      fromDate: '',
      toDate: '',
      searchBy: '1',
      freeText: '',
      taskId: '',
      tag: '',
      value: '',
      searchText: '',
    });
  }

  /*========= Check Log Details =======*/
  checkLogDetails(flow: any) {
    this.breadcrumb.flowItemVisible.next(true);
    this.breadcrumb.setTitle(this.selectedFlow.name);
    this.flowLogDetails = [];
    const arr = [];
    let searchId: any;
    this.flowLogDetails = flow;
    const filtered = this.flowLogDetails.filter(element => element.taskId !== undefined);
    for (let i = 0; i <= filtered.length - 1; i++) {
      arr.push(filtered[i].taskId);
    }
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    const unique = arr.filter(onlyUnique);
    const serchTaskIds = unique.map(element => 'taskid=' + element);
    if (unique.length >= 2) {
      searchId = serchTaskIds.join(' | ');
    } else {
      searchId = serchTaskIds[0];
    }
    this.searchTaskId = searchId;
  }

  searchServiceLog(taskId: string) {
    const serviceLogDto: LogSearch = {
      actualTimeFrame: '',
      applyAccess: false,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      flowId: this.selectedFlow?.id,
      id: null,
      items: null,
      logType: 'Message',
      name: '',
      pageNo: 1,
      searchText: taskId,
      timeFrame: '',
    };
    this.archiveFlowService.searchArchiveReport(serviceLogDto).subscribe(res => {
      if (res?.logs?.length) {
        const nodeArray = new Tree(res);
        this.selectedRowServiceLog = nodeArray.files;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archiveFlowDetailsInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  searchEventLog(taskId: string) {
    const serviceLogDto = {
      actualTimeFrame: '',
      applyAccess: false,
      defaultValue: false,
      description: '',
      error: false,
      errorCount: 0,
      flowId: this.selectedFlow?.id,
      id: null,
      items: null,
      logType: 'Event',
      name: '',
      pageNo: 1,
      searchText: taskId,
      timeFrame: '',
    };
    this.archiveFlowService.searchArchiveReport(serviceLogDto).subscribe(res => {
      if (res?.logs?.length) {
        this.selectedRowEventLog = res?.logs;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'archiveFlowDetailsInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  /*========== Check Pagination ==========*/
  checkPagination(totalCount, arrLength) {
    if (arrLength > 0 && totalCount > arrLength) {
      this.isMoreResultLinkShow = true;
    } else {
      this.isMoreResultLinkShow = false;
    }
  }

  getNextPageLogs(event) {
    this.pageNo++;
    const searchObj: ArchiveSearch = {
      error: false,
      flowId: this.selectedFlow?.id,
      pageNo: this.pageNo,
      searchText: '',
      startActivity: false,
      timeFrame: this.selectedTimeFrame
    };
    this.isLoading = true;
    this.archiveFlowService.archiveSearch(searchObj).subscribe(res => {
      const currentTransaction = res;
      for (const key in currentTransaction) {
        if (key === 'transactions') {
          const results = currentTransaction[key];
          this.showResults = this.showResults.concat(results);
        }
      }
      this.checkPagination(this.totalFlowLogCount, this.showResults?.length);
      this.isLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
        this.isLoading = false;
      } else {
        // handle server side error here
        this.isLoading = false;
        this.messageService.add({ key: 'archiveFlowDetailsInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  // onRefresh(e) {
  //   this.selectedFlows(this.flowsList[0]);
  //   e.stopPropagation();
  // }

  onRefresh(e: Event) {
    e.stopPropagation();
    this.pageNo = 1;

    const formValues = this.searchForm.value;
    let searchStr = '';

    if (formValues?.freeText) {
      searchStr = `freetext=${formValues.freeText}`;
    } else if (formValues?.taskId) {
      searchStr = `taskid=${formValues.taskId}`;
    } else if (formValues?.tag && formValues?.value) {
      searchStr = `${formValues.tag}:${formValues.value}`;
    }

    // Handle custom date range
    if (formValues?.timeFrame === 'YYYY-MM-DD HH:mm:ss to YYYY-MM-DD HH:mm:ss'
      && formValues.fromDate
      && formValues.toDate) {

      this.selectedTimeFrame =
        `${this.getDateFormat(formValues.fromDate)} to ${this.getDateFormat(formValues.toDate)}`;
    }

    const searchObj: ArchiveSearch = {
      error: false,
      flowId: this.selectedFlow?.id,
      pageNo: this.pageNo,
      searchText: searchStr,
      startActivity: false,
      timeFrame: this.selectedTimeFrame
    };

    this.searchArchiveLog(searchObj);
  }


  ngOnDestroy(): void {
    this.breadcrumb.flowItemVisible.next(false);
    this.breadcrumb.setTitle('');
  }

}
