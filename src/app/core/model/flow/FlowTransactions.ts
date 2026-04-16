import { Injectable } from '@angular/core';
import Adapter from '../../interface/adapter';
import {FlowTransaction} from './FlowTransaction';

export class FlowTransactions {
    constructor( 
        public transactions: FlowTransaction,
        public totalCount : number,
   ) {}
}


@Injectable({
    providedIn: 'root'
})
export class FlowTransactionsAdapter implements Adapter<FlowTransactions> {

  adapt(item: any): FlowTransactions {
   
    return new FlowTransactions(           
      item.transactions,
      item.totalCount
    );
  }
}
