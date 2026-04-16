import { Component, OnInit } from '@angular/core';
import { BreadCrumbService } from '../core/service/breadcrumb.service';
import { HeaderService } from '../core/service/header.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {

  constructor(
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.breadcrumb.visible = false;
    this.breadcrumb.previous();
  }

}
