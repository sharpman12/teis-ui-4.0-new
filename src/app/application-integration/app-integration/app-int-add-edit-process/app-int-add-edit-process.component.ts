import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatStepper } from '@angular/material/stepper';
import { PropertiesGeneralComponent } from '../app-int-properties/properties-general/properties-general.component';
import { PropertiesProcessComponent } from '../app-int-properties/properties-process/properties-process.component';
import { AppIntegrationService } from '../app-integration.service';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { PropertiesProcessExecutablesComponent } from '../app-int-properties/properties-process-executables/properties-process-executables.component';
import { PropertiesParametersComponent } from '../app-int-properties/properties-parameters/properties-parameters.component';
import { PropertiesNetUserComponent } from '../app-int-properties/properties-net-user/properties-net-user.component';
import { TeisItemDto } from '../appintegration';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';


@Component({
  selector: 'app-app-int-add-edit-process',
  templateUrl: './app-int-add-edit-process.component.html',
  styleUrls: ['./app-int-add-edit-process.component.scss']
})
export class AppIntAddEditProcessComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('addProcessStepper') private addProcessStepper: MatStepper;
  @ViewChild(PropertiesGeneralComponent) private createItemGeneralComponent: PropertiesGeneralComponent;
  @ViewChild(PropertiesProcessComponent) private createItemProcessComponent: PropertiesProcessComponent;
  @ViewChild(PropertiesProcessExecutablesComponent) private createProcessExecutablesComponent: PropertiesProcessExecutablesComponent;
  @ViewChild(PropertiesParametersComponent) private createItemParameterComponent: PropertiesParametersComponent;
  @ViewChild(PropertiesNetUserComponent) private createItemNetUserComponent: PropertiesNetUserComponent;

  createProcessSub = Subscription.EMPTY;
  getScriptDeployStatusSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AppIntAddEditProcessComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createItemGeneralComponent?.getAllLogMaintenanceConfig();
      this.createItemGeneralComponent?.onChangeLogLevel('INFO');
      if (this.dialogData?.workspaceId) {
        this.createItemGeneralComponent?.getAlertProcesses(this.dialogData?.workspaceId);
      }
      this.createItemGeneralComponent?.getSEGroups();
      this.createItemGeneralComponent?.getQueueGroups();
    }, 0);
  }

  /*=========== Next Step ===========*/
  nextStep() {
    this.addProcessStepper.next();
    if (Number(this.addProcessStepper.selectedIndex) === 0) {

    }
    if (Number(this.addProcessStepper.selectedIndex) === 1) {
      if (this.dialogData?.workspaceId) {
        if (this.dialogData?.itemType === 'process') {
          this.createProcessExecutablesComponent.getExecutables();
        }
      }
    }

    if (Number(this.addProcessStepper.selectedIndex) === 2) {
      if (this.dialogData?.itemType === 'process') {

      }
    }
    if (Number(this.addProcessStepper.selectedIndex) === 3) {
      if (this.dialogData?.itemType === 'process') {
        this.createItemNetUserComponent.getExecutables();
        this.createItemNetUserComponent.checkAlertProcessFlag();
      }
    }
  }
  /*=========== END Next Step ===========*/

  /*=========== Previous Step ===========*/
  previousStep() {
    this.addProcessStepper.previous();
    if (Number(this.addProcessStepper.selectedIndex) === 0) {

    }
    if (Number(this.addProcessStepper.selectedIndex) === 1) {
      if (this.dialogData?.itemType === 'process') {
        this.createItemParameterComponent.storeCurrentParamsData();
      }
    }
    if (Number(this.addProcessStepper.selectedIndex) === 2) {

    }
    if (Number(this.addProcessStepper.selectedIndex) === 3) {

    }
  }
  /*=========== End Previous Step ===========*/

  /*============ Validate Steps ============*/
  getValidateStepOne() {
    return this.createItemGeneralComponent?.validateStepOne();
  }

  getValidateIntegrationStepTwo() {
    return this.createItemProcessComponent?.validateStepTwo();
  }

  getValidateProcessStepTwo() {
    return this.createProcessExecutablesComponent?.validateProcessExeStepTwo();
  }
  /*============ END Validate Steps ============*/

  /*============ Create Process From Integration ===========*/
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

  /*============ Create and deploy Process From Integration ===========*/
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
      description: generalInfo?.description.trim(),
      disabled: generalInfo?.isDisableItem,
      updateTaskList: false,
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
      workspaceId: this.dialogData?.workspaceId,
      autoStart: false,
      interactiveMode: false,
      showDebugMsg: false,
      disable: generalInfo?.isDisableItem,
      logLevel: generalInfo?.logLevel,
      priority: generalInfo?.queue,
      iconId: null,
      belongsToFolder: this.dialogData?.belongToFolder,
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
        this.appIntegrationDataService.clearCurrentParamsData();
        this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
       // this.appIntegrationDataService.clearProcessExecutables();
        this.appIntegrationDataService.clearNetUsersExecutables();
        const obj = {
          isCreate: true,
          response: res
        };
        this.dialogRef.close(obj);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=============== On Cancelled =============*/
  onCancelled(): void {
    this.appIntegrationDataService.clearProcessExecutables();
    const obj = {
      isCreate: false,
      response: null
    };
    this.dialogRef.close(obj);
  }
  /*=============== END On Cancelled =============*/

  /*=========== On Chancel ===========*/
  onCancelCreateProcess() {
    this.addProcessStepper.selectedIndex = 0;
    this.createItemGeneralComponent.resetGenralInfoForm();
    if (this.dialogData?.itemType === 'process') {
      this.createProcessExecutablesComponent.resetProcessExe();
    }
    this.createItemParameterComponent.resetParameters();
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.appIntegrationDataService.clearNetUsersExecutables();
    this.appIntegrationService.sharedScriptParams([]);
    this.createItemNetUserComponent.resetNetUsers();
  }
  /*=========== END On Chancel ===========*/

  ngOnDestroy(): void {
    this.createProcessSub.unsubscribe();
    this.getScriptDeployStatusSub.unsubscribe();
  }

}
