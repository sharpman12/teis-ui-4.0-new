import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { DirectoryPathMatch } from "src/app/shared/validation/directory-path-match.validator";
import { ConfigurationsService } from "../configurations.service";
import { ServerParamsKeys } from "../config";
import { Router } from "@angular/router";
import { HeaderService } from "src/app/core/service/header.service";
import { BreadCrumbService } from "src/app/core/service/breadcrumb.service";
import { TestSMTPConnectionComponent } from "./test-smtpconnection/test-smtpconnection.component";
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { EncryptDecryptService } from "src/app/shared/services/encrypt-decrypt.service";

@Component({
  selector: "app-server",
  templateUrl: "./server.component.html",
  styleUrls: ["./server.component.scss"],
})
export class ServerComponent implements OnInit, OnDestroy {
  reloadParamsForm: UntypedFormGroup;
  serverForm: UntypedFormGroup;
  mailConfigForm: UntypedFormGroup;
  servers = [];
  mailConfig = [];
  isServerAccess: boolean = false;
  defaultParams = [];

  serverSub = Subscription.EMPTY;
  mailConfigSub = Subscription.EMPTY;
  saveConfigSub = Subscription.EMPTY;
  testSMTPConnectionSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    private fb: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private configurationsService: ConfigurationsService,
    private encryptDecryptService: EncryptDecryptService,
  ) { }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/configuration/adapter_information') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.createReloadParamsForm();
    this.createForm();
    this.createMailConfigForm();
    const isConfigServerAccess = localStorage.getItem("CONFIGURATION_OF_SEVER");
    if (isConfigServerAccess) {
      this.isServerAccess = true;
      this.getServer(!this.isServerAccess);
    } else {
      this.isServerAccess = false;
      this.getServer(!this.isServerAccess);
    }
  }

  /*============ Form For Reload Required ============*/
  createReloadParamsForm() {
    this.reloadParamsForm = this.fb.group({
      reloadParameter: this.fb.array([this.addParameters(false)]),
    });
  }

  /*============ Form For Reload Not Required ============*/
  createForm() {
    this.serverForm = this.fb.group({
      serverParameter: this.fb.array([this.addParameters(false)]),
    });
  }

  /*============ Form For Mail Configuration ============*/
  createMailConfigForm() {
    this.mailConfigForm = this.fb.group({
      mailConfigParameters: this.fb.array([this.addParameters(false)]),
    });
  }

  /*================== Add More Parameters =================*/
  addParameters(additionalParam: boolean): UntypedFormGroup {
    return this.fb.group({
      defaultValue: [{ value: "", disabled: false }],
      id: [{ value: "", disabled: false }],
      key: [{ value: "", disabled: false }],
      label: [{ value: "", disabled: false }],
      subLabel: [{ value: "", disabled: false }],
      helpText: [{ value: "", disabled: false }],
      lastUpdated: [{ value: "", disabled: false }],
      newValue: [
        { value: "", disabled: false },
        {
          validators: [Validators.required],
        },
      ],
      type: [{ value: "", disabled: false }],
      updatedBy: [{ value: "", disabled: false }],
      dataType: [{ value: "", disabled: false }],
      reloadRequired: [{ value: "", disabled: false }],
    });
  }

  addMoreParameters(): void {
    (<UntypedFormArray>this.serverForm.get("serverParameter")).push(
      this.addParameters(true)
    );
  }
  /*================== END Add More Parameters =================*/

  /*================== Set Existing Parameters =================*/
  setExistingParamerters(
    parameters: any[],
    isCtrlDisabled: any
  ): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    parameters.forEach((p) => {
      formArray.push(
        this.fb.group({
          defaultValue: [
            { value: p.defaultValue, disabled: isCtrlDisabled.isDefaultValue },
          ],
          id: [{ value: p.id, disabled: isCtrlDisabled.isId }],
          key: [{ value: p.key, disabled: isCtrlDisabled.isKey }],
          label: [{ value: "", disabled: false }],
          subLabel: [{ value: "", disabled: false }],
          helpText: [{ value: "", disabled: false }],
          lastUpdated: [
            { value: p.lastUpdated, disabled: isCtrlDisabled.isLastUpdated },
          ],
          newValue: [
            { value: p.newValue, disabled: isCtrlDisabled.isNewValue },
            {
              validators: [
                Validators.required,
                Validators.min(p?.min),
                Validators.max(p?.max),
                Validators.maxLength(p?.maxLength),
                DirectoryPathMatch.DirectoryPathValidator({
                  hasString: p?.hasString,
                }),
              ],
            },
          ],
          type: [{ value: p.type, disabled: isCtrlDisabled.isType }],
          updatedBy: [
            { value: p.updatedBy, disabled: isCtrlDisabled.isUpdatedBy },
          ],
          dataType: [
            { value: p.dataType, disabled: isCtrlDisabled.isDataType },
          ],
          reloadRequired: [{ value: p.reloadRequired, disabled: false }],
        })
      );
    });
    this.defaultParams = formArray.value;
    return formArray;
  }

  setExistingMailParamerters(
    parameters: any[],
    isCtrlDisabled: any
  ): UntypedFormArray {
    const formArray = new UntypedFormArray([]);
    parameters.forEach((p) => {
      formArray.push(
        this.fb.group({
          defaultValue: [
            { value: p.defaultValue, disabled: isCtrlDisabled.isDefaultValue },
          ],
          id: [{ value: p.id, disabled: isCtrlDisabled.isId }],
          key: [{ value: p.key, disabled: isCtrlDisabled.isKey }],
          label: [{ value: p?.label, disabled: isCtrlDisabled.isKey }],
          subLabel: [{ value: p?.subLabel, disabled: false }],
          helpText: [{ value: p?.helpText, disabled: isCtrlDisabled.isKey }],
          lastUpdated: [
            { value: p.lastUpdated, disabled: isCtrlDisabled.isLastUpdated },
          ],
          newValue: [
            { value: p.newValue, disabled: isCtrlDisabled.isNewValue },
            {
              validators: [
                Validators.required,
                // Validators.min(p?.min),
                // Validators.max(p?.max),
                // Validators.maxLength(p?.maxLength),
                // DirectoryPathMatch.DirectoryPathValidator({
                //   hasString: p?.hasString,
                // }),
              ],
            },
          ],
          type: [{ value: p.type, disabled: isCtrlDisabled.isType }],
          updatedBy: [
            { value: p.updatedBy, disabled: isCtrlDisabled.isUpdatedBy },
          ],
          dataType: [
            { value: p.dataType, disabled: isCtrlDisabled.isDataType },
          ],
          reloadRequired: [{ value: p.reloadRequired, disabled: false }],
        })
      );
    });
    this.defaultParams = formArray.value;
    return formArray;
  }
  /*================== Set Existing Parameters =================*/

  refreshServer() {
    this.getServer(!this.isServerAccess);
  }

  getServer(isCtrlDisabled: boolean) {
    const type = "Server";
    this.serverSub = this.configurationsService.getServer(type).subscribe((res) => {
      if (res?.length) {
        res.forEach((item) => {
          item.hasString = false;
          if (
            item?.defaultValue === "true" ||
            item?.defaultValue === "false"
          ) {
            item.dataType = "boolean";
          } else {
            item.dataType = "string";
          }
          if (item?.key === "VersionCount") {
            item.min = 10;
            item.max = 20;
          }
          if (item?.key === "AppLogPurgeInDays") {
            item.min = 7;
            item.max = 365;
          }
          if (item?.key === "ArchiveDays") {
            item.min = 7;
            item.max = 365;
          }
          if (item?.key === "ws_max_response_time") {
            item.min = 15000;
            item.max = 150000;
          }
          if (item?.key === "ws_max_request_size") {
            item.min = 1024000;
            item.max = 10240000;
          }
          if (item?.key === "Workspace_Folder") {
            item.hasString = true;
            item.maxLength = 1000;
          }
          if (item?.key === "Log_Folder") {
            item.hasString = true;
            item.maxLength = 1000;
          }
          if (item?.key === "ArchiveLog_Folder") {
            item.hasString = true;
            item.maxLength = 1000;
          }
          if (item?.key === "TempFiles") {
            item.hasString = true;
            item.maxLength = 1000;
          }
          if (item?.key === "ArchiveDatabaseDriver") {
            item.maxLength = 1000;
          }
          if (item?.key === "ArchiveDbUrl") {
            item.maxLength = 1000;
          }
          if (item?.key === "ArchiveDbUserName") {
            item.maxLength = 1000;
          }
          if (item?.key === "ArchiveDbUserPassword") {
            item.maxLength = 1000;
            item.defaultValue = this.encryptDecryptService.decrypt(item.defaultValue);
            item.newValue = this.encryptDecryptService.decrypt(item.newValue);
          }
        });
        this.servers = res;
        const serverParameterObj = {
          isDefaultValue: isCtrlDisabled,
          isId: isCtrlDisabled,
          isKey: isCtrlDisabled,
          isLastUpdated: isCtrlDisabled,
          isNewValue: isCtrlDisabled,
          isType: isCtrlDisabled,
          isUpdatedBy: isCtrlDisabled,
          isDataType: isCtrlDisabled,
        };
        const reloadParams = this.servers.filter(obj => obj.reloadRequired);
        const refreshServerParams = this.servers.filter(obj => !obj.reloadRequired);
        this.reloadParamsForm.setControl(
          "reloadParameter",
          this.setExistingParamerters(reloadParams, serverParameterObj)
        );
        this.serverForm.setControl(
          "serverParameter",
          this.setExistingParamerters(refreshServerParams, serverParameterObj)
        );
        this.getMailConfiguration(type, isCtrlDisabled);
        this.cd.detectChanges();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============= Get Server SMTP Data ==============*/
  getMailConfiguration(type: string, isCtrlDisabled: boolean) {
    this.mailConfigSub = this.configurationsService
      .getMailConfig(type)
      .subscribe(
        (res) => {
          if (res?.length) {
            res.forEach((item) => {
              if (
                item?.defaultValue === "true" ||
                item?.defaultValue === "false" ||
                item?.newValue === "true" ||
                item?.newValue === "false"
              ) {
                item.dataType = "boolean";
              } else {
                item.dataType = "string";
              }
            });
            this.mailConfig = res;
            const serverParameterObj = {
              isDefaultValue: isCtrlDisabled,
              isId: isCtrlDisabled,
              isKey: isCtrlDisabled,
              isLastUpdated: isCtrlDisabled,
              isNewValue: isCtrlDisabled,
              isType: isCtrlDisabled,
              isUpdatedBy: isCtrlDisabled,
              isDataType: isCtrlDisabled,
            };
            this.mailConfigForm.setControl(
              "mailConfigParameters",
              this.setExistingMailParamerters(
                this.createArr(this.mailConfig),
                serverParameterObj
              )
            );
            this.cd.detectChanges();
          }
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
          }
        }
      );
  }

  /*============= Create New Server Array =============*/
  createArr(paramsArr: Array<any>) {
    // Creating a new array of objects based on enum matching
    const newParamsArray = paramsArr.map(obj => {
      // Check if the value property matches the enum
      if (obj.key === ServerParamsKeys.workspaceFolder) {
        // Create a new object with modified properties if the condition is met
        return {
          ...obj,
          label: `Folder location - Workspace`,
          subLabel: ``,
          helpText: ``
        };
      } else if (obj.key === ServerParamsKeys.logFolder) {
        // Create a new object with modified properties if the condition is met
        return {
          ...obj,
          label: `Folder location - Log`,
          subLabel: ``,
          helpText: ``
        };
      } else if (obj.key === ServerParamsKeys.archiveFolder) {
        // Create a new object with modified properties if the condition is met
        return {
          ...obj,
          label: `Folder location - Archive log`,
          subLabel: ``,
          helpText: ``
        };
      } else if (obj.key === ServerParamsKeys.tempFiles) {
        // Create a new object with modified properties if the condition is met
        return {
          ...obj,
          label: `Folder location - Temp files`,
          subLabel: ``,
          helpText: ``
        };
      } else if (obj.key === ServerParamsKeys.appLogPurgeInDays) {
        // Create a new object with modified properties if the condition is met
        return {
          ...obj,
          label: `Logs - Application active (days)`,
          subLabel: `(days)`,
          helpText: ``
        };
      } else if (obj.key === ServerParamsKeys.versionCount) {
        // Create a new object with modified properties if the condition is met
        return {
          ...obj,
          label: `Stored item version (number)`,
          subLabel: `(number)`,
          helpText: ``
        };
      } else if (obj.key === ServerParamsKeys.webServiceMaxResTime) {
        // Create a new object with modified properties if the condition is met
        return {
          ...obj,
          label: `Web service - Max response time (milliseconds)`,
          subLabel: `(milliseconds)`,
          helpText: ``
        };
      } else if (obj.key === ServerParamsKeys.webSerivceMaxReqSize) {
        // Create a new object with modified properties if the condition is met
        return {
          ...obj,
          label: `Web service - Max request size (bytes)`,
          subLabel: `(bytes)`,
          helpText: ``
        };
      } else if (obj.key === ServerParamsKeys.host) {
        // Create a new object with modified properties if the condition is met
        return {
          ...obj,
          label: `Mail - Hostname`,
          subLabel: `(${obj.key})`,
          helpText: `This is SMTP server to connect to. \n For ex. smtp.example.com`
        };
      } else if (obj.key === ServerParamsKeys.port) {
        return {
          ...obj,
          label: `Mail - Port`,
          subLabel: `(${obj.key}, number)`,
          helpText: `It is the SMTP server port for connection. It defaults to 25.`
        };
      } else if (obj.key === ServerParamsKeys.ssltrust) {
        return {
          ...obj,
          label: `Mail - SSL`,
          subLabel: `(${obj.key})`,
          helpText: `This property to indicate specific hosts for which certificate validation should be bypassed. \n For ex.  smtp.example.com`
        };
      } else if (obj.key === ServerParamsKeys.starttlsEnable) {
        return {
          ...obj,
          label: `Mail - Start tls`,
          subLabel: `(${obj.key})`,
          helpText: `This property that can be set to enable or disable the use of the TLS protocol when connecting to an SMTP. \n Its defaults are set to true.`
        };
      } else if (obj.key === ServerParamsKeys.auth) {
        return {
          ...obj,
          label: `Mail - Auth`,
          subLabel: `(${obj.key})`,
          helpText: `If true, attempt to authenticate the user using the AUTH command. Defaults to false.`
        };
      } else if (obj.key === ServerParamsKeys.username) {
        return {
          ...obj,
          label: `Mail - Username`,
          subLabel: `(${obj.key})`,
          helpText: `This property that can be used to set the username for the authentication when sending email using the SMTP.`
        };
      } else if (obj.key === ServerParamsKeys.password) {
        obj.defaultValue = this.encryptDecryptService.decrypt(obj.defaultValue);
        obj.newValue = this.encryptDecryptService.decrypt(obj.newValue);
        return {
          ...obj,
          label: `Mail - Password`,
          subLabel: `(${obj.key})`,
          helpText: `This property is used to set the password required for authentication when connecting to an SMTP server.`
        };
      } else if (obj.key === ServerParamsKeys.timeout) {
        return {
          ...obj,
          label: `Mail - Timeout`,
          subLabel: `(${obj.key}, milliseconds)`,
          helpText: `SMTP timeout refers to the maximum amount of time a mail server will wait for a response from another mail server during the process of sending an email.`
        };
      } else if (obj.key === ServerParamsKeys.connectiontimeout) {
        return {
          ...obj,
          label: `Mail - Connection Timeout`,
          subLabel: `(${obj.key}, milliseconds)`,
          helpText: `SMPT connection timeout is the duration for which a client or server is willing to wait for a response from the SMTP server after initiating a connection.`
        };
      } else if (obj.key === ServerParamsKeys.writetimeout) {
        return {
          ...obj,
          label: `Mail - Write Timeout`,
          subLabel: `(${obj.key}, milliseconds)`,
          helpText: `The SMTP writetimeout is refers to the maximum amount of time that the SMTP client will wait for a write operation to complete.`
        };
      } else {
        // If no match is found, you can handle it accordingly
        return {
          ...obj,
          label: `${obj.key}`,
          subLabel: ``,
          helpText: ``
        }
      }
    });
    return newParamsArray;
  }

  resetReloadDefaultValues(rowName: string) {
    this.reloadParamsForm
      .get("reloadParameter")
    ["controls"].forEach((item, i, arr) => {
      if (item?.value?.key === rowName) {
        this.reloadParamsForm.get("reloadParameter")["controls"][i].patchValue({
          newValue: item?.value?.defaultValue,
        });
      }
    });
  }

  resetDefaultValues(rowName: string) {
    this.serverForm
      .get("serverParameter")
    ["controls"].forEach((item, i, arr) => {
      if (item?.value?.key === rowName) {
        this.serverForm.get("serverParameter")["controls"][i].patchValue({
          newValue: item?.value?.defaultValue,
        });
      }
    });
  }

  resetMailDefaultValues(rowName: string) {
    this.mailConfigForm
      .get("mailConfigParameters")
    ["controls"].forEach((item, i, arr) => {
      if (item?.value?.key === rowName) {
        this.mailConfigForm
          .get("mailConfigParameters")
        ["controls"][i].patchValue({
          newValue: item?.value?.defaultValue,
        });
      }
    });
  }

  saveServer(reloadParams: any, server: any, mailConfig: any) {
    this.reloadParamsForm.markAllAsTouched();
    this.serverForm.markAllAsTouched();
    this.mailConfigForm.markAllAsTouched();
    if (this.reloadParamsForm.valid && this.serverForm.valid && this.mailConfigForm.valid) {
      if (reloadParams?.reloadParameter?.length) {
        reloadParams?.reloadParameter.forEach((q) => {
          delete q.dataType;
          delete q.label;
          delete q?.subLabel;
          delete q.helpText;
        });
      }
      if (server?.serverParameter?.length) {
        server?.serverParameter.forEach((item) => {
          delete item.dataType;
          delete item.label;
          delete item?.subLabel;
          delete item.helpText;
          if (item?.key === "ArchiveDbUserPassword") {
            item.defaultValue = this.encryptDecryptService.encrypt(item.defaultValue);
            item.newValue = this.encryptDecryptService.encrypt(item.newValue);
          }
        });
      }
      if (mailConfig?.mailConfigParameters?.length) {
        mailConfig.mailConfigParameters.forEach((x) => {
          delete x.dataType;
          delete x.label;
          delete x?.subLabel;
          delete x.helpText;
          if (x?.key === "mail.smtp.password") {
            x.defaultValue = this.encryptDecryptService.encrypt(x.defaultValue);
            x.newValue = this.encryptDecryptService.encrypt(x.newValue);
          }
        });
      }
      const serverConfig = [...reloadParams?.reloadParameter, ...server?.serverParameter, ...mailConfig?.mailConfigParameters];
      this.saveConfigSub = this.configurationsService
        .updateServer(serverConfig)
        .subscribe(
          (res) => {
            if (res) {
              this.getServer(!this.isServerAccess);
              this.messageService.add({
                key: "configSuccessKey",
                severity: "success",
                summary: "",
                detail: "Server configuration updated successfully!",
              });
            }
          },
          (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // handle client side error here
            } else {
              // handle server side error here
            }
          }
        );
    }
  }

  resetChanges() {
    this.getServer(!this.isServerAccess);
  }

  /*============= Test SMTP Connection ==============*/
  testSMTPConnection() {
    this.mailConfigForm.markAllAsTouched();
    if (this.mailConfigForm.valid) {
      const dialogRef = this.dialog.open(TestSMTPConnectionComponent, {
        width: '700px',
        maxHeight: '600px',
        data: {
          compName: 'serverConfig'
        }
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.isSave) {
          this.messageService.add({
            key: "configSuccessKey",
            severity: "success",
            summary: "",
            detail: "Connection test successfully. Email has sent.",
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.serverSub.unsubscribe();
    this.mailConfigSub.unsubscribe();
    this.saveConfigSub.unsubscribe();
    this.testSMTPConnectionSub.unsubscribe();
  }
}
