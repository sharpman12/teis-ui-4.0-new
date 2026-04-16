import { Injectable } from '@angular/core';
 import Adapter from '../../interface/adapter';

export class FlowGroup {
    constructor( 
        public id : number,
        public name: string,
        public description: string,
        public errorCount: number,
        public avail?: boolean,
        public loadCardStatus?: boolean    
    ){}

}


@Injectable({
    providedIn: 'root'
})
export class FlowGroupAdapter implements Adapter<FlowGroup> {

  adapt(item: any): FlowGroup {
   
    return new FlowGroup(
      item.id,
      item.name,
      item.description,
      item.errorCount,
      item.avail,
      item.loadCardStatus
    );
  }
}
