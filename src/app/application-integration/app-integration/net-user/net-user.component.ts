import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { AppIntegrationService } from '../app-integration.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NetUser } from '../appintegration';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { MessageService } from 'primeng/api';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { StartWith } from 'src/app/shared/validation/start-with.validator';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { DevelopmentService } from 'src/app/development/development.service';

@Component({
  selector: 'app-net-user',
  templateUrl: './net-user.component.html',
  styleUrls: ['./net-user.component.scss']
})
export class NetUserComponent implements OnInit, OnDestroy {
  netUserForm: UntypedFormGroup;
  netUsers: Array<NetUser> = [];
  isEdit: boolean = false;
  editedNetUser: NetUser;
  currentUser: any;
  isAddNetUser: boolean = false;
  isPasswordVisible: boolean = false;
  searchNetUsers: string = '';
  scriptEngineGroups: Array<any> = [];
  scriptEngines: Array<any> = [];
  debugSeStatus: string = '';

  validationMessages = {
    domain: {
      required: 'Domain is required',
      maxlength: 'Domain must not be more than 1000 characters',
      hasWhitespace: "Whitespace not allowed"
    },
    username: {
      required: 'Username is required',
      maxlength: 'Username must not be more than 1000 characters',
      hasWhitespace: "Whitespace not allowed"
    },
    password: {
      required: 'Password is required',
      maxlength: 'password must not be more than 1000 characters',
      hasWhitespace: "Whitespace not allowed"
    },
    resource: {
      required: 'Resource is required',
      maxlength: 'Resource must not be more than 1000 characters',
      hasString: 'Please enter valid resource path start with "\\\\"',
      hasWhitespace: "Whitespace not allowed"
    },
    scriptEngineGroup: {
      required: "Script engine group is required",
    },
    scriptEngine: {
      required: "Script engine is required",
    }
  };

  formErrors = {
    domain: '',
    username: '',
    password: '',
    resource: '',
    scriptEngineGroup: '',
    scriptEngine: ''
  };

  private getAllNetUserSub = Subscription.EMPTY;
  private verifyNetUserSub = Subscription.EMPTY;
  private createNetUserSub = Subscription.EMPTY;
  private updateNetUserSub = Subscription.EMPTY;
  private deleteNetUserSub = Subscription.EMPTY;
  private verifyNetUserConnectionSub = Subscription.EMPTY;
  private getScriptEngineInfoSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<NetUserComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private messageService: MessageService,
    private encryptDecryptService: EncryptDecryptService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService,
    private developmentService: DevelopmentService,
  ) {
    this.dialogRef.disableClose = true;
    this.getAllNetUsers(null, false, false);
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {
    this.createForm();
    this.getScriptEnginesInfo();
  }

  /*============== Create Form ===============*/
  createForm(): void {
    this.netUserForm = this.fb.group({
      domain: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(1000),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      username: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(1000),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      password: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(1000),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      resource: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(1000),
          StartWith.StartWithValidator('"\\\\"', { hasString: true }),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      scriptEngineGroup: [{ value: null, disabled: false }, {
        validators: [Validators.required]
      }],
      scriptEngine: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
    });
    this.netUserForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.netUserForm);
    });
  }
  /*============== END Create Form ===============*/

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.netUserForm): void {
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

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  /*============= Get Script Engines Info =============*/
  getScriptEnginesInfo(): void {
    this.getScriptEngineInfoSub = this.developmentService.getScriptEngineGroups().subscribe((res) => {
      if (res?.length) {
        this.scriptEngineGroups = res;
        this.netUserForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.id);
        this.onChangeSEGroup();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onChangeSEGroup(): void {
    const formValues = this.netUserForm.getRawValue();
    const selectedGroup = this.scriptEngineGroups.find(x => x.id === formValues?.scriptEngineGroup);
    if (selectedGroup) {
      this.scriptEngines = selectedGroup?.scriptEngines || [];
      this.netUserForm.get('scriptEngine').patchValue(this.scriptEngines[0]?.id);
      this.onChangeDebugSE();
    }
  }

  onChangeDebugSE() {
    const formValues = this.netUserForm.getRawValue();
    const selectedScriptEngine = this.scriptEngines.find(x => x.id === formValues?.scriptEngine);
    this.debugSeStatus = selectedScriptEngine?.status;
  }

  /*============= Add Net User =============*/
  addNetUser() {
    this.isAddNetUser = true;
    this.isEdit = false;
  }
  /*============= END Add Net User =============*/

  /*============= Cancelled Add/Update Net User =============*/
  onCancel() {
    this.isAddNetUser = false;
    if (this.netUsers?.length) {
      this.netUsers.forEach(u => {
        u.recentlyCreated = false;
        u.recentlyUpdated = false;
      });
    }
    this.netUserForm.reset();
    this.netUserForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.id);
    this.onChangeSEGroup();
  }
  /*============= END Cancelled Add/Update Net User =============*/

  /*=============== Verify Net User Connection =============*/
  verifyNetUserConnection() {
    this.netUserForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.debugSeStatus !== 'STARTED') {
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Net user connection cannot be verified: The selected script engine is not active or running.' });
      return;
    }
    if (this.netUserForm?.valid) {
      const formValues = this.netUserForm.getRawValue();
      let encryptedPassword = '';
      if (formValues?.password) {
        encryptedPassword = this.encryptDecryptService.encrypt(formValues?.password.trim());
      }
      const obj = {
        scriptEngine: this.scriptEngines[0].key,
        netUser: {
          userName: formValues?.username.trim(),
          password: encryptedPassword,
          resource: formValues?.resource.trim(),
          domain: formValues?.domain
        }

      };
      this.verifyNetUserConnectionSub = this.appIntegrationService.verifyNetUserConnection(obj).subscribe((res) => {
        if (res?.success) {
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Net user verified successfully.' });
        } else {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: res?.status });
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

  /*=============== Create Net User =============*/
  createNetUser() {
    this.netUserForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.netUserForm?.valid && this.dialogData?.isCRUDNetUserWithTestAccess) {
      const formValues = this.netUserForm.getRawValue();
      let encryptedPassword = '';
      if (formValues?.password) {
        encryptedPassword = this.encryptDecryptService.encrypt(formValues?.password.trim());
      }
      const netUserDto: NetUser = {
        domain: formValues?.domain.trim(),
        executableId: null,
        lastUpdated: '',
        password: encryptedPassword,
        priorityLevel: 'High',
        resource: formValues?.resource.trim(),
        updatedBy: this.currentUser?.userName,
        userName: formValues?.username.trim(),
        workspace: this.dialogData?.workspace
      };
      this.verifyNetUserSub = this.appIntegrationService.verifyNetUser(netUserDto).subscribe(isVerify => {
        if (isVerify) {
          const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '700px',
            maxHeight: '600px',
            data: 'The resource is already used for some other net user. This may cause an error while execution. Do you want to continue?'
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.create(netUserDto);
            } else {
              this.netUserForm.get('resource').reset();
            }
          });
        } else {
          this.create(netUserDto);
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

  create(netUserDto: NetUser) {
    if (this.dialogData?.isCRUDNetUserWithTestAccess) {
      this.createNetUserSub = this.appIntegrationService.createNetUser(netUserDto).subscribe(res => {
        this.appIntegrationDataService.createNetUser(this.dialogData?.workspace?.id, res);
        this.getAllNetUsers(res?.id, true, false);
        this.netUserForm.reset();
        this.netUserForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.id);
        this.onChangeSEGroup();
        this.isAddNetUser = false;
        this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Net user created successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*=============== END Create Net User =============*/

  /*============= Edit Net User =============*/
  editNetUser(netUser: NetUser) {
    if (this.dialogData?.isCRUDNetUserWithTestAccess) {
      let decryptPassword = '';
      this.isEdit = true;
      this.isAddNetUser = true;
      this.editedNetUser = netUser;
      if (netUser?.password) {
        decryptPassword = this.encryptDecryptService.decrypt(netUser?.password);
      }
      this.netUserForm.patchValue({
        domain: netUser?.domain,
        username: netUser?.userName,
        password: decryptPassword,
        resource: netUser?.resource,
        scriptEngineGroup: this.scriptEngineGroups[0]?.id,
      });
      this.onChangeSEGroup();
    }
  }

  updateNetUser() {
    this.netUserForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.dialogData?.isCRUDNetUserWithTestAccess && this.netUserForm?.valid) {
      const formValues = this.netUserForm.getRawValue();
      let encryptedPassword = '';
      if (formValues?.password) {
        encryptedPassword = this.encryptDecryptService.encrypt(formValues?.password.trim());
      }
      const netUserDto: NetUser = {
        domain: formValues?.domain.trim(),
        executableId: null,
        id: this.editedNetUser?.id ? this.editedNetUser?.id : null,
        lastUpdated: '',
        password: encryptedPassword,
        priorityLevel: this.editedNetUser?.priorityLevel,
        resource: formValues?.resource.trim(),
        updatedBy: this.currentUser?.userName,
        userName: formValues?.username.trim(),
        workspace: this.dialogData?.workspace
      };
      if (this.editedNetUser?.resource !== this.netUserForm.get('resource').value) {
        this.verifyNetUserSub = this.appIntegrationService.verifyNetUser(netUserDto).subscribe(isVerify => {
          if (isVerify) {
            const dialogRef = this.dialog.open(ConfirmationComponent, {
              width: '700px',
              maxHeight: '600px',
              data: 'The resource is already used for some other net user. This may cause an error while execution. Do you want to continue?'
            });
            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                this.update(netUserDto);
              } else {
                this.netUserForm.get('resource').reset();
              }
            });
          } else {
            this.update(netUserDto);
          }
        }, (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        });
      } else {
        this.update(netUserDto);
      }
    }
  }

  update(netUserDto: NetUser) {
    if (this.dialogData?.isCRUDNetUserWithTestAccess) {
      this.updateNetUserSub = this.appIntegrationService.updateNetUser(netUserDto).subscribe(res => {
        this.appIntegrationDataService.updateNetUser(this.dialogData?.workspace?.id, res);
        this.isEdit = false;
        this.isAddNetUser = false;
        this.getAllNetUsers(res?.id, false, true);
        this.netUserForm.reset();
        this.netUserForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.id);
        this.onChangeSEGroup();
        this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Net user updated successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*============= END Edit Net User =============*/

  /*============= Delete Net User =============*/
  deleteNetUser(id: number) {
    if (this.dialogData?.isCRUDNetUserWithTestAccess) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '700px',
        maxHeight: '600px',
        data: 'Are you sure you want to delete this net user?'
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.deleteNetUserSub = this.appIntegrationService.deleteNetUser(id).subscribe(res => {
            this.appIntegrationDataService.deleteNetUser(this.dialogData?.workspace?.id, id);
            this.getAllNetUsers(res?.id, false, false);
            this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Net user deleted successfully!' });
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

  /*============= On Reset =============*/
  resetForm(): void {
    this.isEdit = false;
    this.netUserForm.reset();
    this.netUserForm.get('scriptEngineGroup').patchValue(this.scriptEngineGroups[0]?.id);
    this.onChangeSEGroup();
  }
  /*============= END On Reset =============*/

  /*=============== Get All Net Users =============*/
  getAllNetUsers(netUserId: number, isCreated: boolean, isUpdated: boolean) {
    const netUsers = this.appIntegrationDataService.getAllNetUsersByWorkspaceId(this.dialogData?.workspace?.id);
    if (netUsers?.netUsers?.length) {
      netUsers?.netUsers.forEach(e => {
        if (Number(e?.id) === Number(netUserId)) {
          e.recentlyCreated = isCreated;
          e.recentlyUpdated = isUpdated;
        } else {
          e.recentlyCreated = false;
          e.recentlyUpdated = false;
        }
      });
      this.netUsers = netUsers?.netUsers.sort((a, b) => a.domain.localeCompare(b.domain));;
    } else {
      this.getAllNetUserSub = this.appIntegrationService.getNetUsers(this.dialogData?.workspace?.id).subscribe((netusers) => {
        if (netusers?.length) {
          const res = JSON.parse(JSON.stringify(netusers));
          res.forEach(x => {
            if (Number(x?.id) === Number(netUserId)) {
              x.recentlyCreated = isCreated;
              x.recentlyUpdated = isUpdated;
            } else {
              x.recentlyCreated = false;
              x.recentlyUpdated = false;
            }
          });
          const sortedNetUsers = res.sort((a, b) => a.domain.localeCompare(b.domain));
          this.netUsers = sortedNetUsers;
          const netUsersDto = {
            workspaceId: this.dialogData?.workspace?.id,
            netUsers: sortedNetUsers
          };
          this.appIntegrationDataService.storeNetUsers(netUsersDto);
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
  /*=============== END Get All Net Users =============*/

  onClosed() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.getAllNetUserSub.unsubscribe();
    this.verifyNetUserSub.unsubscribe();
    this.createNetUserSub.unsubscribe();
    this.updateNetUserSub.unsubscribe();
    this.deleteNetUserSub.unsubscribe();
    this.verifyNetUserConnectionSub.unsubscribe();
    this.getScriptEngineInfoSub.unsubscribe();
  }

}
