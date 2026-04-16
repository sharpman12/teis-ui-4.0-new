import { Injectable } from '@angular/core';
import { WebFlow } from '../../core/model/flow/WebFlow';
import { FlowGroup } from '../../core/model/flow/FlowGroup';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { FlowService } from '../../core/service/flow.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlowsGroupIdResolverService implements Resolve<any> {
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return  this.flowService.getFlowsByGroupId(route.params['id']);
  } 

  constructor(private flowService: FlowService) { }        
}
