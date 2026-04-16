import { Injectable } from '@angular/core';
import { LogCard } from '../core/model/LogsCard';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DashboardService } from '../core/service/dashboard.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardResolverService implements Resolve<LogCard[]> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return this.dasbboardService.getDashboardCards();
  }

  constructor(private dasbboardService: DashboardService) { }
}
