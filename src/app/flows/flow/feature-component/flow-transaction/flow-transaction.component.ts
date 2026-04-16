import { Component, OnInit, Input, EventEmitter, Output, OnChanges, AfterViewInit } from '@angular/core';
import { FlowTransaction } from '../../../../core/model/flow/FlowTransaction';
import { FlowService } from '../../../../core/service/flow.service';
import { LogReportService } from '../../../../core/service/logreport.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LogCriteria } from '../../../../core/model/log/LogCriteria';
import { Tree } from '../../../adapters/tree';

import { FlowCriteria } from '../../../../core/model/flow/FlowCriteria';
import { TreeNode } from 'primeng/api';
import { BreadCrumbService } from '../../../../core/service/breadcrumb.service';
import { EventLogs } from '../../../../core/model/log/EventLogs';

import { Activity } from '../../../../core/model/flow/Activity';
import { ServiceLogs } from '../../../../core/model/log/ServiceLogs';

import { FlowDataService } from '../../state/flow-data.service';
import { ParseTimeFrame } from '../../../../shared/components/filter/adapter/parseTimeFrame';
import { Constants } from 'src/app/shared/components/constants';

interface Isearch {
  id: string;
  message: string;
}
interface UpdateFlowItem {
  id: number;
  timeFrame: string;
  error: boolean;
  search: string;
  searchText: string;
  searchType: string;
  startActivity: boolean;
  actualTimeFrame: string;
}

@Component({
  selector: 'app-flow-transaction',
  templateUrl: './flow-transaction.component.html',
  styleUrls: ['./flow-transaction.component.scss']
})
export class FlowTransactionComponent implements OnInit, OnChanges, AfterViewInit {
  flowFilter: UntypedFormGroup;
  status = false; // toggle filter
  files: TreeNode;
  selectedSearch: Isearch;
  selectedSearchValue: string;
  searchInputValue: string;
  showFlowModal = false;
  selectedTimeFrame: string;
  refreshFilter = false;
  searchString: string;
  actualTimeFrame: string;
  showloading = false;
  // pagination
  activeMoreResults = true;
  totalCount = 0;
  pageNo = 1;

  showResult: any[];
  showFlowDetailView: Activity[];
  flowRowIndex: number;
  inputSearchString: string;

  showServiceLogTab: string;
  showEventLogTab: string;

  public flowItemTabView: boolean;
  loadFlowCount = true;
  moreRecordsClicked: boolean;

  constructor(
    private flowService: FlowService,
    private formBuilder: UntypedFormBuilder,
    private logReportService: LogReportService,
    public breadcrumb: BreadCrumbService,
    public flowDataService: FlowDataService
  ) {
    this.breadcrumb.flowItemVisible$.subscribe(
      result => {
        this.flowItemTabView = result;
      });
    this.flowDataService.selectedFlowRowNumberAnnounced$.subscribe(
      result => {
        this.flowRowIndex = result;
      });
    this.flowDataService.flowRowDetailViewAnnounced$.subscribe(
      result => {
        this.showFlowDetailView = result;
      });
    this.flowDataService.errorAnnounced$.subscribe(
      result => {
        this.seterror = result;
      });
    this.flowDataService.searchAnnounced$.subscribe(
      result => {
        this.setSearch = result;
      });
    this.flowDataService.flowGroupDataAnnounced$.subscribe(
      result => {
        this.flowGroupCriteria = result;
      });
    this.flowDataService.transcationTableAnnounced$.subscribe(
      result => {
        this.transaction = result;
      });
  }

  @Output() flowSelectedRow = new EventEmitter<any>();
  @Input() selectedWebFlow: any;
  @Input() transaction: FlowTransaction[];
  @Input() flowCriteria: FlowCriteria;
  @Input() flowDisable: boolean;
  @Input() currentFlowIndex: number;
  @Input() flowTimeFrame: string;

  settimeframe;
  seterror;
  setSearch;
  flowGroupCriteria;
  setDisplay;
  /////////////////////////////////////
  selectedEventRowData: EventLogs;
  selectedLogRowData: ServiceLogs;
  //////////////////////////
  ngOnChanges() {

    this.selectedSearch = {
      id: this.flowGroupCriteria[this.currentFlowIndex].searchType,
      message: this.flowGroupCriteria[this.currentFlowIndex].searchType
    };

    if (this.flowGroupCriteria[this.currentFlowIndex].searchType === 'freeText') {
      this.selectedSearch.message = 'Text';
    } else if (this.flowGroupCriteria[this.currentFlowIndex].searchType === 'taskId') {
      this.selectedSearch.message = 'TaskId';
    } else if (this.flowGroupCriteria[this.currentFlowIndex].searchType === 'tag') {
      this.selectedSearch.message = 'TagValue';
    }

    this.flowFilter = this.formBuilder.group({
      timeFrame: [this.flowGroupCriteria[this.currentFlowIndex].timeFrame, [Validators.required]],
      searchText: [this.flowGroupCriteria[this.currentFlowIndex].search],
      error: this.flowGroupCriteria[this.currentFlowIndex].error,
      startActivity: this.flowGroupCriteria[this.currentFlowIndex].startActivity
    });

    this.selectedTimeFrame = this.flowGroupCriteria[this.currentFlowIndex].timeFrame;
    this.breadcrumb.setFlowItemDetailView(false);
    this.flowDataService.transcationTableAnnounced$.subscribe(
      result => {
        this.transaction = result;
        this.setResultAndCount();
      });

    this.inputSearchString = this.flowGroupCriteria[this.currentFlowIndex].searchText;
  }

  private setResultAndCount() {
    const currentTransaction = this.transaction[this.currentFlowIndex];
    for (const key in currentTransaction) {
      if (key === 'transactions') {
        if (this.moreRecordsClicked) {
          this.moreRecordsClicked = false;
          // Append result on 'More result' link click
          this.showResult = this.showResult.concat(currentTransaction[key]);
          // Sets concat result for next fetch
          this.transaction[this.currentFlowIndex][key] = this.showResult;
          this.flowDataService.setTransactionTableData(this.transaction);
        } else {
          this.showResult = currentTransaction[key];
        }
      } else if (this.flowGroupCriteria[this.currentFlowIndex].search &&
        this.flowGroupCriteria[this.currentFlowIndex].search.includes('freetext=') &&
        key === 'totalCount') {
        // For better performance: Get total flow count from result if lucene search else give seperate api call
        this.totalCount = currentTransaction[key];
        this.loadFlowCount = false;
        this.checkPaginationItems();
      }
    }
  }

  ngOnInit() {
    // Set Permissions
    this.setPermissions();
  }

  private setPermissions() {
    this.showEventLogTab = localStorage.getItem(Constants.EVENT_LOG);
    this.showServiceLogTab = localStorage.getItem(Constants.SERVICE_LOG);
  }

  ngAfterViewInit(): void {
    this.getFlowCount();
  }

  get f() { return this.flowFilter.controls; }

  checkPaginationItems() {
    if (this.showResult && this.showResult.length > 0 && this.totalCount > this.showResult.length) {
      this.activeMoreResults = true;
    } else {
      this.activeMoreResults = false;
    }
  }

  private getFlowCount() {
    if (this.flowGroupCriteria[this.currentFlowIndex] &&
      (!this.flowGroupCriteria[this.currentFlowIndex].search ||
        (this.flowGroupCriteria[this.currentFlowIndex].search &&
          !this.flowGroupCriteria[this.currentFlowIndex].search.includes('freetext=')))) {
      // For better performance: Get total logs count from result if lucene search else give seperate api call
      this.loadFlowCount = true;
      this.flowService.searchFlowCount(new FlowCriteria(
        this.flowCriteria.flowId,
        this.flowGroupCriteria[this.currentFlowIndex].error,
        this.flowGroupCriteria[this.currentFlowIndex].displayString,
        this.flowGroupCriteria[this.currentFlowIndex].search,
        this.flowGroupCriteria[this.currentFlowIndex].startActivity,
        this.pageNo
      ))
        .subscribe(
          totalCount => {
            this.totalCount = totalCount;
            this.loadFlowCount = false;
            this.checkPaginationItems();
          }
        );
    }
  }

  toggleFilterVisibility($event) {
    this.status = !this.status;
  }

  toggleFlowtable(flowData) {
    this.changeTitle(flowData);
  }


  getNextPage(event): void {
    this.showloading = true;
    this.moreRecordsClicked = true;
    this.pageNo++;
    this.flowService.searchFlow(new FlowCriteria(
      this.flowCriteria.flowId,
      this.flowGroupCriteria[this.currentFlowIndex].error,
      this.flowGroupCriteria[this.currentFlowIndex].displayString,
      this.flowGroupCriteria[this.currentFlowIndex].search,
      this.flowGroupCriteria[this.currentFlowIndex].startActivity,
      this.pageNo
    ))
      .subscribe(
        t => {
          this.transaction[this.currentFlowIndex] = t;
          this.flowDataService.setFlowGroupData(this.flowGroupCriteria);
          this.showloading = false;
          this.getFlowCount();
        });
  }
  /***************************** */
  updateFilterData(time, search, error, sActivity) {
    this.flowDataService.setTimeFrame(time);
    this.flowDataService.setSearch(search);
    this.flowDataService.setError(error);
    this.flowDataService.setStartActivity(error);
  }
  getSearchType($event) {
    this.selectedSearch = $event;
  }
  getSearchValue($event) {
    this.selectedSearchValue = $event;
  }
  getInputSearchString($event) {
    this.inputSearchString = $event;
  }

  onRefresh(e) {
    this.searchflow();
    e.stopPropagation();
  }

  onSubmit() {
    this.searchflow();
  }

  private searchflow() {
    this.flowDataService.setTimeFrame(this.f.timeFrame.value);
    this.showloading = true;
    this.pageNo = 1;
    const aTimeFrame = new ParseTimeFrame(this.f.timeFrame.value);
    const defaultDisplayString = aTimeFrame.displayString;

    this.flowService.searchFlow(new FlowCriteria(
      this.flowCriteria.flowId,
      this.f.error.value,
      defaultDisplayString,
      this.selectedSearchValue,
      this.f.startActivity.value,
      this.pageNo
    ))
      .subscribe(
        t => {
          this.updateFilterData(this.f.timeFrame.value, this.selectedSearchValue,
            this.f.error.value, this.f.startActivity.value);

          this.transaction[this.currentFlowIndex] = t;
          this.flowDataService.setTransactionTableData(this.transaction);
          delete this.showResult;

          let updateValue: UpdateFlowItem;
          updateValue = {
            id: this.flowCriteria.flowId,
            timeFrame: this.f.timeFrame.value,
            error: this.f.error.value,
            search: this.selectedSearchValue,
            searchText: this.inputSearchString,
            searchType: this.selectedSearch.id,
            startActivity: this.f.startActivity.value,
            actualTimeFrame: defaultDisplayString
          };

          this.updateFlowGroupData(updateValue);
          this.selectedTimeFrame = this.f.timeFrame.value;

          this.flowGroupCriteria[this.currentFlowIndex].displayString = defaultDisplayString;
          this.flowGroupCriteria[this.currentFlowIndex].searchText = this.searchString;
          this.flowGroupCriteria[this.currentFlowIndex].search = this.selectedSearchValue;
          this.flowGroupCriteria[this.currentFlowIndex].searchText = this.inputSearchString;
          this.flowGroupCriteria[this.currentFlowIndex].searchType = this.selectedSearch.id;
          this.flowGroupCriteria[this.currentFlowIndex].startActivity = this.f.startActivity.value;

          this.flowDataService.setFlowGroupData(this.flowGroupCriteria);
          this.showloading = false;

          this.getFlowCount();
        });
    this.status = false;
  }

  updateFlowGroupData(updatedflowData) {
    let oldValue;
    this.flowDataService.flowGroupDataAnnounced$.subscribe(
      result => {
        oldValue = result;
      });
    const tabIndex = oldValue.findIndex(p => p.id === this.flowCriteria.flowId);

    oldValue[tabIndex].id = updatedflowData.id;
    oldValue[tabIndex].timeFrame = updatedflowData.timeFrame;
    oldValue[tabIndex].error = updatedflowData.error;
    oldValue[tabIndex].search = updatedflowData.search;
    oldValue[tabIndex].searchText = updatedflowData.searchText;
    oldValue[tabIndex].searchType = updatedflowData.searchType;
    oldValue[tabIndex].startActivity = updatedflowData.startActivity;
    oldValue[tabIndex].actualTimeFrame = updatedflowData.actualTimeFrame;
    this.flowDataService.setFlowGroupData(oldValue);
  }

  /******************************************************************/
  showFlowRowNumber(number) {
    this.flowDataService.setSelectedFlowRowNumber(number);
  }
  showFlowDetails($event) {
    this.flowDataService.setflowRowDetailView($event.value);
    this.flowDataService.flowRowDetailViewAnnounced$.subscribe(
      result => {
        this.showFlowDetailView = result;
      });

    const arr = [];
    let searchId: any;
    const filtered: Activity[] = this.showFlowDetailView.filter(element => element.taskId !== undefined);
    for (let i = 0; i <= filtered.length - 1; i++) {
      arr.push(filtered[i].taskId);
    }
    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }
    const unique = arr.filter(onlyUnique);
    const serchTaskIds = unique.map(element => 'taskId=' + element);

    if (unique.length >= 2) {
      searchId = serchTaskIds.join(' | ');
    } else {
      searchId = serchTaskIds[0];
    }

    if (this.showEventLogTab) {
      this.callLogReportEvent(searchId);
    }
    if (this.showServiceLogTab) {
      this.callLogReportService(searchId);
    }
  }
  showFlowData() {
    this.breadcrumb.backtoflowItem();
  }

  ////////////////////////////////////// Added after refactor

  callLogReportEvent(taskId) {
    this.logReportService.searchEventLogsForFlow(new LogCriteria(
      null,
      '',
      '',
      taskId,
      '',
      false,
      1,
      'Event',
      '',
      null,
      false,
      this.flowCriteria.flowId
    ))
      .subscribe(
        eventreports => {
          this.selectedEventRowData = eventreports;
        },
        error => {
          console.log('error' + error);
        });
  }
  callLogReportService(taskId) {
    this.logReportService.searchServiceLogsForFlow(new LogCriteria(
      null,
      '',
      '',
      taskId,
      '',
      false,
      1,
      'Message',
      '',
      null,
      false,
      this.flowCriteria.flowId
    ))
      .subscribe(
        reports => {
          this.selectedLogRowData = reports;
          if (reports.logs.length > 0) {
            let nodeArray;
            nodeArray = new Tree(reports);
            this.files = nodeArray.files;
          }

        });
  }

  changeTitle(status): void {
    this.breadcrumb.setFlowItemDetailView(status);
  }

  onTimeFrameBlur($event) {
    if ($event.isValid) {
      this.flowFilter.controls['timeFrame'].setErrors({ 'valid': null });
      this.flowFilter.controls['timeFrame'].updateValueAndValidity();
    } else {
      this.flowFilter.controls['timeFrame'].setErrors({ 'valid': false });
    }
  }

  onSearchTextBlur($event) {
    this.searchString = $event;
    this.flowGroupCriteria[this.currentFlowIndex].searchText = $event;
    if ($event.isValid) {
      this.flowFilter.controls['searchText'].setErrors({ 'valid': null });
      this.flowFilter.controls['searchText'].updateValueAndValidity();
    } else {
      this.flowFilter.controls['searchText'].setErrors({ 'valid': false });
    }
  }


  showDialog() {
    this.showFlowModal = true;
  }
}

