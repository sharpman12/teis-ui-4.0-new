import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { SharedService } from '../../../shared/services/shared.service';
import { BusinessMgmtDataService } from '../business-mgmt-data.service';
import { BusinessMgmtService } from '../business-mgmt.service';
import { Constants } from 'src/app/shared/components/constants';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-flow-comp-model',
  templateUrl: './flow-comp-model.component.html',
  styleUrls: ['./flow-comp-model.component.scss']
})
export class FlowCompModelComponent implements OnInit, OnDestroy {
  flowModels = [];
  activeFlow: any;
  activeCard: any;
  selectedFlow: any;
  selectedCardDetails: any;
  isAddEditFlowModel = false;
  isFlowModelCURDAccess = false;

  allFlowModelSub = Subscription.EMPTY;
  flowModelByIdSub = Subscription.EMPTY;
  deleteFlowModelSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private businessMgmtService: BusinessMgmtService,
    private businessMgmtDataService: BusinessMgmtDataService
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/business_management/flow_model') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.getAllFlowModels();
    if (localStorage.getItem(Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL)) {
      this.isFlowModelCURDAccess = true;
    }
  }

  /*============ Get All Flow Models =============*/
  getAllFlowModels() {
    const allFlowModels = this.businessMgmtDataService.getFlowModels();
    this.flowModels = [];
    if (allFlowModels?.flowModels?.length) {
      this.flowModels = allFlowModels?.flowModels;
      this.getFlowModelById(allFlowModels?.flowModelId ? allFlowModels?.flowModelId : allFlowModels?.flowModels[0]?.id);
    } else {
      this.allFlowModelSub = this.businessMgmtService.getAllFlowModel().subscribe(res => {
        if (res?.length) {
          this.flowModels = res;
          this.getFlowModelById(this.flowModels[0]?.id);
          const flowModelData = {
            flowModelId: this.activeFlow,
            flowModels: this.flowModels
          };
          this.businessMgmtDataService.storeFlowModels(flowModelData);
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

  /*============ Get Flow Models By Id =============*/
  getFlowModelById(flowId: string) {
    const activityModel = this.businessMgmtDataService.getActivityModelById(flowId);
    if (activityModel) {
      this.activeFlow = flowId;
      this.selectedFlow = activityModel;
      this.selectedCard(this.selectedFlow?.flowActivityModelDataList[0]);
    } else {
      this.flowModelByIdSub = this.businessMgmtService.getFlowModelById(flowId).subscribe(res => {
        this.activeFlow = flowId;
        this.selectedFlow = res;
        this.selectedCard(this.selectedFlow?.flowActivityModelDataList[0]);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  selectedCard(model: any) {
    this.activeCard = model?.sequence;
    this.selectedCardDetails = model?.activityModelData;
  }

  addFlowModel() {
    this.isAddEditFlowModel = true;
  }

  /*================ Navigate To Edit Flow Model Page ===============*/
  editFlowModel(flowModel: any) {
    this.isAddEditFlowModel = true;
    this.router.navigate(['business_management/flow_model/edit_flow_model/' + flowModel?.id]);
  }
  /*================ END Navigate To Edit Flow Model Page ===============*/

  /*============ Remove Flow Model =============*/
  deleteFlowModelById(id: string, isConnectedToWebFlow: boolean) {
    if (isConnectedToWebFlow) {
      this.messageService.add({
        key: 'businessMgmtInfoKey', severity: 'success', summary: '', detail: 'Flow model is connected to one or more flow(s). Add/Remove or sequence change of activity model(s) can be done after removing the connection from flow(s).'
      });
    } else {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '330px',
        panelClass: 'myapp-no-padding-dialog',
        data: 'Are you sure you want to remove this flow model?',
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteFlowModelSub = this.businessMgmtService.deleteFlowModel(id).subscribe(res => {
            if (res) {
              this.businessMgmtDataService.removeFlowModel(id);
              this.getAllFlowModels();
              this.messageService.add({
                key: 'businessMgmtKey', severity: 'success', summary: '', detail: 'Flow model deleted successfully!'
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
    this.allFlowModelSub.unsubscribe();
    this.flowModelByIdSub.unsubscribe();
    this.deleteFlowModelSub.unsubscribe();
    if (!this.isAddEditFlowModel) {
      this.businessMgmtDataService.clearFlowModel();
    }
  }

}
