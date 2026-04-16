import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchItem'
})
export class SearchItemPipe implements PipeTransform {

  transform(items: Array<any>, searchText: string = '', key1: string = '', key2: string = '', key3: string = ''): Array<any> {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    
    searchText = searchText.toLowerCase();

    return items.filter(x =>
      (x[key1] && x[key1].toLowerCase().includes(searchText)) ||
      ((x?.securityLevel && x?.securityLevel.toLowerCase() !== 'high') && x[key2] && x[key2].toLowerCase().includes(searchText)) ||
      (x[key3] && x[key3].toLowerCase().includes(searchText))
    );
  }

}
