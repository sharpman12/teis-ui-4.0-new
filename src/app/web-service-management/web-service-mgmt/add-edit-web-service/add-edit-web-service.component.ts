import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { addUpdateUrl } from '../web-service-mgmt';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { WebServiceMgmtService } from '../web-service-mgmt.service';
import { Constants } from 'src/app/shared/components/constants';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';

@Component({
  selector: 'app-add-edit-web-service',
  templateUrl: './add-edit-web-service.component.html',
  styleUrls: ['./add-edit-web-service.component.scss']
})
export class AddEditWebServiceComponent implements OnInit, OnDestroy {
  webServicessForm: UntypedFormGroup;
  webServiceMgmtEnableDisableAccess: boolean = false;

  validationMessages = {
    url: {
      required: `Name of the uri should not be blank after "${this.dialogData.baseUrl}"`,
      maxlength: 'Uri must not be more than 1000 characters',
      hasWhitespace: "Whitespace not allowed"
    },
    disable: {
      required: 'Disable is required'
    }
  };

  formErrors = {
    url: '',
    disable: ''
  };

  addWebServiceSub = Subscription.EMPTY;
  updateWebServiceSub = Subscription.EMPTY;
  updateWebServiceUrlSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AddEditWebServiceComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private webServiceMgmtService: WebServiceMgmtService
  ) { }

  ngOnInit(): void {
    this.createForm();
    if (!this.dialogData?.isNew) {
      const diff = (diffMe, diffBy) => diffMe.split(diffBy).join('');
      const value = diff(this.dialogData?.value, this.dialogData.baseUrl);
      this.webServicessForm.patchValue({
        url: value,
        disable: this.dialogData?.disable
      });
    }
    if (this.dialogData?.name === 'URL') {
      this.webServicessForm.get('url').disable();
    } else {
      this.webServicessForm.get('url').enable();
    }
    if (localStorage.getItem(Constants.WEB_SERVICE_MANAGEMENT_ENABLE_DISABLE_ACCESS)) {
      this.webServiceMgmtEnableDisableAccess = true;
      this.webServicessForm.get('disable').enable();
    } else {
      this.webServiceMgmtEnableDisableAccess = false;
      this.webServicessForm.get('disable').disable();
    }
  }

  /*========== Create Form ==========*/
  createForm() {
    this.webServicessForm = this.fb.group({
      url: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(1000),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      disable: [{ value: false, disabled: false }, {
        validators: []
      }]
    });
    this.webServicessForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.webServicessForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.webServicessForm): void {
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

  /*============ Add New Url =============*/
  addNewUrl() {
    this.webServicessForm.markAllAsTouched();
    const formValues = this.webServicessForm.value;
    if (this.webServicessForm.valid) {
      formValues.isSave = true;
      formValues.isUpdate = false;
      formValues.id = this.dialogData?.id;
      formValues.appRegId = this.dialogData?.appRegId;
      // formValues.url = `${this.dialogData?.baseUrl}${formValues?.url}`;
      formValues.name = this.dialogData?.name;
      formValues.type = this.dialogData?.type;

      const urlObj: addUpdateUrl = {
        name: 'URI',
        value: formValues?.url,
        type: 1,
        id: null,
        appRegId: formValues.appRegId,
        disable: formValues?.disable,
      };
      const workspaceId = this.dialogData?.webService?.workspaceData?.id;
      this.addWebServiceSub = this.webServiceMgmtService.createWebService(Number(formValues?.appRegId), Number(workspaceId), urlObj).subscribe(res => {
        if (res) {
          this.dialogRef.close(formValues);
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
  /*============ END Add New Url =============*/

  /*============ Update Uri =============*/
  updateUri() {
    this.webServicessForm.markAllAsTouched();
    const formValues = this.webServicessForm.value;
    if (this.webServicessForm.valid) {
      formValues.isSave = false;
      formValues.isUpdate = true;
      formValues.id = this.dialogData?.id;
      formValues.appRegId = this.dialogData?.appRegId;
      // formValues.url = `${this.dialogData?.baseUrl}${formValues?.url}`;
      formValues.name = this.dialogData?.name;
      formValues.type = this.dialogData?.type;

      const urlObj: addUpdateUrl = {
        name: formValues?.name.trim(),
        value: formValues?.name === 'URL' ? this.dialogData?.baseUrl.trim() : formValues?.url.trim(),
        type: formValues?.type,
        id: formValues?.id,
        appRegId: formValues.appRegId,
        disable: formValues?.disable,
      };
      this.updateWebServiceSub = this.webServiceMgmtService.updateWebService(Number(formValues?.appRegId), urlObj).subscribe(res => {
        if (res) {
          this.dialogRef.close(formValues);
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
  /*============ END Update Uri =============*/

  /*============ Update Url ===========*/
  updateUrl() {
    this.webServicessForm.markAllAsTouched();
    const formValues = this.webServicessForm.getRawValue();
    if (this.webServicessForm.valid) {
      const webService = this.dialogData.webService;
      webService.enabled = !formValues?.disable;
      formValues.isSave = false;
      formValues.isUpdate = true;
      if (webService?.appParamsDataList?.length) {
        webService?.appParamsDataList.forEach(x => {
          delete x?.baseUrl;
          delete x?.description;
          delete x?.workspace;
          delete x?.workspaceName;
          delete x?.wsId;
          delete x?.webServiceName;
          delete x?.wsVersion;
        });
      }
      this.updateWebServiceUrlSub = this.webServiceMgmtService.updateWebServiceUrl(webService).subscribe(res => {
        if (res) {
          this.dialogRef.close(formValues);
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
  /*============ END Update Url ===========*/

  onClose() {
    const formValues = {
      isSave: false,
      isUpdate: false,
      url: '',
      disable: false
    };
    this.dialogRef.close(formValues);
  }

  ngOnDestroy(): void {
    this.addWebServiceSub.unsubscribe();
    this.updateWebServiceSub.unsubscribe();
    this.updateWebServiceUrlSub.unsubscribe();
  }
}
