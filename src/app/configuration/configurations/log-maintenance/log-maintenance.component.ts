import { HttpErrorResponse } from "@angular/common/http";
import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { ConfirmationComponent } from "src/app/shared/components/confirmation/confirmation.component";
import { SharedService } from "src/app/shared/services/shared.service";
import { ConfigurationsService } from "../configurations.service";
import { AddEditLogMaintenanceComponent } from "./add-edit-log-maintenance/add-edit-log-maintenance.component";
import { Router } from "@angular/router";
import { HeaderService } from "src/app/core/service/header.service";
import { BreadCrumbService } from "src/app/core/service/breadcrumb.service";

@Component({
  selector: "app-log-maintenance",
  templateUrl: "./log-maintenance.component.html",
  styleUrls: ["./log-maintenance.component.scss"],
})
export class LogMaintenanceComponent implements OnInit, OnDestroy {
  scrWidth: number;
  logMaintenance = [];
  isArchivePackInstalled: boolean;
  isLogMaintenanceAccess: boolean = false;

  logMaintananceSub = Subscription.EMPTY;

  @HostListener("window:resize", ["$event"])
  getScreenSize(event?) {
    this.scrWidth = window.innerWidth;
  }

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private header: HeaderService,
    private breadcrumb: BreadCrumbService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private configurationsService: ConfigurationsService
  ) {
    this.getScreenSize();
    const AppParamsCURDAccess = localStorage.getItem("CONFIGURATION_LOG_MAINTENANCE");
    if (AppParamsCURDAccess) {
      this.isLogMaintenanceAccess = true;
    } else {
      this.isLogMaintenanceAccess = false;
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
    this.getLogMaintainance();
    this.checkArchivePackIsInstalled();
    this.checkIsArchivePackInstalled();
  }

  refreshLog() {
    this.getLogMaintainance();
  }

  /*=========== Is Archive Packed Installed ============*/
  checkArchivePackIsInstalled() {
    this.sharedService.checkArchivePackInstalled().subscribe(
      (res) => {
        this.sharedService.checkArchivePackIsInstalled(res);
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

  checkIsArchivePackInstalled() {
    this.sharedService.archivePackInstalled.subscribe((res) => {
      this.isArchivePackInstalled = res;
    });
  }
  /*=========== END Is Archive Packed Installed ============*/

  getLogMaintainance() {
    this.logMaintananceSub = this.configurationsService
      .getLogMaintainance()
      .subscribe(
        (res) => {
          this.logMaintenance = res;
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

  /*================ Add Log Maintenance ================*/
  addLogMaintenance() {
    if (this.isLogMaintenanceAccess) {
      const dataObj = {
        isAdd: true,
      };
      const dialogRef = this.dialog.open(AddEditLogMaintenanceComponent, {
        width: "600px",
        height: "450px",
        data: dataObj,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.getLogMaintainance();
          this.messageService.add({
            key: "configSuccessKey",
            severity: "success",
            summary: "",
            detail: "Log maintenance added Successfully!",
          });
        }
      });
    }
  }
  /*================ END Add Parameters ================*/

  /*================ Update Log Maintenance ================*/
  updateLogMaintenance(logObj) {
    if (this.isLogMaintenanceAccess) {
      const dataObj = {
        isAdd: false,
        ...logObj,
      };
      const dialogRef = this.dialog.open(AddEditLogMaintenanceComponent, {
        width: "600px",
        height: "450px",
        data: dataObj,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.getLogMaintainance();
          this.messageService.add({
            key: "configSuccessKey",
            severity: "success",
            summary: "",
            detail: "Log maintenance updated Successfully!",
          });
        }
      });
    }
  }
  /*================ END Update Parameters ================*/

  /*================ Delete Parameters ================*/
  deleteLogMaintenance(id: string): void {
    if (this.isLogMaintenanceAccess) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: "700px",
        maxHeight: "600px",
        data: "Are you sure you want to delete this log maintenance?",
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.configurationsService.deleteLogMaintenanceConfig(id).subscribe(
            (res) => {
              if (res) {
                this.getLogMaintainance();
                this.messageService.add({
                  key: "configSuccessKey",
                  severity: "success",
                  summary: "",
                  detail: "Log maintenance deleted Successfully!",
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

  ngOnDestroy(): void {
    this.logMaintananceSub.unsubscribe();
  }
}
