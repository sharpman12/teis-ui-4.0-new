import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
// import { User } from '../model/user';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SystemStatus } from '../model/SystemStatus';

@Injectable({
  providedIn: 'root'
})
export class SystemStatusService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.baseUrl;

  getStatus(): Observable<SystemStatus[]> {
    const url = this.baseUrl + 'system/status';
    // return this.http.get(url).pipe(
    //   // Adapt each item in the raw data array
    //   map((data: SystemStatus[]) => data),
    // );
    return this.http.get<any>(url);
  }

  getOperationalStatus(): Observable<any> {
    const url = this.baseUrl + 'system/status/operational';
    // return this.http.get(url).pipe(
    //   // Get response as a boolean
    //   map((data: any) => data),
    // );
    return this.http.get<any>(url);
  }

  getIndexLogStatus(): Observable<any> {
    const url = this.baseUrl + 'system/status/indexLog';
    return this.http.get<any>(url);
  }
}
