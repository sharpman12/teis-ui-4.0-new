import { Injectable } from '@angular/core';
 import Adapter from '../interface/adapter';

export class LogCard {
    constructor( 
        public description:string,
        public error:boolean,
        public errorCount:number,
        public id: Number,
        public items: string,
        public name:string,
        public searchText: string,
        public timeFrame:number,
    ){}

}


@Injectable({
    providedIn: 'root'
})
export class LogCardAdapter implements Adapter<LogCard> {

  adapt(item: any): LogCard {
   
    return new LogCard(
      item.description,
      item.error,
      item.errorCount,
      item.id,
      item.items,
      item.name, 
      item.searchText,  
      item.timeFrame
    );
  }
}
