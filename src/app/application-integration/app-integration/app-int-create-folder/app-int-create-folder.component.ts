import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { AppIntegrationService } from '../app-integration.service';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { CreateFolderDto } from '../appintegration';
import { HttpErrorResponse } from '@angular/common/http';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';

@Component({
  selector: 'app-app-int-create-folder',
  templateUrl: './app-int-create-folder.component.html',
  styleUrls: ['./app-int-create-folder.component.scss']
})
export class AppIntCreateFolderComponent implements OnInit, OnDestroy {
  createFolderForm: UntypedFormGroup;
  duplicateFolderErr: string = null;

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

  createFolderSub = Subscription.EMPTY;
  updateFolderSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AppIntCreateFolderComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.createForm();
    if (!this.dialogData?.isNewFolder) {
      this.createFolderForm.patchValue({
        name: this.dialogData?.name,
        description: this.dialogData?.description,
      });
    }
     setTimeout(() => {
      const inputElement = document.getElementById('foldername') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 200);
  }

  /*============== Create Form ===============*/
  createForm(): void {
    this.createFolderForm = this.fb.group({
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
      }]
    });
    this.createFolderForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.createFolderForm);
    });
  }

  get f() {
    return this.createFolderForm.controls;
  }
  /*============== END Create Form ===============*/

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.createFolderForm): void {
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

  /*============== Create Folder ==============*/
  createFolder() {
    this.createFolderForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.createFolderForm.valid) {
      const createFolderDto: CreateFolderDto = {
        workspaceId: this.dialogData?.workspaceId,
        belongsToFolder: this.dialogData?.belongsToFolder,
        name: this.f.name.value.trim(),
        description: this.f.description.value.trim(),
        type: this.dialogData?.type
      }
      this.createFolderSub = this.appIntegrationService.createFolder(createFolderDto).subscribe(res => {
        this.dialogRef.close(true);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
          this.duplicateFolderErr = err?.error?.message;
          // this.createFolderForm.get('name').reset();
        }
      });
    }
  }
  /*============== END Create Folder ==============*/

  /*============== Update Folder ==============*/
  updateFolder() {
    this.createFolderForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.createFolderForm.valid) {
      const createFolderDto: CreateFolderDto = {
        id: this.dialogData?.id,
        workspaceId: this.dialogData?.workspaceId,
        belongsToFolder: this.dialogData?.belongsToFolder,
        name: this.f.name.value ? this.f.name.value.trim() : this.f.name.value,
        description: this.f.description.value ? this.f.description.value.trim() : this.f.description.value,
        type: this.dialogData?.type
      }
      this.updateFolderSub = this.appIntegrationService.updateFolder(createFolderDto).subscribe(res => {
        this.dialogRef.close(true);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
          this.duplicateFolderErr = err?.error?.message;
          this.createFolderForm.get('name').reset();
        }
      });
    }
  }
  /*============== END Update Folder ==============*/

  /*=============== On Cancelled =============*/
  onCancelled(): void {
    this.dialogRef.close(false);
  }
  /*=============== END On Cancelled =============*/

  ngOnDestroy(): void {
    this.createFolderSub.unsubscribe();
    this.updateFolderSub.unsubscribe();
  }

}
