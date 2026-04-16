import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { AlertService } from '../service/alert.service';
import { MessageService } from 'primeng/api';
import { Constants } from 'src/app/shared/components/constants';
import { ProgressiveLoaderService } from '../service/progressiveloader.service';
import { KeycloakSecurityService } from 'src/app/shared/services/keycloak-security.service';
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private messageService: MessageService,
    private auth: AuthService,
    public loaderService: ProgressiveLoaderService,
    private kcService: KeycloakSecurityService,
  ) { }


  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.kcService.isAuthenticated()) {
      this.kcService.redirectToLogin();
      return throwError('Session expired');
    }
    
    return next.handle(request)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          // if (err.status === 401) {
          //   this.loaderService.hide();
          //   if (this.router.url !== '/' && this.router.url !== Constants.LOGIN_PAGE_URL) {
          //     this.auth.logout();
          //   } else {
          //     this.alertService.error('Invalid Username or Password');
          //   }
          // }
          
          if ([0, 302, 401].includes(err.status)) {
            this.kcService.redirectToLogin();
          } else {
            let errorMessage: string;
            if (err.error && err.error.message) {
              errorMessage = err.error.message;
            } else {
              errorMessage = err.statusText;
            }
            if (err.statusText === 'Unknown Error') {
              this.kcService.redirectToLogin();
            }
            if (errorMessage === 'Unknown Error') {
              this.kcService.redirectToLogin();
              this.messageService.add({ severity: 'error', summary: '', detail: 'System / Network error', life: 5000 });
              this.alertService.error('System / Network error');
            } else if (errorMessage.includes('InvalidInput')) {
              this.messageService.add({ severity: 'error', summary: '', detail: 'Invalid input. Please enter correct input value.', life: 5000 });
            } else if (errorMessage.includes('Service Unavailable')) {
              this.alertService.error('No contact to TEIS server. Please verify that TEIS server is up and running.');
            } else {
              if (this.router.url === '/' || this.router.url === Constants.LOGIN_PAGE_URL) {
                this.alertService.error(errorMessage);
              } else {
                if ((
                  err.error.code !== 'NameUnavailable' &&
                  err.error.code !== 'UserNotPresent' &&
                  // err.error.code !== 'ADUserNotValid' &&
                  err.error.code !== 'NoItemsToUnDeploy'
                )) {
                  this.messageService.add({ severity: 'error', summary: '', detail: errorMessage, life: 5000 });
                }
              }
            }
          }
          const error = err || err.message || err.statusText;
          return throwError(error);
        })
      );
  }

}
