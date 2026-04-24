import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { ScriptViewComponent } from '../script-view/script-view.component';
import { TasksManagementService } from '../tasks-management.service';
import { TaskMgmtGlobalDataService } from '../task-mgmt-global-data.service';
import { EncryptDecryptService } from "src/app/shared/services/encrypt-decrypt.service";

@Component({
  selector: 'app-general-information',
  templateUrl: './general-information.component.html',
  styleUrls: ['./general-information.component.scss']
})
export class GeneralInformationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() select_all: boolean;
  @Input() isMultipleTaskSelected: boolean;
  @Input() taskId: string;
  @Input() workspaceId: number;
  @Input() processId: number;
  @Input() nodeType: string;
  @Input() currentTaskStatus: string;
  @Output() isDeployedTrigger = new EventEmitter<any>();
  @Output() deployedPITInfo = new EventEmitter<any>();

  deployedData: any;
  integratedData: any;
  isConnectedIntegrationsShow = false;
  isAlarmSchedulerShow = false;
  isParameterSettings: boolean = false;

  getDeployedProcessByIdSub = Subscription.EMPTY;
  getIntegrationProcessByIdSub = Subscription.EMPTY;
  getDeployedTriggerByIdSub = Subscription.EMPTY;
  getIntegrationTriggerByIdSub = Subscription.EMPTY;
  getDeployedIntegrationByIdSub = Subscription.EMPTY;
  isNetUsersShow = true;
  isInParameters: boolean = true;
  isInParametersValue: boolean = false;
  isOutParamters: boolean = false;
  isHiddenParameters: boolean = false;

  constructor(
    public dialog: MatDialog,
    private tasksManagementService: TasksManagementService,
    private taskMgmtGlobalDataService: TaskMgmtGlobalDataService,
    private encryptDecryptService: EncryptDecryptService,
  ) { }

  ngOnChanges() {
    if (this.workspaceId) {
      if (this.processId) {
        if (this.taskMgmtGlobalDataService.getParameterSettings() !== null) {
          let parameterSettings = this.taskMgmtGlobalDataService.getParameterSettings();
          this.isInParameters = parameterSettings?.isInParameters;
          this.isInParametersValue = parameterSettings?.isInParametersValue;
          this.isOutParamters = parameterSettings?.isOutParamters;
          this.isHiddenParameters = parameterSettings?.isHiddenParameters;
        }
        if (this.nodeType === 'PROCESS') {
          this.getDeployedProcessById(this.processId);
          this.getIntegrationProcessById(this.workspaceId, this.processId);
        }
        if (this.nodeType === 'TRIGGER') {
          this.getDeployedTriggerById(this.processId);
          this.getIntegrationTriggerById(this.workspaceId, this.processId);
        }
        if (this.nodeType === 'INTEGRATION') {
          this.getDeployedIntegrationById(this.processId);
        }
      }
    }
  }

  ngOnInit(): void {
  }

  /*============= Refersh General Information ============*/
  refershGenInfo(workspaceId: any, processId: any, nodeType: string) {
    if (workspaceId) {
      if (processId) {
        if (nodeType === 'PROCESS') {
          this.getDeployedProcessById(processId);
          this.getIntegrationProcessById(workspaceId, processId);
        }
        if (nodeType === 'TRIGGER') {
          this.getDeployedTriggerById(processId);
          this.getIntegrationTriggerById(workspaceId, processId);
        }
        if (nodeType === 'INTEGRATION') {
          this.getDeployedIntegrationById(processId);
        }
      }
    }
  }

  /*============= Get Deployed Process By Id =============*/
  getDeployedProcessById(processId: number) {
    const processDetails = this.taskMgmtGlobalDataService.getProcessById(processId);
    if (processDetails) {
      this.deployedData = processDetails?.processDetails;
      this.deployedPITInfo.emit(this.deployedData);
    } else {
      this.getDeployedProcessByIdSub = this.tasksManagementService.getDeployedProcessById(processId).subscribe(res => {
        this.deployedData = res;

        if (this.deployedData?.scriptList?.length) {
          this.deployedData?.scriptList.forEach((item) => {
            if (item?.scriptParameterDataList?.length) {
              item.scriptParameterDataList = Array.from(new Map(
                item?.scriptParameterDataList.map(data => [data.parameterName.trim(), data])
              ).values());
              item?.scriptParameterDataList.forEach((x) => {
                x.value = null;
                if (this.deployedData?.paramsData?.length) {
                  this.deployedData?.paramsData.forEach((p) => {
                    if (x?.parameterName === p?.paramName) {
                      if (x?.securityLevel.toLowerCase() === 'high' && p?.securityLevel.toLowerCase() === 'low') {
                        p.securityLevel = x?.securityLevel;
                        p.value = this.encryptDecryptService.encrypt(p?.value);
                      } else if (x?.securityLevel.toLowerCase() === 'medium' && p?.securityLevel.toLowerCase() === 'low') {
                        p.securityLevel = x?.securityLevel;
                        p.value = this.encryptDecryptService.encrypt(p?.value);
                      } else if (x?.securityLevel.toLowerCase() === 'high' && p?.securityLevel.toLowerCase() === 'medium') {
                        p.securityLevel = x?.securityLevel;
                        //p.value = this.encryptDecryptService.encrypt(p?.value);
                      } else if (x?.securityLevel.toLowerCase() === 'low' && p?.securityLevel.toLowerCase() === 'medium') {
                        p.securityLevel = x?.securityLevel;
                        p.value = this.encryptDecryptService.decrypt(p?.value);
                      }
                    }
                  });
                }
              });
            }
          });
        }
        if (this.deployedData?.paramsData?.length) {
          this.deployedData?.paramsData.forEach((p) => {
            p.value = (p?.securityLevel === 'medium' || p?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(p?.value) : p?.value;
          });
        }
        this.getConnectedExe(processId);
        // this.deployedPITInfo.emit(this.deployedData);
        // const processByIdDto = {
        //   processId: processId,
        //   processDetails: this.deployedData
        // };
        // this.taskMgmtGlobalDataService.storeProcessById(processByIdDto);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============= END Get Deployed Process By Id =============*/

  /*============= Get Integrated Process By Id =============*/
  getIntegrationProcessById(workspaceId: number, processId: number) {
    const integrationProcessDetails = this.taskMgmtGlobalDataService.getIntegrationProcessById(workspaceId, processId);
    if (integrationProcessDetails) {
      this.integratedData = integrationProcessDetails?.integrationProcessDetails;
    } else {
      this.getIntegrationProcessByIdSub = this.tasksManagementService.getIntegrationProcessById(workspaceId, processId).subscribe(res => {
        this.integratedData = res;
        const integrationProcessByIdDto = {
          workspaceId: workspaceId,
          processId: processId,
          integrationProcessDetails: this.integratedData
        };
        this.taskMgmtGlobalDataService.storeIntegrationProcessById(integrationProcessByIdDto);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============= END Get Integrated Process By Id =============*/

  /*============= Get Deployed Process By Id =============*/
  getDeployedTriggerById(processId: number) {
    const triggerDetails = this.taskMgmtGlobalDataService.getTriggerById(processId);
    if (triggerDetails) {
      this.deployedData = triggerDetails?.triggerDetails;
      this.isDeployedTrigger.emit({ isDeployed: this.deployedData?.deployed });
      this.deployedPITInfo.emit(this.deployedData);
    } else {
      this.getDeployedTriggerByIdSub = this.tasksManagementService.getDeployedTriggerById(processId).subscribe(res => {
        this.deployedData = res;
        if (this.deployedData?.scriptList?.length) {
          this.deployedData?.scriptList.forEach((item) => {
            if (item?.scriptParameterDataList?.length) {
              item.scriptParameterDataList = Array.from(new Map(
                item?.scriptParameterDataList.map(data => [data.parameterName.trim(), data])
              ).values());
              item?.scriptParameterDataList.forEach((x) => {
                x.value = null;
                if (this.deployedData?.paramsData?.length) {
                  this.deployedData?.paramsData.forEach((p) => {
                    if (x?.parameterName === p?.paramName) {
                      if (x?.securityLevel.toLowerCase() === 'high' && p?.securityLevel.toLowerCase() === 'low') {
                        p.securityLevel = x?.securityLevel;
                        p.value = this.encryptDecryptService.encrypt(p?.value);
                      } else if (x?.securityLevel.toLowerCase() === 'medium' && p?.securityLevel.toLowerCase() === 'low') {
                        p.securityLevel = x?.securityLevel;
                        p.value = this.encryptDecryptService.encrypt(p?.value);
                      } else if (x?.securityLevel.toLowerCase() === 'high' && p?.securityLevel.toLowerCase() === 'medium') {
                        p.securityLevel = x?.securityLevel;
                        //p.value = this.encryptDecryptService.encrypt(p?.value);
                      } else if (x?.securityLevel.toLowerCase() === 'low' && p?.securityLevel.toLowerCase() === 'medium') {
                        p.securityLevel = x?.securityLevel;
                        p.value = this.encryptDecryptService.decrypt(p?.value);
                      }
                    }
                  });
                }
              });
            }
          });
        }
        if (this.deployedData?.paramsData?.length) {
          this.deployedData?.paramsData.forEach((p) => {
            p.value = (p?.securityLevel === 'medium' || p?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(p?.value) : p?.value;
          });
        }
        this.getConnectedExe(processId);
        // this.isDeployedTrigger.emit({ isDeployed: res?.deployed });
        // this.deployedPITInfo.emit(this.deployedData);
        // const triggerByIdDto = {
        //   triggerId: processId,
        //   triggerDetails: this.deployedData
        // };
        // this.taskMgmtGlobalDataService.storeTriggerById(triggerByIdDto);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============= END Get Deployed Process By Id =============*/

  /*============= Get Integrated Trigger By Id =============*/
  getIntegrationTriggerById(workspaceId: number, processId: number) {
    const integrationTriggerDetails = this.taskMgmtGlobalDataService.getIntegrationTriggerById(workspaceId, processId);
    if (integrationTriggerDetails) {
      this.integratedData = integrationTriggerDetails?.integrationTriggerDetails;
    } else {
      this.getIntegrationTriggerByIdSub = this.tasksManagementService.getIntegrationTriggerById(workspaceId, processId).subscribe(res => {
        this.integratedData = res;
        const integrationTriggerByIdDto = {
          workspaceId: workspaceId,
          triggerId: processId,
          integrationTriggerDetails: this.integratedData
        };
        this.taskMgmtGlobalDataService.storeIntegrationTriggerById(integrationTriggerByIdDto);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============= END Get Integrated Trigger By Id =============*/

  /*============= Get Deployed Process By Id =============*/
  getDeployedIntegrationById(integrationId: number) {
    const integrationDetails = this.taskMgmtGlobalDataService.getIntegrationById(integrationId);
    if (integrationDetails) {
      this.deployedData = integrationDetails?.integrationDetails;
      this.deployedPITInfo.emit(this.deployedData);
    } else {
      this.getDeployedIntegrationByIdSub = this.tasksManagementService.getDeployedIntegrationById(integrationId).subscribe(res => {
        if (res?.netUserMapping?.length) {
          res?.netUserMapping?.forEach(item => {
            if (!item?.netUsers?.length) {
              this.isNetUsersShow = false;
            }
          });
        }
        const uniqueMethodNameArr = [];
        if (res?.identifiers?.length) {
          const arr = [];
          let arr2 = [];
          res?.identifiers.forEach(item => {
            arr.push(item?.methodName);
          });
          const uniqueMethodName = [...new Set(arr)];
          uniqueMethodName.forEach(item => {
            arr2 = [];
            res?.identifiers.forEach(el => {
              if (item === el?.methodName) {
                arr2.push({ identifierStr: el.identifierStr });
              }
            });
            uniqueMethodNameArr.push({ methodName: item, identifierStrs: arr2 });
          });
        }
        if (res?.scriptList?.length) {
          res?.scriptList.forEach((item) => {
            if (res?.netUserMapping?.length) {
              res?.netUserMapping.forEach((netUsers) => {
                if (Number(netUsers?.script?.id) === Number(item?.executableRef)) {
                  item.netUsers = netUsers?.netUsers;
                }
              })
            }
          });
        }
        this.deployedData = res;

        this.deployedData.identifiers = uniqueMethodNameArr;
        // this.deployedData.paramsData = res?.associatedProcess?.paramsData;

        if (this.deployedData?.associatedProcess?.paramsData?.length) {
          this.deployedData?.associatedProcess?.paramsData.forEach((ap) => {
            ap.value = (ap?.securityLevel === 'medium' || ap?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(ap?.value) : ap?.value;
          });
        }

        if (this.deployedData?.scriptList?.length) {
          this.deployedData?.scriptList.forEach((item) => {
            if (item?.scriptParameterDataList?.length) {
              item.scriptParameterDataList = Array.from(new Map(
                item?.scriptParameterDataList.map(data => [data.parameterName.trim(), data])
              ).values());
              item?.scriptParameterDataList.forEach((x) => {
                x.value = null;
                if (this.deployedData?.paramsData?.length) {
                  this.deployedData?.paramsData.forEach((p) => {
                    if (x?.parameterName === p?.paramName) {
                      if (x?.securityLevel.toLowerCase() === 'high' && p?.securityLevel.toLowerCase() === 'low') {
                        p.securityLevel = x?.securityLevel;
                        p.value = this.encryptDecryptService.encrypt(p?.value);
                      } else if (x?.securityLevel.toLowerCase() === 'medium' && p?.securityLevel.toLowerCase() === 'low') {
                        p.securityLevel = x?.securityLevel;
                        p.value = this.encryptDecryptService.encrypt(p?.value);
                      } else if (x?.securityLevel.toLowerCase() === 'high' && p?.securityLevel.toLowerCase() === 'medium') {
                        p.securityLevel = x?.securityLevel;
                        //p.value = this.encryptDecryptService.encrypt(p?.value);
                      } else if (x?.securityLevel.toLowerCase() === 'low' && p?.securityLevel.toLowerCase() === 'medium') {
                        p.securityLevel = x?.securityLevel;
                        p.value = this.encryptDecryptService.decrypt(p?.value);
                      }
                    }
                  });
                }
              });
            }
          });
        }
        if (this.deployedData?.paramsData?.length) {
          this.deployedData?.paramsData.forEach((p) => {
            p.value = (p?.securityLevel === 'medium' || p?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(p?.value) : p?.value;
          });
        }

        this.deployedData.paramsData = this.checkProcessIntegrationParams(this.deployedData?.associatedProcess?.paramsData, this.deployedData?.paramsData);

        // this.deployedPITInfo.emit(this.deployedData);
        // const integrationByIdDto = {
        //   integrationId: integrationId,
        //   integrationDetails: this.deployedData
        // };
        // this.taskMgmtGlobalDataService.storeIntegrationById(integrationByIdDto);
        this.getConnectedExe(integrationId);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============= END Get Deployed Process By Id =============*/

  /*============= Merge Process Parameters With Integration Parameters =============*/
  checkProcessIntegrationParams(processParams: Array<any>, integrationParams: Array<any>) {
    const clonedIntParamsArray = JSON.parse(JSON.stringify(processParams));
    if (clonedIntParamsArray?.length) {
      clonedIntParamsArray?.forEach((x) => {
        x.isIntParam = false;
        if (integrationParams?.length) {
          integrationParams.forEach((z) => {
            if (Number(x?.id) === Number(z?.id)) {
              x.isIntParam = true;
            }
          });
        }
      });
    }
    return clonedIntParamsArray;
  }



  /*============= Get Connected Executables ============*/
  getConnectedExe(integrationId: number) {
    const res = this.deployedData;
    let parameterSettingData = {
      'isInParameters': this.isInParameters,
      'isInParametersValue': this.isInParametersValue,
      'isOutParamters': this.isOutParamters,
      'isHiddenParameters': this.isHiddenParameters
    };
    this.taskMgmtGlobalDataService.storeParameterSettings(parameterSettingData);

    if (res?.scriptList?.length) {
      res?.scriptList.forEach((item) => {
        if (res?.netUserMapping?.length) {
          res?.netUserMapping.forEach((netUsers) => {
            if (Number(netUsers?.script?.id) === Number(item?.executableRef)) {
              item.netUsers = netUsers?.netUsers;
            }
          })
        }
        if (item?.scriptParameterDataList?.length) {
          const inParameters = [];
          const outParameters = [];
          const inOutParameters = [];

          item?.scriptParameterDataList.forEach((params) => {
            if (res?.paramsData?.length) {
              res?.paramsData.forEach((x) => {
                if (params?.parameterName === x?.paramName) {
                  params.value = params?.securityLevel.toLowerCase() === 'high' ? '*****' : x?.value;
                }
              });
            }
            if (this.isHiddenParameters) {
              if (params?.inParameter && params?.outParameter) {
                inOutParameters.push(params);
              } else {
                if (params?.inParameter) {
                  inParameters.push(params);
                }
                if (params?.outParameter) {
                  outParameters.push(params);
                }
              }
            } else {
              if (params?.type !== 'Private') {
                if (params?.inParameter && params?.outParameter) {
                  inOutParameters.push(params);
                } else {
                  if (params?.inParameter) {
                    inParameters.push(params);
                  }
                  if (params?.outParameter) {
                    outParameters.push(params);
                  }
                }
              }
            }
          });
          item.inParameters = inParameters;
          item.outParameters = outParameters;
          item.inOutParameters = inOutParameters;
        }
      });
    }
    this.deployedData = res;
    this.deployedPITInfo.emit(this.deployedData);
    if (this.nodeType === 'INTEGRATION') {
      const integrationByIdDto = {
        integrationId: integrationId,
        integrationDetails: this.deployedData
      };
      this.taskMgmtGlobalDataService.storeIntegrationById(integrationByIdDto);
    }

    if (this.nodeType === 'TRIGGER') {
      this.isDeployedTrigger.emit({ isDeployed: res?.deployed });
      //this.deployedPITInfo.emit(this.deployedData);
      const triggerByIdDto = {
        triggerId: integrationId,
        triggerDetails: this.deployedData
      };
      this.taskMgmtGlobalDataService.storeTriggerById(triggerByIdDto);
    }

    if (this.nodeType === 'PROCESS') {
      //this.deployedPITInfo.emit(this.deployedData);
      const processByIdDto = {
        processId: integrationId,
        processDetails: this.deployedData
      };
      this.taskMgmtGlobalDataService.storeProcessById(processByIdDto);

    }
  }

  /*============= View Script ============*/
  viewScript(scriptId: string, scriptName: string, userDefined: boolean) {
    const dialogRef = this.dialog.open(ScriptViewComponent, {
      width: '1000px',
      maxHeight: '600px',
      data: {
        scriptId: scriptId,
        scriptName: scriptName,
        workspaceId: this.workspaceId,
        userDefined: userDefined
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }
  /*============= END View Script ============*/

  onToggel(value: string) {
    if (value === 'CONNECTED_INTEGRATION') {
      this.isConnectedIntegrationsShow = !this.isConnectedIntegrationsShow;
    }
    if (value === 'ALARM_SCHEDULER') {
      this.isAlarmSchedulerShow = !this.isAlarmSchedulerShow;
    }
  }

  onToggleAlarm(value: boolean) {
    value = false;
    value = !value;
  }

  ngOnDestroy() {
    this.getDeployedProcessByIdSub.unsubscribe();
    this.getIntegrationProcessByIdSub.unsubscribe();
    this.getDeployedTriggerByIdSub.unsubscribe();
    this.getIntegrationTriggerByIdSub.unsubscribe();
    this.getDeployedIntegrationByIdSub.unsubscribe();
  }

}
