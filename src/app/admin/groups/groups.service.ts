import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AllUsers } from '../users/users';
import { AllGroups, Groups } from './groups';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  getAllGroupsUrl = environment.baseUrl + 'userGroup/getAllUserGroups';
  createGroupUrl = environment.baseUrl + 'userGroup/createUserGroup';
  updateGroupUrl = environment.baseUrl + 'userGroup/updateUserGroup';
  deleteGroupUrl = environment.baseUrl + 'userGroup/deleteUserGroup/';
  getGroupByIdUrl = environment.baseUrl + 'userGroup/getUserGroupById/';
  getAllUsersUrl = environment.baseUrl + 'getAllTeisUsers';

  constructor(private http: HttpClient) { }

  /*=========== Get All Group ============*/
  getAllGroups(SearchCriteria): Observable<AllGroups> {
    return this.http.post<AllGroups>(this.getAllGroupsUrl, SearchCriteria, {
      responseType: 'json'
    });
  }

  /*=========== Get All Users ============*/
  getAllUsers(SearchCriteria): Observable<AllUsers> {
    return this.http.post<AllUsers>(this.getAllUsersUrl, SearchCriteria, {
      responseType: 'json'
    });
  }

  /*=========== Delete Group ============*/
  deleteGroup(id: any): Observable<any> {
    return this.http.delete(this.deleteGroupUrl + id);
  }

  /*=========== Create Group ============*/
  createGroup(groupData: Groups): Observable<Groups> {
    return this.http.post<Groups>(this.createGroupUrl, groupData, {
      responseType: 'json'
    });
  }

  /*=========== Get Group By Id ============*/
  getGroupById(id: any): Observable<Groups> {
    return this.http.get<Groups>(this.getGroupByIdUrl + id);
  }

  /*=========== Update Group ============*/
  updateGroup(groupData: Groups): Observable<Groups> {
    return this.http.put<Groups>(this.updateGroupUrl, groupData, {
      responseType: 'json'
    });
  }

}
