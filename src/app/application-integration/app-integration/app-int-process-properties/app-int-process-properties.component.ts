import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { AppIntegrationService } from '../app-integration.service';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { PropertiesGeneralComponent } from '../app-int-properties/properties-general/properties-general.component';
import { PropertiesProcessComponent } from '../app-int-properties/properties-process/properties-process.component';
import { PropertiesProcessExecutablesComponent } from '../app-int-properties/properties-process-executables/properties-process-executables.component';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/components/constants';
import { PropertiesParametersComponent } from '../app-int-properties/properties-parameters/properties-parameters.component';
import { PropertiesNetUserComponent } from '../app-int-properties/properties-net-user/properties-net-user.component';
import { PropertiesVersionInfoComponent } from '../app-int-properties/properties-version-info/properties-version-info.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AppIntAddNoteComponent } from '../app-int-add-note/app-int-add-note.component';
import { TeisItemDto } from '../appintegration';

@Component({
  selector: 'app-app-int-process-properties',
  templateUrl: './app-int-process-properties.component.html',
  styleUrls: ['./app-int-process-properties.component.scss']
})
export class AppIntProcessPropertiesComponent implements OnInit, OnDestroy {
  navbarOpen: boolean = false;
  isGetPITLock: boolean = false;
  isCancelPITLock: boolean = false;
  isBreakPITLock: boolean = false;
  isBreakPITLockPermission: boolean = false;
  isCreatePIT: boolean = false;
  itemDetails: any = null;
  propertiesDetails: any = null;
  currentUser: any = null;
  currentTabName: string = null;
  isVersionDetailsShowed: boolean = false;

  @ViewChild(PropertiesGeneralComponent) private propertiesGeneralComponent: PropertiesGeneralComponent;
  @ViewChild(PropertiesProcessComponent) private propertiesProcessComponent: PropertiesProcessComponent;
  @ViewChild(PropertiesProcessExecutablesComponent) private propertiesProcessExecutablesComponent: PropertiesProcessExecutablesComponent;
  @ViewChild(PropertiesParametersComponent) private propertiesParameterComponent: PropertiesParametersComponent;
  @ViewChild(PropertiesNetUserComponent) private propertiesNetUserComponent: PropertiesNetUserComponent;
  @ViewChild(PropertiesVersionInfoComponent) private propertiesVersionInfoComponent: PropertiesVersionInfoComponent;

  getItemDetailsSub = Subscription.EMPTY;
  getPITLockSub = Subscription.EMPTY;
  cancelPITLockSub = Subscription.EMPTY;
  breakPITLockSub = Subscription.EMPTY;
  updateProcessPropertiesSub = Subscription.EMPTY;
  getProcessDetailsSub = Subscription.EMPTY;
  getProcessWorkingCopySub = Subscription.EMPTY;
  getScriptDeployStatusSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AppIntProcessPropertiesComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
    if (localStorage.getItem(Constants?.BREAK_PIT_LOCK)) {
      this.isBreakPITLockPermission = true;
    } else {
      this.isBreakPITLockPermission = false;
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.propertiesGeneralComponent?.getAllLogMaintenanceConfig();
      this.propertiesGeneralComponent?.onChangeLogLevel('INFO');
      if (this.dialogData?.workspaceId) {
        this.propertiesGeneralComponent?.getAlertProcesses(this.dialogData?.workspaceId);
      }
      this.propertiesGeneralComponent?.getSEGroups();
      this.propertiesGeneralComponent?.getQueueGroups();
      this.propertiesProcessExecutablesComponent.getExecutables(this.dialogData?.itemDetails, true);

      const itemProperties = this.dialogData?.itemDetails;
      if (itemProperties?.locked && (Number(this.currentUser?.id) === Number(itemProperties?.lockedUserId))) {
        if (this.dialogData?.itemType === 'process') {
          this.getProcessWorkingCopy();
        }
      } else {
        this.getApiData(itemProperties);
      }
    }, 0);
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  getPITLock() {
    this.getPITLockSub = this.appIntegrationService.getPITLock(this.dialogData?.workspaceId, this.dialogData?.itemId, this.dialogData?.itemType).subscribe((res) => {
      this.isGetPITLock = res;
      this.isCancelPITLock = !res;
      this.dialogData.itemDetails.locked = this.isGetPITLock;
      if (this.dialogData?.itemType === 'process') {
        this.getProcessWorkingCopy();
        this.propertiesProcessExecutablesComponent.getPITLock(this.isGetPITLock);
      }
      this.propertiesGeneralComponent.getPITLock(this.isGetPITLock);
      this.propertiesParameterComponent.getPITLock(this.isGetPITLock);
      this.propertiesNetUserComponent.getPITLock(this.isGetPITLock);
      this.propertiesVersionInfoComponent.getPITLock(this.isGetPITLock);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  cancelPITLock() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `Are you sure you want to cancel lock?. <br/> Any changes, not saved will be lost, and process will be restored to its latest version.`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cancelLock();
        if (this.dialogData?.itemType === 'process') {
          this.getDeployedProcessDetails();
        }
      }
    });
  }

  cancelLock() {
    this.cancelPITLockSub = this.appIntegrationService.cancelPITLock(this.dialogData?.workspaceId, this.dialogData?.itemId, this.dialogData?.itemType).subscribe((res) => {
      if (res) {
        this.isGetPITLock = !res;
        this.isCancelPITLock = res;
        this.propertiesDetails.locked = this.isGetPITLock;
        this.propertiesGeneralComponent.getPITLock(this.isGetPITLock);
        this.propertiesParameterComponent.getPITLock(this.isGetPITLock);
        this.propertiesNetUserComponent.getPITLock(this.isGetPITLock);
        this.propertiesVersionInfoComponent.getPITLock(this.isGetPITLock);
        if (this.dialogData?.itemType === 'process') {
          this.propertiesProcessExecutablesComponent.getPITLock(this.isGetPITLock);
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

  breakPITLock() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `${this.propertiesDetails?.name} is locked by ${this.propertiesDetails?.lockedUserName}. <br/> Are you sure you want to break lock?`
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakPITLockSub = this.appIntegrationService.breakPITLock(this.dialogData?.workspaceId, this.dialogData?.itemId, this.dialogData?.itemType).subscribe(res => {
          this.isGetPITLock = res;
          this.isCancelPITLock = !res;
          this.isBreakPITLock = !res;
          this.propertiesGeneralComponent.getPITLock(this.isGetPITLock);
          this.propertiesProcessExecutablesComponent.getPITLock(this.isGetPITLock);
          this.propertiesParameterComponent.getPITLock(this.isGetPITLock);
          this.propertiesNetUserComponent.getPITLock(this.isGetPITLock);
          this.propertiesVersionInfoComponent.getPITLock(this.isGetPITLock);
          if (this.dialogData?.itemType === 'process') {
            // Showing working copy after break lock as per QA team requirement
            this.getProcessWorkingCopy();
            this.propertiesProcessExecutablesComponent.getPITLock(this.isGetPITLock);
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

  onChangeTab(tabName: string) {
    this.currentTabName = tabName;
    // this.propertiesParameterComponent.storeCurrentParamsData();
    if (tabName === 'GENERAL') {

    }
    if (tabName === 'PROCESS') {

    }
    if (tabName === 'EXECUTABLES') {

    }
    if (tabName === 'IDENTIFIERS') {

    }
    if (tabName === 'PARAMETERS') {
      this.propertiesDetails.locked = this.isGetPITLock;
      // this.propertiesParameterComponent.getScriptParameters(this.propertiesDetails);
    }
    if (tabName === 'NET_USER') {
      this.propertiesNetUserComponent.checkAlertProcessFlag();
      this.propertiesNetUserComponent.getExecutables(true);
    }
    if (tabName === 'CONFIGURE') {

    }
    if (tabName === 'IDENTIFIERMETHODS') {

    }
    if (tabName === 'ACTIVATOR') {

    }
    if (tabName === 'ALARM_INFO') {

    }
    if (tabName === 'VERSION_INFO') {

    }
    if (tabName === 'BUSINESS_FLOW') {

    }
  }

  getApiData(propertiesDetails: any) {
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.propertiesDetails = propertiesDetails;
    if (this.propertiesDetails) {
      if (this.propertiesDetails?.locked && (Number(this.currentUser?.id) === Number(this.propertiesDetails?.lockedUserId))) {
        this.isGetPITLock = this.propertiesDetails?.locked;
        this.isCancelPITLock = !this.propertiesDetails?.locked;
      } else if (this.propertiesDetails?.locked && (Number(this.currentUser?.id) !== Number(this.propertiesDetails?.lockedUserId)) && !this.isBreakPITLockPermission) {
        this.isGetPITLock = false;
        this.isCancelPITLock = false;
        this.isBreakPITLock = false;
      } else if (this.propertiesDetails?.locked && (Number(this.currentUser?.id) !== Number(this.propertiesDetails?.lockedUserId)) && this.isBreakPITLockPermission) {
        this.isBreakPITLock = true;
      } else {
        this.isGetPITLock = false;
        this.isCancelPITLock = true;
        this.isBreakPITLock = false;
      }
      this.propertiesGeneralComponent.setFormValues(this.propertiesDetails);
      this.propertiesProcessExecutablesComponent.setExecutables(this.propertiesDetails, true);
      // this.propertiesParameterComponent.getScriptParameters(this.propertiesDetails, true);
      this.propertiesNetUserComponent.setNetUsers(this.propertiesDetails, true);
      this.appIntegrationService.sharedAlertProcessFlag(this.propertiesDetails?.alertProcess);
      this.propertiesNetUserComponent.checkAlertProcessFlag();
      this.propertiesVersionInfoComponent.getVersionHistory(this.propertiesDetails);
    }
  }

  getDeployedProcessDetails() {
    this.getProcessDetailsSub = this.appIntegrationService.getDeployedProcessById(Number(this.dialogData?.itemId)).subscribe((res) => {
      if (res) {
        this.getApiData(res);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getProcessWorkingCopy() {
    this.getProcessWorkingCopySub = this.appIntegrationService.getProcessWorkingCopyById(Number(this.dialogData?.itemId)).subscribe(res => {
      if (res) {
        this.getApiData(res);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  isVersionDeployedOrRestore(actionObj: any) {
    if (actionObj?.isDeployed && !this.isGetPITLock) {
      if (this.dialogData?.itemType === 'process') {
        this.getDeployedProcessDetails();
      }
    }
    if (actionObj?.isRestore) {
      // this.getProcessWorkingCopy();
      this.getApiData(actionObj?.restoreInfo);
    }
  }

  isVersionHistoryDetailsShowed(isVersionDetailsShowed: boolean) {
    this.isVersionDetailsShowed = isVersionDetailsShowed;
  }

  getValidateStepOne() {
    return this.propertiesGeneralComponent?.validateStepOne();
  }

  getValidateStepTwo() {
    if (this.dialogData?.itemType === 'process') {
      return this.propertiesProcessExecutablesComponent?.validateProcessExeStepTwo();
    } else {
      return true;
    }
  }

  updateProperties(isRelease: boolean, isReleaseAndDeploy: boolean, isSave: boolean) {
    if (this.dialogData?.itemType === 'process') {
      this.updateProcessProperties(isRelease, isReleaseAndDeploy, isSave);
    }
  }

  /*=========== Update Process Properties ===========*/
  updateProcessProperties(isRelease: boolean, isReleaseAndDeploy: boolean, isSave: boolean) {
    const existingPropertiesDetails = this.propertiesDetails;
    const generalInfo = this.propertiesGeneralComponent.getGenernalInfo();
    const processExecutables = this.propertiesProcessExecutablesComponent.getProcessExecutablesData();
    const parameters = this.propertiesParameterComponent.getParametersData();
    const netUsersMapping = this.propertiesNetUserComponent.getNetUsersData();
    const updateProcessDto: TeisItemDto = {
      alertProcess: generalInfo?.isAlertProcess,
      defaultAlert: generalInfo?.isDefaultAlert,
      name: generalInfo?.name ? generalInfo?.name.trim() : generalInfo?.name,
      id: this.propertiesDetails?.id,
      createAndDeploy: existingPropertiesDetails?.createAndDeploy,
      description: generalInfo?.description ? generalInfo?.description.trim() : generalInfo?.description,
      disabled: generalInfo?.isDisableItem,
      updateTaskList: existingPropertiesDetails?.updateTaskList,
      enableAlert: generalInfo?.isEnableAlert,
      alertProcessId: generalInfo?.alertProcess,
      alertProcessName: generalInfo?.alertProcessName,
      scriptEngineGroup: generalInfo?.scriptEngineGroup,
      scriptEngine: existingPropertiesDetails?.scriptEngine,
      queue: generalInfo?.queue,
      netUsersDto: existingPropertiesDetails?.netUsersDto,
      netUserMapping: netUsersMapping,
      oldFileName: existingPropertiesDetails?.oldFileName,
      logMaintenanceId: generalInfo?.logMaintenance,
      alertId: existingPropertiesDetails?.alertId,
      alertEnabled: generalInfo?.isEnableAlert,
      scheduled: existingPropertiesDetails?.scheduled,
      modified: existingPropertiesDetails?.modified,
      deployed: existingPropertiesDetails?.deployed,
      folder: existingPropertiesDetails?.folder,
      type: existingPropertiesDetails?.type,
      folderDataList: [],
      workspaceId: this.dialogData?.workspaceId,
      autoStart: existingPropertiesDetails?.autoStart,
      interactiveMode: existingPropertiesDetails?.interactiveMode,
      showDebugMsg: existingPropertiesDetails?.showDebugMsg,
      disable: generalInfo?.isDisableItem,
      logLevel: generalInfo?.logLevel,
      priority: generalInfo?.queue,
      iconId: existingPropertiesDetails?.iconId,
      belongsToFolder: this.dialogData?.belongToFolder,
      deleted: existingPropertiesDetails?.deleted,
      scriptEngineKey: existingPropertiesDetails?.scriptEngineKey,
      imageIconName: existingPropertiesDetails?.imageIconName,
      failedTaskCount: existingPropertiesDetails?.failedTaskCount,
      initiateTaskCount: existingPropertiesDetails?.initiateTaskCount,
      processingTaskCount: existingPropertiesDetails?.processingTaskCount,
      processingErrorTaskCount: existingPropertiesDetails?.processingErrorTaskCount,
      lastUpdated: existingPropertiesDetails?.lastUpdated,
      updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      versionCount: existingPropertiesDetails?.versionCount,
      deployedVersion: existingPropertiesDetails?.deployedVersion,
      versionNumber: generalInfo?.versionNumber,
      thisDeployedVersion: existingPropertiesDetails?.thisDeployedVersion,
      disabledSchedulerOrAlarm: existingPropertiesDetails?.disabledSchedulerOrAlarm,
      releasePressed: existingPropertiesDetails?.releasePressed,
      paramsData: parameters,
      scriptList: processExecutables,
      scripts: processExecutables,
      teisFolders: existingPropertiesDetails?.teisFolders,
      releaseOnly: isRelease,
      releaseAndDeploy: isReleaseAndDeploy,
      saveOnly: isSave,
    };

    if (isReleaseAndDeploy) {
      const processExecutablesIds = processExecutables.map(item => item.id);

      this.getScriptDeployStatusSub = this.appIntegrationService.getScriptDeployStatus(processExecutablesIds).subscribe((res) => {
        const hasDeployedFalse = res.some(script => script.deployed === false);

        if (hasDeployedFalse) {
          const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '700px',
            maxHeight: '600px',
            data: `Error in process deploy. One or more connected executables are not deployed. Click Ok to continue with release of the process, Cancel to cancel the release and deploy operation.`
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.releaseAndDeployedProcess(updateProcessDto);
            }
          });
        } else {
          this.releaseAndDeployedProcess(updateProcessDto);
        }
      });
    }
    else if (isRelease) {
      this.releaseAndDeployedProcess(updateProcessDto);
    } else {
      this.updateProcessPropertiesSub = this.appIntegrationService.updateProcess(updateProcessDto).subscribe(res => {
        this.propertiesProcessExecutablesComponent.resetSearch();
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  /*=========== Release and Deploy Process ===========*/
  releaseAndDeployedProcess(updateProcessDto) {
    const dialogRef = this.dialog.open(AppIntAddNoteComponent, {
      width: "700px",
      maxHeight: "600px",
      data: {
        isValidationAdd: false,
        isSelectAll: true,
        isServiceLog: true,
        multipleSelection: true,
        note: '',
        taskStatus: 'Failed'
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        updateProcessDto.note = result?.newNote;
        this.updateProcessPropertiesSub = this.appIntegrationService.updateProcess(updateProcessDto).subscribe(res => {
          this.cancelLock();
          this.getDeployedProcessDetails();
          this.propertiesProcessExecutablesComponent.resetSearch();
          this.appIntegrationService.sharedAdditionalScriptParams([]);
          this.appIntegrationDataService.clearCurrentParamsData();
          this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
          // this.appIntegrationDataService.clearProcessExecutables();
          this.appIntegrationDataService.clearNetUsersExecutables();
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

  /*=============== On Cancelled =============*/
  onCancelled(): void {
    const obj = {
      isCreate: false,
      response: null
    };
    this.dialogRef.close(obj);
  }
  /*=============== END On Cancelled =============*/

  ngOnDestroy(): void {
    this.getScriptDeployStatusSub.unsubscribe();

  }

}
