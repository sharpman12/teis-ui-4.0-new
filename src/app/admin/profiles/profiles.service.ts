import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AllProfiles, Profiles } from './profiles';

@Injectable({
  providedIn: 'root'
})
export class ProfilesService {
  getAllProfilesUrl = environment.baseUrl + 'profile/getAllProfiles';
  createProfileUrl = environment.baseUrl + 'profile/createProfile';
  updateProfileUrl = environment.baseUrl + 'profile/updateProfile';
  updateArchiveProfileUrl = environment.baseUrl + 'profile/updateArchiveProfile';
  deleteProfileUrl = environment.baseUrl + 'profile/deleteProfile/';
  deleteArchiveProfileUrl = environment.baseUrl + 'profile/deleteArchiveProfile/';
  getProfileByIdUrl = environment.baseUrl + 'profile/getProfileById/';
  getProfileDetailsByIdUrl = environment.baseUrl + 'profile/getProfileDetailsById/';
  getFunctionalMapByProfileIdUrl = environment.baseUrl + 'functionalmap/getFunctionalMapByProfileId/';
  getAllRolesUrl = environment.baseUrl + 'role/getAllRoles';
  getFunctionalMapUrl = environment.baseUrl + 'functionalmap/getFunctionalMap';
  getArchiveFunctionalMapByProfileIdUrl = environment.baseUrl + 'functionalmap/getArchiveFunctionalMapByProfileId/';

  constructor(private http: HttpClient) { }

  /*=========== Get All Profile ============*/
  getAllProfiles(SearchCriteria): Observable<AllProfiles> {
    return this.http.post<AllProfiles>(this.getAllProfilesUrl, SearchCriteria, {
      responseType: 'json'
    });
  }

  /*=========== Delete Profile ============*/
  deleteProfile(id: any): Observable<any> {
    return this.http.delete(this.deleteProfileUrl + id);
  }

  /*=========== Delete Archive Profile ============*/
  deleteArchiveProfile(id: any): Observable<any> {
    return this.http.delete(this.deleteArchiveProfileUrl + id);
  }

  /*=========== Create Profile ============*/
  createProfile(profileData: Profiles): Observable<Profiles> {
    return this.http.post<Profiles>(this.createProfileUrl, profileData, {
      responseType: 'json'
    });
  }

  /*=========== Get Profile By Id ============*/
  getProfileById(id: any): Observable<Profiles> {
    return this.http.get<Profiles>(this.getProfileByIdUrl + id);
  }

  /*=========== Get Profile By Id ============*/
  getProfileDetailsById(id: any): Observable<Profiles> {
    return this.http.get<Profiles>(this.getProfileDetailsByIdUrl + id);
  }

  /*=========== Get Functional Map By Profile Id ============*/
  getFunctionalMapByProfileId(id: any): Observable<any> {
    return this.http.get<any>(this.getFunctionalMapByProfileIdUrl + id);
  }

  /*=========== Get Archive Functional Map By Profile Id ============*/
  getArchiveFunctionalMapByProfileId(id: any): Observable<any> {
    return this.http.get<any>(this.getArchiveFunctionalMapByProfileIdUrl + id);
  }

  /*=========== Update Profile ============*/
  updateProfile(profileData: Profiles): Observable<Profiles> {
    return this.http.put<Profiles>(this.updateProfileUrl, profileData, {
      responseType: 'json'
    });
  }

  /*=========== Update Archive Profile ============*/
  updateArchiveProfile(profileData: Profiles): Observable<Profiles> {
    return this.http.post<Profiles>(this.updateArchiveProfileUrl, profileData, {
      responseType: 'json'
    });
  }

  /*=========== Get All Role ============*/
  getAllRoles(SearchCriteria): Observable<any> {
    return this.http.post(this.getAllRolesUrl, SearchCriteria, {
      responseType: 'json'
    });
  }

  /*=========== Get Functional Map ============*/
  getFunctionalMap(): Observable<any> {
    return this.http.get(this.getFunctionalMapUrl);
  }

}
