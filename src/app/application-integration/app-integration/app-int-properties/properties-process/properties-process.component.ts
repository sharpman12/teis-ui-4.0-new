import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AppIntegrationService } from '../../app-integration.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from "primeng/api";
import { Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AppIntAddEditProcessComponent } from '../../app-int-add-edit-process/app-int-add-edit-process.component';
import { Constants } from 'src/app/shared/components/constants';
import { AppIntegrationDataService } from '../../app-integration-data.service';
import { AppIntProcessPropertiesComponent } from '../../app-int-process-properties/app-int-process-properties.component';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { ConfirmationComponent } from '../../../../shared/components/confirmation/confirmation.component';
import { UserAccessValidationDto } from '../../appintegration';

@Component({
  selector: 'app-properties-process',
  templateUrl: './properties-process.component.html',
  styleUrls: ['./properties-process.component.scss']
})
export class PropertiesProcessComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number;
  @Input() itemId: number = null;
  @Input() isProperties: boolean = false;
  @Input() propertiesInfo: any = null;
  // processForm: UntypedFormGroup;
  connectedProcess: Array<any> = [];
  isProcessDeployed: boolean = true;
  processExecutables: any;
  isIntegrationLocked: boolean = false;
  selectedProcessId: number = null;
  propertiesDetails: any = null;
  currentUser: any = null;
  deployedProcessInfo: any = null;
  searchProcessStr: String = '';

  validationMessages = {
    connectedProcess: {
      required: 'Please select the connected process.',
    }
  };

  formErrors = {
    connectedProcess: ''
  };

  connectedProcessesSub = Subscription.EMPTY;
  getProcessByIdSub = Subscription.EMPTY;
  getRootItemInfo = Subscription.EMPTY;
  getValidateAccessSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private encryptDecryptService: EncryptDecryptService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnInit(): void {
    //this.createForm();
    if (this.router?.url.includes("properties")) {
      this.isIntegrationLocked = false;
      // this.processForm.disable();
    } else {
      this.isIntegrationLocked = true;
      //this.processForm.enable();
    }
  }

  /*============ Form Creation ============*/
  // createForm() {
  //   this.processForm = this.fb.group({
  //     connectedProcess: [{ value: '', disabled: false }, {
  //       validators: [Validators.required]
  //     }]
  //   });
  //   this.processForm.valueChanges.subscribe((data: any) => {
  //     this.logValidationErrors(this.processForm);
  //   });
  // }
  /*============ END Form Creation ============*/

  validateConnectedProcess() {
    if (this.selectedProcessId == null) {
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Integration does not have process connected. Add an Process to continue.' });
      return false;
    } else {

      return true;
    }

  }

  /*============ Check Form Validation and Display Messages ============*/
  // logValidationErrors(group: UntypedFormGroup = this.processForm): void {
  //   Object.keys(group.controls).forEach((key: string) => {
  //     const abstractControl = group.get(key);
  //     if (abstractControl instanceof UntypedFormGroup) {
  //       this.logValidationErrors(abstractControl);
  //     } else {
  //       this.formErrors[key] = '';
  //       if (abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty)) {
  //         const messages = this.validationMessages[key];
  //         for (const errorKey in abstractControl.errors) {
  //           if (errorKey) {
  //             this.formErrors[key] += messages[errorKey] + ' ';
  //           }
  //         }
  //       }
  //     }
  //   });
  // }
  /*============ END Check Form Validation and Display Messages ============*/

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    this.isIntegrationLocked = isPITLock;
    if (isPITLock) {
      // this.processForm.enable();
    } else {
      // this.processForm.disable();
    }
  }

  getSelectedProcessId(propertiesDetails: any) {
    this.propertiesDetails = propertiesDetails;
    if (this.propertiesDetails?.locked && Number(this.currentUser?.id) === Number(this.propertiesDetails?.lockedUserId)) {
      this.isIntegrationLocked = this.propertiesDetails?.locked;
      // this.processForm.enable();
    } else {
      this.isIntegrationLocked = this.propertiesDetails?.locked;
      //this.processForm.disable();
    }
    this.appIntegrationDataService.storeSelectedProcessInInt(propertiesDetails?.associatedProcess);
    this.selectedProcessId = Number(propertiesDetails?.associatedProcess?.id);
    // this.getConnectedProcess(this.workspaceId);
  }

  /*============ Refresh Connected Processes ============*/
  refreshConnectedProcess() {
    this.processExecutables = [];
    this.appIntegrationDataService.clearConnectedProcessToInt();
    this.getConnectedProcess(this.workspaceId, this.propertiesInfo);
    // this.processForm.get('connectedProcess').reset();
  }

  /*============ Get Connected Processes ============*/
  getConnectedProcess(workspaceId, processDetails: any) {
    const processExe = this.appIntegrationDataService.getConnectedProcessToIntByWorkspaceId(workspaceId);
    if (processExe?.length) {
      this.connectedProcess = processExe.map((process) => ({
        ...process,
        id: Number(process.id)
      }));

      setTimeout(() => {
        if (this.selectedProcessId) {
          this.getConnectedProcessInfo(this.selectedProcessId, processDetails);
        }
      }, 0);
    } else {
      this.connectedProcessesSub = this.appIntegrationService.getWSProcesses(workspaceId).subscribe((res) => {
        const processes = JSON.parse(JSON.stringify(res));
        this.connectedProcess = processes.map((process) => ({
          ...process,
          id: Number(process.id)
        }));
        setTimeout(() => {
          if (this.selectedProcessId) {
            this.getConnectedProcessInfo(this.selectedProcessId, processDetails);
          }
        }, 0);
        const connectedProcessesObj = {
          workspaceId: workspaceId,
          processes: this.connectedProcess
        };
        this.appIntegrationDataService.storeConnectedProcessToInt(connectedProcessesObj);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  getConnectedNewProcess(workspaceId, processDetails: any, processId: any) {
    const processExe = this.appIntegrationDataService.getConnectedProcessToIntByWorkspaceId(workspaceId);
    if (processExe?.length) {
      this.connectedProcess = processExe.map((process) => ({
        ...process,
        id: Number(process.id)
      }));
      setTimeout(() => {
        if (processId) {
          this.getConnectedProcessInfo(processId, processDetails);
        }
      }, 0);
    } else {
      this.connectedProcessesSub = this.appIntegrationService.getWSProcesses(workspaceId).subscribe((res) => {
        const processes = JSON.parse(JSON.stringify(res));
        this.connectedProcess = processes.map((process) => ({
          ...process,
          id: Number(process.id)
        }));
        setTimeout(() => {
          if (processId) {
            this.getConnectedProcessInfo(processId, processDetails);
          }
        }, 0);
        const connectedProcessesObj = {
          workspaceId: workspaceId,
          processes: this.connectedProcess
        };
        this.appIntegrationDataService.storeConnectedProcessToInt(connectedProcessesObj);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  onChangeConnectedProcess(selectedProcess: number) {
    this.appIntegrationService.sharedAdditionalScriptParams([]);
    this.getConnectedProcessInfo(selectedProcess, null);
  }

  getConnectedProcessInfo(selectedProcess: number, propertiesDetails: any) {
    this.selectedProcessId = selectedProcess;
    // this.processForm.get('connectedProcess').patchValue(selectedProcess);
    this.getProcessById(selectedProcess, propertiesDetails);
  }
  /*============ END Get Connected Processes ============*/

  /*============ Get Process By Id ============*/
  getProcessById(processId: number, propertiesDetails: any) {
    const executables = [];
    const scriptParamsList = [];
    let additionalParameters = [];
    if (this.itemType === 'integration' || this.itemType === 'trigger') {
      this.getProcessByIdSub = this.appIntegrationService.getDeployedProcessById(processId).subscribe((res) => {
        this.appIntegrationDataService.clearCurrentParamsData();
        this.deployedProcessInfo = res;
        const process = JSON.parse(JSON.stringify(res));
        this.appIntegrationDataService.storeProcessParamsData(process?.paramsData);
        this.isProcessDeployed = process?.deployed;
        process?.scriptList.forEach((s) => {
          if (s?.scriptParameterDataList?.length) {
            s?.scriptParameterDataList.forEach((sp) => {
              sp.value = null;
              scriptParamsList.push(sp);
            });
          }
        });
        if (process?.paramsData?.length) {
          process?.paramsData.forEach((x) => {
            if (process?.scriptList?.length) {
              process?.scriptList.forEach((s) => {
                if (s?.scriptParameterDataList?.length) {
                  s?.scriptParameterDataList.forEach((sp) => {
                    if (sp?.parameterName.trim() === x?.paramName.trim()) {
                      const spSec = (sp?.securityLevel ?? '').toLowerCase();
                      const xSec = (x?.securityLevel ?? '').toLowerCase();
                      if (spSec === 'high' && xSec === 'low') {
                        x.value = this.encryptDecryptService.encrypt(x?.value);
                      } else if (spSec === 'medium' && xSec === 'low') {
                        x.value = this.encryptDecryptService.encrypt(x?.value);
                      } else if (spSec === 'low' && xSec === 'medium') {
                        x.value = this.encryptDecryptService.decrypt(x?.value);
                      }

                      // if (sp?.securityLevel.toLowerCase() === 'high' && x?.securityLevel.toLowerCase() === 'low') {
                      //   x.value = this.encryptDecryptService.encrypt(x?.value);
                      // } else if (sp?.securityLevel.toLowerCase() === 'medium' && x?.securityLevel.toLowerCase() === 'low') {
                      //   x.value = this.encryptDecryptService.encrypt(x?.value);
                      // } else if (sp?.securityLevel.toLowerCase() === 'low' && x?.securityLevel.toLowerCase() === 'medium') {
                      //   x.value = this.encryptDecryptService.decrypt(x?.value);
                      // }
                      sp.value = x?.value;
                    }
                  });
                }
              });
            }
          });
        }
        /*---- Code For Additional Parameters Get Additional Paraeters ----*/
        if (process?.paramsData?.length && scriptParamsList?.length) {
          additionalParameters = process?.paramsData.filter(item1 => {
            const foundIndex = scriptParamsList.findIndex(item2 => {
              return item2.parameterName.trim() === item1.paramName.trim();
            });
            return foundIndex === -1;
          });
          const additionalParams = additionalParameters.map(obj => {
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
              workspaceId: null
            };
            return newObj;
          });
          this.appIntegrationService.sharedAdditionalScriptParams(additionalParams);
        }
        this.processExecutables = process?.scriptList;
        // this.appIntegrationService.sharedScriptParams(this.processExecutables);
        this.shareScriptParameter(this.processExecutables, this.propertiesDetails, this.isProperties);
        if (propertiesDetails) {
          this.setProcessScriptParams(propertiesDetails);
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

  /*================ Set Process Script Parameters ================*/
  setProcessScriptParams(propertiesDetails: any) {
    const executables = [];
    const scriptParamsList = [];
    let additionalParameters = [];

    propertiesDetails?.associatedProcess?.scriptList.forEach((s) => {
      if (s?.scriptParameterDataList?.length) {
        s?.scriptParameterDataList.forEach((sp) => {
          sp.value = null;
        });
      }
    });
    if (propertiesDetails?.associatedProcess?.scriptList?.length) {
      propertiesDetails?.associatedProcess?.scriptList.forEach((x) => {
        if (x?.scriptParameterDataList?.length && propertiesDetails?.associatedProcess?.paramsData?.length) {

          x?.scriptParameterDataList.forEach(s => {
            scriptParamsList.push(s);
          });

          propertiesDetails?.associatedProcess?.paramsData.forEach((z) => {
            x?.scriptParameterDataList.forEach((e) => {
              if (z?.paramName.trim() === e?.parameterName.trim()) {
                if (e?.securityLevel.toLowerCase() === 'high' && z?.securityLevel.toLowerCase() === 'low') {
                  z.value = this.encryptDecryptService.encrypt(z?.value);
                } else if (e?.securityLevel.toLowerCase() === 'medium' && z?.securityLevel.toLowerCase() === 'low') {
                  z.value = this.encryptDecryptService.encrypt(z?.value);
                } else if (e?.securityLevel.toLowerCase() === 'low' && z?.securityLevel.toLowerCase() === 'medium') {
                  z.value = this.encryptDecryptService.decrypt(z?.value);
                }
                e.value = z?.value;
                //e.value = (z?.securityLevel === 'medium' || z?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(z?.value) : z?.value;
              }
            });
          });
        }
        executables.push(x);
      });

      /*---- Code For Additional Parameters Get Additional Paraeters ----*/
      if (propertiesDetails?.associatedProcess?.paramsData?.length) {
        additionalParameters = propertiesDetails?.associatedProcess?.paramsData?.filter(item1 => {
          const foundIndex = scriptParamsList.findIndex(item2 => {
            return item2.parameterName.trim() === item1.paramName.trim();
          });
          return foundIndex === -1;
        });

        const additionalParams = additionalParameters.map(obj => {
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
            workspaceId: null
          };
          return newObj;
        });
        this.appIntegrationService.sharedAdditionalScriptParams(additionalParams);
      }

      this.processExecutables = executables;
      // this.appIntegrationService.sharedScriptParams(this.processExecutables);
      this.shareScriptParameter(this.processExecutables, this.propertiesDetails, this.isProperties);
    }
  }

  shareScriptParameter(exe: any, propertiesDetails: any, isProperties: boolean) {
    const clonedScriptList = JSON.parse(JSON.stringify(this.deployedProcessInfo?.scriptList || []));
    const exeScriptData = JSON.parse(JSON.stringify(exe || []));
    if (clonedScriptList?.length) {
      clonedScriptList.forEach((script) => {
        if (exeScriptData?.length) {
          exeScriptData.forEach((scriptData) => {
            if (Number(script?.executableRef) === Number(scriptData?.executableRef)) {
              if (script?.scriptParameterDataList?.length) {
                script?.scriptParameterDataList.forEach((parameter) => {
                  parameter.isProcessParam = true;
                  if (Array.isArray(scriptData?.scriptParameterDataList)) {
                    scriptData?.scriptParameterDataList.forEach((parameterData) => {
                      // if (Number(parameter.id) === Number(parameterData.id)) {
                      //   parameter.value = parameterData.value; // Update the value
                      // }

                      if (parameter.parameterName.trim() === parameterData.parameterName.trim()) {
                        parameter.value = parameterData.value; // Update the value
                      }
                    });
                  }
                });
              }
            }
          });
        }
      });
    }

    const obj = {
      isProperties: isProperties,
      //selectedExecutables: exe,
      selectedExecutables: clonedScriptList,
      propertiesDetails: propertiesDetails
    };
    this.appIntegrationService.sharedScriptParams(obj);
  }

  addProcess() {
    this.getRootItemInfo = this.appIntegrationService.getRootItemInfo(this.workspaceId, 'process').subscribe((res) => {
      if (res) {
        this.validateUserAccess(res, true, [], (accessRes) => {
          if (accessRes?.hasAccess) {
            const dialogRef = this.dialog.open(AppIntAddEditProcessComponent, {
              // width: '1200px',
              // maxHeight: '1100px',
              maxWidth: '95vw',
              maxHeight: '95vh',
              height: '95%',
              width: '95%',
              panelClass: 'full-screen-modal',
              data: {
                workspaceId: this.workspaceId,
                itemType: 'process',
                belongToFolder: res?.rootFolderId,
                isCreateProcessFromIntegration: true,
                isProcessUpdateFromIntegration: false
              }
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result?.isCreate) {
                this.appIntegrationDataService.clearConnectedProcessToInt();
                this.getConnectedNewProcess(this.workspaceId, null, Number(result?.response?.processId));
                this.getConnectedProcessInfo(Number(result?.response?.processId), null);
              } else {
                // this.getProcessById(this.processForm.get('connectedProcess').value, this.propertiesDetails);
              }
            });

          } else {
            this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: `User does not have access of ${res.name} folder.` });

          }

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

  validateUserAccess(itemData: any, validateRootAccess: boolean, selectedProcess: any, callback: (res: any) => void) {
    const userAccessValidationDto: UserAccessValidationDto = {
      userName: this.currentUser.userName,
      workspaceId: this.workspaceId.toString(),
      itemType: itemData?.type ? itemData?.type : 'process',
      itemId: selectedProcess?.id ? selectedProcess?.id : '',
      validateRootAccess: validateRootAccess,
      parentId: itemData?.rootFolderId ? itemData?.rootFolderId : selectedProcess?.belongsToFolder
    }
    this.getValidateAccessSub = this.appIntegrationService.getValidateAccess(userAccessValidationDto).subscribe((res) => {
      if (res) {
        callback(res);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });

  }

  viewProperties() {
    // this.processForm.markAllAsTouched();
    this.validateConnectedProcess();
    // if (this.processForm?.valid) {
    if (this.selectedProcessId) {
      const selectedProcess = this.connectedProcess.find(process => process.id === this.selectedProcessId);
      this.validateUserAccess([], false, selectedProcess, (accessRes) => {
        if (accessRes?.hasAccess) {
          const processId = this.selectedProcessId;
          this.getProcessByIdSub = this.appIntegrationService.getDeployedProcessById(processId).subscribe((res) => {
            const dialogRef = this.dialog.open(AppIntProcessPropertiesComponent, {
              maxWidth: '95vw',
              maxHeight: '95vh',
              height: '95%',
              width: '95%',
              panelClass: 'full-screen-modal',
              data: {
                workspaceId: this.workspaceId,
                itemType: 'process',
                belongToFolder: res?.belongsToFolder,
                isCreatePIT: false,
                itemId: res?.id,
                itemDetails: res,
                isCreateProcessFromIntegration: false,
                isProcessUpdateFromIntegration: true
              }
            });
            dialogRef.afterClosed().subscribe((result) => {
              this.getProcessById(this.selectedProcessId, this.propertiesDetails);
              if (result) {
              }
            });
          }, (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // handle client side error here
            } else {
              // handle server side error here
            }
          });
        } else {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: `User does not have access of ${selectedProcess?.name} process.` });

        }
      });

    }
  }

  /*=========== Validation for Next Step ===========*/
  // validateStepTwo() {
  //   this.processForm.markAllAsTouched();
  //   this.logValidationErrors();
  //   if (this.processForm?.valid) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  validateStepTwo() {
    let isStepTwoValidated = false;
    if (this.selectedProcessId) {
      isStepTwoValidated = true;
    } else {
      isStepTwoValidated = false;
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Integration does not have process connected. Add an Process to continue.' });

    }
    return isStepTwoValidated;
  }
  /*=========== END Validation for Next Step ===========*/

  // ...existing code...

  validateStepTwoWithError(): { errors: string[]; isValid: boolean } {
    const errors: string[] = [];

    if (!this.selectedProcessId) {
      errors.push('Integration does not have process connected. Add an Process to continue.');
    }

    if (errors.length) {
      return { errors: errors, isValid: false };
    }

    return { errors: [], isValid: true };
  }

  // ...existing code...

  /*=========== Get Selected Process Information ===========*/
  getSelectedProcessInfo() {
    //this.processForm.markAllAsTouched();
    this.validateConnectedProcess();
    if (this.selectedProcessId) {
      // const processInfo = this.processForm.getRawValue();
      const processInfo = this.selectedProcessId;
      let selectedProcess = null;
      if (this.connectedProcess?.length) {
        selectedProcess = this.connectedProcess.find(obj => Number(obj.id) === Number(processInfo));
        if (Number(selectedProcess?.id) === Number(this.deployedProcessInfo?.id)) {
          selectedProcess.scriptList = this.deployedProcessInfo?.scriptList;
        }
      }
      return this.deleteUnwantedProperties(selectedProcess);
    } else {
      return false;
    }
  }

  deleteUnwantedProperties(process: any) {
    if (process?.scriptList?.length) {
      process?.scriptList.forEach((x) => {
        if (x?.scriptParameterDataList?.length) {
          x?.scriptParameterDataList.forEach((p) => {
            delete p?.currentParameterObj;
          });
        }
      });
    }
    return process;
  }
  /*=========== END Get Selected Process Information ===========*/

  ngOnDestroy(): void {
    this.connectedProcessesSub.unsubscribe();
    this.getProcessByIdSub.unsubscribe();
    this.getRootItemInfo.unsubscribe();
    this.getValidateAccessSub.unsubscribe();
  }

}
