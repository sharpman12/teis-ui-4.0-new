import { AfterContentInit, Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderService } from '../../core/service/header.service';
import { AuthService } from '../../core/service/auth.service';
import { Router } from '@angular/router';
import { LogDataService } from '../../core/service/state/log-data.service';
import { SharedService } from '../services/shared.service';
import { SystemStatusService } from '../../core/service/system.service';
import { Subscription } from 'rxjs';
import { SystemStatus } from '../../core/model/SystemStatus';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import { Constants } from './constants';
import { KeycloakSecurityService } from '../services/keycloak-security.service';
import { first } from 'rxjs/operators';
import { DashboardDataService } from 'src/app/dashboard/dashboard-data.service';
import { ChangePasswordComponent } from 'src/app/dashboard/change-password/change-password.component';
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { WebSocketService } from '../services/web-socket.service';
import { UserSettingsComponent } from 'src/app/dashboard/user-settings/user-settings.component';
import { ScriptStateService } from '../services/script-state.service';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { UserSettingService } from 'src/app/dashboard/user-settings/user-setting.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'layout-header',
  templateUrl: './header.component.html',
  styles: [
    `.status_icon {
        position: absolute;
        top: -5px;
        right: 6px;
    }
    .toggle_btn {
      color: #000000;
      font-weight: normal;
    }
    .home_style {
      font-size: larger;
    }
    @media only screen and (max-device-width: 575px) {
      .status_icon {
        right: 100px;
    }
    }`
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  showModalCloseAllLogs: boolean = false;
  openLogsCards: any[] = [];
  openDevScriptTabs: Array<any> = [];
  isShow = false;
  isSource = true;
  systemStatus: SystemStatus[];
  operationalStatus: Array<any> = [];
  reindexLogsDetails: Array<any> = [];
  reindexLogsStatus: Array<any> = [];
  currentTime: string;
  currentUser: any = null;
  currentUserInfo: any = null;
  versionInfo: any = null;

  systemStatusSub = Subscription.EMPTY;
  operationalStatusSub = Subscription.EMPTY;
  getReIndexLogStatusSub = Subscription.EMPTY;
  openedScriptsSub = Subscription.EMPTY;
  getUserSettingSub = Subscription.EMPTY;
  getVersionInfoSub = Subscription.EMPTY;

  isOpen = false;
  expandSystemStatus = false;

  constructor(
    public header: HeaderService,
    private auth: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private logDataService: LogDataService,
    public sharedService: SharedService,
    private systemService: SystemStatusService,
    private kcService: KeycloakSecurityService,
    private dashboardDataService: DashboardDataService,
    private scriptStateService: ScriptStateService,
    private messageService: MessageService,
    private userSettingService: UserSettingService,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    // Get current user full name from keycloak object
    const userInfo = JSON.parse(localStorage.getItem('KEYCLOAK_USERINFO'));
    const currentUserInfo = JSON.parse(localStorage.getItem(Constants?.CURRENTUSER));
    this.currentUserInfo = currentUserInfo;
    if (!currentUserInfo) {
      this.sharedService.currentUser.subscribe(res => {
        this.currentUserInfo = res;
      });
    }
    if (userInfo) {
      this.currentUser = userInfo?.name;
    }

    this.showModalCloseAllLogs = false;
    this.sharedService.isHeader.subscribe(res => {
      if (res) {
        this.isSource = true;
      } else {
        this.isSource = false;
      }
    });
    this.sharedService.systemStatusLoad.subscribe(res => {
      this.setActionPermissions();
      if (res) {
        this.getSystemStatus();
        this.getOperationalStatus();
        this.getReIndexLogStatus();
        this.currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
      }
    });
    // Call API after every 3 minutes (180000 ms) for update system status
    setInterval(() => {
      if (localStorage.getItem(Constants.USERNAME)) {
        this.getSystemStatus();
        this.getOperationalStatus();
        this.getReIndexLogStatus();
        this.currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
      }
    }, 3 * 60 * 1000);
    this.getSystemStatus();
    this.getOperationalStatus();
    this.getReIndexLogStatus();
    this.getVersionInfo();
  }

  getVersionInfo() {
    this.getVersionInfoSub = this.sharedService.getVersionInfo().subscribe((res) => {
      this.versionInfo = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    })
  }

  private setActionPermissions() {
    if (localStorage.getItem(Constants.SYSTEM_STATUS)) {
      this.expandSystemStatus = true;
    } else {
      this.expandSystemStatus = false;
    }
  }

  logout() {
    // this.auth.logout();
    // localStorage.clear();
    // sessionStorage.clear();
    // this.dashboardDataService.clearAllWorkspaces();
    // this.dashboardDataService.clearLogCardFailedCount();
    // this.dashboardDataService.clearFlowCardFailedCount();
    // this.kcService.logout();
    this.sessionService.openLogoutConfirm('manual');
  }

  clearLogs() {
    if (this.router.url === '/logs') {
      this.logDataService.selectedLogsAnnounced$.subscribe(result => {
        this.openLogsCards = result;
      });
      if (this.openLogsCards.length > 0) {
        this.showModalCloseAllLogs = true;
      } else {
        this.router.navigate(['dashboard']);
      }
    } else if (this.router.url === '/archive_packages_log') {
      if (this.sharedService.getOpenArchiveTabs()?.length > 1) {
        this.showModalCloseAllLogs = true;
      } else {
        this.showModalCloseAllLogs = false;
        this.router.navigate(['dashboard']);
      }
    } else if (this.router.url === '/development') {
      this.openDevScriptTabs = [];
      this.openedScriptsSub = this.scriptStateService.openedScripts$.subscribe((scripts) => {
        if (scripts?.length) {
          this.openDevScriptTabs = scripts;
        }
      });
      if (this.openDevScriptTabs?.length > 0) {
        this.showModalCloseAllLogs = true;
      } else {
        this.showModalCloseAllLogs = false;
        this.router.navigate(['dashboard']);
      }
    } else {
      this.router.navigate(['dashboard']);
    }
  }

  clearselectedLogs() {
    if (this.router.url === '/logs' || this.router.url === '/archive_packages_log') {
      this.logDataService.clearSelectedLogs();
      this.router.navigate(['dashboard']);
    } else if (this.router.url === '/development') {
      this.scriptStateService.closedAllScriptOpenTabs(true);
    }
    this.showModalCloseAllLogs = false;
  }

  stayOnLogs() {
    this.showModalCloseAllLogs = false;
    this.scriptStateService.closedAllScriptOpenTabs(false);
  }

  showMenu() {
    this.isShow = !this.isShow;
    this.sharedService.showHideMenuBar(this.isShow);
  }

  /*============ Get System Status ============*/
  getSystemStatus() {
    this.systemStatusSub = this.systemService.getStatus().subscribe(res => {
      this.systemStatus = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============ Get System Operational Status ============*/
  getOperationalStatus() {
    this.operationalStatusSub = this.systemService.getOperationalStatus().subscribe(res => {
      this.operationalStatus = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============ Get Re-Index logs Status ============*/
  getReIndexLogStatus() {
    const reIndexLogs = [];
    this.getReIndexLogStatusSub = this.systemService.getIndexLogStatus().subscribe((res) => {
      // Handle the response if needed
      if (res?.length) {
        res.forEach((item: any, i, arr) => {
          // Modify the keys for better readability
          if (item?.key === 'ReindexingLogs_StartTime') {
            item.name = 'Reindexing logs start time';
            reIndexLogs.push(item);
          } else if (item?.key === 'ReindexingLogs') {
            item.name = 'Reindexing logs';
            reIndexLogs.push(item);
          } else if (item?.key === 'CompletionTime') {
            const reindexingLog = arr.find((x) => x?.key === 'ReindexingLogs');
            if (reindexingLog && reindexingLog?.value === 'true') {
              item.name = 'Reindexing logs completion time';
            } else if (reindexingLog && reindexingLog?.value === 'false') {
              item.name = 'Reindexing logs failure time';
            }
            // item.name = 'Reindexing logs completion time';
            reIndexLogs.push(item);
          }
        });

        const reindexLogsStatus = JSON.parse(JSON.stringify(reIndexLogs)).filter((x) => x?.key === 'ReindexingLogs');
        const reindexLogsDetails = JSON.parse(JSON.stringify(reIndexLogs)).filter((x) => x?.key !== 'ReindexingLogs');
        this.reindexLogsStatus = reindexLogsStatus;
        this.reindexLogsDetails = reindexLogsDetails;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  refreshOpStatus() {
    this.getOperationalStatus();
    this.getSystemStatus();
    this.getReIndexLogStatus();
    this.currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
  }

  /*========== Expand/Collapse Last updated comp system status info =========*/
  toggleCompInfo() {
    this.isOpen = !this.isOpen;
  }

  /*========== Change User Password ==========*/
  changePassword(isNewUserPasswordChange: boolean) {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: "550px",
      data: {
        isNewUserPasswordChange: isNewUserPasswordChange
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }

  redirectOnHelpFile() {
    const url = new URL(environment.webSocketBaseUrl);
    const helpFileUrl = `${url?.origin}/help`;
    if (helpFileUrl) {
      window.open(helpFileUrl, '_blank');
    }
  }

  /*========== Change User Setting ==========*/
  changeUserSetting() {
    let module = 'dashboard';
    let code = 'Dashboard';
    const path = this.router.url;
    if (path.includes('development')) {
      module = 'development';
      code = 'DEV';
      const dialogRef = this.dialog.open(UserSettingsComponent, {
        width: "800px",
        maxHeight: '95vh',
        // height: '95%',
        data: {
          module: module,
          moduleCode: code
        }
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.isSaved) {
          if (result?.res) {
            this.messageService.add({ key: 'appSuccessMsgKey', severity: 'success', summary: '', detail: `User settings for ${module} module saved successfully.` });
          }
        }
      });
    } else if (path.includes('dashboard')) {
      this.messageService.add({ key: 'appInfoMsgKey', severity: 'info', summary: '', detail: `Looks like this module doesn't have user settings yet. You may continue using default settings.` });
    } else {
      this.messageService.add({ key: 'appInfoMsgKey', severity: 'info', summary: '', detail: `Looks like this module doesn't have user settings yet. You may continue using default settings.` });
    }
  }

  ngOnDestroy(): void {
    this.systemStatusSub.unsubscribe();
    this.operationalStatusSub.unsubscribe();
    this.getReIndexLogStatusSub.unsubscribe();
    this.openedScriptsSub.unsubscribe();
    this.getUserSettingSub.unsubscribe();
    this.getVersionInfoSub.unsubscribe();
  }

}
