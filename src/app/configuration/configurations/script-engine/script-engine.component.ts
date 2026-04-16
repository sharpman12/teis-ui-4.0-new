import { HttpErrorResponse } from "@angular/common/http";
import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MessageService } from "primeng/api";
import { Subscription } from "rxjs";
import { ConfigurationsService } from "../configurations.service";
import { AddEditScriptEngineComponent } from "./add-edit-script-engine/add-edit-script-engine.component";
import { Router } from "@angular/router";
import { HeaderService } from "src/app/core/service/header.service";
import { BreadCrumbService } from "src/app/core/service/breadcrumb.service";

@Component({
  selector: "app-script-engine",
  templateUrl: "./script-engine.component.html",
  styleUrls: ["./script-engine.component.scss"],
})
export class ScriptEngineComponent implements OnInit, OnDestroy {
  scrWidth: number;
  scriptEngine = [];
  isScriptEnginAccess: boolean = false;

  scriptEngineSub = Subscription.EMPTY;

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
    this.getScriptEngine();
  }

  onRefresh() {
    this.getScriptEngine();
  }

  getScriptEngine() {
    this.scriptEngineSub = this.configurationsService
      .getScriptEngine()
      .subscribe(
        (res) => {
          this.scriptEngine = res;
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

  /*================ Edit Update Script Engine Group ================*/
  editSEGroup(paramsObj) {
    if (this.isScriptEnginAccess) {
      const dataObj = {
        isAdd: false,
        ...paramsObj,
      };
      const dialogRef = this.dialog.open(AddEditScriptEngineComponent, {
        width: "600px",
        height: "450px",
        data: dataObj,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.getScriptEngine();
          this.messageService.add({
            key: "configSuccessKey",
            severity: "success",
            summary: "",
            detail: "Script engine updated Successfully!",
          });
        }
      });
    }
  }
  /*================ END Edit Update Script Engine Group ================*/

  ngOnDestroy(): void {
    this.scriptEngineSub.unsubscribe();
  }
}
