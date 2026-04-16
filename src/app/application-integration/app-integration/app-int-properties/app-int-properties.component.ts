import { Component, OnDestroy, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AppIntegrationService } from '../app-integration.service';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PropertiesGeneralComponent } from './properties-general/properties-general.component';
import { PropertiesIdentifiersComponent } from './properties-identifiers/properties-identifiers.component';
import { PropertiesNetUserComponent } from './properties-net-user/properties-net-user.component';
import { PropertiesParametersComponent } from './properties-parameters/properties-parameters.component';
import { PropertiesProcessExecutablesComponent } from './properties-process-executables/properties-process-executables.component';
import { PropertiesProcessComponent } from './properties-process/properties-process.component';
import { PropertiesBusinessFlowComponent } from './properties-business-flow/properties-business-flow.component';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { PropertiesVersionInfoComponent } from './properties-version-info/properties-version-info.component';
import { Constants } from 'src/app/shared/components/constants';
import { DeployUndeployItemsDto, TeisItemDto, ManualAutoDeployDto } from '../appintegration';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { AppIntAddNoteComponent } from '../app-int-add-note/app-int-add-note.component';
import { AppIntManualAutoDeployComponent } from '../app-int-manual-auto-deploy/app-int-manual-auto-deploy.component';
import { PropertiesAlarmInfoComponent } from './properties-alarm-info/properties-alarm-info.component';
import { PropertiesTriggerConfigureComponent } from './properties-trigger-configure/properties-trigger-configure.component';
import { PropertiesTriggerIdentifiersComponent } from './properties-trigger-identifiers/properties-trigger-identifiers.component';
import { PropertiesTriggerActivatorsComponent } from './properties-trigger-activators/properties-trigger-activators.component';
import { PropertiesWebServiceParametersComponent } from './properties-web-service-parameters/properties-web-service-parameters.component';

@Component({
  selector: 'app-app-int-properties',
  templateUrl: './app-int-properties.component.html',
  styleUrls: ['./app-int-properties.component.scss']
})
export class AppIntPropertiesComponent implements OnInit, OnDestroy {
  itemType: string = null;
  selectedWorkspaceId: number = null;
  belongsToFolderId: number = null;
  itemId: number = null;
  navbarOpen: boolean = false;
  isCreatePIT: boolean = false;
  itemDetails: any = null;
  isGetPITLock: boolean = false;
  isCancelPITLock: boolean = false;
  isBreakPITLockPermission: boolean = false;
  isBreakPITLock: boolean = false;
  propertiesDetails: any = null;
  currentUser: any;
  currentTabName: string = null;
  isVersionDetailsShowed: boolean = false;
  isAlarmPopupOpenFlag: boolean = false;
  isIdentifierSelect: boolean = false;
  isConfigOpened: boolean = false;
  isScrolled: boolean = false;

  getItemDetailsSub = Subscription.EMPTY;
  getPITLockSub = Subscription.EMPTY;
  cancelPITLockSub = Subscription.EMPTY;
  breakPITLockSub = Subscription.EMPTY;
  updateProcessPropertiesSub = Subscription.EMPTY;
  updateIntegrationPropertiesSub = Subscription.EMPTY;
  deleteIntegrationVersionSub = Subscription.EMPTY;
  updateTriggerPropertiesSub = Subscription.EMPTY;
  getProcessDetailsSub = Subscription.EMPTY;
  getIntegrationDetailsSub = Subscription.EMPTY;
  getTriggerDetailsSub = Subscription.EMPTY;
  getProcessWorkingCopySub = Subscription.EMPTY;
  getIntegrationWorkingCopySub = Subscription.EMPTY;
  getTriggerWorkingCopySub = Subscription.EMPTY;
  allWebServicesSub = Subscription.EMPTY;
  getProcessByIdSub = Subscription.EMPTY;
  deployProcessSub = Subscription.EMPTY;
  updateWebServiceSub = Subscription.EMPTY;
  alarmPopupServiceSub = Subscription.EMPTY;
  getLatestVersionSub = Subscription.EMPTY;
  getScriptDeployStatusSub = Subscription.EMPTY;
  manualAutoDeployItemsSub = Subscription.EMPTY;

  @ViewChild(PropertiesGeneralComponent) private propertiesGeneralComponent: PropertiesGeneralComponent;
  @ViewChild(PropertiesProcessComponent) private propertiesProcessComponent: PropertiesProcessComponent;
  @ViewChild(PropertiesBusinessFlowComponent) private PropertiesBusinessFlowComponent: PropertiesBusinessFlowComponent;
  @ViewChild(PropertiesProcessExecutablesComponent) private propertiesProcessExecutablesComponent: PropertiesProcessExecutablesComponent;
  @ViewChild(PropertiesIdentifiersComponent) private propertiesIdentifiersComponent: PropertiesIdentifiersComponent;
  @ViewChild(PropertiesParametersComponent) private propertiesParameterComponent: PropertiesParametersComponent;
  @ViewChild(PropertiesWebServiceParametersComponent) private propertiesWebServiceParametersComponent: PropertiesWebServiceParametersComponent;
  @ViewChild(PropertiesNetUserComponent) private propertiesNetUserComponent: PropertiesNetUserComponent;
  @ViewChild(PropertiesVersionInfoComponent) private propertiesVersionInfoComponent: PropertiesVersionInfoComponent;
  @ViewChild(PropertiesAlarmInfoComponent) private propertiesAlarmInfoComponent: PropertiesAlarmInfoComponent;
  @ViewChild(PropertiesProcessComponent) private propertiesItemProcessComponent: PropertiesProcessComponent;
  @ViewChild(PropertiesIdentifiersComponent) private propertiesItemIdentifiersComponent: PropertiesIdentifiersComponent;
  @ViewChild(PropertiesTriggerConfigureComponent) private propertiesTriggerConfigureComponent: PropertiesTriggerConfigureComponent;
  @ViewChild(PropertiesTriggerIdentifiersComponent) private propertiesTriggerIdentifiersComponent: PropertiesTriggerIdentifiersComponent;
  @ViewChild(PropertiesTriggerActivatorsComponent) private propertiesTriggerActivatorsComponent: PropertiesTriggerActivatorsComponent;


  constructor(
    public router: Router,
    public dialog: MatDialog,
    private header: HeaderService,
    public sharedService: SharedService,
    public breadcrumb: BreadCrumbService,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService,
    private renderer: Renderer2
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
    if (localStorage.getItem(Constants?.BREAK_PIT_LOCK)) {
      this.isBreakPITLockPermission = true;
    } else {
      this.isBreakPITLockPermission = false;
    }
    this.activatedRoute.params.subscribe(params => {
      if (params?.workspaceId) {
        this.itemType = params?.itemType;
        this.isCreatePIT = JSON.parse(params?.isCreatePIT);
        this.selectedWorkspaceId = Number(params?.workspaceId);
        this.belongsToFolderId = Number(params?.belongsToFolderId);
        this.itemId = Number(params?.itemId);
      }
    });
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

    this.sharedService.isChangeBgColor.next(true);
    this.propertiesGeneralComponent.getAllLogMaintenanceConfig();
    if (this.itemType !== 'webservice') {
      this.propertiesGeneralComponent.getAlertProcesses(this.selectedWorkspaceId);
      this.propertiesGeneralComponent.getSEGroups();
      this.propertiesGeneralComponent.getQueueGroups();
      // this.propertiesProcessComponent.getConnectedProcess(this.selectedWorkspaceId);

      // this.propertiesIdentifiersComponent.getIdentifiers();
    }
    const itemProperties = this.activatedRoute.snapshot.data.propertiesDetails;
    if (this.itemType === 'integration') {
      this.propertiesIdentifiersComponent.getIdentifiers();
      if (itemProperties?.deployed) {
        this.appIntegrationDataService.storeDeployedIntAssociatedProcess(itemProperties?.associatedProcess);
      }
    }
    if (this.itemType === 'process') {
      if (itemProperties?.deployed) {
        this.appIntegrationDataService.storeDeployedProcessExecutable(itemProperties?.scriptList);
      }

    }
    if (itemProperties?.locked && (Number(this.currentUser?.id) === Number(itemProperties?.lockedUserId))) {
      if (this.itemType === 'process') {
        this.getProcessWorkingCopy();
      }
      if (this.itemType === 'integration') {
        this.getIntegrationWorkingCopy();
      }
      if (this.itemType === 'trigger') {
        this.getTriggerWorkingCopy();
      }
      if (this.itemType === 'webservice') {
        this.getWebServiceTree();
      }
    } else {
      if (this.itemType === 'webservice') {
        this.propertiesTriggerIdentifiersComponent.getIdentifiersMethods(this.propertiesDetails);
        if (itemProperties?.appRegistry?.length) {
          itemProperties?.appRegistry.forEach((x) => {
            x.versionNumber = x?.version;
            if (Number(x?.id) === Number(this.itemId)) {
              this.getApiData(x);
            }
          });
        }
      } else {
        this.getApiData(itemProperties);
      }
    }
  }

  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.isScrolled = this.currentTabName === 'PARAMETERS' ? target.scrollTop > 10 : false;
  }

  isVersionDeployedOrRestore(actionObj: any) {
    if (actionObj?.isDeployed && !this.isGetPITLock) {
      if (this.itemType === 'process') {
        this.getDeployedProcessDetails();
      }
      if (this.itemType === 'integration') {
        this.getDeployedIntegrationDetails();
      }
    }
    if (actionObj?.isRestore) {
      actionObj.restoreInfo.deployed = this.propertiesDetails?.deployed;
      // this.getProcessWorkingCopy();
      this.getApiData(actionObj?.restoreInfo);
    }
  }

  isVersionHistoryDetailsShowed(isVersionDetailsShowed: boolean) {
    this.isVersionDetailsShowed = isVersionDetailsShowed;
  }

  backToVersionList() {
    this.propertiesVersionInfoComponent.getVersionInfo(null);
  }

  /*============ Get Deployed Process Details After Deployed Version ============*/
  getDeployedProcessDetails() {
    this.getProcessDetailsSub = this.appIntegrationService.getDeployedProcessById(Number(this.itemId)).subscribe((res) => {
      if (res) {
        if (res?.deployed) {
          this.appIntegrationDataService.storeDeployedProcessExecutable(res?.scriptList);
        }

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
  /*============ END Get Deployed Process Details After Deployed Version ============*/

  /*============ Get Deployed Integration Details After Deployed Version ============*/
  getDeployedIntegrationDetails() {
    this.getIntegrationDetailsSub = this.appIntegrationService.getDeployedIntegrationById(Number(this.itemId)).subscribe((res) => {
      this.appIntegrationDataService.storeDeployedIntAssociatedProcess(res?.associatedProcess);
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

  /*============ Get Deployed Trigger Details After Deployed Version ============*/
  getDeployedTriggerDetails() {
    this.getTriggerDetailsSub = this.appIntegrationService.getDeployedTriggerById(Number(this.itemId)).subscribe((res) => {
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

  getApiData(propertiesDetails: any) {
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.propertiesDetails = propertiesDetails;
    if (this.itemType === 'process' || this.itemType === 'trigger') {
      this.propertiesProcessExecutablesComponent.getExecutables(this.propertiesDetails, true);
    }
    if (this.itemType === 'integration') {
      this.propertiesProcessComponent.getConnectedProcess(this.selectedWorkspaceId, this.propertiesDetails);
    }
    if (this.itemType === 'trigger') {
      this.propertiesTriggerIdentifiersComponent.getIdentifiersMethods(this.propertiesDetails);
      // this.appIntegrationService.sharedIdentifiersMethods(this.propertiesDetails?.identifiers);
      // const obj = {
      //   propertiesDetails: propertiesDetails,
      //   identifiers: propertiesDetails?.identifiers
      // };
      // this.appIntegrationService.sharedIdentifiersMethods(obj);
    }
    if (this.itemType === 'webservice') {
      // this.propertiesTriggerIdentifiersComponent.getIdentifiersMethods(this.propertiesDetails);
    }
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
      if (this.itemType === 'integration') {
        this.propertiesProcessComponent.getSelectedProcessId(this.propertiesDetails);
        // this.propertiesProcessComponent.setProcessScriptParams(this.propertiesDetails);
        this.propertiesIdentifiersComponent.getIdentifierStrings(this.propertiesDetails);
        this.propertiesAlarmInfoComponent.getAlarmLists(this.propertiesDetails);
        this.PropertiesBusinessFlowComponent.getBusinessFlow(this.propertiesDetails);
        this.PropertiesBusinessFlowComponent.setFormValues(this.propertiesDetails);

      }
      if (this.itemType === 'process' || this.itemType === 'trigger') {
        this.propertiesProcessExecutablesComponent.setExecutables(this.propertiesDetails);
      }
      if (this.itemType === 'trigger') {
        // this.propertiesTriggerConfigureComponent.getTriggerScriptParameters(this.propertiesDetails);
        this.propertiesTriggerConfigureComponent.setTriggerConfiguration(this.propertiesDetails);
        this.propertiesTriggerIdentifiersComponent.setIdentifierMethods(this.propertiesDetails);
        // this.propertiesTriggerActivatorsComponent.getIdentifiersMethods(this.propertiesDetails);
        this.propertiesAlarmInfoComponent.getAlarmLists(this.propertiesDetails);
      }
      if (this.itemType !== 'webservice') {
        // this.propertiesParameterComponent.getScriptParameters(this.propertiesDetails);
        this.propertiesNetUserComponent.setNetUsers(this.propertiesDetails);
        this.appIntegrationService.sharedAlertProcessFlag(this.propertiesDetails?.alertProcess);
        this.propertiesNetUserComponent.checkAlertProcessFlag();
        this.propertiesVersionInfoComponent.getVersionHistory(this.propertiesDetails);
      }
      if (this.itemType === 'webservice') {
        this.propertiesWebServiceParametersComponent.setScriptParams(this.propertiesDetails);
        this.propertiesTriggerIdentifiersComponent.setIdentifierMethods(this.propertiesDetails);
      }
    }
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  scrollToTop() {
    const container = document.querySelector('.flow-filter') as HTMLElement;
    if (container) {
      container.scrollTo({
        top: 0
      });
    }
  }

  onChangeTab(tabName: string) {
    this.currentTabName = tabName;
    this.scrollToTop();

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
      //this.propertiesProcessComponent.setProcessScriptParams(this.propertiesDetails);
      //this.propertiesParameterComponent.getScriptParameters(this.propertiesDetails);
    }
    if (tabName === 'NET_USER') {
      this.propertiesNetUserComponent.checkAlertProcessFlag();
      this.propertiesNetUserComponent.getExecutables(true);
    }
    if (tabName === 'CONFIGURE') {
      // this.propertiesTriggerConfigureComponent.getTriggerScriptParameters(this.propertiesDetails);
    }
    if (tabName === 'IDENTIFIERMETHODS') {

    }
    if (tabName === 'ACTIVATOR') {
      // this.propertiesTriggerIdentifiersComponent.sharedIdentifier();
      // this.propertiesTriggerActivatorsComponent.getIdentifiersMethods(this.propertiesDetails);
    }
    if (tabName === 'ALARM_INFO') {

    }
    if (tabName === 'VERSION_INFO') {
      // this.propertiesDetails.locked = this.isGetPITLock;
      // this.propertiesVersionInfoComponent.getVersionHistory(this.propertiesDetails);
    }
    if (tabName === 'BUSINESS_FLOW') {

    }
  }

  /*=========== Get PIT Lock ===========*/
  getPITLock() {
    this.getPITLockSub = this.appIntegrationService.getPITLock(this.selectedWorkspaceId, this.itemId, this.itemType).subscribe((res) => {
      this.isGetPITLock = res;
      this.isCancelPITLock = !res;
      this.propertiesDetails.locked = this.isGetPITLock;
      if (this.itemType === 'process') {
        this.getProcessWorkingCopy();
        this.propertiesProcessExecutablesComponent.getPITLock(this.isGetPITLock);
      }
      if (this.itemType === 'integration') {
        this.getIntegrationWorkingCopy();
        this.propertiesProcessComponent.getPITLock(this.isGetPITLock);
        this.propertiesIdentifiersComponent.getPITLock(this.isGetPITLock);
        this.propertiesAlarmInfoComponent.getPITLock(this.isGetPITLock);
        this.PropertiesBusinessFlowComponent.getPITLock(this.isGetPITLock);
      }
      if (this.itemType === 'trigger') {
        this.getTriggerWorkingCopy();
        this.propertiesTriggerConfigureComponent.getPITLock(this.isGetPITLock);
        this.propertiesTriggerIdentifiersComponent.getPITLock(this.isGetPITLock);
        this.propertiesTriggerActivatorsComponent.getPITLock(this.isGetPITLock);
      }
      if (this.itemType === 'webservice') {
        this.getWebServiceTree();
        this.propertiesWebServiceParametersComponent.getPITLock(this.isGetPITLock);
        this.propertiesTriggerIdentifiersComponent.getPITLock(this.isGetPITLock);
      }
      this.propertiesGeneralComponent.getPITLock(this.isGetPITLock);
      if (this.itemType !== 'webservice') {
        this.propertiesParameterComponent.getPITLock(this.isGetPITLock);
        this.propertiesNetUserComponent.getPITLock(this.isGetPITLock);
        this.propertiesVersionInfoComponent.getPITLock(this.isGetPITLock);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Get PIT Lock ===========*/

  /*=========== Get Working Copy ===========*/
  getProcessWorkingCopy() {
    this.getProcessWorkingCopySub = this.appIntegrationService.getProcessWorkingCopyById(this.itemId).subscribe(res => {
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

  getIntegrationWorkingCopy() {
    this.getIntegrationWorkingCopySub = this.appIntegrationService.getIntegrationWorkingCopyById(this.itemId).subscribe(res => {
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

  getTriggerWorkingCopy() {
    this.getTriggerWorkingCopySub = this.appIntegrationService.getTriggerWorkingCopyById(this.itemId).subscribe(res => {
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

  getWebServiceTree() {
    const taskDetailsDto = {
      deployed: false,
      disabled: false,
      itemName: "",
      itemType: "WEBSERVICE",
      locked: false,
      showAll: true,
      workspaceId: this.selectedWorkspaceId
    }

    this.allWebServicesSub = this.appIntegrationService.getWebServiceTree(taskDetailsDto).subscribe((res) => {
      if (res?.appRegistry?.length) {
        res?.appRegistry?.forEach((x) => {
          x.versionNumber = x?.version;
          if (Number(x?.id) === Number(this.itemId)) {
            this.getApiData(x);
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
  /*=========== END Get Working Copy ===========*/

  /*=========== Cancel PIT Lock ===========*/
  cancelPITLock() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `Are you sure you want to cancel the lock?. <br/> Any changes, not saved will be lost${this.itemType !== 'webservice' ? `, and ${this.itemType} will be restored to its latest version.` : '.'}`
      //data: `Are you sure you want to cancel lock?. <br/> Any changes, not saved will be lost, and ${this.itemType} will be restored to its latest version.`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cancelLock();
        if (this.itemType === 'process') {
          this.getDeployedProcessDetails();
        }
        if (this.itemType === 'integration') {
          this.getDeployedIntegrationDetails();
        }
        if (this.itemType === 'trigger') {
          this.getDeployedTriggerDetails();
        }
        if (this.itemType === 'webservice') {
          this.getWebServiceTree();
        }
      }
    });

  }

  cancelLock() {
    this.cancelPITLockSub = this.appIntegrationService.cancelPITLock(this.selectedWorkspaceId, this.itemId, this.itemType).subscribe(res => {
      this.isGetPITLock = !res;
      this.isCancelPITLock = res;
      this.propertiesDetails.locked = this.isGetPITLock;
      this.propertiesGeneralComponent.getPITLock(this.isGetPITLock);
      if (this.itemType !== 'webservice') {
        this.propertiesParameterComponent.getPITLock(this.isGetPITLock);
        this.propertiesNetUserComponent.getPITLock(this.isGetPITLock);
        this.propertiesVersionInfoComponent.getPITLock(this.isGetPITLock);
      }
      if (this.itemType === 'process') {
        this.propertiesProcessExecutablesComponent.getPITLock(this.isGetPITLock);
      }
      if (this.itemType === 'integration') {
        this.propertiesProcessComponent.getPITLock(this.isGetPITLock);
        this.propertiesIdentifiersComponent.getPITLock(this.isGetPITLock);
        this.propertiesAlarmInfoComponent.getPITLock(this.isGetPITLock);
      }
      if (this.itemType === 'trigger') {
        this.propertiesTriggerConfigureComponent.getPITLock(this.isGetPITLock);
        this.propertiesTriggerIdentifiersComponent.getPITLock(this.isGetPITLock);
        this.propertiesTriggerActivatorsComponent.getPITLock(this.isGetPITLock);
      }
      if (this.itemType === 'webservice') {
        this.propertiesWebServiceParametersComponent.getPITLock(this.isGetPITLock);
        this.propertiesTriggerIdentifiersComponent.getPITLock(this.isGetPITLock);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Cancel PIT Lock ===========*/

  /*=========== Break PIT Lock ===========*/
  breakPITLock() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `${this.propertiesDetails?.name} is locked by ${this.propertiesDetails?.lockedUserName}. <br/> Are you sure you want to break lock?`
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.breakPITLockSub = this.appIntegrationService.breakPITLock(this.selectedWorkspaceId, this.itemId, this.itemType).subscribe((res) => {
          this.isGetPITLock = res;
          this.isCancelPITLock = !res;
          this.isBreakPITLock = !res;
          this.propertiesGeneralComponent.getPITLock(this.isGetPITLock);
          if (this.itemType !== 'webservice') {
            this.propertiesProcessComponent.getPITLock(this.isGetPITLock);
            this.propertiesIdentifiersComponent.getPITLock(this.isGetPITLock);
            this.propertiesProcessExecutablesComponent.getPITLock(this.isGetPITLock);
            this.propertiesParameterComponent.getPITLock(this.isGetPITLock);
            this.propertiesNetUserComponent.getPITLock(this.isGetPITLock);
            this.propertiesVersionInfoComponent.getPITLock(this.isGetPITLock);
          }
          if (this.itemType === 'process') {
            // Showing working copy after break lock as per QA team requirement
            this.getProcessWorkingCopy();
            this.propertiesProcessExecutablesComponent.getPITLock(this.isGetPITLock);
          }
          if (this.itemType === 'integration') {
            // Showing working copy after break lock as per QA team requirement
            this.getIntegrationWorkingCopy();
            this.propertiesProcessComponent.getPITLock(this.isGetPITLock);
            this.propertiesIdentifiersComponent.getPITLock(this.isGetPITLock);
            this.propertiesAlarmInfoComponent.getPITLock(this.isGetPITLock);
          }
          if (this.itemType === 'trigger') {
            // Showing working copy after break lock as per QA team requirement
            this.getTriggerWorkingCopy();
            this.propertiesTriggerConfigureComponent.getPITLock(this.isGetPITLock);
            this.propertiesTriggerIdentifiersComponent.getPITLock(this.isGetPITLock);
            this.propertiesTriggerActivatorsComponent.getPITLock(this.isGetPITLock);
          }
          if (this.itemType === 'webservice') {
            this.getWebServiceTree();
            this.propertiesWebServiceParametersComponent.getPITLock(this.isGetPITLock);
            this.propertiesTriggerIdentifiersComponent.getPITLock(this.isGetPITLock);
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
  /*=========== END Break PIT Lock ===========*/

  /*============ Validate Steps ============*/
  getValidateStepOne() {
    return this.propertiesGeneralComponent?.validateStepOneWithError();
  }

  getValidateStepTwo() {
    if (this.itemType === 'process') {
      return this.propertiesProcessExecutablesComponent?.validateProcessExeStepTwoWithError();
    } else if (this.itemType === 'integration') {
      return this.propertiesItemProcessComponent.validateStepTwoWithError();
    } else if (this.itemType === 'trigger') {
      return this.propertiesProcessExecutablesComponent?.validateProcessExeStepTwoWithError();
    } else {
      return { isValid: true, errors: [] };
    }
  }

  getValidateParameters() {
    return this.propertiesParameterComponent.validateParametersWithError();
  }

  getValidateWebServiceParameters() {
    return this.propertiesWebServiceParametersComponent.validateParametersWithError();
  }

  async validateAndUpdateProperties(isRelease: boolean, isReleaseAndDeploy: boolean, isSave: boolean, isWebService: boolean) {
    const ValidateStepOne = await this.getValidateStepOne();
    const ValidateStepTwo = this.getValidateStepTwo();
    const ValidateParameters = isWebService ? this.getValidateWebServiceParameters() : this.getValidateParameters();
    if (ValidateStepOne.isValid && ValidateStepTwo.isValid && ValidateParameters.isValid) {
      this.updateProperties(isRelease, isReleaseAndDeploy, isSave);
    } else {
      const allErrors = [
        ...(ValidateStepOne?.errors || []),
        ...(ValidateStepTwo?.errors || []),
        ...(ValidateParameters?.errors || [])
      ].filter(err => !!err);

      const errorMessage = allErrors.length === 1
        ? allErrors[0]
        : allErrors.map((err, index) => `${index + 1}. ${err}`).join('\n');

      this.messageService.add({ key: 'appIntErrorKey', severity: 'error', summary: '', detail: errorMessage });
      return false;

    }

    // const ValidateStepTwo = this.getValidateStepTwo();
    // const ValidateParameters = isWebService ? this.getValidateWebServiceParameters() : this.getValidateParameters();
    // if (ValidateStepOne && ValidateStepTwo && ValidateParameters) {
    //   this.updateProperties(isRelease, isReleaseAndDeploy, isSave);
    // } else {
    //   return false;
    // }
  }

  /*=========== Update Properties ===========*/
  updateProperties(isRelease: boolean, isReleaseAndDeploy: boolean, isSave: boolean) {
    if (this.itemType === 'process') {
      this.updateProcessProperties(isRelease, isReleaseAndDeploy, isSave);
    }
    if (this.itemType === 'integration') {
      if (this.isAlarmPopupOpenFlag || this.isIdentifierSelect) {
        let data;
        if (this.isAlarmPopupOpenFlag && this.isIdentifierSelect) {
          // data = `Alarm configuration and Identifier configuration is in pending state, do you want to ${isReleaseAndDeploy ? 'update and deploy' : isRelease ? 'update' : isSave ? 'save' : ''} with the pending value?`;
          data = `Alarm configuration and Identifier configuration is in pending state. Click Ok to continue with the ${isReleaseAndDeploy ? 'update and deploy' : isRelease ? 'update' : isSave ? 'save' : ''} or Cancel to stay and finish updating the pending configuration.`;
        } else if (this.isAlarmPopupOpenFlag) {
          data = `Alarm configuration is in pending state. Click Ok to continue with the ${isReleaseAndDeploy ? 'update and deploy' : isRelease ? 'update' : isSave ? 'save' : ''} or Cancel to stay and finish updating the pending configuration.`;
        } else {
          data = `Identifier configuration is in pending state. Click Ok to continue with the ${isReleaseAndDeploy ? 'update and deploy' : isRelease ? 'update' : isSave ? 'save' : ''} or Cancel to stay and finish updating the pending configuration.`;
        }
        const dialogRef = this.dialog.open(ConfirmationComponent, {
          width: '700px',
          maxHeight: '600px',
          panelClass: 'myapp-alarm-popup-dialog',
          data: data
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // User confirmed, do something here (like save or proceed)
            if (isReleaseAndDeploy) {
              this.releaseAndDeployIntegration(isRelease, isReleaseAndDeploy, isSave);
            } else {
              this.updateIntegrationProperties(isRelease, isReleaseAndDeploy, isSave);
            }
          }
        });

      } else {
        if (isReleaseAndDeploy) {
          this.releaseAndDeployIntegration(isRelease, isReleaseAndDeploy, isSave);
        } else {
          this.updateIntegrationProperties(isRelease, isReleaseAndDeploy, isSave);
        }
      }
    }

    if (this.itemType === 'trigger') {
      if (this.isAlarmPopupOpenFlag || this.isConfigOpened) {
        let data;
        if (this.isAlarmPopupOpenFlag && this.isConfigOpened) {
          data = `Scheduler configuration and Trigger configuration  is in pending state. Click Ok to continue with the ${isReleaseAndDeploy ? 'update and deploy' : isRelease ? 'update' : isSave ? 'save' : ''} or Cancel to stay and finish updating the pending configuration.`;
        } else if (this.isAlarmPopupOpenFlag) {
          data = `Scheduler configuration is in pending state. Click Ok to continue with the ${isReleaseAndDeploy ? 'update and deploy' : isRelease ? 'update' : isSave ? 'save' : ''} or Cancel to stay and finish updating the pending configuration.`;
        } else {
          data = `Trigger configuration is in pending state. Click Ok to continue with the ${isReleaseAndDeploy ? 'update and deploy' : isRelease ? 'update' : isSave ? 'save' : ''} or Cancel to stay and finish updating the pending configuration.`;
        }

        // this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Scheduler configuration request is in a pending state.Please complete setting by doing add/update or cancel' });
        const dialogRef = this.dialog.open(ConfirmationComponent, {
          width: '700px',
          maxHeight: '600px',
          panelClass: 'myapp-alarm-popup-dialog',
          data: data
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.updateTriggerProperties(isRelease, isReleaseAndDeploy, isSave);
          }
        });

      } else {
        this.updateTriggerProperties(isRelease, isReleaseAndDeploy, isSave);
      }
    }
    if (this.itemType === 'webservice') {
      this.updateWebService();
    }
  }
  /*=========== END Update Properties ===========*/

  handleAlarmPopupAndAction(onConfirmed: () => void) {
    if (this.isAlarmPopupOpenFlag || this.isIdentifierSelect) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '700px',
        maxHeight: '600px',
        panelClass: 'myapp-alarm-popup-dialog',
        data: `Close the ${this.itemType === 'integration' ? 'alarm' : 'scheduler'} pop-up before taking any action. Unsaved data may be lost otherwise. Are you sure you want to continue?`
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
      id: this.itemId,
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
      workspaceId: this.selectedWorkspaceId,
      autoStart: existingPropertiesDetails?.autoStart,
      interactiveMode: existingPropertiesDetails?.interactiveMode,
      showDebugMsg: existingPropertiesDetails?.showDebugMsg,
      disable: generalInfo?.isDisableItem,
      logLevel: generalInfo?.logLevel,
      priority: generalInfo?.queue,
      iconId: existingPropertiesDetails?.iconId,
      belongsToFolder: this.belongsToFolderId,
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
      versionNumber: existingPropertiesDetails?.versionCount,
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
              this.releaseAndDeployedProcess(true, false, updateProcessDto);
            }
          });

        } else {
          // Only check for script change if all are deployed
          const deployedScriptList = this.appIntegrationDataService.getDeployedProcessExecutable();

          const scriptChanged = this.checkIfScriptChanged(deployedScriptList, processExecutables);
          if (scriptChanged) {
            this.appIntegrationService.getDeployedIntegrationProcessById(this.itemId).subscribe((res) => {
              if (res.length) {
                const names = res.map(item => item.name).join(', ');
                const dialogRef = this.dialog.open(AppIntManualAutoDeployComponent, {
                  width: "700px",
                  maxHeight: "600px",
                  data: names,
                });

                dialogRef.afterClosed().subscribe((result) => {
                  if (result.success) {
                    this.manualAutoDeployProcess(isRelease, isReleaseAndDeploy, result.deploymentMode, updateProcessDto);
                  }
                });
              } else {
                this.releaseAndDeployedProcess(isRelease, isReleaseAndDeploy, updateProcessDto);
              }
            });
          } else {
            this.releaseAndDeployedProcess(isRelease, isReleaseAndDeploy, updateProcessDto);
          }
        }
      });
    }
    else if (isRelease) {
      this.releaseAndDeployedProcess(isRelease, isReleaseAndDeploy, updateProcessDto);
    } else {
      this.updateProcessPropertiesSub = this.appIntegrationService.updateProcess(updateProcessDto).subscribe(res => {
        this.messageService.add({
          key: 'appIntSuccessKey',
          severity: 'success',
          summary: '',
          detail: `Item saved successfully!`,
        });
        this.propertiesProcessExecutablesComponent.resetSearch();
        this.propertiesParameterComponent.resetIntialFormValue();
        this.propertiesGeneralComponent.setItemName(updateProcessDto?.name);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.messageService.add({
            key: 'appIntErrorKey',
            severity: 'error',
            summary: '',
            detail: `Unable to save item.`,
          });
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  /*=========== Manual/Auto Deploy Process ===========*/
  manualAutoDeployProcess(isRelease, isReleaseAndDeploy, type: string, updateProcessDto: any) {
    this.getLatestVersionSub = this.appIntegrationService.getLatestVersionInfo(this.itemId.toString(), this.itemType).subscribe((res) => {
      if (res) {
        const dialogRef = this.dialog.open(AppIntAddNoteComponent, {
          width: "700px",
          maxHeight: "600px",
          data: {
            title: isRelease ? `Release v.${res?.lastCreatedVersion + 1} Note` : `Release and deploy v.${res?.lastCreatedVersion + 1} Note`,
            isRelease: isRelease,
            isReleaseAndDeploy: isReleaseAndDeploy,
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
            updateProcessDto.releasePressed = true;
            const manualAutoDeployDto: ManualAutoDeployDto = {
              process: updateProcessDto,
              type: type,
              processId: this.itemId,
              workspaceId: this.selectedWorkspaceId,
              versionNote: result?.newNote,
              userName: this.currentUser?.userName
            }
            this.manualAutoDeployItemsSub = this.appIntegrationService.manualAutoDeployItems(manualAutoDeployDto).subscribe((res) => {
              this.cancelLock();
              this.getDeployedProcessDetails();
              this.propertiesProcessExecutablesComponent.resetSearch();
              this.appIntegrationService.sharedScriptParams([]);
              this.appIntegrationService.sharedDeletedScriptParameters(null);
              this.appIntegrationService.sharedAdditionalScriptParams([]);
              this.appIntegrationDataService.clearCurrentParamsData();
              this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
              // this.appIntegrationDataService.clearProcessExecutables();
              this.appIntegrationDataService.clearDeletedExecutables();
              this.appIntegrationDataService.clearNetUsersExecutables();

            }, (err: HttpErrorResponse) => {
              if (err.error instanceof Error) {
                // handle client side error here
              } else {
                // handle server side error here
              }
            });
            // this.updateProcessPropertiesSub = this.appIntegrationService.updateProcess(updateProcessDto).subscribe(res => {
            //   this.cancelLock();
            //   this.getDeployedProcessDetails();
            //   this.propertiesProcessExecutablesComponent.resetSearch();
            //   this.appIntegrationService.sharedScriptParams([]);
            //   this.appIntegrationService.sharedDeletedScriptParameters(null);
            //   this.appIntegrationService.sharedAdditionalScriptParams([]);
            //   this.appIntegrationDataService.clearCurrentParamsData();
            //   this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
            //   this.appIntegrationDataService.clearProcessExecutables();
            //   this.appIntegrationDataService.clearDeletedExecutables();
            //   this.appIntegrationDataService.clearNetUsersExecutables();
            // }, (err: HttpErrorResponse) => {
            //   if (err.error instanceof Error) {
            //     // handle client side error here
            //   } else {
            //     // handle server side error here
            //   }
            // });
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

  releaseAndDeployedProcess(isRelease, isReleaseAndDeploy, updateProcessDto) {
    this.getLatestVersionSub = this.appIntegrationService.getLatestVersionInfo(this.itemId.toString(), this.itemType).subscribe((res) => {
      if (res) {
        const dialogRef = this.dialog.open(AppIntAddNoteComponent, {
          width: "700px",
          maxHeight: "600px",
          data: {
            title: isRelease ? `Release v.${res?.lastCreatedVersion + 1} Note` : `Release and deploy v.${res?.lastCreatedVersion + 1} Note`,
            isRelease: isRelease,
            isReleaseAndDeploy: isReleaseAndDeploy,
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
              this.appIntegrationService.sharedScriptParams([]);
              this.appIntegrationService.sharedDeletedScriptParameters(null);
              this.appIntegrationService.sharedAdditionalScriptParams([]);
              this.appIntegrationDataService.clearCurrentParamsData();
              this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
              // this.appIntegrationDataService.clearProcessExecutables();
              this.appIntegrationDataService.clearDeletedExecutables();
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
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  formatNumber(num: number) {
    return num.toString().padStart(2, '0');
  }

  /*=========== Release & Deploy Integration Properties ===========*/
  releaseAndDeployIntegration(isRelease: boolean, isReleaseAndDeploy: boolean, isSave: boolean) {
    const process = this.propertiesItemProcessComponent.getSelectedProcessInfo();
    this.getProcessByIdSub = this.appIntegrationService.getDeployedProcessById(process?.id).subscribe((res) => {
      if (res?.deployed) {
        this.updateIntegrationProperties(isRelease, isReleaseAndDeploy, isSave);
      } else {
        if (!res?.deployed && res?.locked) {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'info', summary: '', detail: `Error in deploy Integration, connected process ${process?.name} is not deployed and locked by ${res?.lockedUserName}.` });
        } else {
          const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '700px',
            maxHeight: '600px',
            data: `Error in deploy Integration, connected process ${process?.name} is not deployed. <br/> Click Ok to deploy the connected process with the integration, Cancel to cancel the release and deploy operation.`
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
                  this.updateIntegrationProperties(isRelease, isReleaseAndDeploy, isSave);
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
  }

  /*=========== Update Integration Properties ===========*/
  updateIntegrationProperties(isRelease: boolean, isReleaseAndDeploy: boolean, isSave: boolean) {
    const existingPropertiesDetails = this.propertiesDetails;
    const generalInfo = this.propertiesGeneralComponent.getGenernalInfo();
    const parameters = this.propertiesParameterComponent.getParametersData();
    const netUsersMapping = this.propertiesNetUserComponent.getNetUsersData();
    const process = this.propertiesItemProcessComponent.getSelectedProcessInfo();
    const identifiers = this.propertiesItemIdentifiersComponent.getSelectedIdentifiers();
    const schedulerList = this.appIntegrationDataService.getSchedulers();
    const businessFlowArr = this.appIntegrationDataService.getAllBusinessFlows();
    const clonedSchedulerList = JSON.parse(JSON.stringify(schedulerList));
    if (clonedSchedulerList?.length) {
      clonedSchedulerList.forEach((x) => {
        x.id = x?.isNew ? null : x?.id;
        x.recurrencePattern = x?.recurrencePattern.toUpperCase()
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
    const updateIntegrationDto: TeisItemDto = {
      alarmList: [],
      // defaultAlert: generalInfo?.isDefaultAlert,
      name: generalInfo?.name ? generalInfo?.name.trim() : generalInfo?.name,
      id: this.itemId,
      processId: process?.id,
      identifierIdList: null,
      note: null,
      locked: false,
      lockedDate: null,
      lockedUserId: null,
      lockedUserName: null,
      identifiers: identifiers,
      createAndDeploy: existingPropertiesDetails?.createAndDeploy,
      description: generalInfo?.description,
      disabled: generalInfo?.isDisableItem,
      updateTaskList: false,
      enableAlert: generalInfo?.isEnableAlert,
      alertProcessId: generalInfo?.alertProcess,
      alertProcessName: generalInfo?.alertProcessName,
      associatedProcess: process,
      scriptEngineGroup: generalInfo?.scriptEngineGroup,
      scriptEngine: existingPropertiesDetails?.scriptEngine,
      queue: generalInfo?.queue,
      releaseAndDeploy: isReleaseAndDeploy,
      releaseOnly: isRelease,
      saveOnly: isSave,
      netUsersDto: existingPropertiesDetails?.netUsersDto,
      netUserMapping: netUsersMapping,
      oldFileName: existingPropertiesDetails?.oldFileName,
      logMaintenanceId: generalInfo?.logMaintenance,
      alertId: existingPropertiesDetails?.alertId,
      alertEnabled: generalInfo?.isEnableAlert,
      scheduled: existingPropertiesDetails?.scheduled,
      schedulerList: clonedSchedulerList,
      modified: existingPropertiesDetails?.modified,
      deployed: existingPropertiesDetails?.deployed,
      folder: existingPropertiesDetails?.folder,
      type: existingPropertiesDetails?.type,
      folderDataList: [],
      workspaceId: this.selectedWorkspaceId,
      autoStart: existingPropertiesDetails?.autoStart,
      interactiveMode: existingPropertiesDetails?.interactiveMode,
      showDebugMsg: existingPropertiesDetails?.showDebugMsg,
      disable: generalInfo?.isDisableItem,
      logLevel: generalInfo?.logLevel,
      priority: generalInfo?.queue,
      processComponentId: null,
      iconId: existingPropertiesDetails?.iconId,
      belongsToFolder: this.belongsToFolderId,
      businessFlowDatas: businessFlowArr,
      deleted: existingPropertiesDetails?.deleted,
      scriptEngineKey: existingPropertiesDetails?.scriptEngineKey,
      imageIconName: existingPropertiesDetails?.imageIconName,
      failedTaskCount: existingPropertiesDetails?.failedTaskCount,
      initiateTaskCount: existingPropertiesDetails?.initiateTaskCount,
      processingTaskCount: existingPropertiesDetails?.processingTaskCount,
      processingErrorTaskCount: existingPropertiesDetails?.processingErrorTaskCount,
      lastUpdated: existingPropertiesDetails?.lastUpdated,
      updatedBy: `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim(),
      version: null,
      versionCount: existingPropertiesDetails?.versionCount,
      deployedVersion: existingPropertiesDetails?.deployedVersion,
      versionNumber: existingPropertiesDetails?.versionCount,
      thisDeployedVersion: existingPropertiesDetails?.thisDeployedVersion,
      disabledSchedulerOrAlarm: existingPropertiesDetails?.disabledSchedulerOrAlarm,
      releasePressed: existingPropertiesDetails?.releasePressed,
      paramsData: parameters,
      scriptList: [],
      scripts: [],
      teisFolders: existingPropertiesDetails?.teisFolders
    };

    if (isRelease || isReleaseAndDeploy) {
      const existingProcess = this.appIntegrationDataService.getSelectedProcessInInt();
      const deployedIntAssociateProcess = this.appIntegrationDataService.getDeployedIntAssociatedProcess();
      if (deployedIntAssociateProcess && Number(deployedIntAssociateProcess?.id) !== Number(process?.id) && isReleaseAndDeploy) {
        const dialogExistingProcessRef = this.dialog.open(ConfirmationComponent, {
          width: '700px',
          maxHeight: '600px',
          panelClass: 'myapp-connected-process-dialog',
          data: `Deploy of Integration will remove all existing versions because of a change in attached process. Are you sure you want to deploy the integration ?`
        });
        dialogExistingProcessRef.afterClosed().subscribe(result => {
          if (result) {
            this.openAddNoteDialog(updateIntegrationDto, true, isRelease, isReleaseAndDeploy);
          } else {
            this.propertiesItemProcessComponent.getConnectedProcessInfo(Number(existingProcess?.id), null);
          }
        });

      } else {
        this.openAddNoteDialog(updateIntegrationDto, false, isRelease, isReleaseAndDeploy);
      }

    } else {
      this.updateIntegrationPropertiesSub = this.appIntegrationService.updateIntegration(updateIntegrationDto).subscribe((res) => {
        this.messageService.add({
          key: 'appIntSuccessKey',
          severity: 'success',
          summary: '',
          detail: `Item saved successfully!`,
        });
        this.propertiesProcessExecutablesComponent.resetSearch();
        this.PropertiesBusinessFlowComponent.resetBusinessFlowData();
        this.propertiesParameterComponent.setParametersDataType();
        this.propertiesParameterComponent.resetIntialFormValue();
        this.propertiesGeneralComponent.setItemName(updateIntegrationDto?.name);

        if (this.isAlarmPopupOpenFlag) {
          this.propertiesAlarmInfoComponent.onClosed();
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.messageService.add({
            key: 'appIntErrorKey',
            severity: 'error',
            summary: '',
            detail: `Unable to save item.`,
          });
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  openAddNoteDialog(updateIntegrationDto: any, isProcessChanged: boolean, isRelease: boolean, isReleaseAndDeploy: boolean) {
    this.getLatestVersionSub = this.appIntegrationService.getLatestVersionInfo(this.itemId.toString(), this.itemType).subscribe((res) => {
      if (res) {
        const dialogRef = this.dialog.open(AppIntAddNoteComponent, {
          width: "700px",
          maxHeight: "600px",
          data: {
            title: isRelease ? `Release v.${res?.lastCreatedVersion + 1} Note` : `Release and deploy v.${res?.lastCreatedVersion + 1} Note`,
            isRelease: isRelease,
            isReleaseAndDeploy: isReleaseAndDeploy,
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
            updateIntegrationDto.note = result?.newNote;
            if (isProcessChanged) {
              const deployItemsDto: DeployUndeployItemsDto = {
                workspaceId: this.selectedWorkspaceId,
                deploymentDetails: [
                  {
                    teisItemID: updateIntegrationDto?.id,
                    teisItemType: "Integration",
                    teisVersionNumber: updateIntegrationDto?.versionNumber
                  },
                ],
              };
              this.appIntegrationService.unDeployItems(deployItemsDto, 'Integration', this.itemId, this.itemType).subscribe(() => {
                this.deleteIntegrationVersionSub = this.appIntegrationService.deleteIntegrationVersions(this.propertiesDetails?.id).subscribe((res) => {
                  this.updateIntegration(updateIntegrationDto);
                }, (err: HttpErrorResponse) => {
                  if (err.error instanceof Error) {
                    // handle client side error here
                  } else {
                    // handle server side error here
                  }
                })
              }, (err: HttpErrorResponse) => {
                if (err.error instanceof Error) {
                  // handle client side error here
                } else {
                  // handle server side error here
                }

              })

            } else {
              this.updateIntegration(updateIntegrationDto);
            }
          }
        });
      }
    });
  }

  updateIntegration(updateIntegrationDto) {
    this.updateIntegrationPropertiesSub = this.appIntegrationService.updateIntegration(updateIntegrationDto).subscribe((res) => {
      this.cancelLock();
      this.getDeployedIntegrationDetails();
      this.propertiesProcessExecutablesComponent.resetSearch();
      this.appIntegrationService.sharedAdditionalScriptParams([]);
      this.appIntegrationDataService.clearCurrentParamsData();
      this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
      //this.appIntegrationDataService.clearProcessExecutables();
      this.appIntegrationDataService.clearNetUsersExecutables();
      this.appIntegrationDataService.clearSchedulers();
      this.appIntegrationDataService.clearBusinessFlow();
      if (this.isAlarmPopupOpenFlag) {
        this.propertiesAlarmInfoComponent.onClosed();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=========== Update Trigger Properties ===========*/
  updateTriggerProperties(isRelease: boolean, isReleaseAndDeploy: boolean, isSave: boolean) {
    const existingPropertiesDetails = this.propertiesDetails;
    const generalInfo = this.propertiesGeneralComponent.getGenernalInfo();
    const processExecutables = this.propertiesProcessExecutablesComponent.getProcessExecutablesData();
    const parameters = this.propertiesParameterComponent.getParametersData();
    const netUsersMapping = this.propertiesNetUserComponent.getNetUsersData();
    const configure = this.propertiesTriggerConfigureComponent.getConfigStr();
    const identifiersIntegrations = this.propertiesTriggerIdentifiersComponent.getSelectedIdentifiersMethods();
    const triggerActivator = this.propertiesTriggerActivatorsComponent.getSelectedIdentifiersIntegrations();
    const schedulerList = this.appIntegrationDataService.getSchedulers();

    const clonedSchedulerList = JSON.parse(JSON.stringify(schedulerList));

    if (clonedSchedulerList?.length) {
      clonedSchedulerList.forEach((x) => {
        x.id = x?.isNew ? null : x?.id;
        x.recurrencePattern = x?.recurrencePattern.toUpperCase()
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

    const updateTriggerDto: TeisItemDto = {
      activatorDataList: triggerActivator?.activatorDataList,
      activatorEnabled: triggerActivator?.activatorEnabled,
      configData: configure,
      configDataList: existingPropertiesDetails?.configDataList,
      configParameterList: existingPropertiesDetails?.configParameterList,
      identifierMethodList: existingPropertiesDetails?.identifierMethodList,
      infoFilePath: existingPropertiesDetails?.infoFilePath,
      taskRepeatFrequency: existingPropertiesDetails?.taskRepeatFrequency,
      taskToBeRepeated: existingPropertiesDetails?.taskToBeRepeated,
      name: generalInfo?.name ? generalInfo?.name.trim() : generalInfo?.name,
      id: this.itemId,
      identifierIdList: existingPropertiesDetails?.identifierIdList,
      note: existingPropertiesDetails?.note,
      locked: existingPropertiesDetails?.locked,
      lockedDate: existingPropertiesDetails?.lockedDate,
      lockedUserId: existingPropertiesDetails?.lockedUserId,
      lockedUserName: existingPropertiesDetails?.lockedUserName,
      identifiers: identifiersIntegrations,
      createAndDeploy: existingPropertiesDetails?.createAndDeploy,
      description: generalInfo?.description,
      disabled: generalInfo?.isDisableItem,
      updateTaskList: generalInfo?.isEnableActivationLogsOnly,
      enableAlert: generalInfo?.isEnableAlert,
      alertProcessId: generalInfo?.alertProcess,
      alertProcessName: generalInfo?.alertProcessName,
      scriptEngineGroup: generalInfo?.scriptEngineGroup,
      scriptEngine: existingPropertiesDetails?.scriptEngine,
      queue: generalInfo?.queue,
      releaseAndDeploy: isReleaseAndDeploy,
      releaseOnly: isRelease,
      saveOnly: isSave,
      netUsersDto: existingPropertiesDetails?.netUsersDto,
      netUserMapping: netUsersMapping,
      oldFileName: existingPropertiesDetails?.oldFileName,
      logMaintenanceId: generalInfo?.logMaintenance,
      alertId: existingPropertiesDetails?.alertId,
      alertEnabled: generalInfo?.isEnableAlert,
      scheduled: existingPropertiesDetails?.scheduled,
      schedulerList: clonedSchedulerList,
      modified: existingPropertiesDetails?.modified,
      deployed: existingPropertiesDetails?.deployed,
      folder: existingPropertiesDetails?.folder,
      type: existingPropertiesDetails?.type,
      folderDataList: existingPropertiesDetails?.folderDataList,
      workspaceId: this.selectedWorkspaceId,
      autoStart: existingPropertiesDetails?.autoStart,
      interactiveMode: existingPropertiesDetails?.interactiveMode,
      showDebugMsg: existingPropertiesDetails?.showDebugMsg,
      disable: generalInfo?.isDisableItem,
      logLevel: generalInfo?.logLevel,
      priority: generalInfo?.queue,
      iconId: existingPropertiesDetails?.iconId,
      belongsToFolder: this.belongsToFolderId,
      deleted: existingPropertiesDetails?.deleted,
      scriptEngineKey: existingPropertiesDetails?.scriptEngineKey,
      imageIconName: existingPropertiesDetails?.imageIconName,
      failedTaskCount: existingPropertiesDetails?.failedTaskCount,
      initiateTaskCount: existingPropertiesDetails?.initiateTaskCount,
      processingTaskCount: existingPropertiesDetails?.processingTaskCount,
      processingErrorTaskCount: existingPropertiesDetails?.processingErrorTaskCount,
      lastUpdated: existingPropertiesDetails?.lastUpdated,
      updatedBy: this.currentUser?.userName,
      version: existingPropertiesDetails?.version,
      versionCount: existingPropertiesDetails?.versionCount,
      deployedVersion: existingPropertiesDetails?.deployedVersion,
      versionNumber: existingPropertiesDetails?.versionNumber,
      thisDeployedVersion: existingPropertiesDetails?.thisDeployedVersion,
      disabledSchedulerOrAlarm: existingPropertiesDetails?.disabledSchedulerOrAlarm,
      releasePressed: existingPropertiesDetails?.releasePressed,
      paramsData: parameters,
      scriptList: processExecutables,
      scripts: processExecutables,
      teisFolders: existingPropertiesDetails?.teisFolders,
    };
    if (isReleaseAndDeploy) {
      const processExecutablesIds = processExecutables.map(item => item.id);
      this.getScriptDeployStatusSub = this.appIntegrationService.getScriptDeployStatus(processExecutablesIds).subscribe((res) => {
        const hasDeployedFalse = res.some(script => script.deployed === false);
        if (hasDeployedFalse) {
          const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '700px',
            maxHeight: '600px',
            data: `Error in trigger deploy. One or more connected executables are not deployed. Click Ok to continue with release of the Trigger, Cancel to cancel the release and deploy operation.`
          });

          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              this.updateTrigger(true, false, updateTriggerDto);
            }
          });

        } else {
          this.updateTrigger(isRelease, isReleaseAndDeploy, updateTriggerDto);
        }

      });

    }
    else if (isRelease) {
      this.updateTrigger(isRelease, isReleaseAndDeploy, updateTriggerDto);
    } else {
      this.updateTriggerPropertiesSub = this.appIntegrationService.updateTrigger(updateTriggerDto).subscribe((res) => {
        this.messageService.add({
          key: 'appIntSuccessKey',
          severity: 'success',
          summary: '',
          detail: `Item saved successfully!`,
        });
        this.propertiesProcessExecutablesComponent.resetSearch();
        this.propertiesParameterComponent.resetIntialFormValue();
        this.propertiesGeneralComponent.setItemName(updateTriggerDto?.name);
        if (this.isAlarmPopupOpenFlag) {
          this.propertiesAlarmInfoComponent.onClosed();
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          this.messageService.add({
            key: 'appIntErrorKey',
            severity: 'error',
            summary: '',
            detail: `Unable to save item.`,
          });
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  /*=========== Update Trigger  ===========*/
  updateTrigger(isRelease: boolean, isReleaseAndDeploy: boolean, updateTriggerDto) {
    this.getLatestVersionSub = this.appIntegrationService.getLatestVersionInfo(this.itemId.toString(), this.itemType).subscribe((res) => {
      if (res) {
        const dialogRef = this.dialog.open(AppIntAddNoteComponent, {
          width: "700px",
          maxHeight: "600px",
          data: {
            title: isRelease ? `Release v.${res?.lastCreatedVersion + 1} Note` : `Release and deploy v.${res?.lastCreatedVersion + 1} Note`,
            isRelease: isRelease,
            isReleaseAndDeploy: isReleaseAndDeploy,
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
            updateTriggerDto.note = result?.newNote;
            this.updateTriggerPropertiesSub = this.appIntegrationService.updateTrigger(updateTriggerDto).subscribe((res) => {
              this.cancelLock();
              this.getDeployedTriggerDetails();
              this.propertiesProcessExecutablesComponent.resetSearch();
              this.appIntegrationService.sharedAdditionalScriptParams([]);
              this.appIntegrationDataService.clearCurrentParamsData();
              this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
              //this.appIntegrationDataService.clearProcessExecutables();
              this.appIntegrationDataService.clearNetUsersExecutables();
              this.appIntegrationService.sharedIdentifiersMethods(null);
              this.appIntegrationDataService.clearSchedulers();
              if (this.isAlarmPopupOpenFlag) {
                this.propertiesAlarmInfoComponent.onClosed();
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
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=========== Update Web Service Properties ===========*/
  updateWebService() {
    const existingWebServiceDetails = this.propertiesDetails;
    const webServiceObj = JSON.parse(JSON.stringify(existingWebServiceDetails));
    const generalInfo = this.propertiesGeneralComponent.getGenernalInfo();
    const parameters = this.propertiesWebServiceParametersComponent.getWebServiceParameters();
    const identifiers = this.propertiesTriggerIdentifiersComponent.getSelectedIdentifiersMethods();

    const identifiersArr = [];
    if (identifiers?.length) {
      identifiers.forEach((x) => {
        const identifierObj = {
          identifierName: x?.identifierName,
          fileName: x?.fileName,
          order: x?.order,
          methodVersion: x?.methodVersion,
          methodName: x?.methodName,
          id: x?.id,
          detectorParametersData: x?.detectorParametersData,
          content: x?.content,
          className: x?.identifierName,
          referenceComponentId: x?.referenceComponentId,
          identifierConfigStr: x?.identifierConfigStr,
          lastUpdated: x?.lastUpdated,
          updatedBy: `${this.currentUser?.firstName} ${this.currentUser?.lastName}`,
          identifierStr: x?.identifierStr,
          regexStr: x?.regexStr,
          enabled: x?.enabled,
          scriptEngineId: x?.scriptEngineId,
          scriptEngineName: x?.scriptEngineName,
          identifierType: x?.identifierType,
          serverIdentity: x?.serverIdentity,
          scriptEngineKey: x?.scriptEngineKey
        };
        identifiersArr.push(identifierObj);
      });
    }

    webServiceObj.name = generalInfo?.name;
    webServiceObj.description = generalInfo?.description;
    webServiceObj.appParamsDataList = parameters;
    webServiceObj.identifiers = identifiersArr;
    webServiceObj.logMaintenanceId = generalInfo?.logMaintenance;
    webServiceObj.logLevel = generalInfo?.logLevel;
    delete webServiceObj.versionNumber;

    this.updateWebServiceSub = this.appIntegrationService.updateAppRegistry(webServiceObj).subscribe((res) => {
      if (res) {
        this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Web service updated successfully!' });
        this.cancelLock();
        this.getWebServiceTree();
        this.propertiesProcessExecutablesComponent.resetSearch();
        this.appIntegrationService.sharedAdditionalScriptParams([]);
        this.appIntegrationDataService.clearCurrentParamsData();
        this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
        // this.appIntegrationDataService.clearProcessExecutables();
        this.appIntegrationDataService.clearNetUsersExecutables();
        this.appIntegrationDataService.clearSchedulers();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  ngOnDestroy(): void {
    this.appIntegrationService.sendReturnFromOtherPageFlag(true);
    this.getItemDetailsSub.unsubscribe();
    this.getPITLockSub.unsubscribe();
    this.breakPITLockSub.unsubscribe();
    this.updateProcessPropertiesSub.unsubscribe();
    this.updateIntegrationPropertiesSub.unsubscribe();
    this.updateTriggerPropertiesSub.unsubscribe();
    this.getProcessDetailsSub.unsubscribe();
    this.getIntegrationDetailsSub.unsubscribe();
    this.getTriggerDetailsSub.unsubscribe();
    this.getProcessWorkingCopySub.unsubscribe();
    this.getIntegrationWorkingCopySub.unsubscribe();
    this.getTriggerWorkingCopySub.unsubscribe();
    this.allWebServicesSub.unsubscribe();
    this.updateWebServiceSub.unsubscribe();
    this.alarmPopupServiceSub.unsubscribe();
    this.getLatestVersionSub.unsubscribe();
    this.getScriptDeployStatusSub.unsubscribe();
    this.manualAutoDeployItemsSub.unsubscribe();
  }

}
