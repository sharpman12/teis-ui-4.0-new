import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  ActivatedRoute,
} from "@angular/router";
import { Constants } from "src/app/shared/components/constants";
import { SharedService } from "../../shared/services/shared.service";
import { AuthService } from "../service/auth.service";
import { MessageService } from "primeng/api";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { KeycloakSecurityService } from "src/app/shared/services/keycloak-security.service";

// @Injectable()
// export class AuthGuard implements CanActivate {

//     constructor(
//         private router: Router,
//         private authService: AuthService,
//         private sharedService: SharedService,
//         private messageService: MessageService,
//     ) { }

//     canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
//         // changes done embedded browser in MC
//         if (route.queryParams.token) {
//             const token = route.queryParams.token;
//             const refreshToken = route.queryParams.refreshToken;
//             const userName = route.queryParams.userName;
//             const source = route.queryParams.source;
//             const workspaceId = route.queryParams.workspaceId;
//             if (token) {
//                 localStorage.setItem(Constants.SOURCE, source);
//                 localStorage.setItem(Constants.USERNAME, userName);
//                 if (workspaceId) {
//                     localStorage.setItem(Constants.WORKSPACE_ID, workspaceId);
//                 }
//                 this.authService.doLoginUser(userName, token, refreshToken);
//                 let is_user_have_access: boolean = false;
//                 return this.sharedService.getUserPermissions(userName, false).pipe(map((res) => {
//                     res?.permissions.forEach(permission => {
//                         switch (permission) {
//                             case 'WebClient - Flow Card':
//                                 localStorage.setItem(Constants.FLOW_CARD, permission);
//                                 break;
//                             case 'WebClient - Log Card':
//                                 localStorage.setItem(Constants.LOG_CARD, permission);
//                                 break;
//                             case 'Application Log - Search':
//                                 localStorage.setItem(Constants.APPLICATION_LOG, permission);
//                                 break;
//                             case 'Event Log - Search':
//                                 localStorage.setItem(Constants.EVENT_LOG, permission);
//                                 break;
//                             case 'Service Log - Search':
//                                 localStorage.setItem(Constants.SERVICE_LOG, permission);
//                                 break;
//                             case 'Create, View, Update and Delete User, Roles, Profiles and User group':
//                                 localStorage.setItem(Constants.USER_MANAGEMENT_CARD, permission);
//                                 break;
//                             case 'Create, Update and Delete Workspace':
//                                 localStorage.setItem(Constants.WORKSPACE_MANAGEMENT_CARD, permission);
//                                 break;
//                             case 'Create, Update and Delete Flow Group and Flow':
//                                 localStorage.setItem(Constants.BUSSINESS_MANAGEMENT_CARD, permission);
//                                 break;
//                             case 'Deploy Undeploy of Workspace':
//                                 localStorage.setItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE, permission);
//                                 break;
//                             case 'Enable/Disable Application services':
//                                 localStorage.setItem(Constants.APP_SERVICE_MANAGEMENT_CARD, permission);
//                                 break;
//                             case 'Add Note, Mark as Complete, Restart and Stop Task':
//                                 localStorage.setItem(Constants.TASK_MANAGEMENT_CARD, permission);
//                                 break;
//                             case 'Create,Update and Delete of Application Parameters':
//                                 localStorage.setItem(Constants.APPLICATION_PARAMETER_CURD_ACCESS, permission);
//                                 break;
//                             case 'Break Lock on Trigger, Integration and Process':
//                                 localStorage.setItem(Constants.BREAK_PIT_LOCK, permission);
//                                 break;
//                             case 'Create, Update and Delete of Global Parameters':
//                                 localStorage.setItem(Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS, permission);
//                                 break;
//                             case 'Deploy and Undeploy of Folder, Trigger, Integration and Process':
//                                 localStorage.setItem(Constants.DEPLOY_UNDEPLOY_FPIT, permission);
//                                 break;
//                             case 'Open and Update of Workspace':
//                                 localStorage.setItem(Constants.OPEN_UPDATE_WORKSPACE, permission);
//                                 break;
//                             case 'Restructuring View':
//                                 localStorage.setItem(Constants.RESTRUCTURING_VIEW, permission);
//                                 break;
//                             case 'Start, Stop, Remove Error Flag for Trigger, Integration and Process':
//                                 localStorage.setItem(Constants.START_STOP_REMOVE_ERROR_FLAG_PIT, permission);
//                                 break;
//                         }
//                     });
//                     localStorage.setItem(Constants.CURRENTUSER, JSON.stringify(res));

//                     /*------------ Code for Role Based Access And Redirection -----------*/
//                     const user_access_list = Object.keys(localStorage);
//                     is_user_have_access = user_access_list.some(x => x === route.data.access);
//                     if (!is_user_have_access) {
//                         this.messageService.add({ key: 'dashboardInfoKey', severity: 'success', summary: '', detail: 'Sorry, you do not have this module/level access.' });
//                     }
//                     return is_user_have_access;
//                 }));
//                 // this.sharedService.getUserPermissions(userName, false).subscribe(res => {
//                 //     res?.permissions.forEach(permission => {
//                 //         switch (permission) {
//                 //             case 'WebClient - Flow Card':
//                 //                 localStorage.setItem(Constants.FLOW_CARD, permission);
//                 //                 break;
//                 //             case 'WebClient - Log Card':
//                 //                 localStorage.setItem(Constants.LOG_CARD, permission);
//                 //                 break;
//                 //             case 'Application Log - Search':
//                 //                 localStorage.setItem(Constants.APPLICATION_LOG, permission);
//                 //                 break;
//                 //             case 'Event Log - Search':
//                 //                 localStorage.setItem(Constants.EVENT_LOG, permission);
//                 //                 break;
//                 //             case 'Service Log - Search':
//                 //                 localStorage.setItem(Constants.SERVICE_LOG, permission);
//                 //                 break;
//                 //             case 'Create, View, Update and Delete User, Roles, Profiles and User group':
//                 //                 localStorage.setItem(Constants.USER_MANAGEMENT_CARD, permission);
//                 //                 break;
//                 //             case 'Create, Update and Delete Workspace':
//                 //                 localStorage.setItem(Constants.WORKSPACE_MANAGEMENT_CARD, permission);
//                 //                 break;
//                 //             case 'Deploy Undeploy of Workspace':
//                 //                 localStorage.setItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE, permission);
//                 //                 break;
//                 //             case 'Enable/Disable Application services':
//                 //                 localStorage.setItem(Constants.APP_SERVICE_MANAGEMENT_CARD, permission);
//                 //                 break;
//                 //             case 'Add Note, Mark as Complete, Restart and Stop Task':
//                 //                 localStorage.setItem(Constants.TASK_MANAGEMENT_CARD, permission);
//                 //                 break;
//                 //             case 'Create,Update and Delete of Application Parameters':
//                 //                 localStorage.setItem(Constants.APPLICATION_PARAMETER_CURD_ACCESS, permission);
//                 //                 break;
//                 //         }
//                 //     });
//                 //     localStorage.setItem(Constants.CURRENTUSER, JSON.stringify(res));

//                 //     /*------------ Code for Role Based Access And Redirection -----------*/
//                 //     const user_access_list = Object.keys(localStorage);
//                 //     is_user_have_access = user_access_list.some(x => x === route.data.access);
//                 //     if (!is_user_have_access) {
//                 //         this.messageService.add({ key: 'dashboardInfoKey', severity: 'success', summary: '', detail: 'Sorry, you do not have this module/level access.' });
//                 //     }
//                 //     return is_user_have_access;
//                 // }, (err: HttpErrorResponse) => {
//                 //     if (err.error instanceof Error) {
//                 //         // handle client side error here
//                 //     } else {
//                 //         // handle server side error here
//                 //     }
//                 // });
//                 // this.authService.doLoginUser(userName, token, refreshToken);
//                 // this.authService.refreshToken().subscribe(res => { });
//                 // return is_user_have_access;
//             } else {
//                 localStorage.removeItem(Constants.SOURCE);
//                 localStorage.removeItem(Constants.FLOW_CARD);
//                 localStorage.removeItem(Constants.LOG_CARD);
//                 localStorage.removeItem(Constants.SERVICE_LOG);
//                 localStorage.removeItem(Constants.EVENT_LOG);
//                 localStorage.removeItem(Constants.APPLICATION_LOG);
//                 localStorage.removeItem(Constants.USER_MANAGEMENT_CARD);
//                 localStorage.removeItem(Constants.WORKSPACE_MANAGEMENT_CARD);
//                 localStorage.removeItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE);
//                 localStorage.removeItem(Constants.TASK_MANAGEMENT_CARD);
//                 localStorage.removeItem(Constants.APPLICATION_PARAMETER_CURD_ACCESS);
//                 localStorage.removeItem(Constants.APP_SERVICE_MANAGEMENT_CARD);
//                 localStorage.removeItem(Constants.CURRENTUSER);
//                 localStorage.removeItem(Constants.BREAK_PIT_LOCK);
//                 localStorage.removeItem(Constants.CREATE_UPDATE_DELETE_GLOBAL_PARAMS);
//                 localStorage.removeItem(Constants.DEPLOY_UNDEPLOY_FPIT);
//                 localStorage.removeItem(Constants.OPEN_UPDATE_WORKSPACE);
//                 localStorage.removeItem(Constants.RESTRUCTURING_VIEW);
//                 localStorage.removeItem(Constants.START_STOP_REMOVE_ERROR_FLAG_PIT);
//             }
//         } else {
//             this.sharedService.isHeader.next(!localStorage.getItem(Constants.SOURCE));

//             /*--------------- For Web Portal ---------------*/
//             if (localStorage.getItem(Constants.CURRENTUSER) || localStorage.getItem(Constants.SOURCE)) {
//                 /*------------ Code for Role Based Access And Redirection -----------*/
//                 const user_access_list = Object.keys(localStorage);
//                 const is_user_have_access = user_access_list.some(x => x === route.data.access);
//                 if (!is_user_have_access) {
//                     this.messageService.add({ key: 'dashboardInfoKey', severity: 'success', summary: '', detail: 'Sorry, you do not have this module/level access.' });
//                 }
//                 return is_user_have_access;
//             }
//             this.router.navigate([Constants.LOGIN_PAGE_URL], { queryParams: { returnUrl: state.url } });
//             return false;
//         }
//     }
// }

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private kcService: KeycloakSecurityService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> {
    if (!this.kcService.isAuthenticated()) {
      // this.kcService.kc.logout({
      //   redirectUri: window.location.origin + state.url,
      // });
      this.kcService.redirectToLogin(state.url);
      return false;
    }
    /*------------ Code for Role Based Access And Redirection -----------*/
    const user_access_list = Object.keys(localStorage);
    const is_user_have_access = user_access_list.some(
      (x) =>
        x === route.data.access ||
        x === route.data?.access2 ||
        x === route.data?.access3 ||
        x === route.data?.access4 ||
        x === route.data?.access5 ||
        x === route.data?.access6 ||
        x === route.data?.access7 ||
        x === route.data?.access8
    );
    if (!is_user_have_access) {
      this.router.navigate(['dashboard']);
      this.messageService.add({
        key: "dashboardInfoKey",
        severity: "success",
        summary: "",
        detail: "Access denied — you don’t have permission to this module.",
      });
      return is_user_have_access;
    }
    this.sharedService.isHeader.next(true);
    return this.kcService.isAuthenticated();
  }
}
