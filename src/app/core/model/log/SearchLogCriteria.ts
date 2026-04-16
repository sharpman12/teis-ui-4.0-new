import { Injectable } from '@angular/core';
 import Adapter from '../../interface/adapter';
import { LogCriteria } from './LogCriteria';
import { LogResult } from './logResult';

export class SearchLogCriteria {
    constructor( 
       public criteria: LogCriteria,
       public result: LogResult      
    ){}     

}


@Injectable({
    providedIn: 'root'
})
export class SearchLogCriteriaAdapter implements Adapter<SearchLogCriteria> {

  adapt(item: any): SearchLogCriteria {
   
    return new SearchLogCriteria(           
      item.criteria,
      item.result
     
    );
  }
}
