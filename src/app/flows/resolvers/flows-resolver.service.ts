import { Injectable } from '@angular/core';
import { FlowCard } from '../../core/model/FlowCard';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FlowService } from '../../core/service/flow.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlowsResolverService implements Resolve<FlowCard[]> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FlowCard[]> {
    return  this.flowService.getCards();
  } 

  constructor(private flowService: FlowService) { }        
}
