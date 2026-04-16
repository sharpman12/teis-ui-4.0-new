import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { HeaderService } from 'src/app/core/service/header.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { WebServiceMgmtService } from './web-service-mgmt.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AddEditWebServiceComponent } from './add-edit-web-service/add-edit-web-service.component';
import { addUpdateUrl } from './web-service-mgmt';
import { MessageService } from 'primeng/api';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { Router } from '@angular/router';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-web-service-mgmt',
  templateUrl: './web-service-mgmt.component.html',
  styleUrls: ['./web-service-mgmt.component.scss']
})
export class WebServiceMgmtComponent implements OnInit, OnDestroy {
  allWebServices: Array<any> = [];
  newWebServices: Array<any> = [];
  webService: any = null;
  webServiceMgmtCURDAcess: boolean = false;
  webServiceMgmtEnableDisableAccess: boolean = false;
  currentUser: any = null;

  allWebServicesSub = Subscription.EMPTY;
  addWebServiceSub = Subscription.EMPTY;
  updateWebServiceSub = Subscription.EMPTY;
  deleteWebServiceSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private header: HeaderService,
    public sharedService: SharedService,
    public breadcrumb: BreadCrumbService,
    private messageService: MessageService,
    private webServiceMgmtService: WebServiceMgmtService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit(): void {
    this.header.show(); // show hide header
    this.sharedService.updateSystemStatus(true);
    if (localStorage.getItem('source') || this.router.url === '/web_service_management') {
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
    this.getWebServices();
    if (localStorage.getItem(Constants.WEB_SERVICE_MANAGEMENT_CURD_ACCESS)) {
      this.webServiceMgmtCURDAcess = true;
    } else {
      this.webServiceMgmtCURDAcess = false;
    }
    if (localStorage.getItem(Constants.WEB_SERVICE_MANAGEMENT_ENABLE_DISABLE_ACCESS)) {
      this.webServiceMgmtEnableDisableAccess = true;
    } else {
      this.webServiceMgmtEnableDisableAccess = false;
    }
  }

  onRefresh() {
    this.getWebServices();
  }

  /*=========== Get Application Services ===========*/
  getWebServices() {
    const accessWorkspacesArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    this.allWebServicesSub = this.webServiceMgmtService.getWebServices().subscribe((res) => {
      let baseUrl = '';
      let disabledUrlUri = false;
      const teisWebServices = [];
      if (res?.length && accessWorkspaces?.length) {
        this.webService = res;
        const workspacesArr = JSON.parse(JSON.stringify(res));
        accessWorkspaces.forEach((aws) => {
          workspacesArr.forEach((ws) => {
            if (Number(aws?.workspaceId) === Number(ws?.id)) {
              if (aws?.accessList.some((x) => (x?.key === 'WSV' || x?.key === 'WSV_ENDIS' || x?.key === 'WSV_CRUD_URI'))) {
                accessWorkspacesArr.push(ws);
              }
            }
          });
        });

        const clonedArray = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));

        clonedArray.forEach(x => {
          if (x?.appRegistry?.length) {
            x?.appRegistry.forEach(y => {
              this.sortUrl(y?.appParamsDataList);
              if (y?.appParamsDataList?.length) {
                y?.appParamsDataList.forEach(z => {
                  if (z?.name === 'URL') {
                    baseUrl = z?.value;
                    disabledUrlUri = !y?.enabled;
                  }
                  if (z?.name === 'URI') {
                    disabledUrlUri = z?.disable;
                    z.value = `${baseUrl}${z.value}`;
                  }
                  if (z?.name === 'URL' || z?.name === 'URI') {
                    const wsobj = {
                      appRegId: y?.id,
                      baseUrl: baseUrl,
                      description: y?.description,
                      disable: disabledUrlUri,
                      id: z?.id,
                      isUrlDisabled: !y?.enabled,
                      name: z?.name,
                      type: z?.type,
                      value: z?.value,
                      webServiceId: y?.id,
                      webServiceName: y?.name,
                      webServiceVersion: y?.version,
                      workspaceName: x?.name,
                      workspaceId: x?.id,
                    };
                    teisWebServices.push(wsobj);
                  }
                });
              }
            });
          }
        });
        this.newWebServices = teisWebServices;
      }

      // if (res?.length) {
      //   this.webService = res;
      //   const clonedArray = JSON.parse(JSON.stringify(res));
      //   clonedArray.forEach(x => {
      //     if (x?.appRegistry?.length) {
      //       x?.appRegistry.forEach(y => {
      //         this.sortUrl(y?.appParamsDataList);
      //         if (y?.appParamsDataList?.length) {
      //           y?.appParamsDataList.forEach(z => {
      //             if (z?.name === 'URL') {
      //               baseUrl = z?.value;
      //               disabledUrlUri = !y?.enabled;
      //             }
      //             if (z?.name === 'URI') {
      //               disabledUrlUri = z?.disable;
      //               z.value = `${baseUrl}${z.value}`;
      //             }
      //             if (z?.name === 'URL' || z?.name === 'URI') {
      //               const wsobj = {
      //                 appRegId: y?.id,
      //                 baseUrl: baseUrl,
      //                 description: y?.description,
      //                 disable: disabledUrlUri,
      //                 id: z?.id,
      //                 isUrlDisabled: !y?.enabled,
      //                 name: z?.name,
      //                 type: z?.type,
      //                 value: z?.value,
      //                 webServiceId: y?.id,
      //                 webServiceName: y?.name,
      //                 webServiceVersion: y?.version,
      //                 workspaceName: x?.name,
      //                 workspaceId: x?.id,
      //               };
      //               teisWebServices.push(wsobj);
      //             }
      //           });
      //         }
      //       });
      //     }
      //   });
      //   this.newWebServices = teisWebServices;
      // }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });

    /*=========== It's Old API getActiveWebServices Not in use ===========*/
    // const webServices = [];
    // let baseUrl = '';
    // this.allWebServicesSub = this.webServiceMgmtService.getAllWebServices().subscribe(res => {
    //   if (res?.length) {
    //     this.webService = res;
    //     const clonedArray = JSON.parse(JSON.stringify(res));
    //     clonedArray?.forEach(x => {
    //       if (x?.appParamsDataList?.length) {
    //         this.sortUrl(x?.appParamsDataList);
    //         x?.appParamsDataList.forEach(u => {
    //           if (Number(x?.id) === Number(u?.appRegId)) {
    //             u.wsId = x?.id;
    //             u.workspaceName = x?.workspaceData?.name;
    //             if (u?.name === 'URL') {
    //               baseUrl = u?.value;
    //               u.disable = !x?.enabled;
    //             }
    //             u.baseUrl = baseUrl;
    //             if (u?.name === 'URL' || u?.name === 'URI') {
    //               u.workspace = x?.workspaceData;
    //               u.wsName = x?.name;
    //               u.wsVersion = x?.version;
    //               u.description = x?.description;
    //               if (u?.name === 'URI') {
    //                 u.value = `${baseUrl}${u.value}`;
    //               }
    //               webServices.push(u);
    //             }
    //           }
    //         });
    //       }
    //     });
    //   }

    //   this.sortWs(webServices);
    //   this.sortWebServices(webServices);
    //   this.allWebServices = webServices;
    // }, (err: HttpErrorResponse) => {
    //   if (err.error instanceof Error) {
    //     // handle client side error here
    //   } else {
    //     // handle server side error here
    //   }
    // });

  }

  sortWs(webServices: Array<any>) {
    // Sort the array based on the "name" property in reverse order
    webServices.sort((a, b) => {
      // Use localeCompare to compare strings in a case-insensitive manner
      return b.wsName.localeCompare(a.wsName);
    });
  }

  sortUrl(appParams: Array<any>) {
    // Sort the array based on the "name" property in reverse order
    appParams.sort((a, b) => {
      // Use localeCompare to compare strings in a case-insensitive manner
      return b.name.localeCompare(a.name);
    });
  }

  sortWebServices(webServices: Array<any>) {
    // Sorting the array based on the "name" property
    webServices.sort((a, b) => {
      // Convert names to lowercase for case-insensitive sorting
      const nameA = a.workspaceName.toLowerCase();
      const nameB = b.workspaceName.toLowerCase();

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

  /*============ Add New Url =============*/
  addNewUri(ws: any) {
    let webService = null;
    if (this.webService?.length) {
      this.webService.forEach(x => {
        if (x?.appRegistry?.length) {
          x?.appRegistry.forEach(w => {
            if (Number(w?.id) === Number(ws?.appRegId)) {
              webService = w;
            }
          });
        }
      });
    }

    const data = {
      isNew: true,
      baseUrl: ws?.baseUrl,
      value: '',
      disable: ws?.disable,
      id: ws?.id,
      appRegId: ws?.appRegId,
      name: null,
      type: null,
      webServiceId: ws?.webServiceId,
      webServiceName: ws?.webServiceName,
      webService: webService,
      workspaceId: ws?.workspaceId,
      workspaceName: ws?.workspaceName
    };
    const dialogRef = this.dialog.open(AddEditWebServiceComponent, {
      width: '700px',
      maxHeight: '600px',
      data: data
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isSave) {
        this.getWebServices();
        this.messageService.add({ key: 'WebServiceMgmtSuccessKey', severity: 'success', summary: '', detail: 'Web service url created successfully!' });
      }
    });
  }
  /*============ END Add New Url =============*/

  /*============ Update Url =============*/
  updateUri(ws: any) {
    let webService = null;
    if (this.webService?.length) {
      this.webService.forEach(x => {
        if (x?.appRegistry?.length) {
          x?.appRegistry.forEach(w => {
            if (Number(w?.id) === Number(ws?.appRegId)) {
              webService = w;
            }
          });
        }
      });
    }

    const data = {
      isNew: false,
      baseUrl: ws?.baseUrl,
      value: ws?.value,
      disable: ws?.disable,
      id: ws?.id,
      appRegId: ws?.appRegId,
      name: ws?.name,
      type: ws?.type,
      webServiceId: ws?.webServiceId,
      webServiceName: ws?.webServiceName,
      webService: webService,
      workspaceId: ws?.workspaceId,
      workspaceName: ws?.workspaceName
    };
    const dialogRef = this.dialog.open(AddEditWebServiceComponent, {
      width: '700px',
      maxHeight: '600px',
      data: data
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isUpdate) {
        this.getWebServices();
        this.messageService.add({ key: 'WebServiceMgmtSuccessKey', severity: 'success', summary: '', detail: 'Web service url updated successfully!' });
      }
    });
  }
  /*============ END Update Url =============*/

  /*============ Delete Url =============*/
  deleteUrl(id: number) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: 'Are you sure you want to delete the web service url?'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteWebServiceSub = this.webServiceMgmtService.deleteWebService(Number(id)).subscribe(res => {
          if (res) {
            this.getWebServices();
            this.messageService.add({ key: 'WebServiceMgmtSuccessKey', severity: 'success', summary: '', detail: 'Web service url deleted successfully!' });
          }
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.allWebServicesSub.unsubscribe();
    this.addWebServiceSub.unsubscribe();
    this.updateWebServiceSub.unsubscribe();
    this.deleteWebServiceSub.unsubscribe();
  }

}
