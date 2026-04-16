import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppRegistryDto } from './application-mgmt';

@Injectable({
  providedIn: 'root'
})
export class ApplicationMgmtService {
  readonly getApplicationServicesUrl = environment.baseUrl + 'configuration/getActiveApplicationServices';
  readonly updateAppRegistryUrl = environment.baseUrl + 'application/updateAppRegistry';

  constructor(private http: HttpClient) { }

  /*========= Get All App Services =========*/
  getAllAppServices(): Observable<AppRegistryDto[]> {
    return this.http.get<AppRegistryDto[]>(`${this.getApplicationServicesUrl}`);
  }

  /*========= Update App Registry =========*/
  updateAppRegistry(updateServicesDto: AppRegistryDto): Observable<any> {
    return this.http.post(this.updateAppRegistryUrl, updateServicesDto);
  }

}
