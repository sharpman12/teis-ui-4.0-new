import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormArray } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebFlow } from 'src/app/business-management/business-mgmt/businessmgmt';
import { AppIntegrationDataService } from '../../app-integration-data.service';
import { BusinessFlowDto } from '../../appintegration';
import { AppIntegrationService } from '../../app-integration.service';
import { Constants } from "src/app/shared/components/constants";
import { Router } from '@angular/router';

@Component({
  selector: 'app-properties-business-flow',
  templateUrl: './properties-business-flow.component.html',
  styleUrls: ['./properties-business-flow.component.scss']
})
export class PropertiesBusinessFlowComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number = null;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  businessFlowForm: UntypedFormGroup;
  webFlows: any = [];
  activeWebFlow: any;
  selectedActivityModelData = -1;
  activityModelData: any = null;
  selectedWebFlow: WebFlow;
  selectedWebFlowId: any;
  selectedCardDetails: any;
  activeCard: any = null;
  businessIntegration = [];
  attachedBusinessIntegration: number;
  executableList: any = null;
  currentUser: any = null;
  integrationData: any = null;
  isGetBusinessLocked: Boolean = false;
  isBusinessFormDisable: Boolean = false;
  ParametersObject: any = null;
  selectedWebFlowData: any = null;
  editMode: boolean[] = []; // Tracks if each row is in edit mode
  editValue: string[] = []; // Stores temporary value for each row
  webFlowByIdSub = Subscription.EMPTY;
  businessFlowById = Subscription.EMPTY;
  allWebFlow = Subscription.EMPTY;
  integrationDetail = Subscription.EMPTY;
  scriptParameterData = Subscription.EMPTY;
  getIntegrationDetailsSub = Subscription.EMPTY;

  constructor(
    public router: Router,
    private appIntegrationDataService: AppIntegrationDataService,
    private fb: UntypedFormBuilder,
    private appIntegrationService: AppIntegrationService
  ) {

  }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
    this.createForm();
    if (this.router?.url.includes("properties")) {
      this.isGetBusinessLocked = false;
      this.businessFlowForm.disable();
    } else {
      this.isGetBusinessLocked = true;
      this.businessFlowForm.enable();
      this.businessFlowForm.get('scriptDataId').disable();
    }
  }

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    this.isGetBusinessLocked = isPITLock;
    if (isPITLock) {
      this.isGetBusinessLocked = false;
      this.businessFlowForm.enable();
      this.businessFlowForm.get('scriptDataId').disable();
    } else {
      this.isGetBusinessLocked = true;
      this.businessFlowForm.disable();
    }

  }

  /*============ Form Creation ============*/
  createForm() {
    this.businessFlowForm = this.fb.group({
      webFlowDataId: [
        { value: "", disabled: false },
        [Validators.required]
      ],
      webFlowData: [
        { value: "", disabled: false }
      ],
      scriptData: [{ value: [], disabled: false }, {
        validators: []
      }],
      scriptDataId: [{ value: [], disabled: false }, {
        validators: []
      }],
      scriptPosition: [{ value: 0, disabled: false }],
      flowActivityModelId: [
        { value: "", disabled: false }
      ],
      correlationName: this.fb.array([]),
      attachedBusinessIntegrationId: [
        { value: "", disabled: false }
      ],
      attachedBusinessIntegration: [
        { value: "", disabled: false }
      ],
      description: [
        { value: "", disabled: true }
      ],
      businessFlowId: [
        { value: "", disabled: false }
      ],
      checkboxes: this.fb.array([])
    });

  }
  /*============ END Form Creation ============*/

  /*============ Set Existing Data In Form ============*/
  setFormValues(formValues: any) {
    this.integrationData = formValues;
    if (formValues?.locked && Number(this.currentUser?.id) === Number(formValues?.lockedUserId)) {
      this.isGetBusinessLocked = true;
      this.businessFlowForm.enable();
      this.businessFlowForm.get('scriptDataId').disable();

    } else {
      this.isGetBusinessLocked = false;
      this.businessFlowForm.disable();
    }

  }

  /* ========== Set Form Data with Business Flow Details ========== */
  private setFormData(businessFlowData: any, enabledAllFields: Boolean = true) {
    this.businessFlowForm.patchValue({
      businessFlowId: businessFlowData?.businessFlowId,
      webFlowDataId: businessFlowData?.webFlowData?.id,
      webFlowData: businessFlowData?.webFlowData,
      flowActivityModelId: businessFlowData?.flowActivityModelId,
      scriptPosition: businessFlowData?.scriptPosition,
      scriptData: businessFlowData?.scriptData,
      scriptDataId: businessFlowData?.scriptData ? businessFlowData?.scriptData?.id : '',
      activityModelData: businessFlowData?.webFlowData?.flowModelData?.flowActivityModelDataList,
      attachedBusinessIntegration: businessFlowData?.attachedBusinessIntegration,
      attachedBusinessIntegrationId: businessFlowData?.attachedBusinessIntegration?.id,
      description: businessFlowData?.attachedBusinessIntegration?.description,
      checkboxes: []
    });
    this.populateCorrelationNames(businessFlowData);
    this.selectedWebFlowData = this.appIntegrationDataService.getAllWebFlowsById(businessFlowData?.webFlowData?.id);
    this.activeWebFlow = businessFlowData?.webFlowData?.id;
    this.activeCard = parseInt(businessFlowData?.flowActivityModelId);
    this.ParametersObject = [];

    if (businessFlowData?.scriptData?.id) {
      this.getParameterData(businessFlowData.scriptData.id, enabledAllFields);
      this.appIntegrationDataService.storeSelectedScriptId(businessFlowData.scriptData.id)

    }
    if (!enabledAllFields) {
      this.enabledAllFields();
    } else {
      this.disabledAllFields();
    }
  }

  /* ========== Selection of activity card ========== */
  selectedCard(model: any, index: number) {
    this.activeCard = model.flowActivityModelId;
    this.selectedCardDetails = model;
    this.selectedActivityModelData = -1;
    this.disabledAllFields();
    // Fetch business flow data
    this.getBusinessFlowByIds(model.flowActivityModelId);
    if (Number(this.itemId) !== Number(this.businessFlowForm.get('attachedBusinessIntegrationId').value)) {
      this.getIntegrationItemDetails(this.itemId);
    }

    const businessFlowArr = this.appIntegrationDataService.getBusinessFlowByFlowModel(this.activeWebFlow, model.flowActivityModelId);
    if (businessFlowArr.length) {
      this.setFormData(businessFlowArr[0]);
    } else {
      this.resetForm(model.flowActivityModelId);
      this.setCheckboxes(true);  // Ensure checkboxes are set with 'disabled' logic
    }
  }

  /* ========== End Selection of activity card ========== */

  /* ========== Checkbox Selection Handling ========== */
  selectedCardCheckbox(event: any, model: any, index: number) {
    this.selectedCardDetails = model;
    this.activeCard = model.flowActivityModelId;
    this.selectedActivityModelData = event.target.checked ? model.flowActivityModelId : -1;

    if (!event.target.checked) {
      this.disabledAllFields();
      return;
    }
    this.getBusinessFlowByIds(model.flowActivityModelId);
    if (Number(this.itemId) !== Number(this.businessFlowForm.get('attachedBusinessIntegrationId').value)) {
      this.getIntegrationItemDetails(this.itemId, true);
    }
    else {
      const businessFlowArr = this.appIntegrationDataService.getBusinessFlowByFlowModel(this.activeWebFlow, model.flowActivityModelId);
      if (businessFlowArr.length) {
        this.setFormData(businessFlowArr[0], false);
      } else {
        this.resetForm(model.flowActivityModelId);
        this.enabledAllFields();
        this.setCheckboxes();  // Default behavior
      }
    }
  }

  /* ========== End of Checkbox Selection Handling ========== */

  /* ========== Reset Form Data for a New Model ========== */
  private resetForm(flowActivityModelId, checkbox: Boolean = false) {
    this.businessFlowForm.patchValue({
      businessFlowId: '',
      flowActivityModelId: flowActivityModelId,
      scriptData: null,
      scriptDataId: '',
      checkboxes: [],
      attachedBusinessIntegrationId: this.itemId,
      description: this.integrationData?.description
    });

    (this.businessFlowForm.get('checkboxes') as FormArray).clear();
    (this.businessFlowForm.get('correlationName') as FormArray).clear();
    this.ParametersObject = [];
    if (checkbox) {
      this.enabledAllFields();
      this.setCheckboxes();  // Default behavior
    }
  }
  /* ========== End of Reset Form Data for a New Model ========== */

  /* ========== Populate Correlation Names in Form ========== */
  private populateCorrelationNames(businessFlowData: any) {
    const correlationNameArray = this.businessFlowForm.get('correlationName') as FormArray;
    correlationNameArray.clear();

    if (businessFlowData?.correlationName?.length) {
      businessFlowData.correlationName.forEach((corr: any) => {
        correlationNameArray.push(this.fb.group({
          executableParamName: corr?.executableParamName,
          correlationName: corr?.correlationName
        }));
      });
    }
  }
  /* ========== End of Populate Correlation Names in Form ========== */


  // getBusinessFlow(propertiesDetails?: any) {
  //   this.executableList = propertiesDetails?.associatedProcess?.scriptList;
  //   this.executableList.forEach((executable) => {
  //     executable.executableRef = executable?.executableRef ? executable?.executableRef : executable?.id;
  //   })
  //   this.appIntegrationDataService.storeSelectedBusiFlowIntegration(propertiesDetails);
  //   // if (propertiesDetails?.businessFlowDatas?.length) {
  //   //   this.appIntegrationDataService.storebusinessFlowsByWebFlowId(propertiesDetails?.businessFlowDatas);
  //   // }
  //   this.appIntegrationDataService.storebusinessFlowsByWebFlowId(propertiesDetails?.businessFlowDatas);

  //   this.getAllWebFlow();
  // }

  getBusinessFlow(propertiesDetails?: any) {

    const clonedScriptList =
      propertiesDetails?.associatedProcess?.scriptList?.map(executable => ({
        ...executable,
        executableRef: executable.executableRef ?? executable.id
      }));

    this.executableList = clonedScriptList;

    this.appIntegrationDataService.storeSelectedBusiFlowIntegration({
      ...propertiesDetails,
      associatedProcess: {
        ...propertiesDetails.associatedProcess,
        scriptList: clonedScriptList
      }
    });

    this.appIntegrationDataService.storebusinessFlowsByWebFlowId(
      propertiesDetails?.businessFlowDatas
    );

    this.getAllWebFlow();
  }

  /* ========== Get All WebFlows ========== */
  getAllWebFlow() {
    const workspacesIdArray = [];
    workspacesIdArray.push(this.workspaceId);
    this.webFlows = [];
    const allBusinessFlow = this.appIntegrationDataService.getAllBusinessFlows();
    if (allBusinessFlow.length) {
      this.selectedWebFlowId = allBusinessFlow[0].webFlowData.id;
    }
    const allWebFlows = this.appIntegrationDataService.getAllWebFlows();
    if (allWebFlows?.length) {
      this.webFlows = allWebFlows;
      if (this.webFlows.length) {
        this.getWebFlowById(this.selectedWebFlowId ? this.selectedWebFlowId : this.webFlows[0]?.id);
      }

    } else {
      this.allWebFlow = this.appIntegrationService.getAllWebFlow(workspacesIdArray).subscribe(res => {
        if (res?.length) {
          this.webFlows = res;
          this.appIntegrationDataService.storeAllWebFlows(res);
          if (this.webFlows.length) {
            this.getWebFlowById(this.selectedWebFlowId ? this.selectedWebFlowId : this.webFlows[0]?.id);
          }

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

  /* ========== End of Get All WebFlows ========== */

  /*============ Get Web Flow By Id ===============*/
  getWebFlowById(webFlowId: string) {
    const correlationNameArray = this.businessFlowForm.get('correlationName') as FormArray;
    correlationNameArray.clear();

    const webFlowByIdData = this.appIntegrationDataService.getAllWebFlowsById(webFlowId);
    const businessFlowData = this.appIntegrationDataService.getBusinessFlowByWebFlowId(webFlowId);

    // If webFlowByIdData is available, proceed to set the form data
    if (webFlowByIdData) {
      this.handleWebFlowData(webFlowId, webFlowByIdData, businessFlowData);
    } else {
      // Fallback: Make API call to fetch web flow data
      this.webFlowByIdSub = this.appIntegrationService.getWebFlowById(webFlowId).subscribe(
        (res) => {
          if (!res) return;
          this.handleWebFlowData(webFlowId, res, businessFlowData);
        },
        (err: HttpErrorResponse) => {
          // Handle error if necessary
        }
      );
    }
  }
  /*============ End of Get Web Flow By Id ===============*/

  // Handle form update and business logic for the given webFlowData and businessFlowData
  private handleWebFlowData(webFlowId: string, webFlowData: any, businessFlowData: any) {
    this.activeWebFlow = webFlowId;
    this.activityModelData = webFlowData;
    this.selectedWebFlow = webFlowData;

    if (businessFlowData.length) {
      this.setFormData(businessFlowData[0]);
      this.getBusinessFlowByIds(businessFlowData[0].flowActivityModelId);
      const selectedWebFlowByIdData = this.appIntegrationDataService.getSelectedWebFlowById(webFlowId, businessFlowData[0].flowActivityModelId);
      //this.selectedCard(selectedWebFlowByIdData, 0);
      this.activeCard = selectedWebFlowByIdData.flowActivityModelId;
      this.selectedCardDetails = selectedWebFlowByIdData;
      this.selectedActivityModelData = -1;
      this.disabledAllFields();

    } else {
      this.businessFlowForm.patchValue({
        webFlowDataId: webFlowId,
        webFlowData: webFlowData,
        businessFlowId: '',
        description: this.integrationData?.description,
        flowActivityModelId: webFlowData?.webFlowActivityNameDataList[0]?.flowActivityModelId,
        attachedBusinessIntegration: [],
        attachedBusinessIntegrationId: this.itemId
      });
      this.selectedCard(webFlowData?.webFlowActivityNameDataList[0], 0);
      this.appIntegrationDataService.storeAttachedBusinessIntegration(this.businessIntegration);
      this.disabledAllFields();
    }
  }

  /*============ Disable All fields of form ===============*/
  disabledAllFields() {
    this.businessFlowForm.get("scriptDataId")?.disable();
    this.checkboxes.controls.forEach(control => {
      control.get('checked')?.disable();
    });
    this.businessFlowForm.updateValueAndValidity();
    this.isBusinessFormDisable = false;
  }
  /*============ End of Disable All fields of form ===============*/

  /*============ Enable All fields of form ===============*/

  enabledAllFields() {
    this.businessFlowForm.get("attachedBusinessIntegrationId")?.enable();
    this.businessFlowForm.get("scriptDataId")?.enable();
    this.checkboxes.controls.forEach(control => {
      control.get('checked')?.enable();
    });
    this.businessFlowForm.updateValueAndValidity();
    this.isBusinessFormDisable = true;

  }
  /*============ End of Enable All fields of form ===============*/

  /*============ Get Unique Business Integration  ===============*/
  getUniqueBusinessIntegration(businessIntegration) {
    const uniqueBusinessArray = businessIntegration.filter((obj, index, self) =>
      index === self.findIndex(o => o.attachedBusinessIntegration?.id === obj.attachedBusinessIntegration?.id)
    );
    return uniqueBusinessArray;
  }
  /*============ End Unique Business Integration  ===============*/

  /*============ Get BusinessFlow  ===============*/
  getBusinessFlowByIds(flowActivityModelId) {
    this.businessIntegration = [];
    this.businessFlowById = this.appIntegrationService.getBusinessFlowByIds(flowActivityModelId, this.activeWebFlow).subscribe(res => {
      if (res?.length) {
        //this.businessIntegration = [];
        this.businessIntegration = this.getUniqueBusinessIntegration(res);
        const integartionData = this.appIntegrationDataService.getSelectedBusiFlowIntegration();
        if (this.businessIntegration.length) {
          const exists = this.businessIntegration.some(item => item?.attachedBusinessIntegration?.id === this.itemId);
          if (exists) {
            this.businessFlowForm.patchValue({ 'attachedBusinessIntegrationId': this.itemId });
          } else {
            const data = {
              description: integartionData?.description,
              folderStructure: integartionData?.folderStructure,
              id: this.itemId,
              name: integartionData?.name
            };
            this.businessIntegration.push({
              attachedBusinessIntegration: data
            })
            this.businessFlowForm.patchValue({ 'attachedBusinessIntegration': data });
          }

        }

        this.appIntegrationDataService.storeAttachedBusinessIntegration(this.businessIntegration);
      } else {
        // this.businessIntegration = [];
        const data = {
          description: this.integrationData?.description,
          folderStructure: this.integrationData?.folderStructure,
          id: this.itemId,
          name: this.integrationData?.name
        };
        this.businessIntegration.push({
          attachedBusinessIntegration: data
        })
        this.businessFlowForm.patchValue({ 'attachedBusinessIntegration': data });
        this.appIntegrationDataService.storeAttachedBusinessIntegration(this.businessIntegration);


      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here

      } else {
        // handle server side error here
      }
    });
  }
  /*============ End of Get BusinessFlow  ===============*/

  /*============  Get checkboxes array  ===============*/
  get checkboxes(): FormArray {
    return this.businessFlowForm.get('checkboxes') as FormArray;
  }
  /*============  End of checkboxes array  ===============*/


  /*============  set checkboxes array  ===============*/
  setCheckboxes(disabled: Boolean = false) {
    const checkboxesArray = this.businessFlowForm.get('checkboxes') as FormArray;
    checkboxesArray.clear();
    if (this.ParametersObject && this.ParametersObject.length) {
      this.ParametersObject.forEach(param => {
        const checkboxControl = this.fb.group({
          parameterName: param.parameterName, // Store parameter name
          isDeleted: param?.isDeleted ? param?.isDeleted : false,
          correlationName: this.setCorrelationName(param.parameterName),
          checked: [{ value: this.isParameterChecked(param.parameterName), disabled: this.isGetBusinessLocked }]
        });
        checkboxesArray.push(checkboxControl);
      });

      // Fetch the business flow data
      const businessFlowArr = this.appIntegrationDataService.getBusinessFlowByWebFlowId(this.activeWebFlow);


      if (!disabled) {
        let correlationNames = [];
        if (businessFlowArr.length) {
          correlationNames = businessFlowArr.flatMap(flow =>
            flow.correlationName?.map(correlation => correlation.correlationName) || []
          );
        }

        // Check if 'TaskId' exists in the fetched correlation names
        const hasTaskId = correlationNames.includes('TaskId');
        const hasOtherCorrelation = correlationNames.some(name => name !== 'TaskId'); // Check if there is any other correlation

        // Adjust checkboxes based on the correlation name conditions
        checkboxesArray.controls.forEach(control => {
          const paramName = control.get('parameterName')?.value;

          if (hasOtherCorrelation) {
            // If any other correlation exists, disable TaskId
            if (paramName === 'TaskId') {
              control.get('checked')?.disable();
            } else {
              control.get('checked')?.enable();
            }
          } else if (hasTaskId) {
            // If ONLY TaskId exists, disable all others
            if (paramName !== 'TaskId') {
              control.get('checked')?.disable();
            } else {
              control.get('checked')?.enable();
            }
          } else {
            // If there are no correlations, enable everything
            control.get('checked')?.enable();
          }
        });

      } else {
        this.checkboxes.controls.forEach(control => {
          control.get('checked')?.disable();
        });

      }
    }
  }
  /*============  End of set checkboxes array  ===============*/

  setCorrelationName(parameterName: string) {
    const correlationNameArray = this.businessFlowForm.get('correlationName') as FormArray;

    const control = correlationNameArray.controls.find(control => {
      return control.value.executableParamName === parameterName;
    });
    // If control is found, return the correlationName
    if (control) {
      return control.value.correlationName ? control.value.correlationName : parameterName;
    } else {
      return parameterName;
    }

    // Default return if no match is found
  }


  /*============  Method to check if a parameter is already in the correlationName array  ===============*/
  isParameterChecked(parameterName: string): boolean {
    const correlationNameArray = this.businessFlowForm.get('correlationName') as FormArray;
    return correlationNameArray.controls.some(control =>
      control.value.executableParamName === parameterName
    );
  }
  /*============  End of Method to check if a parameter is already in the correlationName array  ===============*/

  /*===========  Handles checkbox selection and manages correlation name  =======*/
  onCheckboxChange(index: number, event: any, rowData: any) {
    const isChecked = event.target.checked;
    const correlationNameArray = this.businessFlowForm.get('correlationName') as FormArray;

    // Fetch business flow data
    const businessFlowArrData = this.appIntegrationDataService.getBusinessFlowByWebFlowId(this.activeWebFlow);


    // Extract correlation names from API
    let correlationNamesInFlow = businessFlowArrData.flatMap((flow: any) =>
      flow.correlationName?.map((c: any) => c.correlationName) || []
    );

    const isTaskIdSelected = rowData.parameterName === 'TaskId';
    const checkboxControl = this.checkboxes.controls[index];

    if (isChecked) {
      // Add to `correlationNamesInFlow` & correlationNameArray
      correlationNamesInFlow.push(rowData.parameterName);
      correlationNameArray.push(this.fb.group({
        executableParamName: rowData.parameterName,
        correlationName: rowData.parameterName
      }));
      if (isTaskIdSelected) {
        // If TaskId is checked, disable all other checkboxes
        this.checkboxes.controls.forEach((control: any, idx: number) => {
          if (idx !== index) control.disable();
        });
      } else {
        //  If any other checkbox is checked, disable TaskId
        const taskIdControl = this.getTaskIdCheckboxControl();
        if (taskIdControl) {
          taskIdControl.disable();
        }
      }
    } else {
      // Remove only one occurrence of the unchecked item
      const indexToRemoveInArray = correlationNamesInFlow.indexOf(rowData.parameterName);
      if (indexToRemoveInArray !== -1) correlationNamesInFlow.splice(indexToRemoveInArray, 1); // ❗ Remove only the first occurrence

      // Remove from correlationNameArray (form)
      const indexToRemove = correlationNameArray.controls.findIndex(control =>
        control.value.correlationName === rowData.parameterName
      );
      if (indexToRemove !== -1) correlationNameArray.removeAt(indexToRemove);

      // **Verify Data After Unchecking**
      const anyCheckboxChecked = correlationNamesInFlow.length > 0;
      const anyOtherChecked = correlationNamesInFlow.some(name => name !== 'TaskId');

      if (!anyCheckboxChecked) {
        // If no checkboxes are selected, enable all checkboxes including TaskId
        this.checkboxes.controls.forEach((control: any) => control.enable());
      } else if (!anyOtherChecked) {
        // If TaskId is the only one left, re-enable it
        const taskIdControl = this.getTaskIdCheckboxControl();
        if (taskIdControl) {
          taskIdControl.enable();
        }
      }
    }
    this.updateBusinessFlowArray();
  }
  /*===========  End of Handles checkbox selection and manages correlation name  =======*/

  /*=========   Get TaskId checkbox control by parameterName  =======*/
  getTaskIdCheckboxControl() {
    return this.checkboxes.controls.find((control: any) => control.get('parameterName')?.value === 'TaskId');
  }
  /*========= End of Get TaskId checkbox control by parameterName  =======*/

  getIntegrationItemDetails(integrationId: number, checkbox: Boolean = false) {
    this.integrationDetail = this.appIntegrationService.getIntegrationWorkingCopyById(Number(integrationId)).subscribe((res) => {
      if (res) {
       // this.executableList = res?.associatedProcess?.scriptList;
        const clonedScriptList =
          res?.associatedProcess?.scriptList?.map(executable => ({
            ...executable,
            executableRef: executable.executableRef ?? executable.id
          })) || [];
          this.executableList = clonedScriptList;
        // this.executableList.forEach((executable) => {
        //   executable.executableRef = executable?.executableRef ? executable?.executableRef : executable?.id;
        // })
        const webFlowDataId = this.businessFlowForm.get('webFlowDataId').value;
        const flowActivityModelId = this.businessFlowForm.get('flowActivityModelId').value;
        if (res?.businessFlowDatas && res?.businessFlowDatas?.length) {
          this.appIntegrationDataService.storebusinessFlowsByWebFlowId(res?.businessFlowDatas);
          const businessArr = this.appIntegrationDataService.getBusinessFlowByFlowModel(webFlowDataId, flowActivityModelId);
          if (businessArr.length) {
            this.setFormData(businessArr[0], !checkbox);
          } else {
            this.resetForm(flowActivityModelId, checkbox);
          }
        } else {
          this.appIntegrationDataService.storebusinessFlowsByWebFlowId(res?.businessFlowDatas);
          this.resetForm(flowActivityModelId, checkbox);
        }

      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    })
  }

  /*============ Change Integration ============*/

  changeIntegartion() {
    const attachedBusinessIntegrationId = this.businessFlowForm.get('attachedBusinessIntegrationId').value;
    const attachedIntegartion = this.appIntegrationDataService.getAttachedBusinessIntegration(attachedBusinessIntegrationId);
    this.businessFlowForm.patchValue({
      attachedBusinessIntegrationId: attachedBusinessIntegrationId,
      attachedBusinessIntegration: attachedIntegartion[0]?.attachedBusinessIntegration,
      description: attachedIntegartion[0]?.attachedBusinessIntegration?.description
    })

    //this.updateBusinessFlowArray();
    this.getIntegrationItemDetails(attachedBusinessIntegrationId);
    //this.executableList = businessFlowArr[0].scriptData;
    if (Number(this.itemId) !== Number(attachedBusinessIntegrationId) || this.selectedActivityModelData == -1) {
      this.selectedActivityModelData = -1;
      this.businessFlowForm.get('scriptDataId').disable();
      this.checkboxes.controls.forEach(control => {
        control.get('checked')?.disable();
      });
    } else {
      this.businessFlowForm.get('scriptDataId').enable();
      this.checkboxes.controls.forEach(control => {
        control.get('checked')?.enable();
      });
    }
  }
  /*============ End Change Integration ============*/

  /*============  Change Executable ============*/
  changeExecutable() {
    let scriptId = this.businessFlowForm.get('scriptDataId')?.value;
    let scriptList = this.executableList.find((item) => Number(item.executableRef) === Number(scriptId));
    if (scriptList) {
      scriptList.id = scriptList.executableRef;
      this.businessFlowForm.patchValue({ scriptData: scriptList });
      this.businessFlowForm.patchValue({ 'scriptPosition': scriptList?.order });
      this.updateBusinessFlowArray();
      this.getParameterData(scriptId);
    }


  }
  /*============  End Change Executable ============*/

  /*============  On click Clear Link ============*/
  onClearClick() {
    const checkboxArray = this.businessFlowForm.get('checkboxes') as FormArray;
    checkboxArray.clear();
    const correlationNameArray = this.businessFlowForm.get('correlationName') as FormArray;
    correlationNameArray.clear();
    this.setCheckboxes();
    this.ParametersObject = [];
    this.businessFlowForm.patchValue({ scriptDataId: '' });
    this.updateBusinessFlowArray();
  }
  /*============  End On click Clear Link ============*/

  /*============  On click Refresh Link ============*/
  onRefreshClick() {
    // Clear previous correlationName array
    const correlationNameArray = this.businessFlowForm.get('correlationName') as FormArray;
    correlationNameArray.clear();
    // Fetch business flow data
    const scriptDataId = this.appIntegrationDataService.getSelectedScriptId();
    //const scriptDataId = this.businessFlowForm.get('scriptDataId')?.value;
    this.businessFlowForm.patchValue({ scriptDataId: scriptDataId });
    if (!scriptDataId) {
      return;
    }
    this.getParameterData(scriptDataId);
    const flowActivityModelId = this.businessFlowForm.get('flowActivityModelId').value;
    const businessFlowArr = this.appIntegrationDataService.getIntByFlowActivityModelId(this.itemId, flowActivityModelId);
    // Ensure data exists before accessing properties
    if (businessFlowArr && businessFlowArr?.correlationName?.length) {
      businessFlowArr.correlationName.forEach((corr: any) => {
        correlationNameArray.push(this.fb.group({
          executableParamName: corr?.executableParamName || '',
          correlationName: corr?.correlationName || ''
        }));
      });

      // Update form value
      this.businessFlowForm.patchValue({
        correlationName: businessFlowArr.correlationName
      });

    } else {
    }
    this.updateBusinessFlowArray();
    // Refresh checkboxes based on updated correlation data
    this.setCheckboxes();
  }

  /*============  End On click Refresh Link ============*/

  sortByParameterNameAsc(data: any[]): any[] {
    // return data.sort((a, b) => a.parameterName.localeCompare(b.parameterName));

    const taskIdItem = data.filter(item => item.parameterName === "TaskId");
    const globalItems = data.filter(item => item.parameterName.startsWith("global."));
    const otherItems = data.filter(item => item.parameterName !== "TaskId" && !item.parameterName.startsWith("global."));

    // Sort the other items
    otherItems.sort((a, b) => a.parameterName.localeCompare(b.parameterName));
    const sortedGlobalItems = this.sortGlobalByParameterNameAsc(globalItems)

    // Merge them back together: TaskId first, then sorted other items, then global items at the end
    const sortedData = [...taskIdItem, ...otherItems, ...sortedGlobalItems];
    return sortedData;

  }

  sortGlobalByParameterNameAsc(data: any[]): any[] {
    return data.sort((a, b) => {
      // Extract the part after the period for both strings and compare them
      const partA = a.parameterName.split('.')[1] || '';  // Handle case if no period exists
      const partB = b.parameterName.split('.')[1] || '';  // Handle case if no period exists

      return partA.localeCompare(partB);
    });
  }

  /*============  Get Parameter Data ============*/

  // getParameterData(scriptId, disableCheckbox: Boolean = false) {
  //   this.ParametersObject = [];

  //   // Make both API calls in parallel using forkJoin
  //   this.scriptParameterData = forkJoin([
  //     this.appIntegrationService.getScriptParameters(this.workspaceId, scriptId),  // First API call
  //     this.appIntegrationService.getGlobalParameters(this.workspaceId)            // Second API call
  //   ]).subscribe(
  //     ([scriptRes, globalRes]) => {

  //       // Combine scriptRes and globalRes data here (if necessary)
  //       const combinedRes = [...scriptRes, ...globalRes];
  //       // Build the ParametersObject
  //       this.ParametersObject = [
  //         { parameterName: 'TaskId', id: '1', checked: false },
  //         ...combinedRes.map((param: any) => ({
  //           ...param,
  //           checked: false
  //         }))
  //       ];

  //       const correlationNameObj = this.businessFlowForm.get('correlationName').value;
  //       if (correlationNameObj != null) {
  //         correlationNameObj.forEach(correlation => {
  //           const exists = this.ParametersObject.some(param => param.parameterName === correlation.executableParamName);
  //           if (!exists) {
  //             this.ParametersObject.push({
  //               parameterName: correlation.executableParamName,
  //               checked: false,
  //               isDeleted: true
  //             });
  //           }
  //         });

  //       }

  //       this.ParametersObject = this.sortByParameterNameAsc(this.ParametersObject);
  //       // Set form values with businessFlowData
  //       const checkboxArray = this.businessFlowForm.get('checkboxes') as FormArray;
  //       checkboxArray.clear();

  //       const correlationName = this.businessFlowForm.get('correlationName') as FormArray;
  //       const selectedParameterNames = correlationName?.controls.map(
  //         (corr: any) => corr.value.correlationName
  //       ) || [];

  //       // Handle correlationName checkboxes
  //       if (selectedParameterNames.length) {
  //         this.ParametersObject.forEach(param => {
  //           const isChecked = selectedParameterNames.some(
  //             (name: string) => name === param.parameterName
  //           );
  //           const checkboxControl = this.fb.group({
  //             parameterName: param.parameterName,
  //             checked: isChecked,
  //             isDeleted: param?.isDeleted ? param?.isDeleted : false
  //           });
  //           checkboxArray.push(checkboxControl);
  //         });
  //       } else {
  //         this.ParametersObject.forEach(param => {
  //           const checkboxControl = this.fb.group({
  //             parameterName: param.parameterName,
  //             checked: false,  // All unchecked by default
  //             isDeleted: param?.isDeleted ? param?.isDeleted : false
  //           });

  //           checkboxArray.push(checkboxControl);
  //         });
  //       }

  //       // Finally set checkboxes disabled if needed
  //       this.setCheckboxes(disableCheckbox);
  //     },
  //     (err: HttpErrorResponse) => {
  //       if (err.error instanceof Error) {
  //         // Handle client-side error
  //       } else {
  //         // Handle server-side error
  //       }
  //     }
  //   );
  // }

  getParameterData(scriptId, disableCheckbox: Boolean = false) {
    this.ParametersObject = [];

    // Call first API
    this.appIntegrationService.getScriptParameters(this.workspaceId, scriptId).subscribe(
      scriptRes => {
        // After first API response, call second API
        this.appIntegrationService.getGlobalParameters(this.workspaceId).subscribe(
          globalRes => {
            // Both responses received, now do your combined logic
            const combinedRes = [...scriptRes, ...globalRes];

            this.ParametersObject = [
              { parameterName: 'TaskId', id: '1', checked: false },
              ...combinedRes.map((param: any) => ({
                ...param,
                checked: false
              }))
            ];

            const correlationNameObj = this.businessFlowForm.get('correlationName').value;
            if (correlationNameObj != null) {
              correlationNameObj.forEach(correlation => {
                const exists = this.ParametersObject.some(param => param.parameterName === correlation.executableParamName);
                if (!exists) {
                  this.ParametersObject.push({
                    parameterName: correlation.executableParamName,
                    checked: false,
                    isDeleted: true
                  });
                }
              });
            }

            this.ParametersObject = this.sortByParameterNameAsc(this.ParametersObject);

            const checkboxArray = this.businessFlowForm.get('checkboxes') as FormArray;
            checkboxArray.clear();

            const correlationName = this.businessFlowForm.get('correlationName') as FormArray;
            const selectedParameterNames = correlationName?.controls.map(
              (corr: any) => corr.value.correlationName
            ) || [];

            if (selectedParameterNames.length) {
              this.ParametersObject.forEach(param => {
                const isChecked = selectedParameterNames.some(
                  (name: string) => name === param.parameterName
                );
                const checkboxControl = this.fb.group({
                  parameterName: param.parameterName,
                  checked: isChecked,
                  isDeleted: param?.isDeleted ? param?.isDeleted : false
                });
                checkboxArray.push(checkboxControl);
              });
            } else {
              this.ParametersObject.forEach(param => {
                const checkboxControl = this.fb.group({
                  parameterName: param.parameterName,
                  checked: false,
                  isDeleted: param?.isDeleted ? param?.isDeleted : false
                });
                checkboxArray.push(checkboxControl);
              });
            }

            this.setCheckboxes(disableCheckbox);
          },
          (err: HttpErrorResponse) => {
            console.error('Error fetching global parameters:', err);
          }
        );
      },
      (err: HttpErrorResponse) => {
        console.error('Error fetching script parameters:', err);
      }
    );
  }


  /*============  Update BusinessFlow Array ============*/

  updateBusinessFlowArray() {
    if (this.isBusinessFormDisable) {
      const updatedBusinessFlow: BusinessFlowDto = {
        webFlowData: this.businessFlowForm.value.webFlowData,
        scriptData: this.businessFlowForm.value?.scriptDataId ? this.businessFlowForm.value.scriptData : null,
        scriptPosition: this.businessFlowForm.value.scriptPosition,
        flowActivityModelId: this.businessFlowForm.value.flowActivityModelId,
        correlationName: this.businessFlowForm.value.correlationName?.length ? this.businessFlowForm.value.correlationName.map((control: any) => ({
          executableParamName: control.executableParamName,
          correlationName: control.correlationName
        })) : null,
        attachedBusinessIntegration: this.businessFlowForm.value?.scriptDataId ? this.businessFlowForm.value.attachedBusinessIntegration : null,
        businessFlowId: this.businessFlowForm.value.businessFlowId
      };
      // return false;
      this.appIntegrationDataService.updateBusinessFlows(this.businessFlowForm.value.webFlowDataId, updatedBusinessFlow);
    }
  }

  resetBusinessFlowData() {
    // this.businessFlowForm.patchValue({flowActivityModelId: ''});
    this.selectedActivityModelData = -1;
    this.disabledAllFields();

    this.getIntegrationDetailsSub = this.appIntegrationService.getIntegrationWorkingCopyById(Number(this.itemId)).subscribe((res) => {
      if (res) {
        this.appIntegrationDataService.storebusinessFlowsByWebFlowId(res?.businessFlowDatas);
        if (!res?.businessFlowDatas?.length) {
          this.resetForm(this.businessFlowForm.get('flowActivityModelId').value);
        } else {
          this.setFormData(res?.businessFlowDatas[0]);
        }
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });


  }
  /*============  END Update BusinessFlow Array ============*/

  edit(index: number) {
    // Activate edit mode and store the current value
    this.editMode[index] = true;
    this.editValue[index] = this.checkboxes.controls[index].get('correlationName').value;
  }

  // Save method is triggered when user clicks outside (blur) or presses Enter
  save(index: number) {
    // Save the edited value back to the form
    this.checkboxes.controls[index].get('correlationName').setValue(this.checkboxes.controls[index].get('correlationName').value);

    // if (this.checkboxes.value)
    const correlationNameArray = this.businessFlowForm.get('correlationName') as FormArray;
    correlationNameArray.clear();
    this.checkboxes.value.forEach((item, index) => {
      if (item.checked) {
        correlationNameArray.push(this.fb.group({
          executableParamName: item?.parameterName,
          correlationName: item?.correlationName
        }));
      }
    });

    this.updateBusinessFlowArray();
    // Disable edit mode
    this.editMode[index] = false;
  }

  ngOnDestroy(): void {
    this.appIntegrationDataService.clearBusinessFlow();
    this.appIntegrationDataService.clearAllWebFlows();
    this.webFlowByIdSub.unsubscribe();
    this.businessFlowById.unsubscribe();
    this.allWebFlow.unsubscribe();
    this.integrationDetail.unsubscribe();
    this.scriptParameterData.unsubscribe();
    this.getIntegrationDetailsSub.unsubscribe();
  }

}
