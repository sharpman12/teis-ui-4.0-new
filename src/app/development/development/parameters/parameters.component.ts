import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { EditParameterComponent } from '../edit-parameter/edit-parameter.component';
import { Subscription } from 'rxjs';
import { DevelopmentService } from '../../development.service';
import { ScriptStateService } from 'src/app/shared/services/script-state.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-parameters',
  templateUrl: './parameters.component.html',
  styleUrls: ['./parameters.component.scss']
})
export class ParametersComponent implements OnInit, OnDestroy {
  parameters: Array<any> = [];
  configParams: Array<any> = [];

  getParametersSub = Subscription.EMPTY;
  getScriptConnectionSub = Subscription.EMPTY;

  constructor(
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ParametersComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private developmentService: DevelopmentService,
    private scriptStateService: ScriptStateService
  ) {
    this.dialogRef.disableClose = true;
    this.getParameters();
  }

  ngOnInit(): void {

  }

  getParameters() {
    const clientId = this.dialogData?.tabId;
    const obj = {
      jsonMap: null,
      headers: null,
      clientId: [`${clientId}`],
      contentType: 'application/winwrap;charset=utf-8',
      workspaceId: this.dialogData?.workspaceId,
      scriptId: this.dialogData?.scriptId,
      debugSettingUse: false,
      triggerScript: this.dialogData?.triggerScript,
      debugSeId: this.dialogData?.debugSeId,
      debugSeUrl: this.dialogData?.debugSeUrl
    };

    const debugSeId = this.dialogData?.debugSeId;
    const debugSeUrl = this.dialogData?.debugSeUrl;

    this.getParametersSub = this.developmentService.getScriptParameters(obj, debugSeId, debugSeUrl).subscribe((res) => {
      if (res) {
        const params = JSON.parse(JSON.stringify(res));
        const paramsArr = Object.keys(params).map(key => ({ parameterKey: key, ...params[key] }));
        this.getScriptConnection(paramsArr);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============= Check Script is Connected to any PIT Item(s) =============*/
  getScriptConnection(paramsArr: Array<any>) {
    this.getScriptConnectionSub = this.developmentService.scriptConnectedToPIT(Number(this.dialogData?.scriptId)).subscribe((res) => {
      if (paramsArr?.length) {
        paramsArr.forEach((x) => {
          x.isScriptConnectedToPIT = res;
        });
        this.parameters = paramsArr.filter(p => !p.config);
        this.configParams = paramsArr.filter(p => p.config);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  openEditDialog(parameter: any): void {
    const isIdProperty = parameter.hasOwnProperty('id');
    const isDescProperty = parameter.hasOwnProperty('description');
    if (!isIdProperty) {
      parameter.id = null;
    }
    if (!isDescProperty) {
      parameter.description = '';
    }
    parameter.workspaceId = this.dialogData?.workspaceId;
    parameter.scriptId = this.dialogData?.scriptId;
    // parameter.type = this.dialogData?.type;
    parameter.lockInfo = this.dialogData?.lockInfo;
    const dialogRef = this.dialog.open(EditParameterComponent, {
      width: "600px",
      maxHeight: '95vh',
      height: '95%',
      data: parameter
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.isSave || result?.isUpdate) {
        this.getParameters();
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.getParametersSub.unsubscribe();
    this.getScriptConnectionSub.unsubscribe();
  }
}
