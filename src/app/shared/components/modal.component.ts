import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html'
})
export class ModalComponent implements OnInit {
  public showModal: boolean;
  @Input() modalTitle: string;
  @Input() modalClass: string;
  constructor() {

  }
  ngOnInit() {
  }

  openModal() {
    this.showModal = true;
  }


}