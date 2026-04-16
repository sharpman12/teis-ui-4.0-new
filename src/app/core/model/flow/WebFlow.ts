import { Injectable } from '@angular/core';
 import Adapter from '../../interface/adapter';

export class WebFlow{
    constructor( 
    public id: number,
    public name : string,
    public description : string, 
    public disable: boolean,
    public timeFrame: string,
    ){}      
}


@Injectable({
    providedIn: 'root'
})
export class WebFlowAdapter implements Adapter<WebFlow> {

  adapt(item: any): WebFlow {
   
    return new WebFlow(           
      item.id,
      item.name,
      item.description,
      item.disable,
      item.timeFrame
    );
  }
}
