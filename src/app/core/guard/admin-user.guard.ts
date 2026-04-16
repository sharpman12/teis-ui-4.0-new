import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { SharedService } from '../../shared/services/shared.service';
import { UsersService } from '../../admin/users/users.service';
import { GlobalDataService } from '../../admin/global-data.service';
import { Constants } from 'src/app/shared/components/constants';

@Injectable({
  providedIn: 'root'
})
export class AdminUserGuard implements Resolve<any> {
  currentUser: any = null;

  constructor(
    private router: Router,
    private usersService: UsersService,
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
      // includeSuperAdmin: this.currentUser?.superAdminUser ? true : false,
      // includeAdmin: this.currentUser?.adminUser ? true : false,
      // includeUser: this.currentUser?.superAdminUser ? false : this.currentUser?.adminUser ? false : true,
      profileId: null
    };
    // tslint:disable-next-line: max-line-length
    return this.sharedService.isUserAction ? of(this.globalDataService.getUsers()) : this.usersService.getAllUsers(SearchCriteria).pipe(map(res => {
      if (res['users']) {
        return res;
      } else {
        this.router.navigate(['/dashboard']);
        return null;
      }
    }));
  }

}
