import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RolesService } from 'src/app/admin/roles/roles.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements Resolve<any> {
  constructor(
    private router: Router,
    private rolesService: RolesService
  ) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.rolesService.getRoleById(id).pipe(map(role => {
      if (role) {
        return role;
      } else {
        this.router.navigate(['/admin/roles']);
        return null;
      }
    }));
  }

}
