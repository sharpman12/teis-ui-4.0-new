import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MessageService } from 'primeng/api';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { Constants } from 'src/app/shared/components/constants';
import { WorkspaceMgmtService } from '../workspace-mgmt.service';
import { Workspaces } from '../workspaces';
import { AddEditWorkspacesComponent } from './add-edit-workspaces/add-edit-workspaces.component';
import { LogDetailsComponent } from './log-details/log-details.component';
import { NotificationComponent } from './notification/notification.component';
import { RemoveWorkspacesComponent } from './remove-workspaces/remove-workspaces.component';
import { ProgressiveLoaderService } from 'src/app/core/service/progressiveloader.service';
import { AppIntegrationDataService } from 'src/app/application-integration/app-integration/app-integration-data.service';
import { DashboardDataService } from 'src/app/dashboard/dashboard-data.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-workspaces',
  templateUrl: './workspaces.component.html',
  styleUrls: ['./workspaces.component.scss']
})
export class WorkspacesComponent implements OnInit {
  loading = false;
  workspaces: Array<any>;
  userName: string;
  isSelectAllWs = false;
  selectedWorkspaces = [];
  enableDeployUndeployActionBtn = false;
  enableCreateUpdateDeleteActionBtn = false;
  currentUser: any = null;
  userWorkspaceAccess: Array<any> = [];

  @Output() selectedWsLength: EventEmitter<number> = new EventEmitter();

  constructor(
    public dialog: MatDialog,
    private authService: AuthService,
    private messageService: MessageService,
    public loaderService: ProgressiveLoaderService,
    private workspaceMgmtService: WorkspaceMgmtService,
    private dashboardDataService: DashboardDataService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.userName = localStorage.getItem(Constants.USERNAME);
    this.getWorkspaces('', false, false, this.currentUser?.workspaceAccess);
    this.setActionPermissions();
  }

  setActionPermissions() {
    if (localStorage.getItem(Constants.DEPLOY_UNDEPLOY_WORKSPACE)) {
      this.enableDeployUndeployActionBtn = true;
    }
    if (localStorage.getItem(Constants.WORKSPACE_MANAGEMENT_CARD)) {
      this.enableCreateUpdateDeleteActionBtn = true;
    }
  }

  /*============== Get All Workspaces by Username ==============*/
  getWorkspaces(workspaceId: string, isCreated: boolean, isUpdated: boolean, workspaceAccess: Array<any>) {
    this.selectedWorkspaces = [];
    this.isSelectAllWs = false;
    const accessWorkspacesArr = [];
    const accessWorkspaces = workspaceAccess;
    this.workspaceMgmtService.getAllWorkspaces(this.userName).subscribe((res) => {
      const workspaces = JSON.parse(JSON.stringify(res));
      if (workspaces?.length && accessWorkspaces?.length) {
        accessWorkspaces.forEach((aws) => {
          workspaces.forEach((ws) => {
            if (Number(aws?.workspaceId) === Number(ws?.id)) {
              if (aws?.accessList.some((x) => x?.key === 'WM')) {
                accessWorkspacesArr.push(ws);
              }
            }
          });
        });

        const sortWorkspaces = accessWorkspacesArr.sort((a, b) => a.name.localeCompare(b.name));

        let ws = [];
        if (!this.currentUser?.superAdminUser) {
          ws = sortWorkspaces.filter((item) => Number(item?.id) !== 1);
        } else {
          ws = sortWorkspaces;
        }

        if (ws?.length) {
          ws.forEach((item) => {
            item.deployUndeployAccess = false;
            item.createUpdateDeleteAccess = false;
            item.enableDisableSchedulerAccess = false;
            item.enableDisableServicesAccess = false;
            item.isSelected = false;
            item.isChecked = false;
            item.isInfoShow = false;
            if (workspaceId === item?.id) {
              item.isRecentlyCreated = isCreated;
              item.isRecentlyUpdated = isUpdated;
            } else {
              item.isRecentlyCreated = false;
              item.isRecentlyUpdated = false;
            }
          });
          this.workspaces = this.getWorkspaceActionPermission(ws, workspaceAccess);
        }
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============== END Get All Workspaces by Username ==============*/

  getWorkspaceActionPermission(workspaces: Array<Workspaces>, workspaceAccess: Array<any>) {
    if (workspaces?.length && workspaceAccess?.length) {
      workspaces.forEach((ws) => {
        workspaceAccess.forEach((wsa) => {
          if (Number(ws?.id) === Number(wsa?.workspaceId)) {
            if (wsa?.accessList?.length) {
              wsa?.accessList.forEach((access) => {
                if (access?.key === 'WM_DEPLOY_WS') {
                  ws.deployUndeployAccess = true;
                }
                if (access?.key === 'WM_CRUD_WS') {
                  ws.createUpdateDeleteAccess = true;
                }
                if (access?.key === 'WM_ENDSSCH') {
                  ws.enableDisableSchedulerAccess = true;
                }
                if (access?.key === 'WM_ENDSS') {
                  ws.enableDisableServicesAccess = true;
                }
              });
            }
          }
        });
      });
      return workspaces;
    }
  }

  getLoginUserAccessData(workspaceId: string, isCreated: boolean, isUpdated: boolean, isRemoved: boolean) {
    const userInfo = JSON.parse(localStorage.getItem("KEYCLOAK_USERINFO"));
    const currentUserInfo = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
    this.authService.userInfo({ username: userInfo?.preferred_username, password: "" }).pipe(first()).subscribe((res) => {
      localStorage.setItem(Constants.CURRENTUSER, JSON.stringify(res));
      this.userWorkspaceAccess = res?.workspaceAccess;
      this.getWorkspaces(workspaceId, isCreated, isUpdated, res?.workspaceAccess);
      if (workspaceId && !isRemoved) {
        this.getWorkspaceItemInfo([workspaceId], isCreated, isUpdated, false, false);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*========== Deploy/Undeploy Item Dto ==========*/
  deployItemDto(workspaceId: any) {
    return {
      workspaceId: workspaceId,
      reportRequired: true,
      redeployRequired: false
    };
  }
  /*========== END Deploy/Undeploy Item Dto ==========*/

  /*========== Get Selected Workspace Length ==========*/
  getSelectedWsLength(selectedWorkspacesLength: number) {
    this.selectedWsLength.emit(selectedWorkspacesLength);
  }

  getSelectedWorkspaces() {
    this.selectedWorkspaces = [];
    if (this.workspaces?.length) {
      this.selectedWorkspaces = this.workspaces.filter((ws) => ws?.isChecked);
      this.getSelectedWsLength(this.selectedWorkspaces?.length);
    }
    return this.selectedWorkspaces;
  }

  /*============== Select All Workspaces =============*/
  selectAllWs() {
    // this.selectedWorkspaces = [];
    // this.getSelectedWsLength(this.selectedWorkspaces?.length);
    // this.isSelectAllWs = !this.isSelectAllWs;
    if (this.workspaces?.length) {
      // this.workspaces.forEach((item) => {
      //   if (this.isSelectAllWs) {
      //     if (item?.status !== 'Archived') {
      //       item.isChecked = this.isSelectAllWs;
      //       if (item?.isChecked) {
      //         this.selectedWorkspaces.push(this.deployItemDto(item?.id));
      //         this.getSelectedWsLength(this.selectedWorkspaces?.length);
      //       }
      //     }
      //   } else {
      //     item.isChecked = this.isSelectAllWs;
      //     if (item?.isChecked) {
      //       this.selectedWorkspaces = [];
      //       this.getSelectedWsLength(this.selectedWorkspaces?.length);
      //     }
      //   }
      // });

      this.workspaces.forEach((ws) => {
        if (ws?.status !== 'Archived' && ws?.deployUndeployAccess && ws?.enableDisableSchedulerAccess && ws?.enableDisableServicesAccess) {
          ws.isChecked = this.isSelectAllWs;
        }
      });
      this.getSelectedWorkspaces();
    }
  }

  /*============== On Select Workspaces ==============*/
  onSelectWS(event: any, workspace: any) {
    const isAllWsSelected = this.workspaces.some(x => !x?.isChecked && x?.status !== 'Archived');
    if (!isAllWsSelected) {
      this.isSelectAllWs = true;
    } else {
      this.isSelectAllWs = false;
    }
    // if (event?.target?.checked) {
    //   this.selectedWorkspaces.push(this.deployItemDto(workspace?.id));
    //   this.getSelectedWsLength(this.selectedWorkspaces?.length);
    // } else {
    //   this.removedWsIds(workspace?.id);
    //   this.getSelectedWsLength(this.selectedWorkspaces?.length);
    // }
    this.getSelectedWorkspaces();
  }

  removedWsIds(workspaceId: any) {
    // const index = this.selectedWorkspaces.indexOf(workspaceId);
    // if (index > -1) {
    //   this.selectedWorkspaces.splice(index, 1);
    // }
    this.selectedWorkspaces.splice(this.selectedWorkspaces.findIndex(a => a.workspaceId === workspaceId), 1);
  }

  /*========= Get Workspace Item Info =========*/
  getWorkspaceItemInfo(workspaceIds: Array<any>, isCreated: boolean, isUpdated: boolean, isDeployed: boolean, isUndeployed: boolean) {
    this.workspaces.forEach(el => {
      el.isRecentlyCreated = false;
      el.isRecentlyUpdated = false;
      el.isRecentlyDeployed = false;
      el.isRecentlyUndeployed = false;
    });
    this.workspaceMgmtService.getWorkspaceItemInfo(workspaceIds).subscribe(res => {
      this.isSelectAllWs = false;
      if (res?.length && this.workspaces?.length) {
        res.forEach(ws => {
          this.workspaces.forEach(item => {
            if (ws?.id === item?.id) {
              item.isInfoShow = true;
              item.isChecked = false;
              item.isRecentlyCreated = isCreated;
              item.isRecentlyUpdated = isUpdated;
              item.isRecentlyDeployed = isDeployed;
              item.isRecentlyUndeployed = isUndeployed;
              item.deployLogId = ws.deployLogId;
              item.deployedItems = ws.deployedItems;
              item.lockedItems = ws.lockedItems;
              item.notInitializeItems = ws.notInitializeItems;
              item.unDeployLogId = ws.unDeployLogId;
              item.unDeployedItems = ws.unDeployedItems;
            }
            // else {
            //   item.isRecentlyCreated = false;
            //   item.isRecentlyUpdated = false;
            //   item.isRecentlyDeployed = false;
            //   item.isRecentlyUndeployed = false;
            // }
          });
        });
        this.selectedWorkspaces = [];
        this.getSelectedWsLength(this.selectedWorkspaces?.length);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*========= END Get Workspace Item Info =========*/

  /*-----------trackBy Function-----------*/
  trackRecordFun(index: number, item: any) {
    return item.id;
  }

  /*========= Create/Update Workspaces Model =========*/
  addEditWorkspace(isAdd: boolean, workspace: any) {
    const data = {
      isAdd: isAdd,
      workspace: workspace
    };
    const dialogRef = this.dialog.open(AddEditWorkspacesComponent, {
      width: '700px',
      maxHeight: '600px',
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.isSave) {
        if (result?.isAdd) {
          delete result?.isSave;
          delete result?.isAdd;
          delete result?.isUpdate;
          this.createWorkspace(result);
        }
        if (result?.isUpdate) {
          delete result?.isSave;
          delete result?.isAdd;
          delete result?.isUpdate;
          this.updateWorkspace(result);
        }
      }
    });
  }
  /*========= END Create/Update Workspaces Model =========*/

  /*========= Create Workspaces =========*/
  createWorkspace(WorkspaceDto: Workspaces) {
    this.dashboardDataService.clearAllWorkspaces();
    this.appIntegrationDataService.clearWorkspaces();
    WorkspaceDto.updatedBy=this.currentUser.userName;
    this.workspaceMgmtService.createWorkspace(WorkspaceDto).subscribe(res => {
      this.getLoginUserAccessData(res.toString(), true, false, false);
      // this.getWorkspaces(res.toString(), true, false, this.userWorkspaceAccess);
      // this.getWorkspaceItemInfo([res.toString()], true, false, false, false);
      this.messageService.add({ key: 'workspaceMgmtKey', severity: 'success', summary: '', detail: 'Workspace created successfully!' });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'WsMgmtErrKey', severity: 'error', summary: '', detail: err?.error?.message, life: 5000  });
      }
    });
  }
  /*========= END Create Workspaces =========*/

  /*========= Update Workspaces =========*/
  updateWorkspace(WorkspaceDto: Workspaces) {
    this.dashboardDataService.clearAllWorkspaces();
    this.appIntegrationDataService.clearWorkspaces();
    WorkspaceDto.defaultWorkspace = WorkspaceDto?.userIds?.length ? true : false;
    this.workspaceMgmtService.updateWorkspace(WorkspaceDto).subscribe(res => {
      this.getLoginUserAccessData(WorkspaceDto?.id, false, true, false);
      // this.getWorkspaces(WorkspaceDto?.id, false, true, this.currentUser?.workspaceAccess);
      // this.getWorkspaceItemInfo([WorkspaceDto?.id], false, true, false, false);
      this.messageService.add({ key: 'workspaceMgmtKey', severity: 'success', summary: '', detail: 'Workspace updated successfully!' });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'WsMgmtErrKey', severity: 'error', summary: '', detail: err?.error?.message, life: 5000  });
      }
    });
  }
  /*========= END Update Workspaces =========*/

  /*========= Remove Workspaces =========*/
  removeWorkspace(workspaceId: number, workspaceName: string, workspaceStatus: string) {
    const workspaceData = {
      workspaceName: workspaceName,
      workspaceStatus: workspaceStatus
    };
    const dialogRef = this.dialog.open(RemoveWorkspacesComponent, {
      width: '700px',
      maxHeight: '600px',
      data: workspaceData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.isRemove) {
        this.deleteWorkspace(workspaceId, result?.isTaskDelete);
      }
    });
  }

  deleteWorkspace(workspaceId: number, removeAllTasks: boolean) {
    this.workspaceMgmtService.removeWorkspace(workspaceId, removeAllTasks).subscribe(res => {
      this.selectedWorkspaces = [];
      this.getSelectedWsLength(this.selectedWorkspaces?.length);
      // this.getWorkspaces('', false, false, this.currentUser?.workspaceAccess);
      this.getLoginUserAccessData(res.toString(), false, false, true);
      this.appIntegrationDataService.clearWorkspaces();
      this.messageService.add({ key: 'workspaceMgmtKey', severity: 'success', summary: '', detail: 'Workspace removed successfully!' });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*========= END Remove Workspaces =========*/

  /*========= Deploy/Undeploy Workspaces This method work for Admin User Only =========*/
  deployUndeployWorkspace(item: Workspaces, isDeploy: boolean) {
    this.selectedWorkspaces = [item];
    if (isDeploy) {
      this.deployWorkspace();
    } else {
      this.undeployWorkspace();
    }
  }

  /*========= Deploy Workspaces =========*/
  deployWs() {
    let isArchived = false;
    let wsItem;
    this.selectedWorkspaces.forEach(ws => {
      this.workspaces.forEach(item => {
        if (Number(ws?.workspaceId) === Number(item?.id)) {
          if (item?.status === 'Archived') {
            isArchived = true;
            wsItem = item;
          }
        }
      });
    });
    if (isArchived) {
      // Show pop up for not performing any action on archived items
      this.removeWorkspace(wsItem?.id, wsItem?.name, 'Archived');
    } else {
      this.deployWorkspace();
    }
  }

  deployWorkspace(workspaceId?: string) {
    this.loading = true;
    const workspaces = [];
    if (this.selectedWorkspaces?.length) {
      this.selectedWorkspaces.forEach((x) => {
        workspaces.push(this.deployItemDto(x?.id));
      });
    }
    this.workspaceMgmtService.deployWorkspace(workspaces).subscribe(res => {
      res.isDeploy = true;
      if (this.selectedWorkspaces?.length === 1) {
        this.deployUndeployNotification(res, this.selectedWorkspaces[0]?.id);
        this.loading = false;
      }
      if (this.selectedWorkspaces?.length > 1) {
        const workspaceIds = this.selectedWorkspaces.map(worksapce => worksapce?.id);
        this.getWorkspaceItemInfo(workspaceIds, false, false, true, false);
        this.loading = false;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'WsMgmtInfoKey', severity: 'info', summary: '', detail: err?.error?.message });
        const workspaceIds = this.selectedWorkspaces.map(worksapce => worksapce?.id);
        this.getWorkspaceItemInfo(workspaceIds, false, false, false, false);
        this.loading = false;
      }
    });
  }
  /*========= END Deploy Workspaces =========*/

  /*========= Undeploy Workspaces =========*/
  undeployWs() {
    let isArchived = false;
    let wsItem;
    this.selectedWorkspaces.forEach(ws => {
      this.workspaces.forEach(item => {
        if (Number(ws?.workspaceId) === Number(item?.id)) {
          if (item?.status === 'Archived') {
            isArchived = true;
            wsItem = item;
          }
        }
      });
    });
    if (isArchived) {
      // Show pop up for not performing any action on archived items
      this.removeWorkspace(wsItem?.id, wsItem?.name, 'Archived');
    } else {
      this.undeployWorkspace();
    }
  }

  undeployWorkspace(workspaceId?: string) {
    this.loading = true;
    const workspaces = [];
    if (this.selectedWorkspaces?.length) {
      this.selectedWorkspaces.forEach((x) => {
        workspaces.push(this.deployItemDto(x?.id));
      });
    }
    this.workspaceMgmtService.undeployWorkspace(workspaces).subscribe(res => {
      res.isDeploy = false;
      if (this.selectedWorkspaces?.length === 1) {
        this.deployUndeployNotification(res, this.selectedWorkspaces[0]?.id);
        this.loading = false;
      }
      if (this.selectedWorkspaces?.length > 1) {
        const workspaceIds = this.selectedWorkspaces.map(worksapce => worksapce?.id);
        this.getWorkspaceItemInfo(workspaceIds, false, false, false, true);
        this.loading = false;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'WsMgmtInfoKey', severity: 'info', summary: '', detail: err?.error?.message });
        const workspaceIds = this.selectedWorkspaces.map(worksapce => worksapce?.id);
        this.getWorkspaceItemInfo(workspaceIds, false, false, false, false);
        this.loading = false;
      }
    });
  }
  /*========= END Undeploy Workspaces =========*/

  deployUndeployNotification(data: any, workspaceId: string) {
    const dialogRef = this.dialog.open(NotificationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: data
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.isClosed) {
        if (result?.isDeploy) {
          this.getWorkspaceItemInfo([workspaceId], false, false, true, false);
          // tslint:disable-next-line: max-line-length
          // this.messageService.add({ key: 'workspaceMgmtKey', severity: 'success', summary: '', detail: 'Workspace deployed successfully!' });
        } else {
          this.getWorkspaceItemInfo([workspaceId], false, false, false, true);
          // tslint:disable-next-line: max-line-length
          // this.messageService.add({ key: 'workspaceMgmtKey', severity: 'success', summary: '', detail: 'Workspace undeployed successfully!' });
        }
      }
    });
  }

  /*========= Get Log Details =========*/
  getLogDetails(logId: string, isDeploy: boolean) {
    if (isDeploy) {
      this.workspaceMgmtService.getLogDetailsById(logId).subscribe(res => {
        this.logDetails(res?.logContentsString, isDeploy);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
    if (!isDeploy) {
      this.workspaceMgmtService.getLogDetailsById(logId).subscribe(res => {
        this.logDetails(res?.logContentsString, isDeploy);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  logDetails(logContent: string, isDeploy: boolean) {
    const logData = {
      logContent: logContent,
      isDeploy: isDeploy
    };
    const dialogRef = this.dialog.open(LogDetailsComponent, {
      width: '800px',
      height: '600px',
      data: logData
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }
  /*========= END Get Log Details =========*/

  /*========= Disable Scheduler =========*/
  disableScheduler() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: 'Are you sure you want to disable the schedulers and alarms for the selected workspace(s)?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // const workspaceIds = this.workspaces.map(worksapce => worksapce?.id);
        const workspaceIds = this.selectedWorkspaces.map(worksapce => worksapce?.id);
        const disableScheduler = {
          workspaceIds: workspaceIds,
          schedulerDisabled: true,
          wswDisabled: false
        };
        this.workspaceMgmtService.disableScheduler(disableScheduler).subscribe(res => {
          this.isSelectAllWs = false;
          this.selectedWorkspaces = [];
          this.getSelectedWsLength(this.selectedWorkspaces?.length);
          workspaceIds.forEach(id => {
            this.workspaces.forEach(item => {
              item.isChecked = false;
              if (Number(id) === Number(item?.id)) {
                item.schedulerDisabled = res;
              }
            });
          });
          this.messageService.add({ key: 'workspaceMgmtKey', severity: 'success', summary: '', detail: 'Disabled the schedulers and alarms for selected workspace(s) successfully!' });
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
  /*========= END Disable Scheduler =========*/

  /*========= Enable Scheduler =========*/
  enableScheduler() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: 'Are you sure you want to enable the schedulers and alarms for the selected workspace(s)?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // const workspaceIds = this.workspaces.map(worksapce => worksapce?.id);
        const workspaceIds = this.selectedWorkspaces.map(worksapce => worksapce?.id);
        const disableScheduler = {
          workspaceIds: workspaceIds,
          schedulerDisabled: false,
          wswDisabled: false
        };
        this.workspaceMgmtService.disableScheduler(disableScheduler).subscribe(res => {
          this.isSelectAllWs = false;
          this.selectedWorkspaces = [];
          this.getSelectedWsLength(this.selectedWorkspaces?.length);
          workspaceIds.forEach(id => {
            this.workspaces.forEach(item => {
              item.isChecked = false;
              if (Number(id) === Number(item?.id)) {
                item.schedulerDisabled = res;
              }
            });
          });
          this.messageService.add({ key: 'workspaceMgmtKey', severity: 'success', summary: '', detail: 'Enabled the schedulers and alarms for selected workspace(s) successfully!' });
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
  /*========= END Enable Scheduler =========*/

  /*========= Disable Web Services =========*/
  disableWebServices() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: 'Are you sure you want to disable the web services for the selected workspace(s)?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // const workspaceIds = this.workspaces.map(worksapce => worksapce?.id);
        const workspaceIds = this.selectedWorkspaces.map(worksapce => worksapce?.id);
        const disableWebServices = {
          workspaceIds: workspaceIds,
          schedulerDisabled: false,
          wswDisabled: true
        };
        this.workspaceMgmtService.disableWebservices(disableWebServices).subscribe(res => {
          this.isSelectAllWs = false;
          this.selectedWorkspaces = [];
          this.getSelectedWsLength(this.selectedWorkspaces?.length);
          workspaceIds.forEach(id => {
            this.workspaces.forEach(item => {
              item.isChecked = false;
              if (Number(id) === Number(item?.id)) {
                item.webServiceDisabled = res;
              }
            });
          });
          this.messageService.add({ key: 'workspaceMgmtKey', severity: 'success', summary: '', detail: 'Disabled the web services for selected workspace(s) successfully!' });
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
  /*========= END Disable Scheduler =========*/

  /*========= Enable Web Services =========*/
  enableWebServices() {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: 'Are you sure you want to enable the web services for the selected workspace(s)?'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // const workspaceIds = this.workspaces.map(worksapce => worksapce?.id);
        const workspaceIds = this.selectedWorkspaces.map(worksapce => worksapce?.id);
        const disableWebServices = {
          workspaceIds: workspaceIds,
          schedulerDisabled: false,
          wswDisabled: false
        };
        this.workspaceMgmtService.disableWebservices(disableWebServices).subscribe(res => {
          this.isSelectAllWs = false;
          this.selectedWorkspaces = [];
          this.getSelectedWsLength(this.selectedWorkspaces?.length);
          workspaceIds.forEach(id => {
            this.workspaces.forEach(item => {
              item.isChecked = false;
              if (Number(id) === Number(item?.id)) {
                item.webServiceDisabled = res;
              }
            });
          });
          this.messageService.add({ key: 'workspaceMgmtKey', severity: 'success', summary: '', detail: 'Enabled the web services for selected workspace(s) successfully!' });
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
  /*========= END Enable Scheduler =========*/

}
