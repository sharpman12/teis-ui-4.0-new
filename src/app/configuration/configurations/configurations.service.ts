import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LogMaintenanceDto, ScriptEngineGroupDto, ScriptParameterDto, SEConfigurationDto, SetupDto } from './config';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationsService {
  readonly getAllAdaptersUrl = environment.baseUrl + 'configuration/getAllAdapters';
  readonly getAllIdentifiersUrl = environment.baseUrl + 'configuration/getIdentifiers';
  readonly getPluginInfoUrl = environment.baseUrl + 'configuration/getPluginInfo';
  readonly getAllWebServicesUrl = environment.baseUrl + 'configuration/getActiveWebServices';
  readonly getWebServicesByUserUrl = environment.baseUrl + 'configuration/getActiveWebServicesAccess';
  readonly getAllApplicationServicesUrl = environment.baseUrl + 'configuration/getActiveApplicationServices';
  readonly getScriptEngineUrl = environment.baseUrl + 'configuration/getAllAvailableScriptEngines';
  readonly getScriptParametersUrl = environment.baseUrl + 'configuration/getScriptParameters';
  readonly createScriptParametersUrl = environment.baseUrl + 'configuration/createScriptParameter';
  readonly updateScriptParameterUrl = environment.baseUrl + 'configuration/updateScriptParameter';
  readonly deleteScriptParameterUrl = environment.baseUrl + 'configuration/deleteScriptParameter';
  readonly getUIConfigurationsUrl = environment.baseUrl + 'configuration/getUIConfigurations';
  readonly updateUIConfigurationsUrl = environment.baseUrl + 'configuration/updateUIConfigurations';
  readonly getSEGroupsUrl = environment.baseUrl + 'configuration/getSEGroups';
  readonly updateScriptEngineUrl = environment.baseUrl + 'configuration/updateScriptEngine';
  readonly createScriptEngineGroupUrl = environment.baseUrl + 'configuration/createScriptEngineGroup';
  readonly updateScriptEngineGroupUrl = environment.baseUrl + 'configuration/updateScriptEngineGroup';
  readonly deleteScriptEngineGroupUrl = environment.baseUrl + 'configuration/deleteScriptEngineGroup';
  readonly getUtilityByTypeUrl = environment.baseUrl + 'configuration/getServerConfig';
  readonly getMailConfigUrl = environment.baseUrl + 'configuration/getMailConfig';
  readonly updateServerUrl = environment.baseUrl + 'utilityServices/updateUtilities';
  readonly getAllLogMaintenanceConfigUrl = environment.baseUrl + 'configuration/getAllLogMaintenanceConfig';
  readonly createLogMaintenanceConfigUrl = environment.baseUrl + 'configuration/createLogMaintenanceConfig';
  readonly updateLogMaintenanceConfigUrl = environment.baseUrl + 'configuration/updateLogMaintenanceConfig';
  readonly deleteLogMaintenanceConfigUrl = environment.baseUrl + 'configuration/deleteLogMaintenanceConfig';
  readonly testSMTPConnectionUrl = environment.baseUrl + 'configuration/mail';

  constructor(private http: HttpClient) { }

  /*========= Get All Workspaces =========*/
  getAllAdapters(): Observable<any> {
    return this.http.get<any>(`${this.getAllAdaptersUrl}`);
  }

  /*========= Get All Identifiers =========*/
  getAllIdentifiers(): Observable<any> {
    return this.http.get<any>(`${this.getAllIdentifiersUrl}`);
  }

  /*========= Get Plugin Info =========*/
  getPluginInfo(): Observable<any> {
    return this.http.get<any>(`${this.getPluginInfoUrl}`);
  }

  /*========= Get All Web Services =========*/
  getAllWebServices(): Observable<any> {
    return this.http.get<any>(`${this.getAllWebServicesUrl}`);
  }

  /*========= Get Web Services By User =========*/
  getWebServices(): Observable<any> {
    return this.http.get<any>(`${this.getWebServicesByUserUrl}`);
  }

  /*========= Get All App Services =========*/
  getAllAppServices(): Observable<any> {
    return this.http.get<any>(`${this.getAllApplicationServicesUrl}`);
  }

  /*========= Get Script Engine =========*/
  getScriptEngine(): Observable<any> {
    return this.http.get<any>(`${this.getScriptEngineUrl}`);
  }

  /*========= Get Script Parameters =========*/
  getScriptParams(): Observable<any> {
    return this.http.get<any>(`${this.getScriptParametersUrl}`);
  }

  /*========= Create Script Parameters =========*/
  createScriptParams(scriptParameterDto: ScriptParameterDto): Observable<any> {
    return this.http.post<any>(`${this.createScriptParametersUrl}`, scriptParameterDto);
  }

  /*========= Update Script Parameters =========*/
  updateScriptParams(scriptParameterDto: ScriptParameterDto): Observable<any> {
    return this.http.post<any>(`${this.updateScriptParameterUrl}`, scriptParameterDto);
  }

  /*========= Delete Script Parameters =========*/
  deleteScriptParams(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteScriptParameterUrl}/${id}`);
  }

  /*========= Get User Interface Setup =========*/
  getUiSetup(instanceidentity: string): Observable<any> {
    return this.http.get<any>(`${this.getUIConfigurationsUrl}/${instanceidentity}`);
  }

  /*========= Update User Interface Setup =========*/
  updateUIConfig(UtilityDto: any): Observable<any> {
    return this.http.post<any>(`${this.updateUIConfigurationsUrl}`, UtilityDto);
  }

  /*========= Get SE Group =========*/
  getSEGroup(): Observable<any> {
    return this.http.get<any>(`${this.getSEGroupsUrl}`);
  }

  /*========= Update Script Engine =========*/
  updateSE(seConfigurationDto: SEConfigurationDto): Observable<any> {
    return this.http.post<any>(`${this.updateScriptEngineUrl}`, seConfigurationDto);
  }

  /*========= Create SE Group =========*/
  createSEGroup(scriptEngineGroupDto: ScriptEngineGroupDto): Observable<any> {
    return this.http.post<any>(`${this.createScriptEngineGroupUrl}`, scriptEngineGroupDto);
  }

  /*========= Update SE Group =========*/
  updateSEGroup(scriptEngineGroupDto: ScriptEngineGroupDto): Observable<any> {
    return this.http.post<any>(`${this.updateScriptEngineGroupUrl}`, scriptEngineGroupDto);
  }

  /*========= Delete SE Group =========*/
  deleteSEGroup(id: number): Observable<any> {
    return this.http.delete<any>(`${this.deleteScriptEngineGroupUrl}/${id}`);
  }

  /*========= Get Server =========*/
  getServer(type: string): Observable<any> {
    return this.http.get<any>(`${this.getUtilityByTypeUrl}`);
  }

  /*========= Get Mail Configuration =========*/
  getMailConfig(type: string): Observable<any> {
    return this.http.get<any>(`${this.getMailConfigUrl}`);
  }

  /*========= Update Server =========*/
  updateServer(UtilityDto: any): Observable<any> {
    return this.http.post<any>(`${this.updateServerUrl}`, UtilityDto);
  }

  /*========= Get Log Maintainance =========*/
  getLogMaintainance(): Observable<any> {
    return this.http.get<any>(`${this.getAllLogMaintenanceConfigUrl}`);
  }

  /*========= Create Log Maintenance =========*/
  createLogMaintenanceConfig(logMaintenanceDto: LogMaintenanceDto): Observable<any> {
    return this.http.post<any>(`${this.createLogMaintenanceConfigUrl}`, logMaintenanceDto);
  }

  /*========= Update Log Maintenance =========*/
  updateLogMaintenanceConfig(logMaintenanceDto: LogMaintenanceDto): Observable<any> {
    return this.http.post<any>(`${this.updateLogMaintenanceConfigUrl}`, logMaintenanceDto);
  }

  /*========= Delete Log Maintenance =========*/
  deleteLogMaintenanceConfig(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteLogMaintenanceConfigUrl}/${id}`);
  }

  /*========= Test SMTP Connection =========*/
  checkSMTPConnection(mailDto: any): Observable<any> {
    return this.http.post<any>(`${this.testSMTPConnectionUrl}`, mailDto);
  }
}
