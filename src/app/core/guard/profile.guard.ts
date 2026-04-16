import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { GlobalDataService } from '../../admin/global-data.service';
import { ProfilesService } from '../../admin/profiles/profiles.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileGuard implements Resolve<any> {
  constructor(
    private router: Router,
    private profilesService: ProfilesService,
    private globalDataService: GlobalDataService
  ) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    let prof;
    let isProfile = false;
    if (id) {
      const storeProfiles = this.globalDataService.getProfileOnSelect();
      if (storeProfiles?.length) {
        storeProfiles.forEach(el => {
          if (el.id === id) {
            isProfile = true;
            prof = el;
          }
        });
      }
    }
    return isProfile ? of(prof) : this.profilesService.getProfileById(id).pipe(map(profile => {
      if (profile) {
        return profile;
      } else {
        this.router.navigate(['/admin/profiles']);
        return null;
      }
    }));
  }

}
