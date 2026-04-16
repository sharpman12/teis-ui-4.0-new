import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Subscription } from 'rxjs';
import { AppIntegrationService } from '../../../app-integration.service';

@Component({
  selector: 'app-net-users',
  templateUrl: './net-users.component.html',
  styleUrls: ['./net-users.component.scss']
})
export class NetUsersComponent implements OnInit, OnDestroy {
  netUsers: Array<any> = [];
  isNetUserSelected: boolean = false;

  getNetUsersSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<NetUsersComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private appIntegrationService: AppIntegrationService
  ) {
    this.dialogRef.disableClose = true;
    this.getNetUsers(dialogData?.workspaceId);
  }

  ngOnInit(): void {
  }

  /*============= Get Net Users =============*/
  getNetUsers(workspaceId: number) {
    this.getNetUsersSub = this.appIntegrationService.getNetUsers(workspaceId).subscribe(res => {
      if (res?.length) {
        res.forEach(x => {
          x.checked = false;
          if (this.dialogData?.executable?.netUsers?.length) {
            this.dialogData?.executable?.netUsers.forEach(e => {
              if (x?.id === e?.id) {
                x.checked = true;
              }
            });
          }
        });
        this.netUsers = res;
        this.onSelectNetUser();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Get Net Users =============*/

  /*============= On Select Net Users =============*/
  onSelectNetUser() {
    this.isNetUserSelected = this.netUsers.some(item => item?.checked === true);
  }
  /*============= END On Select Net Users =============*/

  /*============= Selected Net Users =============*/
  selectedNetUsers() {
    if (this.netUsers?.length) {
      const netUsers = this.netUsers.filter(x => x?.checked);
      if (netUsers?.length) {
        netUsers.forEach(item => {
          delete item?.checked;
        });
      }
      const obj = {
        isSaved: true,
        index: this.dialogData?.index,
        executableId: this.dialogData?.executable?.id,
        selectedNetUsers: netUsers
      };
      this.dialogRef.close(obj);
    }
  }
  /*============= END Selected Net Users =============*/

  /*=============== On Cancelled =============*/
  onClosed(): void {
    const obj = {
      isSaved: false,
      index: this.dialogData?.index,
      executableId: this.dialogData?.executable?.id,
      selectedNetUsers: null
    };
    this.dialogRef.close(obj);
  }
  /*=============== END On Cancelled =============*/

  ngOnDestroy(): void {
    this.getNetUsersSub.unsubscribe();
  }

}
