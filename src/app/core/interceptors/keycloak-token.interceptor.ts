import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { KeycloakSecurityService } from 'src/app/shared/services/keycloak-security.service';
import { catchError, switchMap } from 'rxjs/operators';
import { ProgressiveLoaderService } from '../service/progressiveloader.service';
import { KeycloakService } from 'keycloak-angular';

@Injectable()
export class KeycloakTokenInterceptor implements HttpInterceptor {

  constructor(
    private keycloakService: KeycloakService,
    private kcService: KeycloakSecurityService,
    public loaderService: ProgressiveLoaderService,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (!this.kcService.isAuthenticated()) return next.handle(request);
    if (!this.kcService.isAuthenticated()) {
      this.kcService.redirectToLogin();
      return throwError('Session expired');
    }

    const token = this.kcService.getToken();
    let req = token ? this.addToken(request, token) : request;

    return next.handle(req).pipe(catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {

        return this.handle401Error(req, next);

        // this.kcService.kc.updateToken(0).then(res => {
        //   if (res) {
        //     // If refresh is successful, update the request and retry
        //     const newToken = this.kcService.getToken();
        //     const newRequest = this.addToken(request, newToken);
        //     this.loaderService.hide();
        //     return next.handle(newRequest);
        //   }
        // }).catch((refreshError) => {
        //   // Handle refresh error here (e.g., log out the user)
        //   // You can also navigate to a logout page or trigger a logout action
        //   // this.keycloakService.logout();
        //   return throwError(refreshError);
        // });
      } else {
        // For other errors, just propagate the error
        return throwError(error);
      }
    }));
  }

  handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return from(this.kcService.kc.updateToken(5)).pipe(switchMap((isRefreshed) => {
      if (isRefreshed) {
        const newToken = this.kcService.kc.token;
        const newRequest = this.addToken(request, newToken);
        return next.handle(newRequest);
      } else {
        // If token refresh fails, redirect to login or handle as required
        // For simplicity, we'll just throw an error here
        this.kcService.redirectToLogin();
        throw new Error('Token refresh failed');
      }
    }), catchError((error) => {
      this.kcService.redirectToLogin();
      return throwError(error);
    }));

    // return new Promise((resolve, reject) => {
    //   return this.kcService.kc.updateToken(5).then((res: any) => {
    //     if (res) {
    //       // If refresh is successful, update the request and retry
    //       const newToken = this.kcService.kc.token;
    //       const newRequest = this.addToken(request, newToken);
    //       return next.handle(newRequest);
    //     }
    //   }).catch((refreshError) => {
    //     // Handle refresh error here (e.g., log out the user)
    //     // You can also navigate to a logout page or trigger a logout action
    //     // this.keycloakService.logout();
    //     return throwError(refreshError);
    //   });
    // }) as Promise<HttpEvent<any>>;
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}
