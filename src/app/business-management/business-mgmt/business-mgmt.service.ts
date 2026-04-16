import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FlowGroup, FlowModel, FlowType } from './businessmgmt';

@Injectable({
  providedIn: 'root'
})
export class BusinessMgmtService {
  readonly getAllFlowTypeUrl = environment.baseUrl + 'businessMgmt/getAllFlowType';
  readonly getFlowTypeByIdUrl = environment.baseUrl + 'businessMgmt/getFlowTypeById';
  readonly createFlowTypeUrl = environment.baseUrl + 'businessMgmt/createFlowType';
  readonly updateFlowTypeUrl = environment.baseUrl + 'businessMgmt/updateFlowType';
  readonly deleteFlowTypeUrl = environment.baseUrl + 'businessMgmt/deleteFlowType';

  readonly getAllFlowModelUrl = environment.baseUrl + 'businessMgmt/getAllFlowModel';
  readonly getFlowModelByIdUrl = environment.baseUrl + 'businessMgmt/getFlowModelById';
  readonly createFlowModelUrl = environment.baseUrl + 'businessMgmt/createFlowModel';
  readonly updateFlowModelUrl = environment.baseUrl + 'businessMgmt/updateFlowModel';
  readonly deleteFlowModelUrl = environment.baseUrl + 'businessMgmt/deleteFlowModel';

  readonly getAllActivityModelUrl = environment.baseUrl + 'businessMgmt/getAllActivityModel';
  readonly getActivityModelByIdUrl = environment.baseUrl + 'businessMgmt/getActivityModelById';

  readonly getAllWebFlowUrl = environment.baseUrl + 'businessMgmt/getAllWebFlow';
  readonly getWebFlowByIdUrl = environment.baseUrl + 'businessMgmt/getWebFlowById';

  readonly createWebFlowUrl = environment.baseUrl + 'businessMgmt/createWebFlow';
  readonly updateWebFlowUrl = environment.baseUrl + 'businessMgmt/updateWebFlow';
  readonly deleteWebFlowUrl = environment.baseUrl + 'businessMgmt/deleteWebFlow';
  readonly delBFRelationsByWebFlowIdUrl = environment.baseUrl + 'businessMgmt/delBFRelationsByWebFlowId';

  readonly getBusinessFlowsUrl = environment.baseUrl + 'businessMgmt/businessFlows';
  readonly getIntWebFlowConnectionStatusUrl = environment.baseUrl + 'businessMgmt/intWebFlowConnectionStatus';

  readonly getAllFlowGroupUrl = environment.baseUrl + 'businessMgmt/getAllFlowGroup';
  readonly getFlowGroupByIdUrl = environment.baseUrl + 'businessMgmt/getFlowGroupById';
  readonly createFlowGroupUrl = environment.baseUrl + 'businessMgmt/createFlowGroup';
  readonly updateFlowGroupUrl = environment.baseUrl + 'businessMgmt/updateFlowGroup';
  readonly deleteFlowGroupUrl = environment.baseUrl + 'businessMgmt/deleteFlowGroup';
  readonly validateAccessUrl = environment.baseUrl + 'businessMgmt/flowgroup/validateAccess';

  constructor(private http: HttpClient) { }

  /*========= Get All FLow Type =========*/
  getAllFlowType(): Observable<Array<FlowType>> {
    return this.http.get<Array<FlowType>>(`${this.getAllFlowTypeUrl}`);
  }

  /*========= Get FLow Type By Id =========*/
  getFlowTypeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.getFlowTypeByIdUrl}/${id}`);
  }

  /*========= Create Flow Type =========*/
  createFlowType(flowTypeDto: FlowType): Observable<FlowType> {
    return this.http.post<any>(`${this.createFlowTypeUrl}`, flowTypeDto);
  }

  /*========= Update Flow Type =========*/
  updateFlowType(flowTypeDto: FlowType): Observable<FlowType> {
    return this.http.post<any>(`${this.updateFlowTypeUrl}`, flowTypeDto);
  }

  /*========= Delete Flow Type =========*/
  deleteFlowType(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteFlowTypeUrl}/${id}`);
  }

  /*========= Get All Flow Model =========*/
  getAllFlowModel(): Observable<Array<FlowModel>> {
    return this.http.get<Array<FlowModel>>(`${this.getAllFlowModelUrl}`);
  }

  /*========= Get FLow Model By Id =========*/
  getFlowModelById(id: string): Observable<FlowModel> {
    return this.http.get<FlowModel>(`${this.getFlowModelByIdUrl}/${id}`);
  }

  /*========= Create Flow Model =========*/
  createFlowModel(flowModelDto: FlowModel): Observable<FlowModel> {
    return this.http.post<any>(`${this.createFlowModelUrl}`, flowModelDto);
  }

  /*========= Update Flow Model =========*/
  updateFlowModel(flowModelDto: FlowModel): Observable<FlowModel> {
    return this.http.post<any>(`${this.updateFlowModelUrl}`, flowModelDto);
  }

  /*========= Delete Flow Model =========*/
  deleteFlowModel(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteFlowModelUrl}/${id}`);
  }

  /*========= Get All Activity Model =========*/
  getAllActivityModel(): Observable<Array<any>> {
    return this.http.get<Array<any>>(`${this.getAllActivityModelUrl}`);
  }

  /*========= Get Activity Model By Id =========*/
  getActivityModelById(id: string): Observable<any> {
    return this.http.get<any>(`${this.getActivityModelByIdUrl}/${id}`);
  }

  /*========= Get All Web Flow =========*/
  getAllWebFlow(flowIds: Array<any>): Observable<Array<any>> {
    return this.http.post<Array<any>>(`${this.getAllWebFlowUrl}`, flowIds);
  }

  /*========= Get FLow Type By Id =========*/
  getWebFlowById(id: string): Observable<any> {
    return this.http.get<any>(`${this.getWebFlowByIdUrl}/${id}`);
  }

  /*========= Create Web Flow =========*/
  createWebFlow(webFlowDto: any): Observable<any> {
    return this.http.post<any>(`${this.createWebFlowUrl}`, webFlowDto);
  }

  /*========= Update Web Flow =========*/
  updateWebFlow(webFlowDto: any): Observable<any> {
    return this.http.post<any>(`${this.updateWebFlowUrl}`, webFlowDto);
  }

  /*========= Delete Web Flow =========*/
  deleteWebFlow(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteWebFlowUrl}/${id}`);
  }

  /*========= Delete Business Flow Relations By Web Flow Id =========*/
  deleteBfRelation(flowId: number): Observable<any> {
    return this.http.delete<any>(`${this.delBFRelationsByWebFlowIdUrl}/${flowId}`);
  }

  /*========= Get All Flow Group =========*/
  getAllFlowGroup(): Observable<Array<FlowGroup>> {
    return this.http.get<Array<FlowGroup>>(`${this.getAllFlowGroupUrl}`);
  }

  /*========= Get FLow Type By Id =========*/
  getFlowGroupById(id: string): Observable<any> {
    return this.http.get<any>(`${this.getFlowGroupByIdUrl}/${id}`);
  }

  /*========= Create Flow Group =========*/
  createFlowGroup(flowGroupDto: FlowGroup): Observable<FlowGroup> {
    return this.http.post<FlowGroup>(`${this.createFlowGroupUrl}`, flowGroupDto);
  }

  /*========= Update Flow Group =========*/
  updateFlowGroup(flowGroupDto: FlowGroup): Observable<FlowGroup> {
    return this.http.post<FlowGroup>(`${this.updateFlowGroupUrl}`, flowGroupDto);
  }

  /*========= Delete Web Flow =========*/
  deleteFlowGroup(id: string): Observable<any> {
    return this.http.delete<any>(`${this.deleteFlowGroupUrl}/${id}`);
  }

  /*========= Validate Access =========*/
  validateAccess(itemType: string, workspaceId: string, userName: string, parentId: number): Observable<any> {
    return this.http.get<any>(`${this.validateAccessUrl}/${itemType}/${workspaceId}/${userName}/${parentId}`);
  }
}
