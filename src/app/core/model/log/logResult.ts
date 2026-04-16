import { Injectable } from '@angular/core';
 import Adapter from '../../interface/adapter';
 import {LogCriteria} from './LogCriteria';
import {ServiceLogs}  from './ServiceLogs'
export class LogResult {
    constructor( 
       public criteria : LogCriteria, 
       public result: ServiceLogs
    ){}
}


@Injectable({
    providedIn: 'root'
})
export class LogResultAdapter implements Adapter<LogResult> {

  adapt(item: LogResult): LogResult {
   
    return new LogResult(
      item.criteria,
      item.result
    );
  }
}
