import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatStepper, StepperOrientation } from '@angular/material/stepper';
import { MessageService } from 'primeng/api';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { Constants } from 'src/app/shared/components/constants';
import { ToolsDataService } from '../tools-data.service';
import { ToolsService } from '../tools.service';
import { ImportAlertComponent } from './import-alert/import-alert.component';
import { ImportDetailsComponent } from './import-details/import-details.component';
import { ImportSummaryComponent } from './import-summary/import-summary.component';
import { ImportWorkspaceComponent } from './import-workspace/import-workspace.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit, OnDestroy {
  currentTabIndex: number = 0;
  workspaceName: string;
  workspaceId: number;
  importFromId: string;
  overwriteWithDeploy: boolean;
  toOverwrite: boolean;
  overrideOption: string;
  overrideItemsScriptsWithDeploy: boolean;
  scrWidth: number;
  alertEnabledForProcesses: boolean = false;
  alertEnabledForIntegrations: boolean = false;
  alertEnabledForTriggers: boolean = false;
  currentUsername: string;
  selectedAlertProcess: any;
  stepperOrientation: Observable<StepperOrientation>;
  defaultProfiles = [
    { id: 1, name: 'Administration' },
    { id: 2, name: 'hpwani' }
  ];

  @ViewChild('importStepper') private importStepper: MatStepper;
  @ViewChild(ImportWorkspaceComponent) private importWorkspaceComponent: ImportWorkspaceComponent;
  @ViewChild(ImportDetailsComponent) private importDetailsComponent: ImportDetailsComponent;
  @ViewChild(ImportSummaryComponent) private importSummaryComponent: ImportSummaryComponent;
  @ViewChild(ImportAlertComponent) private importAlertComponent: ImportAlertComponent;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  importSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog,
    private toolsService: ToolsService,
    private toolsDataService: ToolsDataService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.getScreenSize();
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
    this.currentUsername = localStorage.getItem(Constants.USERNAME);
  }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/tools/export') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.toolsService.selectedImportDetails.subscribe(res => {
      this.workspaceId = Number(res.workspaceId);
      this.workspaceName = res?.workspaceName;
      this.importFromId = res?.importFromId;
      this.overwriteWithDeploy = res?.overwriteWithDeploy;
      this.toOverwrite = res?.toOverwrite;
      this.overrideOption = res?.overrideOption;
      this.overrideItemsScriptsWithDeploy = res?.overrideItemsScriptsWithDeploy;
      this.alertEnabledForProcesses = res?.alertEnabledForProcesses;
      this.alertEnabledForIntegrations = res?.alertEnabledForIntegrations;
      this.alertEnabledForTriggers = res?.alertEnabledForTriggers;
      this.cdr.detectChanges();
    });
    this.toolsService.selectedAlertProcess.subscribe(alertProcess => {
      this.selectedAlertProcess = alertProcess;
    });
  }

  /*=========== Next Page ===========*/
  nextStep() {
    this.importStepper.next();
    if (Number(this.importStepper.selectedIndex) === 0) {

    }
    if (Number(this.importStepper.selectedIndex) === 1) {
      this.importDetailsComponent.handleChange(0);
      this.importDetailsComponent.setTabIndex(0, true, false);
      this.importDetailsComponent.clearSelectedFiles('Integration');
      this.importDetailsComponent.getImportDetails();
    }
    if (Number(this.importStepper.selectedIndex) === 2) {
      this.importSummaryComponent.handleChange(0);
      this.importSummaryComponent.setTabIndex(0, true, false);
    }
    if (Number(this.importStepper.selectedIndex) === 3) {
      this.importAlertComponent.getAlertProcesses();
    }
  }
  /*=========== End Next Page ===========*/

  /*=========== Previous Page ===========*/
  previousStep() {
    if (this.importFromId === '2.x' &&
      Number(this.importStepper.selectedIndex) === 2 &&
      this.importSummaryComponent?.activeTab === 0) {
      this.importStepper.selectedIndex = 0;
    } else {
      this.importStepper.previous();
      if (Number(this.importStepper.selectedIndex) === 0) {

      }
      if (Number(this.importStepper.selectedIndex) === 1) {
        this.importDetailsComponent.handleChange(6);
      }
      if (Number(this.importStepper.selectedIndex) === 2) {
        this.importSummaryComponent.handleChange(6);
      }
      if (Number(this.importStepper.selectedIndex) === 3) {

      }
    }
  }
  /*=========== End Previous Page ===========*/

  /*=========== Next Tab ===========*/
  nextTab(nextTabNo: number) {
    if (Number(this.importStepper.selectedIndex) === 0) {

    }
    if (Number(this.importStepper.selectedIndex) === 1) {
      this.importDetailsComponent.setTabIndex(nextTabNo, true, false);
      if (Number(nextTabNo) === 1) {
        this.importDetailsComponent.clearSelectedFiles('Process');
        this.importDetailsComponent.getProcessTree();
      }
      if (Number(nextTabNo) === 2) {
        this.importDetailsComponent.clearSelectedFiles('Trigger');
        this.importDetailsComponent.getTriggerTree();
      }
      if (Number(nextTabNo) === 3) {
        this.importDetailsComponent.getUserScript();
      }
      if (Number(nextTabNo) === 4) {
        // this.importDetailsComponent.getTemplateScript();
      }
      if (Number(nextTabNo) === 5) {
        this.importDetailsComponent.getGlobalParameters();
      }
      if (Number(nextTabNo) === 6) {
        this.importDetailsComponent.getAppParameters();
      }
    }
    if (Number(this.importStepper.selectedIndex) === 2) {
      this.importSummaryComponent.setTabIndex(nextTabNo, true, false);
    }
    if (Number(this.importStepper.selectedIndex) === 3) {

    }
  }
  /*=========== END Next Tab ===========*/

  /*=========== Previous Tab ===========*/
  previousTab(prevTabNo: number) {
    if (Number(this.importStepper.selectedIndex) === 0) {

    }
    if (Number(this.importStepper.selectedIndex) === 1) {
      this.importDetailsComponent.setTabIndex(prevTabNo, false, true);
      if (Number(prevTabNo) === 3) {
        this.importDetailsComponent.getUserScript();
      }
      if (Number(prevTabNo) === 4) {
        this.importDetailsComponent.getTemplateScript();
      }
      if (Number(prevTabNo) === 5) {
        this.importDetailsComponent.getGlobalParameters();
      }
      if (Number(prevTabNo) === 6) {
        this.importDetailsComponent.getAppParameters();
      }
    }
    if (Number(this.importStepper.selectedIndex) === 2) {
      this.importSummaryComponent.setTabIndex(prevTabNo, false, true);
    }
    if (Number(this.importStepper.selectedIndex) === 3) {

    }
  }
  /*=========== END Previous Tab ===========*/

  getValidateStepOne() {
    return this.importWorkspaceComponent?.getValidateStepOne();
  }

  /*=========== Finished Export ===========*/
  finishExport() {
    if (this.importFromId === '2.x') {
      if (this.alertEnabledForProcesses || this.alertEnabledForIntegrations || this.alertEnabledForTriggers) {
        if (!this.importAlertComponent.sendSelectedAlertProcess && this.importAlertComponent.sendSelectedAlertProcess === '') {
          this.alertProcessConfirmation(this.importAlertComponent.sendSelectedAlertProcess);
        } else {
          const alertProcess = this.importAlertComponent.sendSelectedAlertProcess;
          this.checkTeisItemLockInfo(this.workspaceId, alertProcess, Constants.TEIS_ITEM_TYPE);
        }
      } else {
        this.importStepper.reset();
        this.importWorkspaceComponent.resetStepOne();
        this.importDetailsComponent.resetStepTwo();
        this.importSummaryComponent.resetStepThree();
        this.importAlertComponent.resetStepFour();
      }
    } else {
      this.importStepper.reset();
      this.importWorkspaceComponent.resetStepOne();
      this.importDetailsComponent.resetStepTwo();
      this.importSummaryComponent.resetStepThree();
      this.importAlertComponent.resetStepFour();
    }
  }
  /*=========== END Finished Export ===========*/

  /*=========== 'Import 2.x' Confirm Default Alert Process Selection ==========*/
  alertProcessConfirmation(alertProcess: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '330px',
      panelClass: 'myapp-no-padding-dialog',
      data: 'You had selected enable alert for items during this import. Do you want to continue without selecting Default Alert Process?',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.importStepper.reset();
        this.importWorkspaceComponent.resetStepOne();
        this.importDetailsComponent.resetStepTwo();
        this.importSummaryComponent.resetStepThree();
        this.importAlertComponent.resetStepFour();
      }
    });
  }

  /*=========== 'Import 2.x' Set Default Alert Process Confirmation ==========*/
  setAlertProcessConfirmation(alertProcess: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '330px',
      panelClass: 'myapp-no-padding-dialog',
      data: `Alert process, ${alertProcess?.name} will be set as default alert process.`,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (alertProcess?.defaultAlert) {
          this.importStepper.reset();
          this.importWorkspaceComponent.resetStepOne();
          this.importDetailsComponent.resetStepTwo();
          this.importSummaryComponent.resetStepThree();
          this.importAlertComponent.resetStepFour();
          this.messageService.add({ key: 'toolsSuccessKey', severity: 'success', summary: '', detail: `Set ${alertProcess?.name} as a default alert process successfully!` });
        } else {
          this.setDefaultAlertProcess();
        }
      }
    });
  }

  /*============ Check TEIS Item Lock Info ===========*/
  checkTeisItemLockInfo(workspaceId: number, alertProcess: any, teisItemType: string) {
    this.toolsService.getTeisItemLockInfo(workspaceId, alertProcess?.id, teisItemType).subscribe(res => {
      if (res?.lockedBy && res?.lockedBy !== this.currentUsername) {
        this.messageService.add({ key: 'toolsInfoKey', severity: 'success', summary: '', detail: `${alertProcess?.name} is locked by ${res?.lockedBy}` });
      } else {
        this.setAlertProcessConfirmation(alertProcess);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=========== Set Default Alert Process ===========*/
  setDefaultAlertProcess() {
    const alertProcessDto = {
      id: this.selectedAlertProcess?.id,
      name: this.selectedAlertProcess?.name,
      defaultAlert: true,
      alertProcess: true,
      enableAlert: false,
      workspaceId: this.workspaceId
    };
    this.toolsService.setDefaultAlertProcess(alertProcessDto).subscribe(res => {
      this.importStepper.reset();
      this.importWorkspaceComponent.resetStepOne();
      this.importDetailsComponent.resetStepTwo();
      this.importSummaryComponent.resetStepThree();
      this.importAlertComponent.resetStepFour();
      this.messageService.add({ key: 'toolsSuccessKey', severity: 'success', summary: '', detail: `Set ${this.selectedAlertProcess?.name} as a default alert process successfully!` });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=========== Import Workspace ===========*/
  importWs() {
    let importObj = null;

    if (this.importFromId === '2.x') {
      importObj = {
        workspaceId: this.workspaceId,
        workspaceName: this.workspaceName,
        fileName: this.importWorkspaceComponent.getDocDetails()?.fileName,
        encryptedContents: this.importWorkspaceComponent.getDocDetails()?.byteArr,
        applicationVersion: this.importFromId,
        overwriteWithDeploy: this.overwriteWithDeploy,
        toOverwrite: this.toOverwrite,
        overrideOption: this.overrideOption,
        overrideItemsScriptsWithDeploy: this.overrideItemsScriptsWithDeploy,
        alertEnabledForProcesses: this.alertEnabledForProcesses,
        alertEnabledForIntegrations: this.alertEnabledForIntegrations,
        alertEnabledForTriggers: this.alertEnabledForTriggers
      };
    } else {
      importObj = this.toolsDataService.getImportParseWorkspace();

      importObj.workspaceId = this.workspaceId;
      importObj.workspaceName = importObj?.workspaceName;
      importObj.applicationParamList = this.getSelectedAppParamsList();
      importObj.globalParamList = this.getSelectedGlobalParamsList();
      importObj.integrationList = this.getSelectedIntegrationItemsList();
      importObj.processList = this.getSelectedProcessItemsList();
      importObj.triggerList = this.getSelectedTriggerItemsList();
      importObj.templateList = this.getSelectedTemplateList();
      importObj.userScriptList = this.getSelectedUserScriptList();
      importObj.overwriteWithDeploy = this.overwriteWithDeploy;
      importObj.toOverwrite = this.toOverwrite;
      importObj.overrideOption = this.overrideOption;
      importObj.overrideItemsScriptsWithDeploy = this.overrideItemsScriptsWithDeploy;
    }

    this.toolsDataService.clearImportedData();
    this.importSub = this.toolsService.import(importObj).subscribe(res => {
      this.toolsDataService.storeImportedData(res);
      this.importSummaryComponent.getImportedWorkspaceData();
      this.importStepper.selectedIndex = 2;
      if (Number(this.importStepper.selectedIndex) === 2) {
        this.importSummaryComponent.handleChange(0);
        this.importSummaryComponent.setTabIndex(0, true, false);
      }
      this.messageService.add({ key: 'toolsSuccessKey', severity: 'success', summary: '', detail: 'Workspace imported successfully!' });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Import Workspace ===========*/

  /*=========== Get Selected Application Parameters List ===========*/
  getSelectedAppParamsList() {
    const appParams = this.toolsDataService.getImportAppParams();
    let selectedAppParams = [];
    if (this.importFromId === '3.1') {
      selectedAppParams = appParams;
    } else {
      if (appParams?.length) {
        appParams.forEach(item => {
          if (item?.checked) {
            // delete item?.disabled;
            // delete item?.checked;
            const appParamsObj = {
              autoComplete: item?.autoComplete,
              config: item?.config,
              dataType: item?.dataType,
              description: item?.description,
              id: item?.id,
              inParameter: item?.inParameter,
              lastUpdated: item?.lastUpdated,
              optionProtected: item?.optionProtected,
              outParameter: item?.outParameter,
              parameterName: item?.parameterName,
              parameterTypes: item?.parameterTypes,
              probableValues: item?.probableValues,
              scriptId: item?.scriptId,
              securityLevel: item?.securityLevel,
              storedValue: item?.storedValue,
              type: item?.type,
              updatedBy: item?.updatedBy,
              value: item?.value,
              workspaceId: item?.workspaceId
            };
            selectedAppParams.push(appParamsObj);
          }
        });
      }
    }
    return selectedAppParams;
  }
  /*=========== END Get Selected Application Parameters List ===========*/

  /*=========== Get Selected Global Parameters List ===========*/
  getSelectedGlobalParamsList() {
    const globalParams = this.toolsDataService.getImportGlobalParams();
    let selectedGlobalParams = [];
    if (this.importFromId === '3.1') {
      selectedGlobalParams = globalParams;
    } else {
      if (globalParams?.length) {
        globalParams.forEach(item => {
          if (item?.checked) {
            // delete item?.disabled;
            // delete item?.checked;
            const globalParamsObj = {
              autoComplete: item?.autoComplete,
              config: item?.config,
              dataType: item?.dataType,
              description: item?.description,
              id: item?.id,
              inParameter: item?.inParameter,
              lastUpdated: item?.lastUpdated,
              optionProtected: item?.optionProtected,
              outParameter: item?.outParameter,
              parameterName: item?.parameterName,
              parameterTypes: item?.parameterTypes,
              probableValues: item?.probableValues,
              scriptId: item?.scriptId,
              securityLevel: item?.securityLevel,
              storedValue: item?.storedValue,
              type: item?.type,
              updatedBy: item?.updatedBy,
              value: item?.value,
              workspaceId: item?.workspaceId,
            };
            selectedGlobalParams.push(globalParamsObj);
          }
        });
      }
    }
    return selectedGlobalParams;
  }
  /*=========== END Get Selected Global Parameters List ===========*/

  /*=========== Get Selected Integration Items List ===========*/
  getSelectedIntegrationItemsList() {
    const integrationList = this.toolsDataService.getImportIntegrationItemIds();
    const importData = this.toolsDataService.getImportParseWorkspace();
    let selectedIntegrationItems = [];
    if (this.importFromId === '3.1') {
      selectedIntegrationItems = importData?.integrationList;
    } else {
      if (importData?.integrationList?.length && integrationList?.length) {
        integrationList.forEach(id => {
          importData?.integrationList.forEach(item => {
            if (Number(id) === Number(item?.id)) {
              selectedIntegrationItems.push(item);
            }
          });
        });
      }
    }
    return selectedIntegrationItems;
  }
  /*=========== END Get Selected Integration Items List ===========*/

  /*=========== Get Selected Process Items List ===========*/
  getSelectedProcessItemsList() {
    const processList = this.toolsDataService.getImportProcessItemIds();
    const importData = this.toolsDataService.getImportParseWorkspace();
    let selectedProcessItems = [];
    if (this.importFromId === '3.1') {
      selectedProcessItems = importData?.processList;
    } else {
      if (importData?.processList?.length && processList?.length) {
        processList.forEach(id => {
          importData?.processList.forEach(item => {
            if (Number(id) === Number(item?.id)) {
              selectedProcessItems.push(item);
            }
          });
        });
      }
    }
    return selectedProcessItems;
  }
  /*=========== END Get Selected Process Items List ===========*/

  /*=========== Get Selected Trigger Items List ===========*/
  getSelectedTriggerItemsList() {
    const triggerList = this.toolsDataService.getImportTriggerItemIds();
    const importData = this.toolsDataService.getImportParseWorkspace();
    let selectedProcessItems = [];
    if (this.importFromId === '3.1') {
      selectedProcessItems = importData?.triggerList;
    } else {
      if (importData?.triggerList?.length && triggerList?.length) {
        triggerList.forEach(id => {
          importData?.triggerList.forEach(item => {
            if (Number(id) === Number(item?.id)) {
              selectedProcessItems.push(item);
            }
          });
        });
      }
    }
    return selectedProcessItems;
  }
  /*=========== END Get Selected Trigger Items List ===========*/

  /*=========== Get Selected Templates List ===========*/
  getSelectedTemplateList() {
    const templates = this.toolsDataService.getImportTemplate();
    let selectedTemplates = [];
    if (this.importFromId === '3.1') {
      selectedTemplates = templates;
    } else {
      if (templates?.length) {
        templates.forEach(item => {
          if (item?.checked) {
            delete item?.disabled;
            delete item?.checked;
            selectedTemplates.push(item);
          }
        });
      }
    }
    return selectedTemplates;
  }
  /*=========== END Get Selected Templates List ===========*/

  /*=========== Get Selected User Script List ===========*/
  getSelectedUserScriptList() {
    const scripts = this.toolsDataService.getImportScript();
    let selectedScripts = [];
    if (this.importFromId === '3.1') {
      selectedScripts = scripts;
    } else {
      if (scripts?.length) {
        scripts.forEach(item => {
          if (item?.checked) {
            delete item?.disabled;
            delete item?.checked;
            selectedScripts.push(item);
          }
        });
      }
    }
    return selectedScripts;
  }
  /*=========== END Get Selected User Script List ===========*/

  /*=========== Workspace Selection Confirmation ===========*/
  workspaceConfirmation() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '330px',
      panelClass: 'myapp-no-padding-dialog',
      data: `Are you sure you want to import workspace in ${this.workspaceName}?`,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.importFromId === '2.x') {
          this.importWs();
        } else {
          this.nextStep();
        }
      }
    });
  }
  /*=========== END Workspace Selection Confirmation ===========*/

  /*=========== On Chancel ===========*/
  onCancel() {
    this.importStepper.selectedIndex = 0;
    this.importWorkspaceComponent.resetStepOne();
    this.importDetailsComponent.resetStepTwo();
    this.importSummaryComponent.resetStepThree();
    this.importAlertComponent.resetStepFour();
  }
  /*=========== END On Chancel ===========*/

  ngOnDestroy(): void {
    this.importSub.unsubscribe();
  }

}
