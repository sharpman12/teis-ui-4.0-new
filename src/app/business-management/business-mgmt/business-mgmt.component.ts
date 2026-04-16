import { Component, OnInit } from '@angular/core';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { HeaderService } from '../../core/service/header.service';
import { SharedService } from '../../shared/services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-business-mgmt',
  templateUrl: './business-mgmt.component.html',
  styleUrls: ['./business-mgmt.component.scss']
})
export class BusinessMgmtComponent implements OnInit {
  navbarOpen = false;

  constructor(
    private router: Router,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/business_management/flow_model') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.sharedService.showMenuBar.subscribe(res => {
      this.navbarOpen = res;
    });
    this.sharedService.isChangeBgColor.next(true);
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

}
