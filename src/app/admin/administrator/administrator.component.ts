import { Component, OnInit } from '@angular/core';
// import { SharedService } from 'src/app/shared/services/shared.service';
import { SharedService } from '../../shared/services/shared.service';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { HeaderService } from '../../core/service/header.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.scss']
})
export class AdministratorComponent implements OnInit {

  navbarOpen = false;

  constructor(
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    public sharedService: SharedService
  ) { }

  ngOnInit() {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/admin/users') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.breadcrumb.hide();
    this.sharedService.showMenuBar.subscribe(res => {
      this.navbarOpen = res;
    });
    this.checkIsArchivePackInstalled();
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  /*=========== Is Archive Packed Installed ============*/
  checkIsArchivePackInstalled() {
    this.sharedService.checkArchivePackInstalled().subscribe(res => {
      this.sharedService.checkArchivePackIsInstalled(res);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Is Archive Packed Installed ============*/

}
