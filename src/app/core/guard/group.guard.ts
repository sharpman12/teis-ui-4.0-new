import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GroupsService } from 'src/app/admin/groups/groups.service';

@Injectable({
  providedIn: 'root'
})
export class GroupGuard implements Resolve<any> {
  constructor(
    private router: Router,
    private groupsService: GroupsService
  ) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> {
      const id = route.paramMap.get('id');
      return this.groupsService.getGroupById(id).pipe(map(role => {
        if (role) {
          return role;
        } else {
          this.router.navigate(['/admin/roles']);
          return null;
        }
      }));
  }

}
