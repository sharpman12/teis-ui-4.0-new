import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { AppIntegrationService } from '../../app-integration.service';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { NetUsersComponent } from './net-users/net-users.component';
import { AppIntegrationDataService } from '../../app-integration-data.service';
import { take } from 'rxjs/operators';
import { NetUser, NetUserMapping, ScriptDto } from '../../appintegration';
import { Router } from '@angular/router';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-properties-net-user',
  templateUrl: './properties-net-user.component.html',
  styleUrls: ['./properties-net-user.component.scss']
})
export class PropertiesNetUserComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number = null;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isProperties: boolean = false;
  @Input() isProcessCreateFromIntegration: boolean = false;
  executables: Array<ScriptDto> = [];
  isAlertProcess: boolean = false;
  currentUser: any;
  propertiesDetails: any = null;

  getScriptsSub = Subscription.EMPTY;
  getNetUsersSub = Subscription.EMPTY;

  constructor(
    public router: Router,
    public dialog: MatDialog,
    private fb: UntypedFormBuilder,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.appIntegrationService.scriptParams.subscribe((res) => {
      if (res) {
        const executables = this.appIntegrationDataService.getNetUsersExecutables();
        const clonedArray = JSON.parse(JSON.stringify(res?.selectedExecutables || []));
        if (clonedArray?.length) {
          clonedArray?.forEach((n, i) => {
            n.order = i;
            if(!this.isProperties) {
              n.netUsers = [];
            } else {
              if (executables?.length) {
                executables.forEach((sn, index) => {
                  if (Number(n?.id) === Number(sn?.id)) {
                    if (i === index) {
                      n.netUsers = sn?.netUsers;
                      return;
                    }
                  }
                });
              }
            }
          });

          clonedArray.map((x) => (this.router?.url.includes("properties") || res?.isProperties) ? (this.propertiesDetails?.locked && Number(this.currentUser?.id) === Number(this.propertiesDetails?.lockedUserId)) ? x.disabled = false : x.disabled = true : x.disabled = false);

          // clonedArray.map(x => ((this.router?.url.includes("properties") || isProperties) && this.propertiesDetails?.locked && Number(this.currentUser?.id) === Number(this.propertiesDetails?.lockedUserId)) ? x.disabled = false : x.disabled = true);
         
          this.executables = clonedArray;
        }
      }
    });
  }

  /*============= Enabled/Disabled Net User Button on the Basis of Alert Process Flag =============*/
  checkAlertProcessFlag() {
    this.appIntegrationService.isAlertProcess.pipe(take(1)).subscribe((res) => {
      this.isAlertProcess = res;
     
    });
  }

  /*============= Reset Net Users =============*/
  resetNetUsers() {
    this.appIntegrationDataService.clearNetUsersExecutables();
    this.executables = [];
  }
  /*============= Reset Net Users =============*/

  /*============= Get Net Users =============*/
  getExecutables(isProperties?: boolean) {
    const executables = this.appIntegrationDataService.getNetUsersExecutables();

    this.getScriptsSub = this.appIntegrationService.scriptParams.subscribe((res) => {

      const clonedArray = JSON.parse(JSON.stringify(res));

      if (clonedArray?.length) {
        clonedArray?.forEach((n, i) => {
          n.order = i;
          if (executables?.length) {
            executables.forEach((sn, index) => {
              if (Number(n?.id) === Number(sn?.id)) {
                if (i === index) {
                  n.netUsers = sn?.netUsers;
                  return;
                }
              }
            });
          }
        });

        clonedArray.map((x) => (this.router?.url.includes("properties") || isProperties) ? (this.propertiesDetails?.locked && Number(this.currentUser?.id) === Number(this.propertiesDetails?.lockedUserId)) ? x.disabled = false : x.disabled = true : x.disabled = false);

        // clonedArray.map(x => ((this.router?.url.includes("properties") || isProperties) && this.propertiesDetails?.locked && Number(this.currentUser?.id) === Number(this.propertiesDetails?.lockedUserId)) ? x.disabled = false : x.disabled = true);
        
        this.executables = clonedArray;
       
      }
    });
  }
  /*============= END Get Net Users =============*/

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    if (isPITLock) {
      if (this.executables?.length) {
        this.executables.map(x => x.disabled = false);
      }
    } else {
      if (this.executables?.length) {
        this.executables.map(x => x.disabled = true);
      }
    }
  }
  /*============ END Get PIT Lock and Enable/Disable Form Feilds ============*/

  /*============= Set Existing Net Users For Properties =============*/
  setNetUsers(propertiesDetails: any, isProperties?: boolean) {
    this.propertiesDetails = propertiesDetails;
    const executableWithNetUsers = [];
    if (propertiesDetails?.netUserMapping?.length) {
      propertiesDetails?.netUserMapping.forEach((x) => {
        x.script.netUsers = x?.netUsers;
        executableWithNetUsers.push(x.script);
      });

      executableWithNetUsers.map(x => ((this.router?.url.includes("properties") || isProperties) && propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? x.disabled = false : x.disabled = true);

      // executableWithNetUsers.sort((a, b) => {
      //   if (a.scriptName < b.scriptName) {
      //     return -1;
      //   }
      //   if (a.scriptName > b.scriptName) {
      //     return 1;
      //   }
      //   return 0;
      // });

      // executableWithNetUsers.forEach((x, i) => {
      //   x.order = i;
      // });

      this.executables = executableWithNetUsers;
      this.appIntegrationDataService.storeNetUsersExecutables(this.executables);
    }
  }
  /*============= Set Existing Net Users For Properties =============*/

  /*============= Get Net Users =============*/
  selectNetUser(executable: any, index: number) {
    const dialogRef = this.dialog.open(NetUsersComponent, {
      width: '600px',
      maxHeight: '800px',
      data: {
        index: index,
        workspaceId: this.workspaceId,
        executable: executable
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.isSaved) {
        if (this.executables?.length) {
          // this.executables.forEach((item, i, arr) => {
          //   if (Number(item?.id) === Number(result?.executableId)) {
          //     item.netUsers = result?.selectedNetUsers;
          //   }
          // });

          const clonedArray = JSON.parse(JSON.stringify(this.executables));
          clonedArray.forEach((x, i, arr) => {
            if (i === index) {
              x.netUsers = result?.selectedNetUsers;
              return;
            }
          });

          this.executables = clonedArray;
          this.appIntegrationDataService.storeNetUsersExecutables(this.executables);
        }
      }
    });
  }
  /*============= END Get Net Users =============*/

  /*============== Get Net Users Data ==============*/
  getNetUsersData() {
    if (this.executables?.length) {
      const netUsersMappingArr: Array<NetUserMapping> = [];
      this.executables.forEach((item, i, arr) => {
        if (item?.scriptParameterDataList?.length) {
          item?.scriptParameterDataList.forEach((item) => {
            delete item?.currentParameterObj;
            delete item?.isProcessParam;
          });
        }
        delete item?.isSelected;
        delete item?.disabled;
        const netUserMappingObj: NetUserMapping = {
          active: false,
          script: item,
          netUsers: item?.netUsers?.length ? item?.netUsers : []
        };
        netUsersMappingArr.push(netUserMappingObj);
      });
      return netUsersMappingArr;
    } else {
      return [];
    }
  }
  /*============== END Get Net Users Data ==============*/

  ngOnDestroy(): void {
    this.getScriptsSub.unsubscribe();
    this.getNetUsersSub.unsubscribe();
  }

}
