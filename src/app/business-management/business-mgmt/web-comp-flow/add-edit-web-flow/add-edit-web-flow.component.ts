import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { LogReportService } from 'src/app/core/service/logreport.service';
import { Constants } from 'src/app/shared/components/constants';
import { WorkspaceMgmtService } from 'src/app/workspace-management/workspace-mgmt/workspace-mgmt.service';
import { BusinessMgmtDataService } from '../../business-mgmt-data.service';
import { BusinessMgmtService } from '../../business-mgmt.service';
import { WebFlow } from '../../businessmgmt';
import { Subscription } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';

@Component({
  selector: 'app-add-edit-web-flow',
  templateUrl: './add-edit-web-flow.component.html',
  styleUrls: ['./add-edit-web-flow.component.scss']
})
export class AddEditWebFlowComponent implements OnInit, OnDestroy {
  addEditWebFlowForm: UntypedFormGroup;
  subHeading: string;
  path = '';
  username: string;
  updateFlowId: number;
  activeWebFlow: number;
  selectedCardDetails: any;
  isFlowCURDAccess = false;
  timeFrames = [];
  workspaces = [];
  flowGroups = [];
  flowModels = [];
  flowActivityModel = [];
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
    disable: {
      required: 'Disable is required'
    },
    timeframe: {
      required: 'Timeframe is required'
    },
    workspace: {
      required: 'Workspace is required'
    },
    group: {
      required: 'Group is required'
    },
    model: {
      required: 'Model is required'
    },
  };

  formErrors = {
    name: '',
    description: '',
    disable: '',
    timeframe: '',
    workspace: '',
    group: '',
    model: '',
  };

  allFlowGroupSub = Subscription.EMPTY;
  allFlowModelSub = Subscription.EMPTY;
  createWebFlowSub = Subscription.EMPTY;
  updateWebFlowSub = Subscription.EMPTY;
  deleteBfRelationSub = Subscription.EMPTY;
  validateWebFlowSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private location: Location,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private logReportService: LogReportService,
    private businessMgmtService: BusinessMgmtService,
    private businessMgmtDataService: BusinessMgmtDataService,
    private workspaceMgmtService: WorkspaceMgmtService
  ) {
    this.username = localStorage.getItem(Constants.USERNAME);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnInit(): void {
    this.createForm();
    this.getTimeFrames();
    this.getWorkspaces();
    this.getFlowGroups();
    this.getFlowModels();
    this.path = this.router.url;
    if (this.path === '/business_management/web_flow/add_flow') {
      this.subHeading = 'Add flow';
      this.addEditWebFlowForm.patchValue({
        timeframe: this.timeFrames[0]
      });
      this.addEditWebFlowForm.patchValue({
        workspace: this.workspaces[0]?.id
      });
    } else {
      this.subHeading = 'Update flow';
      /*---------------- Get Router Param ----------------*/
      this.activatedRoute.params.subscribe(params => {
        if (params.id) {
          this.updateFlowId = params.id;
          this.getWebFlowById(params.id);
        }
      });
    }
    if (localStorage.getItem(Constants.BUSSINESS_MANAGEMENT_CRUD_FLOW_AND_FLOW_GROUP)) {
      this.isFlowCURDAccess = true;
      this.addEditWebFlowForm.enable();
    } else {
      this.isFlowCURDAccess = false;
      this.addEditWebFlowForm.disable();
      this.messageService.add({ key: 'dashboardInfoKey', severity: 'success', summary: '', detail: 'Access denied — you don’t have permission to this module.' });
    }
    if (localStorage.getItem(Constants.ENABLED_DISALED_FLOWS)) {
      this.addEditWebFlowForm.get('disable').enable();
    } else {
      this.addEditWebFlowForm.get('disable').disable();
    }
  }

  createForm() {
    this.addEditWebFlowForm = this.fb.group({
      name: [{ value: '', disabled: false }, {
        validators: [Validators.required, Validators.maxLength(128)]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [Validators.maxLength(2000)]
      }],
      disable: [{ value: false, disabled: false }, {
        validators: []
      }],
      timeframe: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      workspace: [{ value: '', disabled: false }, {
        validators: []
      }],
      group: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      model: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      activityModels: this.fb.array([
        this.addActivityModels(false)
      ])
    });
    this.addEditWebFlowForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.addEditWebFlowForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.addEditWebFlowForm): void {
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

  /*================== Add Activity Models =================*/
  addActivityModels(additionalParam: boolean): UntypedFormGroup {
    return this.fb.group({
      id: [{ value: '', disabled: false }, {
        validators: []
      }],
      name: [{ value: '', disabled: false }, {
        validators: [Validators.required, Validators.maxLength(128)]
      }],
      webFlowActivityDes: [{ value: '', disabled: false }, {
        validators: [Validators.maxLength(2000)]
      }],
    });
  }

  addMoreAm(): void {
    (<UntypedFormArray>this.addEditWebFlowForm.get('activityModels')).push(this.addActivityModels(true));
  }
  /*================== END Add Activity Models =================*/

  /*================== Set Existing Parameters =================*/
  setExistingParamerters(parameters: any[], isCtrlDisabled?: any): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    parameters.forEach(p => {
      formArray.push(this.fb.group({
        id: [{
          value: p?.id,
          disabled: false
        }, {
          validators: []
        }],
        name: [{
          value: p?.activityModelData?.name,
          disabled: false
        }, {
          validators: [
            Validators.required,
            Validators.maxLength(128)
          ]
        }],
        webFlowActivityDes: [{
          value: p?.activityModelData?.webFlowActivityDes,
          disabled: false
        }, {
          validators: [
            Validators.maxLength(2000)
          ]
        }],
      }));
    });
    return formArray;
  }

  /*============ Get All Time frames ============*/
  getTimeFrames() {
    this.logReportService.getTimeFrames().subscribe(res => {
      this.timeFrames = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============ Get All Workspaces ===============*/
  getWorkspaces() {
    this.workspaceMgmtService.getAllWorkspaces(this.username).subscribe((res) => {
      if (res?.length) {
        this.workspaces = res;
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

  /*============ Get All Flow Groups ===============*/
  getFlowGroups() {
    const accessFlowGrpArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    this.allFlowGroupSub = this.businessMgmtService.getAllFlowGroup().subscribe((res) => {
      if (res?.length) {
        const flowGrps = JSON.parse(JSON.stringify(res));
        flowGrps.forEach((item) => {
          const accessWs = accessWorkspaces?.find(x => Number(x?.workspaceId) === Number(item?.workspaceData?.id));
          if (accessWs?.accessList.some((x) => x?.key === 'BM_CRUD_FLFG')) {
            accessFlowGrpArr.push(item);
          }
        });
        this.flowGroups = accessFlowGrpArr;
      }
      // this.flowGroups = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Get All Flow Groups ===============*/

  /*============ Get All Flow Models ===============*/
  getFlowModels() {
    this.allFlowModelSub = this.businessMgmtService.getAllFlowModel().subscribe(res => {
      this.flowModels = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Get All Flow Models ===============*/

  /*============ Get Web Flow By Id ===============*/
  getWebFlowById(webFlowId: string) {
    this.flowActivityModel = [];
    const webFlow = this.activatedRoute.snapshot.data.webFlow;
    this.addEditWebFlowForm.patchValue({
      name: webFlow?.name,
      description: webFlow?.description,
      disable: webFlow?.disable,
      timeframe: webFlow?.searchTimeFrame,
      workspace: webFlow?.workspaceData?.id,
      group: webFlow?.flowGroupData?.id,
      model: webFlow?.flowModelData?.id,
    });
    this.flowActivityModel = webFlow?.flowModelData?.flowActivityModelDataList;
    this.addEditWebFlowForm.setControl('activityModels', this.setExistingParamerters(webFlow?.flowModelData?.flowActivityModelDataList));
    this.selectedCard(0);
  }
  /*============ End Get Web Flow By Id ===============*/

  onChangeActivityModel(id: string, isChanges: boolean) {
    if (this.flowModels?.length) {
      this.flowActivityModel = [];
      this.flowModels.forEach(item => {
        if (Number(item?.id) === Number(id)) {
          this.flowActivityModel = item?.flowActivityModelDataList;
          this.addEditWebFlowForm.setControl('activityModels', this.setExistingParamerters(item?.flowActivityModelDataList));
          this.selectedCard(0);
        }
      });
    }
  }

  selectedCard(index: number) {
    this.activeWebFlow = index;
    let model;
    this.flowActivityModel.forEach((item, i, arr) => {
      if (i === index) {
        model = item;
      }
    });
    this.selectedCardDetails = model;
  }

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

  /*=========== Get Selected Group ===========*/
  getSelectedGroup(groupId: string) {
    let selectedGroup;
    if (this.flowGroups?.length) {
      this.flowGroups.forEach(item => {
        if (Number(item?.id) === Number(groupId))
          selectedGroup = {
            id: item?.id,
            name: item?.name,
            description: item?.description,
            errorCount: item?.errorCount,
          };
      });
      return selectedGroup;
    }
  }
  /*===========END Get Selected Group ===========*/

  /*=========== Get Selected Models ===========*/
  getSelectedModel(modelId: string) {
    let selectedModel;
    if (this.flowModels?.length) {
      this.flowModels.forEach(item => {
        if (Number(item?.id) === Number(modelId))
          selectedModel = {
            id: item?.id,
            name: item?.name,
            flowType: {
              id: item?.flowType?.id,
              name: item?.flowType?.name,
              description: item?.flowType?.description
            }
          };
      });
      return selectedModel;
    }
  }

  /*============ Validate Web Flow ============*/
  validateWebFlow(isCreate: boolean) {
    this.addEditWebFlowForm.markAllAsTouched();
    this.logValidationErrors(this.addEditWebFlowForm);
    if (this.addEditWebFlowForm.valid) {
      const formvalues = this.addEditWebFlowForm.value;
      let workspaceId = null;
      if (this.flowGroups?.length) {
        this.flowGroups.forEach((item) => {
          if (Number(item?.id) === Number(formvalues?.group)) {
            workspaceId = item?.workspaceData?.id;
          }
        });
      }
      this.validateWebFlowSub = this.businessMgmtService.validateAccess('webFlow', workspaceId, this.currentUser?.userName, formvalues?.group).subscribe((res) => {
        if (res?.hasAccess) {
          if (isCreate) {
            this.createWebFlow();
          } else {
            this.checkConnectionWithBusinessFlow();
          }
        } else {
          this.messageService.add({
            key: 'businessMgmtInfoKey', severity: 'info', summary: '', detail: `Oops! Looks like you don’t have access to create a web flow.`
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

  /*============ Create New Web Flow ===============*/
  createWebFlow() {
    this.addEditWebFlowForm.markAllAsTouched();
    this.logValidationErrors(this.addEditWebFlowForm);
    if (this.addEditWebFlowForm.valid) {
      const formvalues = this.addEditWebFlowForm.value;
      let activityModels = [];
      if (formvalues?.activityModels?.length) {
        formvalues?.activityModels.forEach(item => {
          activityModels.push({
            flowActivityModelId: item?.id,
            name: item?.name,
            description: item?.webFlowActivityDes
          });
        });
      }
      const webFlow: WebFlow = {
        name: formvalues?.name,
        description: formvalues?.description,
        disable: formvalues?.disable,
        searchTimeFrame: formvalues?.timeframe,
        workspaceData: this.selectedWs(formvalues?.workspace),
        flowGroupData: this.getSelectedGroup(formvalues?.group),
        flowModelData: this.getSelectedModel(formvalues?.model),
        webFlowActivityNameDataList: activityModels
      };
      this.createWebFlowSub = this.businessMgmtService.createWebFlow(webFlow).subscribe(res => {
        if (res) {
          this.businessMgmtDataService.createWebFlow(res);
          this.location.back();
          this.messageService.add({
            key: 'businessMgmtKey', severity: 'success', summary: '', detail: 'Web flow created successfully!'
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
  /*============ End Create New Web Flow ===============*/

  /*============ Check Connections with Business Flows and Then Update New Web Flow ===============*/
  checkConnectionWithBusinessFlow() {
    const webFlow = this.activatedRoute.snapshot.data.webFlow;
    const groupId = this.addEditWebFlowForm.get('group').value;
    const modelId = this.addEditWebFlowForm.get('model').value;
    if (webFlow?.connectedToBusinessFlow) {
      if (Number(webFlow?.flowGroupData?.id) !== Number(groupId) || Number(webFlow?.flowModelData?.id) !== Number(modelId)) {
        const dialogRef = this.dialog.open(ConfirmationComponent, {
          width: '330px',
          panelClass: 'myapp-no-padding-dialog',
          data: 'Flow is connected to one or more business flow. Updating flow group/flow model will remove all business flow connections of Integration(s) connected to this flow. Click Yes to update',
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.deleteBfRelationship(webFlow?.id);
          }
        });
      } else {
        this.updateWebFlow();
      }
    } else {
      this.updateWebFlow();
    }
  }

  /*========= Delete Business Flow Relations By Web Flow Id =========*/
  deleteBfRelationship(flowId: number) {
    this.deleteBfRelationSub = this.businessMgmtService.deleteBfRelation(flowId).subscribe(res => {
      if (res) {
        this.updateWebFlow();
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

  /*============= Update Web Flow =============*/
  updateWebFlow() {
    this.addEditWebFlowForm.markAllAsTouched();
    this.logValidationErrors(this.addEditWebFlowForm);
    if (this.addEditWebFlowForm.valid) {
      const formvalues = this.addEditWebFlowForm.value;
      let activityModels = [];
      if (formvalues?.activityModels?.length) {
        formvalues?.activityModels.forEach(item => {
          activityModels.push({
            flowActivityModelId: item?.id,
            name: item?.name,
            description: item?.webFlowActivityDes
          });
        });
      }
      const webFlow: WebFlow = {
        id: Number(this.updateFlowId),
        name: formvalues?.name,
        description: formvalues?.description,
        disable: formvalues?.disable,
        searchTimeFrame: formvalues?.timeframe,
        workspaceData: this.selectedWs(formvalues?.workspace),
        flowGroupData: this.getSelectedGroup(formvalues?.group),
        flowModelData: this.getSelectedModel(formvalues?.model),
        webFlowActivityNameDataList: activityModels
      };
      this.updateWebFlowSub = this.businessMgmtService.updateWebFlow(webFlow).subscribe(res => {
        if (res) {
          this.businessMgmtDataService.updateWebFlow(res);
          this.location.back();
          this.messageService.add({
            key: 'businessMgmtKey', severity: 'success', summary: '', detail: 'Web flow updated successfully!'
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
  /*============ END Check Connections with Business Flows and Then Update New Web Flow ===============*/

  onCancelled() {
    this.businessMgmtDataService.storeSelectedWebFlowId(Number(this.updateFlowId));
    this.location.back();
  }

  ngOnDestroy(): void {
    this.allFlowGroupSub.unsubscribe();
    this.allFlowModelSub.unsubscribe();
    this.validateWebFlowSub.unsubscribe();
    this.createWebFlowSub.unsubscribe();
    this.updateWebFlowSub.unsubscribe();
    this.deleteBfRelationSub.unsubscribe();
  }

}
