import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { SharedService } from 'src/app/shared/services/shared.service';
import { BusinessMgmtDataService } from '../business-mgmt-data.service';
import { BusinessMgmtService } from '../business-mgmt.service';
import { Constants } from 'src/app/shared/components/constants';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-web-comp-flow-group',
  templateUrl: './web-comp-flow-group.component.html',
  styleUrls: ['./web-comp-flow-group.component.scss']
})
export class WebCompFlowGroupComponent implements OnInit, OnDestroy {
  webCompFlowGrp = [];
  activeWebFlowGrp: any;
  selectedFlowGrp: any = null;
  isAddEditFlowGroup = false;
  isFlowGroupCURDAccess = false;
  currentUser: any = null;

  getAllFlowGroupSub = Subscription.EMPTY;
  flowGroupByIdSub = Subscription.EMPTY;
  deleteFlowGroupSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private businessMgmtService: BusinessMgmtService,
    private businessMgmtDataService: BusinessMgmtDataService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/business_management/flow_model') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.getAllFlowGroups();
    if (localStorage.getItem(Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP)) {
      this.isFlowGroupCURDAccess = true;
    }
  }

  /*========== Get All Flow Group ===========*/
  getAllFlowGroups() {
    const accessFlowGrpArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    const flowGroups = this.businessMgmtDataService.getFlowGroups();
    this.webCompFlowGrp = [];
    if (flowGroups?.flowGrps?.length) {
      this.webCompFlowGrp = flowGroups?.flowGrps;
      this.getWebFlowGrpById(flowGroups?.flowGrpId ? flowGroups?.flowGrpId : flowGroups?.flowGrps[0]?.id);
    } else {
      this.getAllFlowGroupSub = this.businessMgmtService.getAllFlowGroup().subscribe(res => {
        if (res?.length) {
          const flowGrps = JSON.parse(JSON.stringify(res));
          flowGrps.forEach((item) => {
            const accessWs = accessWorkspaces?.find(x => Number(x?.workspaceId) === Number(item?.workspaceData?.id));
            if (accessWs?.accessList.some((x) => (x?.key === 'BM_CRUD_FLFG' || x?.key === 'BM_ENDS_FLW'))) {
              accessFlowGrpArr.push(item);
            }
          });

          if (accessFlowGrpArr?.length) {
            this.webCompFlowGrp = accessFlowGrpArr;
            this.getWebFlowGrpById(this.webCompFlowGrp[0]?.id);
            const flowGrpData = {
              flowGrpId: this.activeWebFlowGrp,
              flowGrps: this.webCompFlowGrp
            };
            this.businessMgmtDataService.storeFlowGroups(flowGrpData);
          }
        }
        // if (res?.length) {
        //   this.webCompFlowGrp = res;
        //   this.getWebFlowGrpById(this.webCompFlowGrp[0]?.id);
        //   const flowGrpData = {
        //     flowGrpId: this.activeWebFlowGrp,
        //     flowGrps: res
        //   };
        //   this.businessMgmtDataService.storeFlowGroups(flowGrpData);
        // }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  getWebFlowGrpById(flowGrpId: string) {
    const flowGrp = this.businessMgmtDataService.getFlowGroupById(flowGrpId);
    if (flowGrp) {
      this.activeWebFlowGrp = flowGrpId;
      this.selectedFlowGrp = flowGrp;
    } else {
      this.flowGroupByIdSub = this.businessMgmtService.getFlowGroupById(flowGrpId).subscribe(res => {
        this.activeWebFlowGrp = flowGrpId;
        this.selectedFlowGrp = res;
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  addFlowModel() {
    this.isAddEditFlowGroup = true;
  }

  /*========== Edit Flow Group By Id ===========*/
  editFlowGroup(selectedFlowGrp: any) {
    this.isAddEditFlowGroup = true;
    this.router.navigate(['business_management/web_flow_group/edit_flow_group/' + selectedFlowGrp?.id]);
  }

  /*========== Delete Flow Group By Id ===========*/
  deleteFlowGroupById(id: string, flowGrp: any) {
    // Changes for Jira TEI-5100
    let isFlowGrpConnected = false;
    if (flowGrp?.webFlowDataList?.length) {
      isFlowGrpConnected = flowGrp?.webFlowDataList?.some((flow: any) => flow?.connectedToBusinessFlow);
    }
    if (isFlowGrpConnected) {
      this.messageService.add({
        key: 'businessMgmtInfoKey', severity: 'success', summary: '', detail: 'Flow group is connected to one or more business flow(s). Remove flow group can be done after removing the connection from business flow(s).'
      });
    } else {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '330px',
        panelClass: 'myapp-no-padding-dialog',
        data: 'Are you sure you want to remove this flow group?',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteFlowGroupSub = this.businessMgmtService.deleteFlowGroup(id).subscribe(res => {
            if (res) {
              this.businessMgmtDataService.removeFlowGroup(id);
              this.getAllFlowGroups();
              this.messageService.add({
                key: 'businessMgmtKey', severity: 'success', summary: '', detail: 'Flow group deleted successfully!'
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
    this.getAllFlowGroupSub.unsubscribe();
    this.flowGroupByIdSub.unsubscribe();
    this.deleteFlowGroupSub.unsubscribe();
    if (!this.isAddEditFlowGroup) {
      this.businessMgmtDataService.clearFlowGrp();
    }
  }

}
