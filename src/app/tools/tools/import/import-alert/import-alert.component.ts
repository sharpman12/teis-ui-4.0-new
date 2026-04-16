import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { ToolsService } from '../../tools.service';

@Component({
  selector: 'app-import-alert',
  templateUrl: './import-alert.component.html',
  styleUrls: ['./import-alert.component.scss']
})
export class ImportAlertComponent implements OnInit {
  defaultAlertProcesses = [];
  workspaceId: number;
  selectedImportFrom: string;
  selectedAlertProcess: any = null;
  defaultAlertForm: UntypedFormGroup;
  alertEnabledForProcesses: boolean = false;
  alertEnabledForIntegrations: boolean = false;
  alertEnabledForTriggers: boolean = false;

  constructor(
    private toolsService: ToolsService,
    private dialog: MatDialog,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    this.toolsService.selectedImportDetails.subscribe(res => {
      this.workspaceId = res?.workspaceId;
      this.selectedImportFrom = res?.importFromId;
      this.alertEnabledForProcesses = res?.alertEnabledForProcesses;
      this.alertEnabledForIntegrations = res?.alertEnabledForIntegrations;
      this.alertEnabledForTriggers = res?.alertEnabledForTriggers;
    });
    this.createForm();
  }

  createForm() {
    this.defaultAlertForm = this.fb.group({
      defaultAlertProcess: [{ value: '', disabled: false }, {
        validators: []
      }],
    });
  }

  /*============ Get All Alert Process ============*/
  getAlertProcesses() {
    const workspaceId = this.workspaceId;
    this.defaultAlertProcesses = [];
    if (this.selectedImportFrom !== '2.x') {
      this.defaultAlertForm.get('defaultAlertProcess').disable();
    } else {
      this.defaultAlertForm.get('defaultAlertProcess').enable();
    }
    if (this.alertEnabledForProcesses || this.alertEnabledForIntegrations || this.alertEnabledForTriggers) {
      this.toolsService.getActiveAlertProcess(Number(workspaceId)).subscribe(res => {
        if (res?.length) {
          this.defaultAlertProcesses = res;
          this.setDefaultAlertProcess(res);
        } else {
          if (this.selectedImportFrom === '2.x') {
            this.getProcessIdNamesForAlert(workspaceId);
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
  }

  /*============ Get Process id names For Alert ============*/
  getProcessIdNamesForAlert(workspaceId) {
    this.defaultAlertProcesses = [];
    this.toolsService.getProcessIdNamesForAlert(Number(workspaceId)).subscribe(alertProcess => {
      this.defaultAlertProcesses = alertProcess;
      this.setDefaultAlertProcess(alertProcess);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============ On Change Alert Process ============*/
  onChangeAlertProcess(alertProcessId: any) {
    if (alertProcessId === '') {
      this.selectedAlertProcess = alertProcessId;
    } else {
      if (this.defaultAlertProcesses?.length) {
        this.defaultAlertProcesses.forEach(item => {
          if (Number(item?.id) === Number(alertProcessId)) {
            this.selectedAlertProcess = item;
          }
        });
      }
    }
    this.sharedAlertProcess(this.selectedAlertProcess);
  }

  get sendSelectedAlertProcess() {
    return this.selectedAlertProcess;
  }

  setDefaultAlertProcess(alertProcess: Array<any>) {
    if (alertProcess?.length) {
      let defaultAlertId = '';
      alertProcess.forEach(item => {
        if (item?.defaultAlert) {
          defaultAlertId = item?.id;
        }
      });
      if (defaultAlertId) {
        this.defaultAlertForm.patchValue({
          defaultAlertProcess: defaultAlertId
        });
        this.onChangeAlertProcess(defaultAlertId);
      } else {
        this.defaultAlertForm.patchValue({
          defaultAlertProcess: ''
        });
        this.onChangeAlertProcess('');
      }
    } else {
      this.defaultAlertForm.patchValue({
        defaultAlertProcess: ''
      });
      this.onChangeAlertProcess('');
    }
  }

  resetStepFour() {
    this.defaultAlertForm.patchValue({
      defaultAlertProcess: ''
    });
    this.onChangeAlertProcess('');
  }

  sharedAlertProcess(alertProcess: any) {
    this.toolsService.sendSelectedAlertProcess(alertProcess);
  }

}
