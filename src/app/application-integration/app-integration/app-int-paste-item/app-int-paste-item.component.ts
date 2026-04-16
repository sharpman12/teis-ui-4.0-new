import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { AppIntegrationService } from '../app-integration.service';
import { TreeItemDto } from '../appintegration';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ToTitleCaseService } from 'src/app/shared/services/to-title-case.service';


@Component({
  selector: 'app-app-int-paste-item',
  templateUrl: './app-int-paste-item.component.html',
  styleUrls: ['./app-int-paste-item.component.scss']
})
export class AppIntPasteItemComponent implements OnInit, OnDestroy {
  pasteItemForm: UntypedFormGroup;

  validationMessages = {
    name: {
      required: 'Name is required',
      maxlength: 'Maximum 128 characters are allowed'
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

  validateItemNameSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AppIntPasteItemComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private toTitleCaseService: ToTitleCaseService,
    private appIntegrationService: AppIntegrationService,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.createForm();
    this.pasteItemForm.patchValue({
      name: this.dialogData?.name,
      description: this.dialogData?.description
    });
  }

  /*============== Create Form ===============*/
  createForm(): void {
    this.pasteItemForm = this.fb.group({
      name: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128)
        ]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [
          Validators.maxLength(2000)
        ]
      }]
    });
    this.pasteItemForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.pasteItemForm);
    });
  }
  /*============== END Create Form ===============*/

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.pasteItemForm): void {
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

  /*============ Validate Item Name ============*/
  validateItemName() {
    const treeItemDto: TreeItemDto = {
      belongsToFolder: this.dialogData?.belongsToFolder,
      name: this.pasteItemForm.get('name').value,
      workspaceId: this.dialogData?.workspaceId,
      type: this.dialogData?.itemType
    };
    if (this.pasteItemForm.get('name').value) {
      this.validateItemNameSub = this.appIntegrationService.validateItemName(treeItemDto).subscribe(res => {
        if (res) {
          const itemType = this.toTitleCaseService.convertToTitleCase(this.dialogData?.itemType);
          // this.pasteItemForm.get('name').reset();
          this.pasteItemForm.markAllAsTouched();
          this.logValidationErrors();
          this.messageService.add({
            key: "appIntInfoKey",
            severity: "success",
            summary: "",
            detail: `${itemType} name already exist.`,
          });
        } else {
          this.pasteItem();
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

  /*============== Paste Item ==============*/
  pasteItem() {
    this.pasteItemForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.pasteItemForm.valid) {
      const pasteObj = {
        isPaste: true,
        name: this.pasteItemForm.get('name').value,
        description: this.pasteItemForm.get('description').value,
        belongsToFolder: this.dialogData?.belongsToFolder,
        itemType: this.dialogData?.itemType,
        workspaceId: this.dialogData?.workspaceId
      };
      this.dialogRef.close(pasteObj);
    }
  }
  /*============== END Paste Item ==============*/

  onCancel() {
    const pasteObj = {
      isPaste: false,
      name: '',
      description: '',
      belongsToFolder: this.dialogData?.belongsToFolder,
      itemType: this.dialogData?.itemType,
      workspaceId: this.dialogData?.workspaceId
    };
    this.dialogRef.close(pasteObj);
  }

  ngOnDestroy(): void {
    this.validateItemNameSub.unsubscribe();
  }
}
