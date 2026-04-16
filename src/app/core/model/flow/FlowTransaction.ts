import { Injectable } from '@angular/core';
 import Adapter from '../../interface/adapter';
 import {Activity} from './Activity';

export class FlowTransaction {
    constructor( 
        public activities: Activity,
        public message : string
   ) {}
}


@Injectable({
    providedIn: 'root'
})
export class FlowTransacctionAdapter implements Adapter<FlowTransaction> {

  adapt(item: any): FlowTransaction {
   
    return new FlowTransaction(           
      item.activities,
      item.message
    );
  }
}
