import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GlobalDataService } from '../../admin/global-data.service';
import { ProfilesService } from '../../admin/profiles/profiles.service';
import { SharedService } from '../../shared/services/shared.service';
import { Constants } from 'src/app/shared/components/constants';

@Injectable({
  providedIn: 'root'
})
export class AdminProfileGuard implements Resolve<any> {
  currentUser: any = null;
  
  constructor(
    private router: Router,
    private profilesService: ProfilesService,
    private sharedService: SharedService,
    private globalDataService: GlobalDataService
  ) { 
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> {
    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = {
      type: 'All',
      pageNumber: 1,
      name: null,
      excludeRecordId: null,
      userType: userType,
      includeSuperAdmin: this.currentUser?.superAdminUser ? false : false,
      includeAdmin: this.currentUser?.superAdminUser ? true : this.currentUser?.adminUser ? false : false,
      includeUser: this.currentUser?.superAdminUser ? false : this.currentUser?.adminUser ? true : true,
      profileId: null
    };
    // tslint:disable-next-line: max-line-length
    return this.sharedService.isProfileAction ? of(this.globalDataService.getProfiles()) : this.profilesService.getAllProfiles(SearchCriteria).pipe(map(res => {
      if (res['profiles']) {
        return res;
      } else {
        this.router.navigate(['/dashboard']);
        return null;
      }
    }));
  }

}
