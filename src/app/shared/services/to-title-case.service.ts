import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToTitleCaseService {

  constructor() { }

  convertToTitleCase(input: string): string {
    if (!input) return input;

    return input.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }
}
