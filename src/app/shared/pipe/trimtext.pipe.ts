import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trimtext'
})
export class TrimtextPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) {
      return '';
    }
    return value.trim();
  }

}
