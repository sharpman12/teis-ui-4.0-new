import { Injectable } from '@angular/core';
 import Adapter from '../../interface/adapter';

export class FlowCriteria{
    constructor( 
    public flowId: number,
    public error : boolean,
    public timeFrame : string,
    public searchText: string,    
    public startActivity: boolean,
    public pageNo?: number
    ){}      
}


@Injectable({
    providedIn: 'root'
})
export class FlowCriteriaAdapter implements Adapter<FlowCriteria> {

  adapt(item: any): FlowCriteria {
   
    return new FlowCriteria(           
      item.flowId,
      item.error,
      item.description,
      item.timeFrame,
      item.startActivity,
      item.pageNo
    );
  }
}
