import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject , Observable, ReplaySubject  } from 'rxjs';
import { FlowTransaction } from '../../../core/model/flow/FlowTransaction';
import { Activity } from '../../../core/model/flow/Activity';
@Injectable()
export class FlowDataService {
  public  transaction = new BehaviorSubject<FlowTransaction[]>([]);           
  private  timeFrame = new BehaviorSubject(undefined);
  private  error = new BehaviorSubject(undefined);
  private  startActivity = new BehaviorSubject(undefined);
  private  search = new BehaviorSubject(undefined);
  private flowId =new BehaviorSubject(undefined);
  private flowGroupData = new BehaviorSubject<Array<any>>([]);
  private selectedFlowRowNumber = new BehaviorSubject(undefined);     
  private flowRowDetailView =  new BehaviorSubject<Activity[]>([]);
  constructor() { }
  timeFrameAnnounced$ = this.timeFrame.asObservable(); 
  errorAnnounced$ = this.error.asObservable(); 
  searchAnnounced$ = this.search.asObservable();   
  flowIdAnnounced$ = this.flowId.asObservable();      
  transcationTableAnnounced$ = this.transaction.asObservable(); 
  flowGroupDataAnnounced$ = this.flowGroupData.asObservable(); 
  selectedFlowRowNumberAnnounced$ = this.selectedFlowRowNumber.asObservable(); 
  flowRowDetailViewAnnounced$ = this.flowRowDetailView.asObservable(); 
  startActivityAnnounced$ = this.startActivity.asObservable();
  setTimeFrame(timeFrame: string){
    this.timeFrame.next(timeFrame);  
  }
  setFlowId(id: string){
    this.flowId.next(id);    
}
  setSearch(search: string){
    this.search.next(search);   
  }
  setError(error: boolean){
    this.error.next(error);   
  }
  setStartActivity(sActivity: boolean){
    this.error.next(sActivity);    
  }
  setTransactionTableData(t: FlowTransaction[]){
    this.transaction.next(t);
  }
  setFlowGroupData(data) {
    this.flowGroupData.next(data); 
  }
  clearFlowGroupData() {
    this.flowGroupData.value.length = 0;  
    this.timeFrame.next(undefined);    
    this.flowId.next(undefined);  
    this.search.next(undefined);    
    this.error.next(undefined);     
    this.transaction.next([]);
    this.selectedFlowRowNumber.next(undefined);
    this.flowRowDetailView.next([]);
  }
  setSelectedFlowRowNumber(number){
    this.selectedFlowRowNumber.next(number);
  }
  setflowRowDetailView(a: Activity[]){
    this.flowRowDetailView.next(a);
  }
}