import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'masktext'
})
export class MasktextPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string {
    const str = value.toString();
    const strArr = [];
    for (let i = 0; i < str.length; i++) {
      strArr.push('*');
    }
    return strArr.toString().replace(/,/g, '');
  }

}
