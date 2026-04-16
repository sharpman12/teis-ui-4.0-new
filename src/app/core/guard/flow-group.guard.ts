import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BusinessMgmtService } from 'src/app/business-management/business-mgmt/business-mgmt.service';

@Injectable({
  providedIn: 'root'
})
export class FlowGroupGuard implements Resolve<any> {
  constructor(
    private router: Router,
    private businessMgmtService: BusinessMgmtService
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.businessMgmtService.getFlowGroupById(id).pipe(map(res => {
      if (res) {
        return res;
      } else {
        this.router.navigate(['/business_management/web_flow_group']);
        return null;
      }
    }));
  }

}
