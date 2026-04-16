import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SharedService } from 'src/app/shared/services/shared.service';
import { BusinessMgmtDataService } from '../../business-mgmt-data.service';
import { BusinessMgmtService } from '../../business-mgmt.service';
import { FlowGroup } from '../../businessmgmt';
import { Constants } from 'src/app/shared/components/constants';
import { WorkspaceMgmtService } from 'src/app/workspace-management/workspace-mgmt/workspace-mgmt.service';

@Component({
  selector: 'app-add-edit-flow-group',
  templateUrl: './add-edit-flow-group.component.html',
  styleUrls: ['./add-edit-flow-group.component.scss']
})
export class AddEditFlowGroupComponent implements OnInit, OnDestroy {
  addEditFlowGrpForm: UntypedFormGroup;
  path = '';
  subHeading: string;
  webFlowGroup: FlowGroup;
  updateFlowGrpId: number;
  isFlowGroupCURDAccess = false;
  username: string = '';
  workspaces = [];
  currentUser: any = null;

  validationMessages = {
    name: {
      required: 'Name is required',
      maxlength: 'Maximum 128 characters are allowed'
    },
    description: {
      required: 'Description is required',
      maxlength: 'Maximum 2000 characters are allowed'
    },
    workspace: {
      required: 'Workspace is required'
    }
  };

  formErrors = {
    name: '',
    description: '',
    workspace: '',
  };

  getWorksapceSub = Subscription.EMPTY;
  createFlowGroupSub = Subscription.EMPTY;
  updateFlowGroupSub = Subscription.EMPTY;
  validateFlowGroupSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private location: Location,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private workspaceMgmtService: WorkspaceMgmtService,
    private businessMgmtService: BusinessMgmtService,
    private businessMgmtDataService: BusinessMgmtDataService
  ) {
    this.username = localStorage.getItem(Constants.USERNAME);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit(): void {
    this.path = this.router.url;
    this.createForm();
    this.getWorkspaces();
    if (localStorage.getItem(Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP)) {
      this.isFlowGroupCURDAccess = true;
      this.addEditFlowGrpForm.enable();
    } else {
      this.isFlowGroupCURDAccess = false;
      this.addEditFlowGrpForm.disable();
      this.messageService.add({ key: 'dashboardInfoKey', severity: 'success', summary: '', detail: 'Access denied — you don’t have permission to this module.' });
    }
    if (this.path === '/business_management/web_flow_group/add_flow_group') {
      this.subHeading = 'Add flow group';
    } else {
      this.subHeading = 'Update flow group';
      /*---------------- Get Router Param ----------------*/
      this.activatedRoute.params.subscribe(params => {
        if (params.id) {
          this.updateFlowGrpId = params.id;
          this.getFlowGroupById(params.id);
        }
      });
    }
  }

  createForm() {
    this.addEditFlowGrpForm = this.fb.group({
      name: [{ value: '', disabled: false }, {
        validators: [Validators.required, Validators.maxLength(128)]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [Validators.maxLength(2000)]
      }],
      workspace: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }]
    });
    this.addEditFlowGrpForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.addEditFlowGrpForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.addEditFlowGrpForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = '';
        if (abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty)) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    });
  }
  /*============ END Check Form Validation and Display Messages ============*/

  getFlowGroupById(flowGrpId: string) {
    const flowGroup = this.activatedRoute.snapshot.data.flowGroup;
    this.webFlowGroup = flowGroup;
    this.addEditFlowGrpForm.patchValue({
      name: flowGroup?.name,
      description: flowGroup?.description,
      workspace: flowGroup?.workspaceData?.id
    });
    // Changes for Jira TEI-5100
    let isFlowGrpConnected = false;
    if (flowGroup?.webFlowDataList?.length) {
      isFlowGrpConnected = flowGroup?.webFlowDataList?.some((flow: any) => flow?.connectedToBusinessFlow);
    }
    this.webFlowGroup.isFlowGrpConnected = isFlowGrpConnected;
    if (isFlowGrpConnected) {
      this.addEditFlowGrpForm.get('workspace').disable();
    } else {
      this.addEditFlowGrpForm.get('workspace').enable();
    }
  }

  /*============ Get All Workspaces ===============*/
  getWorkspaces() {
    const accessWorkspacesArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    this.getWorksapceSub = this.workspaceMgmtService.getAllWorkspaces(this.username).subscribe((res) => {

      if (res?.length && accessWorkspaces?.length) {
        // Filter out archived workspaces
        const workspacesArr = JSON.parse(JSON.stringify(res)).filter((x) => !x?.archived);
        accessWorkspaces.forEach((aws) => {
          workspacesArr.forEach((ws) => {
            if (Number(aws?.workspaceId) === Number(ws?.id)) {
              if (aws?.accessList.some((x) => x?.key === 'BM_CRUD_FLFG')) {
                accessWorkspacesArr.push(ws);
              }
            }
          });
        });

        this.workspaces = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Get All Workspaces ===============*/

  /*=========== Get Selected Workspace ===========*/
  selectedWs(workspaceId: string) {
    let selectedWs;
    if (this.workspaces?.length) {
      this.workspaces.forEach(item => {
        if (Number(item?.id) === Number(workspaceId))
          selectedWs = {
            id: item?.id,
            name: item?.name
          };
      });
      return selectedWs;
    }
  }
  /*=========== END Get Selected Workspace ===========*/

  /*============ Validate Flow Group ============*/
  validateFlowGroup(isCreate: boolean) {
    this.addEditFlowGrpForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.addEditFlowGrpForm?.valid) {
      const formValues = this.addEditFlowGrpForm.getRawValue();
      this.validateFlowGroupSub = this.businessMgmtService.validateAccess('flowgroup', formValues?.workspace, this.currentUser?.userName, 0).subscribe((res) => {
        if (res?.hasAccess) {
          if (isCreate) {
            this.createFlowGroup();
          } else {
            this.updateFlowGroup();
          }
        } else {
          this.messageService.add({
            key: 'businessMgmtInfoKey', severity: 'info', summary: '', detail: `Oops! Looks like you don’t have access to create a flow group.`
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

  }

  /*============ Create Flow Group ============*/
  createFlowGroup() {
    this.addEditFlowGrpForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.addEditFlowGrpForm?.valid) {
      const formValues = this.addEditFlowGrpForm.value;
      const flowGroupDto: FlowGroup = {
        name: formValues?.name,
        description: formValues?.description,
        errorCount: null,
        workspaceData: this.selectedWs(formValues?.workspace)
      };
      this.createFlowGroupSub = this.businessMgmtService.createFlowGroup(flowGroupDto).subscribe(res => {
        if (res) {
          this.businessMgmtDataService.createFlowGroup(res);
          this.router.navigate(['/business_management/web_flow_group']);
          this.messageService.add({
            key: 'businessMgmtKey', severity: 'success', summary: '', detail: 'Flow group created successfully!'
          });
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
          this.messageService.add({
            key: 'businessMgmtInfoKey', severity: 'info', summary: '', detail: err?.error?.message
          });
        }
      });
    }
  }
  /*============ END Create Flow Group ============*/

  /*============ Update Flow Group ============*/
  updateFlowGroup() {
    this.addEditFlowGrpForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.addEditFlowGrpForm?.valid) {
      const formValues = this.addEditFlowGrpForm.value;
      const flowGroupDto: FlowGroup = {
        name: formValues?.name,
        description: formValues?.description,
        errorCount: this.webFlowGroup?.errorCount,
        id: this.webFlowGroup?.id,
        workspaceData: this.selectedWs(formValues?.workspace)
      };
      this.updateFlowGroupSub = this.businessMgmtService.updateFlowGroup(flowGroupDto).subscribe(res => {
        if (res) {
          this.businessMgmtDataService.updateFlowGroup(res);
          this.router.navigate(['/business_management/web_flow_group']);
          this.messageService.add({
            key: 'businessMgmtKey', severity: 'success', summary: '', detail: 'Flow group updated successfully!'
          });
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
          this.messageService.add({
            key: 'businessMgmtInfoKey', severity: 'info', summary: '', detail: err?.error?.message
          });
        }
      });
    }
  }
  /*============ END Update Flow Group ============*/

  /*============ On Cancelled Back to Page ============*/
  onCancelled() {
    this.businessMgmtDataService.storeSelectedFlowGrpId(Number(this.updateFlowGrpId));
    this.location.back();
  }
  /*============ END On Cancelled Back to Page ============*/

  ngOnDestroy(): void {
    this.validateFlowGroupSub.unsubscribe();
    this.createFlowGroupSub.unsubscribe();
    this.updateFlowGroupSub.unsubscribe();
  }

}
