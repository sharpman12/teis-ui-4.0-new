import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Tokens } from '../model/Tokens';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Constants } from 'src/app/shared/components/constants';
import { LogDataService } from './state/log-data.service';
import { HeaderService } from './header.service';
import { GlobalDataService } from '../../admin/global-data.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { CookieService } from 'ngx-cookie-service';

export class ICurrentUser {
  private userName: string;
  private permissions: string;
  private profileRef: string;
  private password: string;
  private firstName: string;
  private lastName: string;
  private token: string;
  private refreshToken: string;
}


@Injectable({
  providedIn: 'root'
})


export class AuthService {

  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  constructor(
    private http: HttpClient,
    private router: Router,
    private header: HeaderService,
    private logDataService: LogDataService,
    private globalDataService: GlobalDataService,
    private sharedService: SharedService,
    public dialog: MatDialog,
    private cookieService: CookieService
  ) { }

  baseUrl = environment.baseUrl;
  login(user: { username: string, password: string }): Observable<boolean> {
    return this.http.post<any>(this.baseUrl + 'auth', { 'userName': user.username, 'password': user.password })
      .pipe(map(objUser => {
        // login successful if there's a jwt token in the response
        if (objUser && objUser.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem(Constants.CURRENTUSER, JSON.stringify(objUser));
          this.doLoginUser(objUser.userName, objUser.token, objUser.refreshToken);

          getPermissions(objUser);
        }
        return objUser;
      }));
  }

  userInfo(user: any): Observable<any> {
    const KEYCLOAK_USERINFO = JSON.parse(localStorage.getItem('KEYCLOAK_USERINFO'));
    return this.http.post<any>(this.baseUrl + 'user/userInfo', { 'userName': user?.username, 'password': user?.password, 'profileRef': KEYCLOAK_USERINFO?.profileId })
      .pipe(map(objUser => {
        // login successful if there's a jwt token in the response
        if (objUser) {
          const output = Object.entries(objUser?.workspaceModules).map(([key, value]) => ({
            workspaceId: Number(key),
            accessList: value
          }));
          objUser.workspaceAccess = output;

          // No permission from backend for Processing Overview Card That's Why added static permission
          // objUser.codeNameMapping.push({
          //   key: 'MTR_POCARD',
          //   raw: null,
          //   value: 'WebClient - Processing Overview Card'
          // });
          // objUser.codeNameMapping.push({
          //   key: 'WSV',
          //   raw: null,
          //   value: 'Web Service Management Card'
          // });
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem(Constants.CURRENTUSER, JSON.stringify(objUser));
          this.doLoginUser(objUser.userName, objUser.token, objUser.refreshToken);

          getPermissions(objUser);
        }
        return objUser;
      }));
  }

  logout() {
    this.router.navigate(['login']);
    this.doLogoutUser();
    localStorage.clear();
    localStorage.clear();
    this.clearGlobalDataService();
    this.sharedService.clearLocalUserPermissions();
    this.dialog.closeAll();
    this.cookieService.deleteAll();
  }

  clearGlobalDataService() {
    this.globalDataService.storeUsers({
      userId: null,
      searchCriteria: {
        type: 'All',
        pageNumber: null,
        name: null,
        excludeRecordId: null
      },
      userList: [],
      totalCount: null
    });
    this.globalDataService.storeProfile({
      profileId: null,
      searchCriteria: {
        type: 'All',
        pageNumber: null,
        name: null,
        excludeRecordId: null
      },
      profileList: [],
      totalCount: null
    });
    this.globalDataService.storeProfileOnSelect([]);
    this.globalDataService.storeRole({
      roleId: null,
      searchCriteria: {
        type: 'All',
        pageNumber: null,
        name: null,
        excludeRecordId: null
      },
      roleList: [],
      totalCount: null
    });
    this.globalDataService.storeRolesOnSelect([]);
    this.globalDataService.storeGroup({
      groupId: null,
      searchCriteria: {
        type: 'All',
        pageNumber: null,
        name: null,
        excludeRecordId: null
      },
      groupList: [],
      totalCount: null
    });
  }

  isLoggedIn() {
    return !!this.getJwtToken();
  }

  refreshToken() {
    const requestOptions: Object = {
      responseType: 'json'
    };
    return this.http.post<any>(
      this.baseUrl + 'refreshToken',
      this.getRefreshToken(),
      requestOptions
    ).pipe(map((tokens: Tokens) => {
      this.storeTokens(tokens.token, tokens.refreshToken);
      return tokens;
    }));
  }

  getJwtToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  doLoginUser(username: string, tokens: string, reTokens: string) {
    localStorage.setItem(Constants.USERNAME, username);
    this.storeTokens(tokens, reTokens);
  }


  private doLogoutUser() {
    this.header.hide();
    this.logDataService.clearSelectedLogs();
    this.removePermissions();
  }

  removePermissions() {
    localStorage.removeItem(Constants.SERVICE_LOG);
    localStorage.removeItem(Constants.FLOW_INPUT);
    localStorage.removeItem(Constants.FLOW_MONITORING);
    localStorage.removeItem(Constants.EVENT_LOG);
    localStorage.removeItem(Constants.APPLICATION_LOG);
    localStorage.removeItem(Constants.SYSTEM_STATUS);
    localStorage.removeItem(Constants.FLOW_CARD);
    localStorage.removeItem(Constants.LOG_CARD);
    localStorage.removeItem(Constants.USER_MANAGEMENT_CARD);
    localStorage.removeItem(Constants.USER_MANAGEMENT_CRUD);
    localStorage.removeItem(Constants.WORKSPACE_MANAGEMENT_CARD);
    localStorage.removeItem(Constants.WORKSPACE_MANAGEMENT_CRUD);
    localStorage.removeItem(Constants.BUSSINESS_MANAGEMENT_CARD);
    localStorage.removeItem(Constants.APP_SERVICE_MANAGEMENT_CARD);
    localStorage.removeItem(Constants.TASK_MANAGEMENT_CARD);
    localStorage.removeItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE);
    localStorage.removeItem(Constants.CONFIGURATION_CARD);
    localStorage.removeItem(Constants.APPLICATION_PARAMETER_CURD_ACCESS);
    localStorage.removeItem(Constants.TOOLS_CARD);
    localStorage.removeItem(Constants.DEVELOPMENT_CARD);
    localStorage.removeItem(Constants.ARCHIVE_CARD);
    localStorage.removeItem(Constants.APPLICATION_INTEGRATION_CARD);
    localStorage.removeItem(Constants.BREAK_PIT_LOCK);
    localStorage.removeItem(Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS);
    localStorage.removeItem(Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST);
    localStorage.removeItem(Constants.DEPLOY_UNDEPLOY_FPIT);
    localStorage.removeItem(Constants.OPEN_UPDATE_WORKSPACE);
    localStorage.removeItem(Constants.RESTRUCTURING_VIEW);
    localStorage.removeItem(Constants.START_STOP_REMOVE_ERROR_FLAG_PIT);
    localStorage.removeItem(Constants?.WEB_SERVICE_MANAGEMENT_CARD);
  }

  private getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeTokens(tokens: string, reTokens: string) {
    localStorage.setItem(this.JWT_TOKEN, tokens);
    localStorage.setItem(this.REFRESH_TOKEN, reTokens);
  }

  removeTokens() {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.REFRESH_TOKEN);
    localStorage.removeItem(Constants.CURRENTUSER);
  }
}

// Gets permissions from user
function getPermissions(user: any) {
  if (user?.codeNameMapping?.length) {
    user?.codeNameMapping.forEach(permission => {
      switch (permission?.key) {
        case 'TM':
          localStorage.setItem(Constants.TASK_MANAGEMENT_CARD, permission?.key);
          break;
        case 'TM_ACTNS':
          localStorage.setItem(Constants.TASK_MANAGEMENT_ACTIONS, permission?.key);
          break;
        case 'AP_LOG':
          localStorage.setItem(Constants.ARCHIVE_CARD, permission?.key);
          break;
        case 'AI_LOCK':
          localStorage.setItem(Constants.BREAK_PIT_LOCK, permission?.key);
          break;
        case 'CONFG':
          localStorage.setItem(Constants.CONFIGURATION_CARD, permission?.key);
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
        case 'WM_DEPLOY_WS':
          localStorage.setItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE, permission?.key);
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
        case 'AI_DEPLOY':
          localStorage.setItem(Constants.DEPLOY_UNDEPLOY_FPIT, permission?.key);
          break;
        case 'APS_ENDS_APPS':
          localStorage.setItem(Constants.APP_SERVICE_MANAGEMENT_CARD, permission?.key);
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
        case 'AI_EXEC':
          localStorage.setItem(Constants.START_STOP_REMOVE_ERROR_FLAG_PIT, permission?.key);
          break;
        case 'MTR':
          localStorage.setItem(Constants.MONITOR_LOG_AND_FLOW_CARD, permission?.key);
          break;
        case 'MTR_EVENT':
          localStorage.setItem(Constants.EVENT_LOG, permission?.key);
          break;
        case 'MTR_APPLN':
          localStorage.setItem(Constants.APPLICATION_LOG, permission?.key);
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
  if (user?.workspaceAccess?.length) {
    user?.workspaceAccess.forEach((x) => {
      if (x?.accessList?.length) {
        x?.accessList.forEach((permission) => {
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
            case 'CONFG':
              localStorage.setItem(Constants.CONFIGURATION_CARD, permission?.key);
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
            case 'WM_DEPLOY_WS':
              localStorage.setItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE, permission?.key);
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
            case 'AI_DEPLOY':
              localStorage.setItem(Constants.DEPLOY_UNDEPLOY_FPIT, permission?.key);
              break;
            case 'APS_ENDS_APPS':
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
    });
  }
}
