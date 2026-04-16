import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigurationsService } from '../configurations.service';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-application-service-info',
  templateUrl: './application-service-info.component.html',
  styleUrls: ['./application-service-info.component.scss']
})
export class ApplicationServiceInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tabIndex: number;
  scrWidth: number;
  applicationServices: Array<any> = [];
  allAppServices: Array<any> = [];

  allAppServicesSub = Subscription.EMPTY;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  constructor(
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    private configurationsService: ConfigurationsService,
  ) {
    this.getScreenSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (!this.applicationServices?.length) {
    //   if (this.tabIndex === 1) {
    //     this.getApplicationServices();
    //   }
    // }
  }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/configuration/adapter_information') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.getApplicationServices();
  }

  onRefresh() {
    this.getApplicationServices();
  }

  /*=========== Get Application Services ===========*/
  getApplicationServices() {
    this.allAppServicesSub = this.configurationsService.getAllAppServices().subscribe(res => {
      this.applicationServices = res;
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
      this.allAppServices = clonedArray;
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

  ngOnDestroy() {
    this.allAppServicesSub.unsubscribe();
  }

}
