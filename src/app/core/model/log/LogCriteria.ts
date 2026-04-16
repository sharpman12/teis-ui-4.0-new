import { Injectable } from '@angular/core';
import Adapter from '../../interface/adapter';
import { Report } from './Report';
import { ItemData } from './ItemData';
export class LogCriteria extends Report {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public searchText: string,
    public timeFrame: string,
    public error: boolean,
    public pageNo: number,
    public logType: string,
    public actualTimeFrame: string,
    public items: Array<ItemData>,
    public applyAccess?: boolean,
    public flowId?: number,
    public search?: string,
    public searchType?: string
  ) {
    super(id, name, description, searchText, timeFrame, 0, false, items, false);
  }


}


@Injectable({
  providedIn: 'root'
})
export class LogCriteriaAdapter implements Adapter<LogCriteria> {

  adapt(item: any): LogCriteria {
    return new LogCriteria(
      item.id,
      item.name,
      item.description,
      item.searchText,
      item.timeFrame,
      item.error,
      // item.itemDatas,
      item.pageNo,
      item.logType,
      item.actualTimeFrame,
      item.items,
      item.applyAccess,
      item.flowId,
      item.search,
      item.searchType
    );
  }
}
