import { HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  Output, EventEmitter
} from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { TreeNode } from "primeng/api";
import { BreadCrumbService } from "../../core/service/breadcrumb.service";
import { HeaderService } from "../../core/service/header.service";
import { SharedService } from "../../shared/services/shared.service";
import { AppIntegrationService } from "./app-integration.service";
import { AppliedFilters, TaskDetailsDto, Workspace } from "./appintegration";
import { Appintitemtree } from "./appintitemtree";
import { EditWorkspaceComponent } from "./edit-workspace/edit-workspace.component";
import { GlobalParametersComponent } from "./global-parameters/global-parameters.component";
import { IntegrationComponent } from "./integration/integration.component";
import { NetUserComponent } from "./net-user/net-user.component";
import { SearchItemComponent } from "./search-item/search-item.component";
import { ProcessComponent } from "./process/process.component";
import { TriggerComponent } from "./trigger/trigger.component";
import { AppIntegrationDataService } from "./app-integration-data.service";
import { Subscription, fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, map, take } from "rxjs/operators";
import { Constants } from "src/app/shared/components/constants";
import { Router } from "@angular/router";
import { AppIntServicesComponent } from "./app-int-services/app-int-services.component";

@Component({
  selector: "app-app-integration",
  templateUrl: "./app-integration.component.html",
  styleUrls: ["./app-integration.component.scss"],
})
export class AppIntegrationComponent implements OnInit, OnDestroy {
  selectedWorkspace: any;
  activeTab: number = 0;
  workspaces: Array<Workspace> = [];
  currentTabIndex = 0;
  searchIntItem: string;
  isSearching: boolean = false;
  searchItemText: string = "";
  selectedWorkspaceId: number;
  existedSelectedWorkspaceId: number;
  deployed: boolean = false;
  disabled: boolean = false;
  locked: boolean = false;
  showAll: boolean = true;
  searchInNameAndDesc: boolean = false;
  currentUser: any;
  workspaceInfo: any = null;
  isCRUDGlobalParamsAccess: boolean = false;
  isCRUDNetUserWithTestAccess: boolean = false;
  isCRUDWorkspaceAccess: boolean = false;
  selectedProcess: Object;
  schedulerDisabled: boolean = false;
  webServiceDisabled: boolean = false;
  showSearchItemPerTab: any = {
    0: true,  // Integration tab
    1: true,  // Process tab
    2: true,  // Trigger tab
    3: true   // Webservice tab
  };

  @ViewChild("searchPITTreeItem") searchPITTreeItem: ElementRef;
  @ViewChild(IntegrationComponent, { static: false })
  integrationComponent: IntegrationComponent;
  @ViewChild(ProcessComponent, { static: false })
  processComponent: ProcessComponent;
  @ViewChild(TriggerComponent, { static: false })
  triggerComponent: TriggerComponent;
  @ViewChild(AppIntServicesComponent, { static: false })
  appIntServicesComponent: AppIntServicesComponent;

  // Show confirmation dialog when reload the page
  private unloadCallback = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = ''; // This triggers the confirmation popup
  };

  getWorkspacesSub = Subscription.EMPTY;
  getWorkspaceDetailsSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  get schedulerInfoMessage(): string {
    if (this.schedulerDisabled && !this.webServiceDisabled) {
      return 'Schedulers and Alarms are disabled';
    } else if (this.schedulerDisabled && this.webServiceDisabled) {
      return 'Schedulers, Alarms and Web Services are disabled';
    } else if (!this.schedulerDisabled && this.webServiceDisabled) {
      return 'Web Services are disabled';
    } else {
      return '';
    }
  }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem("source") || this.router.url === '/application_integration') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.breadcrumb.hide();

    if (this.router.url.includes("application_integration/properties") || this.router.url.includes("application_integration/item")) {
      // Show confirmation dialog when reload the page
      window.addEventListener('beforeunload', this.unloadCallback);
    } else {
      // Remove event Show confirmation dialog when reload the page
      window.removeEventListener('beforeunload', this.unloadCallback);
    }


    if (localStorage.getItem(Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS)) {
      this.isCRUDGlobalParamsAccess = true;
    } else {
      this.isCRUDGlobalParamsAccess = false;
    }

    if (localStorage.getItem(Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST)) {
      this.isCRUDNetUserWithTestAccess = true;
    } else {
      this.isCRUDNetUserWithTestAccess = false;
    }

    if (localStorage.getItem(Constants.OPEN_UPDATE_WORKSPACE)) {
      this.isCRUDWorkspaceAccess = true;
    } else {
      this.isCRUDWorkspaceAccess = false;
    }

    this.sharedService.isChangeBgColor.next(true);
    // this.getActiveWorkspaces();
    this.appIntegrationService.returnFromOtherPage.pipe(take(1)).subscribe((isBack) => {
      if (isBack) {
        this.existedSelectedWorkspaceId = null;
        const existedFilters: AppliedFilters = this.appIntegrationDataService.getAppliedFilters();
        this.existedSelectedWorkspaceId = existedFilters?.selectedWorkspace;
        this.activeTab = existedFilters?.currentTab;
        this.currentTabIndex = existedFilters?.currentTab;
        this.searchIntItem = existedFilters?.searchTerm;
        this.deployed = existedFilters?.undeployed;
        this.disabled = existedFilters?.disabled;
        this.locked = existedFilters?.locked;
        if (!this.deployed || this.disabled || this.locked) {
          this.showAll = false;
        } else {
          this.showAll = true;
        }
        // this.onChangeWorkspace(existedFilters?.selectedWorkspace);
        this.getActiveWorkspaces(this.existedSelectedWorkspaceId, isBack);
      } else {
        this.getActiveWorkspaces(null);
      }
    });
  }

  ngAfterViewInit() {
    /*------------ Search Workspace Item ------------*/
    const searchTerm = fromEvent<any>(
      this.searchPITTreeItem.nativeElement,
      "keyup"
    ).pipe(
      map((event) => {
        // event.target.value === "" ? this.isSearching = true : this.isSearching = false;
        return event.target.value;
      }),
      debounceTime(500),
      distinctUntilChanged()
    );
    searchTerm.subscribe((txt) => {

      if (txt === "") {
        this.clearSearchItems();
      }
    });
  }

  /*=============== Clear search Items ===============*/
  clearSearchItems() {
    this.resetSearch(true);
    if (Number(this.currentTabIndex) === 0) {
      this.appIntegrationDataService.clearIntegrationItemTree();
      this.integrationComponent.reinitiateIntegrationProperties();
      this.integrationComponent.showFilterView();
      // this.integrationComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      this.isSearching = false;
    }
    if (Number(this.currentTabIndex) === 1) {
      this.appIntegrationDataService.clearProcessItemTree();
      this.processComponent.reinitiateProcessProperties();
      this.processComponent.showFilterView();
      //this.processComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      this.isSearching = false;
    }
    if (Number(this.currentTabIndex) === 2) {
      this.appIntegrationDataService.clearTriggerItemTree();
      this.triggerComponent.reinitiateTriggerProperties();
      this.triggerComponent.showFilterView();
      // this.triggerComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      this.isSearching = false;
    }
  }

  /*=============== Search PIT Item In Tree ===============*/
  searchPITItem(searchTxt: string) {
    this.isSearching = true;
    if (searchTxt !== "") {
      this.searchItemText = searchTxt;
      this.searchInNameAndDesc = true;
      this.showAll = false;

      if (Number(this.currentTabIndex) === 0) {
        this.appIntegrationDataService.storeIntSearchItem(searchTxt);
        this.appIntegrationDataService.clearIntegrationItemTree();
        this.integrationComponent.reinitiateIntegrationProperties();
        // this.integrationComponent.getWorkspaceTree(this.getWorkspaceTreeObj, true, false, false);
        this.integrationComponent.getIntegrationTree(this.getWorkspaceTreeObj, true, false, false);
        this.integrationComponent.intSearchItemExist();
        this.isSearching = false;
      }
      if (Number(this.currentTabIndex) === 1) {
        this.appIntegrationDataService.storeProcessSearchItem(searchTxt);
        this.appIntegrationDataService.clearProcessItemTree();
        this.processComponent.reinitiateProcessProperties();
        // this.processComponent.getWorkspaceTree(this.getWorkspaceTreeObj, true, false, false);
        this.processComponent.getProcessTree(this.getWorkspaceTreeObj, true, false, false);
        this.processComponent.processSearchItemExist();
        this.isSearching = false;
      }
      if (Number(this.currentTabIndex) === 2) {
        this.appIntegrationDataService.storeTriggerSearchItem(searchTxt);
        this.appIntegrationDataService.clearTriggerItemTree();
        this.triggerComponent.reinitiateTriggerProperties();
        // this.triggerComponent.getWorkspaceTree(this.getWorkspaceTreeObj, true, false, false);
        this.triggerComponent.getTriggerTree(this.getWorkspaceTreeObj, true, false, false);
        this.triggerComponent.triggerSearchItemExist();
        this.isSearching = false;
      }
    }
  }

  handleChange(index: number) {
    this.currentTabIndex = index;
    this.resetSearch(true);

    if (index === 0) {
      const searchItem = this.appIntegrationDataService.getIntSearchItem();
      if (searchItem) {
        this.searchIntItem = searchItem;
        this.searchItemText = searchItem;
      }
      // this.integrationComponent.toggleLinkVisibility();
      // this.integrationComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      this.integrationComponent.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
    }
    if (index === 1) {
      const searchItem = this.appIntegrationDataService.getProcessSearchItem();
      if (searchItem) {
        this.searchIntItem = searchItem;
        this.searchItemText = searchItem;
      }
      //this.processComponent.toggleLinkVisibility();
      // this.processComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      this.processComponent.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
    }
    if (index === 2) {
      const searchItem = this.appIntegrationDataService.getTriggerSearchItem();
      if (searchItem) {
        this.searchIntItem = searchItem;
        this.searchItemText = searchItem;
      }
      // this.triggerComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      this.triggerComponent.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
    }
    if (index === 3) {
      this.appIntServicesComponent.getWebServices(this.getWorkspaceTreeObj);
    }
  }

  /*============== Get Active Workspace ===========*/
  getActiveWorkspaces(selectedWsId: number, isBack?: Boolean) {
    let defaultWorkspaceId: number = null;
    const workspaces = this.appIntegrationDataService.getWorkspaces();
    if (workspaces?.length) {
      this.workspaces = workspaces;
      this.workspaces.forEach((item) => {
        if (item?.defaultWorkspace) {
          defaultWorkspaceId = Number(item?.id);
        }
      });
      if (selectedWsId) {
        this.onChangeWorkspace(selectedWsId, isBack);
      } else {
        this.onChangeWorkspace(defaultWorkspaceId ? defaultWorkspaceId : Number(this.workspaces[0]?.id), isBack);
      }
    } else {
      this.getWorkspacesSub = this.appIntegrationService.getWorkspacesByUsername(this.currentUser?.userName).subscribe((res) => {
        if (res?.length) {
          // Filter out archived workspaces
          const workspacesArr = JSON.parse(JSON.stringify(res)).filter((x) => !x?.archived);
          this.workspaces = workspacesArr;
          this.appIntegrationDataService.storeWorkspaces(this.workspaces);
          if (this.workspaces?.length) {
            this.workspaces.forEach((item) => {
              if (item?.defaultWorkspace) {
                defaultWorkspaceId = Number(item?.id);
              }
            });
            if (selectedWsId) {
              this.onChangeWorkspace(selectedWsId, isBack);
            } else {
              this.onChangeWorkspace(defaultWorkspaceId ? defaultWorkspaceId : Number(this.workspaces[0]?.id), isBack);
            }
          }
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============== END Get Active Workspace ===========*/

  /*============== Get Workspace Information ===========*/
  getWorkspaceInfo(workspaceIds: Array<any>) {
    this.getWorkspaceDetailsSub = this.appIntegrationService.getWorkspaceItemInfo(workspaceIds).subscribe(res => {
      if (res?.length) {
        this.workspaceInfo = res[0];
        this.schedulerDisabled = res[0]?.schedulerDisabled;
        this.webServiceDisabled = res[0]?.webServiceDisabled;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*========= Update Workspace Deploy, Undeploy and Not initialized Count on Action Perform ==========*/
  updateCounts(isUpdate: boolean) {
    if (isUpdate) {
      this.getWorkspaceInfo([this.selectedWorkspaceId]);
    }
  }

  /*============== Navigate to Process Details ===========*/
  navigateToProcessDetails(processId) {
    this.resetSearch(true);
    this.currentTabIndex = 1;
    this.activeTab = 1;
    this.appIntegrationDataService.clearProcessItemTree();
    this.processComponent.reinitiateProcessProperties();
    this.processComponent.getProcessDetails(this.getWorkspaceTreeObj, processId);
    this.isSearching = false;
    this.showSearchItemPerTab[1] = false;
  }
  /*============== End Navigate to Process Details ===========*/

  /*============== Navigate to Integration Details ===========*/
  navigateToIntegrationDetails(integartionId) {
    this.resetSearch(true);
    this.currentTabIndex = 0;
    this.activeTab = 0;
    this.appIntegrationDataService.clearIntegrationItemTree();
    this.integrationComponent.reinitiateIntegrationProperties();
    this.integrationComponent.getIntegartionDetails(this.getWorkspaceTreeObj, integartionId);
    this.isSearching = false;
    this.showSearchItemPerTab[0] = false;
  }
  /*============== End Navigate to Integration Details ===========*/

  handleSearchItem(event: boolean) {
    this.showSearchItemPerTab[this.activeTab] = event;
  }

  resetSearch(event: boolean) {
    if (event) {
      this.searchIntItem = "";
      this.searchItemText = "";
    }
  }

  /*============== On Change Workspace ===========*/
  // If you change workspace from dropdown only then call this method
  onWorksapceChange(workspaceId: number) {
    localStorage.removeItem("dashboardWorkspace");
    this.appIntegrationDataService.clearSelectedProcessItem();
    this.appIntegrationDataService.clearExpandedTree();
    this.appIntegrationDataService.clearIntegrationItemTree();
    this.appIntegrationDataService.clearProcessItemTree();
    this.appIntegrationDataService.clearTriggerItemTree();
    this.appIntegrationDataService.clearSelectedIntegrationItem();
    this.appIntegrationDataService.clearExpandedIntegrationTree();
    this.appIntegrationDataService.clearSelectedTriggerItem();
    this.appIntegrationDataService.clearExpandedTriggerTree();
    this.appIntegrationDataService.clearIntegrationFilter();
    this.appIntegrationDataService.clearSelectedIntegrationFilter();
    this.appIntegrationDataService.clearProcessFilter();
    this.appIntegrationDataService.clearSelectedProcessFilter();
    this.appIntegrationDataService.clearTriggerFilter();
    this.appIntegrationDataService.clearSelectedTriggerFilter();
    this.appIntegrationDataService.clearAlertProcesses();
    this.appIntegrationDataService.clearProcessExecutables();
    this.appIntegrationDataService.clearConnectedProcessToInt();
    this.onChangeWorkspace(workspaceId);
  }

   onChangeWorkspace(workspaceId: number, isBack?: Boolean) {
    const dashboardWorkspace = JSON.parse(localStorage.getItem("dashboardWorkspace"));
    const dashboardWorkspaceId = Number(dashboardWorkspace?.id);

    const resolvedWorkspaceId =
      dashboardWorkspaceId && this.workspaces?.some(x => Number(x?.id) === dashboardWorkspaceId)
        ? dashboardWorkspaceId
        : Number(workspaceId);

    if (!isBack) {
      this.resetSearch(true);
      this.appIntegrationDataService.clearIntSearchItem();
      this.appIntegrationDataService.clearProcessSearchItem();
      this.appIntegrationDataService.clearTriggerSearchItem();
      this.integrationComponent.resetReturnToFilter();
      this.processComponent.resetReturnToFilter();
      this.triggerComponent.resetReturnToFilter();
    }

    this.showSearchItemPerTab = {
      0: true,  // Integration tab
      1: true,  // Process tab
      2: true,  // Trigger tab
      3: true   // Webservice tab
    };

    const workspace = this.workspaces.find(x => Number(x?.id) === resolvedWorkspaceId);

    this.selectedWorkspace = workspace ?? dashboardWorkspace;
    this.selectedWorkspaceId = resolvedWorkspaceId;
    this.appIntegrationDataService.storeSelectedWorkspaceId(this.selectedWorkspaceId);

    this.getWorkspaceInfo([this.selectedWorkspaceId]);

    this.integrationComponent.reinitiateIntegrationProperties();
    this.processComponent.reinitiateProcessProperties();
    this.triggerComponent.reinitiateTriggerProperties();
    this.appIntServicesComponent.reinitiateWebServiceProperties();

    if (Number(this.currentTabIndex) === 0) {
      this.integrationComponent.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
    }
    if (Number(this.currentTabIndex) === 1) {
      this.processComponent.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
    }
    if (Number(this.currentTabIndex) === 2) {
      this.triggerComponent.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
    }
    if (Number(this.currentTabIndex) === 3) {
      this.appIntServicesComponent.getWebServices(this.getWorkspaceTreeObj);
    }
  }

  // onChangeWorkspace(workspaceId: number, isBack?: Boolean) {
  //   this.getWorkspaceInfo([workspaceId]);
  //   // this.appIntegrationDataService.clearSelectedProcessItem();
  //   // this.appIntegrationDataService.clearExpandedTree();
  //   // this.appIntegrationDataService.clearIntegrationItemTree();
  //   // this.appIntegrationDataService.clearProcessItemTree();
  //   // this.appIntegrationDataService.clearTriggerItemTree();
  //   // this.appIntegrationDataService.clearConnectedProcessToInt();
  //   if (!isBack) {
  //     this.resetSearch(true);
  //     this.appIntegrationDataService.clearIntSearchItem();
  //     this.appIntegrationDataService.clearProcessSearchItem();
  //     this.appIntegrationDataService.clearTriggerSearchItem();
  //     this.integrationComponent.resetReturnToFilter();
  //     this.processComponent.resetReturnToFilter();
  //     this.triggerComponent.resetReturnToFilter();
  //   }

  //   this.showSearchItemPerTab = {
  //     0: true,  // Integration tab
  //     1: true,  // Process tab
  //     2: true,  // Trigger tab
  //     3: true   // Webservice tab
  //   };

  //   const dashboard_workspace = JSON.parse(localStorage.getItem("dashboardWorkspace"));
  //   if (dashboard_workspace) {
  //     this.selectedWorkspace = dashboard_workspace;
  //     this.selectedWorkspaceId = Number(dashboard_workspace?.id);
  //     this.appIntegrationDataService.storeSelectedWorkspaceId(this.selectedWorkspaceId);
  //   } else {
  //     const workspace = this.workspaces.find(x => Number(x?.id) === Number(workspaceId));
  //     this.selectedWorkspace = workspace;
  //     this.selectedWorkspaceId = Number(workspace?.id);
  //     this.appIntegrationDataService.storeSelectedWorkspaceId(this.selectedWorkspaceId);
  //   }

  //   // Find a workspace from workspaces array

  //   this.integrationComponent.reinitiateIntegrationProperties();
  //   this.processComponent.reinitiateProcessProperties();
  //   this.triggerComponent.reinitiateTriggerProperties();
  //   this.appIntServicesComponent.reinitiateWebServiceProperties();
  //   if (Number(this.currentTabIndex) === 0) {
  //     // this.integrationComponent.reinitiateIntegrationProperties();
  //     // this.integrationComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
  //     this.integrationComponent.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
  //   }
  //   if (Number(this.currentTabIndex) === 1) {
  //     // this.processComponent.reinitiateProcessProperties();
  //     // this.processComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
  //     this.processComponent.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
  //   }
  //   if (Number(this.currentTabIndex) === 2) {
  //     // this.triggerComponent.reinitiateTriggerProperties();
  //     // this.triggerComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
  //     this.triggerComponent.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
  //   }
  //   if (Number(this.currentTabIndex) === 3) {
  //     this.appIntServicesComponent.getWebServices(this.getWorkspaceTreeObj);
  //   }
  // }
  /*============== END On Change Workspace ===========*/

  /*============ Common Object For Get Workspace Tree ===========*/
  get getWorkspaceTreeObj() {
    const taskDetailsDto: TaskDetailsDto = {
      workspaceId: Number(this.selectedWorkspace?.id),
      itemType: "",
      itemName: this.searchItemText,
      deployed: this.deployed,
      disabled: this.disabled,
      locked: this.locked,
      searchInNameAndDesc: this.searchInNameAndDesc,
      moveItemFolderSearch: false,
      showAll: this.showAll,
      userName: this.currentUser?.userName
    };
    if (Number(this.currentTabIndex) === 0) {
      taskDetailsDto.itemType = "Integration";
    }
    if (Number(this.currentTabIndex) === 1) {
      taskDetailsDto.itemType = "Process";
    }
    if (Number(this.currentTabIndex) === 2) {
      taskDetailsDto.itemType = "Trigger";
    }
    if (Number(this.currentTabIndex) === 3) {
      taskDetailsDto.itemType = "WEBSERVICE";
    }
    return taskDetailsDto;
  }

  /*================= Search Item ==================*/
  searchItem() {
    const dialogRef = this.dialog.open(SearchItemComponent, {
      width: "600px",
      maxHeight: "600px",
      data: "",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.resetSearch(true);
        this.integrationComponent.advancedIntegrationSearch(result);
        this.processComponent.advancedProcessSearch(result);
        this.triggerComponent.advancedTriggerSearch(result);
      }
    });
  }
  /*================= END Search Item ==================*/


  /*================= Net User ==================*/
  addNetUser() {
    const dialogRef = this.dialog.open(NetUserComponent, {
      width: "800px",
      maxHeight: "600px",
      data: {
        workspace: this.selectedWorkspace,
        isCRUDNetUserWithTestAccess: this.isCRUDNetUserWithTestAccess
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }
  /*================= END Net User ==================*/

  /*================= Global Parameters ==================*/
  globalParameters() {
    const dialogRef = this.dialog.open(GlobalParametersComponent, {
      width: "800px",
      maxHeight: "600px",
      data: {
        workspace: this.selectedWorkspace,
        isCRUDGlobalParamsAccess: this.isCRUDGlobalParamsAccess
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }
  /*================= END Global Parameters ==================*/

  /*================= Refresh Tree ==================*/
  refreshTree() {
    this.getWorkspaceInfo([this.selectedWorkspaceId]);
    this.resetIntegrationFilter();
    this.resetProcessFilter();
    this.resetTriggerFilter();
    this.resetWebService();
    this.currentTabIndex = this.activeTab;

    // if (this.currentTabIndex === 0) {
    //   this.integrationComponent.storeExpandedIntegrationTree();
    //   this.integrationComponent.reinitiateIntegrationProperties();
    //   this.appIntegrationDataService.clearSelectedIntegrationItem();
    //   this.appIntegrationDataService.clearSelectedIntegrationFilter();
    //   this.integrationComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    //   this.appIntegrationDataService.clearServiceLogs();
    //   this.appIntegrationDataService.clearEventLogs();
    // }
    // if (this.currentTabIndex === 1) {
    //   this.processComponent.storeExpandedTree();
    //   this.processComponent.reinitiateProcessProperties();
    //   this.processComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    //   this.appIntegrationDataService.clearServiceLogs();
    //   this.appIntegrationDataService.clearEventLogs();
    // }
    // if (this.currentTabIndex === 2) {
    //   this.triggerComponent.storeExpandedTriggerTree();
    //   this.triggerComponent.reinitiateTriggerProperties();
    //   this.triggerComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    //   this.appIntegrationDataService.clearServiceLogs();
    //   this.appIntegrationDataService.clearEventLogs();
    // }
    // if (this.currentTabIndex === 3) {
    //   this.appIntServicesComponent.reinitiateWebServiceProperties();
    //   this.appIntServicesComponent.getWebServices(this.getWorkspaceTreeObj);
    //   this.appIntegrationDataService.clearServiceLogs();
    //   this.appIntegrationDataService.clearEventLogs();
    // }
  }
  /*================= END Refresh Tree ==================*/

  /*================= Reset Integration Filter and Refresh Integration Tree ==================*/
  resetIntegrationFilter() {
    this.currentTabIndex = 0;
    this.appIntegrationDataService.clearIntegrationItemTree();
    this.integrationComponent.storeExpandedIntegrationTree();
    this.integrationComponent.reinitiateIntegrationProperties();
    this.appIntegrationDataService.clearSelectedIntegrationItem();
    this.appIntegrationDataService.clearSelectedIntegrationFilter();
    // this.integrationComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.integrationComponent.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
    this.appIntegrationDataService.clearServiceLogs();
    this.appIntegrationDataService.clearEventLogs();

  }
  /*================= End Reset Integration Filter and Refresh Integration Tree ==================*/

  /*================= Reset Process Filter and Refresh Process Tree ==================*/
  resetProcessFilter() {
    this.currentTabIndex = 1;
    this.appIntegrationDataService.clearProcessItemTree();
    this.processComponent.storeExpandedTree();
    this.processComponent.reinitiateProcessProperties();
    this.appIntegrationDataService.clearSelectedProcessItem();
    this.appIntegrationDataService.clearSelectedProcessFilter();
    // this.processComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.processComponent.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
    this.appIntegrationDataService.clearServiceLogs();
    this.appIntegrationDataService.clearEventLogs();
  }
  /*================= End Reset Process Filter and Refresh Process Tree ==================*/

  /*================= Reset Trigger Filter and Refresh Trigger Tree ==================*/
  resetTriggerFilter() {
    this.currentTabIndex = 2;
    this.appIntegrationDataService.clearTriggerItemTree();
    this.triggerComponent.storeExpandedTriggerTree();
    this.triggerComponent.reinitiateTriggerProperties();
    this.appIntegrationDataService.clearSelectedTriggerItem();
    this.appIntegrationDataService.clearSelectedTriggerFilter();
    // this.triggerComponent.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.triggerComponent.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
    this.appIntegrationDataService.clearServiceLogs();
    this.appIntegrationDataService.clearEventLogs();
  }
  /*================= End Reset Trigger Filter and Refresh Trigger Tree ==================*/

  /*================= Reset Web Service ==================*/
  resetWebService() {
    this.currentTabIndex = 3;
    this.appIntServicesComponent.reinitiateWebServiceProperties();
    this.appIntServicesComponent.getWebServices(this.getWorkspaceTreeObj);
    this.appIntegrationDataService.clearServiceLogs();
    this.appIntegrationDataService.clearEventLogs();
  }
  /*================= End Reset Web Service ==================*/

  /*================= Edit Workspace ==================*/
  editWorkspace() {
    const dialogRef = this.dialog.open(EditWorkspaceComponent, {
      width: "600px",
      maxHeight: "600px",
      data: {
        workspaceId: Number(this.selectedWorkspace?.id),
        allWorkspaces: this.workspaces,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }
  /*================= END Edit Workspace ==================*/

  ngOnDestroy() {
    this.sharedService.isChangeBgColor.next(false);
    this.breadcrumb.flowItemVisible.next(false);
    this.breadcrumb.setTitle("");
    this.appIntegrationService.sendReturnFromOtherPageFlag(false);
    this.appIntegrationDataService.clearNetUsers();
    this.appIntegrationDataService.clearGlobalParams();
    this.getWorkspacesSub.unsubscribe();
    this.getWorkspaceDetailsSub.unsubscribe();
    // Remove event Show confirmation dialog when reload the page
    window.removeEventListener('beforeunload', this.unloadCallback);
  }
}
