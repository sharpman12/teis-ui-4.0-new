import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { KeycloakSecurityService } from 'src/app/shared/services/keycloak-security.service';
import { first, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Constants } from 'src/app/shared/components/constants';

@Injectable({
  providedIn: 'root'
})
export class DashboardGuard implements Resolve<any> {
  constructor(
    private router: Router,
    private authService: AuthService,
    private kcService: KeycloakSecurityService,
  ) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> {
    // let currentUser = null;
    // if (this.kcService.kc.authenticated) {
    //   this.kcService.kc.loadUserInfo().then((res: any) => {
    //     if (res) {
    //       this.authService.userInfo({ username: res?.preferred_username, password: '' }).pipe(first()).subscribe((userinfo: any) => {
    //         userinfo.username = res?.preferred_username;
    //         currentUser = userinfo;
    //       }, (err: HttpErrorResponse) => {
    //         if (err.error instanceof Error) {
    //           // handle client side error here
    //         } else {
    //           // handle server side error here
    //         }
    //       });
    //     }
    //   });
    // }
    // return this.kcService.kc.loadUserInfo().then((res: any) => {
    //   if (res) {
    //     return res;
    //   } else {
    //     return null;
    //   }
    // });
    // return currentUser;
    // Gets permissions from user

    return this.authService.userInfo({ username: 'hpwani', password: '' }).pipe(map((res: any) => {
      if (res) {
        // No permission from backend for Processing Overview Card That's Why added static permission
        res.codeNameMapping.push({
          key: 'MTR_POCARD',
          raw: null,
          value: 'WebClient - Processing Overview Card'
        });
        res.codeNameMapping.push({
          key: 'ADM_WSCARD',
          raw: null,
          value: 'Web Service Management Card'
        });
        if (res?.codeNameMapping?.length) {
          res?.codeNameMapping.forEach(permission => {
            switch (permission?.key) {
              case 'TM_ACTNS':
                localStorage.setItem(Constants.TASK_MANAGEMENT_CARD, permission?.key);
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
              case 'CONF_UISESRV':
                localStorage.setItem(Constants.CONFIGURATION_CARD, permission?.key);
                break;
              case 'CONF_CRUD_APPPAR':
                localStorage.setItem(Constants.APPLICATION_PARAMETER_CURD_ACCESS, permission?.key);
                break;
              case 'ADM_CRUD_FLFG':
                localStorage.setItem(Constants.BUSSINESS_MANAGEMENT_CARD, permission?.key);
                break;
              case 'ADM_CRUD_ATAM':
                localStorage.setItem(Constants.CUD_ACTIVITY_TYPE_AND_ACTIVITY_MODEL, permission?.key);
                break;
              case 'ADM_CRUD_FTFM':
                localStorage.setItem(Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL, permission?.key);
                break;
              case 'ADM_ENDS_FLW':
                localStorage.setItem(Constants.ENABLED_DISALED_FLOWS, permission?.key);
                break;
              case 'ADM_CRUD_WS':
                localStorage.setItem(Constants.WORKSPACE_MANAGEMENT_CARD, permission?.key);
                break;
              case 'ADM_CRUD_URI':
                localStorage.setItem(Constants.WEB_SERVICE_MANAGEMENT_CURD_ACCESS, permission?.key);
                break;
              case 'AI_GLOBAL':
                localStorage.setItem(Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS, permission?.key);
                break;
              case 'WM_CRUD_NU':
                localStorage.setItem(Constants.CREATE_UPDATE_DELETE_NETUSER_WITH_TEST, permission?.key);
                break;
              case 'AI_CRUD':
                localStorage.setItem(Constants.APPLICATION_INTEGRATION_CARD, permission?.key);
                break;
              case 'ADM_CRUD_URPG':
                localStorage.setItem(Constants.USER_MANAGEMENT_CARD, permission?.key);
                break;
              case 'ADM_DEPLOY_WS':
                localStorage.setItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE, permission?.key);
                break;
              case 'AI_DEPLOY':
                localStorage.setItem(Constants.DEPLOY_UNDEPLOY_FPIT, permission?.key);
                break;
              case 'ADM_ENDS_APPS':
                localStorage.setItem(Constants.APP_SERVICE_MANAGEMENT_CARD, permission?.key);
                break;
              case 'MTR_EVENT':
                localStorage.setItem(Constants.EVENT_LOG, permission?.key);
                break;
              case 'TLS_IX_WI':
                localStorage.setItem(Constants.TOOLS_CARD, permission?.key);
                break;
              case 'DEV_IX_WI':
                localStorage.setItem(Constants.DEVELOPMENT_CARD, permission?.key);
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
              case 'ADM_WSCARD':
                localStorage.setItem(Constants.WEB_SERVICE_MANAGEMENT_CARD, permission?.key);
                break;
              case 'MTR_POCARD':
                localStorage.setItem(Constants.PROCESSING_OVERVIEW_CARD, permission?.key);
                break;
            }
          });
        }
        return res;
      } else {
        return null;
      }
    }));
  }

}
