import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { Subscription } from "rxjs";
import { AppIntegrationService } from "../../app-integration.service";
import { HttpErrorResponse } from "@angular/common/http";
import {
  LogMaintenance,
  QueueGroup,
  ScriptEngineGroup,
  TreeItemDto,
} from "../../appintegration";
import { AppIntegrationDataService } from "../../app-integration-data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Constants } from "src/app/shared/components/constants";
import { take } from "rxjs/operators";
import { MessageService } from "primeng/api";
import { CheckWhitespace } from "src/app/shared/validation/check-whitespace.validator";

@Component({
  selector: "app-properties-general",
  templateUrl: "./properties-general.component.html",
  styleUrls: ["./properties-general.component.scss"],
})
export class PropertiesGeneralComponent
  implements OnChanges, OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number = null;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isGetPITLock: boolean = false;
  @Input() isCancelPITLock: boolean = false;
  @Input() belongsToFolderId: number = null;
  @Input() isProcessCreateFromIntegration: boolean = false;
  @Input() isProcessUpdateFromIntegration: boolean = false;
  @Input() isProperties: boolean = false;
  generalInfoForm: UntypedFormGroup;
  logMaintenanceConfig: Array<LogMaintenance> = [];
  alertProcesses: Array<any> = [];
  scriptEngineGroups: Array<ScriptEngineGroup> = [];
  queueGroups: Array<QueueGroup> = [];
  itemPropertiesDetails: any = null;
  isAlertProcessRequired: boolean = false;
  currentUser: any;
  isPITItemNameExist: boolean = false;
  isShowAdvanceSetting: boolean = false;
  logLevels = [
    { id: "Info", name: "Info" },
    { id: "Debug", name: "Debug" },
    { id: "Error", name: "Error" },
    { id: "Warning", name: "Warning" },
  ];

  validationMessages = {
    name: {
      required: "Name is required",
      maxlength: "Maximum 128 characters are allowed",
      hasDuplicate: "Duplicate item name",
      hasWhitespace: "Whitespace not allowed"
    },
    version: {
      required: "Version is required",
    },
    description: {
      required: "Description is required",
      maxlength: "Maximum 2000 characters are allowed",
    },
    logMaintenance: {
      required: "Log maintenance is required",
    },
    logLevel: {
      required: "Log level is required",
    },
    alertProcess: {
      required: "Alert process is required",
    },
    scriptEngineGroup: {
      required: "Script engine group is required",
    },
    queue: {
      required: "Queue is required",
    },
    disableItem: {
      required: "Disable item is required",
    },
    enableAlert: {
      required: "Enable alert is required",
    },
  };

  formErrors = {
    name: "",
    version: "",
    description: "",
    logMaintenance: "",
    logLevel: "",
    alertProcess: "",
    scriptEngineGroup: "",
    queue: "",
    disableItem: "",
    enableAlert: "",
  };

  getLogMaintenanceConfigSub = Subscription.EMPTY;
  getAlertProcessesSub = Subscription.EMPTY;
  getSEGroupsSub = Subscription.EMPTY;
  getQueueGroupsSub = Subscription.EMPTY;
  checkDuplicatePITItemSub = Subscription.EMPTY;

  constructor(
    public router: Router,
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnChanges(changes: SimpleChanges): void { }

  ngOnInit(): void {
    this.createForm();
    if (this.router?.url.includes("properties")) {
      if (this.isProcessCreateFromIntegration) {
        this.generalInfoForm.enable();
        this.generalInfoForm.get("version").disable();
      } else {
        this.generalInfoForm.disable();
      }
    } else {
      this.generalInfoForm.enable();
      this.generalInfoForm.get("version").disable();
    }
    setTimeout(() => {
      const inputElement = document.getElementById('intname') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  }

  /*============ Form Creation ============*/
  createForm() {
    this.generalInfoForm = this.fb.group({
      name: [
        { value: "", disabled: false },
        {
          validators: [
            Validators.required,
            Validators.maxLength(128),
            CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
          ],
        },
      ],
      version: [
        { value: "", disabled: true },
        {
          validators: [],
        },
      ],
      description: [
        { value: "", disabled: false },
        {
          validators: [Validators.maxLength(2000)],
        },
      ],
      logMaintenance: [
        { value: "", disabled: false },
        {
          validators: [Validators.required],
        },
      ],
      logLevel: [
        { value: "Info", disabled: false },
        {
          validators: [Validators.required],
        },
      ],
      alertProcess: [
        { value: "", disabled: false },
        {
          validators: [],
        },
      ],
      scriptEngineGroup: [
        { value: "", disabled: false },
        {
          validators: [],
        },
      ],
      queue: [
        { value: "", disabled: false },
        {
          validators: [],
        },
      ],
      isDisableItem: [
        { value: false, disabled: false },
        {
          validators: [],
        },
      ],
      isEnableActivationLogsOnly: [
        { value: false, disabled: false },
        {
          validators: [],
        },
      ],
      isEnableAlert: [
        { value: false, disabled: false },
        {
          validators: [],
        },
      ],
      isAlertProcess: [
        { value: false, disabled: false },
        {
          validators: [],
        },
      ],
      isDefaultAlert: [
        { value: false, disabled: true },
        {
          validators: [],
        },
      ],
    });
    if (this.itemType === 'webservice') {
      this.generalInfoForm.get('queue').clearValidators();
      this.generalInfoForm.get('queue').updateValueAndValidity();
      this.generalInfoForm.get('scriptEngineGroup').clearValidators();
      this.generalInfoForm.get('scriptEngineGroup').updateValueAndValidity();
    } else {
      this.generalInfoForm.get('queue').setValidators([Validators.required]);
      this.generalInfoForm.get('queue').updateValueAndValidity();
      this.generalInfoForm.get('scriptEngineGroup').setValidators([Validators.required]);
      this.generalInfoForm.get('scriptEngineGroup').updateValueAndValidity();
    }
    this.generalInfoForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.generalInfoForm);
    });
  }
  /*============ END Form Creation ============*/

  /*============ Set Existing Data In Form ============*/
  setFormValues(formValues: any) {
    if (formValues) {
      this.itemPropertiesDetails = formValues;
      if (formValues?.locked && Number(this.currentUser?.id) === Number(this.itemPropertiesDetails?.lockedUserId)) {
        this.isGetPITLock = true;
        this.generalInfoForm.enable();
        this.generalInfoForm.get("version").disable();
        //this.checkDefaultAlertProcess();
        this.generalInfoForm.get("isDefaultAlert").disable();
      } else {
        this.isGetPITLock = false;
        this.generalInfoForm.disable();
        // this.checkDefaultAlertProcess();
        this.generalInfoForm.get("isDefaultAlert").disable();
      }
      this.generalInfoForm.patchValue({
        name: formValues?.name,
        version: this.isGetPITLock ? 'Working copy' : formValues?.versionNumber,
        description: formValues?.description,
        logMaintenance: formValues?.logMaintenanceId,
        logLevel: formValues?.logLevel ? formValues?.logLevel : 'Info',
        alertProcess: formValues?.alertProcessId ? formValues?.alertProcessId : '',
        scriptEngineGroup: Number(formValues?.scriptEngineGroup),
        queue: formValues?.priority != null ? formValues?.priority : this.queueGroups[0]?.queueId,
        isDisableItem: formValues?.disable,
        isEnableActivationLogsOnly: formValues?.updateTaskList,
        isEnableAlert: formValues?.alertEnabled,
        isAlertProcess: formValues?.alertProcess,
        isDefaultAlert: formValues?.defaultAlert,
      });
      this.onCheckAlertProcess();
      this.checkDisableAlertProcessCheckbox();
    }
  }
  /*============ END Set Existing Data In Form ============*/

  /*============ If Process is Deployed Then User Can't Enabled/Disabled Alert Process Checkbox ============*/
  checkDisableAlertProcessCheckbox() {
    const isAlertProcess = this.generalInfoForm.get("isAlertProcess").value;
    if (this.itemPropertiesDetails?.deployed && isAlertProcess) {
      this.generalInfoForm.get("isAlertProcess").disable();
    }
  }

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    this.isPITItemNameExist = false;
    this.isGetPITLock = isPITLock;
    if (isPITLock) {
      this.generalInfoForm.enable();
      this.generalInfoForm.get("version").disable();
      this.generalInfoForm.get("isDefaultAlert").disable();
      this.getAlertProcesses(this.workspaceId);
      this.onCheckAlertProcess();
      this.checkDisableAlertProcessCheckbox();
    } else {
      this.generalInfoForm.disable();
      this.onCheckAlertProcess();
      this.checkDisableAlertProcessCheckbox();
    }
  }
  /*============ END Get PIT Lock and Enable/Disable Form Feilds ============*/

  /*============ Check PIT Duplicate Item Name ==============*/
  // validatePITItemName() {
  //   this.isPITItemNameExist = false;
  //   if (this.generalInfoForm.get("name").value.trim()) {
  //     const treeItemDto: TreeItemDto = {
  //       belongsToFolder: this.belongsToFolderId,
  //       name: this.generalInfoForm.get("name").value.trim(),
  //       workspaceId: this.workspaceId,
  //       type: this.itemType,
  //     };
  //     if (this.itemPropertiesDetails?.name !== this.generalInfoForm.get('name').value.trim()) {
  //       this.checkDuplicatePITItemSub = this.appIntegrationService.validateItemName(treeItemDto).subscribe((res) => {
  //         this.isPITItemNameExist = res;
  //       }, (err: HttpErrorResponse) => {
  //         if (err.error instanceof Error) {
  //           // handle client side error here
  //         } else {
  //           // handle server side error here
  //         }
  //       });
  //     }
  //   }
  // }

  setItemName(name: string) {
    this.itemPropertiesDetails.name = name;
  }

  validatePITItemName(): Promise<boolean> {
    this.isPITItemNameExist = false;
    const nameValue = this.generalInfoForm.get("name").value.trim();
    if (!nameValue || this.itemPropertiesDetails?.name === nameValue) {
      return Promise.resolve(false);
    }

    const treeItemDto: TreeItemDto = {
      belongsToFolder: this.belongsToFolderId,
      name: nameValue,
      workspaceId: this.workspaceId,
      type: this.itemType,
    };

    return new Promise((resolve) => {
      this.checkDuplicatePITItemSub = this.appIntegrationService.validateItemName(treeItemDto).subscribe((res) => {
        this.isPITItemNameExist = res;
        resolve(res);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          resolve(false);
        } else {
          // handle server side error here
          resolve(false);
        }
      });
    });
  }


  /*============ END Check PIT Duplicate Item Name ==============*/

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.generalInfoForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = "";
        if (
          abstractControl &&
          !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty)
        ) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + " ";
            }
          }
        }
      }
    });
  }
  /*============ END Check Form Validation and Display Messages ============*/

  /*============ Get All Log Maintenance Configuration ============*/
  // getAllLogMaintenanceConfig() {
  //   // const logMaintenanceConfig = this.appIntegrationDataService.getLogMaintenanceConfig();
  //   // if (logMaintenanceConfig?.length) {
  //   //   this.logMaintenanceConfig = logMaintenanceConfig;
  //   //   this.onChangeLogMaintenance(Number(this.logMaintenanceConfig[0]?.id));
  //   // } else {
  //   // }
  //   this.getLogMaintenanceConfigSub = this.appIntegrationService.getAllLogMaintenancesConfig().subscribe((res) => {
  //     this.logMaintenanceConfig = res;
  //     this.onChangeLogMaintenance(Number(this.logMaintenanceConfig[0]?.id));
  //     this.appIntegrationDataService.storeLogMaintenanceConfig(
  //       this.logMaintenanceConfig
  //     );
  //     if (this.itemPropertiesDetails) {
  //       this.onChangeLogMaintenance(
  //         Number(this.itemPropertiesDetails?.logMaintenanceId)
  //       );
  //     }
  //   }, (err: HttpErrorResponse) => {
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }

  /*============ Get All Log Maintenance Configuration ============*/
  getAllLogMaintenanceConfig() {
    // Check cache first
    const cachedLogMaintenanceConfig = this.appIntegrationDataService.getLogMaintenanceConfig();
    if (cachedLogMaintenanceConfig?.length) {
      this.logMaintenanceConfig = cachedLogMaintenanceConfig;
      this.onChangeLogMaintenance(Number(this.logMaintenanceConfig[0]?.id));
      if (this.itemPropertiesDetails) {
        this.onChangeLogMaintenance(
          Number(this.itemPropertiesDetails?.logMaintenanceId)
        );
      }
      return;
    }

    // Only call API if cache is empty
    this.getLogMaintenanceConfigSub = this.appIntegrationService.getAllLogMaintenancesConfig().subscribe((res) => {
      this.logMaintenanceConfig = res;
      this.onChangeLogMaintenance(Number(this.logMaintenanceConfig[0]?.id));
      this.appIntegrationDataService.storeLogMaintenanceConfig(
        this.logMaintenanceConfig
      );
      if (this.itemPropertiesDetails) {
        this.onChangeLogMaintenance(
          Number(this.itemPropertiesDetails?.logMaintenanceId)
        );
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Get All Log Maintenance Configuration ============*/

  onChangeLogMaintenance(selectedLogId: number) {
    if (this.logMaintenanceConfig?.length) {
      const logConfig = this.logMaintenanceConfig.find(
        (x) => Number(x?.id) === Number(selectedLogId)
      );
      if (logConfig) {
        this.generalInfoForm.patchValue({
          logMaintenance: logConfig?.id,
        });
      }
    }
  }
  /*============ END Get All Log Maintenance Configuration ============*/

  /*============ On Select Log Level ============*/
  onChangeLogLevel(selectedLogLevelId: string) {
    if (this.logLevels?.length) {
      const logLevel = this.logLevels.find((x) => x.id === selectedLogLevelId);
      if (logLevel) {
        this.generalInfoForm.patchValue({
          logLevel: logLevel?.id,
        });
      }
    }
  }
  /*============ End On Select Log Level ============*/

  /*============ Get Active Alert Processes ============*/
  /*============ Get Active Alert Processes ============*/
  getAlertProcesses(workspaceId: number) {
    // Check cache first
    const cachedAlertProcesses = this.appIntegrationDataService.getAlertProcesses();
    if (cachedAlertProcesses?.length) {
      let alertProcessesArray = [];
      if (this.router?.url.includes("properties")) {
        alertProcessesArray = cachedAlertProcesses.filter(
          (x) => Number(x.id) !== Number(this.itemId)
        );
      }
      this.alertProcesses = alertProcessesArray?.length ? alertProcessesArray : cachedAlertProcesses;
      this.checkDefaultAlertProcess();
      return;
    }

    // Only call API if cache is empty
    this.getAlertProcessesSub = this.appIntegrationService.getActiveAlertProcesses(workspaceId).subscribe((res) => {
      let alertProcessesArray = [];
      if (this.router?.url.includes("properties")) {
        alertProcessesArray = res.filter(
          (x) => Number(x.id) !== Number(this.itemId)
        );
      }
      this.alertProcesses = alertProcessesArray?.length ? alertProcessesArray : res;
      this.appIntegrationDataService.storeAlertProcesses(this.alertProcesses);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============ END Get Active Alert Processes ============*/
  onChangeAlertProcess(selectedProcessId: number) {
    this.appIntegrationService.getDeployedProcessById(selectedProcessId).subscribe((res) => {
      if (!res.deployed) {
        this.messageService.add({
          key: "appIntInfoKey",
          severity: "success",
          summary: "",
          detail: `The selected alert process is undeployed.`,
        });
      }
    });
    if (this.alertProcesses?.length) {
      const alertProcess = this.alertProcesses.find(
        (x) => Number(x.id) === Number(selectedProcessId)
      );
      if (alertProcess) {
        this.generalInfoForm.patchValue({
          alertProcess: alertProcess?.id,
        });
      }
    }
  }

  checkDefaultAlertProcess() {
    const isDefaultAlertProcess = this.alertProcesses?.length
      ? this.alertProcesses.some((item) => item?.defaultAlert)
      : false;
    if (isDefaultAlertProcess || this.itemPropertiesDetails?.defaultAlert) {
      this.generalInfoForm.get("isDefaultAlert").disable();
    }
    else {
      if (this.isGetPITLock) {
        this.generalInfoForm.get('isDefaultAlert').enable();
      } else {
        this.generalInfoForm.get("isDefaultAlert").disable();
      }

    }
  }
  /*============ END Get Active Alert Processes ============*/

  /*============ Get SE Groups ============*/
  getSEGroups() {
    // Check cache first
    const cachedSEGroups = this.appIntegrationDataService.getSEGroups();
    if (cachedSEGroups?.length) {
      this.scriptEngineGroups = cachedSEGroups;
      this.onChangeSEGroup(Number(this.scriptEngineGroups[0]?.id));
      if (this.itemPropertiesDetails) {
        this.onChangeSEGroup(
          Number(this.itemPropertiesDetails?.scriptEngineGroup)
        );
      }
      return;
    }

    // Only call API if cache is empty
    this.getSEGroupsSub = this.appIntegrationService.getSEGroups().subscribe((res) => {
      this.scriptEngineGroups = res;
      this.onChangeSEGroup(Number(this.scriptEngineGroups[0]?.id));
      this.appIntegrationDataService.storeSEGroups(this.scriptEngineGroups);
      if (this.itemPropertiesDetails) {
        this.onChangeSEGroup(
          Number(this.itemPropertiesDetails?.scriptEngineGroup)
        );
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onChangeSEGroup(selectedGroupId: number) {
    if (this.scriptEngineGroups?.length) {
      const scriptEngineGroup = this.scriptEngineGroups.find(
        (x) => Number(x?.id) === Number(selectedGroupId)
      );
      if (scriptEngineGroup) {
        this.generalInfoForm.patchValue({
          scriptEngineGroup: scriptEngineGroup?.id,
        });
      }
    }
  }
  /*============ END Get SE Groups ============*/

  /*============ Get Queue Groups ============*/
  getQueueGroups() {
    // Check cache first
    const cachedQueueGroups = this.appIntegrationDataService.getQueueGroups();
    if (cachedQueueGroups?.length) {
      this.setQueueGroupsList(cachedQueueGroups);
      return;
    }

    // Only call API if cache is empty
    this.getQueueGroupsSub = this.appIntegrationService.getQueueGroups().subscribe((res) => {
      this.appIntegrationDataService.storeQueueGroup(res);
      this.setQueueGroupsList(res);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onChangeQueue(selectedQueueId: number) {
    if (this.queueGroups?.length) {
      const queueGroup = this.queueGroups.find(
        (x) => Number(x?.queueId) === Number(selectedQueueId)
      );
      if (queueGroup) {
        this.generalInfoForm.patchValue({
          queue: queueGroup?.queueId,
        });
      }
    }
  }

  onCheckEnableAlert() {
    const isAlertEnabled = this.generalInfoForm.get("isEnableAlert").value;
    const isDefaultAlertProcess = this.alertProcesses?.length ? this.alertProcesses.some((item) => item?.defaultAlert) : false;
    if (isAlertEnabled) {
      if (isDefaultAlertProcess) {
        this.isAlertProcessRequired = false;
        this.generalInfoForm.get("alertProcess").clearValidators();
      } else {
        this.isAlertProcessRequired = true;
        this.generalInfoForm.get("alertProcess").setValidators([Validators.required]);
      }
    } else {
      this.isAlertProcessRequired = false;
      this.generalInfoForm.get("alertProcess").clearValidators();
    }
    this.generalInfoForm.get("alertProcess").updateValueAndValidity();
  }

  onCheckAlertProcess() {
    const isDefaultAlertProcess = this.alertProcesses?.length
      ? this.alertProcesses.some((item) => item?.defaultAlert)
      : false;
    const isAlertProcess = this.generalInfoForm.get("isAlertProcess").value;
    if (isDefaultAlertProcess || this.itemPropertiesDetails?.defaultAlert) {
      this.generalInfoForm.get("isDefaultAlert").disable();

    } else {
      if (isAlertProcess && (this.isProperties ? this.isGetPITLock : true)) {
        this.generalInfoForm.get("isDefaultAlert").enable();
      } else {
        this.generalInfoForm.get("isDefaultAlert").disable();
      }
    }
    this.appIntegrationService.sharedAlertProcessFlag(isAlertProcess);
    const queueGroups = this.appIntegrationDataService.getQueueGroups();
    const queueGroupsItems = [];
    if (this.itemType === "process") {
      if (isAlertProcess) {
        if (queueGroups?.length) {
          queueGroups.forEach((p) => {
            if (!p?.triggerQueue && p?.alert) {
              queueGroupsItems.push(p);
            }
          });
        }
      } else {
        queueGroups.forEach((p) => {
          if (!p?.triggerQueue && !p?.alert) {
            queueGroupsItems.push(p);
          }
        });
      }
      this.queueGroups = queueGroupsItems;
      this.onChangeQueue(Number(this.queueGroups[0]?.queueId));
      if (this.itemPropertiesDetails) {
        this.onChangeQueue(Number(this.itemPropertiesDetails?.priority));
      }
    }
  }

  setQueueGroupsList(queueGroups: Array<QueueGroup>) {
    if (queueGroups?.length) {
      const queueGroupsItems = [];
      if (this.itemType === "trigger") {
        queueGroups.forEach((t) => {
          if (t?.triggerQueue) {
            queueGroupsItems.push(t);
          }
        });
      } else if (this.itemType === "process") {
        queueGroups.forEach((p) => {
          if (!p?.triggerQueue && !p?.alert) {
            queueGroupsItems.push(p);
          }
        });
      } else {
        queueGroups.forEach((x) => {
          if (!x?.triggerQueue && !x?.alert) {
            queueGroupsItems.push(x);
          }
        });
      }
      this.queueGroups = queueGroupsItems;
      this.onChangeQueue(Number(this.queueGroups[0]?.queueId));
      if (this.itemPropertiesDetails) {
        this.onChangeQueue(Number(this.itemPropertiesDetails?.priority));
      }
    }
  }
  /*============ END Get Queue Groups ============*/

  /*=========== Reset Form ===========*/
  resetGenralInfoForm() {
    this.generalInfoForm.reset({
      alertProcess: "",
    });
    this.getAllLogMaintenanceConfig();
    this.onChangeLogLevel("Info");
    this.getAlertProcesses(this.workspaceId);
    this.getSEGroups();
    this.getQueueGroups();
  }
  /*=========== END Reset Form ===========*/

  /*=========== Validation for Alert Process if Alert Process Check Box is Checked ===========*/
  validateAlertProcess() {
    if (this.itemType === "Process") {
      const formValues = this.generalInfoForm?.value;
    }
  }
  /*=========== END Validation for Alert Process if Alert Process Check Box is Checked ===========*/

  /*=========== Store General Form Data Locally ===========*/
  storeFormData() {
    if (this.itemType === 'Integration') {
      const generalInfo = this.generalInfoForm.getRawValue();
      generalInfo.name.trim();
      this.appIntegrationDataService.storePITGeneralFormData(generalInfo);
    }
  }

  /*=========== Validation for Next Step ===========*/
  async validateStepOne() {
    const isExistPITItemName = await this.validatePITItemName();
    if (isExistPITItemName) {
       const displayItemType = this.itemType
      ? this.itemType.charAt(0).toUpperCase() + this.itemType.slice(1)
      : "";
      if (isExistPITItemName) {
        this.messageService.add({
          key: 'appIntErrorKey',
          severity: 'error',
          summary: '',
          detail: `${displayItemType} name already exist.`,
        });
      }
      return false;
    }
    this.generalInfoForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.generalInfoForm?.valid) {
      if (this.isPITItemNameExist) {
        return false;
      } else {
        return true;
      }
    } else {
      const blankFieldNames = Object.keys(this.generalInfoForm.controls).filter(
        (fieldName) => this.generalInfoForm.get(fieldName).hasError("required")
      );
      this.messageService.add({
        key: "appIntInfoKey",
        severity: "success",
        summary: "",
        detail: `You have left blank mandatory input field(s): ${blankFieldNames}`,
      });
      return false;
    }
  }
  /*=========== END Validation for Next Step ===========*/

  // ...existing code...

  async validateStepOneWithError() {
    const errors: string[] = [];

    const isExistPITItemName = await this.validatePITItemName();

    this.generalInfoForm.markAllAsTouched();
    this.logValidationErrors();

    if (isExistPITItemName) {
      const displayItemType = this.itemType
        ? this.itemType.charAt(0).toUpperCase() + this.itemType.slice(1)
        : "";
      errors.push(`${displayItemType} name already exist.`);
    }

    const blankFieldNames = Object.keys(this.generalInfoForm.controls).filter(
      (fieldName) => this.generalInfoForm.get(fieldName)?.hasError("required")
    );

    if (blankFieldNames.length) {
      errors.push(
        `You have left blank mandatory input field(s): ${blankFieldNames.join(", ")}`
      );
    }

    if (errors.length) {
      return { errors: errors, isValid: false }; // return error list after push
    }

    return { errors: [], isValid: true }; // no error
  }

  // ...existing code...

  /*=========== Get General Information ===========*/
  getGenernalInfo() {
    this.generalInfoForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.generalInfoForm?.valid) {
      const generalInfo = this.generalInfoForm.getRawValue();
      generalInfo.name.trim();
      if (this.alertProcesses?.length) {
        const selectedAlertProcess = this.alertProcesses.find(
          (x) => Number(x?.id) === Number(generalInfo?.alertProcess)
        );
        generalInfo.alertProcessName = selectedAlertProcess?.name
          ? selectedAlertProcess?.name
          : "";
      }
      return generalInfo;
    } else {
      return false;
    }
  }
  /*=========== END Get General Information ===========*/

  onToggle() {
    this.isShowAdvanceSetting = !this.isShowAdvanceSetting;
  }

  ngOnDestroy(): void {
    this.getLogMaintenanceConfigSub.unsubscribe();
    this.getAlertProcessesSub.unsubscribe();
    this.getSEGroupsSub.unsubscribe();
    this.getQueueGroupsSub.unsubscribe();
  }
}
