import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { HeaderService } from 'src/app/core/service/header.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { AppRegistryDto } from './application-mgmt';
import { ApplicationMgmtService } from './application-mgmt.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-app-services-mgmt',
  templateUrl: './app-services-mgmt.component.html',
  styleUrls: ['./app-services-mgmt.component.scss']
})
export class AppServicesMgmtComponent implements OnInit, OnDestroy {
  appServices: Array<any> = [];
  cloneAppServicesArr: Array<any> = [];

  getAllAppServicesSub = Subscription.EMPTY;
  updateAppServiceSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    public sharedService: SharedService,
    private messageService: MessageService,
    private applicationMgmtService: ApplicationMgmtService
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/application_services_management') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.header.show(); // show hide header
    // this.breadcrumb.visible = false;
    // this.breadcrumb.previous(); // show hide breadcrumb
    // this.breadcrumb.hide();
    this.sharedService.isChangeBgColor.next(true);

    this.getApplicationServices();
  }

  getApplicationServices() {
    this.getAllAppServicesSub = this.applicationMgmtService.getAllAppServices().subscribe(res => {
      this.appServices = res;
      const clonedArray = JSON.parse(JSON.stringify(res));
      clonedArray?.forEach(x => {
        if (x?.appParamsDataList?.length) {
          x?.appParamsDataList.forEach(u => {
            if (Number(x?.id) === Number(u?.appRegId)) {
              if (u?.name === 'URL') {
                x.url = u?.value;
              }
              if (u?.name === 'Https') {
                x.https = u?.value;
              }
              if (u?.name === 'Http') {
                x.http = u?.value;
              }
              if (u?.name === 'hostname') {
                x.hostname = u?.value;
              }
            }
          });
        }
      });
      this.sortAppServices(clonedArray);
      this.cloneAppServicesArr = clonedArray;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  sortAppServices(appServices: Array<any>) {
    // Sorting the array based on the "name" property
    appServices.sort((a, b) => {
      // Convert names to lowercase for case-insensitive sorting
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // Names are equal
      return 0;
    });
  }

  updateServices(item: AppRegistryDto) {
    // item.enabled = !item?.enabled;
    let appService = null;
    if (this.appServices?.length) {
      this.appServices.forEach(x => {
        if (Number(x?.id) === Number(item?.id)) {
          appService = x;
        }
      });
    }
    appService.enabled = !item?.enabled;
    this.updateAppServiceSub = this.applicationMgmtService.updateAppRegistry(appService).subscribe(res => {
      if (res) {
        this.getApplicationServices();
        this.messageService.add({ key: 'appServiceSuccessKey', severity: 'success', summary: '', detail: 'Application service updated successfully!' });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  ngOnDestroy() {
    this.sharedService.isChangeBgColor.next(false);
    this.getAllAppServicesSub.unsubscribe();
    this.updateAppServiceSub.unsubscribe();
  }

}
