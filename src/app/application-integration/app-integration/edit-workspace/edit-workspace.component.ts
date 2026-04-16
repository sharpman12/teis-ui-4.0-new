import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { AppIntegrationService } from '../app-integration.service';
import { Workspace } from '../appintegration';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DashboardDataService } from 'src/app/dashboard/dashboard-data.service';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';

@Component({
  selector: 'app-edit-workspace',
  templateUrl: './edit-workspace.component.html',
  styleUrls: ['./edit-workspace.component.scss']
})
export class EditWorkspaceComponent implements OnInit, OnDestroy {
  editWorkspaceForm: UntypedFormGroup;
  workspaces = [];
  currentUser: any;
  selectedWorkspace: Workspace;

  validationMessages = {
    name: {
      required: 'Name is required',
      maxlength: 'Maximum 128 characters are allowed',
      hasWhitespace: "Whitespace not allowed"
    },
    description: {
      required: 'Description is required',
      maxlength: 'Maximum 2000 characters are allowed'
    }
  };

  formErrors = {
    name: '',
    description: ''
  };

  updateWorkspaceSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<EditWorkspaceComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private dashboardDataService: DashboardDataService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {
    this.createForm();
    this.workspaces = this.dialogData?.allWorkspaces;
    this.onChangeWorkspace(this.dialogData?.workspaceId);
  }

  /*============== Create Form ===============*/
  createForm(): void {
    this.editWorkspaceForm = this.fb.group({
      workspaceId: [{ value: 1, disabled: false }, {
        validators: []
      }],
      name: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [
          Validators.maxLength(2000)
        ]
      }],
      defaultWorkspace: [{ value: false, disabled: false }, {
        validators: []
      }],
      schedulerDisabled: [{ value: false, disabled: false }, {
        validators: []
      }],
      webServiceDisabled: [{ value: false, disabled: false }, {
        validators: []
      }]
    });
    this.editWorkspaceForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.editWorkspaceForm);
    });
  }
  /*============== END Create Form ===============*/

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.editWorkspaceForm): void {
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
  /*============ END Check Form Validation and Display Messages ============*/

  /*============== On Change Workspace ===========*/
  onChangeWorkspace(workspaceId: number) {
    this.workspaces.forEach(item => {
      if (Number(item?.id) === Number(workspaceId)) {
        this.selectedWorkspace = item;
        this.setFormData(item);
      }
    });
  }
  /*============== END On Change Workspace ===========*/

  /*============== Set Form Data ===========*/
  setFormData(data) {
    if (Number(data?.id) === 1) {
      this.editWorkspaceForm.get('name').disable();
    } else {
      this.editWorkspaceForm.get('name').enable();
    }
    this.editWorkspaceForm.patchValue({
      workspaceId: data?.id,
      name: data?.name,
      description: data?.description,
      defaultWorkspace: data?.defaultWorkspace,
      schedulerDisabled: data?.schedulerDisabled,
      webServiceDisabled: data?.webServiceDisabled
    });
  }

  /*============== Update Workspace =============*/
  updateWorkspace() {
    this.dashboardDataService.clearAllWorkspaces();
    this.appIntegrationDataService.clearWorkspaces();
    this.editWorkspaceForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.editWorkspaceForm?.valid) {
      const formValue = this.editWorkspaceForm.getRawValue();
      this.selectedWorkspace.name = formValue?.name.trim();
      this.selectedWorkspace.description = formValue?.description.trim();
      this.selectedWorkspace.defaultWorkspace = formValue?.defaultWorkspace;
      this.selectedWorkspace.schedulerDisabled = formValue?.schedulerDisabled;
      this.selectedWorkspace.webServiceDisabled = formValue?.webServiceDisabled;
      this.selectedWorkspace.userIds = [this.currentUser?.id];
      this.updateWorkspaceSub = this.appIntegrationService.updateWorkspace(this.selectedWorkspace).subscribe(res => {
        if (res) {
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Workspace updated successfully!' });
          this.dialogRef.close();
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
  /*============== END Update Workspace =============*/

  /*=============== On Cancelled =============*/
  onClosed(): void {
    this.dialogRef.close();
  }
  /*=============== END On Cancelled =============*/

  ngOnDestroy(): void {
    this.updateWorkspaceSub.unsubscribe();
  }

}
