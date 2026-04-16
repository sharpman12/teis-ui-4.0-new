import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { Constants } from 'src/app/shared/components/constants';
import { SharedService } from 'src/app/shared/services/shared.service';
import { WorkspaceMgmtService } from 'src/app/workspace-management/workspace-mgmt/workspace-mgmt.service';
import { BusinessMgmtDataService } from '../business-mgmt-data.service';
import { BusinessMgmtService } from '../business-mgmt.service';
import { WebFlow } from '../businessmgmt';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-web-comp-flow',
  templateUrl: './web-comp-flow.component.html',
  styleUrls: ['./web-comp-flow.component.scss']
})
export class WebCompFlowComponent implements OnInit, OnDestroy {
  webFlows = [];
  activeWebFlow: any;
  userName: string;
  selectedWebFlow: WebFlow;
  isAddEdiWebtFlow = false;
  activeCard: any;
  selectedCardDetails: any;
  isFlowCURDAccess = false;
  currentUser: any = null;


  allWorkspacesSub = Subscription.EMPTY;
  allFlowSub = Subscription.EMPTY;
  webFlowByIdSub = Subscription.EMPTY;
  deleteFlowSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private businessMgmtService: BusinessMgmtService,
    private businessMgmtDataService: BusinessMgmtDataService,
    private workspaceMgmtService: WorkspaceMgmtService
  ) {
    this.userName = localStorage.getItem(Constants.USERNAME);
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
    this.getWorkspaces();
    if (localStorage.getItem(Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP)) {
      this.isFlowCURDAccess = true;
    }
  }

  /*============ Get All Workspace Ids ===============*/
  getWorkspaces() {
    this.allWorkspacesSub = this.workspaceMgmtService.getAllWorkspaces(this.userName).subscribe(res => {
      const workspacesIds = [];
      res.forEach(item => {
        workspacesIds.push(item?.id);
      });
      if (workspacesIds?.length) {
        this.getAllWebFlow(workspacesIds);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Get All Workspace Ids ===============*/

  /*============ Get All Web Flows ===============*/
  getAllWebFlow(workspacesIds: Array<any>) {
    this.webFlows = [];
    const accessFlowsArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    const allWebFlows = this.businessMgmtDataService.getWebFlows();
    if (allWebFlows?.webFlows?.length) {
      this.webFlows = allWebFlows?.webFlows;
      this.getWebFlowById(allWebFlows?.webFlowId ? allWebFlows?.webFlowId : allWebFlows?.webFlows[0]?.id);
    } else {
      this.allFlowSub = this.businessMgmtService.getAllWebFlow(workspacesIds).subscribe(res => {
        if (res?.length) {
          const flows = JSON.parse(JSON.stringify(res));
          flows.forEach((item) => {
            const accessWs = accessWorkspaces?.find(x => Number(x?.workspaceId) === Number(item?.flowGroupData?.workspaceData?.id));
            if (accessWs?.accessList.some((x) => x?.key === 'BM_CRUD_FLFG')) {
              accessFlowsArr.push(item);
            }
          });


          this.webFlows = accessFlowsArr;
          this.getWebFlowById(this.webFlows[0]?.id);
          const webFlowData = {
            webFlowId: this.activeWebFlow,
            webFlows: this.webFlows
          };
          this.businessMgmtDataService.storeWebFlows(webFlowData);
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============ END Get All Web Flows ===============*/

  /*============ Get Web Flow By Id ===============*/
  getWebFlowById(webFlowId: string) {
    const webFlowById = this.businessMgmtDataService.getWebFlowById(webFlowId);
    if (webFlowById) {
      this.activeWebFlow = webFlowId;
      this.selectedWebFlow = webFlowById;
      this.selectedCard(this.selectedWebFlow?.flowModelData?.flowActivityModelDataList[0]?.activityModelData, 0);
    } else {
      this.webFlowByIdSub = this.businessMgmtService.getWebFlowById(webFlowId).subscribe(res => {
        this.activeWebFlow = webFlowId;
        this.selectedWebFlow = res;
        this.selectedCard(this.selectedWebFlow?.flowModelData?.flowActivityModelDataList[0]?.activityModelData, 0);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============ END Get Web Flow By Id ===============*/

  /*============ Activity Model Card ===============*/
  selectedCard(model: any, index: number) {
    this.activeCard = index;
    this.selectedCardDetails = model;
  }

  /*================ Navigate To Add/Edit Web Flow Page ===============*/
  addWebFlow() {
    this.isAddEdiWebtFlow = true;
  }

  editFlowModel(webFlow: any) {
    this.isAddEdiWebtFlow = true;
    this.router.navigate(['business_management/web_flow/edit_flow/' + webFlow?.id]);
  }
  /*================ END Navigate To Add/Edit Web Flow Page ===============*/

  /*============ Remove Web Flow =============*/
  deleteWebFlowById(id: string, isConnectedToBusinessFlow: boolean) {
    if (isConnectedToBusinessFlow) {
      this.messageService.add({
        key: 'businessMgmtInfoKey', severity: 'success', summary: '', detail: 'Flow is connected to one or more business flow(s).'
      });
    } else {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '330px',
        panelClass: 'myapp-no-padding-dialog',
        data: 'Are you sure you want to remove this web flow?',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteFlowSub = this.businessMgmtService.deleteWebFlow(id).subscribe(res => {
            if (res) {
              this.businessMgmtDataService.removeWebFlow(id);
              this.getWorkspaces();
              this.messageService.add({
                key: 'businessMgmtKey', severity: 'success', summary: '', detail: 'Web flow deleted successfully!'
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
    this.allWorkspacesSub.unsubscribe();
    this.allFlowSub.unsubscribe();
    this.webFlowByIdSub.unsubscribe();
    this.deleteFlowSub.unsubscribe();
    if (!this.isAddEdiWebtFlow) {
      this.businessMgmtDataService.clearWebFlow();
    }
  }

}
