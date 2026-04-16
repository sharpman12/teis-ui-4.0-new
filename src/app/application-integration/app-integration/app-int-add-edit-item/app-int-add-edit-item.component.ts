import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { HeaderService } from 'src/app/core/service/header.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { AppIntegrationService } from '../app-integration.service';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { MatStepper, StepperOrientation } from '@angular/material/stepper';
import { PropertiesGeneralComponent } from '../app-int-properties/properties-general/properties-general.component';
import { ActivatedRoute } from '@angular/router';
import { PropertiesProcessComponent } from '../app-int-properties/properties-process/properties-process.component';
import { PropertiesIdentifiersComponent } from '../app-int-properties/properties-identifiers/properties-identifiers.component';
import { PropertiesParametersComponent } from '../app-int-properties/properties-parameters/properties-parameters.component';
import { PropertiesNetUserComponent } from '../app-int-properties/properties-net-user/properties-net-user.component';
import { PropertiesProcessExecutablesComponent } from '../app-int-properties/properties-process-executables/properties-process-executables.component';
import { DeployUndeployItemsDto, IdentifierDto, TeisItemDto } from '../appintegration';
import { Observable, Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Location } from '@angular/common';
import { MessageService } from 'primeng/api';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Constants } from 'src/app/shared/components/constants';
import { PropertiesAlarmInfoComponent } from '../app-int-properties/properties-alarm-info/properties-alarm-info.component';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { PropertiesTriggerConfigureComponent } from '../app-int-properties/properties-trigger-configure/properties-trigger-configure.component';
import { PropertiesTriggerIdentifiersComponent } from '../app-int-properties/properties-trigger-identifiers/properties-trigger-identifiers.component';
import { PropertiesTriggerActivatorsComponent } from '../app-int-properties/properties-trigger-activators/properties-trigger-activators.component';

@Component({
  selector: 'app-app-int-add-edit-item',
  templateUrl: './app-int-add-edit-item.component.html',
  styleUrls: ['./app-int-add-edit-item.component.scss']
})
export class AppIntAddEditItemComponent implements OnInit, OnDestroy {
  scrWidth: number;
  itemType: string = null;
  isCreatePIT: boolean = false;
  selectedWorkspaceId: number;
  belongsToFolderId: number;
  stepperOrientation: Observable<StepperOrientation>;
  currentUser: any;
  isAlarmPopupOpenFlag: boolean = false;
  isIdentifierSelect: boolean = false;
  isConfigOpened:  boolean = false;
  alarmPopupServiceSub = Subscription.EMPTY;
  getScriptDeployStatusSub = Subscription.EMPTY;

  @ViewChild('addItemStepper') private addItemStepper: MatStepper;
  @ViewChild(PropertiesGeneralComponent) private createItemGeneralComponent: PropertiesGeneralComponent;
  @ViewChild(PropertiesProcessComponent) private createItemProcessComponent: PropertiesProcessComponent;
  @ViewChild(PropertiesProcessExecutablesComponent) private createProcessExecutablesComponent: PropertiesProcessExecutablesComponent;
  @ViewChild(PropertiesIdentifiersComponent) private createItemIdentifiersComponent: PropertiesIdentifiersComponent;
  @ViewChild(PropertiesParametersComponent) private createItemParameterComponent: PropertiesParametersComponent;
  @ViewChild(PropertiesNetUserComponent) private createItemNetUserComponent: PropertiesNetUserComponent;
  @ViewChild(PropertiesTriggerConfigureComponent) private createItemTriggerConfigureComponent: PropertiesTriggerConfigureComponent;
  @ViewChild(PropertiesTriggerIdentifiersComponent) private createItemTriggerIdentifiersComponent: PropertiesTriggerIdentifiersComponent;
  @ViewChild(PropertiesTriggerActivatorsComponent) private createItemTriggerActivatorsComponent: PropertiesTriggerActivatorsComponent;
  @ViewChild(PropertiesAlarmInfoComponent) private createAlarmComponent: PropertiesAlarmInfoComponent;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  createProcessSub = Subscription.EMPTY;
  createIntegrationSub = Subscription.EMPTY;
  createTriggerSub = Subscription.EMPTY;
  getProcessByIdSub = Subscription.EMPTY;
  deployProcessSub = Subscription.EMPTY;

  constructor(
    public dialog: MatDialog,
    private header: HeaderService,
    public sharedService: SharedService,
    public breadcrumb: BreadCrumbService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.getScreenSize();
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
    this.activatedRoute.params.subscribe(params => {
      if (params?.workspaceId) {
        this.itemType = params?.itemType;
        this.isCreatePIT = params?.isCreatePIT;
        this.selectedWorkspaceId = Number(params?.workspaceId);
        this.belongsToFolderId = Number(params?.belongsToFolderId);
      }
    });
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.alarmPopupServiceSub = this.appIntegrationService.isAlarmPopupOpen.subscribe((res) => {
      this.isAlarmPopupOpenFlag = res;
    });
    this.appIntegrationService.isIdentifierSelect.subscribe((res) => {
      this.isIdentifierSelect = res;
    });
    this.appIntegrationService.isConfigOpened.subscribe((res) => {
      this.isConfigOpened = res;
    });
    this.header.show(); // show hide header
    if (localStorage.getItem('source')) {
      this.breadcrumb.visible = true;
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    // this.breadcrumb.hide();
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearProcessExecutables();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.appIntegrationDataService.clearNetUsersExecutables();

    this.sharedService.isChangeBgColor.next(true);

    this.createItemGeneralComponent?.getAllLogMaintenanceConfig();
    this.createItemGeneralComponent?.onChangeLogLevel('INFO');
    if (this.selectedWorkspaceId) {
      this.createItemGeneralComponent?.getAlertProcesses(this.selectedWorkspaceId);
    }
    this.createItemGeneralComponent?.getSEGroups();
    this.createItemGeneralComponent?.getQueueGroups();
  }

  async onNextClick() {
    const canProceed = await this.getValidateStepOne();
    if (canProceed) {
      this.nextStep();
    }
  }

  /*=========== Next Step ===========*/
  nextStep() {
    this.addItemStepper.next();
    if (Number(this.addItemStepper.selectedIndex) === 0) {

    }
    if (Number(this.addItemStepper.selectedIndex) === 1) {
      if (this.selectedWorkspaceId) {
        if (this.itemType === 'integration') {
          this.createItemProcessComponent.getConnectedProcess(this.selectedWorkspaceId, null);
        }
        if (this.itemType === 'process' || this.itemType === 'trigger') {
          this.createProcessExecutablesComponent.getExecutables();
        }
      }
    }

    if (Number(this.addItemStepper.selectedIndex) === 2) {
      if (this.itemType === 'integration') {
        this.createItemIdentifiersComponent.getIdentifiers();
      }
      if (this.itemType === 'process' || this.itemType === 'trigger') {
        // this.createItemParameterComponent.getScriptParameters();
      }
    }
    if (Number(this.addItemStepper.selectedIndex) === 3) {
      if (this.itemType === 'integration') {
        // this.createItemParameterComponent.getScriptParameters();
      }
      if (this.itemType === 'process' || this.itemType === 'trigger') {
        this.createItemNetUserComponent.getExecutables();
        this.createItemNetUserComponent.checkAlertProcessFlag();
      }
    }
    if (Number(this.addItemStepper.selectedIndex) === 4) {
      if (this.itemType === 'integration') {
        this.createItemNetUserComponent.getExecutables();
      }
      if (this.itemType === 'trigger') {
        // this.createItemTriggerConfigureComponent.getTriggerScriptParameters();
      }
    }
    if (Number(this.addItemStepper.selectedIndex) === 5) {
      if (this.itemType === 'integration') {
        this.createAlarmComponent.getLastYear();
        this.createAlarmComponent.getAlertProcesses();
      }
      if (this.itemType === 'trigger') {
        this.createItemTriggerIdentifiersComponent.getIdentifiersMethods();
      }
    }
    if (Number(this.addItemStepper.selectedIndex) === 6) {
      if (this.itemType === 'trigger') {
        // this.createItemTriggerIdentifiersComponent.sharedIdentifier();
        // this.createItemTriggerActivatorsComponent.getIdentifiersMethods();
      }
    }
  }
  /*=========== END Next Step ===========*/

  /*=========== Previous Step ===========*/
  previousStep() {
    this.addItemStepper.previous();
    if (Number(this.addItemStepper.selectedIndex) === 0) {

    }
    if (Number(this.addItemStepper.selectedIndex) === 1) {
      if (this.itemType === 'process' || this.itemType === 'trigger') {
        this.createItemParameterComponent.storeCurrentParamsData();
      }
    }
    if (Number(this.addItemStepper.selectedIndex) === 2) {
      if (this.itemType === 'integration') {
        this.createItemParameterComponent.storeCurrentParamsData();
      }
    }
    if (Number(this.addItemStepper.selectedIndex) === 3) {
      if (this.itemType === 'trigger') {
        this.createItemTriggerConfigureComponent.storeCurrentConfigParamsData();
      }
    }
  }
  /*=========== End Previous Step ===========*/

  /*=========== On Chancel ===========*/
  onCancel() {
    this.addItemStepper.selectedIndex = 0;
    this.createItemGeneralComponent.resetGenralInfoForm();
    if (this.itemType === 'process' || this.itemType === 'trigger') {
      this.createProcessExecutablesComponent.resetProcessExe();
      this.createProcessExecutablesComponent.resetSearch();
    }
    if (this.itemType === 'integration') {
      this.createItemProcessComponent.refreshConnectedProcess();
      this.createItemIdentifiersComponent.onCancel();
      this.createAlarmComponent.onCancel();
      this.appIntegrationService.sharedIdentifierSelected(false);
    }
    if (this.itemType === 'trigger') {
      this.createItemTriggerConfigureComponent.resetConfigure();
      this.createItemTriggerIdentifiersComponent.resetIdentifiers();
      this.createItemTriggerActivatorsComponent.resetActivators();
      this.createAlarmComponent.onCancel();
      this.appIntegrationService.sharedConfigPending(false);
    }
    this.createItemParameterComponent.resetParameters();
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.appIntegrationDataService.clearNetUsersExecutables();
    this.appIntegrationService.sharedScriptParams([]);
    this.createItemNetUserComponent.resetNetUsers();
    this.location.back();
  }
  /*=========== END On Chancel ===========*/

  /*============ Validate Steps ============*/
  async getValidateStepOne() {
    return await this.createItemGeneralComponent?.validateStepOne();
  }

  getValidateIntegrationStepTwo() {
    return this.createItemProcessComponent?.validateStepTwo();
  }

  getValidateIdentifier() {
     if (this.isIdentifierSelect) {
      this.messageService.add({ key: 'appIntInfoKey', severity: 'info', summary: '', detail: `Identifier configuration is in pending state. Add identifier to continue.` });
      return false;
    } else {
      return true;
    }
  }

   getValidateConfigure() {
     if (this.isConfigOpened) {
      this.messageService.add({ key: 'appIntInfoKey', severity: 'info', summary: '', detail: `Trigger configuration is in pending state. Add Configure to continue.` });
      return false;
    } else {
      return true;
    }
  }

  getValidateProcessStepTwo() {
    return this.createProcessExecutablesComponent?.validateProcessExeStepTwo();
  }

  getValidateParameters() {
    return this.createItemParameterComponent.validateParameters();
  }
  /*============ END Validate Steps ============*/

  /*============ Create Process ============*/
  createProcess(isCreateAndDeploy: boolean) {
    const processExecutables = this.createProcessExecutablesComponent.getProcessExecutablesData();
    if (isCreateAndDeploy) {
      const processExecutablesIds = processExecutables.map(item => item.id);
      this.getScriptDeployStatusSub = this.appIntegrationService.getScriptDeployStatus(processExecutablesIds).subscribe((res) => {
        const hasDeployedFalse = res.some(script => script.deployed === false);
        if (hasDeployedFalse) {
          const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '700px',
            maxHeight: '600px',
            data: `Error in process deploy. One or more connected executables are not deployed. Click Ok to continue with create of the process , Cancel to cancel the create and deploy operation `
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.createAndDeployProcess(isCreateAndDeploy);
            }
          });
        } else {
          this.createAndDeployProcess(isCreateAndDeploy);
        }
      });
    } else {
      this.createAndDeployProcess(isCreateAndDeploy);
    }
  }
  /*============ END Create Process ============*/

  /*============ Create And Deploy Process ============*/
  createAndDeployProcess(isCreateAndDeploy: boolean) {
    const generalInfo = this.createItemGeneralComponent.getGenernalInfo();
    const processExecutables = this.createProcessExecutablesComponent.getProcessExecutablesData();
    const parameters = this.createItemParameterComponent.getParametersData();
    const netUsersMapping = this.createItemNetUserComponent.getNetUsersData();

    const createProcessDto: TeisItemDto = {
      alertProcess: generalInfo?.isAlertProcess,
      defaultAlert: generalInfo?.isDefaultAlert,
      name: generalInfo?.name.trim(),
      id: null,
      createAndDeploy: isCreateAndDeploy,
      description: generalInfo?.description ? generalInfo?.description.trim() : generalInfo?.description,
      disabled: generalInfo?.isDisableItem,
      updateTaskList: generalInfo?.isEnableActivationLogsOnly,
      enableAlert: generalInfo?.isEnableAlert,
      alertProcessId: generalInfo?.alertProcess,
      alertProcessName: generalInfo?.alertProcessName,
      scriptEngineGroup: generalInfo?.scriptEngineGroup,
      scriptEngine: '',
      queue: generalInfo?.queue,
      netUsersDto: [],
      netUserMapping: netUsersMapping,
      oldFileName: '',
      logMaintenanceId: generalInfo?.logMaintenance,
      alertId: '',
      alertEnabled: generalInfo?.isEnableAlert,
      scheduled: false,
      modified: false,
      deployed: false,
      folder: false,
      type: '',
      folderDataList: [],
      workspaceId: this.selectedWorkspaceId,
      autoStart: false,
      interactiveMode: false,
      showDebugMsg: false,
      disable: generalInfo?.isDisableItem,
      logLevel: generalInfo?.logLevel,
      priority: generalInfo?.queue,
      iconId: null,
      belongsToFolder: this.belongsToFolderId,
      deleted: false,
      scriptEngineKey: '',
      imageIconName: '',
      failedTaskCount: null,
      initiateTaskCount: null,
      processingTaskCount: null,
      processingErrorTaskCount: null,
      lastUpdated: '',
      updatedBy: '',
      versionCount: null,
      deployedVersion: null,
      versionNumber: generalInfo?.version,
      thisDeployedVersion: false,
      disabledSchedulerOrAlarm: false,
      releasePressed: false,
      paramsData: parameters,
      scriptList: processExecutables,
      scripts: processExecutables,
      teisFolders: null
    };

    this.createProcessSub = this.appIntegrationService.createProcess(createProcessDto).subscribe(res => {
      if (res) {
        this.appIntegrationService.sharedCreatedUpdatedPITItem({ isCreated: true, itemId: res?.processId });
        if (isCreateAndDeploy) {
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Process created and deployed successfully!' });
        } else {
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Process created successfully!' });
        }
        this.appIntegrationService.sharedAdditionalScriptParams([]);
      }
      this.appIntegrationDataService.clearCurrentParamsData();
      this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
      // this.appIntegrationDataService.clearProcessExecutables();
      this.appIntegrationDataService.clearNetUsersExecutables();
      this.appIntegrationDataService.clearProcessItemTree();
      this.location.back();
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });

  }
  /*============ End Create And Deploy Process ============*/

  formatNumber(num: number) {
    return num.toString().padStart(2, '0');
  }

  /*============ Create Or Create & Deploy Integration ============*/
  createAndDeployIntegration(isCreateAndDeploy: boolean) {
    this.handleAlarmPopupAndAction(isCreateAndDeploy, () => {
      const process = this.createItemProcessComponent.getSelectedProcessInfo();
      this.getProcessByIdSub = this.appIntegrationService.getDeployedProcessById(process?.id).subscribe((res) => {
        if (res?.deployed) {
          this.createIntegration(isCreateAndDeploy);
        } else {
          if (!res?.deployed && res?.locked) {
            this.messageService.add({ key: 'appIntInfoKey', severity: 'info', summary: '', detail: `Error in deploy Integration, connected process ${process?.name} is not deployed and locked by ${res?.lockedUserName}.` });
          } else {
            const dialogRef = this.dialog.open(ConfirmationComponent, {
              width: '700px',
              maxHeight: '600px',
              data: `Error in deploy Integration, connected process ${process?.name} is not deployed. <br/> Click OK to deploy the connected process with the integration, Cancel to cancel the create and deploy operation.`
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                const deployItemsDto: DeployUndeployItemsDto = {
                  workspaceId: this.selectedWorkspaceId,
                  deploymentDetails: [
                    {
                      teisItemID: res?.id,
                      teisItemType: "Process",
                      teisVersionNumber: res?.deployedVersion > 0 ? res?.deployedVersion : res?.versionNumber
                    },
                  ],
                };
                this.deployProcessSub = this.appIntegrationService.deployItems(deployItemsDto, "Process", res?.id, 'PROCESS').subscribe((res) => {
                  if (res) {
                    this.createIntegration(isCreateAndDeploy);
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
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    })
  }

  /*============ Create New Integration ============*/
  createNewIntegration(isCreateAndDeploy: boolean) {
    this.handleAlarmPopupAndAction(isCreateAndDeploy, () => {
      this.createIntegration(isCreateAndDeploy);
    });
  }

  createIntegration(isCreateAndDeploy: boolean) {
    const generalInfo = this.createItemGeneralComponent.getGenernalInfo();
    const process = this.createItemProcessComponent.getSelectedProcessInfo();
    const identifiers = this.createItemIdentifiersComponent.getSelectedIdentifiers();
    const parameters = this.createItemParameterComponent.getParametersData();
    const netUsersMapping = this.createItemNetUserComponent.getNetUsersData();
    const schedulerList = this.appIntegrationDataService.getSchedulers();

    const clonedSchedulerList = JSON.parse(JSON.stringify(schedulerList));

    if (clonedSchedulerList?.length) {
      clonedSchedulerList.forEach((x) => {
        x.id = null;
        const startD = new Date(x?.startDate);
        const endD = x?.endDate === '*' ? '*' : new Date(x?.endDate);
        x.startDate = `${this.formatNumber(startD.getDate())}.${this.formatNumber(startD.getMonth() + 1)}.${this.formatNumber(startD.getFullYear())}`;
        x.endDate = endD === '*' ? endD : `${this.formatNumber(endD.getDate())}.${this.formatNumber(endD.getMonth() + 1)}.${this.formatNumber(endD.getFullYear())}`;
        x.disable = x?.isEventDisabled ? x?.isEventDisabled : false;
        delete x?.localDto;
        delete x?.isNew;
        delete x?.alarmDisable;
        delete x?.alarmDisable;
        delete x?.isEventDisabled;
      });
    }

    const createIntegrationDto: TeisItemDto = {
      alarmList: [],
      // defaultAlert: generalInfo?.isDefaultAlert,
      name: generalInfo?.name ? generalInfo?.name.trim() : generalInfo?.name,
      id: null,
      processId: process?.id,
      identifierIdList: null,
      note: null,
      locked: false,
      lockedDate: null,
      lockedUserId: null,
      lockedUserName: null,
      identifiers: identifiers,
      createAndDeploy: isCreateAndDeploy,
      description: generalInfo?.description,
      disabled: generalInfo?.isDisableItem,
      updateTaskList: generalInfo?.isEnableActivationLogsOnly,
      enableAlert: generalInfo?.isEnableAlert,
      alertProcessId: generalInfo?.alertProcess,
      alertProcessName: generalInfo?.alertProcessName,
      associatedProcess: process,
      scriptEngineGroup: generalInfo?.scriptEngineGroup,
      scriptEngine: null,
      queue: generalInfo?.queue,
      releaseAndDeploy: false,
      releaseOnly: false,
      saveOnly: false,
      netUsersDto: null,
      netUserMapping: netUsersMapping,
      oldFileName: null,
      logMaintenanceId: generalInfo?.logMaintenance,
      alertId: null,
      alertEnabled: generalInfo?.isEnableAlert,
      scheduled: false,
      schedulerList: clonedSchedulerList,
      modified: false,
      deployed: false,
      folder: false,
      type: null,
      folderDataList: null,
      workspaceId: this.selectedWorkspaceId,
      autoStart: false,
      interactiveMode: false,
      showDebugMsg: false,
      disable: generalInfo?.isDisableItem,
      logLevel: generalInfo?.logLevel,
      priority: generalInfo?.queue,
      processComponentId: null,
      iconId: null,
      belongsToFolder: this.belongsToFolderId,
      businessFlowDatas: null,
      deleted: false,
      scriptEngineKey: null,
      imageIconName: '',
      failedTaskCount: null,
      initiateTaskCount: null,
      processingTaskCount: null,
      processingErrorTaskCount: null,
      lastUpdated: null,
      updatedBy: this.currentUser?.userName,
      version: null,
      versionCount: null,
      deployedVersion: null,
      versionNumber: null,
      thisDeployedVersion: false,
      disabledSchedulerOrAlarm: false,
      releasePressed: false,
      paramsData: parameters,
      scriptList: [],
      scripts: [],
      teisFolders: null
    };

    this.createIntegrationSub = this.appIntegrationService.createIntegration(createIntegrationDto).subscribe((res) => {
      if (res) {
        this.appIntegrationService.sharedCreatedUpdatedPITItem({ isCreated: true, itemId: res?.integrationId });
        if (isCreateAndDeploy) {
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Integration created and deployed successfully!' });
        } else {
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Integration created successfully!' });
        }
        this.appIntegrationService.sharedScriptParams([]);
        this.appIntegrationService.sharedAdditionalScriptParams([]);
      }
      this.appIntegrationDataService.clearCurrentParamsData();
      this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
      // this.appIntegrationDataService.clearProcessExecutables();
      this.appIntegrationDataService.clearNetUsersExecutables();
      this.appIntegrationDataService.clearSchedulers();
      this.appIntegrationDataService.clearProcessParamsData();
      this.appIntegrationDataService.clearIntegrationItemTree();
      this.location.back();
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============ END Create Integration ============*/

  /*============ Create New Trigger ============*/
  createNewTrigger(isCreateAndDeploy: boolean) {
    this.handleAlarmPopupAndAction(isCreateAndDeploy, () => {
      this.createTrigger(isCreateAndDeploy);
    });
  }

  /*============ Create Trigger ============*/
  createTrigger(isCreateAndDeploy: boolean) {
    const generalInfo = this.createItemGeneralComponent.getGenernalInfo();
    const processExecutables = this.createProcessExecutablesComponent.getProcessExecutablesData();
    const parameters = this.createItemParameterComponent.getParametersData();
    const netUsersMapping = this.createItemNetUserComponent.getNetUsersData();
    const configure = this.createItemTriggerConfigureComponent.getConfigStr();
    const identifiersIntegrations = this.createItemTriggerIdentifiersComponent.getSelectedIdentifiersMethods();
    const triggerActivator = this.createItemTriggerActivatorsComponent.getSelectedIdentifiersIntegrations();
    const schedulerList = this.appIntegrationDataService.getSchedulers();

    const clonedSchedulerList = JSON.parse(JSON.stringify(schedulerList));
    if (clonedSchedulerList?.length) {
      clonedSchedulerList.forEach((x) => {
        x.id = null;
        const startD = new Date(x?.startDate);
        const endD = x?.endDate === '*' ? '*' : new Date(x?.endDate);

        x.startDate = `${this.formatNumber(startD.getDate())}.${this.formatNumber(startD.getMonth() + 1)}.${this.formatNumber(startD.getFullYear())}`;

        x.endDate = endD === '*' ? endD : `${this.formatNumber(endD.getDate())}.${this.formatNumber(endD.getMonth() + 1)}.${this.formatNumber(endD.getFullYear())}`;

        x.disable = x?.isEventDisabled ? x?.isEventDisabled : false;

        delete x?.localDto;
        delete x?.isNew;
        delete x?.alarmDisable;
        delete x?.isEventDisabled;
      });
    }

    const createTriggerDto: TeisItemDto = {
      activatorDataList: triggerActivator?.activatorDataList,
      activatorEnabled: triggerActivator?.activatorEnabled,
      configData: configure,
      configDataList: null,
      configParameterList: null,
      identifierMethodList: null,
      infoFilePath: null,
      taskRepeatFrequency: null,
      taskToBeRepeated: null,
      name: generalInfo?.name ? generalInfo?.name.trim() : generalInfo?.name,
      id: null,
      identifierIdList: null,
      note: null,
      locked: null,
      lockedDate: null,
      lockedUserId: null,
      lockedUserName: null,
      identifiers: identifiersIntegrations,
      createAndDeploy: isCreateAndDeploy,
      description: generalInfo?.description,
      disabled: generalInfo?.isDisableItem,
      updateTaskList: generalInfo?.isEnableActivationLogsOnly,
      enableAlert: generalInfo?.isEnableAlert,
      alertProcessId: generalInfo?.alertProcess,
      alertProcessName: generalInfo?.alertProcessName,
      scriptEngineGroup: generalInfo?.scriptEngineGroup,
      scriptEngine: null,
      queue: generalInfo?.queue,
      releaseAndDeploy: false,
      releaseOnly: false,
      saveOnly: false,
      netUsersDto: null,
      netUserMapping: netUsersMapping,
      oldFileName: null,
      logMaintenanceId: generalInfo?.logMaintenance,
      alertId: null,
      alertEnabled: generalInfo?.isEnableAlert,
      scheduled: false,
      schedulerList: clonedSchedulerList,
      modified: false,
      deployed: false,
      folder: false,
      type: null,
      folderDataList: null,
      workspaceId: this.selectedWorkspaceId,
      autoStart: false,
      interactiveMode: false,
      showDebugMsg: false,
      disable: generalInfo?.isDisableItem,
      logLevel: generalInfo?.logLevel,
      priority: generalInfo?.queue,
      iconId: null,
      belongsToFolder: this.belongsToFolderId,
      deleted: false,
      scriptEngineKey: null,
      imageIconName: '',
      failedTaskCount: null,
      initiateTaskCount: null,
      processingTaskCount: null,
      processingErrorTaskCount: null,
      lastUpdated: "",
      updatedBy: this.currentUser?.userName,
      version: null,
      versionCount: null,
      deployedVersion: null,
      versionNumber: null,
      thisDeployedVersion: false,
      disabledSchedulerOrAlarm: false,
      releasePressed: false,
      paramsData: parameters,
      scriptList: processExecutables,
      scripts: processExecutables,
      teisFolders: null,
    };

    this.createTriggerSub = this.appIntegrationService.createTrigger(createTriggerDto).subscribe((res) => {
      if (res) {
        this.appIntegrationService.sharedCreatedUpdatedPITItem({ isCreated: true, itemId: res?.triggerId });
        if (isCreateAndDeploy) {
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Trigger created and deployed successfully!' });
        } else {
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Trigger created successfully!' });
        }
        this.appIntegrationService.sharedAdditionalScriptParams([]);
        this.appIntegrationService.sharedIdentifiersMethods(null);
      }
      this.appIntegrationDataService.clearCurrentParamsData();
      this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
      // this.appIntegrationDataService.clearProcessExecutables();
      this.appIntegrationDataService.clearNetUsersExecutables();
      this.appIntegrationDataService.clearSchedulers();
      this.appIntegrationDataService.clearTriggerItemTree();
      //this.appIntegrationDataService.clearSelectedTriggerItem();
      this.location.back();
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============ Create and deploy Trigger ============*/

  createAndDeployTrigger(isCreateAndDeploy: boolean) {
    this.handleAlarmPopupAndAction(isCreateAndDeploy, () => {
      const processExecutables = this.createProcessExecutablesComponent.getProcessExecutablesData();
      const processExecutablesIds = processExecutables.map(item => item.id);
      this.getScriptDeployStatusSub = this.appIntegrationService.getScriptDeployStatus(processExecutablesIds).subscribe((res) => {
        const hasDeployedFalse = res.some(script => script.deployed === false);
        if (hasDeployedFalse) {
          const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '700px',
            maxHeight: '600px',
            data: `Error in Trigger deploy. One or more connected executables are not deployed. Click Ok to continue with create of the Trigger, Cancel to cancel the create and deploy operation.`
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.createTrigger(isCreateAndDeploy);
            }
          });

        } else {
          this.createTrigger(isCreateAndDeploy);
        }

      });
    });
  }

  handleAlarmPopupAndAction(isCreateAndDeploy:boolean, onConfirmed: () => void) {
    if (this.isAlarmPopupOpenFlag) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '700px',
        maxHeight: '600px',
        panelClass: 'myapp-alarm-popup-dialog',
        data: `${this.itemType === 'integration' ? 'Alarm' : 'Scheduler'} configuration is in pending state. Click Ok to continue with the ${isCreateAndDeploy ? 'create and deploy' : 'create'} or Cancel to stay and finish updating the pending configuration.?`
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          onConfirmed();
        }
      });
    } else {
      onConfirmed();
    }
  }

  ngOnDestroy(): void {
    this.createProcessSub.unsubscribe();
    this.createIntegrationSub.unsubscribe();
    this.createTriggerSub.unsubscribe();
    this.appIntegrationService.sendReturnFromOtherPageFlag(true);
    this.alarmPopupServiceSub.unsubscribe();
    this.getScriptDeployStatusSub.unsubscribe();
  }

}
