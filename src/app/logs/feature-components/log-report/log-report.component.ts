import {
  Component,
  OnInit,
  Renderer2,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { LogReportService } from "../../../core/service/logreport.service";
import { LogResult } from "../../../core/model/log/logResult";
import { LogCriteria } from "../../../core/model/log/LogCriteria";
import { BreadCrumbService } from "../../../core/service/breadcrumb.service";
import { TreeNode } from "primeng/api";
import { MessageService } from "primeng/api";
import { EventLogs } from "../../../core/model/log/EventLogs";
import { EventLog } from "../../../core/model/log/EventLogs";
import { LogTree } from "../../adapters/tree";
import { ParseTimeFrame } from "../../../shared/components/filter/adapter/parseTimeFrame";
import { LogDataService } from "../../../core/service/state/log-data.service";
import { Item } from "../../../core/model/log/Item";
import { ISelectedLog } from "../../../core/model/log/SelectedLog";
import { ServiceLogs } from "src/app/core/model/log/ServiceLogs";
// import { TabView } from 'primeng/primeng';
import { Constants } from "src/app/shared/components/constants";
import { TabView } from "primeng/tabview";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { ConfirmationComponent } from "../../../shared/components/confirmation/confirmation.component";
import { ProgressiveLoaderService } from "src/app/core/service/progressiveloader.service";

interface Isearch {
  id: string;
  message: string;
}

export enum TabHeaders {
  Service = "Service Log",
  Event = "Event Log",
  Application = "Application Log",
}

@Component({
  selector: "app-log-report",
  templateUrl: "./log-report.component.html",
  styleUrls: ["./log-report.component.scss"],
})
export class LogReportComponent implements OnInit, AfterViewInit {
  @Input() selectedLogCardId: any;
  @Input() logCriteria: LogCriteria;
  @Input() tabIndex: number;
  @Input() workSpaces: Item[];
  @Input() activeTabLogCriteria: any;
  @Output() deleteLogReport = new EventEmitter<object>();
  @Output() updateTabName = new EventEmitter<object>();
  @Output() updateLogCriteria = new EventEmitter<object>();

  // All TabViews on page
  @ViewChildren(TabView) tabViewList: QueryList<TabView>;
  tabHeaders = TabHeaders;
  logResult: LogResult = { criteria: null, result: null };
  display: boolean;
  eventLogArray: EventLog[] | undefined;
  selectedRowEventLog: EventLogs;
  applicationLogArray: EventLog[] | undefined;
  public content: any;
  files: TreeNode[];

  cols: any[];
  colsEvent: any[];
  colsApplication: any[];
  logReportForm: UntypedFormGroup;
  saveLogSearchReport: UntypedFormGroup;

  // pop up
  showModal: boolean;
  selectedRowServiceLog: TreeNode[];
  taskId: string;
  itemId: string;
  workspaceId: string;

  reportsById: LogResult;
  showModalSearch: boolean;
  showWizard: boolean;

  public dirtyField: boolean;

  // pagination
  activeMoreServiceLogResults: boolean;
  activeMoreEventLogResults: boolean;
  activeMoreApplicationLogResults: boolean;
  pageNo = 1;

  showResult: any[];
  showEventLogResult: any[];
  showApplicationLogResult: any[];
  selectedReportId: number;
  ////////////////////////////////////////////////////////////////
  status: boolean;
  actualTimeFrame: string;
  selectedSearch: Isearch;
  selectedSearchValue: string;
  inputSearchString: string = "";
  inputSearchStringEditEx: string = "";
  searchString: string;
  showEditExpression: boolean;
  setSerchIndex: number = 0;
  selectedEditSearchValue: string;
  defaultSearchInputText: string;
  editExSearchInputText: string;
  setPrimaryTabIndex: number;
  searchTokan: string;
  selectedLogItem: ISelectedLog;

  totalServiceLogs: number;
  totalEventLogs: number;
  totalApplicationLogs: number;
  showloading = true;
  showServiceLogTab: string;
  showEventLogTab: string;
  showApplicationLogTab: string;
  selectedHeader: string;
  serviceTabClicked: boolean;
  eventTabClicked: boolean;
  appTabClicked: boolean;
  loadServiceLogsCount = false;
  firstEventLogsCount: number;
  visibleItems: any;

  private readonly freetext = "freetext=";
  showModalRemoveLog: boolean;
  currentUser: any;

  ////////////////////////////////////////////////////////////////////
  constructor(
    private router: Router,
    public _route: ActivatedRoute,
    private logReportService: LogReportService,
    private formBuilder: UntypedFormBuilder,
    public breadcrumb: BreadCrumbService,
    private messageService: MessageService,
    public renderer2: Renderer2,
    private logDataService: LogDataService,
    private cd: ChangeDetectorRef,
    private dialog: MatDialog,
    public loaderService: ProgressiveLoaderService
  ) { 
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngAfterViewInit(): void {
    // To detect tab hide changes with *ngIf
    this.cd.detectChanges();
    this.callSearch();
  }

  ngOnInit() {
    this.selectedSearch = {
      id: "freeText",
      message: "Text",
    };

    this.setPrimaryTabIndex = 0;
    // this.breadcrumb.hide(); // show hide breadcrumb
    if (localStorage.getItem("source") || this.router.url === '/logs') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.cols = [
      { field: "Status", header: "Status" },
      { field: "Info", header: "Info" },
      { field: "Date", header: "Date" },
      { field: "Name", header: "Name" },
      { field: "Message", header: "Message" },
    ];
    this.colsEvent = [
      { field: "Level", header: "Level" },
      { field: "Info", header: "Info" },
      { field: "Date", header: "Date" },
      { field: "Name", header: "Name" },
      { field: "Message", header: "Message" },
    ];
    this.colsApplication = [
      { field: "Level", header: "Level" },
      { field: "Date", header: "Date" },
      { field: "Message", header: "Message" },
    ];

    this.logResult.criteria = new LogCriteria(
      this.logCriteria.id,
      this.logCriteria.name,
      this.logCriteria.description,
      this.logCriteria.searchText,
      this.logCriteria.timeFrame,
      this.logCriteria.error,
      this.logCriteria.pageNo,
      this.logCriteria.logType,
      this.logCriteria.actualTimeFrame,
      this.logCriteria.items,
      this.logCriteria.applyAccess,
      this.logCriteria.flowId,
      this.logCriteria.search,
      this.logCriteria.searchType
    );
    this.logResult.criteria.defaultValue = this.logCriteria.defaultValue;
    // In case of first time report load
    this.logResult.criteria.search = this.logCriteria.searchText;
    this.logReportForm = this.formBuilder.group({
      timeFrame: [this.logResult.criteria.timeFrame, [Validators.required]],
      searchText: this.logResult.criteria.searchText,
      editExpression: this.logResult.criteria.searchText,
      error: this.logResult.criteria.error,
    });
    this.saveLogSearchReport = this.formBuilder.group({
      reportName: [""],
      reportDescription: [""],
    });

    this.findSearchType();
    this.updateFilterSerchTab(this.logResult.criteria.searchText);

    // Set permissions
    this.setPermissions();
  }

  private setPermissions() {
    this.showServiceLogTab = localStorage.getItem(Constants.SERVICE_LOG);
    this.showEventLogTab = localStorage.getItem(Constants.EVENT_LOG);
    this.showApplicationLogTab = localStorage.getItem(
      Constants.APPLICATION_LOG
    );
  }

  private callSearch() {
    if (this.showServiceLogTab) {
      this.callSearchServiceLogs();
    } else if (this.showEventLogTab) {
      this.callSearchEventLogs();
    } else if (this.showApplicationLogTab) {
      this.callSearchApplicationLogs();
    }
  }

  /////////////////////////////////////////////
  // filter search tab change
  /////////////////////////////////////////////
  handleTabChange(e) {
    const index = e.index;
    this.setSerchIndex = index;
    if (this.setSerchIndex === 0) {
      this.logResult.criteria.searchType = "freeText";
    }
    if (this.setSerchIndex === 1) {
      this.logResult.criteria.searchType = "editExpression";
    }
  }

  findSearchType() {
    if (this.logResult.criteria.searchText) {
      this.logResult.criteria.searchType = "editExpression";
      this.selectedEditSearchValue = this.logResult.criteria.searchText;
      this.inputSearchStringEditEx = this.logResult.criteria.searchText;
    } else {
      this.logResult.criteria.searchType = "freeText";
      this.selectedSearchValue = this.logResult.criteria.searchText;
      this.inputSearchString = this.logResult.criteria.searchText;
    }
  }

  updateFilterSerchTab(searchText: string) {
    if (this.logResult.criteria.searchType === "editExpression") {
      this.showEditExpression = true;
      this.setSerchIndex = 1;
      this.editExSearchInputText = searchText;
      if (searchText && searchText.includes(this.freetext)) {
        // Split by '|' and '&' into array
        const freetextstring = searchText.split(/\||\&/);
        // Get freetext expression from array
        let freetextValue = freetextstring.find((x) =>
          x.includes(this.freetext)
        );
        // Get freetext expression value
        freetextValue = freetextValue.slice(
          freetextValue.indexOf(this.freetext) + 9
        );
        this.searchTokan = this.replaceSpecialChars(freetextValue);
      } else {
        this.searchTokan = "";
      }
    } else {
      this.showEditExpression = false;
      this.setSerchIndex = 0;
      this.defaultSearchInputText = searchText;
      if (searchText && this.logResult.criteria.searchType === "freeText") {
        this.searchTokan = this.replaceSpecialChars(searchText);
      } else {
        this.searchTokan = "";
      }
    }
  }

  /**
   * @description ReplaceAll functiona for special characters
   * @param searchText
   */
  private replaceSpecialChars(searchText: string) {
    // Remove double quotes from string to show highlited search string
    if (searchText.startsWith('"') && searchText.endsWith('"')) {
      searchText = searchText.slice(1, searchText.length - 1);
    } else {
      // Remove '*' and '?' only if its not enclosed in doube quotes
      searchText = this.replaceAll(searchText, "*", "");
      searchText = this.replaceAll(searchText, "?", "");
    }

    searchText = this.escapeRegExp(searchText);
    return searchText;
  }

  /* Define function for escaping user input to be treated as
   a literal string within a regular expression */
  private escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* Define functin to find and replace specified term with replacement string */
  private replaceAll(str, term, replacement) {
    return str.replace(new RegExp(this.escapeRegExp(term), "g"), replacement);
  }

  handleDataTabChange(e) {
    const index = e.index;
    const logTabs = this.tabViewList.toArray()[this.tabViewList.length - 1];
    this.selectedHeader = logTabs.tabs[index].header;

    this.setPrimaryTabIndex = index;
    if (this.tabHeaders.Service === this.selectedHeader) {
      this.serviceTabClicked = true;
      this.eventTabClicked = false;
      this.appTabClicked = false;
    } else if (this.tabHeaders.Event === this.selectedHeader) {
      this.serviceTabClicked = false;
      this.eventTabClicked = true;
      this.appTabClicked = false;
      if (!this.eventLogArray) {
        this.callSearchEventLogs();
      }
    } else if (this.tabHeaders.Application === this.selectedHeader) {
      this.serviceTabClicked = false;
      this.eventTabClicked = false;
      this.appTabClicked = true;
      if (!this.applicationLogArray) {
        this.callSearchApplicationLogs();
      }
    }
  }

  get f() {
    return this.logReportForm.controls;
  }
  get form() {
    return this.saveLogSearchReport.controls;
  }
  logReportSearchForm(value: any) { }

  deleteReport(id, tabIndex) {
    this.deleteLogReport.emit({ id: id, index: tabIndex });
    const openTabs = [];
    this.logDataService.selectedLogsAnnounced$.subscribe((result) => {
      openTabs.push(result);
    });
    openTabs.splice(tabIndex, 1);
    this.logDataService.setSelectedLogs(openTabs);
  }

  onRefresh(e) {
    this.setCriteriaAndSearch();
    e.stopPropagation();
  }

  onSubmit() {
    this.setCriteriaAndSearch();
  }

  private setCriteriaAndSearch() {
    delete this.eventLogArray;
    delete this.applicationLogArray;
    delete this.showResult;
    this.pageNo = 1;

    this.getSearchString();
    const aTimeFrame = new ParseTimeFrame(this.f.timeFrame.value);
    this.logResult.criteria.timeFrame = this.f.timeFrame.value;
    this.logResult.criteria.actualTimeFrame = aTimeFrame.displayString;
    this.logResult.criteria.error = this.f.error.value;
    this.logResult.criteria.search = this.searchString;

    this.callSearch();
    this.checkSearchFormUpdate();
    this.setPrimaryTabIndex = 0;
    if (this.setSerchIndex === 0) {
      this.logResult.criteria.searchType = this.selectedSearch.id;
      this.logResult.criteria.searchText = this.inputSearchString;
    } else {
      this.logResult.criteria.searchType = "editExpression";
      this.logResult.criteria.searchText = this.inputSearchStringEditEx;
    }
    this.updateFilterSerchTab(this.logResult.criteria.searchText);
    this.status = false;
  }

  private callSearchServiceLogs() {
    this.showloading = true;
    this.logReportService
      .searchServiceLogs(
        new LogCriteria(
          this.logResult.criteria.id,
          this.logResult.criteria.name,
          this.logResult.criteria.description,
          this.logResult.criteria.search,
          this.logResult.criteria.timeFrame,
          this.logResult.criteria.error,
          this.pageNo,
          "Message",
          this.logResult.criteria.actualTimeFrame,
          null,
          (this.logResult.criteria?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
        )
      )
      .pipe(first())
      .subscribe(
        (report) => {
          if (!this.logResult.result) {
            // in case of error in search
            this.logResult.result = {
              timeFrame: this.logResult.criteria.actualTimeFrame,
              logs: [],
              totalLogs: 0,
            };
          }
          this.setServiceLogResultData(report);
        },
        (error) => {
          this.showloading = false;
          this.logResult.result = {
            timeFrame: this.logResult.criteria.actualTimeFrame,
            logs: [],
            totalLogs: 0,
          };
        }
      );
    this.getServiceLogsCount();
  }

  private getSearchString() {
    if (this.setSerchIndex === 0) {
      this.searchString = this.selectedSearchValue;
    } else if (this.setSerchIndex === 1) {
      this.searchString = this.selectedEditSearchValue;
    }

    if (this.searchString) {
      this.addSpacesAroundOperator();
    }
  }

  private setServiceLogResultData(report: ServiceLogs) {
    this.logResult.result.logs = report.logs;

    this.setLuceneServiceLogsAndCount(report);

    this.showloading = false;
    this.serviceTabClicked = true;
    this.eventTabClicked = false;
    this.appTabClicked = false;
    return report;
  }

  private setLuceneServiceLogsAndCount(report: ServiceLogs) {
    const nodeArray = new LogTree(report, false);
    this.files = nodeArray.files;

    if (this.showResult) {
      // Append result on 'More result' link click
      this.showResult = this.showResult.concat(this.files);
    } else {
      // Initialization on search
      this.showResult = this.files;
    }

    // For better performance: Get total logs count from result if lucene search else give seperate api call
    if (
      this.logResult.criteria.search &&
      this.logResult.criteria.search.includes(this.freetext)
    ) {
      this.totalServiceLogs = report.totalLogs;
    }
    this.checkPaginationItems();
  }

  private getServiceLogsCount() {
    // For better performance: Get total logs count from result if lucene search else give seperate api call
    if (
      !this.logResult.criteria.search ||
      (this.logResult.criteria.search &&
        !this.logResult.criteria.search.includes(this.freetext))
    ) {
      this.loadServiceLogsCount = true;
      this.logReportService
        .getServiceLogsCount(
          new LogCriteria(
            this.logResult.criteria.id,
            this.logResult.criteria.name,
            this.logResult.criteria.description,
            this.logResult.criteria.search,
            this.logResult.criteria.timeFrame,
            this.logResult.criteria.error,
            this.pageNo,
            "Message",
            this.logResult.criteria.actualTimeFrame,
            null,
            (this.logResult.criteria?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
          )
        )
        .subscribe((totalCount) => {
          this.totalServiceLogs = totalCount;
          this.loadServiceLogsCount = false;
          this.checkPaginationItems();
        });
    }
  }

  private checkSearchFormUpdate() {
    if (this.activeTabLogCriteria?.searchText === null) {
      this.activeTabLogCriteria.searchText = "";
    }
    if (this.inputSearchString === null) {
      this.inputSearchString = "";
    }
    if (this.inputSearchStringEditEx === null) {
      this.inputSearchStringEditEx = "";
    }
    // Show save popup only if timeframe / search text / expression is changed
    if (this.logResult.criteria?.searchType === "freeText") {
      if (
        this.activeTabLogCriteria?.timeFrame !== this.f.timeFrame.value ||
        this.activeTabLogCriteria?.searchText !== this.inputSearchString
      ) {
        this.callFormUpdated("true");
      }
    }
    if (this.logResult.criteria?.searchType === "editExpression") {
      if (
        this.activeTabLogCriteria?.timeFrame !== this.f.timeFrame.value ||
        this.activeTabLogCriteria?.searchText !== this.inputSearchStringEditEx
      ) {
        this.callFormUpdated("true");
      }
    }
    // if (this.activeTabLogCriteria.timeFrame !== this.f.timeFrame.value ||
    //   this.activeTabLogCriteria.searchText !== this.inputSearchString ||
    //   this.activeTabLogCriteria.searchText !== this.inputSearchStringEditEx) {
    //   this.callFormUpdated('true');
    //   this.updateLogCriteria.emit({
    //     timeFrame: this.f.timeFrame.value,
    //     searchText: this.inputSearchString ? `${this.selectedSearch?.id}=${this.inputSearchString}` : this.inputSearchStringEditEx ? this.inputSearchStringEditEx : '',
    //     errorOnly: this.f.error.value
    //   });
    // }
  }

  callFormUpdated(value) {
    let updatedTabs = [];
    this.logDataService.updatedTabsAnnounced$.subscribe((result) => {
      updatedTabs = result;
    });
    updatedTabs[this.tabIndex - 1] = value;
    this.logDataService.setUpdatedTabs(updatedTabs);
    this.updateLogCriteria.emit({
      index: this.tabIndex,
      timeFrame: this.f.timeFrame.value,
      searchText: this.inputSearchString
        ? `${this.selectedSearch?.id}=${this.inputSearchString}`
        : this.inputSearchStringEditEx
          ? this.inputSearchStringEditEx
          : "",
      errorOnly: this.f.error.value,
    });
  }

  showDialog() {
    this.display = true;
  }

  getServiceRowData(taskId) {
    const tempTaskId = "taskId=" + taskId;
    this.logReportService
      .getServiceLogByTaskId(
        new LogCriteria(
          null,
          "",
          "",
          tempTaskId,
          "",
          false,
          1,
          "Message",
          "",
          [{
            itemId: this.itemId,
            workspaceId: this.workspaceId,
            itemType: ''
          }],
          (this.logResult.criteria?.defaultValue && Number(this.currentUser?.profileRef) === 1) ? false : true
        )
      )
      .pipe(first())
      .subscribe((report) => {
        const nodeArray = new LogTree(report, true);
        this.selectedRowServiceLog = nodeArray.files;
        if (report.logs && report.logs.length > 0 && !this.selectedLogItem) {
          this.getLogReportItemDetails(nodeArray.data.logs[0].itemId);
        }
      });
  }

  getEventRowData(taskId) {
    const tempTaskId = "taskId=" + taskId;
    this.logReportService
      .getEventLogByTaskId(
        new LogCriteria(
          null,
          "",
          "",
          tempTaskId,
          "",
          false,
          1,
          "Event",
          "",
          [{
            itemId: this.itemId,
            workspaceId: this.workspaceId,
            itemType: ''
          }],
          (this.logResult.criteria?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
        )
      )
      .pipe(first())
      .subscribe((report) => {
        this.selectedRowEventLog = report;
        if (report.logs && report.logs.length > 0 && !this.selectedLogItem) {
          delete this.firstEventLogsCount;
          if (report.totalLogs > report.logs.length) {
            // Show event logs message on popup
            this.firstEventLogsCount = report.logs.length;
          }
          this.getLogReportItemDetails(this.selectedRowEventLog.logs[0].itemId);
        }
      });
  }

  getRowData(taskId: string, itemId: string, workspaceId: string) {
    delete this.selectedLogItem;
    delete this.selectedRowEventLog;
    delete this.selectedRowServiceLog;
    this.taskId = taskId;
    this.itemId = itemId;
    this.workspaceId = workspaceId;
    if (this.taskId) {
      if (this.showEventLogTab) {
        this.getEventRowData(taskId);
      }
      if (this.showServiceLogTab) {
        this.getServiceRowData(taskId);
      }
    }
    this.openPopUp();
  }

  getLogReportItemDetails(itemId) {
    this.logReportService
      .getLogReportItemDetails(itemId)
      .subscribe((result) => {
        this.selectedLogItem = result;
      });
  }

  editReport(logId) {
    this.logReportService.getLogByCardId(logId).subscribe((result) => {
      this.reportsById = result;
    });
    this.showWizard = true;
    this.selectedReportId = logId;
  }

  removeReport(id) {
    this.showModalRemoveLog = true;
  }

  removedLog(id) {
    this.deleteLogReport.emit({ id: id, index: this.tabIndex });
    this.showModalRemoveLog = false;
  }

  cancelRemovedCard() {
    this.showModalRemoveLog = false;
  }

  /**********Validation for timeframe****************** */
  // modal pop up:
  openPopUp() {
    this.showModal = true; //  Show-Hide Modal Check
  }
  closeShowModal() {
    this.showModal = false;
    delete this.selectedRowServiceLog;
    delete this.selectedRowEventLog;
    delete this.selectedLogItem;
  }

  callSearchEventLogs() {
    this.showloading = true;
    this.pageNo = 1;
    this.logReportService
      .searchEventLogs(
        new LogCriteria(
          this.logResult.criteria.id,
          this.logResult.criteria.name,
          this.logResult.criteria.description,
          this.logResult.criteria.search,
          this.logResult.criteria.timeFrame,
          this.logResult.criteria.error,
          this.pageNo,
          "Event",
          this.logResult.criteria.actualTimeFrame,
          null,
          (this.logResult.criteria?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
        )
      )
      .subscribe(
        (report) => {
          this.eventLogArray = report.logs;
          this.totalEventLogs = report.totalLogs;
          delete this.showEventLogResult;
          this.checkPaginationItemsEventLog();
          this.showloading = false;
          this.serviceTabClicked = false;
          this.eventTabClicked = true;
          this.appTabClicked = false;
        },
        (error) => {
          this.showloading = false;
          this.showEventLogResult = [];
        }
      );
  }
  callSearchApplicationLogs() {
    this.showloading = true;
    this.pageNo = 1;
    this.logReportService
      .searchApplicationLogs(
        new LogCriteria(
          this.logResult.criteria.id,
          this.logResult.criteria.name,
          this.logResult.criteria.description,
          this.logResult.criteria.search,
          this.logResult.criteria.timeFrame,
          this.logResult.criteria.error,
          this.pageNo,
          "System",
          this.logResult.criteria.actualTimeFrame,
          null,
          (this.logResult.criteria?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
        )
      )
      .pipe(first())
      .subscribe(
        (report) => {
          this.applicationLogArray = report.logs;
          this.totalApplicationLogs = report.totalLogs;
          delete this.showApplicationLogResult;
          this.checkPaginationItemsApplication();
          this.showloading = false;
          this.serviceTabClicked = false;
          this.eventTabClicked = false;
          this.appTabClicked = true;
          return report;
        },
        (error) => {
          this.showloading = false;
          this.showApplicationLogResult = [];
        }
      );
  }

  /****************************************** */

  public getNextPageEventLog(event): void {
    this.showloading = true;
    this.pageNo++;
    this.logReportService
      .searchEventLogs(
        new LogCriteria(
          this.logResult.criteria.id,
          this.logResult.criteria.name,
          this.logResult.criteria.description,
          this.logResult.criteria.search,
          this.logResult.criteria.actualTimeFrame,
          this.logResult.criteria.error,
          this.pageNo,
          "Event",
          "",
          null,
          (this.logResult.criteria?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
        )
      )
      .subscribe((report) => {
        this.eventLogArray = report.logs;
        this.totalEventLogs = report.totalLogs;
        this.checkPaginationItemsEventLog();
        this.showloading = false;
      });
  }
  public getNextPageApplicationLog(event): void {
    this.showloading = true;
    this.pageNo++;
    this.logReportService
      .searchApplicationLogs(
        new LogCriteria(
          this.logResult.criteria.id,
          this.logResult.criteria.name,
          this.logResult.criteria.description,
          this.logResult.criteria.search,
          this.logResult.criteria.actualTimeFrame,
          this.logResult.criteria.error,
          this.pageNo,
          "System",
          "",
          null,
          (this.logResult.criteria?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
        )
      )
      .pipe(first())
      .subscribe((report) => {
        this.applicationLogArray = report.logs;
        this.totalApplicationLogs = report.totalLogs;
        this.checkPaginationItemsApplication();
        this.showloading = false;
        return report;
      });
  }

  public getNextPageServiceLog(event): void {
    this.showloading = true;
    this.pageNo++;
    this.logReportService
      .searchServiceLogs(
        new LogCriteria(
          this.logResult.criteria.id,
          this.logResult.criteria.name,
          this.logResult.criteria.description,
          this.logResult.criteria.search,
          this.logResult.criteria.timeFrame,
          this.logResult.criteria.error,
          this.pageNo,
          "Message",
          this.logResult.criteria.actualTimeFrame,
          null,
          (this.logResult.criteria?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
        )
      )
      .pipe(first())
      .subscribe((report) => {
        this.setLuceneServiceLogsAndCount(report);
        this.showloading = false;
        return report;
      });
    this.getServiceLogsCount();
  }

  checkPaginationItemsApplication() {
    if (this.showApplicationLogResult) {
      // Append result on 'More result' link click
      this.showApplicationLogResult = this.showApplicationLogResult.concat(
        this.applicationLogArray
      );
    } else {
      // Initialization on search
      this.showApplicationLogResult = this.applicationLogArray;
    }

    if (
      this.showApplicationLogResult.length > 0 &&
      this.totalApplicationLogs > this.showApplicationLogResult.length
    ) {
      this.activeMoreApplicationLogResults = true;
    } else {
      this.activeMoreApplicationLogResults = false;
    }
  }

  checkPaginationItemsEventLog() {
    if (this.showEventLogResult) {
      // Append result on 'More result' link click
      this.showEventLogResult = this.showEventLogResult.concat(
        this.eventLogArray
      );
    } else {
      // Initialization on search
      this.showEventLogResult = this.eventLogArray;
    }

    if (
      this.showEventLogResult.length > 0 &&
      this.totalEventLogs > this.showEventLogResult.length
    ) {
      this.activeMoreEventLogResults = true;
    } else {
      this.activeMoreEventLogResults = false;
    }
  }

  checkPaginationItems() {
    if (
      this.showResult &&
      this.showResult.length > 0 &&
      this.totalServiceLogs > this.showResult.length
    ) {
      this.activeMoreServiceLogResults = true;
    } else {
      this.activeMoreServiceLogResults = false;
    }
  }
  //////////////////////////////////////////////////////////////

  toggleFilterVisibility() {
    this.status = !this.status;
  }

  onTimeFrameBlur($event) {
    this.dirtyField = true;

    if ($event.isValid) {
      this.logReportForm.controls["timeFrame"].setErrors({ valid: null });
      this.logReportForm.controls["timeFrame"].updateValueAndValidity();
    } else {
      this.logReportForm.controls["timeFrame"].setErrors({ valid: false });
    }
  }

  onSearchTextBlur($event) {
    this.dirtyField = true;
    this.searchString = $event;
    if ($event.isValid) {
      this.logReportForm.controls["searchText"].setErrors({ valid: null });
      this.logReportForm.controls["searchText"].updateValueAndValidity();
    } else {
      this.logReportForm.controls["searchText"].setErrors({ valid: false });
    }
  }

  onEditExpressionBlur($event) {
    this.selectedEditSearchValue = $event.searchInputValue;
    this.inputSearchStringEditEx = $event.searchInputValue;
    if ($event.isValid) {
      this.logReportForm.controls["editExpression"].setErrors({ valid: null });
      this.logReportForm.controls["editExpression"].updateValueAndValidity();
    } else {
      this.logReportForm.controls["editExpression"].setErrors({ valid: false });
    }
  }
  getSearchType($event) {
    this.selectedSearch = $event;
  }
  getSearchValue($event) {
    this.selectedSearchValue = $event;
  }
  getEditSearchValue($event) {
    this.selectedEditSearchValue = $event;
  }
  getInputSearchString($event) {
    this.defaultSearchInputText = $event;
    this.inputSearchString = $event;
  }
  getWizardPopUpStatus(e) {
    this.showWizard = e.status;
    delete this.reportsById;
    delete this.selectedReportId;
    if (e.details) {
      this.messageService.add({
        key: "stepKey",
        severity: "success",
        summary: e.name,
        detail: e.details,
      });

      // Send new criteria to parent (log dasboard component)
      this.updateTabName.emit({
        tabName: e.name,
        tabDesc: e.description,
        timeFrame: e.timeFrame,
        searchText: e.searchText,
        id: e.id,
        errorOnly: e.errorOnly,
      });
    }
  }

  addSpacesAroundOperator() {
    this.searchString = this.searchString
      .split("|")
      .join(" | ")
      .split("&")
      .join(" & ");
  }

  textcheck(event) { }
}
