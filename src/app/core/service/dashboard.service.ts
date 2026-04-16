import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, delay } from 'rxjs/operators';
import { User } from '../model/user';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardData } from '../model/Dashboard';
import { SystemStatus } from '../model/SystemStatus';
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private http: HttpClient) { }

  baseUrl = environment.baseUrl;

  getDashboardCards(): Observable<DashboardData> {
    const url = this.baseUrl + 'system/getDashboard';
    return this.http.get(url).pipe(
      // Adapt each item in the raw data array
      map((data: DashboardData) => data),
    );
  }

  /*========== Get Dashboard Log Card Error Counts ==========*/
  getDashboardLogErrorCounts() {
    const url = this.baseUrl + 'dashboard/tasks/errorCount';
    return this.http.get(url).pipe(
      // Adapt each item in the raw data array
      map((data: DashboardData) => data),
    );
  }

  /*========== Get Dashboard Flow Card Error Counts ==========*/
  getDashboardFlowErrorCounts() {
    const url = this.baseUrl + 'dashboard/flows/errorCount';
    return this.http.get(url).pipe(
      // Adapt each item in the raw data array
      map((data: DashboardData) => data),
    );
  }
  
  getStatus(): Observable<SystemStatus[]> {
    const url = this.baseUrl + 'system/status';
    return this.http.get(url).pipe(
      map((data: SystemStatus[]) => data),
    );
  }

}
