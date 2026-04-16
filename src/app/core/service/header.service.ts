import { Injectable } from '@angular/core';
import { User } from '../model/user';
@Injectable(

)
export class HeaderService {
  visible: boolean;
  currentUser: string

  constructor() { this.visible = false; }

  hide() {
    this.visible = false;
    this.displayUserName();
  }

  show() {
    this.visible = true;
    this.displayUserName();
  }
  
  displayUserName() {
    let user: User;
    user = JSON.parse(localStorage.getItem('currentUser'));
    if (user !== null) {
      this.currentUser = user.firstName + ' ' + user.lastName;
    }
  }
  toggle() { this.visible = !this.visible; }

}