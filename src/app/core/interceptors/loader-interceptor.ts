import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ProgressiveLoaderService } from '../../core/service/progressiveloader.service';
@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
    constructor(public loaderService: ProgressiveLoaderService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let refreshItem = false;
        if (req.urlWithParams.indexOf('getErrorStateBy') > -1 ||
            req.urlWithParams.indexOf('getDashboard') > -1 ||
            req.urlWithParams.indexOf('taskErrorCount') > -1 ||
            req.urlWithParams.indexOf('flowErrorCount') > -1 ||
            req.urlWithParams.indexOf('searchLogByReportId') > -1 ||
            req.urlWithParams.indexOf('searchLog') > -1 ||
            req.urlWithParams.indexOf('flow/search') > -1 ||
            req.urlWithParams.indexOf('getSystemStatus') > -1 ||
            req.urlWithParams.indexOf('getOperationalStatus') > -1 ||
            req.urlWithParams.indexOf('getIndexLogStatus') > -1 ||
            req.urlWithParams.indexOf('getSearchRecordsCount') > -1 || 
            req.urlWithParams.indexOf('getMonitorSearchRecordsCount') > -1 ||
            req.urlWithParams.indexOf('getWorkspaceItemsInfo') > -1 || 
            req.urlWithParams.indexOf('userInfo') > -1 || 
            req.urlWithParams.indexOf('token') > -1) {
            refreshItem = true;
        }

        if (refreshItem === false) {// global loader
            this.loaderService.show();
            return next.handle(req).pipe(
                finalize(() => this.loaderService.hide())
            );
        } else {// Refreshing individual Item
            this.loaderService.showItemRefreshing();
            return next.handle(req).pipe(
                finalize(() => this.loaderService.hideItemRefreshing())
            );
        }
    }
}

