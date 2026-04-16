import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppIntegrationService } from '../../app-integration.service';
import { AppIntegrationDataService } from '../../app-integration-data.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { MessageService, TreeNode } from 'primeng/api';
import { DeployUndeployItemsDto, LogMaintenance, QueueGroup, ScriptDto, ScriptEngineGroup, ManualAutoDeployDto } from '../../appintegration';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Constants } from 'src/app/shared/components/constants';
import { AppIntManualAutoDeployComponent } from '../../app-int-manual-auto-deploy/app-int-manual-auto-deploy.component';

import { take } from 'rxjs/operators';

@Component({
  selector: 'app-properties-version-info',
  templateUrl: './properties-version-info.component.html',
  styleUrls: ['./properties-version-info.component.scss']
})
export class PropertiesVersionInfoComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number = null;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isProperties: boolean = false;
  @Output() isVersionDeployedOrRestore = new EventEmitter<any>();
  @Output() isVersionHistoryDetailsShowed = new EventEmitter<boolean>();
  activeIndex = 0;
  versionHistory: any = null;;
  isShowVersionHistory: boolean = false;
  currentUser: any;
  propertiesDetails: any = null;
  generalInfoForm: UntypedFormGroup;
  processForm: UntypedFormGroup;
  parametersForm: UntypedFormGroup;
  logMaintenanceConfig: Array<LogMaintenance> = [];
  alertProcesses: Array<any> = [];
  scriptEngineGroups: Array<ScriptEngineGroup> = [];
  queueGroups: Array<QueueGroup> = [];
  selectedExecutables: Array<any> = [];
  connectedProcess: Array<any> = [];
  identifiers: Array<any> = [];
  schedulers: Array<any> = [];
  businessFlowDatas: Array<any> = [];
  netUsersMapping: Array<ScriptDto> = [];
  paramsDescription: string = '';
  triggerDetails: any = null;
  identifiersMethod: Array<any> = [];
  connectedIntToIdentifiers: TreeNode[];
  selectedIntIdentifiers: Array<any> = [];
  isActivatorEnable: boolean = false;
  isActivator: boolean = true;
  processExecutables: any;
  currentVesionProcess: any = null;
  isShowAdvanceSetting: boolean = true;
  logLevels = [
    { id: 'Info', name: 'Info' },
    { id: 'Debug', name: 'Debug' },
    { id: 'Error', name: 'Error' },
    { id: 'Warning', name: 'Warning' }
  ];
  selectedCardIndexes: { [key: string]: number } = {};
  deployedAssociatedProcess: any = null;
  hasDeployedversion = false;

  getVersionHistorySub = Subscription.EMPTY;
  restoreVersionSub = Subscription.EMPTY;
  deployVersionSub = Subscription.EMPTY;
  deleteVersionSub = Subscription.EMPTY;
  getProcessByVersionIdSub = Subscription.EMPTY;
  getIntegrationByVersionIdSub = Subscription.EMPTY;
  getTriggerByVersionIdSub = Subscription.EMPTY;
  getIntegrationByIdentifiersSub = Subscription.EMPTY;
  getScriptDeployStatusSub = Subscription.EMPTY;
  manualAutoDeployItemsSub = Subscription.EMPTY;

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private location: Location,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.createForm();
    this.createProcessForm();
    this.createParamsForm();
  }

  handleChange(index: number) {
    if (index === 0) {

    }
    if (index === 1) {

    }
    if (index === 2) {

    }
  }

  /*============ Form Creation ============*/
  createForm() {
    this.generalInfoForm = this.fb.group({
      name: [{ value: '', disabled: true }, {
        validators: [
          Validators.required,
          Validators.maxLength(128)
        ]
      }],
      version: [{ value: '', disabled: true }, {
        validators: []
      }],
      description: [{ value: '', disabled: true }, {
        validators: [
          Validators.maxLength(2000)
        ]
      }],
      logMaintenance: [{ value: '', disabled: true }, {
        validators: [Validators.required]
      }],
      logLevel: [{ value: 'Info', disabled: true }, {
        validators: [Validators.required]
      }],
      alertProcess: [{ value: '', disabled: true }, {
        validators: []
      }],
      scriptEngineGroup: [{ value: '', disabled: true }, {
        validators: [Validators.required]
      }],
      queue: [{ value: '', disabled: true }, {
        validators: [Validators.required]
      }],
      isDisableItem: [{ value: false, disabled: true }, {
        validators: []
      }],
      isEnableAlert: [{ value: false, disabled: true }, {
        validators: []
      }],
      isAlertProcess: [{ value: false, disabled: true }, {
        validators: []
      }],
      isDefaultAlert: [{ value: false, disabled: true }, {
        validators: []
      }],
      isEnableActivationLogsOnly: [{ value: false, disabled: true }, {
        validators: []
      }],
    });
  }
  /*============ END Form Creation ============*/

  /*============ Process Form Creation ============*/
  createProcessForm() {
    this.processForm = this.fb.group({
      connectedProcess: [{ value: '', disabled: true }, {
        validators: []
      }]
    });
  }

  /*============= Create Parameters Form ============*/
  createParamsForm() {
    this.parametersForm = this.fb.group({
      currentParameter: this.fb.array([
        this.addParameters(false)
      ])
    });
  }
  /*============= END Create Form ============*/

  /*================== Add More Parameters =================*/
  addParameters(additionalParam: boolean): UntypedFormGroup {
    return this.fb.group({
      dataType: [{ value: '', disabled: true }],
      source: [{ value: '', disabled: true }],
      name: [{ value: '', disabled: false }],
      description: [{ value: '', disabled: false }],
      id: [{ value: '', disabled: false }],
      value: [{ value: '', disabled: false }],
      probableValues: [{ value: [], disabled: false }],
      paramType: [{ value: '', disabled: false }],
      securityLevel: [{ value: '', disabled: false }],
      isprotected: [{ value: false, disabled: false }],
      isNewParam: [{ value: additionalParam, disabled: false }],
      displayDataType: [{ value: '', disabled: true }],
    });
  }

  addMoreParameters(): void {
    (<UntypedFormArray>this.parametersForm.get('currentParameter')).push(this.addParameters(true));
  }
  /*================== END Add More Parameters =================*/

  /*============== Show Parameters Descriptions ==============*/
  getParamsDescription(desc: string) {
    this.paramsDescription = desc;
  }

  formatDate(dateStr: string): Date {
    if (dateStr) {
      const d = dateStr.split('.');
      const formattedDate = `${d[1]}/${d[0]}/${d[2]}`;
      return new Date(formattedDate);
    }
  }

  getVersionInfo(versionId: number) {
    this.isShowVersionHistory = !this.isShowVersionHistory;
    this.isVersionHistoryDetailsShowed.emit(this.isShowVersionHistory);
    if (versionId) {
      this.logMaintenanceConfig = this.appIntegrationDataService.getLogMaintenanceConfig();
      this.alertProcesses = this.appIntegrationDataService.getAlertProcesses();
      this.scriptEngineGroups = this.appIntegrationDataService.getSEGroups();
      this.queueGroups = this.appIntegrationDataService.getQueueGroups();
      if (this.itemType === "process") {
        this.getProcessByVersionIdSub = this.appIntegrationService.getProcessByVersionId(versionId).subscribe((res) => {
          if (res) {
            this.setFormValues(res);
            this.selectedExecutables = res?.scriptList;
            this.getScriptParameters(res);
            this.setNetUsers(res);
          }
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
      }
      if (this.itemType === "integration") {
        this.businessFlowDatas = null;
        const processExe = this.appIntegrationDataService.getConnectedProcessToIntByWorkspaceId(this.workspaceId);
        if (processExe?.length) {
          this.connectedProcess = processExe;
        }
        this.getIntegrationByVersionIdSub = this.appIntegrationService.getIntegrationByVersionId(versionId).subscribe((res) => {
          if (res) {
            this.setFormValues(res);
            this.processForm.get('connectedProcess').patchValue(Number(res?.processId));
            this.processExecutables = res?.associatedProcess?.scriptList;
            this.identifiers = res?.identifiers;
            const clonedArray = JSON.parse(JSON.stringify(res?.schedulerList));
            if (clonedArray?.length) {
              clonedArray.forEach((x) => {
                x.startDate = this.formatDate(x.startDate);
                x.endDate = (x?.endDate === '*' || x?.endDate === '') ? x.endDate : this.formatDate(x.endDate);
              });
            }
            this.schedulers = clonedArray;
            this.getScriptParameters(res);
            this.setNetUsers(res);
            this.setbusinessFlowData(res?.businessFlowDatas);
          }
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
      }
      if (this.itemType === "trigger") {
        this.getProcessByVersionIdSub = this.appIntegrationService.getTriggerByVersionId(versionId).subscribe((res) => {
          if (res) {
            this.triggerDetails = res;
            this.setFormValues(res);
            const clonedArray = JSON.parse(JSON.stringify(res?.schedulerList));
            if (clonedArray?.length) {
              clonedArray.forEach((x) => {
                x.startDate = this.formatDate(x.startDate);
                x.endDate = (x?.endDate === '*' || x?.endDate === '') ? x.endDate : this.formatDate(x.endDate);
              });
            }
            this.schedulers = clonedArray;
            this.selectedExecutables = res?.scriptList;
            this.getScriptParameters(res);
            this.setNetUsers(res);
            this.getTriggerActivators(res);
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
  }

  getTriggerActivators(versionDetails: any) {
    this.connectedIntToIdentifiers = [];
    if (versionDetails) {
      this.identifiersMethod = versionDetails?.identifiers;
      const identifiersIds = versionDetails?.identifiers.map(item => item.id);
      this.getIntegrationByIdentifiers(identifiersIds, versionDetails);
    }
    //this.getIntegrationByIdentifiers
  }

  getIntegrationByIdentifiers(identifierIds: Array<string>, propertiesDetails?: any) {
    if (identifierIds?.length) {
      this.getIntegrationByIdentifiersSub = this.appIntegrationService.getIntByIdentifiers(this.workspaceId, identifierIds).subscribe((res) => {
        const identifier = JSON.parse(JSON.stringify(res));
        const identifiersIntArr = Object.keys(identifier).map(label => ({ label, id: '', expandedIcon: '', collapsedIcon: '', selectable: false, expanded: true, children: identifier[label] }));
        if (identifiersIntArr?.length) {
          identifiersIntArr.forEach((x) => {
            x?.children.map((item) => {
              item.label = item?.name;
              item.selectable = false;
            });
            if (this.identifiersMethod?.length) {
              this.identifiersMethod.forEach((item) => {
                if (x?.label === item?.methodName) {
                  x.id = item?.id;
                }
              });
            }
          });
        }
        this.connectedIntToIdentifiers = identifiersIntArr;
        if (propertiesDetails) {
          this.setTriggerActivators(propertiesDetails);
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

  setTriggerActivators(propertiesDetails: any) {
    const selectedIdentifiersMethods = [];
    this.isActivator = true;
    this.isActivatorEnable = propertiesDetails?.activatorEnabled;
    if (propertiesDetails?.activatorDataList?.length) {
      propertiesDetails?.activatorDataList.forEach((x) => {
        selectedIdentifiersMethods.push(x?.identifierId, ...x?.integrationIdList);
      });
    }
    if (selectedIdentifiersMethods?.length) {
      selectedIdentifiersMethods.forEach((q) => {
        this.setNodeAsSelected(this.connectedIntToIdentifiers, Number(q), propertiesDetails?.locked);
      });
    }
  }

  private setNodeAsSelected(arr: Array<any>, id: number, locked: boolean) {
    if (arr?.length) {
      arr.forEach((node) => {
        node.selectable = false;
        if (Number(id) === Number(node?.id)) {
          this.selectedIntIdentifiers.push(node);
        }
        if (node.children && node.children.length > 0) {
          this.setNodeAsSelected(node.children, id, locked);
        }
      });
    }
  }

  setFormValues(res: any) {
    this.generalInfoForm.patchValue({
      name: res?.name,
      version: res?.versionNumber,
      description: res?.description,
      logMaintenance: res?.logMaintenanceId,
      logLevel: res?.logLevel,
      alertProcess: res?.alertProcessId ? res?.alertProcessId : '',
      scriptEngineGroup: Number(res?.scriptEngineGroup),
      queue: res?.priority,
      isDisableItem: res?.disabled,
      isEnableAlert: res?.alertEnabled,
      isAlertProcess: res?.alertProcess,
      isDefaultAlert: res?.defaultAlert,
      isEnableActivationLogsOnly: res?.updateTaskList,
    });
  }

  /*============= Get Script Parameters ==============*/
  getScriptParameters(propertiesDetails?: any) {
    let scriptParams = [];
    let additionalParameters = [];
    let additionalParams = null;
    const scriptList = (this.itemType === 'integration') ? propertiesDetails?.associatedProcess?.scriptList : propertiesDetails?.scriptList;
    const paramsData = (this.itemType === 'integration') ? propertiesDetails?.associatedProcess?.paramsData : propertiesDetails?.paramsData;
    if (scriptList?.length) {
      scriptList.forEach(x => {
        if (x?.scriptParameterDataList?.length) {
          x?.scriptParameterDataList.forEach(z => {
            if (z?.type === 'Public' && !z?.config) {
              scriptParams.push(z);
            }
          });
        }
      });
    }

    if (scriptParams?.length && paramsData?.length) {
      paramsData.forEach(e => {
        scriptParams.forEach(q => {
          if (e?.paramName === q?.parameterName) {
            q.value = e?.value;
          }
        });
      });
    }

    /*---- Code For Additional Parameters Get Additional Parameters ----*/
    if (paramsData?.length) {
      additionalParameters = paramsData.filter(item1 => {
        const foundIndex = scriptParams.findIndex(item2 => {
          return item2.parameterName === item1.paramName;
        });
        return foundIndex === -1;
      });

      additionalParams = additionalParameters.map(obj => {
        const newObj = {
          autoComplete: false,
          config: false,
          dataType: null,
          description: '',
          id: obj?.id,
          inParameter: false,
          lastUpdated: null,
          optionProtected: false,
          outParameter: false,
          parameterName: obj?.paramName,
          parameterTypes: null,
          probableValues: [],
          scriptId: null,
          securityLevel: obj?.securityLevel,
          storedValue: false,
          type: obj?.type,
          updatedBy: null,
          value: obj?.value,
          workspaceId: null,
          isNewParam: true
        };
        return newObj;
      });
    }
    this.setScriptParameters(additionalParams ? scriptParams.concat(additionalParams) : scriptParams, propertiesDetails);
  }

  setScriptParameters(scriptParams: Array<any>, propertiesDetails: any) {
    if (scriptParams?.length) {
      scriptParams = scriptParams.filter(
        (x, index, arr) => index === arr.findIndex(
          e => x?.parameterName === e?.parameterName
        ));
      scriptParams.sort(function (a, b) {
        var textA = a.parameterName.toUpperCase();
        var textB = b.parameterName.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      const currentParameterObj = {
        isDataType: true,
        isSource: true,
        isName: true,
        isValue: true
      };

      if (this.itemType === 'integration') {
        const clonedIntParamsArray = propertiesDetails?.paramsData ? JSON.parse(JSON.stringify(propertiesDetails?.paramsData)) : [];

        if (scriptParams?.length) {
          scriptParams?.forEach((x) => {
            x.isProcessParam = true;
            if (clonedIntParamsArray?.length) {
              clonedIntParamsArray.forEach((z) => {
                if (x?.parameterName === z?.paramName) {
                  x.isProcessParam = false;
                }
              });
            }
          });
        }
      } else {
        scriptParams?.forEach((x) => {
          delete x.isProcessParam;
        });
      }
      this.parametersForm.setControl('currentParameter', this.setExistingParamerters(scriptParams, currentParameterObj));
    }
  }
  /*============= END Get Script Parameters ==============*/

  /*================== Set Existing Parameters =================*/
  setExistingParamerters(parameters: any[], isCtrlDisabled: any): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    let securityLevel;
    parameters.forEach(p => {
      if (p?.securityLevel) {
        securityLevel = p?.securityLevel ? p?.securityLevel.toLowerCase() : null;
      } else {
        securityLevel = p?.securityLevel;
      }
      formArray.push(this.fb.group({
        dataType: [{ value: p?.dataType, disabled: isCtrlDisabled.isDataType }],
        source: [{ value: p?.source, disabled: isCtrlDisabled.isSource }],
        name: [{ value: p?.parameterName, disabled: isCtrlDisabled.isName }],
        id: [{ value: p?.id, disabled: false }],
        description: [{ value: p?.description, disabled: false }],
        value: [{ value: p?.value, disabled: isCtrlDisabled.isValue }],
        probableValues: [{ value: p?.probableValues, disabled: false }],
        paramType: [{ value: p?.type, disabled: false }],
        securityLevel: [{ value: securityLevel, disabled: false }],
        isprotected: [{ value: p?.optionProtected, disabled: false }],
        isNewParam: [{ value: p?.isProcessParam ? false : p?.isNewParam, disabled: false }],
        displayDataType: [{ value: p?.isProcessParam ? 'Process' + (p?.dataType ? ', ' + p?.dataType : '') : p?.dataType, disabled: isCtrlDisabled.isDataType }]
      }));
    });
    return formArray;
  }
  /*================== Set Existing Parameters =================*/

  /*============= Set Existing Net Users For Properties =============*/
  setNetUsers(propertiesDetails: any) {
    const executableWithNetUsers = [];
    if (propertiesDetails?.netUserMapping?.length) {
      propertiesDetails?.netUserMapping.forEach((x) => {
        x.script.netUsers = x?.netUsers;
        executableWithNetUsers.push(x.script);
      });
      this.netUsersMapping = executableWithNetUsers.filter((item, index) => executableWithNetUsers.indexOf(item) === index);
    }
  }
  /*============= Set Existing Net Users For Properties =============*/

  /*============= Set Business Flow Data =============*/
  setbusinessFlowData(businessFlowData: any) {
    if (businessFlowData?.length) {
      const groupedData = businessFlowData.reduce((data, item) => {
        const id = item.webFlowData.id;
        const activityList = this.appIntegrationDataService.getSelectedWebFlowById(id, item.flowActivityModelId)
        item.activityList = activityList;
        if (!data[id]) {
          data[id] = [];
        }
        data[id].push(item);
        return data;
      }, {} as Record<number, any[]>);

      this.businessFlowDatas = groupedData;
      Object.keys(this.businessFlowDatas).forEach(key => {
        this.selectedCardIndexes[key] = 0;
      });
    }
  }
  /*============= End Set Business Flow Data =============*/

  /*============= Select card =============*/
  selectCard(key: string, index: number) {
    this.selectedCardIndexes[key] = index;
  }
  /*============= End Select card =============*/

  /*=============== Get Version History List ===============*/
  getVersionHistory(propertiesDetails?: any) {
    this.propertiesDetails = propertiesDetails;
    const storedVersionHistory = this.appIntegrationDataService.getVersionHistory(this.workspaceId, this.itemType, this.itemId);
    if (storedVersionHistory?.versionHistory?.length) {
      storedVersionHistory?.versionHistory.map(x => (this.router?.url.includes("properties") && propertiesDetails?.locked && (Number(propertiesDetails?.lockedUserId) ? Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId) : true)) ? x.disabled = false : x.disabled = true);
      this.versionHistory = storedVersionHistory?.versionHistory;
      this.hasDeployedversion = this.versionHistory.versionInfoList?.some(v => v.deployedVersion === true);

    } else {
      this.getVersionHistorySub = this.appIntegrationService.getVersionHistory(this.workspaceId, this.itemType, this.itemId).subscribe(res => {
        if (res?.versionInfoList?.length) {
          res?.versionInfoList.map(x => (this.router?.url.includes("properties") && propertiesDetails?.locked && (Number(propertiesDetails?.lockedUserId) ? Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId) : true)) ? x.disabled = false : x.disabled = true);
          this.versionHistory = res;
          this.hasDeployedversion = this.versionHistory?.versionInfoList?.some(v => v.deployedVersion === true);
          const versionHistoryDto = {
            workspaceId: this.workspaceId,
            itemType: this.itemType,
            itemId: this.itemId,
            versionHistory: res
          };
          this.appIntegrationDataService.storeVersionHistory(versionHistoryDto);
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
  /*=============== END Get Version History List ===============*/

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    if (isPITLock) {
      if (this.versionHistory) {
        if (this.versionHistory?.versionInfoList?.length) {
          this.versionHistory?.versionInfoList.map(x => x.disabled = false);
        }
      }
    } else {
      if (this.versionHistory) {
        if (this.versionHistory?.versionInfoList?.length) {
          this.versionHistory?.versionInfoList.map(x => x.disabled = true);
        }
      }
    }
  }
  /*============ END Get PIT Lock and Enable/Disable Form Feilds ============*/

  /*=============== Restore PIT Item Version ===============*/
  restoreVersion(version: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `Restore will overwrite existing working copy. Are you sure you want to restore?`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (version?.id) {
          this.restoreVersionSub = this.appIntegrationService.restoreVersionHistory(this.itemId, this.itemType, version?.versionNumber).subscribe((res) => {
            if (this.itemType === "process") {
              this.getProcessByVersionIdSub = this.appIntegrationService.getProcessByVersionId(version?.id).subscribe((res) => {
                if (res) {
                  this.appIntegrationService.sharedDeletedScriptParameters(null);
                  this.appIntegrationService.sharedAdditionalScriptParams([]);
                  this.appIntegrationDataService.clearCurrentParamsData();
                  this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
                  this.appIntegrationDataService.deleteProcessTreeItemDetails(this.workspaceId, this.itemId);
                  this.appIntegrationDataService.deleteIntegrationByProcessId(this.workspaceId, this.itemId);
                  const actionObj = {
                    isDeployed: false,
                    isRestore: true,
                    restoreInfo: res
                  };
                  this.isVersionDeployedOrRestore.emit(actionObj);
                }
              }, (err: HttpErrorResponse) => {
                if (err.error instanceof Error) {
                  // handle client side error here
                } else {
                  // handle server side error here
                }
              });
            }
            if (this.itemType === "integration") {
              this.getIntegrationByVersionIdSub = this.appIntegrationService.getIntegrationByVersionId(version?.id).subscribe((res) => {
                if (res) {
                  this.appIntegrationService.sharedDeletedScriptParameters(null);
                  this.appIntegrationService.sharedAdditionalScriptParams([]);
                  this.appIntegrationDataService.clearCurrentParamsData();
                  this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
                  this.appIntegrationDataService.deleteProcessTreeItemDetails(this.workspaceId, this.itemId);
                  this.appIntegrationDataService.deleteIntegrationByProcessId(this.workspaceId, this.itemId);
                  const actionObj = {
                    isDeployed: false,
                    isRestore: true,
                    restoreInfo: res
                  };
                  this.isVersionDeployedOrRestore.emit(actionObj);
                }
              }, (err: HttpErrorResponse) => {
                if (err.error instanceof Error) {
                  // handle client side error here
                } else {
                  // handle server side error here
                }
              });
            }
            if (this.itemType === "trigger") {
              this.getTriggerByVersionIdSub = this.appIntegrationService.getTriggerByVersionId(version?.id).subscribe((res) => {
                if (res) {
                  this.appIntegrationService.sharedDeletedScriptParameters(null);
                  this.appIntegrationService.sharedAdditionalScriptParams([]);
                  this.appIntegrationDataService.clearCurrentParamsData();
                  this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
                  this.appIntegrationDataService.deleteProcessTreeItemDetails(this.workspaceId, this.itemId);
                  this.appIntegrationDataService.deleteIntegrationByProcessId(this.workspaceId, this.itemId);
                  const actionObj = {
                    isDeployed: false,
                    isRestore: true,
                    restoreInfo: res
                  };
                  this.isVersionDeployedOrRestore.emit(actionObj);
                }
              }, (err: HttpErrorResponse) => {
                if (err.error instanceof Error) {
                  // handle client side error here
                } else {
                  // handle server side error here
                }
              });
            }
          }, (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // handle client side error here
            } else {
              // handle server side error here
            }
          })

        }
      }
    });
  }
  /*=============== END Restore PIT Item Version ===============*/

  /*=============== Checks if the deployed script has changed compared to the existing script ===============*/
  checkIfScriptChanged(existingScript: any, changedScript: any): boolean {
    const existingArray = Array.isArray(existingScript) ? existingScript : [];
    const changedArray = Array.isArray(changedScript) ? changedScript : [];

    const existingScriptData = existingArray.map(script => ({
      id: script.id,
      scriptName: script.scriptName,
      order: script.order
    }));

    const changedScriptData = changedArray.map(script => ({
      id: script.id,
      scriptName: script.scriptName,
      order: script.order
    }));

    return JSON.stringify(existingScriptData) !== JSON.stringify(changedScriptData);
  }
  /*=============== END Checks if the deployed script has changed compared to the existing script ===============*/

  /*=============== Handle PIT Item Version ===============*/
  deployVersion(version: any) {
    switch (this.itemType) {
      case 'integration':
        this.deployIntegrationVersion(version);
        break;
      case 'process':
        this.deployProcessVersion(version);
        break;
      case 'trigger':
        this.deployTriggerVersion(version);
        break;
      default:
        break;
    }
  }
  /*=============== END Handle PIT Item Version ===============*/

  /*=============== Deploy Trigger Item Version ===============*/
  deployTriggerVersion(version: any) {
    this.getTriggerByVersionIdSub = this.appIntegrationService.getTriggerByVersionId(version?.id).subscribe((res) => {
      if (res && res.scriptList?.length) {
        const processExecutablesIds = res.scriptList.map(item => item.id);
        this.getScriptDeployStatusSub = this.appIntegrationService.getScriptDeployStatus(processExecutablesIds).subscribe((res) => {
          const hasDeployedFalse = res.some(script => script.deployed === false);
          if (hasDeployedFalse) {
            this.messageService.add({
              key: "appIntErrorKey",
              severity: "error",
              summary: "",
              detail: `Error in ${this.itemType} deploy. One or more connected executables are not deployed.`,
            });
          } else {
            this.deployVersionItem(version);
          }
        });
      }
    });
  }
  /*=============== END Deploy Trigger Item Version ===============*/

  /*=============== Deploy Process Item Version ===============*/
  deployProcessVersion(version: any) {
    this.getProcessByVersionIdSub = this.appIntegrationService.getProcessByVersionId(version?.id).subscribe((versionData) => {
      if (versionData && versionData.scriptList?.length) {
        const processExecutablesIds = versionData.scriptList.map(item => item.id);
        this.getScriptDeployStatusSub = this.appIntegrationService.getScriptDeployStatus(processExecutablesIds).subscribe((res) => {
          const hasDeployedFalse = res.some(script => script.deployed === false);
          if (hasDeployedFalse) {
            this.messageService.add({
              key: "appIntErrorKey",
              severity: "error",
              summary: "",
              detail: `Error in ${this.itemType} deploy. One or more connected executables are not deployed.`,
            });
          } else {
            const deployedScriptList = this.appIntegrationDataService.getDeployedProcessExecutable();
            const scriptChanged = this.checkIfScriptChanged(deployedScriptList, versionData?.scriptList);
            if (scriptChanged) {
              this.appIntegrationService.getDeployedIntegrationProcessById(this.itemId).subscribe((result) => {
                if (result.length) {
                  const names = result.map(item => item.name).join(', ');
                  const dialogRef = this.dialog.open(AppIntManualAutoDeployComponent, {
                    width: "700px",
                    maxHeight: "600px",
                    data: names,
                  });

                  dialogRef.afterClosed().subscribe((result) => {
                    if (result.success) {
                      versionData.releasePressed = true;
                      const manualAutoDeployDto: ManualAutoDeployDto = {
                        process: versionData,
                        type: result?.deploymentMode,
                        processId: this.itemId,
                        workspaceId: this.workspaceId,
                        versionNote: '',
                        userName: this.currentUser?.userName
                      }
                      this.manualAutoDeployItemsSub = this.appIntegrationService.manualAutoDeployItems(manualAutoDeployDto).subscribe((response) => {
                        if (response) {
                          this.appIntegrationDataService.clearVersionHistory();
                          this.messageService.add({
                            key: "appIntSuccessKey",
                            severity: "success",
                            summary: "",
                            detail: `Version number ${versionData?.versionNumber} of ${this.itemType} deployed successfully!`,
                          });
                          this.getVersionHistory(this.propertiesDetails);

                          const actionObj = {
                            isDeployed: true,
                            isRestore: false,
                            restoreInfo: null
                          };
                          this.isVersionDeployedOrRestore.emit(actionObj);
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
                } else {
                  this.deployVersionItem(version);
                }
              });
            } else {
              this.deployVersionItem(version);
            }
          }
        });
      }
    });
  }
  /*=============== Deploy Process Item Version ===============*/

  /*=============== Deploy PIT Item Version ===============*/
  deployVersionItem(version: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `Are you sure you want to deploy selected version number ${version?.versionNumber}?<br/>Note: The version will be deployed immediately.`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const deployItemsDto: DeployUndeployItemsDto = {
          workspaceId: this.workspaceId,
          deploymentDetails: [
            {
              teisItemID: this.itemId,
              teisItemType: this.itemType,
              teisVersionNumber: version?.versionNumber,
            },
          ],
        };
        this.deployVersionSub = this.appIntegrationService.deployItems(deployItemsDto, 'Process', this.itemId, this.itemType).subscribe((res) => {
          this.appIntegrationDataService.clearVersionHistory();
          this.messageService.add({
            key: "appIntSuccessKey",
            severity: "success",
            summary: "",
            detail: `Version number ${version?.versionNumber} of ${this.itemType} deployed successfully!`,
          });
          this.getVersionHistory(this.propertiesDetails);

          const actionObj = {
            isDeployed: true,
            isRestore: false,
            restoreInfo: null
          };
          this.isVersionDeployedOrRestore.emit(actionObj);
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
  /*=============== Deploy PIT Item Version ===============*/

  /*=============== Deploy Integration Item Version ===============*/
  deployIntegrationVersion(version: any) {
    let messageInfo = null;
    this.getIntegrationByVersionIdSub = this.appIntegrationService.getIntegrationByVersionId(version?.id).subscribe((res) => {
      if (res) {
        this.currentVesionProcess = res?.associatedProcess;
        if (this.currentVesionProcess?.deployed) {
          if (this.hasDeployedversion) {
            this.deployedAssociatedProcess = this.appIntegrationDataService.getDeployedIntAssociatedProcess();
            if (Number(res?.associatedProcess?.id) !== Number(this.deployedAssociatedProcess?.id)) {
              messageInfo = `Deploy of Integration will remove all existing versions because of a different attached process.`;
            }
          }
          let data = `Are you sure you want to deploy selected version number ${version?.versionNumber}?<br/>Note: The version will be deployed immediately.`;
          const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '700px',
            maxHeight: '600px',
            data: messageInfo ? `${messageInfo}<br/><br/>${data}` : data
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              const deployItemsDto: DeployUndeployItemsDto = {
                workspaceId: this.workspaceId,
                deploymentDetails: [
                  {
                    teisItemID: this.itemId,
                    teisItemType: this.itemType,
                    teisVersionNumber: version?.versionNumber,
                  },
                ],
              };
              if (this.hasDeployedversion) {
                this.deployVersionSub = this.appIntegrationService.deployVersion(deployItemsDto).subscribe((response) => {
                  this.appIntegrationDataService.clearVersionHistory();
                  this.messageService.add({
                    key: "appIntSuccessKey",
                    severity: "success",
                    summary: "",
                    detail: `Version number ${version?.versionNumber} of ${this.itemType} deployed successfully!`,
                  });
                  this.getVersionHistory(this.propertiesDetails);
                  this.appIntegrationDataService.storeDeployedIntAssociatedProcess(this.currentVesionProcess);
                  const actionObj = {
                    isDeployed: true,
                    isRestore: false,
                    restoreInfo: null
                  };
                  this.isVersionDeployedOrRestore.emit(actionObj);
                }, (err: HttpErrorResponse) => {
                  if (err.error instanceof Error) {
                    // handle client side error here
                  } else {
                    // handle server side error here
                  }
                });

              } else {
                this.deployVersionSub = this.appIntegrationService.deployItems(deployItemsDto, 'Process', this.itemId, this.itemType).subscribe((res) => {
                  this.appIntegrationDataService.clearVersionHistory();
                  this.messageService.add({
                    key: "appIntSuccessKey",
                    severity: "success",
                    summary: "",
                    detail: `Version number ${version?.versionNumber} of ${this.itemType} deployed successfully!`,
                  });
                  this.getVersionHistory(this.propertiesDetails);
                  this.appIntegrationDataService.storeDeployedIntAssociatedProcess(this.currentVesionProcess);
                  const actionObj = {
                    isDeployed: true,
                    isRestore: false,
                    restoreInfo: null
                  };
                  this.isVersionDeployedOrRestore.emit(actionObj);
                }, (err: HttpErrorResponse) => {
                  if (err.error instanceof Error) {
                    // handle client side error here
                  } else {
                    // handle server side error here
                  }
                });
              }
            }
          });
        } else {
          this.messageService.add({
            key: "appIntErrorKey",
            severity: "error",
            summary: "",
            detail: `Error occurred while deploying "${res?.name}". Verify connected process is deployed or refresh the integration item for latest status.`,
          });

        }
      }
    });
  }
  /*=============== Deploy Integration Item Version ===============*/

  /*=============== Delete PIT Item Version ===============*/
  deleteVersion(version: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `Are you sure you want to delete selected version number ${version?.versionNumber}?`
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteVersionSub = this.appIntegrationService.deleteItemVersion(version?.id, this.itemType).subscribe(res => {
          if (res) {
            this.appIntegrationDataService.deleteVersionHistory(this.workspaceId, this.itemType, this.itemId, version?.id);
            this.getVersionHistory(this.propertiesDetails);
            this.messageService.add({
              key: "appIntSuccessKey",
              severity: "success",
              summary: "",
              detail: `Version number ${version?.versionNumber} of ${this.itemType} deleted successfully!`,
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
  /*=============== END Delete PIT Item Version ===============*/

  onToggle() {
    this.isShowAdvanceSetting = !this.isShowAdvanceSetting;
  }

  ngOnDestroy(): void {
    this.getVersionHistorySub.unsubscribe();
    this.deployVersionSub.unsubscribe();
    this.deleteVersionSub.unsubscribe();
    this.getProcessByVersionIdSub.unsubscribe();
    this.getIntegrationByVersionIdSub.unsubscribe();
    this.getTriggerByVersionIdSub.unsubscribe();
    this.restoreVersionSub.unsubscribe();
    this.getScriptDeployStatusSub.unsubscribe();
    this.manualAutoDeployItemsSub.unsubscribe();
  }

}
