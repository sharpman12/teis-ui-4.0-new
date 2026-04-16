import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LogReportService } from '../../core/service/logreport.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogReportResolverService implements Resolve<any> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return  this.logReportService.getLogByCardId(route.params['id']);
  }

  constructor(private logReportService: LogReportService) { }
}
