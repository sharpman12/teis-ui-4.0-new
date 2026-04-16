import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsersService } from 'src/app/admin/users/users.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements Resolve<any> {
  constructor(
    private router: Router,
    private usersService: UsersService
  ) { }
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<any> {
    const id = route.paramMap.get('id');
    return this.usersService.getUserById(id).pipe(map(user => {
      if (user) {
        return user;
      } else {
        this.router.navigate(['/admin/users']);
        return null;
      }
    }));
  }

}
