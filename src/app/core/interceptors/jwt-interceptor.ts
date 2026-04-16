import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../core/service/auth.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertService } from '../service/alert.service';
import { MessageService } from 'primeng/api';
import { Constants } from 'src/app/shared/components/constants';
@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private messageService: MessageService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.authService.getJwtToken()) {
      request = this.addToken(request, this.authService.getJwtToken());
    }

    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return this.handle401Error(request, next, error);
      } if (error instanceof HttpErrorResponse && error.status === 415) {
        return this.handle415Error(request, next, error);
      } else {
        return throwError(error);
      }
    }));
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler, error) {
    if (this.router.url === '/' || this.router.url === Constants.LOGIN_PAGE_URL) {
      return this.handle415Error(request, next, error);
    }

    if (request.url.includes('refreshToken')) {
      // We do another check to see if refresh token failed
      // In this case we want to logout user and to redirect it to login page

      this.authService.logout();
      this.messageService.add({ severity: 'error', summary: '', detail: 'Session time out.', life: 5000 });

      return throwError(error);
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((tokens) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(tokens.refreshToken);
          return next.handle(this.addToken(request, tokens.refreshToken));
        }));
    } else {
      this.isRefreshing = false;
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(refreshToken => {
          return next.handle(this.addToken(request, refreshToken));
        }));
    }
  }
  private handle415Error(request: HttpRequest<any>, next: HttpHandler, error) {
    this.alertService.error('Invalid Username or Password');
    return throwError(error);
  }
}
