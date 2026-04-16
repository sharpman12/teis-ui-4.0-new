import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitstr'
})
export class SplitstrPipe implements PipeTransform {

  transform(value: string, ...args: any[]): string {
    if (!value) {
      return '';
    } else {
      const str = value.toString();
      const splittedText = value.split(' ');
      return `${splittedText[0]} <br/> ${splittedText[1]} ${splittedText[2]}`;
    }
  }

}
