import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
@Injectable(

)
export class BreadCrumbService {
  visible: boolean;
  passBreadCrumb: boolean;
  public flowItemVisible = new BehaviorSubject<boolean>(false);
  public title = new Subject();
  constructor() { this.visible = false; this.passBreadCrumb = false; }
  flowItemVisible$ = this.flowItemVisible.asObservable();

  hide() { this.visible = false; }

  show() { this.visible = true; }

  toggle() { this.visible = !this.visible; }

  previous() { this.passBreadCrumb = true; }

  previousHide() { this.passBreadCrumb = false; }

  backtoflowItem() {
    this.flowItemVisible.next(true);
  }

  setFlowItemDetailView(status: boolean) {
    this.flowItemVisible.next(status);
  }

  setTitle(title) {
    this.title.next(title);
  }

}
