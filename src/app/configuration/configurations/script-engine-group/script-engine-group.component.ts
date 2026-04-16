import { HttpErrorResponse } from "@angular/common/http";
import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { ConfirmationComponent } from "src/app/shared/components/confirmation/confirmation.component";
import { ConfigurationsService } from "../configurations.service";
import { AddEditScriptEngineGroupComponent } from "./add-edit-script-engine-group/add-edit-script-engine-group.component";
import { Router } from "@angular/router";
import { HeaderService } from "src/app/core/service/header.service";
import { BreadCrumbService } from "src/app/core/service/breadcrumb.service";
import { ConfigConfirmationComponent } from "../config-confirmation/config-confirmation.component";

@Component({
  selector: "app-script-engine-group",
  templateUrl: "./script-engine-group.component.html",
  styleUrls: ["./script-engine-group.component.scss"],
})
export class ScriptEngineGroupComponent implements OnInit, OnDestroy {
  scrWidth: number;
  scriptEngineGroups = [];
  isScriptEnginAccess: boolean = false;

  scriptEngineGroupSub = Subscription.EMPTY;

  @HostListener("window:resize", ["$event"])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    private messageService: MessageService,
    private configurationsService: ConfigurationsService
  ) {
    this.getScreenSize();
    const AppParamsCURDAccess = localStorage.getItem("CONFIGURATION_SCRIPT_ENGINE_AND_GROUP");
    if (AppParamsCURDAccess) {
      this.isScriptEnginAccess = true;
    } else {
      this.isScriptEnginAccess = false;
    }
  }

  ngOnInit(): void {
    this.header.show(); // show hide header
    if (localStorage.getItem('source') || this.router.url === '/configuration/adapter_information') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide();
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.getUserInterfaceSetup();
  }

  refreshSEGroup() {
    this.getUserInterfaceSetup();
  }

  getUserInterfaceSetup() {
    this.scriptEngineGroupSub = this.configurationsService
      .getSEGroup()
      .subscribe(
        (res) => {
          this.scriptEngineGroups = res;
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

  /*================ Add Script Engine Group ================*/
  addSEGroup() {
    if (this.isScriptEnginAccess) {
    }
    const dataObj = {
      isAdd: true,
    };
    const dialogRef = this.dialog.open(AddEditScriptEngineGroupComponent, {
      width: "600px",
      height: "600px",
      data: dataObj,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getUserInterfaceSetup();
        this.messageService.add({
          key: "configSuccessKey",
          severity: "success",
          summary: "",
          detail: "Script engine group added Successfully!",
        });
      }
    });
  }
  /*================ END Add Script Engine Group ================*/

  /*================ Edit Update Script Engine Group ================*/
  editSEGroup(paramsObj) {
    if (this.isScriptEnginAccess) {
      const dataObj = {
        isAdd: false,
        ...paramsObj,
      };
      const dialogRef = this.dialog.open(AddEditScriptEngineGroupComponent, {
        width: "600px",
        height: "600px",
        data: dataObj,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.getUserInterfaceSetup();
          this.messageService.add({
            key: "configSuccessKey",
            severity: "success",
            summary: "",
            detail: "Script engine group updated Successfully!",
          });
        }
      });
    }
  }
  /*================ END Edit Update Script Engine Group ================*/

  /*================ Delete Script Engine Group ================*/
  deleteParams(id: number): void {
    if (Number(id) !== 1 && this.isScriptEnginAccess) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: "700px",
        maxHeight: "600px",
        data: "Are you sure you want to delete this script engine group?",
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.configurationsService.deleteSEGroup(id).subscribe(
            (res) => {
              if (res?.length) {
                this.connectedItemsInfoModel(res);
              } else {
                this.getUserInterfaceSetup();
                this.messageService.add({
                  key: "configSuccessKey",
                  severity: "success",
                  summary: "",
                  detail: "Script engine group deleted Successfully!",
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
      });
    }
  }

  connectedItemsInfoModel(connectedItems: Array<string>) {
    const dialogRef = this.dialog.open(ConfigConfirmationComponent, {
      width: "700px",
      maxHeight: "600px",
      data: {
        connectedItems: connectedItems
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {

      }
    });
  }

  ngOnDestroy(): void {
    this.scriptEngineGroupSub.unsubscribe();
  }
}
