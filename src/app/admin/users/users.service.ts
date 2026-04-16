import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AllUsers, Users, Utility } from './users';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  getAllUsersUrl = environment.baseUrl + 'user/getAllTeisUsers';
  createUserUrl = environment.baseUrl + 'user/createTeisUser';
  updateUserUrl = environment.baseUrl + 'user/updateTeisUser';
  deleteUserUrl = environment.baseUrl + 'user/deleteTeisUser/';
  getUserByIdUrl = environment.baseUrl + 'user/getTeisUserById/';
  getAllProfilesUrl = environment.baseUrl + 'profile/getAllProfiles';
  getADUsersUrl = environment.baseUrl + 'activedirectory/getADUsers/';
  getADUserByUsernameUrl = environment.baseUrl + 'activedirectory/getADUserByUsername/';
  testADConnectionUrl = environment.baseUrl + 'activedirectory/testADConnection';
  getUtilityByTypeUrl = environment.baseUrl + 'utilityServices/getUtilityByType/LDAP';
  updateUtilityUrl = environment.baseUrl + 'utilityServices/updateLdapUtilities';
  isLastUserAttachedUrl = environment.baseUrl + 'user/isLastAdminUserAttachedToProfile';


  constructor(private http: HttpClient) { }

  getAllUsers(SearchCriteria): Observable<AllUsers> {
    return this.http.post<AllUsers>(this.getAllUsersUrl, SearchCriteria, {
      responseType: 'json'
    });
  }

  createUser(userData: Users): Observable<Users> {
    return this.http.post<Users>(this.createUserUrl, userData, {
      responseType: 'json'
    });
  }

  deleteUser(id: any): Observable<any> {
    return this.http.delete(this.deleteUserUrl + id);
  }

  getUserById(id: any): Observable<Users> {
    return this.http.get<Users>(this.getUserByIdUrl + id);
  }

  updateUser(userData: Users): Observable<Users> {
    return this.http.put<Users>(this.updateUserUrl, userData, {
      responseType: 'json'
    });
  }

  /*=========== Get All Profile ============*/
  getAllProfiles(SearchCriteria): Observable<any> {
    return this.http.post(this.getAllProfilesUrl, SearchCriteria, {
      responseType: 'json'
    });
  }

  /*=========== Get User From AD ============*/
  getUserFromAd(searchTerm: string): Observable<any> {
    return this.http.get<any>(this.getADUsersUrl + searchTerm);
  }

  /*=========== Get User From AD Sync ============*/
  getADUserByUsername(userName: string): Observable<Users> {
    return this.http.get<Users>(this.getADUserByUsernameUrl + userName);
  }

  /*=========== Test AD Connection ============*/
  testADConnection(): Observable<any> {
    return this.http.get<any>(this.testADConnectionUrl);
  }

  /*=========== Get Utility By Type ============*/
  getUtilityByType(): Observable<Utility> {
    return this.http.get<Utility>(this.getUtilityByTypeUrl);
  }

  /*=========== Update Utility ============*/
  updateUtility(utilityData: Utility): Observable<Utility> {
    return this.http.post<Utility>(this.updateUtilityUrl, utilityData, {
      responseType: 'json'
    });
  }

  /*============ Check Is Last User Connected To Profile ============*/
  isLastUserAttachedToProfile(profileId: string): Observable<any> {
    return this.http.get<any>(`${this.isLastUserAttachedUrl}/${profileId}`);
  }

}
