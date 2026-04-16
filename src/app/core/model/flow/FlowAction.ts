import { Injectable } from '@angular/core';
 import Adapter from '../../interface/adapter';

export class FlowAction {
    constructor( 
        public taskId : string,
        public action: string,
        public note: string,
        public transExecutableId: number

    ){}

}

@Injectable({
    providedIn: 'root'
})
export class FlowActionAdapter implements Adapter<FlowAction> {

  adapt(item: any): FlowAction {
   
    return new FlowAction(
      item.taskId,
      item.action,
      item.note,
      item.transExecutableId
    );
  }
}
