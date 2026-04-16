import { Injectable } from '@angular/core';
import { LogCard } from '../../core/model/LogsCard';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LogService } from '../../core/service/log.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogResolverService implements Resolve<LogCard[]> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return  this.logService.getCards();
  }

  constructor(private logService: LogService) { }
}
