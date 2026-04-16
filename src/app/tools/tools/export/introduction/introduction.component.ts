import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Workspaces } from '../../tools';
import { ToolsDataService } from '../../tools-data.service';
import { ToolsService } from '../../tools.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.scss']
})
export class IntroductionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() activeTabIndex: number = 0;
  activeTab: number = 0;
  @Output() currentTabIndex: EventEmitter<number> = new EventEmitter<number>();
  stepOneIntroductionForm: UntypedFormGroup;
  selectedExportToId: string = null;
  selectedWorkspace: Workspaces;
  selectedType: number;
  exportOption: string = 'exportConnected';
  exportVersion: string = 'deployed';
  workspaces: Array<Workspaces>;
  appCount: { appParamsCount: number; templatesCount: number; };
  workspacesCount = [];
  defaultWorkspace: Workspaces;
  currentUser: any = null;
  exportTo = [
    { id: '3.3', name: 'TEIS v3.3 format - SP6' },
    { id: '3.3.1', name: 'TEIS v3.3 format - SP5 (UTF8)' },
    { id: '3.3.2', name: 'TEIS v3.3 format - SP4 and below (ANSI)' },
    { id: '3.2', name: 'TEIS v3.2 format' }
  ];
  exportType = [
    { id: 1, name: 'Complete workspace' },
    { id: 2, name: 'Selected items from workspace' },
    { id: 3, name: 'All workspaces' },
  ];

  validationMessages = {
    exportTo: {
      required: 'Export to is required',
    },
    workspace: {
      required: 'Workspace is required'
    },
    exportType: {
      required: 'Export type is required',
    },
    exportOption: {
      required: 'Export option is required'
    },
  };

  formErrors = {
    exportTo: '',
    workspace: '',
    exportType: '',
    exportOption: ''
  };

  getWorkspacesSub = Subscription.EMPTY;

  constructor(
    private fb: UntypedFormBuilder,
    private toolsService: ToolsService,
    private toolsDataService: ToolsDataService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // this.currentTabIndex.next(changes?.activeTabIndex?.currentValue);
  }

  ngOnInit(): void {
    this.getWorkspaces();
    this.createStepOneForm();
    this.onChangeExportTo('3.3');
    this.onChangeType(1);
    this.onChangeExportOptions('exportConnected');
  }

  resetForm() {
    this.exportOption = 'exportConnected';
    this.stepOneIntroductionForm.patchValue({
      exportTo: 3.3,
      workspace: Number(this.defaultWorkspace?.id),
      exportType: 1,
      exportOption: this.exportOption,
      exportVersion: this.exportVersion
    });
    this.onChangeExportTo('3.3');
    this.onChangeWorkspace(Number(this.defaultWorkspace?.id));
    this.onChangeType(1);
    this.onChangeExportOptions('exportConnected');
  }

  createStepOneForm() {
    this.stepOneIntroductionForm = this.fb.group({
      exportTo: [{ value: 3.3, disabled: false }, {
        validators: [Validators.required]
      }],
      workspace: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      exportType: [{ value: 1, disabled: false }, {
        validators: [Validators.required]
      }],
      exportOption: [{ value: this.exportOption, disabled: false }, {
        validators: [Validators.required]
      }],
      exportVersion: [{ value: this.exportVersion, disabled: false }, {
        validators: [Validators.required]
      }]
    });
    this.stepOneIntroductionForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.stepOneIntroductionForm);
    });
  }

  /*============Check Form Validation and Display Messages============*/
  logValidationErrors(group: UntypedFormGroup = this.stepOneIntroductionForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = '';
        if (abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty)) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    });
  }
  /*============END Check Form Validation and Display Messages============*/

  isStepOneIntroValid() {
    this.stepOneIntroductionForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.stepOneIntroductionForm?.valid) {
      this.toolsService.sendSelectedWsAndType({
        exportToId: this.selectedExportToId,
        workspaceId: Number(this.selectedWorkspace?.id),
        workspaceName: this.selectedWorkspace?.name,
        allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
        typeId: this.selectedType,
        exportOption: this.exportOption,
        isExportDeployedVersion: this.stepOneIntroductionForm.get('exportVersion').value === 'deployed' ? true : false
      });
      return true;
    } else {
      return false;
    }
  }

  getStepIntroData() {
    this.stepOneIntroductionForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.stepOneIntroductionForm?.valid) {
      return this.stepOneIntroductionForm.getRawValue();
    }
  }

  handleChange(index: number) {
    // const index = e.index;
    if (index === 0) {
      this.currentTabIndex.next(index);
    }
    if (index === 1) {
      this.currentTabIndex.next(index);
      this.getContentSummary();
    }
  }

  /*=========== Set Tab Index ===========*/
  setTabIndex(index: number, nextTab: boolean, prevTab: boolean) {
    this.activeTab = index;
    this.currentTabIndex.next(index);
  }
  /*=========== END Set Tab Index ===========*/

  /*=========== On Select Export To =============*/
  onChangeExportTo(selectedExportToId: string) {
    this.selectedExportToId = selectedExportToId;
    // this.toolsService.sendSelectedWsAndType({
    //   exportToId: this.selectedExportToId,
    //   workspaceId: Number(this.selectedWorkspace?.id),
    //   workspaceName: this.selectedWorkspace?.name,
    //   allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
    //   typeId: this.selectedType,
    //   exportOption: this.exportOption,
    //   isExportDeployedVersion: this.stepOneIntroductionForm.get('exportVersion').value === 'deployed' ? true : false
    // });
  }

  /*============ On Select Workspace ============*/
  onChangeWorkspace(selectedWsId: number) {
    this.toolsDataService.clearItemIds();
    this.toolsDataService.clearTempScriptIds();
    this.toolsDataService.clearParamsIds();
    if (this.workspaces?.length) {
      this.workspaces.forEach(item => {
        if (Number(item?.id) === Number(selectedWsId)) {
          this.selectedWorkspace = item;
        }
      });
    }
    this.toolsService.sendSelectedWorkspace({
      workspaceName: this.selectedWorkspace?.name,
      workspaceId: Number(selectedWsId)
    });
    // this.toolsService.sendSelectedWsAndType({
    //   exportToId: this.selectedExportToId,
    //   workspaceId: Number(this.selectedWorkspace?.id),
    //   workspaceName: this.selectedWorkspace?.name,
    //   allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
    //   typeId: this.selectedType,
    //   exportOption: this.exportOption,
    //   isExportDeployedVersion: this.stepOneIntroductionForm.get('exportVersion').value === 'deployed' ? true : false
    // });
  }
  /*============ END On Select Workspace ============*/

  /*============ On Selected Type ============*/
  onChangeType(selectedType: number) {
    this.toolsDataService.clearItemIds();
    this.toolsDataService.clearTempScriptIds();
    this.toolsDataService.clearParamsIds();
    this.selectedType = Number(selectedType);
    if (this.selectedType === 3) {
      this.stepOneIntroductionForm.get('workspace').disable();
    } else {
      this.stepOneIntroductionForm.get('workspace').enable();
    }
    this.toolsService.sendSelectedType(this.selectedType);
    // this.toolsService.sendSelectedWsAndType({
    //   exportToId: this.selectedExportToId,
    //   workspaceId: Number(this.selectedWorkspace?.id),
    //   workspaceName: this.selectedWorkspace?.name,
    //   allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
    //   typeId: this.selectedType,
    //   exportOption: this.exportOption,
    //   isExportDeployedVersion: this.stepOneIntroductionForm.get('exportVersion').value === 'deployed' ? true : false
    // });
  }
  /*============ END On Selected Type ============*/

  /*============ On Change Export Options ===========*/
  onChangeExportOptions(exportOption: string) {
    this.toolsDataService.clearItemIds();
    this.toolsDataService.clearTempScriptIds();
    this.toolsDataService.clearParamsIds();
    this.exportOption = exportOption;
    this.toolsService.sendSelectedExportOptions(exportOption);
    // this.toolsService.sendSelectedWsAndType({
    //   exportToId: this.selectedExportToId,
    //   workspaceId: Number(this.selectedWorkspace?.id),
    //   workspaceName: this.selectedWorkspace?.name,
    //   allWorkspaceIds: this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [],
    //   typeId: this.selectedType,
    //   exportOption: this.exportOption,
    //   isExportDeployedVersion: this.stepOneIntroductionForm.get('exportVersion').value === 'deployed' ? true : false
    // });
  }
  /*============ END On Change Export Options ===========*/

  /*============ Get Workspaces ============*/
  getWorkspaces() {
    let defaultWS = null;
    const accessWorkspacesArr = [];
    const accessWorkspaces = this.currentUser?.workspaceAccess;
    this.getWorkspacesSub = this.toolsService.getActiveWorkspaces().subscribe(res => {

      if (res?.length && accessWorkspaces?.length) {
        // Filter out archived workspaces
        const workspacesArr = JSON.parse(JSON.stringify(res)).filter((x) => !x?.archived);
        accessWorkspaces.forEach((aws) => {
          workspacesArr.forEach((ws) => {
            if (Number(aws?.workspaceId) === Number(ws?.id)) {
              if (aws?.accessList.some((x) => x?.key === 'TLS_IX_WI')) {
                accessWorkspacesArr.push(ws);
              }
            }
          });
        });

        this.workspaces = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));

        if (this.workspaces?.length) {
          defaultWS = this.workspaces.find((x) => x?.defaultWorkspace);
          if (defaultWS) {
            this.defaultWorkspace = defaultWS;
            this.stepOneIntroductionForm.get('workspace').patchValue(Number(defaultWS?.id));
            this.onChangeWorkspace(Number(defaultWS?.id));
          } else {
            this.defaultWorkspace = this.workspaces[0];
            this.stepOneIntroductionForm.get('workspace').patchValue(Number(this.workspaces[0]?.id));
            this.onChangeWorkspace(Number(this.workspaces[0]?.id));
          }
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
  /*============ END Get Workspaces ============*/

  /*============ Content Summary ============*/
  getContentSummary() {
    let workspaceIds = [];
    if (this.selectedType === 3) {
      workspaceIds = this.workspaces?.length ? this.workspaces.map(a => Number(a?.id)) : [];
    } else {
      workspaceIds = [this.stepOneIntroductionForm.get('workspace').value];
    }
    const isExportDeployedVersion = this.stepOneIntroductionForm.get('exportVersion').value === 'deployed' ? true : false
    this.toolsService.getExportContent(workspaceIds, isExportDeployedVersion).subscribe(res => {
      this.appCount = {
        appParamsCount: res?.appParamsCount,
        templatesCount: res?.templatesCount
      };
      this.workspacesCount = res?.workspaceContent;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    })
  }

  ngOnDestroy(): void {
    this.getWorkspacesSub.unsubscribe();
  }

}
