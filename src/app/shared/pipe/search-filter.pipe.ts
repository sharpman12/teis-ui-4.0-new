import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {

  // transform(items: Array<any>, searchText: string = '', keyName: string = ''): Array<any> {
  //   console.log('items here', items);
  //   if (!items) {
  //     return [];
  //   }
  //   if (!searchText) {
  //     return items;
  //   }
  //   searchText = searchText.toLowerCase();

  //   return items.filter(x => {
  //     return x[keyName].toLowerCase().includes(searchText);
  //   });
  // }

   transform(items: Array<any>, searchText: string = '', keyName: string = ''): Array<any> {
    if (!Array.isArray(items)) {
      return [];
    }
    const query = (searchText ?? '').toLowerCase().trim();
    if (!query) {
      return items;
    }

    return items.filter((x) => {
      const raw = keyName ? x?.[keyName] : x;
      const value = raw == null ? '' : String(raw).toLowerCase();
      return value.includes(query);
    });
  }

}
