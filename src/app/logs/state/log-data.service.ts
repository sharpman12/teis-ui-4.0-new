import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class LogDataService {
  private flowId = new BehaviorSubject(undefined);

  constructor() { }
  flowIdAnnounced$ = this.flowId.asObservable();


  setFlowId(id: string) {
    this.flowId.next(id);
  }


}