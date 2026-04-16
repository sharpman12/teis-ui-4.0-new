import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from "@angular/material/legacy-dialog";
import { MessageService } from "primeng/api";
import { Constants } from "src/app/shared/components/constants";
import { PasswordStrength } from "src/app/shared/validation/password-strength.validator";
import { ScriptParameterDto } from "../../config";
import { ConfigurationsService } from "../../configurations.service";
import * as CryptoJS from "crypto-js";
import { EncryptDecryptService } from "src/app/shared/services/encrypt-decrypt.service";
import { Subscription } from "rxjs";
import { CheckWhitespace } from "src/app/shared/validation/check-whitespace.validator";
import { pipeOperatorNotAllowedValidator } from "src/app/shared/validation/pipe-operator.validator";

@Component({
  selector: "app-add-edit-app-params",
  templateUrl: "./add-edit-app-params.component.html",
  styleUrls: ["./add-edit-app-params.component.scss"],
})
export class AddEditAppParamsComponent implements OnInit, OnDestroy {
  paramsForm: UntypedFormGroup;
  strValidated = false;
  currentUser: any;
  parameterTypes = "applicationParam";
  prevSecurityLevel: string = 'Low';

  securityLevelArr = [
    { id: "low", value: "Low" },
    { id: "medium", value: "Medium" },
    { id: "high", value: "High" },
  ];

  validationMessages = {
    parameterName: {
      required: "Parameter name is required",
      maxlength: "Maximum 128 characters are allowed",
      hasString: 'Name of the parameter must start with "application."',
      hasWhitespace: "Whitespace not allowed",
      pipeOperatorNotAllowed: 'Pipe operator (|) is not allowed.'
    },
    description: {
      maxlength: "Maximum 2000 characters are allowed",
    },
    securityLevel: {},
    value: {
      required: "Value is required",
      maxlength: "Maximum 1000 characters are allowed",
      hasWhitespace: "Whitespace not allowed"
    },
  };

  formErrors = {
    parameterName: "",
    description: "",
    securityLevel: "",
    value: "",
  };

  createScriptParamSub = Subscription.EMPTY;
  updateScriptParamSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AddEditAppParamsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
    private messageService: MessageService,
    private configurationsService: ConfigurationsService,
    private encryptDecryptService: EncryptDecryptService
  ) {
    dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnInit(): void {
    this.createForm();
    if (!this.dialogData?.isAdd) {
      this.setExistingData(this.dialogData);
    }
    this.checkString(this.paramsForm.get("parameterName").value);
    this.paramsForm.get("parameterName").valueChanges.subscribe((res) => {
      this.checkString(res);
    });
    if (this.dialogData?.isAppParamsCURDAccess) {
      this.paramsForm.enable();
    } else {
      this.paramsForm.disable();
    }
  }

  createForm() {
    // Jira TEI-5532 Removed Pipe Operator Validator as per new Victor requirement pipeOperatorNotAllowedValidator()
    this.paramsForm = this.fb.group({
      parameterName: [
        { value: "application.", disabled: false },
        {
          validators: [
            Validators.required,
            Validators.maxLength(128),
            PasswordStrength.patternValidator(/^application./, {
              hasString: true,
            }),
            CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
          ],
        },
      ],
      description: [
        { value: "", disabled: false },
        {
          validators: [Validators.maxLength(2000)],
        },
      ],
      securityLevel: [
        { value: "low", disabled: false },
        {
          validators: [],
        },
      ],
      value: [
        { value: "", disabled: false },
        {
          validators: [Validators.required, Validators.maxLength(1000)],
        },
      ],
    });
    this.paramsForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.paramsForm);
    });
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.paramsForm): void {
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

  /*============ Check String Validation =============*/
  checkString(str: string) {
    const after_ = str.substring(str.indexOf(".") + 1);
    if (after_ !== "") {
      this.strValidated = true;
    } else {
      this.strValidated = false;
    }
  }
  /*============ END Check String Validation =============*/

  /*============ On Change Security Level ============*/
  onChangeSecurityLevel() {
    // this.paramsForm.get("value").reset();

    const currentLevel = this.paramsForm.get('securityLevel')?.value;
    const valueControl = this.paramsForm.get('value');

    // CASE: Moving away from HIGH → clear value
    if (this.prevSecurityLevel.toLowerCase() === 'high' && currentLevel.toLowerCase() !== 'high') {
      valueControl?.reset();
    }

    // Update previous level
    this.prevSecurityLevel = currentLevel;
  }

  /*============ Set Existing Data For Update Parameter =============*/
  setExistingData(dataObj) {
    // Encrypted data decrypted here which securityLevel is high
    let decryptedValue = "";
    if (
      dataObj?.securityLevel === "high" ||
      dataObj?.securityLevel === "medium"
    ) {
      decryptedValue = dataObj.value ? this.encryptDecryptService.decrypt(dataObj.value) : dataObj?.value;
    } else {
      decryptedValue = dataObj?.value;
    }
    this.paramsForm.patchValue({
      parameterName: dataObj?.parameterName,
      description: dataObj?.description,
      securityLevel: dataObj?.securityLevel,
      value: decryptedValue,
    });
  }

  /*========== Add Parameters ==========*/
  saveParameters() {
    this.paramsForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.paramsForm.value;
    let isProtected = false;
    let encryptedData = "";
    if (
      formValues?.securityLevel === "high" ||
      formValues?.securityLevel === "medium"
    ) {
      encryptedData = this.encryptDecryptService.encrypt(formValues?.value.trim());
    } else {
      encryptedData = formValues?.value.trim();
    }
    if (
      formValues?.securityLevel === "high" ||
      formValues?.securityLevel === "medium"
    ) {
      isProtected = true;
    }
    const scriptParameterDto: ScriptParameterDto = {
      id: null,
      parameterName: formValues?.parameterName.trim(),
      securityLevel: formValues?.securityLevel,
      value: encryptedData,
      optionProtected: isProtected,
      description: formValues?.description.trim(),
      parameterTypes: this.parameterTypes,
      lastUpdated: null,
      updatedBy: this.currentUser?.userName,
    };
    this.checkString(this.paramsForm.get("parameterName").value);
    if (this.paramsForm.valid && this.strValidated) {
      this.createScriptParamSub = this.configurationsService
        .createScriptParams(scriptParameterDto)
        .subscribe(
          (res) => {
            this.dialogRef.close(true);
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // handle client side error here
            } else {
              // handle server side error here
              this.messageService.add({
                key: "configInfoKey",
                severity: "info",
                summary: "",
                detail: err?.error?.message,
              });
            }
          }
        );
    }
  }
  /*========== End Add Parameters ==========*/

  /*========== Update Parameters ==========*/
  updateParameters() {
    this.paramsForm.markAllAsTouched();
    this.logValidationErrors();
    const formValues = this.paramsForm.value;
    let isProtected = false;
    let encryptedData = "";
    if (
      formValues?.securityLevel === "high" ||
      formValues?.securityLevel === "medium"
    ) {
      encryptedData = this.encryptDecryptService.encrypt(formValues?.value);
    } else {
      encryptedData = formValues?.value;
    }
    if (
      formValues?.securityLevel === "high" ||
      formValues?.securityLevel === "medium"
    ) {
      isProtected = true;
    }
    const scriptParameterDto: ScriptParameterDto = {
      id: this.dialogData?.id,
      parameterName: formValues?.parameterName,
      securityLevel: formValues?.securityLevel,
      value: encryptedData,
      optionProtected: isProtected,
      description: formValues?.description,
      parameterTypes: this.dialogData?.parameterTypes,
      lastUpdated: null,
      updatedBy: this.currentUser?.userName,
    };
    this.checkString(this.paramsForm.get("parameterName").value);
    if (this.paramsForm.valid && this.strValidated) {
      this.updateScriptParamSub = this.configurationsService
        .updateScriptParams(scriptParameterDto)
        .subscribe(
          (res) => {
            this.dialogRef.close(true);
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // handle client side error here
            } else {
              // handle server side error here
              this.messageService.add({
                key: "configInfoKey",
                severity: "info",
                summary: "",
                detail: err?.error?.message,
              });
            }
          }
        );
    }
  }
  /*========== End Update Parameters ==========*/

  onCancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.createScriptParamSub.unsubscribe();
    this.updateScriptParamSub.unsubscribe();
  }
}
