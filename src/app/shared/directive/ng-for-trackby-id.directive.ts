import { Directive, Host } from '@angular/core';
import { NgForOf } from '@angular/common';

interface Item {
  id: number;
}

@Directive({
  selector: '[ngForTrackById]',
})
export class NgForTrackByIdDirective<T extends Item> {

  constructor(@Host() private ngFor: NgForOf<T>) {
    this.ngFor.ngForTrackBy = (index: number, item: T) => item.id;
  }
}
