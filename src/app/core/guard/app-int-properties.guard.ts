import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppIntegrationService } from 'src/app/application-integration/app-integration/app-integration.service';

@Injectable({
  providedIn: 'root'
})
export class AppIntPropertiesGuard implements Resolve<any> {
  constructor(
    private router: Router,
    private appIntegrationService: AppIntegrationService,
  ) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> {
    const itemType = route.paramMap.get('itemType');
    const isCreatePIT = route.paramMap.get('isCreatePIT');
    const workspaceId = route.paramMap.get('workspaceId');
    const belongsToFolderId = route.paramMap.get('belongsToFolderId');
    const itemId = route.paramMap.get('itemId');
    if (itemType === 'process') {
      return this.appIntegrationService.getDeployedProcessById(Number(itemId)).pipe(map(res => {
        if (res) {
          return res;
        } else {
          return null;
        }
      }));
    } else if (itemType === 'integration') {
      return this.appIntegrationService.getDeployedIntegrationById(Number(itemId)).pipe(map(res => {
        if (res) {
          return res;
        } else {
          return null;
        }
      }));
    } else if (itemType === 'trigger') {
      return this.appIntegrationService.getDeployedTriggerById(Number(itemId)).pipe(map(res => {
        if (res) {
          return res;
        } else {
          return null;
        }
      }));
    } else if (itemType === 'webservice') {
      const taskDetailsDto = {
      deployed: false,
      disabled: false,
      itemName: "",
      itemType: "WEBSERVICE",
      locked: false,
      showAll: true,
      workspaceId: workspaceId
    }

      return this.appIntegrationService.getWebServiceTree(taskDetailsDto).pipe(map(res => {
        if (res) {
          return res;
        } else {
          return null;
        }
      }));
    } else {
      return null;
    }
  }

}
