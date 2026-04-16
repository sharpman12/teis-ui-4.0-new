import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigurationsService } from '../configurations.service';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-web-service-info',
  templateUrl: './web-service-info.component.html',
  styleUrls: ['./web-service-info.component.scss']
})
export class WebServiceInfoComponent implements OnInit, OnDestroy {
  @Input() tabIndex: number;
  scrWidth: number;
  webServices: Array<any> = [];
  allWebServices: Array<any> = [];
  currentUser: any = null;

  allWebServicesSub = Subscription.EMPTY;

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
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
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
    this.getWebServices();
  }

  onRefresh() {
    this.getWebServices();
  }

  /*=========== Get Application Services ===========*/
  getWebServices() {
    const accessWorkspacesArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    this.allWebServicesSub = this.configurationsService.getWebServices().subscribe(res => {
      const configWebServices = [];

      if (res?.length && accessWorkspaces?.length) {
        this.webServices = res;
        const workspacesArr = JSON.parse(JSON.stringify(res));

        // As per new requirement, showing all web services instead of showing web services based on user access JIRA TEI-5362.
        
        // accessWorkspaces.forEach((aws) => {
        //   workspacesArr.forEach((ws) => {
        //     if (Number(aws?.workspaceId) === Number(ws?.id)) {
        //       if (aws?.accessList.some((x) => (x?.key === 'WSV' || x?.key === 'WSV_ENDIS' || x?.key === 'WSV_CRUD_URI'))) {
        //         accessWorkspacesArr.push(ws);
        //       }
        //     }
        //   });
        // });

        const clonedArray = workspacesArr.sort((a, b) => a.name.localeCompare(b.name));

        clonedArray.forEach(w => {
          if (w?.appRegistry?.length) {
            w?.appRegistry.forEach(x => {
              configWebServices.push(x);
            });
          }
        });
        configWebServices?.forEach(x => {
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
        this.sortWebServices(configWebServices);
        this.allWebServices = configWebServices;
      }

      // if (res?.length) {
      //   this.webServices = res;
      //   const clonedArray = JSON.parse(JSON.stringify(res));
      //   clonedArray.forEach(w => {
      //     if (w?.appRegistry?.length) {
      //       w?.appRegistry.forEach(x => {
      //         configWebServices.push(x);
      //       });
      //     }
      //   });
      //   configWebServices?.forEach(x => {
      //     if (x?.appParamsDataList?.length) {
      //       x?.appParamsDataList.forEach(u => {
      //         if (Number(x?.id) === Number(u?.appRegId)) {
      //           if (u?.name === 'URL') {
      //             x.url = u?.value;
      //           }
      //           if (u?.name === 'Https') {
      //             x.https = u?.value;
      //           }
      //           if (u?.name === 'Http') {
      //             x.http = u?.value;
      //           }
      //           if (u?.name === 'hostname') {
      //             x.hostname = u?.value;
      //           }
      //         }
      //       });
      //     }
      //   });
      //   this.sortWebServices(configWebServices);
      //   this.allWebServices = configWebServices;
      // }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });

    // this.allWebServicesSub = this.configurationsService.getAllWebServices().subscribe(res => {
    //   this.webServices = res;
    //   const clonedArray = JSON.parse(JSON.stringify(res));
    //   clonedArray?.forEach(x => {
    //     if (x?.appParamsDataList?.length) {
    //       x?.appParamsDataList.forEach(u => {
    //         if (Number(x?.id) === Number(u?.appRegId)) {
    //           if (u?.name === 'URL') {
    //             x.url = u?.value;
    //           }
    //           if (u?.name === 'Https') {
    //             x.https = u?.value;
    //           }
    //           if (u?.name === 'Http') {
    //             x.http = u?.value;
    //           }
    //           if (u?.name === 'hostname') {
    //             x.hostname = u?.value;
    //           }
    //         }
    //       });
    //     }
    //   });
    //   this.allWebServices = clonedArray;
    // }, (err: HttpErrorResponse) => {
    //   if (err.error instanceof Error) {
    //     // handle client side error here
    //   } else {
    //     // handle server side error here
    //   }
    // });
  }

  sortWebServices(webServices: Array<any>) {
    // Sort the array based on the "name" property in reverse order
    webServices.sort((a, b) => {
      // Use localeCompare to compare strings in a case-insensitive manner
      return a.name.localeCompare(b.name);
    });
  }

  ngOnDestroy() {
    this.allWebServicesSub.unsubscribe();
  }

}
