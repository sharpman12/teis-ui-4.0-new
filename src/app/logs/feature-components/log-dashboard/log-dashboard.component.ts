import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ElementRef,
} from "@angular/core";
import { LogResult } from "../../../core/model/log/logResult";
import { ActivatedRoute, Router } from "@angular/router";
import { first, take } from "rxjs/operators";
import { LogCriteria } from "../../../core/model/log/LogCriteria";
import { Report } from "../../../core/model/log/Report";
import { HeaderService } from "../../../core/service/header.service";
import { BreadCrumbService } from "../../../core/service/breadcrumb.service";
import { LogReportService } from "../../../core/service/logreport.service";
import { LogService } from "../../../core/service/log.service";
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { LogDataService } from "../../../core/service/state/log-data.service";
import { Item } from "../../../core/model/log/Item";
import { ProgressiveLoaderService } from "../../../core/service/progressiveloader.service";
import { ParseTimeFrame } from "src/app/shared/components/filter/adapter/parseTimeFrame";
import { Duplicate } from "src/app/shared/validation/duplicate.validators";
import { SharedService } from "src/app/shared/services/shared.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Constants } from "src/app/shared/components/constants";

@Component({
  selector: "app-log-dashboard",
  templateUrl: "./log-dashboard.component.html",
  styleUrls: ["./log-dashboard.component.scss"],
})
export class LogDashboardComponent implements OnInit {
  public selectedTabIndex: any = 0;
  @ViewChildren(LogCriteria) tabChildren: QueryList<LogCriteria>;

  public openLogsCard: LogResult = <any>{};

  public tempObj = {
    name: "Log",
    id: -1,
    defaultValue: false,
    description: "",
    error: false,
    searchText: "",
    timeFrame: ""
  };
  public openLogsCards = [this.tempObj];
  public isFormSubmitted: any[];
  public duplicateReport = false;
  saveLogSearchReport: UntypedFormGroup;
  public message;
  indexTab: number;
  showWizard: boolean;
  showEditWizard: boolean;
  reportsById: LogResult;
  selectedReportId: number;
  selectedLogCardId: any;
  selectedReport: {
    name: string;
    id: number;
    defaultValue: boolean;
    description: string;
  };
  cards: Report[] = [];
  cardName: string[] = [];
  logResult: LogResult = <any>{};
  showModal: boolean;
  content: string;
  title: string;
  deleteIndex: number;
  public workSpaces: Item[];
  logCriteria: LogCriteria;
  activeTabLogCriteria: any = null;
  updatedSearchLogCriteria: any = null;
  isNewReport = false;

  validationMessages = {
    reportType: {
      required: "Type is required",
    },
    reportName: {
      required: "Report name is required",
      hasDuplicate: "Duplicate report name",
    },
    reportDescription: {
      required: "Description is required",
    },
  };

  formErrors = {
    reportType: "",
    reportName: "",
    reportDescription: "",
  };

  currentUser: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public header: HeaderService,
    public breadcrumb: BreadCrumbService,
    private logReportService: LogReportService,
    private formBuilder: UntypedFormBuilder,
    private messageService: MessageService,
    private logService: LogService,
    private el: ElementRef,
    private logDataService: LogDataService,
    public sharedService: SharedService,
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit() {
    this.getCards();
    this.checkOpenLogs();
    this.workSpaces = this.route.snapshot.data.workspaces;
    this.createForm();
    this.selectedTabIndex = "0";
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem("source") || this.router.url === '/logs') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.breadcrumb.visible = false;
    // this.header.show();
    // this.breadcrumb.previous();
    // this.breadcrumb.hide();
  }

  createForm() {
    this.saveLogSearchReport = this.formBuilder.group({
      reportType: [
        { value: "existingReport", disabled: false },
        {
          validators: [],
        },
      ],
      reportName: [
        { value: "", disabled: false },
        {
          validators: [
            Validators.required,
            Duplicate.DuplicateValidator(this.cardName, { hasDuplicate: true }),
          ],
        },
      ],
      reportDescription: [
        { value: "", disabled: false },
        {
          validators: [],
        },
      ],
    });
    this.saveLogSearchReport.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.saveLogSearchReport);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.saveLogSearchReport): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = "";
        if (
          abstractControl &&
          !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty)
        ) {
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

  getCards() {
    this.logService.getCards().subscribe((cards) => {
      this.cards = cards;
      this.cards.map((cName) => {
        this.cardName.push(cName.name);
      });
      // this.sequentialApiCall(0);

      // Define this method for get all logs reports card simultaneously
      if (this.cards?.length) {
        this.cards.forEach((x, i, arr) => {
          this.getLogsReportCounts(x, i);
        });
      }
    });
  }

  get f() {
    return this.saveLogSearchReport.controls;
  }

  resetForm() {
    this.saveLogSearchReport.reset();
  }

  /////////////////////////////////////////////////////
  // refresh Cards continuous
  /////////////////////////////////////////////////////

  sequentialApiCall(index): void {
    if (index >= this.cards.length) {
      // Stop
    }
    if (this.cards[index]) {
      this.cards[index].loadCardStatus = true;
      const criteria = new LogCriteria(
        this.cards[index].id,
        this.cards[index].name,
        this.cards[index].description,
        this.cards[index].searchText,
        this.cards[index].timeFrame,
        this.cards[index].error,
        1,
        "Message",
        "",
        this.cards[index].items,
        (this.cards[index]?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
      );
      this.logService.refreshLogById(this.cards[index].id, criteria).subscribe((result) => {
        this.cards[index].errorCount = result.errorCount;
        this.cards[index].avail = result.avail;
        this.cards[index].loadCardStatus = false;
        this.sequentialApiCall(index + 1);
      });
    }
  }

  // Define this method for get all logs reports card simultaneously
  getLogsReportCounts(report: any, index: number = 0) {
    this.cards[index].loadCardStatus = true;
    const criteria = new LogCriteria(
      this.cards[index].id,
      this.cards[index].name,
      this.cards[index].description,
      this.cards[index].searchText,
      this.cards[index].timeFrame,
      this.cards[index].error,
      1,
      "Message",
      "",
      this.cards[index].items,
      (this.cards[index]?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
    );
    this.logService.getLogsReportCountsById(report?.id, criteria).subscribe(res => {
      this.cards[index].errorCount = res.errorCount;
      this.cards[index].avail = res.avail;
      this.cards[index].loadCardStatus = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  refreshLogCard(card) {
    card.loadCardStatus = true;
    const criteria = new LogCriteria(
      card.id,
      card.name,
      card.description,
      card.searchText,
      card.timeFrame,
      card.error,
      1,
      "Message",
      "",
      card.items,
      (card?.defaultValue && Number(this.currentUser?.profileRef) === 11) ? false : true
    );
    this.logService.refreshLogById(card.id, criteria).subscribe((result) => {
      card.errorCount = result.errorCount;
      card.avail = result.avail;
      card.loadCardStatus = false;
    });
  }
  ////////////////////////////////////////////////////////////
  // Top heder tabs scrolling and navigation through tabs
  ////////////////////////////////////////////////////////////
  activeTab($event) {
    this.selectedTabIndex = $event.index;
    const el = this.el.nativeElement.querySelector(".ui-tabview-nav");
    const el1 = this.el.nativeElement.querySelector(".ui-state-default");
    el.scrollLeft = this.selectedTabIndex * el1.offsetWidth;
    this.setIndex($event.index);
  }
  next() {
    if (this.selectedTabIndex < this.openLogsCards.length - 1) {
      this.selectedTabIndex = this.selectedTabIndex + 1;
    }
    const el = this.el.nativeElement.querySelector(".ui-tabview-nav");
    const el1 = this.el.nativeElement.querySelector(".ui-state-default");
    el.scrollLeft += el1.offsetWidth;
    this.setIndex(this.selectedTabIndex);
  }

  prev() {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex = this.selectedTabIndex - 1;
    }
    const el = this.el.nativeElement.querySelector(".ui-tabview-nav");
    const el1 = this.el.nativeElement.querySelector(".ui-state-default");
    el.scrollLeft -= el1.offsetWidth;
    this.setIndex(this.selectedTabIndex);
  }

  refreshCards() {
    this.logService.getCards().subscribe((cards) => {
      this.cards = cards;
      // this.sequentialApiCall(0);

      // Define this method for get all logs reports card simultaneously
      if (this.cards?.length) {
        this.cards.forEach((x, i, arr) => {
          this.getLogsReportCounts(x, i);
        });
      }
    });
  }

  /////////////////////////////////////////////
  // actions from card select/ delete
  // Remove cards initiated from hamburger menu
  /////////////////////////////////////////////
  receiveSelectedCard($event) {
    this.selectedLogCardId = $event.card.id;
    const aTimeFrame = new ParseTimeFrame($event.card.timeFrame);
    this.logCriteria = new LogCriteria(
      $event.card.id,
      $event.card.name,
      $event.card.description,
      $event.card.searchText,
      $event.card.timeFrame,
      $event.card.error,
      1,
      "Message",
      aTimeFrame.displayString,
      $event.card.items,
      false,
      0,
      "",
      "freeText"
    );
    this.logCriteria.defaultValue = $event.card.defaultValue;
    this.openLogsCards.push(this.logCriteria);
    this.setIndex(this.openLogsCards.length - 1);
    this.addTabItem(this.logCriteria);
  }

  receiveDeleteCard($event) {
    const id = $event.id;
    const index = $event.index;
    this.logReportService.deleteReport(id).subscribe((result) => {
      this.cards.splice(index, 1);
      this.messageService.add({
        key: "stepKey",
        severity: "success",
        summary: this.f.reportName.value,
        detail: "Log report deleted successfully!!",
      });
    });
  }
  /////////////////////////////////////////////
  // Remove cards initiated from Log report page
  /////////////////////////////////////////////

  removeLogCard($event) {
    const id = $event.id;
    const index = $event.index;
    this.removeTabItem(index, id);
  }

  ///////////////////////////////////////////////////////
  // open cards on rerouting
  ///////////////////////////////////////////////////////

  public processData(index, data): void {
    if (index >= data.length) {
    } else {
      this.logReportService
        .searchServiceLogs(
          new LogCriteria(
            data[index].id,
            data[index].name,
            data[index].description,
            data[index].search,
            data[index].actualTimeFrame,
            data[index].error,
            1,
            "Message",
            "",
            data[index].items,
            true
          )
        )
        .subscribe(
          (resp) => {
            if (resp) {
              this.openLogsCards.push(data[index]);
              this.processData(parseInt(index, 10) + 1, data);
            }
          },
          (err) => { }
        );
    }
  }

  checkLocalSt() {
    let noOpenTab;
    this.logDataService.selectedLogsAnnounced$.subscribe((result) => {
      noOpenTab = result;
    });
    this.processData(0, noOpenTab);
  }

  checkOpenLogs() {
    let noOpenTab;
    this.logDataService.selectedLogsAnnounced$.subscribe((result) => {
      noOpenTab = result;
    });
    if (noOpenTab.length > 0 && noOpenTab[0] !== undefined) {
      this.checkLocalSt();
    }
  }

  ///////////////////////////////////////////////////
  // pop up appers on tab close button click
  //////////////////////////////////////////////////

  onKeyReportName($event) {
    const reportName = $event.target.value;
    if (this.cardName.indexOf(reportName.trim()) > -1) {
      this.duplicateReport = true;
    } else {
      this.duplicateReport = false;
    }
  }

  updateLogCriteria(e, tabIndex) {
    if (this.openLogsCards?.length) {
      this.openLogsCards.forEach((item, i, arr) => {
        if (Number(i) === Number(e?.index)) {
          item.timeFrame = e?.timeFrame;
          item.searchText = e?.searchText;
          item.error = e?.errorOnly;
        }
      });
    }
    // this.updatedSearchLogCriteria = e;
  }

  saveReport(content, e) {
    const index = content;
    let openTabs;
    this.logDataService.selectedLogsAnnounced$.subscribe((result) => {
      openTabs = result;
    });
    const selectedTab = openTabs[index - 1];
    let updatedLogCriteria = null;
    updatedLogCriteria = this.openLogsCards.find((obj, i) => (Number(i) === Number(index)));
    this.logReportService
      .createReport(
        new Report(
          null,
          this.f.reportName.value,
          this.f.reportDescription.value,
          updatedLogCriteria.searchText,
          updatedLogCriteria.timeFrame,
          0,
          updatedLogCriteria.error,
          selectedTab.items,
          false
        )
      )
      .pipe(first())
      .subscribe((report) => {
        this.refreshCards();
        this.messageService.add({
          key: "logKey",
          severity: "success",
          summary: this.f.reportName.value,
          detail: "Log created Successfully!",
        });
      });
    this.openLogsCards.splice(index, 1);
    this.closeTabItem(index);
    this.removeUpdatedTabItem(index - 1);
    this.hide();
    this.resetForm();
    // this.refreshCards();
  }

  updateReport(content, e) {
    const index = content;
    let openTabs;
    this.logDataService.selectedLogsAnnounced$.subscribe((result) => {
      openTabs = result;
    });

    const selectedTab = openTabs[index - 1];
    let updatedLogCriteria = null;
    updatedLogCriteria = this.openLogsCards.find((obj, i) => (Number(i) === Number(index)));
    this.logReportService
      .updateReport(
        new Report(
          selectedTab?.id,
          this.f.reportName.value,
          this.f.reportDescription.value,
          updatedLogCriteria.searchText,
          updatedLogCriteria.timeFrame,
          0,
          updatedLogCriteria.error,
          selectedTab.items,
          false
        )
      )
      .pipe(first())
      .subscribe((report) => {
        this.refreshCards();
        this.messageService.add({
          key: "logKey",
          severity: "success",
          summary: this.f.reportName.value,
          detail: "Log updated Successfully!",
        });
      });
    this.openLogsCards.splice(index, 1);
    this.closeTabItem(index);
    this.removeUpdatedTabItem(index - 1);
    this.hide();
    this.resetForm();
    // this.refreshCards();
  }

  cancelReport(tabIndex) {
    this.hide();
    this.resetForm();
    this.openLogsCards.splice(tabIndex, 1);
    this.closeTabItem(tabIndex);
    this.removeUpdatedTabItem(tabIndex - 1);
  }

  hide() {
    this.resetForm();
    this.showModal = false;
  }

  show(i) {
    const index = i;
    this.showModal = true;
    this.content = index;
  }

  ////////////////////////////////////////////
  // tab close
  ////////////////////////////////////////////
  handleClose(e) {
    const index = e.index;
    const openTabIndex = index - 1;
    let updatedTabs = [];
    this.logDataService.updatedTabsAnnounced$.subscribe((result) => {
      updatedTabs = result;
    });
    // updated tabs will show pop up
    if (updatedTabs[openTabIndex] === "true") {
      if (this.openLogsCards?.length) {
        this.openLogsCards.forEach((item, i, arr) => {
          setTimeout(() => {
            if (i === index) {
              this.selectedReport = item;
              if (item?.defaultValue) {
                this.isNewReport = true;
                this.saveLogSearchReport.get("reportType").disable();
                this.saveLogSearchReport.patchValue({
                  reportType: "newReport",
                  reportName: "",
                  reportDescription: "",
                });
                this.saveLogSearchReport.get("reportName").enable();
              } else {
                this.isNewReport = false;
                this.saveLogSearchReport.get("reportType").enable();
                this.saveLogSearchReport.patchValue({
                  reportType: "existingReport",
                  reportName: item?.name,
                  reportDescription: item?.description,
                });
                this.saveLogSearchReport.get("reportName").disable();
              }
            }
          }, 0);
        });
      }
      this.show(index);
    } else {
      this.openLogsCards.splice(index, 1);
      this.closeTabItem(index);
      this.removeUpdatedTabItem(index - 1);
    }
  }

  onChangeReportType() {
    const reportType = this.saveLogSearchReport.get("reportType").value;
    if (reportType === "existingReport") {
      this.isNewReport = false;
      this.saveLogSearchReport.patchValue({
        reportName: this.selectedReport?.name,
        reportDescription: this.selectedReport?.description,
      });
      this.saveLogSearchReport.get("reportName").disable();
    } else {
      this.isNewReport = true;
      this.saveLogSearchReport.patchValue({
        reportName: "",
        reportDescription: "",
      });
      this.saveLogSearchReport.get("reportName").enable();
    }
  }

  //////////////////////////////////////////////////////////
  // shared service update
  /////////////////////////////////////////////////////////
  addTabItem(criteria) {
    let openTabs = [];
    let index: number;
    this.logDataService.selectedLogsAnnounced$.subscribe((result) => {
      openTabs = result;
    });
    openTabs.push(criteria);
    index = openTabs.length;
    this.logDataService.setSelectedLogs(openTabs);
    this.setIndex(index);
    this.addUpdatedTabItem("false");
  }

  removeTabItem(index, id) {
    let openTabs = [];
    const i = index - 1;
    this.logReportService.deleteReport(id).subscribe((result) => {
      this.logDataService.selectedLogsAnnounced$.subscribe((resultTabs) => {
        openTabs = resultTabs;
      });
      openTabs.splice(i, 1);
      this.logDataService.setSelectedLogs(openTabs);
      this.setIndex(i);

      this.openLogsCards.splice(index, 1);
      this.cards.splice(
        this.cards.findIndex(function (card) {
          return card.id === id;
        }),
        1
      );
      this.messageService.add({
        key: "stepKey",
        severity: "success",
        summary: this.f.reportName.value,
        detail: "Log report deleted successfully!!",
      });
    });
  }

  closeTabItem(index) {
    let openTabs = [];
    const i = index - 1;
    this.logDataService.selectedLogsAnnounced$.subscribe((result) => {
      openTabs = result;
    });
    openTabs.splice(i, 1);
    this.logDataService.setSelectedLogs(openTabs);
    this.setIndex(i);
  }

  getSelectedTabs(): any {
    this.logDataService.selectedLogsAnnounced$.subscribe((result) => {
      return result;
    });
  }

  addUpdatedTabItem(value) {
    let updatedTabs = [];
    this.logDataService.updatedTabsAnnounced$.subscribe((result) => {
      updatedTabs = result;
    });
    updatedTabs[this.selectedTabIndex - 1] = value;
    this.logDataService.setUpdatedTabs(updatedTabs);
  }

  removeUpdatedTabItem(index) {
    let updatedTabs = [];
    this.logDataService.updatedTabsAnnounced$.subscribe((result) => {
      updatedTabs = result;
    });
    updatedTabs.splice(index, 1);
    this.logDataService.setUpdatedTabs(updatedTabs);
  }

  setIndex(e) {
    this.selectedTabIndex = e;
    this.logDataService.setActiveTabIndex(e);
    if (this.openLogsCards?.length) {
      this.openLogsCards.forEach((item, i, arr) => {
        if (Number(e) === Number(i)) {
          this.activeTabLogCriteria = item;
        }
      });
    }
  }
  ////////////////////////////////////////////////////////////////////
  // Pop Up wizard
  ////////////////////////////////////////////////////////////////////
  createWizard() {
    this.showWizard = true;
  }

  getWizardPopUpStatus(e) {
    this.showWizard = e.status;
    if (e.details) {
      this.messageService.add({
        key: "stepKey",
        severity: "success",
        summary: e.name,
        detail: e.details,
      });
      this.refreshCards();
    }
  }

  getEditWizardPopUpStatus(e) {
    this.showEditWizard = e.status;
    if (e.details) {
      this.messageService.add({
        key: "stepKey",
        severity: "success",
        summary: e.name,
        detail: e.details,
      });
      this.refreshCards();
    }
  }

  getEditCardId(e: number) {
    this.logReportService.getLogByCardId(e).subscribe((result) => {
      this.reportsById = result;
      this.showEditWizard = true;
      this.selectedReportId = e;
    });
  }

  updateTabName(e, tabNumber) {
    this.logCriteria = new LogCriteria(
      e.id,
      e.tabName,
      e.tabDesc,
      e.searchText,
      e.timeFrame,
      e.errorOnly,
      1,
      "Message",
      new ParseTimeFrame(e.timeFrame).displayString,
      null,
      false,
      0,
      "",
      "freeText"
    );
    this.logCriteria.defaultValue = false;
    this.openLogsCards.splice(tabNumber, 1, this.logCriteria);
    this.refreshCards();
  }
}
