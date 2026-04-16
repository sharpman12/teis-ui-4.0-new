import { Injectable } from '@angular/core';
 import Adapter from '../interface/adapter';

export class FlowCard {
    constructor( 
        public id : number,
        public name: string,
        public description: string,
        public errorCount: number    
    ){}

}


@Injectable({
    providedIn: 'root'
})
export class FlowCardAdapter implements Adapter<FlowCard> {

  adapt(item: any): FlowCard {
   
    return new FlowCard(
      item.id,
      item.name,
      item.description,
      item.errorCount
    );
  }
}
