import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatStepper, StepperOrientation } from '@angular/material/stepper';
import { MessageService } from 'primeng/api';
import { Export } from '../tools';
import { ToolsDataService } from '../tools-data.service';
import { ToolsService } from '../tools.service';
import { IntroductionComponent } from './introduction/introduction.component';
import { ItemsComponent } from './items/items.component';
import { ParametersComponent } from './parameters/parameters.component';
import { ResultComponent } from './result/result.component';
import { ScriptComponent } from './script/script.component';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/service/header.service';
import { BreadCrumbService } from 'src/app/core/service/breadcrumb.service';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  activeIndex: number = 0;
  currentTabIndex: number = 0;
  selectedExportToId: string = null;
  selectedWsId: number;
  selectedWorkspaceName: string;
  allWorkspaceIds: Array<number>;
  typeId: number;
  exportOption: string;
  scrWidth: number;
  stepperOrientation: Observable<StepperOrientation>;

  @ViewChild('stepper') private exportStepper: MatStepper;
  @ViewChild(IntroductionComponent) private introductionComponent: IntroductionComponent;
  @ViewChild(ItemsComponent) private itemsComponent: ItemsComponent;
  @ViewChild(ScriptComponent) private scriptComponent: ScriptComponent;
  @ViewChild(ParametersComponent) private parametersComponent: ParametersComponent;
  @ViewChild(ResultComponent) private resultComponent: ResultComponent;

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  constructor(
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    private fb: UntypedFormBuilder,
    private toolsService: ToolsService,
    private toolsDataService: ToolsDataService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private breakpointObserver: BreakpointObserver
  ) {
    this.getScreenSize();
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
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
    this.toolsService.selectedWsAndTypeForExport.subscribe((res) => {
      this.selectedExportToId = res?.exportToId
      this.selectedWsId = res?.workspaceId;
      this.selectedWorkspaceName = res?.workspaceName;
      this.allWorkspaceIds = res?.allWorkspaceIds;
      this.typeId = res?.typeId;
      this.exportOption = res?.exportOption;
      this.cdr.detectChanges();
    });
    this.toolsService.selectedWsForExport.subscribe((res) => {
      this.selectedWorkspaceName = res?.workspaceName;
      this.cdr.detectChanges();
    });
  }

  isStepOneIntroValid() {
    return this.introductionComponent.isStepOneIntroValid();
  }

  /*=========== Next Page ===========*/
  nextStep() {
    this.exportStepper.next();
    if (Number(this.exportStepper.selectedIndex) === 0) {
      this.introductionComponent.handleChange(0)
    }
    if (Number(this.exportStepper.selectedIndex) === 1) {
      this.itemsComponent.handleChange(0);
      this.itemsComponent.setTabIndex(0, true, false);
      this.itemsComponent.getIntegrationItemsTree(this.selectedWsId, this.typeId, 'Integration');
    }
    if (Number(this.exportStepper.selectedIndex) === 2) {
      this.scriptComponent.handleChange(0);
      this.scriptComponent.setTabIndex(0, true, false);
      this.scriptComponent.getScript(this.selectedWsId, this.typeId, this.exportOption);
    }
    if (Number(this.exportStepper.selectedIndex) === 3) {
      this.parametersComponent.handleChange(0);
      this.parametersComponent.setTabIndex(0, true, false);
      this.scriptComponent.getTemplateIds();
      this.scriptComponent.getScriptIds();
      this.parametersComponent.getGlobalParameter(this.selectedWsId, this.typeId);
    }
    if (Number(this.exportStepper.selectedIndex) === 4) {
      this.resultComponent.handleChange(0);
      this.resultComponent.setTabIndex(0, true, false);
      this.parametersComponent.getGlobalParamsIds();
      this.parametersComponent.getAppParamsIds();
    }
  }
  /*=========== End Next Page ===========*/

  /*=========== Previous Page ===========*/
  previousStep() {
    this.exportStepper.previous();
    if (Number(this.exportStepper.selectedIndex) === 0) {
      this.introductionComponent.handleChange(1)
    }
    if (Number(this.exportStepper.selectedIndex) === 1) {
      this.itemsComponent.handleChange(2);
    }
    if (Number(this.exportStepper.selectedIndex) === 2) {
      this.scriptComponent.handleChange(1);
    }
    if (Number(this.exportStepper.selectedIndex) === 3) {
      this.parametersComponent.handleChange(1);
    }
    if (Number(this.exportStepper.selectedIndex) === 4) {
      this.resultComponent.handleChange(0);
    }
  }
  /*=========== End Previous Page ===========*/

  /*=========== Next Tab ===========*/
  nextTab(nextTabNo: number) {
    if (Number(this.exportStepper.selectedIndex) === 0) {
      if (this.isStepOneIntroValid()) {
        this.introductionComponent.setTabIndex(nextTabNo, true, false);
        this.introductionComponent.getContentSummary();
      }
    }
    if (Number(this.exportStepper.selectedIndex) === 1) {
      this.itemsComponent.setTabIndex(nextTabNo, true, false);
      if (Number(nextTabNo) === 1) {
        this.itemsComponent.getProcessItemsTree(this.selectedWsId, this.typeId, 'Process');
      }
      if (Number(nextTabNo) === 2) {
        this.itemsComponent.getTriggerItemsTree(this.selectedWsId, this.typeId, 'Trigger');
      }
    }
    if (Number(this.exportStepper.selectedIndex) === 2) {
      this.scriptComponent.setTabIndex(nextTabNo, true, false);
    }
    if (Number(this.exportStepper.selectedIndex) === 3) {
      this.parametersComponent.setTabIndex(nextTabNo, true, false);
      if (Number(nextTabNo) === 1) {
        this.parametersComponent.getApplicationParameter(this.selectedWsId, this.typeId);
      }
    }
    if (Number(this.exportStepper.selectedIndex) === 4) {
      this.resultComponent.setTabIndex(nextTabNo, true, false);
    }
  }
  /*=========== END Next Tab ===========*/

  /*=========== Previous Tab ===========*/
  previousTab(prevTabNo: number) {
    if (Number(this.exportStepper.selectedIndex) === 0) {
      this.introductionComponent.setTabIndex(prevTabNo, false, true);
    }
    if (Number(this.exportStepper.selectedIndex) === 1) {
      this.itemsComponent.setTabIndex(prevTabNo, false, true);
    }
    if (Number(this.exportStepper.selectedIndex) === 2) {
      this.scriptComponent.setTabIndex(prevTabNo, false, true);
    }
    if (Number(this.exportStepper.selectedIndex) === 3) {
      this.parametersComponent.setTabIndex(prevTabNo, false, true);
    }
    if (Number(this.exportStepper.selectedIndex) === 4) {
      this.resultComponent.setTabIndex(prevTabNo, false, true);
    }
  }
  /*=========== END Previous Tab ===========*/

  finishExport() {
    this.exportStepper.reset();
    this.toolsDataService.clearItemIds();
    this.toolsDataService.clearTempScriptIds();
    this.toolsDataService.clearParamsIds();
    this.introductionComponent.resetForm();
    if (Number(this.exportStepper.selectedIndex) === 0) {
      this.introductionComponent.handleChange(0);
      this.introductionComponent.setTabIndex(0, true, false);
    }
    if (Number(this.exportStepper.selectedIndex) === 1) {
      this.itemsComponent.handleChange(0);
      this.itemsComponent.setTabIndex(0, true, false);
    }
    if (Number(this.exportStepper.selectedIndex) === 2) {
      this.scriptComponent.handleChange(0);
      this.scriptComponent.setTabIndex(0, true, false);
    }
    if (Number(this.exportStepper.selectedIndex) === 3) {
      this.parametersComponent.handleChange(0);
      this.parametersComponent.setTabIndex(0, true, false);
    }
    if (Number(this.exportStepper.selectedIndex) === 4) {
      this.resultComponent.handleChange(0);
      this.resultComponent.setTabIndex(0, true, false);
    }
  }

  /*============= Export =============*/
  export() {
    const introductionFormData = this.introductionComponent.getStepIntroData();
    const integrationItemIds = this.toolsDataService.getIntegrationItemIds();
    const processItemIds = this.toolsDataService.getProcessItemIds();
    const triggerItemIds = this.toolsDataService.getTriggerItemIds();
    const applicationParamIds = this.parametersComponent.getAppParamsIds();
    const globalParamIds = this.parametersComponent.getGlobalParamsIds();
    const templateScriptIds = this.scriptComponent.getTemplateIds();
    const userScriptIds = this.scriptComponent.getScriptIds();

    if (integrationItemIds?.length ||
      processItemIds?.length ||
      triggerItemIds?.length ||
      applicationParamIds?.length ||
      globalParamIds?.length ||
      templateScriptIds?.length ||
      userScriptIds?.length) {
      const exportObj: Export = {
        workspaceId: this.selectedWsId,
        teisVersion: this.selectedExportToId,
        exportDeployedVersion: introductionFormData?.exportVersion === 'deployed' ? true : false,
        processIds: processItemIds,
        integrationIds: integrationItemIds,
        triggerIds: triggerItemIds,
        applicationParamIds: applicationParamIds,
        globalParamIds: globalParamIds,
        templateScriptIds: templateScriptIds,
        userScriptIds: userScriptIds
      };
      this.toolsService.export(exportObj).subscribe(res => {
        this.toolsDataService.storeExportData(res);
        this.resultComponent.getExportedData(res);
        const fileData = {
          byteArray: res?.encryptedContents,
          fileName: res?.fileName
        };
        this.downloadFile(fileData);
        this.exportStepper.next();
        this.messageService.add({ key: 'toolsSuccessKey', severity: 'success', summary: '', detail: 'Exported file downloaded successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    } else {
      this.messageService.add({ key: 'toolsInfoKey', severity: 'success', summary: '', detail: 'Please select at least one item to export.' });
    }
  }
  /*============= END Export =============*/

  /*============= Export All Workspaces =============*/
  exportAllWs() {
    const introductionFormData = this.introductionComponent.getStepIntroData();
    const exportObj: Export = {
      workspaceIds: this.allWorkspaceIds,
      teisVersion: this.selectedExportToId,
      exportDeployedVersion: introductionFormData?.exportVersion === 'deployed' ? true : false,
      processIds: [],
      integrationIds: [],
      triggerIds: [],
      applicationParamIds: [],
      globalParamIds: [],
      templateScriptIds: [],
      userScriptIds: []
    };
    this.toolsService.export(exportObj).subscribe(res => {
      this.toolsDataService.storeExportData(res);
      this.resultComponent.getExportedData(res);
      const fileData = {
        byteArray: res?.encryptedContents,
        fileName: res?.fileName
      };
      this.downloadFile(fileData);
      this.exportStepper.selectedIndex = 4;
      this.messageService.add({ key: 'toolsSuccessKey', severity: 'success', summary: '', detail: 'Exported file downloaded successfully!' });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  downloadFile(fileData: any) {
    const fileUrl = fileData?.byteArray;
    const blob = new Blob([this.base64ToArrayBuffer(fileUrl)], { type: 'expx' });
    const setUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = setUrl;
    a.download = fileData?.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      window.URL.revokeObjectURL(setUrl);
    }, 100);
  }

  base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  onCancel() {
    this.finishExport();
    this.toolsDataService.clearItemIds();
    this.toolsDataService.clearTempScriptIds();
    this.toolsDataService.clearParamsIds();
    this.introductionComponent.resetForm();
  }

  onRefresh() {

  }

}
