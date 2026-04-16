import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import { SystemStatusService } from "../core/service/system.service";
import { DashboardService } from "../core/service/dashboard.service";
import { SystemStatus } from "../core/model/SystemStatus";
import { DashboardData } from "../core/model/Dashboard";
import { HeaderService } from "../core/service/header.service";
import { BreadCrumbService } from "../core/service/breadcrumb.service";
import * as moment from "moment";
import { Constants } from "../shared/components/constants";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { SharedService } from "../shared/services/shared.service";
import { HttpErrorResponse } from "@angular/common/http";
import { KeycloakSecurityService } from "../shared/services/keycloak-security.service";
import { AuthService } from "../core/service/auth.service";
import { first } from "rxjs/operators";
import { WorkspaceMgmtService } from "../workspace-management/workspace-mgmt/workspace-mgmt.service";
import { Subscription } from "rxjs";
import { Router } from "@angular/router";
import { ProgressiveLoaderService } from "../core/service/progressiveloader.service";
import { DashboardDataService } from "./dashboard-data.service";
import { AppIntegrationDataService } from "../application-integration/app-integration/app-integration-data.service";
import { ScriptStateService } from "../shared/services/script-state.service";
import { WebSocketService } from "../shared/services/web-socket.service";
import { MessageService } from 'primeng/api';

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
  encapsulation: ViewEncapsulation.None, // Use to disable CSS Encapsulation for this component
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  isloading: boolean = false;
  systemStatus: SystemStatus[];
  operationalStatus: boolean;
  dashboard: DashboardData;
  status = false;
  currentTime: string;
  subscriptionData;
  subscriptionStatus;
  subscriptionOpStatus;
  loadCardStatus = false;
  loadSystemStatus = false;
  showLogCard: boolean = false;
  isMonitorLogAndFlowCard: boolean = false;
  isFlowInput: boolean = false;
  showProcessingOverviewCard: boolean = false;
  showFlowCard: string;
  showUserMgmtCard: boolean = false;
  showWorkspaceMgmtCard: boolean = false;
  showBussinessMgmtCard: boolean = false;
  showAppServiceMgmtCard: boolean = false;
  showWebServiceMgmtCard: boolean = false;
  showTmCard: boolean = false;
  showConfigCard: boolean = false;
  showToolsCard: boolean = false;
  showDevelopmentCard: boolean = false;
  showArchiveCard: boolean = false;
  showApplicationIntegrationCard: boolean = false;
  expandSystemStatus: string;
  selectedValue: string;
  workspaces: Array<any> = [];
  isAdminModuleAccess: boolean = false;
  isAIModulesAccess: boolean = false;
  isArchiveModuleAccess: boolean = false;
  isConfigModuleAccess: boolean = false;
  isMonitorModuleAccess: boolean = false;
  isTMModuleAccess: boolean = false;
  isToolsModuleAccess: boolean = false;
  isDevelopmentModuleAccess: boolean = false;
  workspaceIds: any[];
  logErrorCounts: any = null;
  flowErrorCounts: any = null;
  currentUser: any = null;
  dashboard_permissions: Array<any> = [
    "Administration",
    "Application Integration",
    "Archive",
    "Configuration",
    "Monitor",
    "Task Management",
    "Tools",
    "Development"
  ];

  userPermissions: Array<any> = [
    // {
    //   key: 'ADDON',
    //   value: 'AddOn Manager'
    // },
    {
      key: "UM",
      value: "Administration",
    },
    {
      key: "AI",
      value: "Application Integration",
    },
    {
      key: "AP",
      value: "Archive",
    },
    {
      key: "CONFG",
      value: "Configuration",
    },
    // {
    //   key: 'DEV',
    //   value: 'Development'
    // },
    {
      key: "MTR",
      value: "Monitor",
    },
    {
      key: "TLS",
      value: "Tools",
    },
    {
      key: "TM",
      value: "Task Management",
    },
    {
      key: "DEV",
      value: "Development",
    },
    // {
    //   key: 'WSV',
    //   value: 'Web Services'
    // }
  ];
  permissions: Array<any> = [];

  getWorkspacesSub = Subscription.EMPTY;
  getWorkspacesItenInfoSub = Subscription.EMPTY;
  getUserPermissionsSub = Subscription.EMPTY;
  getLogErrorCountSub = Subscription.EMPTY;
  getFlowErrorCountSub = Subscription.EMPTY;
  getWorkspaceErrorCountSub = Subscription.EMPTY;

  constructor(
    public header: HeaderService,
    private systemService: SystemStatusService,
    private dashboardService: DashboardService,
    public breadcrumb: BreadCrumbService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private kcService: KeycloakSecurityService,
    private authService: AuthService,
    private workspaceMgmtService: WorkspaceMgmtService,
    private router: Router,
    public loaderService: ProgressiveLoaderService,
    private dashboardDataService: DashboardDataService,
    private scriptStateService: ScriptStateService,
    private appIntegrationDataService: AppIntegrationDataService,
    private webSocketService: WebSocketService,
    private messageService: MessageService,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
    if (!this.currentUser) {
      this.sharedService.currentUser.subscribe(res => {
        this.currentUser = res;
      });
    }
  }

  // Called after view is initialized
  ngAfterViewInit(): void {
    this.sharedService.updateSystemStatus(true);
    // setTimeout(() => {
    //   if (
    //     this.showLogCard ||
    //     this.showFlowCard ||
    //     this.showUserMgmtCard ||
    //     this.showTmCard
    //   ) {
    //     this.getDashboardCards();
    //     this.getUpdatedLogErrorCount();
    //     this.getUpdatedFlowErrorCount();
    //   }
    // }, 5000);
    // if (this.showLogCard || this.showFlowCard || this.showUserMgmtCard || this.showTmCard) {
    //   this.getDashboardCards();
    // }
  }

  ngOnInit() {
    this.loaderService.show();
    this.sharedService.sendWorkspaceDetails(null);
    const userInfo = JSON.parse(localStorage.getItem("KEYCLOAK_USERINFO"));
    const currentUserInfo = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
    if (userInfo && !currentUserInfo) {
      this.authService.userInfo({ username: userInfo?.preferred_username, password: "" }).pipe(first()).subscribe((userinfo) => {
        const output = Object.entries(userinfo?.workspaceModules).map(([key, value]) => ({
          workspaceId: Number(key),
          accessList: value
        }));
        userinfo.workspaceAccess = output;
        localStorage.setItem(
          Constants.USERNAME,
          userInfo?.preferred_username
        );
        localStorage.setItem(
          Constants.CURRENTUSER,
          JSON.stringify(userinfo)
        );
        this.sharedService.shareCurrentUserObj(userinfo);
        this.getDashboardPermissions();
        this.getOperationalStatus();
        this.setPermissions();
        this.getWorkspacesByUsername();
        if (userinfo?.changePassword) {
          this.changePassword(userinfo?.changePassword);
        }
        this.sharedService.updateSystemStatus(true);
        this.currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
        this.loaderService.hide();
      },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        }
      );
    }
    this.header.show(); // show hide header
    this.breadcrumb.previousHide(); // show hide breadcrumb
    this.breadcrumb.show(); // show hide breadcrumb
    this.getOperationalStatus();
    this.getDashboardPermissions();
    this.setPermissions();
    // Call only if user info available in local storage
    if (currentUserInfo) {
      this.getWorkspacesByUsername();
    }
    this.sharedService.updateSystemStatus(true);
    this.currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // this.setPermissions();
    if (this.expandSystemStatus) {
      // this.getSystemStatus();
    }

    // const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    // if (currentUser?.changePassword) {
    //   this.changePassword();
    // }

    this.sharedService.isChangeBgColor.next(false);
    this.loaderService.hide();
    this.clearAppIntLocalData();
    this.clearDevelopmentModuleLocalData();

    // Connect web socket after user login to portal
    if (!this.webSocketService?.isWSConnected()) {
      this.webSocketService.connect();
    }

  }

  /*=========== Clear All Application Integration Local Store Data ===========*/
  clearAppIntLocalData() {
    this.appIntegrationDataService.clearSchedulers();
    this.appIntegrationDataService.clearWorkspaces();
    this.appIntegrationDataService.clearSelectedWorkspaceId();
    this.appIntegrationDataService.clearNetUsers();
    this.appIntegrationDataService.clearGlobalParams();
    this.appIntegrationDataService.clearIntegrationItemTree();
    this.appIntegrationDataService.clearProcessItemTree();
    this.appIntegrationDataService.clearTriggerItemTree();
    this.appIntegrationDataService.clearProcessTreeItemDetails();
    this.appIntegrationDataService.clearIntegrationsByProcessId();
    this.appIntegrationDataService.clearServiceLogs();
    this.appIntegrationDataService.clearEventLogs();
    this.appIntegrationDataService.clearNetUsersExecutables();
    this.appIntegrationDataService.clearProcessExecutables();
    this.appIntegrationDataService.clearDeletedExecutables();
    this.appIntegrationDataService.clearLogMaintenanceConfig();
    this.appIntegrationDataService.clearIdentifiers();
    this.appIntegrationDataService.clearAlertProcesses();
    this.appIntegrationDataService.clearSEGroups();
    this.appIntegrationDataService.clearQueueGroups();
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.appIntegrationDataService.clearVersionHistory();
    this.appIntegrationDataService.clearSelectedProcessItem();
    this.appIntegrationDataService.clearSelectedIntegrationItem();
    this.appIntegrationDataService.clearSelectedTriggerItem();
    this.appIntegrationDataService.clearExpandedTree();
    this.appIntegrationDataService.clearExpandedIntegrationTree();
    this.appIntegrationDataService.clearExpandedTriggerTree();
    this.appIntegrationDataService.clearPITGeneralFormData();
    this.appIntegrationDataService.clearConnectedProcessToInt();
    this.appIntegrationDataService.clearSelctedWebServiceItem();
    this.appIntegrationDataService.clearAppliedFilters();
    this.appIntegrationDataService.clearIntegrationTabIndex();
    this.appIntegrationDataService.clearTriggerTabIndex();
    this.appIntegrationDataService.clearProcessTabIndex();
    this.appIntegrationDataService.clearIntegrationFilter();
    this.appIntegrationDataService.clearSelectedIntegrationFilter();
    this.appIntegrationDataService.clearProcessFilter();
    this.appIntegrationDataService.clearSelectedProcessFilter();
    this.appIntegrationDataService.clearTriggerFilter();
    this.appIntegrationDataService.clearSelectedTriggerFilter();
  }

  clearDevelopmentModuleLocalData() {
    this.scriptStateService.sharedSelectedScriptData(null);
    this.scriptStateService.updateOpenedScripts([]);
    this.scriptStateService.sharedActiveTabId(null);
  }

  /*=========== Get Dahboard Log Card Error Count ===========*/
  updateLogErrorCounts(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dashboardDataService.clearLogCardFailedCount();
    this.getUpdatedLogErrorCount();
  }

  getUpdatedLogErrorCount() {
    this.logErrorCounts = null;
    const logCardFailedCounts = this.dashboardDataService.getLogCardFailedCount();
    if (logCardFailedCounts) {
      this.logErrorCounts = logCardFailedCounts;
    } else {
      this.getLogErrorCountSub = this.dashboardService.getDashboardLogErrorCounts().subscribe((res) => {
        this.logErrorCounts = res;
        this.dashboardDataService.storeLogCardFailedCount(this.logErrorCounts);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*=========== END Get Dahboard Log Card Error Count ===========*/

  /*=========== Get Dahboard Flow Card Error Count ===========*/
  updateFlowErrorCounts(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dashboardDataService.clearFlowCardFailedCount();
    this.getUpdatedFlowErrorCount();
  }

  getUpdatedFlowErrorCount() {
    this.flowErrorCounts = null;
    const flowCardFailedCounts = this.dashboardDataService.getFlowCardFailedCount();
    if (flowCardFailedCounts) {
      this.flowErrorCounts = flowCardFailedCounts;
    } else {
      this.getFlowErrorCountSub = this.dashboardService.getDashboardFlowErrorCounts().subscribe((res) => {
        this.flowErrorCounts = res;
        this.dashboardDataService.storeFlowCardFailedCount(this.flowErrorCounts);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*=========== END Get Dahboard Flow Card Error Count ===========*/

  /*============ Refresh Worksapces Counts ============*/
  refreshWorkspaceCounts() {
    this.dashboardDataService.clearAllWorkspaces();
    this.getWorkspacesByUsername();
  }

  /*============ Get Worksapces By Username ============*/
  getWorkspacesByUsername() {
    const username = localStorage.getItem(Constants?.USERNAME);
    const workspaces = this.dashboardDataService.getAllWorkspaces();
    if (workspaces?.length) {
      this.sortWorkspaces(workspaces, true);
    } else {
      this.getWorkspaces();
    }
  }

  getWorkspaces() {
    const username = localStorage.getItem(Constants?.USERNAME);
    this.isloading = true;
    this.getWorkspacesSub = this.workspaceMgmtService.getAllWorkspaces(username).subscribe((res) => {
      if (res?.length) {
        res.forEach((x) => {
          x.isInfoShow = false;
        });
        this.sortWorkspaces(res, false);
      }
      this.isloading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  sortWorkspaces(workspaces: Array<any>, isLocal: boolean = false) {
    this.isloading = false;

    // Login user access workspace list
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    workspaces.map((ws) => {
      ws.isLoginUserHaveAccess = false;
    });

    if (accessWorkspaces?.length) {
      accessWorkspaces.forEach((aws) => {
        workspaces.forEach((ws) => {
          // ws.isLoginUserHaveAccess = false;
          if (Number(aws?.workspaceId) === Number(ws?.id)) {
            if (aws?.accessList.some((x) => x?.key === 'TM_ACTNS')) {
              ws.isLoginUserHaveAccess = true;
            }
          }
          
        });
      });
    }


    const res = workspaces;

    // Filter out default objects and store them in a separate array
    const defaultObjects = res.filter((obj) => obj.defaultWorkspace);

    // Filter out non-default objects and store them in a separate array
    const nonDefaultObjects = res.filter((obj) => !obj.defaultWorkspace);

    // Create a new array by concatenating non-default objects, the first default object, and the remaining default objects
    const filteredArray = [
      ...(defaultObjects.length > 0 ? [defaultObjects[0]] : []),
      ...defaultObjects.slice(1), // Add the remaining default objects
      ...nonDefaultObjects,
    ];
    // Swap first 2 objects. Default Workspace visible on 2nd position
    const isDefaultSampleWorkspace = filteredArray.some(obj => obj.id === '1' && obj.defaultWorkspace);
    if (!isDefaultSampleWorkspace) {
      if (filteredArray?.length > 1) {
        [filteredArray[0], filteredArray[1]] = [
          filteredArray[1],
          filteredArray[0],
        ];
      }
    }
    this.workspaces = filteredArray;

    // Using map to collect workspace IDs for getting workspace error counts
    this.workspaceIds = this.workspaces.map(obj => !obj?.archived ? obj.id : '').filter(item => item !== '');
    if (!isLocal) {
      this.getWorkspaceItemInfo();
    }
  }

  getWorkspaceItemInfo(index: number = 0) {
    this.isloading = false;
    // Get All Workspaces Error Counts at Once
    if (this.workspaceIds?.length) {
      this.workspaceIds.forEach((id, index) => {
        this.getWorkspaceErrorCountSub = this.workspaceMgmtService.getWorkspaceErrorCount([id]).subscribe((res) => {
          if (res?.length && this.workspaces?.length) {
            res.forEach((x) => {
              this.workspaces.forEach((w) => {
                if (Number(x?.key) === Number(w?.id)) {
                  w.isInfoShow = true;
                  w.failedCount = x?.value
                }
              });
            });
            this.dashboardDataService.storeAllWorspaces(this.workspaces);
          }
          this.isloading = false;
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
        // this.getWorkspacesItenInfoSub = this.workspaceMgmtService.getWorkspaceItemInfo([id]).subscribe(res => {
        //   if (res?.length && this.workspaces?.length) {
        //     res.forEach((x) => {
        //       this.workspaces.forEach((w) => {
        //         if (Number(x?.id) === Number(w?.id)) {
        //           w.isInfoShow = true;
        //           w.failedCount = x?.failedCount
        //         }
        //       });
        //     });
        //     this.dashboardDataService.storeAllWorspaces(this.workspaces);
        //   }
        //   this.isloading = false;
        // }, (err: HttpErrorResponse) => {
        //   if (err.error instanceof Error) {
        //     // handle client side error here
        //   } else {
        //     // handle server side error here
        //   }
        // });
      });
    }
  }
  /*============ END Get Worksapces By Username ============*/

  /*============ Go To Task Management =============*/
  goToTaskMgmt(workspace: any, source: string) {
    if (source === "table") {
      // this.sharedService.sendWorkspaceDetails(null);
      // this.router.navigate(["task_management"]);
      // this.sharedService.sendWorkspaceDetails(workspace);
      localStorage.setItem("dashboardWorkspace", JSON.stringify(workspace));
    } else {
      localStorage.removeItem('dashboardWorkspace');
    }
  }

  /*============ Go To Task Management =============*/
  goToApplicationInt(workspace: any, source: string) {
      if (source === "table") {
        localStorage.setItem("dashboardWorkspace", JSON.stringify(workspace));
      } else {
        localStorage.removeItem('dashboardWorkspace');
      }
  }

  onChangeDashboard(selectedPermission: string) {
    localStorage.setItem("selectedDashboardPermission", selectedPermission);
  }

  private setPermissions() {
    // Set permissions
    if (localStorage.getItem(Constants.MONITOR_LOG_AND_FLOW_CARD) ||
      localStorage.getItem(Constants.EVENT_LOG) ||
      localStorage.getItem(Constants.SERVICE_LOG) ||
      localStorage.getItem(Constants.APPLICATION_LOG)) {
      this.isMonitorLogAndFlowCard = true;
    }
    if (localStorage.getItem(Constants.LOG_CARD)) {
      this.showLogCard = true;
    }
    if (localStorage.getItem(Constants.FLOW_MONITORING)) {
      this.isFlowInput = true;
    }
    if (localStorage.getItem(Constants.PROCESSING_OVERVIEW_CARD) ||
      localStorage.getItem(Constants.PROCESSING_OVERVIEW_WEB_SERVICE) ||
      localStorage.getItem(Constants.PROCESSING_OVERVIEW_PROCESS_ENGINE) ||
      localStorage.getItem(Constants.PROCESSING_OVERVIEW_SERVER_QUEUE) ||
      localStorage.getItem(Constants.PROCESSING_OVERVIEW_SERVER_TASK_CACHE) ||
      localStorage.getItem(Constants.PROCESSING_OVERVIEW_SERVER_ITEM_CACHE)
    ) {
      this.showProcessingOverviewCard = true;
    }
    if (
      localStorage.getItem(Constants.USER_MANAGEMENT_CARD) ||
      localStorage.getItem(Constants.USER_MANAGEMENT_CRUD)
    ) {
      this.showUserMgmtCard = true;
    }
    if (
      localStorage.getItem(Constants.WORKSPACE_MANAGEMENT_CARD) ||
      localStorage.getItem(Constants.WORKSPACE_MANAGEMENT_CRUD) ||
      localStorage.getItem(Constants.ENABLE_DISABLE_SCHEDULERS) ||
      localStorage.getItem(Constants.ENABLE_DISABLE_SERVICES) ||
      localStorage.getItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE)
    ) {
      this.showWorkspaceMgmtCard = true;
    }
    if (
      localStorage.getItem(Constants.BUSSINESS_MANAGEMENT_CARD) ||
      localStorage.getItem(Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL) ||
      localStorage.getItem(Constants.ENABLED_DISALED_FLOWS) ||
      localStorage.getItem(Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP)
    ) {
      this.showBussinessMgmtCard = true;
    }
    if (localStorage.getItem(Constants.APP_SERVICE_MANAGEMENT_CARD)) {
      this.showAppServiceMgmtCard = true;
    }
    if (localStorage.getItem(Constants.WEB_SERVICE_MANAGEMENT_CARD)) {
      this.showWebServiceMgmtCard = true;
    }
    if (
      localStorage.getItem(Constants.TASK_MANAGEMENT_CARD) ||
      localStorage.getItem(Constants.TASK_MANAGEMENT_ACTIONS)
    ) {
      this.showTmCard = true;
    }
    if (
      localStorage.getItem(Constants.CONFIGURATION_CARD) ||
      localStorage.getItem(Constants.APPLICATION_PARAMETER_CURD_ACCESS) ||
      localStorage.getItem(Constants.CONFIGURATION_SCRIPT_ENGINE_AND_GROUP) ||
      localStorage.getItem(Constants.CONFIGURATION_OF_SEVER) ||
      localStorage.getItem(Constants.CONFIGURATION_LOG_MAINTENANCE)
    ) {
      this.showConfigCard = true;
    }
    if (
      localStorage.getItem(Constants.TOOLS_CARD) &&
      localStorage.getItem(Constants.TOOLS_IMPORT_EXPORT_WORKSPACE_ITEMS)
    ) {
      this.showToolsCard = true;
    }
    if (
      localStorage.getItem(Constants.DEVELOPMENT_CARD) ||
      localStorage.getItem(Constants.DEV_BREAK_LOCK_ON_TEMPLATE_AND_SYSTEM_LIBRARY) ||
      localStorage.getItem(Constants.DEV_CRUD_TEMPLATE) ||
      localStorage.getItem(Constants.DEV_BREAK_LOCK_ON_USER_SCRIPT) ||
      localStorage.getItem(Constants.DEV_CRUD_USER_SCRIPT) ||
      localStorage.getItem(Constants.DEV_IMPORT_EXPORT_TEMPLATE_AND_SYSTEM_LIBRARY) ||
      localStorage.getItem(Constants.DEV_IMPORT_EXPORT_USER_SCRIPT) ||
      localStorage.getItem(Constants.DEV_CRUD_SYSTEM_LIBRARY)
    ) {
      this.showDevelopmentCard = true;
    }
    if (localStorage.getItem(Constants.ARCHIVE_CARD)) {
      this.showArchiveCard = true;
    }
    if (
      localStorage.getItem(Constants.APPLICATION_INTEGRATION_CARD) ||
      localStorage.getItem(Constants.BREAK_PIT_LOCK) ||
      localStorage.getItem(Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS) ||
      localStorage.getItem(Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST) ||
      localStorage.getItem(Constants.DEPLOY_UNDEPLOY_FPIT) ||
      localStorage.getItem(Constants.OPEN_UPDATE_WORKSPACE) ||
      localStorage.getItem(Constants.RESTRUCTURING_VIEW) ||
      localStorage.getItem(Constants.START_STOP_REMOVE_ERROR_FLAG_PIT)
    ) {
      this.showApplicationIntegrationCard = true;
    }
    this.showFlowCard = localStorage.getItem(Constants.FLOW_CARD);
    this.expandSystemStatus = localStorage.getItem(Constants.SYSTEM_STATUS);
    if (this.isMonitorLogAndFlowCard) {
      this.getDashboardCards();
      this.getUpdatedLogErrorCount();
      this.getUpdatedFlowErrorCount();
    }
  }

  // Method to show System details
  getSystemStatus(): void {
    this.subscriptionStatus = this.systemService
      .getStatus()
      .subscribe((status) => (this.systemStatus = status));
  }

  // Method to show status icon beside 'System status'
  getOperationalStatus(): void {
    this.loadSystemStatus = true;
    this.subscriptionOpStatus = this.systemService
      .getOperationalStatus()
      .subscribe((opStatus) => {
        this.operationalStatus = opStatus;
        this.loadSystemStatus = false;
      });
  }

  getDashboardCards(): void {
    // This api is not in use. we are using now 'taskErrorCount' and 'flowErrorCount' for fetch error cunts

    // this.subscriptionData = this.dashboardService.getDashboardCards().subscribe((cards) => {
    //   this.dashboard = cards;
    //   this.loadCardStatus = false;
    // });
  }

  clickEvent() {
    this.status = !this.status;
  }

  refreshDashboard() {
    this.loadCardStatus = true;
    this.getDashboardCards();
  }

  refreshOpStatus() {
    this.getOperationalStatus();
    if (this.expandSystemStatus) {
      this.getSystemStatus();
    }
    this.currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
  }

  changePassword(isNewUserPasswordChange: boolean) {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: "550px",
      data: {
        isNewUserPasswordChange: isNewUserPasswordChange
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }

  getDashboardPermissions() {
    const permissionArr = this.sharedService.getLocalUserPermissions();
    const username = localStorage.getItem(Constants.USERNAME);
    if (permissionArr?.length) {
      this.permissions = permissionArr;
      this.checkPreviousSelectedDashboard(this.permissions);
      this.checkModuleAccess();
    } else {
      this.getUserPermissionsSub = this.sharedService
        .getUserPermissions(username, true)
        .subscribe(
          (res) => {
            /*============ New User Permissions Code Mapping ============*/
            if (this.userPermissions?.length && res?.codeNameMapping?.length) {
              this.userPermissions.forEach((x) => {
                res?.codeNameMapping.forEach((p) => {
                  if (p?.key === x?.key) {
                    this.sharedService.storeUserPermissions(p);
                  }
                });
              });
            }
            this.permissions = this.sharedService.getLocalUserPermissions();
            this.checkPreviousSelectedDashboard(this.permissions);
            this.checkModuleAccess();

            // this.dashboard_permissions.forEach(item => {
            //   res?.permissions.forEach(element => {
            //     if (item === element) {
            //       this.sharedService.storeUserPermissions(element);
            //     }
            //   });
            // });
            // this.permissions = this.sharedService.getLocalUserPermissions();
            // this.checkPreviousSelectedDashboard(this.permissions);
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // handle client side error here
            } else {
              // handle server side error here
            }
          }
        );
    }
  }

  /*============ Check Module Access ============*/
  checkModuleAccess() {
    this.isAdminModuleAccess = false;
    this.isAIModulesAccess = false;
    this.isArchiveModuleAccess = false;
    this.isConfigModuleAccess = false;
    this.isMonitorModuleAccess = false;
    this.isTMModuleAccess = false;
    this.isToolsModuleAccess = false;
    this.isDevelopmentModuleAccess = false;
    if (this.permissions?.length) {
      this.permissions.forEach((x) => {
        switch (x?.key) {
          case "UM":
            this.isAdminModuleAccess = true;
            break;
          case "AI":
            this.isAIModulesAccess = true;
            break;
          case "AP":
            this.isArchiveModuleAccess = true;
            break;
          case "CONFG":
            this.isConfigModuleAccess = true;
            break;
          case "MTR":
            this.isMonitorModuleAccess = true;
            break;
          case "TLS":
            this.isToolsModuleAccess = true;
            break;
          case "TM":
            this.isTMModuleAccess = true;
            break;
          case "DEV":
            this.isDevelopmentModuleAccess = true;
            break;
        }
      });
    }
  }

  checkPreviousSelectedDashboard(permissions: Array<any>) {
    let isMonitorPermission = null;
    if (localStorage.getItem("selectedDashboardPermission")) {
      this.selectedValue = localStorage.getItem("selectedDashboardPermission");
    } else {
      permissions.forEach((item) => {
        if (item?.key === "AI") {
          isMonitorPermission = item;
        }
      });
      if (isMonitorPermission) {
        this.selectedValue = isMonitorPermission?.key;
      } else {
        this.selectedValue = permissions[0]?.key;
      }
    }
  }

  ngOnDestroy() {
    if (this.subscriptionData) {
      this.subscriptionData.unsubscribe();
    }
    if (this.subscriptionStatus) {
      this.subscriptionStatus.unsubscribe();
    }
    if (this.subscriptionOpStatus) {
      this.subscriptionOpStatus.unsubscribe();
    }
    this.getWorkspacesSub.unsubscribe();
    this.getWorkspacesItenInfoSub.unsubscribe();
    this.getUserPermissionsSub.unsubscribe();
    this.getLogErrorCountSub.unsubscribe();
    this.getFlowErrorCountSub.unsubscribe();
    this.getWorkspaceErrorCountSub.unsubscribe();
  }
}
