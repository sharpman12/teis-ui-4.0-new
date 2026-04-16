import { Component, OnInit } from '@angular/core';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'layout-breadcrumb',
  templateUrl: './breadcrumb.component.html',

})
export class BreadCrumbComponent {
  subtitle;
  public flowItemTabView: boolean;

  constructor(
    public breadcrumb: BreadCrumbService,
    private location: Location,
    private router: Router,
  ) {
    this.breadcrumb.flowItemVisible$.subscribe(
      result => {
        this.flowItemTabView = result;
      });
    this.breadcrumb.title.subscribe(title => {
      this.subtitle = title;
    });
  }

  gotoFlowDashboard() {
    localStorage.removeItem('selectedFlow');
    if (this.router.url.includes('processingOverview')) {
      this.router.navigate(['/dashboard']);
    } else {
      this.location.back();
    }
  }

  hideFlowDetails() {
    this.breadcrumb.setFlowItemDetailView(false);
    // this.breadcrumb.flowItemVisible = false;
  }

  ngOnDestroy(): void {
  }
}
