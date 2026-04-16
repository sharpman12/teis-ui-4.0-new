import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AllRoles, Roles } from './roles';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  getAllRolesUrl = environment.baseUrl + 'role/getAllRoles';
  createRoleUrl = environment.baseUrl + 'role/createRole';
  updateRoleUrl = environment.baseUrl + 'role/updateRole';
  deleteRoleUrl = environment.baseUrl + 'role/deleteRole/';
  getRoleByIdUrl = environment.baseUrl + 'role/getRoleById/';
  getRoleDetailsByIdUrl = environment.baseUrl + 'role/getRoleById/';
  getAllModulesUrl = environment.baseUrl + 'module/getAllModules';
  getRoleByUsernameUrl = environment.baseUrl + 'role/getRolesByUsername/';

  constructor(private http: HttpClient) { }

  /*=========== Get All Role ============*/
  getAllRoles(SearchCriteria): Observable<AllRoles> {
    return this.http.post<AllRoles>(this.getAllRolesUrl, SearchCriteria, {
      responseType: 'json'
    });
  }

  /*=========== Delete Role ============*/
  deleteRole(id: any): Observable<any> {
    return this.http.delete(this.deleteRoleUrl + id);
  }

  /*=========== Create Role ============*/
  createRole(roleData: Roles): Observable<Roles> {
    return this.http.post<Roles>(this.createRoleUrl, roleData, {
      responseType: 'json'
    });
  }

  /*=========== Get Role By Id ============*/
  getRoleById(id: any): Observable<Roles> {
    return this.http.get<Roles>(this.getRoleByIdUrl + id);
  }

  /*=========== Get Role By Id ============*/
  getRoleDetailsById(id: any): Observable<Roles> {
    return this.http.get<Roles>(this.getRoleDetailsByIdUrl + id);
  }

  /*=========== Update Role ============*/
  updateRole(roleData: Roles): Observable<Roles> {
    return this.http.put<Roles>(this.updateRoleUrl, roleData, {
      responseType: 'json'
    });
  }

  /*============ Get All Modules =============*/
  getAllModules(): Observable<any> {
    return this.http.get(this.getAllModulesUrl);
  }

  /*============ Get Role By Username =============*/
  getRoleByUsername(username: string): Observable<any> {
    return this.http.get<any>(this.getRoleByUsernameUrl + username);
  }
}
