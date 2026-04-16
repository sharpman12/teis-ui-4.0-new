import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { addUpdateUrl } from './web-service-mgmt';

@Injectable({
  providedIn: 'root'
})
export class WebServiceMgmtService {
  private readonly getAllWebServicesUrl = environment.baseUrl + 'configuration/getActiveWebServices';
  private readonly getWebServicesUrl = environment.baseUrl + 'configuration/getActiveWebServicesAccess';
  private readonly getAppParamUrl = environment.baseUrl + 'configuration/getAppParam';
  private readonly createAppParamsUrl = environment.baseUrl + 'configuration/createAppParams';
  private readonly updateAppParamUrl = environment.baseUrl + 'configuration/updateAppParam';
  private readonly deleteAppParamUrl = environment.baseUrl + 'configuration/deleteAppParam';
  private readonly updateAppRegistryUrl = environment.baseUrl + 'application/updateAppRegistry';
  
  constructor(private http: HttpClient) { }

  /*========= Get All Web Services =========*/
  getAllWebServices(): Observable<any> {
    return this.http.get<any>(`${this.getAllWebServicesUrl}`);
  }

  getWebServices(): Observable<any> {
    return this.http.get<any>(`${this.getWebServicesUrl}`);
  }

  /*========= Create Web Service Url =========*/
  createWebService(appRegId: number, workspaceId: number, urlObj: addUpdateUrl): Observable<any> {
    return this.http.post<any>(`${this.createAppParamsUrl}/${appRegId}/${workspaceId}`, urlObj);
  }

  /*========= Update Web Service Uri =========*/
  updateWebService(appRegId: number, uriObj: addUpdateUrl): Observable<any> {
    return this.http.post<any>(`${this.updateAppParamUrl}`, uriObj);
  }

  /*========= Delete Web Service Url =========*/
  deleteWebService(appRegId: number): Observable<any> {
    return this.http.delete<any>(`${this.deleteAppParamUrl}/${appRegId}`);
  }

  /*========= Update Web Service Url =========*/
  updateWebServiceUrl(urlObj: any): Observable<any> {
    return this.http.post<any>(`${this.updateAppRegistryUrl}`, urlObj);
  }
}
