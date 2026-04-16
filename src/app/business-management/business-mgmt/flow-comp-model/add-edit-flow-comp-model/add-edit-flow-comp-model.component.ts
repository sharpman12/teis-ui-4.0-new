import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BusinessMgmtService } from '../../business-mgmt.service';
import { Location } from '@angular/common';
import { BusinessMgmtDataService } from '../../business-mgmt-data.service';
import { Subscription } from 'rxjs';
import { FlowModel, FlowType } from '../../businessmgmt';
import { Constants } from 'src/app/shared/components/constants';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-add-edit-flow-comp-model',
  templateUrl: './add-edit-flow-comp-model.component.html',
  styleUrls: ['./add-edit-flow-comp-model.component.scss']
})
export class AddEditFlowCompModelComponent implements OnInit, OnDestroy {
  addEditFlowModelForm: UntypedFormGroup;
  path = '';
  subHeading: string;
  selectedActivityModels = [];
  flowTypes = [];
  flowModels = [];
  allActivityModels = [];
  selectedCardDetails: any;
  selectedFlow: FlowModel;
  username: string;
  isActivityModelChanged = false;
  activeFlowModel: number;
  flowModelId: any;
  isFlowModelCURDAccess = false;

  validationMessages = {
    name: {
      required: 'Name is required',
      maxlength: 'Maximum 128 characters are allowed'
    },
    description: {
      required: 'Description is required',
      maxlength: 'Maximum 2000 characters are allowed'
    },
    property: {
      required: 'Property is required'
    },
    flowModel: {
      required: 'Flow model is required'
    }
  };

  formErrors = {
    name: '',
    description: '',
    property: '',
    flowModel: ''
  };

  // allFlowModelSub = Subscription.EMPTY;
  // flowModelByIdSub = Subscription.EMPTY;
  allFlowTypeSub = Subscription.EMPTY;
  allActivityModelSub = Subscription.EMPTY;
  activityModelByIdSub = Subscription.EMPTY;
  createModelSub = Subscription.EMPTY;
  updateFlowModelSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private header: HeaderService,
    public breadcrumb: BreadCrumbService,
    private fb: UntypedFormBuilder,
    private location: Location,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private businessMgmtService: BusinessMgmtService,
    private businessMgmtDataService: BusinessMgmtDataService
  ) {
    this.username = localStorage.getItem(Constants.USERNAME);
  }

  ngOnInit(): void {
    this.path = this.router.url;
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/business_management/flow_model') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.createForm();
    this.getFlowTypes();
    this.getFlowModels();
    if (this.path === '/business_management/flow_model/add_flow_model') {
      this.subHeading = 'Add flow model';
    } else {
      this.subHeading = 'Update flow model';
      /*---------------- Get Router Param ----------------*/
      this.activatedRoute.params.subscribe(params => {
        if (params.id) {
          this.flowModelId = params.id;
          this.getFlowModelById(params.id);
        }
      });
    }
    if (localStorage.getItem(Constants.CUD_FLOW_TYPE_AND_FLOW_MODEL)) {
      this.isFlowModelCURDAccess = true;
      this.addEditFlowModelForm.enable();
    } else {
      this.isFlowModelCURDAccess = false;
      this.addEditFlowModelForm.disable();
      this.messageService.add({ key: 'dashboardInfoKey', severity: 'success', summary: '', detail: 'Access denied — you don’t have permission to this module.' });
    }
  }

  createForm() {
    this.addEditFlowModelForm = this.fb.group({
      name: [{ value: '', disabled: false }, {
        validators: [Validators.required, Validators.maxLength(128)]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [Validators.maxLength(2000)]
      }],
      property: [{ value: '1', disabled: false }, {
        validators: [Validators.required]
      }],
      flowModel: [{ value: '1', disabled: false }, {
        validators: [Validators.required]
      }],
      activityModels: this.fb.array([
        this.addActivityModels(false)
      ])
    });
    this.addEditFlowModelForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.addEditFlowModelForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.addEditFlowModelForm): void {
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
        validators: [Validators.required]
      }]
    });
  }

  addMoreAm(): void {
    (<UntypedFormArray>this.addEditFlowModelForm.get('activityModels')).push(this.addActivityModels(true));
  }
  /*================== END Add Activity Models =================*/

  /*================== Set Existing Parameters =================*/
  setExistingParamerters(parameters: any[], isCtrlDisabled?: any): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    parameters.forEach(p => {
      formArray.push(this.fb.group({
        id: [{
          value: (
            this.path === '/business_management/flow_model/add_flow_model' ?
              '' : this.isActivityModelChanged ? '' : p?.activityModelData?.id
          ),
          disabled: this.selectedFlow?.connectedToWebflow
        }, {
          validators: [Validators.required]
        }]
      }));
    });
    return formArray;
  }

  /*========== Get Flow Types ==========*/
  getFlowTypes() {
    this.allFlowTypeSub = this.businessMgmtService.getAllFlowType().subscribe(res => {
      this.flowTypes = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*========== Get Flow Types ==========*/
  getFlowModels() {
    this.flowModels = [];
    this.flowModels = [
      { id: 1, name: 'One flow model' },
      { id: 2, name: 'Two flow model' },
      { id: 3, name: 'Three flow model' },
      { id: 4, name: 'Four flow model' },
      { id: 5, name: 'Five flow model' },
    ];
    if (this.path === '/business_management/flow_model/add_flow_model') {
      this.onChangeActivityModel(this.flowModels[0]?.id, false);
    }

  }

  onChangeActivityModel(id: string, isChanges: boolean) {
    this.isActivityModelChanged = isChanges;
    (<UntypedFormArray>this.addEditFlowModelForm.get('activityModels')).clear();
    this.getFlowModelById(id);
    this.createActivityModel(id);
    this.getAllActivityModels(id);
    // if (this.path === '/business_management/flow_model/add_flow_model') {
    //   this.getAllActivityModels(id);
    // }
  }

  createActivityModel(numOfModels: any) {
    const arr = [];
    for (let i = 0; i < Number(numOfModels); i++) {
      arr.push({
        activityModelData: {
          id: i + 1
        }
      });
    }
    this.addEditFlowModelForm.setControl('activityModels', this.setExistingParamerters(arr));
  }

  onChangeModel(event: any) {
    event.stopPropagation();
  }

  /*============ Get Flow Models By Id =============*/
  getFlowModelById(id: string) {
    const flowModel = this.activatedRoute.snapshot.data.flowModel;
    if (flowModel) {
      this.selectedFlow = flowModel;
      this.setExistingFormData(this.selectedFlow, id);
    }
  }

  /*========== Set Data For Edit ===========*/
  setExistingFormData(flowModel: FlowModel, flowModelId: string) {
    if (this.path === `/business_management/flow_model/edit_flow_model/${flowModelId}`) {
      this.addEditFlowModelForm.patchValue({
        name: flowModel?.name,
        description: flowModel?.description,
        property: flowModel?.flowType?.id,
        flowModel: flowModel?.flowActivityModelDataList?.length
      });
      if (this.selectedFlow?.connectedToWebflow) {
        this.addEditFlowModelForm.get('flowModel').disable();
      } else {
        this.addEditFlowModelForm.get('flowModel').enable();
      }
      this.getAllActivityModels(flowModel?.flowActivityModelDataList?.length);
      this.addEditFlowModelForm.setControl('activityModels', this.setExistingParamerters(flowModel?.flowActivityModelDataList));
    }
  }

  /*========== Get All Activity Model ==========*/
  getAllActivityModels(id: any) {
    this.allActivityModels = [];
    this.allActivityModelSub = this.businessMgmtService.getAllActivityModel().subscribe(res => {
      if (res?.length) {
        res.forEach(item => {
          if (Number(id) === 1) {
            if (Number(item?.id) === 4) {
              this.allActivityModels.push(item);
            }
          }
          if (Number(id) === 2) {
            if (Number(item?.id) === 1 || Number(item?.id) === 2) {
              this.allActivityModels.push(item);
            }
          }
          if (Number(id) === 3 || Number(id) === 4 || Number(id) === 5) {
            if (Number(item?.id) === 1 || Number(item?.id) === 2 || Number(item?.id) === 3 || Number(item?.id) === 5) {
              this.allActivityModels.push(item);
            }
          }
        });
      }
      // this.allActivityModels = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*========== Get Activity Model By Id ==========*/
  getActivityModelById(modelId: string) {
    this.activityModelByIdSub = this.businessMgmtService.getActivityModelById(modelId).subscribe(res => {
      // this.flowModels = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  addModel(activityModel: any) {
    if (this.selectedActivityModels?.length < 5) {
      this.selectedActivityModels.push(activityModel);
    } else {
      this.messageService.add({
        key: 'businessMgmtInfoKey', severity: 'success', summary: '', detail: 'Activity model cannot be added. One flow model can contain max five activity models.'
      });
    }
  }

  removeActivityModel(event: any, i: number, activityModel: any) {
    event.stopPropagation();
    (<UntypedFormArray>this.addEditFlowModelForm.get('activityModels')).removeAt(i);
  }

  selectedCard(event: any, modelId: any, index: number) {
    event.stopPropagation();
    this.activeFlowModel = index;
    let model;
    this.allActivityModels.forEach(item => {
      if (Number(item?.id) === Number(modelId?.id)) {
        model = item;
      }
    });
    this.selectedCardDetails = model;
  }

  /*============ Activity Model Sequence validation ===========*/
  validateActivityModelSeq(activityModels: Array<any>) {
    let isValidate = false;
    if (activityModels?.length) {
      const firstElement = activityModels[0];
      const lastElement = activityModels[activityModels.length - 1];
      if (Number(firstElement?.id) === 1 && Number(lastElement?.id) === 2) {
        isValidate = true;
      }
      return isValidate;
    }
  }

  /*============ Create New Flow Model =============*/
  createFlowModel() {
    this.addEditFlowModelForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.addEditFlowModelForm.valid) {
      const formValue = this.addEditFlowModelForm.value;
      let selectedFlowType: any;
      const flowActivityModelList = [];

      this.flowTypes.forEach(item => {
        if (Number(item?.id) === Number(formValue.property)) {
          selectedFlowType = { id: item?.id };
        }
      });

      if (formValue?.activityModels?.length) {
        formValue?.activityModels.forEach((model, i, arr) => {
          if (model?.id && model?.id !== '') {
            flowActivityModelList.push({
              activityModelData: model,
              sequence: i + 1
            });
          }
        });
      }

      const flowModelObj: FlowModel = {
        description: formValue?.description,
        flowActivityModelDataList: flowActivityModelList,
        flowType: selectedFlowType,
        id: null,
        lastUpdated: new Date(),
        name: formValue?.name,
        updatedBy: this.username
      };

      if (Number(formValue?.flowModel) === 1) {
        this.createModel(flowModelObj);
      } else {
        if (this.validateActivityModelSeq(formValue?.activityModels)) {
          this.createModel(flowModelObj);
        } else {
          this.messageService.add({
            key: 'businessMgmtInfoKey', severity: 'success', summary: '', detail: 'Invalid activity model sequence. Activity model sequence shall start with a Start Activity and end with an End Activity.'
          });
        }
      }
    }
  }

  createModel(flowModelObj: FlowModel) {
    this.createModelSub = this.businessMgmtService.createFlowModel(flowModelObj).subscribe(res => {
      if (res) {
        this.location.back();
        this.businessMgmtDataService.addFlowModel(res);
        this.messageService.add({
          key: 'businessMgmtKey', severity: 'success', summary: '', detail: 'Flow model created successfully!'
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
  /*============ End Create New Flow Model =============*/

  /*============ Update Flow Model =============*/
  updateFlowModel() {
    this.addEditFlowModelForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.addEditFlowModelForm.valid) {
      const formValue = this.addEditFlowModelForm.getRawValue();
      let selectedFlowType: any;
      const flowActivityModelList = [];

      this.flowTypes.forEach(item => {
        if (Number(item?.id) === Number(formValue.property)) {
          selectedFlowType = { id: item?.id };
        }
      });

      if (formValue?.activityModels?.length) {
        formValue?.activityModels.forEach((model, i, arr) => {
          if (model?.id && model?.id !== '') {
            flowActivityModelList.push({
              activityModelData: model,
              sequence: i + 1
            });
          }
        });
      }

      const flowModelObj: FlowModel = {
        description: formValue?.description,
        flowActivityModelDataList: flowActivityModelList,
        flowType: selectedFlowType,
        id: this.flowModelId,
        lastUpdated: new Date(),
        name: formValue?.name,
        updatedBy: this.username
      };

      if (Number(formValue?.flowModel) === 1) {
        this.updateModel(flowModelObj);
      } else {
        if (this.validateActivityModelSeq(formValue?.activityModels)) {
          this.updateModel(flowModelObj);
        } else {
          this.messageService.add({
            key: 'businessMgmtInfoKey', severity: 'success', summary: '', detail: 'Invalid activity model sequence. Activity model sequence shall start with a Start Activity and end with an End Activity.'
          });
        }
      }
    }
  }

  updateModel(flowModelObj: FlowModel) {
    this.updateFlowModelSub = this.businessMgmtService.updateFlowModel(flowModelObj).subscribe(res => {
      if (res) {
        this.location.back();
        this.businessMgmtDataService.updateFlowModel(res);
        this.messageService.add({
          key: 'businessMgmtKey', severity: 'success', summary: '', detail: 'Flow model updated successfully!'
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
  /*============ END Update Flow Model =============*/

  onCancelled() {
    this.businessMgmtDataService.storeSelectedFlowModelId(this.flowModelId);
    this.location.back();
  }

  ngOnDestroy(): void {
    this.allFlowTypeSub.unsubscribe();
    this.allActivityModelSub.unsubscribe();
    this.activityModelByIdSub.unsubscribe();
    this.createModelSub.unsubscribe();
    this.updateFlowModelSub.unsubscribe();
  }

}
