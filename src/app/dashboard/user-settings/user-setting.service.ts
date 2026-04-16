import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserSettingService {
  private readonly getUserSettingUrl = environment.baseUrl + 'userSettings/getUserSettingModule';
  private readonly saveUserSettingUrl = environment.baseUrl + 'userSettings/createUserSettings';
  
  constructor(private http: HttpClient) { }

  getUserSetting(obj: any): Observable<any> {
    return this.http.get<any>(`${this.getUserSettingUrl}/${obj?.moduleCode}`);
  }

  saveUserSetting(obj: any): Observable<any> {
    return this.http.post<any>(this.saveUserSettingUrl, obj);
  }
}
