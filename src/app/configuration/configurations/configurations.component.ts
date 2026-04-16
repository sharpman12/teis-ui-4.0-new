import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedService } from '../../shared/services/shared.service';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { HeaderService } from '../../core/service/header.service';
import { ConfigurationsService } from './configurations.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss']
})
export class ConfigurationsComponent implements OnInit, OnDestroy {
  addOnTabIndex = 0;
  settingTabIndex = 0;
  navbarOpen = false;
  isAddOnInfoOpen = false;
  isSettingOpen = false;
  webServices = [];

  allWebServicesSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
    private configurationsService: ConfigurationsService,
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/configuration/adapter_information') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.breadcrumb.visible = false;
    // this.breadcrumb.previous(); // show hide breadcrumb
    // this.breadcrumb.hide();
    this.sharedService.showMenuBar.subscribe(res => {
      this.navbarOpen = res;
    });

    this.sharedService.isChangeBgColor.next(true);
    this.getWebServices();
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  toggleSideMenu(menu_no: string) {
    if (menu_no === 'MENU_1') {
      this.isAddOnInfoOpen = !this.isAddOnInfoOpen;
    }
    if (menu_no === 'MENU_2') {
      this.isSettingOpen = !this.isSettingOpen;
    }
  }

  /*=========== Get Application Services ===========*/
  getWebServices() {
    this.allWebServicesSub = this.configurationsService.getWebServices().subscribe(res => {
      this.webServices = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  addOnChange(e) {
    const index = e.index;
    if (index === 0) {
      this.addOnTabIndex = 0;
    }
    if (index === 1) {
      this.addOnTabIndex = 1;
    }
    if (index === 2) {
      this.addOnTabIndex = 2;
    }
    if (index === 3) {
      this.addOnTabIndex = 3;
    }
  }

  settingChange(e) {
    const index = e.index;
    if (index === 0) {
      this.settingTabIndex = 0;
    }
    if (index === 1) {
      this.settingTabIndex = 1;
    }
    if (index === 2) {
      this.settingTabIndex = 2;
    }
    if (index === 3) {
      this.settingTabIndex = 3;
    }
    if (index === 4) {
      this.settingTabIndex = 3;
    }
    if (index === 5) {
      this.settingTabIndex = 3;
    }
  }

  ngOnDestroy() {
    this.allWebServicesSub.unsubscribe();
  }

}
