import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {
  changePasswordUrl = environment.baseUrl + 'user/changePassword';

  constructor(private http: HttpClient) { }

  updatePassword(userData): Observable<any> {
    return this.http.post<any>(this.changePasswordUrl, userData, {
      responseType: 'json'
    });
  }

}
