import { HttpErrorResponse } from '@angular/common/http';
import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConfirmationComponent } from '../../../shared/components/confirmation/confirmation.component';
import { ConfigurationsService } from '../configurations.service';
import { AddEditAppParamsComponent } from './add-edit-app-params/add-edit-app-params.component';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-app-params',
  templateUrl: './app-params.component.html',
  styleUrls: ['./app-params.component.scss']
})
export class AppParamsComponent implements OnInit, OnDestroy {
  @Input() tabIndex: number;
  scrWidth: number;
  parameters = [];
  isAppParamsCURDAccess: boolean = false;

  allParametersSub = Subscription.EMPTY;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    private messageService: MessageService,
    private encryptDecryptService: EncryptDecryptService,
    private configurationsService: ConfigurationsService,
  ) {
    this.getScreenSize();
    const AppParamsCURDAccess = localStorage.getItem('APPLICATION_PARAMETER_CURD_ACCESS');
    if (AppParamsCURDAccess) {
      this.isAppParamsCURDAccess = true;
    } else {
      this.isAppParamsCURDAccess = false;
    }
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
    this.getParameters();
  }

  refreshParams() {
    this.getParameters();
  }

  /*=========== Get All Adapter ===========*/
  getParameters() {
    this.allParametersSub = this.configurationsService.getScriptParams().subscribe(res => {
      this.parameters = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*================ Add Parameters ================*/
  addParams() {
    if (this.isAppParamsCURDAccess) {
      const dataObj = {
        isAdd: true,
        isAppParamsCURDAccess: this.isAppParamsCURDAccess
      };
      const dialogRef = this.dialog.open(AddEditAppParamsComponent, {
        width: '600px',
        height: '600px',
        data: dataObj
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.getParameters();
          this.messageService.add({
            key: 'configSuccessKey', severity: 'success', summary: '', detail: 'Application parameter added Successfully!'
          });
        }
      });
    }
  }
  /*================ END Add Parameters ================*/

  /*================ Edit Parameters ================*/
  editParams(paramsObj) {
    if (this.isAppParamsCURDAccess) {
      const dataObj = {
        isAdd: false,
        isAppParamsCURDAccess: this.isAppParamsCURDAccess,
        ...paramsObj
      };
      const dialogRef = this.dialog.open(AddEditAppParamsComponent, {
        width: '600px',
        height: '600px',
        data: dataObj
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.getParameters();
          this.messageService.add({
            key: 'configSuccessKey', severity: 'success', summary: '', detail: 'Application parameter updated Successfully!'
          });
        }
      });
    }
  }
  /*================ END Edit Parameters ================*/

  /*================ Delete Parameters ================*/
  deleteParams(id: string): void {
    if (this.isAppParamsCURDAccess) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '700px',
        maxHeight: '600px',
        data: 'Are you sure you want to delete this parameter?'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.configurationsService.deleteScriptParams(id).subscribe(res => {
            if (res) {
              this.getParameters();
              this.messageService.add({
                key: 'configSuccessKey', severity: 'success', summary: '', detail: 'Application parameter deleted Successfully!'
              });
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
  }

  ngOnDestroy(): void {
    this.allParametersSub.unsubscribe();
  }

}
