import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import keycloak, { KeycloakInstance } from 'keycloak-js';
import { first, map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/service/auth.service';
import { environment } from 'src/environments/environment';
import { Constants } from '../components/constants';
import { SharedService } from './shared.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakSecurityService {
  public kc: Keycloak.KeycloakInstance;
  private loginInProgress = false;

  constructor(
    private http: HttpClient,
    private router: ActivatedRoute,
    private authService: AuthService,
    private sharedService: SharedService,
    private cookieService: CookieService
  ) { }

  async init() {
    this.kc = new keycloak({
      url: environment?.keycloakRootUrl,
      realm: 'teis',
      clientId: 'client',
    });
    await this.kc.init({
      onLoad: 'check-sso',
    });
    if (this.isAuthenticated()) {
      await this.loadUserInfo();
    }
  }

  async updateToken(minValidity: number = 120) {
    if (this.kc && this.kc.token) {
      const refreshed = await this.kc.updateToken(minValidity);
      return refreshed;
    }
  }

  getToken(): string {
    return this.kc?.token || '';
  }

  getRefreshToken(): string {
    return this.kc.refreshToken;
  }

  getParsedRefreshToken(): any {
    return this.kc.refreshTokenParsed;
  }

  getAuthenticatedTime(): any {
    return this.kc.idTokenParsed?.auth_time;
  }

  isAuthenticated() {
    return !!this.kc?.authenticated;
  }

  async redirectToLogin(redirectPath?: string) {
    if (!this.kc || this.loginInProgress) {
      return;
    }
    this.loginInProgress = true;
    try {
      const redirectUri = redirectPath
        ? `${window.location.origin}${redirectPath}`
        : window.location.href;
      await this.kc.login({ redirectUri });
    } catch (err) {
      console.error('Error redirecting to login:', err);
      this.loginInProgress = false;
    }
  }

  isTokenExpiring(minValidity: number = 120): boolean {
    return this.kc.isTokenExpired(minValidity);
  }

  /*============= Check Token is Expire or Not ============*/
  getTokenExpirationDate(token: string): Date {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken.hasOwnProperty('exp')) {
      return null;
    }

    const date = new Date(0);
    date.setUTCSeconds(decodedToken.exp);
    return date;
  }

  isTokenExpired(token: string, offsetSeconds: number = 0): boolean {
    const expirationDate = this.getTokenExpirationDate(token);
    if (expirationDate == null) {
      return false;
    }
    return !(expirationDate.valueOf() > new Date().valueOf() + offsetSeconds * 1000);
  }

  private decodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token');
    }
    return JSON.parse(atob(parts[1]));
  }
  /*============= END Check Token is Expire or Not ============*/

  async logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.cookieService.deleteAll();
    localStorage.setItem('logoutEvent', JSON.stringify({ type: 'logout' }));
    await this.kc.logout();
  }

  async loadUserInfo() {
    try {
      const userInfo: any = await this.kc.loadUserInfo();
      localStorage.setItem('KEYCLOAK_USERINFO', JSON.stringify(userInfo));
      localStorage.setItem(Constants.USERNAME, userInfo?.preferred_username);
    } catch (err) {
      console.error('Error load user info:', err);
    }
  }

  getUserInfo(userInfo: any) {
    this.authService.userInfo({ username: userInfo?.preferred_username, password: '' }).pipe(first()).subscribe((res: any) => {
      const output = Object.entries(res?.workspaceModules).map(([key, value]) => ({
        workspaceId: Number(key),
        accessList: value
      }));
      res.workspaceAccess = output;

      // No permission from backend for Processing Overview Card That's Why added static permission
      res.codeNameMapping.push({
        key: 'MTR_POCARD',
        raw: null,
        value: 'WebClient - Processing Overview Card'
      });
      // res.codeNameMapping.push({
      //   key: 'WSV',
      //   raw: null,
      //   value: 'Web Service Management Card'
      // });
      this.sharedService.shareCurrentUserObj(res);
      localStorage.setItem(Constants.CURRENTUSER, JSON.stringify(res));
      this.getPermissions(res);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  // Gets permissions from user
  getPermissions(user: any) {
    if (user?.codeNameMapping?.length) {
      user?.codeNameMapping.forEach(permission => {
        switch (permission?.key) {
          case 'TM':
            localStorage.setItem(Constants.TASK_MANAGEMENT_CARD, permission?.key);
            break;
          case 'TM_ACTNS':
            localStorage.setItem(Constants.TASK_MANAGEMENT_ACTIONS, permission?.key);
            break;
          case 'MTR_APPLN':
            localStorage.setItem(Constants.APPLICATION_LOG, permission?.key);
            break;
          case 'AP_LOG':
            localStorage.setItem(Constants.ARCHIVE_CARD, permission?.key);
            break;
          case 'AI_LOCK':
            localStorage.setItem(Constants.BREAK_PIT_LOCK, permission?.key);
            break;
          case 'CONF_CRUD_APPPAR':
            localStorage.setItem(Constants.APPLICATION_PARAMETER_CURD_ACCESS, permission?.key);
            break;
          case 'CONF_UISE':
            localStorage.setItem(Constants.CONFIGURATION_SCRIPT_ENGINE_AND_GROUP, permission?.key);
            break;
          case 'CONF_SRV':
            localStorage.setItem(Constants.CONFIGURATION_OF_SEVER, permission?.key);
            break;
          case 'CONF_LM':
            localStorage.setItem(Constants.CONFIGURATION_LOG_MAINTENANCE, permission?.key);
            break;
          case 'BM':
            localStorage.setItem(Constants.BUSSINESS_MANAGEMENT_CARD, permission?.key);
            break;
          case 'BM_CRUD_FLFG':
            localStorage.setItem(Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP, permission?.key);
            break;
          case 'BM_CRUD_ATAM':
            localStorage.setItem(Constants.CUD_ACTIVITY_TYPE_AND_ACTIVITY_MODEL, permission?.key);
            break;
          case 'BM_CRUD_FTFM':
            localStorage.setItem(Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL, permission?.key);
            break;
          case 'BM_ENDS_FLW':
            localStorage.setItem(Constants.ENABLED_DISALED_FLOWS, permission?.key);
            break;
          case 'WM':
            localStorage.setItem(Constants.WORKSPACE_MANAGEMENT_CARD, permission?.key);
            break;
          case 'WM_CRUD_WS':
            localStorage.setItem(Constants.WORKSPACE_MANAGEMENT_CRUD, permission?.key);
            break;
          case 'WM_ENDSSCH':
            localStorage.setItem(Constants.ENABLE_DISABLE_SCHEDULERS, permission?.key);
            break;
          case 'WM_ENDSS':
            localStorage.setItem(Constants.ENABLE_DISABLE_SERVICES, permission?.key);
            break;
          case 'WSV_CRUD_URI':
            localStorage.setItem(Constants.WEB_SERVICE_MANAGEMENT_CURD_ACCESS, permission?.key);
            break;
          case 'WSV_ENDIS':
            localStorage.setItem(Constants.WEB_SERVICE_MANAGEMENT_ENABLE_DISABLE_ACCESS, permission?.key);
            break;
          case 'WM_GLOBAL_PARAM':
            localStorage.setItem(Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS, permission?.key);
            break;
          case 'WM_CRUD_NU':
            localStorage.setItem(Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST, permission?.key);
            break;
          case 'AI_CRUD':
            localStorage.setItem(Constants.APPLICATION_INTEGRATION_CARD, permission?.key);
            break;
          case 'UM':
            localStorage.setItem(Constants.USER_MANAGEMENT_CARD, permission?.key);
            break;
          case 'UM_CRUD_URPG':
            localStorage.setItem(Constants.USER_MANAGEMENT_CRUD, permission?.key);
            break;
          case 'WM_DEPLOY_WS':
            localStorage.setItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE, permission?.key);
            break;
          case 'AI_DEPLOY':
            localStorage.setItem(Constants.DEPLOY_UNDEPLOY_FPIT, permission?.key);
            break;
          case 'ADM_ENDS_APPS':
            localStorage.setItem(Constants.APP_SERVICE_MANAGEMENT_CARD, permission?.key);
            break;
          case 'MTR':
            localStorage.setItem(Constants.MONITOR_LOG_AND_FLOW_CARD, permission?.key);
            break;
          case 'MTR_EVENT':
            localStorage.setItem(Constants.EVENT_LOG, permission?.key);
            break;
          case 'TLS':
            localStorage.setItem(Constants.TOOLS_CARD, permission?.key);
            break;
          case 'TLS_IX_WI':
            localStorage.setItem(Constants.TOOLS_IMPORT_EXPORT_WORKSPACE_ITEMS, permission?.key);
            break;
          case 'TLS_INDEX':
            localStorage.setItem(Constants.TOOLS_REINDEXING, permission?.key);
            break;
          case 'DEV':
            localStorage.setItem(Constants.DEVELOPMENT_CARD, permission?.key);
            break;
          case 'DEV_LOCK_SCRT':
            localStorage.setItem(Constants.DEV_BREAK_LOCK_ON_TEMPLATE_AND_SYSTEM_LIBRARY, permission?.key);
            break;
          case 'DEV_CRUD_TPL':
            localStorage.setItem(Constants.DEV_CRUD_TEMPLATE, permission?.key);
            break;
          case 'DEV_LOCK_USCRT':
            localStorage.setItem(Constants.DEV_BREAK_LOCK_ON_USER_SCRIPT, permission?.key);
            break;
          case 'DEV_CRUD_USRS':
            localStorage.setItem(Constants.DEV_CRUD_USER_SCRIPT, permission?.key);
            break;
          case 'DEV_IX_SCRT':
            localStorage.setItem(Constants.DEV_IMPORT_EXPORT_TEMPLATE_AND_SYSTEM_LIBRARY, permission?.key);
            break;
          case 'DEV_IX_USCRT':
            localStorage.setItem(Constants.DEV_IMPORT_EXPORT_USER_SCRIPT, permission?.key);
            break;
          case 'DEV_CRUD_SYSL':
            localStorage.setItem(Constants.DEV_CRUD_SYSTEM_LIBRARY, permission?.key);
            break;
          case 'AI_WORKSPACE':
            localStorage.setItem(Constants.OPEN_UPDATE_WORKSPACE, permission?.key);
            break;
          case 'AI_MOVE':
            localStorage.setItem(Constants.RESTRUCTURING_VIEW, permission?.key);
            break;
          case 'MTR_SERVICE':
            localStorage.setItem(Constants.SERVICE_LOG, permission?.key);
            break;
          case 'MTR_FLOW':
            localStorage.setItem(Constants.FLOW_INPUT, permission?.key);
            break;
          case 'MTR_FLOW_MTR':
            localStorage.setItem(Constants.FLOW_MONITORING, permission?.key);
            break;
          case 'AI_EXEC':
            localStorage.setItem(Constants.START_STOP_REMOVE_ERROR_FLAG_PIT, permission?.key);
            break;
          case 'MTR_FLWCARD':
            localStorage.setItem(Constants.FLOW_CARD, permission?.key);
            break;
          case 'MTR_LOGCARD':
            localStorage.setItem(Constants.LOG_CARD, permission?.key);
            break;
          case 'MTR_SYSSTAT':
            localStorage.setItem(Constants.SYSTEM_STATUS, permission?.key);
            break;
          case 'WSV':
            localStorage.setItem(Constants.WEB_SERVICE_MANAGEMENT_CARD, permission?.key);
            break;
          case 'PO':
            localStorage.setItem(Constants.PROCESSING_OVERVIEW_CARD, permission?.key);
            break;
          case 'PO_WEBSVS':
            localStorage.setItem(Constants.PROCESSING_OVERVIEW_WEB_SERVICE, permission?.key);
            break;
          case 'PO_PE':
            localStorage.setItem(Constants.PROCESSING_OVERVIEW_PROCESS_ENGINE, permission?.key);
            break;
          case 'PO_SRV_QUE':
            localStorage.setItem(Constants.PROCESSING_OVERVIEW_SERVER_QUEUE, permission?.key);
            break;
          case 'PO_SRV_TC':
            localStorage.setItem(Constants.PROCESSING_OVERVIEW_SERVER_TASK_CACHE, permission?.key);
            break;
          case 'PO_SRV_IC':
            localStorage.setItem(Constants.PROCESSING_OVERVIEW_SERVER_ITEM_CACHE, permission?.key);
            break;
        }
      });
    }
  }

}
