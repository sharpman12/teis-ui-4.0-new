import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { WorkspaceMgmtService } from '../../workspace-mgmt.service';
import { Workspaces } from '../../workspaces';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-edit-workspaces',
  templateUrl: './add-edit-workspaces.component.html',
  styleUrls: ['./add-edit-workspaces.component.scss']
})
export class AddEditWorkspacesComponent implements OnInit, OnDestroy {
  newWorkspaceForm: UntypedFormGroup;
  editWorkspaceForm: UntypedFormGroup;
  users: any;
  currentUser: any = null;
  workspaceId: number = null;

  validationMessages = {
    name: {
      required: "Name is required",
      maxlength: "Maximum 128 characters are allowed",
      hasWhitespace: "Whitespace not allowed"
    },
    description: {
      required: "Description is required",
      maxlength: "Maximum 2000 characters are allowed",
      hasWhitespace: "Whitespace not allowed"
    },
    defaultWorkspace: {
      required: "Default workspace is required"
    },
    archived: {
      required: "Archive workspace is required"
    },
    schedulerDisabled: {
      required: "Disabled scheduler is required"
    },
    webServiceDisabled: {
      required: "Disabled web service is required"
    }
  };

  formErrors = {
    name: "",
    description: "",
    defaultWorkspace: "",
    archived: "",
    schedulerDisabled: "",
    webServiceDisabled: ""
  };

  getUsersByWorkspaceSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AddEditWorkspacesComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private workspaceMgmtService: WorkspaceMgmtService
  ) {
    dialogRef.disableClose = true;
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.workspaceId = Number(this.dialogData?.workspace?.id);
    if (this.dialogData?.isAdd) {
      this.createForm();
    }
    if (!this.dialogData?.isAdd) {
      this.createEditForm();
      if (this.dialogData?.workspace?.id !== '') {
        this.editWorkspaceForm.patchValue({
          name: this.dialogData?.workspace?.name,
          description: this.dialogData?.workspace?.description,
          archived: this.dialogData?.workspace?.archived,
          schedulerDisabled: this.dialogData?.workspace?.schedulerDisabled,
          webServiceDisabled: this.dialogData?.workspace?.webServiceDisabled,
        });
        setTimeout(() => {
          this.getUsersByWorkspace(this.dialogData?.workspace?.id);
        });
        // Fixed Jira ticket: TEI-5134 Sample Workspace should be archived build 3.3.158
        if (Number(this.dialogData?.workspace?.id) === 1) {
          this.editWorkspaceForm.get('name').disable();
          // this.editWorkspaceForm.get('archived').disable();
        }
      }
    }
  }

  createForm() {
    this.newWorkspaceForm = this.fb.group({
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
      }]
    });
    this.newWorkspaceForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.newWorkspaceForm);
    });
  }

  createEditForm() {
    this.editWorkspaceForm = this.fb.group({
      name: [{ value: '', disabled: this.currentUser?.superAdminUser ? false : true }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      description: [{ value: '', disabled: this.currentUser?.superAdminUser ? false : true }, {
        validators: [
          Validators.maxLength(2000)
        ]
      }],
      // userIds: this.fb.array([
      //   this.usersList()
      // ]),
      archived: [{ value: false, disabled: false }, {
        validators: []
      }],
      schedulerDisabled: [{ value: false, disabled: false }, {
        validators: []
      }],
      webServiceDisabled: [{ value: false, disabled: false }, {
        validators: []
      }],
    });
    this.editWorkspaceForm.valueChanges.subscribe((data: any) => {
      this.editFormLogValidationErrors(this.editWorkspaceForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.newWorkspaceForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = "";
        if (
          abstractControl &&
          !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty)
        ) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + " ";
            }
          }
        }
      }
    });
  }
  /*============ END Check Form Validation and Display Messages ============*/

  /*============ Check Edit Form Validation and Display Messages ============*/
  editFormLogValidationErrors(group: UntypedFormGroup = this.editWorkspaceForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = "";
        if (
          abstractControl &&
          !abstractControl.valid &&
          (abstractControl.touched || abstractControl.dirty)
        ) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + " ";
            }
          }
        }
      }
    });
  }
  /*============ END Check Form Validation and Display Messages ============*/

  // usersList(): FormGroup {
  //   return this.fb.group({
  //     user: [{ value: '', disabled: false }]
  //   });
  // }

  /*================== Set Existing Parameters =================*/
  // setExistingParamerters(users: any[], isCtrlDisabled: any): FormArray {
  //   const formArray = new FormArray([]);
  //   users.forEach(p => {
  //     formArray.push(this.fb.group({
  //       user: [{ value: p.checked, disabled: isCtrlDisabled.isUser }]
  //     }));
  //   });
  //   return formArray;
  // }
  /*================== Set Existing Parameters =================*/

  createWorkspace(formValue: any) {
    this.newWorkspaceForm.markAllAsTouched();
    if (this.newWorkspaceForm.valid) {
      formValue.name = formValue.name.trim();
      formValue.description = formValue.description.trim();
      formValue.isSave = true;
      formValue.isAdd = true;
      formValue.isUpdate = false;
      this.dialogRef.close(formValue);
    }
  }

  updateWorkspace(values: any) {
    this.editWorkspaceForm.markAllAsTouched();
    const formValue = this.editWorkspaceForm.getRawValue();
    if (this.editWorkspaceForm.valid) {
      formValue.name = formValue.name.trim();
      formValue.description = formValue.description.trim();
      formValue.isSave = true;
      formValue.isAdd = false;
      formValue.isUpdate = true;
      const userIds = [];
      // formValue.userIds.forEach((item, index, arr) => {
      //   if (item?.user) {
      //     this.users.forEach((el, i, array) => {
      //       if (index === i) {
      //         userIds.push(el?.id);
      //       }
      //     });
      //   }
      // });
      this.users.forEach((el, i, array) => {
        if (el?.checked) {
          userIds.push(el?.id);
        }
      });
      formValue.userIds = userIds;
      formValue.id = this.dialogData?.workspace?.id;
      this.dialogRef.close(formValue);
    }
  }

  getUsersByWorkspace(workspaceId) {
    const obj = {
      type: "All",
      pageNumber: 1,
      name: null,
      excludeRecordId: null,
      userType: this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU',
      includeSuperAdmin: this.currentUser?.superAdminUser ? true : false,
      includeAdmin: this.currentUser?.superAdminUser ? true : this.currentUser?.adminUser ? true : false,
      includeUser: this.currentUser?.adminUser ? true : false,
      profileId: null,
      workspaceId: workspaceId
  }
    this.getUsersByWorkspaceSub = this.workspaceMgmtService.getUsersByWorkspace(obj).subscribe((res) => {
      res.forEach(item => {
        item.disabled = false;
      });
      this.users = res;
      this.onChangeArchive(this.dialogData?.workspace?.archived);
      // const userObj = {
      //   isUser: false
      // };
      // this.editWorkspaceForm.setControl('userIds', this.setExistingParamerters(res, userObj));
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onChangeArchive(isChecked: boolean) {
    if (isChecked) {
      this.editWorkspaceForm.get('schedulerDisabled').disable();
      this.editWorkspaceForm.get('webServiceDisabled').disable();
      this.users.forEach(item => {
        item.disabled = true;
      });
    } else {
      this.editWorkspaceForm.get('schedulerDisabled').enable();
      this.editWorkspaceForm.get('webServiceDisabled').enable();
      this.users.forEach(item => {
        item.disabled = false;
      });
    }
  }

  onCancel() {
    const formValue = {
      isSave: false,
      isAdd: false,
      isUpdate: false
    };
    this.dialogRef.close(formValue);
  }

  ngOnDestroy(): void {
    this.getUsersByWorkspaceSub.unsubscribe();
  }

}
