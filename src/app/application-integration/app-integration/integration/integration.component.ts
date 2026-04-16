import { HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { Route, Router } from "@angular/router";
import { MessageService, TreeNode } from "primeng/api";
import { AppIntLogsComponent } from "../app-int-logs/app-int-logs.component";
import { AppIntegrationService } from "../app-integration.service";
import { Appintitemtree } from "../appintitemtree";
import { EMPTY, forkJoin, Subject, Subscription } from "rxjs";
import { AppIntegrationDataService } from "../app-integration-data.service";
import { AppIntServiceLogComponent } from "../app-int-service-log/app-int-service-log.component";
import { AppIntEventLogComponent } from "../app-int-event-log/app-int-event-log.component";
import {
  AppliedFilters,
  DeployUndeployItemsDto,
  MarkAllTaskAsCompletedDto,
  TaskDetailsDto,
  TeisItemDto,
  UserAccessValidationDto
} from "../appintegration";
import { AppIntMarkAllAsCompletedComponent } from "../app-int-mark-all-as-completed/app-int-mark-all-as-completed.component";
import { Constants } from "src/app/shared/components/constants";
import { catchError, finalize, switchMap, take, tap } from "rxjs/operators";
import { AppIntCreateFolderComponent } from "../app-int-create-folder/app-int-create-folder.component";
import { ConfirmationComponent } from "src/app/shared/components/confirmation/confirmation.component";
import { RestartTaskComponent } from "src/app/task-management/restart-task/restart-task.component";
import { StartTaskDetailsDto, StopAllTasksDto } from "src/app/task-management/tasks-management/task-mgmt";
import { AppIntConfirmationComponent } from "../app-int-confirmation/app-int-confirmation.component";
import { ToTitleCaseService } from "src/app/shared/services/to-title-case.service";
import { AppIntMoveItemComponent } from "../app-int-move-item/app-int-move-item.component";
import { AppIntStopTasksComponent } from "../app-int-stop-tasks/app-int-stop-tasks.component";
import { ScriptViewComponent } from "src/app/task-management/tasks-management/script-view/script-view.component";
import { AppIntPasteItemComponent } from "../app-int-paste-item/app-int-paste-item.component";
import { SearchItemComponent } from "../search-item/search-item.component";
import { EncryptDecryptService } from "src/app/shared/services/encrypt-decrypt.service";
import { InteractiveModeComponent } from "../interactive-mode/interactive-mode.component";
import { TabCommunicationService } from "src/app/shared/services/tab-communication.service";
import { DebugScriptEngineComponent } from "src/app/development/development/debug-script-engine/debug-script-engine.component";
import { ScriptStateService } from "src/app/shared/services/script-state.service";
import { DevelopmentService } from "src/app/development/development.service";
import { DomSanitizer } from "@angular/platform-browser";
import { KeycloakSecurityService } from "src/app/shared/services/keycloak-security.service";
import { TasksManagementService } from "src/app/task-management/tasks-management/tasks-management.service";
import { UserSettingService } from "src/app/dashboard/user-settings/user-setting.service";

@Component({
  selector: "app-integration",
  templateUrl: "./integration.component.html",
  styleUrls: ["./integration.component.scss"],
})
export class IntegrationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedWorkspaceId: number;
  @Input() getWorkspaceTreeObj: TaskDetailsDto;
  @Output() isActionPerformEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() processDetailEvent: EventEmitter<object> = new EventEmitter();
  @Output() showSearchItemEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() showFilterViewEvent: EventEmitter<boolean> = new EventEmitter();
  isLoading: boolean = false;
  currentUser: any;
  selectedIntegrationFile: TreeNode;
  activeIntegrationIndex = 0;
  integrationCurrentTabIndex = 0;
  selectedIntFilterOption: Array<any> = [];
  WsIntegrationTree: Array<any> = [];
  integrationItemTree: TreeNode[] = [];
  integrationTreeItems: Array<any> = [];
  selectedIntegrationTreeItem: any = null;
  integrationDetails: any = null;
  integrationItemDeatils: any = null;
  itemIds: Array<any>;
  deployed: boolean = true;
  disabled: boolean = false;
  locked: boolean = false;
  belongsToFolderId: number = null;
  intTreeItemCount: number = null;
  filteredIntItemCount: number = null;
  isIntegrationCopied: boolean = false;
  isCRUDFPITAccess: boolean = false;
  isDeployUndeployFPITAccess: boolean = false;
  isMoveItemAccess: boolean = false;
  isStartStopMarkAsCompletedAccess: boolean = false;
  isActionBtnDisabled: boolean = true;
  createdOrUpdatedPITItem: any = null;
  integrationItemStatus: any = null;
  isInParameters: boolean = true;
  isInParametersValue: boolean = false;
  isOutParamters: boolean = false;
  isHiddenParameters: boolean = false;
  isAlarmSchedulerShow = false;
  integrationFilterOptions = [];
  isIntReturnFilterVisible: Boolean = false;
  isParameterSettings: boolean = false;
  isIntSearchItemExist: boolean = false;
  isStatusLoading: boolean = false;
  isBack: boolean = false;
  private load$ = new Subject<void>();

  private getWorkspaceTreeSub = Subscription.EMPTY;
  private getWorkspaceTreeItemStatusSub = Subscription.EMPTY;
  private getIntegrationDetailsSub = Subscription.EMPTY;
  private markAllTaskAsCompletedSub = Subscription.EMPTY;
  private deployIntegrationItemsSub = Subscription.EMPTY;
  private unDeployIntegrationItemsSub = Subscription.EMPTY;
  private deleteIntegrationFolderSub = Subscription.EMPTY;
  private deleteIntItemSub = Subscription.EMPTY;
  private taskStartSub = Subscription.EMPTY;
  private getIntegrationItemStatusSub = Subscription.EMPTY;
  private stopAllTasksSub = Subscription.EMPTY;
  private getIntegrationByIdSub = Subscription.EMPTY;
  private pasteIntegrationSub = Subscription.EMPTY;
  private enableDisableIntegrationSub = Subscription.EMPTY;
  private createTaskSub = Subscription.EMPTY;
  private getValidateAccessSub = Subscription.EMPTY;
  private getScriptLockInfoSub = Subscription.EMPTY;
  private getDebugParameterSub = Subscription.EMPTY;
  private lockInfoAndDebugParamSub = Subscription.EMPTY;
  private getScriptByIdSub = Subscription.EMPTY;
  private workspaceTreeItemCount = Subscription.EMPTY;
  private getUserSettingsSub = Subscription.EMPTY;

  @ViewChild(AppIntServiceLogComponent, { static: false })
  serviceLogs: AppIntServiceLogComponent;
  @ViewChild(AppIntEventLogComponent, { static: false })
  eventLogs: AppIntEventLogComponent;

  private integrationTreeCalled$ = new Subject<{
    taskDetailsDto: TaskDetailsDto;
    isSearching: boolean;
    isItemRemoved: boolean;
    isItemMoved: boolean;
  }>();

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private messageService: MessageService,
    private toTitleCaseService: ToTitleCaseService,
    private encryptDecryptService: EncryptDecryptService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService,
    private cdr: ChangeDetectorRef,
    private tabCommunicationService: TabCommunicationService,
    private scriptStateService: ScriptStateService,
    private developmentService: DevelopmentService,
    private sanitizer: DomSanitizer,
    private kcService: KeycloakSecurityService,
    private tasksManagementService: TasksManagementService,
    private userSettingService: UserSettingService,
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnChanges(changes: SimpleChanges): void { }

  ngOnInit(): void {
    if (this.appIntegrationDataService.getIntegrationFilter().length > 0) {
      this.integrationFilterOptions = this.appIntegrationDataService.getIntegrationFilter();
    } else {
      this.integrationFilterOptions = [
        { id: 1, name: "Undeployed", deleted: false },
        { id: 2, name: "Locked", deleted: false },
        { id: 3, name: "Disabled", deleted: false }
      ];
    }
    if (localStorage.getItem(Constants.APPLICATION_INTEGRATION_CARD)) {
      this.isCRUDFPITAccess = true;
    } else {
      this.isCRUDFPITAccess = false;
    }
    if (localStorage.getItem(Constants.DEPLOY_UNDEPLOY_FPIT)) {
      this.isDeployUndeployFPITAccess = true;
    } else {
      this.isDeployUndeployFPITAccess = false;
    }
    if (localStorage.getItem(Constants.RESTRUCTURING_VIEW)) {
      this.isMoveItemAccess = true;
    } else {
      this.isMoveItemAccess = false;
    }
    if (localStorage.getItem(Constants.START_STOP_REMOVE_ERROR_FLAG_PIT)) {
      this.isStartStopMarkAsCompletedAccess = true;
    } else {
      this.isStartStopMarkAsCompletedAccess = false;
    }

    this.appIntegrationService.returnFromOtherPage.pipe(take(1)).subscribe((isBack) => {
      if (isBack) {
        this.isBack = isBack;
        const selectedInegrationId = this.appIntegrationDataService.getSelectedIntegrationId();
        const searchIntItem = this.appIntegrationDataService.getIntSearchItem();
        this.isIntReturnFilterVisible = selectedInegrationId ? true : false;
        this.isIntSearchItemExist = searchIntItem ? true : false;
        const existedFilters: AppliedFilters =
          this.appIntegrationDataService.getAppliedFilters();
        if (!existedFilters?.undeployed) {
          this.selectedIntFilterOption.push(
            this.integrationFilterOptions[0].id
          );
        }
        if (existedFilters?.locked) {
          this.selectedIntFilterOption.push(
            this.integrationFilterOptions[1].id
          );
        }
        if (existedFilters?.disabled) {
          this.selectedIntFilterOption.push(
            this.integrationFilterOptions[2].id
          );
        }
      }
    });

    // Call worksapce tree API when any action performed
    this.integrationTreeCalled$.pipe(
      switchMap(({ taskDetailsDto, isSearching, isItemRemoved, isItemMoved }) => {
        this.isLoading = true;
        this.isStatusLoading = true;
        const itemCount = this.appIntegrationDataService.getIntTreeItemCount();
        if (itemCount) {
          this.intTreeItemCount = itemCount;
        } else {
          this.getWorkspaceTreeItemCount(taskDetailsDto);
        }

        if (this.isIntReturnFilterVisible) {
          this.isStatusLoading = false;
          this.integrationItemTree = [];
          const taskDetailsDtoData = this.getTaskDetailsToggleSearchObject(taskDetailsDto);
          const selectedIntegrationId = this.appIntegrationDataService.getSelectedIntegrationId();

          this.getWorkspaceTreeSub = this.appIntegrationService.getWorkspaceTreeToggleSearch(taskDetailsDtoData).subscribe((res) => {
            this.isStatusLoading = false;
            this.WsIntegrationTree = res;
            const workspaceItems = res;
            if (workspaceItems?.length) {
              // this.integrationItemTree = [];
              this.appIntegrationDataService.storeIntegrationItemTree(workspaceItems);
              workspaceItems.forEach((element) => {
                let nodeArray: TreeNode;
                nodeArray = new Appintitemtree(element, taskDetailsDto?.workspaceId);
                this.disabledTreeNode(nodeArray);
                this.expandTreeNode(nodeArray, true);
                this.updateTreeIcon(nodeArray);
                this.updateFolderIcon(nodeArray);
                this.getIntegrationTreeItems(nodeArray);
                this.integrationItemTree.push(nodeArray);
              });
              if (selectedIntegrationId) {
                if (this.integrationTreeItems?.length) {
                  this.integrationTreeItems.forEach((x: any) => {
                    if (Number(x?.id) === Number(selectedIntegrationId)) {
                      this.selectedIntegrationFile = x;
                      return false;
                    }
                  });
                  this.nodeSelect(this.selectedIntegrationFile);
                }
              }
            }
            this.isLoading = false;
          }, (err: HttpErrorResponse) => {
            if (err.error instanceof Error) {
              // handle client side error here
            } else {
              // handle server side error here
            }
          });
        } else {
          const treeData: any[] = [];   // UI tree
          const statusData: any[] = [];
          const integrationTree = this.appIntegrationDataService.getIntegrationItemTree();
          const expandedTree = this.appIntegrationDataService.getExpandedIntegrationTree();
          const selectedTreeItem = this.appIntegrationDataService.getSelectedIntegrationItem();
          const taskDetailsDtoData = this.getTaskDetailsObject(taskDetailsDto);

          if (integrationTree?.length) {
            this.WsIntegrationTree = integrationTree;
            const workspaceItems = integrationTree;
            this.workspaceTree(taskDetailsDto, expandedTree, selectedTreeItem, isSearching, isItemRemoved, isItemMoved, workspaceItems);
            this.isLoading = false;
            this.isStatusLoading = false;
            return EMPTY; // EMPTY is a valid Observable
          } else {
            // Call both APIs simultaneously
            const tree$ = this.appIntegrationService.getWorkspaceTree(taskDetailsDtoData).pipe(
              tap((tree) => {
                // show tree immediately
                treeData.push(...tree);
                this.WsIntegrationTree = treeData;
                const workspaceItems = treeData;
                this.workspaceTree(taskDetailsDto, expandedTree, selectedTreeItem, isSearching, isItemRemoved, isItemMoved, workspaceItems);
                this.isLoading = false;
              }));

            const status$ = this.appIntegrationService.getTreeItemStatus(taskDetailsDto).pipe(
              tap((status) => {
                // show status immediately
                statusData.push(...status);
              }));

            return forkJoin([tree$, status$]).pipe(
              tap(([tree, status]) => {
                this.mergeStatusIntoTree(treeData, statusData);
                this.WsIntegrationTree = treeData;
                const workspaceItems = treeData;
                const expandedTree$ = this.appIntegrationDataService.getExpandedIntegrationTree();
                const selectedTreeItem$ = this.appIntegrationDataService.getSelectedIntegrationItem();
                this.workspaceTree(taskDetailsDto, expandedTree$, selectedTreeItem$, isSearching, isItemRemoved, isItemMoved, workspaceItems);
                this.isLoading = false;
                this.isStatusLoading = false;
              }),
              catchError((err: HttpErrorResponse) => {
                // Handle API error gracefully - log and reset loading states
                console.error('Error fetching workspace tree:', err);
                this.isLoading = false;
                this.isStatusLoading = false;
                this.messageService.add({
                  key: 'appIntErrorKey',
                  severity: 'error',
                  detail: 'Failed to load workspace tree. Please try again.'
                });
                return EMPTY; // Return EMPTY to continue subscription chain
              }),
              finalize(() => {
                this.isLoading = false;
                this.isStatusLoading = false;
              })
            );
          }
        }
      }),
      catchError((err: HttpErrorResponse) => {
        // Catch any errors in the switchMap chain
        console.error('Error in process tree subscription:', err);
        this.isLoading = false;
        this.isStatusLoading = false;
        this.messageService.add({
          key: 'appIntErrorKey',
          severity: 'error',
          detail: 'Failed to load process tree. Please try again.'
        });
        return EMPTY; // Keep subscription alive for future emissions
      })
    ).subscribe();
  }

  getWorkspaceTreeItemCount(taskDetailsDtoData) {
    taskDetailsDtoData.showAll = true;
    this.workspaceTreeItemCount = this.appIntegrationService
      .getWorkspaceTreeItemCount(taskDetailsDtoData)
      .subscribe(res => {
        this.intTreeItemCount = res?.Count ?? 0;
        this.appIntegrationDataService.storeIntTreeItemCount(this.intTreeItemCount);
      });
  }

  refreshDetails() {
    if (this.activeIntegrationIndex === 0) {
      if (this.selectedIntegrationTreeItem?.nodeType !== "WORKSPACE" && this.selectedIntegrationTreeItem?.nodeType !== "FOLDER") {
        this.getIntegrationItemDetails(this.selectedIntegrationTreeItem?.id);
        this.getIntegrationItemStatus(this.selectedIntegrationTreeItem?.id);
      }
    }
    if (this.activeIntegrationIndex === 1) {
      this.serviceLogs.refreshServiceLogs();
      this.serviceLogs.getServiceLog(this.itemIds);
    }
    if (this.activeIntegrationIndex === 2) {
      this.eventLogs.refreshEventLogs();
      this.eventLogs.getEventLog(this.itemIds);
    }
  }

  onToggleSchedulerList() {
    this.isAlarmSchedulerShow = !this.isAlarmSchedulerShow;
  }

  /*============ Get Item Status On Refresh ============*/
  getIntegrationItemStatus(itemId: number) {
    this.getIntegrationItemStatusSub = this.appIntegrationService.getPITItemStatus(itemId).subscribe((res) => {
      if (res) {
        const itemStatus = {
          failedCount: res?.itemStatusCount?.Failed,
          initiateCount: res?.itemStatusCount?.Initiate,
          processingCount: res?.itemStatusCount?.Processing,
          processingWithErrorCount: res?.itemStatusCount?.ProcessingWithError,
          hold: res?.itemStatusCount?.Hold,
          inputHold: res?.itemStatusCount?.InputHold
        };
        this.integrationItemStatus = itemStatus;

        this.updateCounts(this.integrationItemTree, itemId, itemStatus);

        if (this.selectedIntegrationTreeItem?.nodeType === 'INTEGRATION') {
          if (this.integrationItemStatus?.processingCount > 0) {
            this.selectedIntegrationTreeItem.icon = "success";
            return;
          }

          if (this.integrationItemStatus?.processingWithErrorCount > 0) {
            this.selectedIntegrationTreeItem.icon = "process_error";
            return;
          }

          if (this.integrationItemStatus?.failedCount > 0) {
            this.selectedIntegrationTreeItem.icon = "danger";
            this.updateParentIcons(this.selectedIntegrationTreeItem, 'close_folder_error', 'open_folder_error');
            return;
          }

          if (this.integrationItemStatus?.hold > 0) {
            this.selectedIntegrationTreeItem.icon = "fa fa-pause-circle-o text-warning";
            return;
          }

          if (this.integrationItemStatus?.inputHold > 0) {
            this.selectedIntegrationTreeItem.icon = "fa fa-pause-circle-o text-warning";
            return;
          }

          if (this.selectedIntegrationTreeItem?.disabled) {
            this.selectedIntegrationTreeItem.icon = "fa fa-stop-circle-o text-warning";
            return;
          }

          if (this.selectedIntegrationTreeItem.scheduled) {
            if (this.selectedIntegrationTreeItem.schedulersDisabled) {
              this.selectedIntegrationTreeItem.icon = "fa fa-bell text-warning";
              return;
            } else {
              this.selectedIntegrationTreeItem.icon = "fa fa-bell text-success";
              return;
            }
          }

          if (this.integrationItemStatus?.processingCount === 0 && this.integrationItemStatus?.processingWithErrorCount === 0 && this.integrationItemStatus?.failedCount === 0) {
            // this.selectedIntegrationTreeItem.icon = "fa fa-cogs";
            this.selectedIntegrationTreeItem.icon = this.selectedIntegrationTreeItem?.scheduled ? this.selectedIntegrationTreeItem.schedulersDisabled ? "fa fa-bell text-warning" : "fa fa-bell text-success" : "fa fa-cogs";
            this.updateParentIcons(this.selectedIntegrationTreeItem, 'fa fa-folder', 'fa fa-folder-open');
            return;
          }
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

  private updateCounts(nodes: any[], id: number, counts: any) {
    nodes.forEach(node => {
      if (node.nodeType.toUpperCase() === 'INTEGRATION' && node.id === id) {
        node.failed = counts?.failedCount;
      }

      if (node.children && Array.isArray(node.children)) {
        this.updateCounts(node.children, id, counts);
      }
    });
  }

  /*============ Reset Integration Filter Options ============*/
  resetIntegrationFilter() {
    if (this.appIntegrationDataService.getIntegrationFilter().length > 0) {
      this.integrationFilterOptions = this.appIntegrationDataService.getIntegrationFilter();

    } else {
      this.integrationFilterOptions = [
        { id: 1, name: "Undeployed", deleted: false },
        { id: 2, name: "Locked", deleted: false },
        { id: 3, name: "Disabled", deleted: false }
      ];
    }
  }

  reinitiateIntegrationProperties() {
    this.isIntegrationCopied = false;
    this.selectedIntegrationTreeItem = null;
    this.WsIntegrationTree = [];
    this.selectedIntFilterOption = [];
    this.integrationItemTree = [];
    this.integrationDetails = null;
    this.integrationItemDeatils = null;
    this.resetIntegrationFilter();
  }

  handleChange(index: number) {
    this.activeIntegrationIndex = index;
    this.appIntegrationDataService.storeIntegrationTabIndex(index);
    if (index === 0) {
    }
    if (index === 1) {
      this.serviceLogs.getServiceLog(this.itemIds);
    }
    if (index === 2) {
      this.eventLogs.getEventLog(this.itemIds);
    }
  }

  /*================= Logs ==================*/
  logs() {
    const dialogRef = this.dialog.open(AppIntLogsComponent, {
      width: "800px",
      maxHeight: "600px",
      data: "",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }
  /*================= END Net User ==================*/

  /*=========== Advanced Search ============*/
  searchItem() {
    const dialogRef = this.dialog.open(SearchItemComponent, {
      width: "600px",
      maxHeight: "600px",
      data: {
        itemType: 'Integration',
        currentFilters: this.integrationFilterOptions,
        selectedFilterItems: this.selectedIntFilterOption
      },
    });


    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isSearch) {
        result.id = this.integrationFilterOptions?.length + 1;
        result.name = result?.searchStr;
        result.deleted = true;
        this.integrationFilterOptions = [...this.integrationFilterOptions, result];
        this.selectedIntFilterOption = [...this.selectedIntFilterOption, result?.id];
        this.appIntegrationDataService.storeSelectedIntegrationFilter(this.selectedIntFilterOption);
        this.appIntegrationDataService.storeIntegrationFilter(this.integrationFilterOptions);
        this.onChangeFilter();
      }
    });
  }

  integrationSelectionChange(newSelection: any[]) {
    const excludedIds = [1, 2, 3];
    const filteredSelection = newSelection.filter(id => !excludedIds.includes(id));
    if (filteredSelection.length > 3) {
      this.selectedIntFilterOption.pop();
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: `You can select only three custom filters.` });
      this.selectedIntFilterOption = [...this.selectedIntFilterOption];
      return;
    }
    this.selectedIntFilterOption = newSelection;
    this.onChangeFilter();

  }

  advancedIntegrationSearch(result) {
    if (result?.isSearch) {
      this.resetReturnToFilter();
      this.selectedIntegrationTreeItem = null;
      this.WsIntegrationTree = [];
      // this.selectedIntFilterOption = [];
      this.integrationItemTree = [];
      this.integrationDetails = null;
      this.integrationItemDeatils = null;
      this.appIntegrationDataService.clearIntSearchItem();
      this.appIntegrationDataService.clearIntegrationItemTree();
      this.appIntegrationDataService.clearSelectedIntegrationItem();
      const updatedResult = {
        ...result,
        id: this.integrationFilterOptions?.length + 1,
        name: result?.searchStr,
        deleted: true
      };
      this.integrationFilterOptions = [...this.integrationFilterOptions, updatedResult];
      this.selectedIntFilterOption = [updatedResult?.id];
      this.appIntegrationDataService.storeSelectedIntegrationFilter(this.selectedIntFilterOption);
      this.appIntegrationDataService.storeIntegrationFilter(this.integrationFilterOptions);
      this.getWorkspaceTreeObj.itemType = 'Integration';
      this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
    }
  }

  /*=========== Remove Option From Filter Dropdown ===========*/
  removeOption(item: any, event: Event) {
    event.stopPropagation(); // Prevents ng-select from selecting the option

    // Remove the item from the integrationFilterOptions list
    this.integrationFilterOptions = this.integrationFilterOptions.filter(opt => opt.id !== item.id);
    this.appIntegrationDataService.storeIntegrationFilter(this.integrationFilterOptions);

    // Also remove it from the selected values (if it's already selected)
    if (this.selectedIntFilterOption.includes(item.id)) {
      this.selectedIntFilterOption = this.selectedIntFilterOption.filter(id => id !== item.id);
      this.onChangeFilter();
    }
  }

  /*=========== On Change Filter ===========*/
  onChangeFilter() {
    this.selectedIntegrationTreeItem = null;
    this.WsIntegrationTree = [];
    // this.selectedIntFilterOption = [];
    this.integrationItemTree = [];
    this.integrationDetails = null;
    this.integrationItemDeatils = null;
    // this.onChangeFilterEvent.emit(true);
    // if (this.appIntegrationDataService.getSearchItem()) {
    //   this.getWorkspaceTreeObj.itemName = "";
    //   this.appIntegrationDataService.clearSearchItem();
    // }
    this.appIntegrationDataService.clearIntegrationItemTree();
    this.appIntegrationDataService.clearSelectedIntegrationItem();
    this.appIntegrationDataService.storeSelectedIntegrationFilter(this.selectedIntFilterOption);
    this.appIntegrationDataService.storeIntegrationFilter(this.integrationFilterOptions);
    // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
  }
  /*============== ENd On Change Filter ===========*/

  getTaskDetailsObject(taskDetailsDto) {
    this.deployed = true;
    this.disabled = false;
    this.locked = false;

    if (this.appIntegrationDataService.getParameterSettings() !== null) {
      let parameterSettings = this.appIntegrationDataService.getParameterSettings();
      this.isInParameters = parameterSettings?.isInParameters;
      this.isInParametersValue = parameterSettings?.isInParametersValue;
      this.isOutParamters = parameterSettings?.isOutParamters;
      this.isHiddenParameters = parameterSettings?.isHiddenParameters;
    }

    this.selectedIntFilterOption = this.appIntegrationDataService.getSelectedIntegrationFilter();
    if (this.appIntegrationDataService.getIntegrationFilter().length > 0) {
      this.integrationFilterOptions = this.appIntegrationDataService.getIntegrationFilter();

    }
    if (this.selectedIntFilterOption?.length) {
      this.selectedIntFilterOption.forEach((item) => {
        if (Number(item) === 1) {
          this.deployed = false;
        }
        if (Number(item) === 2) {
          this.locked = true;
        }
        if (Number(item) === 3) {
          this.disabled = true;
        }
        if (Number(item) !== 1 && Number(item) !== 2 && Number(item) !== 3) {
          const advancedIntSearchArr = [];
          const integrationFilteredArray = this.integrationFilterOptions
            .filter(item => this.selectedIntFilterOption.includes(item.id));
          if (integrationFilteredArray?.length) {
            integrationFilteredArray.forEach((q) => {
              if (q?.isSearch) {
                advancedIntSearchArr.push({
                  // inAllParameters: q?.parameters,
                  inParameterName: q?.parameterName,
                  inParameterValue: q?.parameterValue,
                  inIdentifier: q?.identifiers,
                  inNetUser: q?.netUsers,
                  inItemName: q?.itemName,
                  inItemDescription: q?.itemDescription,
                  advanceSearch: q?.isSearch,
                  advanceInputSearch: q?.searchStr
                });
              }
            });
            const advancedSearchItem = this.integrationFilterOptions.find((x) => Number(item) === Number(x?.id));
            taskDetailsDto.inAllParameters = advancedSearchItem?.parameters;
            // taskDetailsDto.inParameterName = advancedSearchItem?.parameterName;
            // taskDetailsDto.inParameterValue = advancedSearchItem?.parameterValue;
            taskDetailsDto.inIdentifier = advancedSearchItem?.identifiers;
            taskDetailsDto.inNetUser = advancedSearchItem?.netUsers;
            taskDetailsDto.inItemName = advancedSearchItem?.itemName;
            taskDetailsDto.inItemDescription = advancedSearchItem?.itemDescription;
            taskDetailsDto.advanceSearch = advancedSearchItem?.isSearch;
            taskDetailsDto.advanceInputSearch = advancedSearchItem?.searchStr;
            taskDetailsDto.advanceSearchFilters = advancedIntSearchArr;
          }
        }
      });
      taskDetailsDto.showAll = false;
    } else {
      taskDetailsDto.showAll = taskDetailsDto?.itemName ? false : true;
    }
    taskDetailsDto.deployed = this.deployed;
    taskDetailsDto.locked = this.locked;
    taskDetailsDto.disabled = this.disabled;
    return taskDetailsDto;
  }

  getTaskDetailsToggleSearchObject(taskDetailsDto) {
    const selectedIntegrationId = this.appIntegrationDataService.getSelectedIntegrationId();
    this.deployed = true;
    this.disabled = false;
    this.locked = false;
    taskDetailsDto.deployed = this.deployed;
    taskDetailsDto.locked = this.locked;
    taskDetailsDto.disabled = this.disabled;
    taskDetailsDto.toggleSearchItem = Number(selectedIntegrationId);
    return taskDetailsDto;
  }

  /*================= Refresh Workspace Item Tree ==================*/
  refreshTree() {
    this.integrationItemTree = [];
    this.appIntegrationDataService.clearIntegrationItemTree();
    this.appIntegrationDataService.clearIntTreeItemCount();
    // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
  }

  showFilterView() {
    this.appIntegrationDataService.clearIntegrationItemTree();
    this.appIntegrationDataService.clearIntTreeItemCount();
    if (this.appIntegrationDataService.getIntSearchItem()) {
      this.showFilterViewEvent.emit(true);
      this.getWorkspaceTreeObj.itemName = "";
      this.appIntegrationDataService.clearIntSearchItem();
    }
    this.isIntReturnFilterVisible = false;
    this.appIntegrationDataService.clearSelectedIntegrationId();
    this.integrationItemTree = [];
    this.showSearchItemEvent.emit(true);
    // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
    this.isIntSearchItemExist = false;
  }


  intSearchItemExist() {
    this.isIntSearchItemExist = true;
  }

  resetReturnToFilter() {
    this.isIntReturnFilterVisible = false;
    this.isIntSearchItemExist = false;
  }

  getIntegartionDetails(getWorkspaceTreeObj, integartionId) {
    this.isIntReturnFilterVisible = true;
    const selectedIntegrationId = this.isIntReturnFilterVisible ? integartionId : null;
    this.appIntegrationDataService.storeSelectedIntegrationId(selectedIntegrationId);
    // this.getWorkspaceTree(getWorkspaceTreeObj, false, false, false);
    this.getIntegrationTree(getWorkspaceTreeObj, false, false, false);
  }

  toggleLinkVisibility() {
    if (this.isIntReturnFilterVisible) {
      this.appIntegrationDataService.clearSelectedIntegrationId();
      this.isIntReturnFilterVisible = false;
      this.integrationItemTree = [];

    }
    this.isIntReturnFilterVisible = false; // Toggle the visibility when clicked
  }

  /*================= Get Workspace Item Tree ==================*/
  getIntegrationTree(taskDetailsDto: TaskDetailsDto, isSearching: boolean, isItemRemoved: boolean, isItemMoved: boolean) {
    this.isStatusLoading = false;
    this.appIntegrationDataService.clearIntTreeItemCount();
    this.integrationTreeCalled$.next({ taskDetailsDto, isSearching, isItemRemoved, isItemMoved });
  }

  calculateIntTreeItems(tree: any[]): number {
    let count = 0;

    for (const node of tree) {
      if (node.type === 'INTEGRATION') {
        count++;
      }

      if (node.children && node.children.length > 0) {
        count += this.calculateIntTreeItems(node.children);
      }
    }

    return count;
  }


  workspaceTree(taskDetailsDto: any, expandedTree: any[], selectedTreeItem: any, isSearching: boolean, isItemRemoved: boolean, isItemMoved: boolean, workspaceItems: any[]) {
    this.integrationItemTree = [];
    if (workspaceItems?.length) {
      this.appIntegrationDataService.storeIntegrationItemTree(workspaceItems);
      this.filteredIntItemCount = this.calculateIntTreeItems(workspaceItems);
      workspaceItems.forEach((item) => {
        let nodeArray: TreeNode;
        nodeArray = new Appintitemtree(item, taskDetailsDto?.workspaceId);
        this.disabledTreeNode(nodeArray);
        this.expandTreeNode(nodeArray, isSearching ? true : false);
        this.updateTreeIcon(nodeArray);
        this.updateFolderIcon(nodeArray);
        this.expandTree(nodeArray, expandedTree[0], selectedTreeItem);
        if (isItemMoved) {
          this.expandMovedTree(nodeArray);
        }
        this.getIntegrationTreeItems(nodeArray);
        this.integrationItemTree.push(nodeArray);
      });
      // Code for get updated item details after performing any action except Remove Item action
      if (isItemRemoved) {
        if (selectedTreeItem) {
          if (this.integrationTreeItems?.length) {
            this.integrationTreeItems.forEach((item: any) => {
              if (Number(item?.id) === Number(selectedTreeItem?.parent?.id)) {
                this.selectedIntegrationFile = item;
                return false;
              }
            });
            this.nodeSelect(this.selectedIntegrationFile);
          }
        }
      } else {
        if (selectedTreeItem) {
          if (this.integrationTreeItems?.length) {
            this.integrationTreeItems.forEach((x: any) => {
              if (Number(x?.id) === Number(selectedTreeItem?.id)) {
                this.selectedIntegrationFile = x;
                return false;
              }
            });
            this.nodeSelect(this.selectedIntegrationFile);
          }
        } else {
          this.selectedIntegrationTreeItem = null;
          this.appIntegrationDataService.clearSelectedIntegrationItem();
        }
      }
      this.getNewlyCreatedItem();
    }
  }

  private mergeStatusIntoTree(tree: any[], statusData: any[]): void {
    const statusMap = new Map(statusData.map(s => [s.itemId, s.itemStatus]));

    const updateRecursive = (nodes: any[]) => {
      nodes.forEach(node => {
        if (statusMap.has(String(node.id))) {
          node.statusCountMap = statusMap.get(String(node.id));
        }
        if (node.children?.length) {
          updateRecursive(node.children);
        }
      });
    };

    updateRecursive(tree);
  }

  // getWorkspaceTree(taskDetailsDto: TaskDetailsDto, isSearching: boolean, isItemRemoved: boolean, isItemMoved: boolean) {
  //   if (!this.integrationItemTree?.length) {
  //     this.isLoading = true;
  //     if (this.isIntReturnFilterVisible) {
  //       const taskDetailsDtoData = this.getTaskDetailsToggleSearchObject(taskDetailsDto);
  //       const selectedIntegrationId = this.appIntegrationDataService.getSelectedIntegrationId();
  //       this.getWorkspaceTreeSub = this.appIntegrationService.getWorkspaceTreeToggleSearch(taskDetailsDtoData).subscribe((res) => {
  //         this.WsIntegrationTree = res;
  //         const workspaceItems = res;
  //         if (workspaceItems?.length) {
  //           //this.integrationItemTree = [];
  //           this.appIntegrationDataService.storeIntegrationItemTree(workspaceItems);
  //           workspaceItems.forEach((element) => {
  //             let nodeArray: TreeNode;
  //             nodeArray = new Appintitemtree(element, taskDetailsDto?.workspaceId);
  //             this.disabledTreeNode(nodeArray);
  //             this.expandTreeNode(nodeArray, true);
  //             this.updateTreeIcon(nodeArray);
  //             this.updateFolderIcon(nodeArray);
  //             this.getIntegrationTreeItems(nodeArray);
  //             this.integrationItemTree.push(nodeArray);
  //           });
  //           if (selectedIntegrationId) {
  //             if (this.integrationTreeItems?.length) {
  //               this.integrationTreeItems.forEach((x: any) => {
  //                 if (Number(x?.id) === Number(selectedIntegrationId)) {
  //                   this.selectedIntegrationFile = x;
  //                   return false;
  //                 }
  //               });
  //               this.nodeSelect(this.selectedIntegrationFile);
  //             }
  //           }
  //         }
  //         this.isLoading = false;
  //       }, (err: HttpErrorResponse) => {
  //         if (err.error instanceof Error) {
  //           // handle client side error here
  //         } else {
  //           // handle server side error here
  //         }
  //       });
  //     } else {
  //       const expandedTree = this.appIntegrationDataService.getExpandedIntegrationTree();
  //       const selectedTreeItem = this.appIntegrationDataService.getSelectedIntegrationItem();
  //       const taskDetailsDtoData = this.getTaskDetailsObject(taskDetailsDto);
  //       this.getWorkspaceTreeSub = this.appIntegrationService.getWorkspaceTree(taskDetailsDtoData).subscribe((res) => {
  //         this.WsIntegrationTree = res;
  //         const workspaceItems = res;
  //         if (workspaceItems?.length) {
  //           //  this.integrationItemTree = [];
  //           this.appIntegrationDataService.storeIntegrationItemTree(workspaceItems);
  //           workspaceItems.forEach((element) => {
  //             let nodeArray: TreeNode;
  //             nodeArray = new Appintitemtree(element, taskDetailsDto?.workspaceId);
  //             this.disabledTreeNode(nodeArray);
  //             this.expandTreeNode(nodeArray, isSearching ? true : false);
  //             this.updateTreeIcon(nodeArray);
  //             this.updateFolderIcon(nodeArray);
  //             this.expandTree(nodeArray, expandedTree[0], selectedTreeItem);
  //             if (isItemMoved) {
  //               this.expandMovedTree(nodeArray);
  //             }
  //             this.getIntegrationTreeItems(nodeArray);
  //             this.integrationItemTree.push(nodeArray);
  //           });

  //           // Code for get updated item details after performing any action except Remove Item action
  //           if (isItemRemoved) {
  //             if (selectedTreeItem) {
  //               if (this.integrationTreeItems?.length) {
  //                 this.integrationTreeItems.forEach((item: any) => {
  //                   if (Number(item?.id) === Number(selectedTreeItem?.parent?.id)) {
  //                     this.selectedIntegrationFile = item;
  //                     return false;
  //                   }
  //                 });
  //                 this.nodeSelect(this.selectedIntegrationFile);
  //               }
  //             }
  //           } else {
  //             if (selectedTreeItem) {
  //               if (this.integrationTreeItems?.length) {
  //                 this.integrationTreeItems.forEach((x: any) => {
  //                   if (Number(x?.id) === Number(selectedTreeItem?.id)) {
  //                     this.selectedIntegrationFile = x;
  //                     return false;
  //                   }
  //                 });
  //                 this.nodeSelect(this.selectedIntegrationFile);
  //               }
  //             } else {
  //               this.selectedIntegrationTreeItem = null;
  //               this.appIntegrationDataService.clearSelectedIntegrationItem();
  //             }
  //           }
  //           this.getNewlyCreatedItem();
  //         }
  //         this.isLoading = false;
  //         // this.getWorkspaceTreeStatus(taskDetailsDto);
  //       }, (err: HttpErrorResponse) => {
  //         if (err.error instanceof Error) {
  //           // handle client side error here
  //         } else {
  //           // handle server side error here
  //         }
  //       });
  //     }
  //   }
  // }

  /*================= Get Workspace Item Tree Status ==================*/
  getWorkspaceTreeStatus(taskDetailsDto: TaskDetailsDto) {
    this.getWorkspaceTreeItemStatusSub = this.appIntegrationService.getTreeItemStatus(taskDetailsDto).subscribe((res) => {

    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=========== Get Newly Created Item For Set Focus on It ===========*/
  getNewlyCreatedItem() {
    let newItem = null;
    this.appIntegrationService.createdUpdatedPITItem.subscribe((res: any) => {
      if (res) {
        this.createdOrUpdatedPITItem = res;
        if (res?.isCreated) {
          //const itemCount = this.appIntegrationDataService.getIntTreeItemCount();
          // this.appIntegrationDataService.storeIntTreeItemCount(itemCount + 1);

          if (this.integrationTreeItems?.length) {
            this.integrationTreeItems.forEach((x: any) => {
              if (Number(x?.id) === Number(this.createdOrUpdatedPITItem?.itemId)) {
                newItem = x;
                this.selectedIntegrationFile = newItem;
                this.nodeSelect(newItem);
                this.appIntegrationService.sharedCreatedUpdatedPITItem(null);
                const itemCount = this.appIntegrationDataService.getIntTreeItemCount();
                this.intTreeItemCount = itemCount + 1;
                this.appIntegrationDataService.storeIntTreeItemCount(this.intTreeItemCount);
                return false;
              }
            });
          }
        }
      }
    });
  }

  getIntegrationTreeItems(node: any) {
    this.integrationTreeItems.push(node);
    if (node?.children?.length) {
      node?.children.forEach((x: any, index: number) => {
        this.getIntegrationTreeItems(node.children[index]);
      });
    }
  }

  /*=========== Expand Tree ===========*/
  private expandTree(node: any, expandedTree: any, selectedNode: any) {
    if (node?.children?.length) {
      node?.children.forEach((x, index) => {
        if (expandedTree?.children?.length) {
          expandedTree?.children.forEach((y, i) => {
            if (Number(x?.id) === Number(selectedNode?.id)) {
              x.expanded = true;
            }
            if (Number(x?.id) === Number(y?.id)) {
              x.expanded = y?.expanded;
            }
            this.expandTree(node.children[index], expandedTree?.children[i], selectedNode);
          });
        }
      });
    }
  }

  /*=========== Expand Whole Tree After Item is Moved ===========*/
  private expandMovedTree(node: any) {
    node.expanded = true;
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.expandMovedTree(node.children[m]);
      }
    }
  }

  /*=================== Set Tree Node Expanded ===================*/
  private expandTreeNode(node: any, isFullyExpanded: boolean) {
    if (isFullyExpanded) {
      node.expanded = true;
    } else {
      if (node?.nodeType === 'WORKSPACE' && node.children?.length) {
        node.expanded = true;
        node.children[0].expanded = true;
      }
    }
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.expandTreeNode(node.children[m], isFullyExpanded);
      }
    }
  }
  /*=================== END Set Tree Node Expanded ===================*/

  /*=========== Disabled Tree Node ===========*/
  private disabledTreeNode(node: any) {
    // disabled Workspace type tree node
    if (node?.nodeType === "WORKSPACE") {
      node.selectable = false;
    }

    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.disabledTreeNode(node.children[m]);
      }
    }
  }

  updateNodeById(nodeId, newProperties) {
    const tree = this.appIntegrationDataService.getIntegrationItemTree();
    const node = this.findNodeById(tree, nodeId);

    if (node) {
      // Update the node properties
      node.disabled = newProperties?.disabled;
      node.scheduled = newProperties?.scheduled;
      node.schedulersDisabled = newProperties?.schedulersDisabled;
      node.deployed = newProperties?.deployed;
    }
    this.appIntegrationDataService.storeIntegrationItemTree(tree)
  }

  findNodeById(nodeArray, nodeId) {
    for (let node of nodeArray) {
      if (node.id === nodeId) {
        return node;
      }
      if (node.children && node.children.length > 0) {
        const childNode = this.findNodeById(node.children, nodeId);
        if (childNode) {
          return childNode;
        }
      }
    }
    return null;
  }

  updateIconStatus(event: string, enabledDisableItem?: boolean, schedulerDisabled?: boolean) {
    switch (event) {
      case 'EnableDisable':
        if (enabledDisableItem) {
          this.selectedIntegrationTreeItem.disabled = true;
          this.integrationDetails.disable = true;
          this.getIntegrationItemStatus(this.selectedIntegrationTreeItem?.id);
          this.updateNodeById(this.selectedIntegrationTreeItem?.id, this.selectedIntegrationTreeItem);
        } else {
          this.selectedIntegrationTreeItem.disabled = false;
          this.integrationDetails.disable = false;
          this.getIntegrationItemStatus(this.selectedIntegrationTreeItem?.id);
          this.updateNodeById(this.selectedIntegrationTreeItem?.id, this.selectedIntegrationTreeItem);
        }
        break;
      case 'deploy':
        this.selectedIntegrationTreeItem.deployed = true;
        this.selectedIntegrationTreeItem.label = this.selectedIntegrationTreeItem.data;
        this.updateNodeById(this.selectedIntegrationTreeItem?.id, this.selectedIntegrationTreeItem);
        break;
      case 'undeploy':
        this.selectedIntegrationTreeItem.deployed = false;
        this.selectedIntegrationTreeItem.label = this.selectedIntegrationTreeItem.data + "*";
        this.updateNodeById(this.selectedIntegrationTreeItem?.id, this.selectedIntegrationTreeItem)
        break;
      case 'scheduled':
        if (schedulerDisabled) {
          this.selectedIntegrationTreeItem.schedulersDisabled = true;
          this.selectedIntegrationTreeItem.icon = "fa fa-bell text-warning";
          this.updateNodeById(this.selectedIntegrationTreeItem?.id, this.selectedIntegrationTreeItem)
        } else {
          this.selectedIntegrationTreeItem.schedulersDisabled = false;
          this.selectedIntegrationTreeItem.icon = "fa fa-bell text-success";
          this.updateNodeById(this.selectedIntegrationTreeItem?.id, this.selectedIntegrationTreeItem)
        }
        break;
      default:
        break;
    }
  }

  updateTreeIcon(node) {
    if (node?.children) {
      node.children.forEach((childNode) => {
        if (childNode?.nodeType === "FOLDER") {
          if (childNode?.isFailed) {
            if (childNode?.expanded) {
              childNode.icon = "open_folder_error";
            } else {
              childNode.icon = "close_folder_error";
            }
          }
        }
        if (childNode?.nodeType === "INTEGRATION") {
          // First priority item status for show icons
          if (childNode?.processing > 0) {
            childNode.icon = "success";
            childNode.failed = 0;
            childNode.processingWithError = 0;
            return;
          }
          if (childNode?.processingWithError > 0) {
            childNode.icon = "process_error";
            childNode.processing = 0;
            childNode.failed = 0;
            return;
          }
          if (childNode?.failed > 0) {
            childNode.icon = "danger";
            return;
          }
          if (childNode?.hold > 0) {
            childNode.icon = "fa fa-pause-circle-o text-warning";
            return;
          }
          if (childNode?.inputHold > 0) {
            childNode.icon = "fa fa-pause-circle-o text-warning";
            return;
          }
          if (childNode?.disabled) {
            childNode.icon = "fa fa-stop-circle-o text-warning";
            return;
          }
          if (childNode?.scheduled) {
            if (childNode.schedulersDisabled) {
              childNode.icon = "fa fa-bell text-warning";
              return;
            } else {
              childNode.icon = "fa fa-bell text-success";
              return;
            }
          } else {
            childNode.icon = "fa fa-cogs";
            return;
          }
        }
        this.updateTreeIcon(childNode);
      });
    }
  }

  updateFolderIcon(node: any): boolean {
    let hasError = false;

    // If this node has children, check them first (post-order traversal)
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const childHasError = this.updateFolderIcon(child);
        if (childHasError) {
          hasError = true;
        }
      }
    }

    // If this is an INTEGRATION, check its statusCountMap
    if (node.nodeType === 'INTEGRATION' && node?.failed > 0) {
      hasError = true;
    }

    // If this is a FOLDER and any child has error, mark it
    if (node.nodeType === 'FOLDER' && hasError) {
      node.hasError = true; // <-- flag for UI
      node.collapsedIcon = "close_folder_error";
      node.expandedIcon = "open_folder_error";
    } else {
      node.hasError = false;
    }

    return hasError;
  }

  updateParentIcons(node: any, collapsedIcon: string, expandedIcon: string) {
    let current = node.parent; // start from parent

    while (current) {
      if (current.nodeType.toUpperCase() === 'FOLDER') {
        const childHasError = current.children.some((child) => (child.nodeType.toUpperCase() === 'INTEGRATION' && child?.failed > 0) || (child.nodeType.toUpperCase() === 'FOLDER' && child?.hasError));

        if (childHasError) {
          current.hasError = true; // mark parent folder as having error
        } else {
          current.hasError = false; // unmark if no child has error
        }

        if (current.hasError) {
          current.collapsedIcon = 'close_folder_error';
          current.expandedIcon = 'open_folder_error';
          if (current.parent?.hasError) {
            break; // already marked, skip
          }
          // break; // already marked, skip
        } else {
          current.collapsedIcon = collapsedIcon;
          current.expandedIcon = expandedIcon;
        }

        // current.collapsedIcon = collapsedIcon;
        // current.expandedIcon = expandedIcon;
      }
      current = current.parent;
    }
  }

  nodeExpand(node: any) {
    if (node?.isFailed) {
      node.icon = "open_folder_error";
    }
  }

  nodeCollapse(node: any) {
    if (node?.isFailed) {
      node.icon = "close_folder_error";
    }
  }
  /*================= END Get Workspace Item Tree ==================*/

  /*============= Store Expanded Tree Client Side =============*/
  storeExpandedIntegrationTree() {
    this.appIntegrationDataService.storeExpandedIntegrationTree(this.integrationItemTree);
  }
  /*============= END Store Expanded Tree Client Side =============*/

  /*============= Tree Node Selection ============*/
  nodeSelect(item: any) {
    this.selectedIntegrationTreeItem = null;
    //this.appIntegrationDataService.clearSelectedIntegrationItem();
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.appIntegrationDataService.clearDeployedIntAssociatedProcess();
    this.selectedIntegrationTreeItem = item;
   // this.getIntegrationItemStatus(this.selectedIntegrationTreeItem?.id);
    this.appIntegrationDataService.storeSelectedIntegrationItem(this.selectedIntegrationTreeItem);


    this.storeExpandedIntegrationTree();
    if (item?.nodeType === "FOLDER") {
      this.belongsToFolderId = item?.id;
    }
    if (item?.nodeType !== "WORKSPACE" && item?.nodeType !== "FOLDER") {
      this.belongsToFolderId = item?.belongsToFolder;
      this.getIntegrationItemDetails(item?.id);
    }
  }
  /*============= END Tree Node Selection ============*/

  /*============= Tree Node Unselecting ============*/
  nodeUnselect(item: any) { }
  /*============= END Tree Node Unselecting ============*/

  /*============= Get Selected Tree Item Details ============*/
  getIntegrationById(integrationId: number) {
    this.getIntegrationByIdSub = this.appIntegrationService.getDeployedIntegrationById(Number(integrationId)).subscribe((res) => {
      if (res) {
        this.integrationItemDeatils = res;
        this.messageService.add({
          key: "appIntSuccessKey",
          severity: "success",
          summary: "",
          detail: `${this.selectedIntegrationTreeItem?.data} integration copied successfully!`,
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============= Get Selected Tree Item Details ============*/
  getIntegrationItemDetails(integrationId: number) {
    const intTabIndex = this.appIntegrationDataService.getIntegrationTabIndex();

    this.getIntegrationDetailsSub = this.appIntegrationService.getDeployedIntegrationById(Number(integrationId)).subscribe((res) => {
      this.selectedIntegrationTreeItem.scheduled = res?.scheduled;
      const integrationInfo = JSON.parse(JSON.stringify(res));
      this.getIntegrationItemStatus(integrationInfo?.id);
      if (this.isBack) {
        if (integrationInfo?.deployed) {
          this.updateIconStatus('deploy', integrationInfo?.disable, integrationInfo?.schedulersDisabled);
        } else {
          this.updateIconStatus('undeploy', integrationInfo?.disable, integrationInfo?.schedulersDisabled);
        }

        if (!integrationInfo?.disable) {
          if (integrationInfo?.scheduled) {
            this.updateIconStatus('scheduled', integrationInfo?.disable, integrationInfo?.schedulersDisabled);
           // this.getIntegrationItemStatus(integrationInfo?.id);
          } else {
           // this.getIntegrationItemStatus(integrationInfo?.id);
          }
        }
      }

      if (integrationInfo?.scriptList?.length) {
        integrationInfo?.scriptList.forEach((item) => {
          if (item?.scriptParameterDataList?.length) {
            item.scriptParameterDataList = Array.from(new Map(
              item?.scriptParameterDataList.map(data => [data.parameterName.trim(), data])
            ).values());
            item?.scriptParameterDataList.forEach((x) => {
              x.value = null;
              if (integrationInfo?.paramsData?.length) {
                integrationInfo?.paramsData.forEach((p) => {
                  if (x?.parameterName === p?.paramName) {
                    if (x?.securityLevel.toLowerCase() === 'high' && p?.securityLevel.toLowerCase() === 'low') {
                      p.securityLevel = x?.securityLevel;
                      p.value = this.encryptDecryptService.encrypt(p?.value);
                    } else if (x?.securityLevel.toLowerCase() === 'medium' && p?.securityLevel.toLowerCase() === 'low') {
                      p.securityLevel = x?.securityLevel;
                      p.value = this.encryptDecryptService.encrypt(p?.value);
                    } else if (x?.securityLevel.toLowerCase() === 'high' && p?.securityLevel.toLowerCase() === 'medium') {
                      p.securityLevel = x?.securityLevel;
                      p.value = this.encryptDecryptService.encrypt(p?.value);
                    } else if (x?.securityLevel.toLowerCase() === 'low' && p?.securityLevel.toLowerCase() === 'medium') {
                      p.securityLevel = x?.securityLevel;
                      p.value = this.encryptDecryptService.decrypt(p?.value);
                    }
                  }
                });
              }

              if (integrationInfo?.associatedProcess?.paramsData?.length) {
                integrationInfo?.associatedProcess?.paramsData.forEach((ap) => {
                  if (x?.parameterName === ap?.paramName) {
                    if (x?.securityLevel.toLowerCase() === 'high' && ap?.securityLevel.toLowerCase() === 'low') {
                      ap.securityLevel = x?.securityLevel;
                      ap.value = this.encryptDecryptService.encrypt(ap?.value);
                    } else if (x?.securityLevel.toLowerCase() === 'medium' && ap?.securityLevel.toLowerCase() === 'low') {
                      ap.securityLevel = x?.securityLevel;
                      ap.value = this.encryptDecryptService.encrypt(ap?.value);
                    } else if (x?.securityLevel.toLowerCase() === 'high' && ap?.securityLevel.toLowerCase() === 'medium') {
                      ap.securityLevel = x?.securityLevel;
                      ap.value = this.encryptDecryptService.encrypt(ap?.value);
                    } else if (x?.securityLevel.toLowerCase() === 'low' && ap?.securityLevel.toLowerCase() === 'medium') {
                      ap.securityLevel = x?.securityLevel;
                      ap.value = this.encryptDecryptService.decrypt(ap?.value);
                    }
                  }
                });
              }
            });
          }
        });
      }

      if (integrationInfo?.associatedProcess?.paramsData?.length) {
        integrationInfo?.associatedProcess?.paramsData.forEach((ap) => {
          ap.value = (ap?.securityLevel === 'medium' || ap?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(ap?.value) : ap?.value;
        });
      }

      if (integrationInfo?.paramsData?.length) {
        integrationInfo?.paramsData.forEach((p) => {
          p.value = (p?.securityLevel === 'medium' || p?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(p?.value) : p?.value;
        });
      }

      if (integrationInfo?.identifiers?.length) {
        integrationInfo.identifiersReform = this.identifierReform(integrationInfo?.identifiers);
      }

      integrationInfo.intParam = this.checkProcessIntegrationParams(integrationInfo?.associatedProcess?.paramsData, integrationInfo?.paramsData);

      this.integrationDetails = integrationInfo;

      if (this.integrationDetails?.intParam?.length) {
        this.integrationDetails?.intParam.forEach((x) => {
          x.value = (x?.securityLevel.toLowerCase() === 'high' && x?.value) ? '*****' : x?.value;
        });
      }

      if (this.integrationDetails?.intParam?.length) {
        this.isParameterSettings = this.integrationDetails?.intParam.some(
          (x) => x?.value
        );
      }

      this.getConnectedExe();
      if (this.integrationDetails?.locked) {
        this.isActionBtnDisabled = false;
      } else {
        this.isActionBtnDisabled = true;
      }
      this.itemIds = [
        {
          workspaceId: this.getWorkspaceTreeObj?.workspaceId,
          itemId: this.selectedIntegrationTreeItem?.id,
          itemType: "Integration",
        },
      ];
      // if (this.activeIntegrationIndex === 1) {
      //   this.serviceLogs.getServiceLog(this.itemIds);
      // }
      // if (this.activeIntegrationIndex === 2) {
      //   this.eventLogs.getEventLog(this.itemIds);
      // }
      if (intTabIndex || intTabIndex === 0) {
        this.activeIntegrationIndex = intTabIndex;
        if (this.activeIntegrationIndex === 1) {
          setTimeout(() => {
            this.serviceLogs.getServiceLog(this.itemIds);
          }, 0);
        }
        if (this.activeIntegrationIndex === 2) {
          setTimeout(() => {
            this.eventLogs.getEventLog(this.itemIds);
          }, 0);
        }
      }
      this.isBack = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Get Selected Tree Item Details ============*/

  /*============= Reform Identifier Array If Identifier Name is Duplicate =============*/
  identifierReform(identifiersArr: Array<any>) {
    let identifiers = [];
    return identifiers = identifiersArr.reduce((acc, curr) => {
      const existingEntry = acc.find(entry => entry.methodName === curr.methodName);

      if (existingEntry) {
        existingEntry.identifierStr.push(curr.identifierStr);
      } else {
        acc.push({ methodName: curr.methodName, identifierStr: [curr.identifierStr] });
      }

      return acc;
    }, []);
  }

  /*============= Merge Process Parameters With Integration Parameters =============*/
  checkProcessIntegrationParams(processParams: Array<any>, integrationParams: Array<any>) {
    const clonedIntParamsArray = JSON.parse(JSON.stringify(processParams));
    if (clonedIntParamsArray?.length) {
      clonedIntParamsArray?.forEach((x) => {
        x.isIntParam = false;
        if (integrationParams?.length) {
          integrationParams.forEach((z) => {
            if (Number(x?.id) === Number(z?.id)) {
              x.isIntParam = true;
            }
          });
        }
      });
    }
    return clonedIntParamsArray;
  }

  /*============= Get Connected Executables ============*/
  getConnectedExe() {
    const res = this.integrationDetails;
    let parameterSettingData = {
      'isInParameters': this.isInParameters,
      'isInParametersValue': this.isInParametersValue,
      'isOutParamters': this.isOutParamters,
      'isHiddenParameters': this.isHiddenParameters
    };
    this.appIntegrationDataService.storeParameterSettings(parameterSettingData);

    if (res?.scriptList?.length) {
      res?.scriptList.forEach((item) => {
        if (res?.netUserMapping?.length) {
          res?.netUserMapping.forEach((netUsers) => {
            if (Number(netUsers?.script?.id) === Number(item?.executableRef)) {
              item.netUsers = netUsers?.netUsers;
            }
          })
        }
        if (item?.scriptParameterDataList?.length) {
          const inParameters = [];
          const outParameters = [];
          const inOutParameters = [];

          item?.scriptParameterDataList.forEach((params) => {
            if (res?.paramsData?.length) {
              res?.paramsData.forEach((x) => {
                if (params?.parameterName === x?.paramName) {
                  params.value = (params?.securityLevel.toLowerCase() === 'high' && params?.value) ? '*****' : params?.value;
                  // x.value = (x?.securityLevel.toLowerCase() === 'high' && x?.value) ? '*****' : x?.value;
                }
              });
            }
            if (this.isHiddenParameters) {
              if (params?.inParameter && params?.outParameter) {
                inOutParameters.push(params);
              } else {
                if (params?.inParameter) {
                  inParameters.push(params);
                }
                if (params?.outParameter) {
                  outParameters.push(params);
                }
              }
            } else {
              if (params?.type !== 'Private') {
                if (params?.inParameter && params?.outParameter) {
                  inOutParameters.push(params);
                } else {
                  if (params?.inParameter) {
                    inParameters.push(params);
                  }
                  if (params?.outParameter) {
                    outParameters.push(params);
                  }
                }
              }
            }
          });
          item.inParameters = inParameters;
          item.outParameters = outParameters;
          item.inOutParameters = inOutParameters;
        }
      });
    }
    this.integrationDetails = res;

  }

  /*============= Add Integration =============*/
  addIntegration() {
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.appIntegrationService.sharedAdditionalScriptParams([]);
    this.appIntegrationDataService.clearSchedulers();
    this.storeAppliedFiltersAndTabNum();
    this.appIntegrationDataService.clearProcessParamsData();
    this.appIntegrationService.sharedIdentifierSelected(false);
    this.router.navigate([
      `application_integration/item/integration/${true}/${this.getWorkspaceTreeObj?.workspaceId}/${this.belongsToFolderId}/${this.selectedIntegrationTreeItem?.id}`,
    ]);
  }
  /*============= END Add Integration =============*/

  /*============= Integration Properties =============*/
  integrationProperties() {
    this.storeAppliedFiltersAndTabNum();
    this.appIntegrationService.sharedAdditionalScriptParams([]);
    this.appIntegrationDataService.clearSchedulers();
    this.appIntegrationService.sharedAlarmPopupOpenedFlag(false);
    this.appIntegrationDataService.clearProcessParamsData();
    this.appIntegrationService.sharedIdentifierSelected(false);
    this.router.navigate([
      `application_integration/properties/integration/${false}/${this.getWorkspaceTreeObj?.workspaceId}/${this.belongsToFolderId}/${this.selectedIntegrationTreeItem?.id}`
    ]);
  }
  /*============= END Integration Properties =============*/

  /*============= Navigate to Process Details =============*/
  navigateToProcessDetails(associatedProcess: any) {
    const userAccessValidationDto: UserAccessValidationDto = {
      userName: this.currentUser.userName,
      workspaceId: this.selectedWorkspaceId.toString(),
      itemType: 'process',
      itemId: associatedProcess?.id,
      validateRootAccess: false,
      parentId: associatedProcess?.belongsToFolder
    }
    this.getValidateAccessSub = this.appIntegrationService.getValidateAccess(userAccessValidationDto).subscribe((res) => {
      if (res) {
        if (res?.hasAccess) {
          this.processDetailEvent.emit(associatedProcess?.id);
        } else {
          this.messageService.add({ key: 'appIntErrorKey', severity: 'error', summary: '', detail: `User does not have access of ${associatedProcess.name} process.` });

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
  /*============= End to Process Details =============*/

  /*============= Start Task ==============*/
  startTask() {
    let taskId = "";
    // if (this.checkedTaskDetails.taskId) {
    //   taskId = this.checkedTaskDetails.taskId;
    // } else {
    //   taskId = '';
    // }
    const dialogRef = this.dialog.open(RestartTaskComponent, {
      width: "800px",
      maxHeight: '95vh',
      height: '95%',
      data: {
        taskId: taskId,
        itemId: Number(this.selectedIntegrationTreeItem?.id),
        isStart: true,
        isInteractive: false,
        item: this.integrationDetails,
        itemType: 'Integration',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskStart(result);
      }
    });
  }

  taskStart(startTaskDto: any) {
    const updatedTriggerConfigList = [];
    startTaskDto?.parameters.forEach((item) => {
      if (item?.source === "Config") {
        updatedTriggerConfigList.push(item?.value);
      }
      delete item?.source;
    });
    const startTaskDetailsDto: StartTaskDetailsDto = {
      workspaceID: this.getWorkspaceTreeObj?.workspaceId,
      tiesItemID: Number(this.selectedIntegrationTreeItem?.id),
      parameters: startTaskDto?.parameters,
      teisItemType: this.selectedIntegrationTreeItem?.nodeType,
      updatedTriggerConfigList: updatedTriggerConfigList,
    };
    this.taskStartSub = this.appIntegrationService.startTask(startTaskDetailsDto).subscribe((res) => {
      if (res) {
        // this.integrationItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        // this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
        this.getIntegrationItemStatus(this.selectedIntegrationTreeItem?.id);
        this.messageService.add({
          key: "appIntSuccessKey",
          severity: "success",
          summary: "",
          detail: "All tasks started successfully!",
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Start Task ==============*/

  /*============= Stop All Tasks Async Call =============*/
  stopAllTasksAsync() {
    const dialogRef = this.dialog.open(AppIntStopTasksComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        itemIdList: this.itemIds,
        isSelectAll: true,
        nodeType: this.selectedIntegrationTreeItem?.nodeType
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isStop) {
        this.stopAllTasks(result);
      }
    });
  }

  stopAllTasks(stopAllTaskData: any) {
    const stopAllTasksObj: StopAllTasksDto = {
      taskId: null,
      executionState: stopAllTaskData?.executionState,
      taskStopped: stopAllTaskData?.taskStopped,
      workspaceId: Number(this.getWorkspaceTreeObj?.workspaceId),
      note: stopAllTaskData?.note,
      updatedBy: stopAllTaskData?.updatedBy,
      taskStatus: ["Initiate", "Processing", "ProcessingWithError"],
      allTasksSelected: true,
      itemIdList: [Number(this.selectedIntegrationTreeItem?.id)]
    };
    this.stopAllTasksSub = this.appIntegrationService.stopAllTask(stopAllTasksObj).subscribe(res => {
      if (res) {
        // this.integrationItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        // this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
        this.getIntegrationItemStatus(this.selectedIntegrationTreeItem?.id);
        this.messageService.add({
          key: 'appIntInfoKey',
          severity: 'info',
          summary: '',
          detail: res?.message
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============= Copy Integration =============*/
  copyIntegrationItem() {
    this.isIntegrationCopied = true;
    this.getIntegrationById(this.selectedIntegrationTreeItem?.id);
  }
  /*============= END Copy Integration =============*/

  /*============= Paste Integration =============*/
  pasteIntegrationItem() {
    const integrationDetails = this.integrationItemDeatils;
    if (integrationDetails?.schedulerList?.length) {
      integrationDetails.schedulerList = integrationDetails.schedulerList.map((scheduler: any) => ({
        ...scheduler,
        recurrencePattern: scheduler?.recurrencePattern
          ? String(scheduler.recurrencePattern).toUpperCase()
          : scheduler?.recurrencePattern
      }));
    }
    const dialogRef = this.dialog.open(AppIntPasteItemComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        name: integrationDetails?.name ? integrationDetails?.name : "",
        description: integrationDetails?.description
          ? integrationDetails?.description
          : "",
        belongsToFolder:
          this.selectedIntegrationTreeItem?.nodeType === "FOLDER"
            ? this.selectedIntegrationTreeItem?.id
            : null,
        itemType: "INTEGRATION",
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isPaste) {
        this.isIntegrationCopied = false;
        const createIntegrationDto: TeisItemDto = {
          alarmList: integrationDetails?.alarmList,
          defaultAlert: integrationDetails?.defaultAlert,
          name: result?.name,
          id: null,
          processId: integrationDetails?.processId,
          identifierIdList: integrationDetails?.identifierIdList,
          note: integrationDetails?.note,
          locked: integrationDetails?.locked,
          lockedDate: integrationDetails?.lockedDate,
          lockedUserId: integrationDetails?.lockedUserId,
          lockedUserName: integrationDetails?.lockedUserName,
          identifiers: integrationDetails?.identifiers,
          createAndDeploy: false,
          description: result?.description,
          disabled: integrationDetails?.disabled,
          updateTaskList: integrationDetails?.updateTaskList,
          enableAlert: integrationDetails?.enableAlert,
          alertProcessId: integrationDetails?.alertProcessId,
          alertProcessName: integrationDetails?.alertProcessName,
          associatedProcess: integrationDetails?.associatedProcess,
          scriptEngineGroup: integrationDetails?.scriptEngineGroup,
          scriptEngine: integrationDetails?.scriptEngine,
          queue: integrationDetails?.queue,
          releaseAndDeploy: false,
          releaseOnly: false,
          saveOnly: false,
          netUsersDto: integrationDetails?.netUsersDto,
          netUserMapping: integrationDetails?.netUserMapping,
          oldFileName: integrationDetails?.oldFileName,
          logMaintenanceId: integrationDetails?.logMaintenanceId,
          alertId: integrationDetails?.alertId,
          alertEnabled: integrationDetails?.alertEnabled,
          scheduled: integrationDetails?.scheduled,
          schedulerList: integrationDetails?.schedulerList,
          modified: integrationDetails?.modified,
          deployed: integrationDetails?.deployed,
          folder: integrationDetails?.folder,
          type: integrationDetails?.type,
          folderDataList: null,
          workspaceId: result?.workspaceId,
          autoStart: integrationDetails?.autoStart,
          interactiveMode: integrationDetails?.interactiveMode,
          showDebugMsg: integrationDetails?.showDebugMsg,
          disable: integrationDetails?.disable,
          logLevel: integrationDetails?.logLevel,
          priority: integrationDetails?.priority,
          processComponentId: integrationDetails?.processComponentId,
          iconId: integrationDetails?.iconId,
          belongsToFolder: result?.belongsToFolder,
          businessFlowDatas: [],
          deleted: integrationDetails?.deleted,
          scriptEngineKey: integrationDetails?.scriptEngineKey,
          imageIconName: integrationDetails?.imageIconName,
          failedTaskCount: integrationDetails?.failedTaskCount,
          initiateTaskCount: integrationDetails?.initiateTaskCount,
          processingTaskCount: integrationDetails?.processingTaskCount,
          processingErrorTaskCount: integrationDetails?.processingErrorTaskCount,
          lastUpdated: "",
          updatedBy: this.currentUser?.userName,
          version: integrationDetails?.version,
          versionCount: integrationDetails?.versionCount,
          deployedVersion: integrationDetails?.deployedVersion,
          versionNumber: integrationDetails?.versionNumber,
          thisDeployedVersion: integrationDetails?.thisDeployedVersion,
          disabledSchedulerOrAlarm: integrationDetails?.disabledSchedulerOrAlarm,
          releasePressed: integrationDetails?.releasePressed,
          paramsData: (integrationDetails?.paramsData && integrationDetails?.paramsData?.length) ? integrationDetails?.paramsData : [],
          scriptList: integrationDetails?.scripts,
          scripts: integrationDetails?.scripts,
          teisFolders: integrationDetails?.teisFolders,
        };
        this.pasteIntegrationSub = this.appIntegrationService.createIntegration(createIntegrationDto).subscribe((res) => {
          if (res) {
            this.integrationItemTree = [];
            this.appIntegrationService.sharedCreatedUpdatedPITItem({ isCreated: true, itemId: res?.integrationId });
            // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
            this.appIntegrationDataService.clearIntegrationItemTree();
            this.appIntegrationDataService.clearIntTreeItemCount();
            this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
            this.messageService.add({
              key: "appIntSuccessKey",
              severity: "success",
              summary: "",
              detail: `${result?.name} integration paste successfully!`,
            });
            this.isActionPerformEvent.emit(true);
          }
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
  /*============= END Paste Integration =============*/

  /*================= Mark All Task As Completed ==================*/
  markAllTaskAsCompleted() {
    const dialogRef = this.dialog.open(AppIntMarkAllAsCompletedComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        isMarkedAllTaskIsCompleted: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isMarked) {
        this.markedAllTaskCompleted(result?.note);
      }
    });
  }

  markedAllTaskCompleted(comment: string) {
    const markTaskCompletedDto: MarkAllTaskAsCompletedDto = {
      allTasksSelected: true,
      executionStates: ["Failed"],
      itemIdList: [this.selectedIntegrationTreeItem?.id],
      note: `Marked complete by ${this.currentUser?.firstName ? this.currentUser?.firstName : ""
        } ${this.currentUser?.lastName ? this.currentUser?.lastName : ""
        }: ${comment}`,
      taskIdList: [],
      updatedBy: this.currentUser?.userName,
    };
    this.markAllTaskAsCompletedSub = this.appIntegrationService.markTaskAsCompleted(markTaskCompletedDto).subscribe((res) => {
      if (res) {
        // this.integrationItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        // this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
        this.getIntegrationItemStatus(this.selectedIntegrationTreeItem?.id);
        this.messageService.add({
          key: "appIntInfoKey",
          severity: "success",
          summary: "",
          detail: res?.message,
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*================= END Mark All Task As Completed ==================*/

  /*================= Move Items ================*/
  moveItem() {
    const dialogRef = this.dialog.open(AppIntMoveItemComponent, {
      width: "90vw",
      maxHeight: "95vh",
      data: {
        itemType: "Integration",
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
        processTree: this.WsIntegrationTree
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isMove) {
        this.integrationItemTree = [];
        // this.appIntegrationService.sharedCreatedUpdatedPITItem({ isCreated: true, itemId: result?.sourceFolder });
        if (this.integrationTreeItems?.length) {
          this.integrationTreeItems.forEach((x: any) => {
            if (Number(x?.id) === Number(result?.sourceFolder)) {
              this.selectedIntegrationTreeItem = x;
              // this.nodeSelect(x);
              this.appIntegrationDataService.storeSelectedIntegrationItem(this.selectedIntegrationTreeItem);
              return false;
            }
          });
        }
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, true);
        this.appIntegrationDataService.clearIntegrationItemTree();
        this.appIntegrationDataService.clearIntTreeItemCount();
        this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, true);
      }
    });
  }
  /*================= END Move Items ================*/

  /*============= Deploy Workspace Items =============*/
  deployIntegrationItems() {
    if (this.selectedIntegrationTreeItem?.nodeType === "FOLDER") {
      if (this.selectedIntegrationTreeItem?.children?.length <= 0) {
        this.messageService.add({
          key: "appIntInfoKey",
          severity: "success",
          summary: "",
          detail: "No item(s) to deploy. Folder is empty.",
        });
      } else {
        this.deployItem();
      }
    } else {
      if (this.integrationDetails?.associatedProcess?.deployed) {
        this.deployItem();
      } else {
        this.messageService.add({
          key: "appIntErrorKey",
          severity: "error",
          summary: "",
          detail: `Error occurred while deploying "${this.integrationDetails?.name}". Verify connected process is deployed or refresh the integration item for latest status.`,
        });
      }
    }
  }

  deployItem() {
    if (this.integrationDetails?.locked) {
      this.messageService.add({
        key: "appIntInfoKey",
        severity: "success",
        summary: "",
        detail: `Process can not be deployed because it is locked by ${this.integrationDetails?.lockedUserName}`,
      });
    } else {
      const deployItemsDto: DeployUndeployItemsDto = {
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
        deploymentDetails: [
          {
            teisItemID: this.selectedIntegrationTreeItem?.id,
            teisItemType: "Integration",
            teisVersionNumber: this.integrationDetails?.deployedVersion > 0 ? this.integrationDetails?.deployedVersion : this.integrationDetails?.versionNumber
          },
        ],
      };
      this.deployIntegrationItemsSub = this.appIntegrationService.deployItems(deployItemsDto, "Integration", this.selectedIntegrationTreeItem?.id, this.selectedIntegrationTreeItem?.nodeType).subscribe((res) => {
        const nodeType = this.toTitleCaseService.convertToTitleCase(this.selectedIntegrationTreeItem?.nodeType);
        // this.integrationItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        // this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
        if (this.selectedIntegrationTreeItem?.nodeType !== 'FOLDER') {
          this.updateIconStatus('deploy');
        } else {
          this.appIntegrationDataService.clearIntegrationItemTree();
          this.appIntegrationDataService.clearIntTreeItemCount();
          this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
        }
        this.messageService.add({
          key: "appIntSuccessKey",
          severity: "success",
          summary: "",
          detail: `${nodeType} deployed successfully!`,
        });
        // Update Workspace Deploy, Undeploy and Not initialized Count on Action Perform
        this.isActionPerformEvent.emit(true);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
          this.integrationItemTree = [];
          // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
          this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
        }
      });
    }
  }
  /*============= END Deploy Workspace Items =============*/

  /*============= Undeploy Workspace Items =============*/
  unDeployIntegrationItems() {
    if (this.selectedIntegrationTreeItem?.nodeType === "FOLDER") {
      if (this.selectedIntegrationTreeItem?.children?.length <= 0) {
        this.messageService.add({
          key: "appIntInfoKey",
          severity: "success",
          summary: "",
          detail: "No item(s) to undeploy. Folder is empty.",
        });
      } else {
        this.undeployItems();
      }
    } else {
      this.undeployItems();
    }
  }

  undeployItems() {
    const unDeployItemsDto: DeployUndeployItemsDto = {
      workspaceId: this.getWorkspaceTreeObj?.workspaceId,
      deploymentDetails: [
        {
          teisItemID: this.selectedIntegrationTreeItem?.id,
          teisItemType: "Integration",
          teisVersionNumber: this.integrationDetails?.deployedVersion > 0 ? this.integrationDetails?.deployedVersion : this.integrationDetails?.versionNumber,
        },
      ],
    };
    this.unDeployIntegrationItemsSub = this.appIntegrationService.unDeployItems(unDeployItemsDto, "Integration", this.selectedIntegrationTreeItem?.id, this.selectedIntegrationTreeItem?.nodeType).subscribe((res) => {
      // this.integrationItemTree = [];
      // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      // this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
      if (this.selectedIntegrationTreeItem?.nodeType !== 'FOLDER') {
        this.updateIconStatus('undeploy');
      } else {
        this.appIntegrationDataService.clearIntegrationItemTree();
        this.appIntegrationDataService.clearIntTreeItemCount();
        this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
      }
      this.messageService.add({
        key: "appIntSuccessKey",
        severity: "success",
        summary: "",
        detail: "Integration undeployed successfully!",
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.integrationItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
      }
    });
  }
  /*============= END Undeploy Workspace Items =============*/

  /*================= Enable / Disable Integration ==================*/
  enabledDisableIntegration(isDisable: boolean) {
    this.enableDisableIntegrationSub = this.appIntegrationService.enabledDisabledIntegration(this.integrationDetails?.id, isDisable).subscribe((res) => {
      if (res) {
        //this.integrationItemTree = [];
        //this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        //this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
        this.updateIconStatus('EnableDisable', isDisable);
        this.messageService.add({
          key: "appIntSuccessKey",
          severity: "success",
          summary: "",
          detail: isDisable ? `Integration ${this.integrationDetails?.name} disabled successfully!` : `Integration ${this.integrationDetails?.name} enabled successfully!`,
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*================= Create Folder ==================*/
  createFolder() {
    const dialogRef = this.dialog.open(AppIntCreateFolderComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
        belongsToFolder:
          this.selectedIntegrationTreeItem?.nodeType === "FOLDER"
            ? this.selectedIntegrationTreeItem?.id
            : null,
        name: "",
        description: "",
        type: "INTEGRATION",
        isNewFolder: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.integrationItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        this.appIntegrationDataService.clearIntegrationItemTree();
        this.appIntegrationDataService.clearIntTreeItemCount();
        this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
      }
    });
  }
  /*================= END Create Folder ==================*/

  /*================= Update Folder ==================*/
  updateFolder() {
    const dialogRef = this.dialog.open(AppIntCreateFolderComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        id:
          this.selectedIntegrationTreeItem?.nodeType === "FOLDER"
            ? this.selectedIntegrationTreeItem?.id
            : null,
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
        belongsToFolder:
          this.selectedIntegrationTreeItem?.nodeType === "FOLDER"
            ? this.selectedIntegrationTreeItem?.parent?.id
            : null,
        name:
          this.selectedIntegrationTreeItem?.nodeType === "FOLDER"
            ? this.selectedIntegrationTreeItem?.label
            : "",
        description:
          this.selectedIntegrationTreeItem?.nodeType === "FOLDER"
            ? this.selectedIntegrationTreeItem?.description
            : "",
        type: "INTEGRATION",
        isNewFolder: false,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.integrationItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        this.getIntegrationTree(this.getWorkspaceTreeObj, false, false, false);
      }
    });
  }
  /*================= END Update Folder ==================*/

  /*================= Remove Integration =================*/
  removeIntegration() {
    if (this.selectedIntegrationTreeItem?.nodeType === "FOLDER") {
      if (this.selectedIntegrationTreeItem?.children?.length > 0) {
        this.messageService.add({
          key: "appIntInfoKey",
          severity: "success",
          summary: "",
          detail: "Folder is only possible to delete if it's empty.",
        });
      } else {
        const dialogRef = this.dialog.open(ConfirmationComponent, {
          width: "700px",
          maxHeight: "600px",
          data: `Are you sure you want to remove ${this.selectedIntegrationTreeItem?.label} folder?`,
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            if (this.selectedIntegrationTreeItem?.nodeType === "FOLDER") {
              const workspaceId = this.getWorkspaceTreeObj?.workspaceId;
              const teisitemtype = "INTEGRATION";
              const folderId =
                this.selectedIntegrationTreeItem?.nodeType === "FOLDER"
                  ? this.selectedIntegrationTreeItem?.id
                  : null;
              const removeAllTask = false;
              this.deleteIntegrationFolderSub = this.appIntegrationService.deleteFolder(workspaceId, teisitemtype, folderId, removeAllTask).subscribe((res) => {
                // this.integrationItemTree = [];
                // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, true, false);
                this.appIntegrationDataService.clearIntegrationItemTree();
                this.appIntegrationDataService.clearIntTreeItemCount();
                this.getIntegrationTree(this.getWorkspaceTreeObj, false, true, false);
              }, (err: HttpErrorResponse) => {
                if (err.error instanceof Error) {
                  // handle client side error here
                } else {
                  // handle server side error here
                }
              });
            }
          }
        });
      }
    }

    if (this.selectedIntegrationTreeItem?.nodeType === "INTEGRATION") {
      const dialogRef = this.dialog.open(AppIntConfirmationComponent, {
        width: "700px",
        maxHeight: "600px",
        data: {
          title: `Are you sure you want to remove ${this.selectedIntegrationTreeItem?.label} integration?`,
          subtext: `Note: All versions will be deleted. if any uncertainty, do an export before as a backup.`,
          actiontext: `Also delete task associated with this item`,
          actionsubtext: `Logs associated with the item will not be retrieved on the UI`,
          isShowSingleBtn: false
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.isConfirm) {
          this.deleteIntItemSub = this.appIntegrationService.deleteIntegrationItem(this.getWorkspaceTreeObj?.workspaceId, this.selectedIntegrationTreeItem?.id, result?.isSelected).subscribe(res => {
            if (res) {
              // this.integrationItemTree = [];
              // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, true, false);
              this.appIntegrationDataService.clearIntegrationItemTree();
              this.appIntegrationDataService.clearIntTreeItemCount();
              this.getIntegrationTree(this.getWorkspaceTreeObj, false, true, false);
              this.messageService.add({
                key: "appIntSuccessKey",
                severity: "success",
                summary: "",
                detail: "Integration deleted successfully!",
              });
              // Update Workspace Deploy, Undeploy and Not initialized Count on Action Perform
              this.isActionPerformEvent.emit(true);
            }
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
  }
  /*================= END Remove Integration =================*/

  /*============= View Script ============*/
  viewScript(scriptId: string, scriptName: string, userDefined: boolean) {
    const dialogRef = this.dialog.open(ScriptViewComponent, {
      width: "1000px",
      maxHeight: "600px",
      data: {
        scriptId: scriptId,
        scriptName: scriptName,
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
        userDefined: userDefined,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
      }
    });
  }
  /*============= END View Script ============*/

  openScript(script: any) {
    const scriptType = script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template';
    this.getUserSettings('DEV', true, null);
    this.getScript(script?.executableRef ? script?.executableRef : script?.id, scriptType, Number(this.getWorkspaceTreeObj?.workspaceId));
  }

  getUserSettings(module: string, callForTheme: boolean, scriptId: any) {
    const obj = {
      function: '',
      parent_id: '',
      parameterName: '',
      moduleCode: module
    };
    this.getUserSettingsSub = this.userSettingService.getUserSetting(obj).subscribe((res) => {
      if (res?.length) {
        if (callForTheme) {
          const darkMode = res.find(item => item.action.toLowerCase() === 'setdarkmode');
          const theme = (darkMode && darkMode.value === 'true') ? true : false;
          this.scriptStateService.storeEditorTheme(theme ? 'vs-dark' : 'vs');
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

  getUrl(wsId: number, scriptId: number, tabId: string, scriptType: string, isVersionCopy: boolean, versionId: string, isDeployed: boolean, debugSeId: string, debugSeUrl: string, theme: string, isLocked: boolean): any {

    const baseUrl = window.location.origin;
    const token = this.kcService.getToken();

    return `${baseUrl}/winwrap/?clientid=${tabId}&wId=${wsId}&exeId=${scriptId}&type=${scriptType}&isDeployed=${isDeployed}&isVersionCopy=${isVersionCopy}&versionId=${versionId}&debugSeId=${debugSeId}&debugSeUrl=${debugSeUrl}&theme=${theme}&isLocked=${isLocked}`;
  }

  getScript(scriptId: string, scriptType: string, workspaceId: number) {
    this.getScriptByIdSub = this.tasksManagementService.getScriptById(scriptId, scriptType, workspaceId).subscribe(res => {
      if (res) {
        this.selectDebugScriptEngine(res, scriptType, workspaceId);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*=============== Select Debug Script Engine ===============*/
  selectDebugScriptEngine(script: any, scriptType: string, workspaceId: number) {
    const dialogRef = this.dialog.open(DebugScriptEngineComponent, {
      width: "700px",
      maxHeight: "800px",
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isOpen) {
        const debugSeId = result?.debugSE?.debugSeId;
        const debugSeUrl = result?.debugSE?.debugSeUrl;
        const debugSeName = result?.debugSE?.debugSeName;
        const scriptEngineGroupName = result?.debugSE?.scriptEngineGroupName;

        const scriptType = script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template'

        const clientId = this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id);
        const obj = {
          jsonMap: null,
          headers: null,
          clientId: [`${clientId}`],
          contentType: 'application/winwrap;charset=utf-8',
          workspaceId: workspaceId ? workspaceId : 0,
          scriptId: script?.executableRef ? script?.executableRef : script?.id,
          userName: this.currentUser?.userName,
          debugSeId: debugSeId,
          debugSeUrl: debugSeUrl
        };

        this.lockInfoAndDebugParamSub = forkJoin({
          lockInfo: this.developmentService.getScriptLockInfo(Number(workspaceId), Number(script?.executableRef ? script?.executableRef : script?.id), scriptType),
          debugParams: this.developmentService.getDebugScriptParameters(obj, debugSeId, debugSeUrl)
        }).subscribe({
          next: (result) => {
            const lockInfo = JSON.parse(JSON.stringify(result.lockInfo));
            const debugParams = JSON.parse(JSON.stringify(result.debugParams));

            if (lockInfo?.idOfLockedItem && lockInfo?.lockDate && lockInfo?.lockTime && lockInfo?.lockedBy) {
              lockInfo.isLocked = true;
            } else {
              lockInfo.isLocked = false;
            }

            const scriptUrl = this.getUrl(workspaceId, script?.executableRef ? script?.executableRef : script?.id, this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id), script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template', false, '0', true, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme(), lockInfo.isLocked);

            const executable = {
              connectable: script?.connectable,
              debugParameters: debugParams || [],
              debugSeId: debugSeId,
              debugSeName: debugSeName,
              debugSeUrl: debugSeUrl,
              deployed: true,
              deployedVersion: script?.deployedVersion,
              description: script?.description,
              isDeployed: true,
              isSystemLibrary: false,
              label: script?.scriptName?.length > 15 ? script?.scriptName.substring(0, 15) + '...' : script?.scriptName,
              language: script?.language,
              lastUpdated: script?.lastUpdated,
              latestVersion: 0,
              lockInfo: lockInfo,
              scriptEngine: 'All',
              scriptEngineGroupName: scriptEngineGroupName,
              scriptId: script?.executableRef ? script?.executableRef : script?.id,
              scriptName: script?.scriptName,
              scriptNameWithType: scriptType,
              sysLibRefList: script?.sysLibRefList || [],
              sysLibRefNameList: script?.sysLibRefNameList || [],
              tabId: this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id),
              triggerScript: script?.triggerScript,
              trustedUrl: scriptUrl,
              type: script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template',
              updatedBy: '',
              url: scriptUrl,
              userDefined: script?.userDefined,
              version: script?.versionNumber,
              workspaceId: workspaceId,
              workspaceName: ''
            };

            // Store script data in localStorage with a unique key
            const scriptKey = 'openedScript_' + Date.now();
            try {
              localStorage.setItem(scriptKey, JSON.stringify(executable));
            } catch (e) {
              // ignore storage errors
            }

            // Open development tab with script key in hash query parameter
            const url = `#/development?scriptKey=${scriptKey}`;
            window.open(url, '_blank');
          },
          error: (err) => {
            console.error("API error:", err);
          }
        });

        // this.getScriptLockInfoSub = this.developmentService.getScriptLockInfo(Number(workspaceId), Number(script?.executableRef ? script?.executableRef : script?.id), scriptType).subscribe((res) => {
        //   const lockInfo = JSON.parse(JSON.stringify(res));

        //   if (lockInfo?.idOfLockedItem && lockInfo?.lockDate && lockInfo?.lockTime && lockInfo?.lockedBy) {
        //     lockInfo.isLocked = true;
        //   } else {
        //     lockInfo.isLocked = false;
        //   }

        //   const executable = {
        //     connectable: script?.connectable,
        //     debugParameters: [],
        //     debugSeId: debugSeId,
        //     debugSeName: debugSeName,
        //     debugSeUrl: debugSeUrl,
        //     deployed: true,
        //     deployedVersion: 0,
        //     description: script?.description,
        //     isDeployed: true,
        //     isSystemLibrary: false,
        //     label: script?.scriptName?.length > 15 ? script?.scriptName.substring(0, 15) + '...' : script?.scriptName,
        //     language: script?.language,
        //     lastUpdated: script?.lastUpdated,
        //     latestVersion: 0,
        //     lockInfo: lockInfo,
        //     scriptEngine: 'All',
        //     scriptEngineGroupName: scriptEngineGroupName,
        //     scriptId: script?.executableRef ? script?.executableRef : script?.id,
        //     scriptName: script?.scriptName,
        //     scriptNameWithType: scriptType,
        //     sysLibRefList: script?.sysLibRefList || [],
        //     sysLibRefNameList: script?.sysLibRefNameList || [],
        //     tabId: this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id),
        //     triggerScript: script?.triggerScript,
        //     trustedUrl: this.scriptStateService.getUrl(workspaceId, script?.executableRef ? script?.executableRef : script?.id, this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id), script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template', false, '0', true, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme()),
        //     type: script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template',
        //     updatedBy: '',
        //     url: this.scriptStateService.getUrl(workspaceId, script?.executableRef ? script?.executableRef : script?.id, this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id), script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template', false, '0', true, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme()),
        //     userDefined: script?.userDefined,
        //     version: 0,
        //     workspaceId: workspaceId,
        //     workspaceName: ''
        //   };

        //   // Store script data in localStorage with a unique key
        //   const scriptKey = 'openedScript_' + Date.now();
        //   try {
        //     localStorage.setItem(scriptKey, JSON.stringify(executable));
        //   } catch (e) {
        //     // ignore storage errors
        //   }

        //   // Open development tab with script key in hash query parameter
        //   const url = `#/development?scriptKey=${scriptKey}`;
        //   window.open(url, '_blank');

        // }, (err: HttpErrorResponse) => {
        //   if (err.error instanceof Error) {
        //     // handle client side error here
        //   } else {
        //     // handle server side error here
        //   }
        // });
      }
    });
  }

  /*================= Store Applied Filters and Current Tab Number ==================*/
  storeAppliedFiltersAndTabNum() {
    this.deployed = true;
    this.disabled = false;
    this.locked = false;
    if (this.selectedIntFilterOption?.length) {
      this.selectedIntFilterOption.forEach((item) => {
        if (Number(item) === 1) {
          this.deployed = false;
        }
        if (Number(item) === 2) {
          this.locked = true;
        }
        if (Number(item) === 3) {
          this.disabled = true;
        }
      });
    }
    this.appIntegrationDataService.storeAppliedFilters({
      selectedWorkspace: Number(this.getWorkspaceTreeObj?.workspaceId),
      currentTab: 0,
      searchTerm: this.getWorkspaceTreeObj?.itemName,
      undeployed: this.deployed,
      locked: this.locked,
      disabled: this.disabled,
    });
  }
  /*================= END Store Applied Filters and Current Tab Number ==================*/

  /*============= Start Task In Interactive Mode ============*/
  startTaskInInteractive() {
    if (this.integrationDetails?.deployed) {
      const dialogRef = this.dialog.open(RestartTaskComponent, {
        width: "800px",
        maxHeight: '95vh',
        height: '95%',
        data: {
          taskId: '',
          itemId: Number(this.selectedIntegrationTreeItem?.id),
          isStart: true,
          isInteractive: true,
          item: this.integrationDetails,
          itemType: 'Integration',
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const updatedTriggerConfigList = [];
          result?.parameters.forEach((item) => {
            if (item?.source === "Config") {
              updatedTriggerConfigList.push(item?.value);
            }
            delete item?.source;
          });
          const createTaskObj: StartTaskDetailsDto = {
            workspaceID: this.getWorkspaceTreeObj?.workspaceId,
            tiesItemID: Number(this.selectedIntegrationTreeItem?.id),
            parameters: result?.parameters,
            teisItemType: this.selectedIntegrationTreeItem?.nodeType,
            updatedTriggerConfigList: updatedTriggerConfigList,
            // debugSeId: result?.debugSeId,
            debugSeUrl: result?.debugSeUrl
          };
          this.createTask(createTaskObj, result?.debugSeId, result?.debugSeUrl);
        }
      });
    } else {
      this.messageService.add({
        key: "appIntInfoKey",
        severity: "success",
        summary: "",
        detail: `This item hasn't been deployed yet, so it can't run in interactive mode. Try deploying it first.`,
      });
    }
  }

  /*=============== Create Task ===============*/
  createTask(createTaskObj: any, debugSeId: string, debugSeUrl: string) {
    this.createTaskSub = this.appIntegrationService.createTask(createTaskObj).subscribe((res) => {
      if (res && (res?.taskStatus.toLowerCase() === 'processing')) {
        this.openInteractiveMode(res, debugSeId, debugSeUrl);
      } else {
        this.messageService.add({
          key: "appIntErrorKey",
          severity: "error",
          summary: "",
          detail: `Somthing went wrong!`,
        });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  openInteractiveMode(taskObject: any, debugSeId: string, debugSeUrl: string) {
    const dialogRef = this.dialog.open(InteractiveModeComponent, {
      maxWidth: '95vw',
      maxHeight: '95vh',
      height: '95%',
      width: '95%',
      panelClass: 'full-screen-modal',
      data: {
        taskId: "",
        item: this.integrationDetails,
        taskObj: taskObject,
        debugSeId: debugSeId,
        debugSeUrl: debugSeUrl,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isAction) {
        this.taskStart(result);
      }
    });
  }

  /*=============== Generate General Summary text file ===============*/
  generateGeneralSummaryFile() {
    let content = 'Integration Item';
    if (this.integrationDetails?.lockedUserName || this.integrationDetails?.disable || !this.selectedIntegrationTreeItem?.deployed) {
      content += '\n\n';
      content += 'Note:';
    }
    if (this.integrationDetails?.lockedUserName) {
      content += ` locked by: ${this.integrationDetails?.lockedUserName} at ${this.integrationDetails?.lockedDate}.`;
    }

    if (this.integrationDetails?.disable) {
      content += ` Item disabled, will never be activated.`;
    }

    if (!this.selectedIntegrationTreeItem?.deployed) {
      content += ` No version deployed yet, showing working copy.`;
    }

    content += `\n\n   Name: ${this.integrationDetails?.name} (Ver. ${this.integrationDetails?.versionNumber})\n`;
    content += `   Description: ${(this.integrationDetails?.description ? this.integrationDetails?.description : '-')} \n\n`;

    if (this.integrationDetails?.alertProcessName) {
      content += `Alert process: ${(this.integrationDetails?.alertProcessName)} \n\n`;
    }

    if (this.integrationDetails?.identifiersReform?.length) {
      content += `Identifiers used to identify this integration\n`;

      this.integrationDetails.identifiersReform.forEach(item => {
        content += `    Name: ${item.methodName}\n`;

        if (item.identifierStr?.length) {
          item.identifierStr.forEach(str => {
            content += `        ${str}\n`;
          });
        }
      });
      content += '\n';
    }

    if (this.integrationDetails?.intParam?.length && this.isParameterSettings) {
      content += 'Parameter Settings\n';

      this.integrationDetails.intParam.forEach(param => {
        if (param?.value) {
          let displayValue = param.value;

          // If securityLevel is 'high', mask value with asterisks
          if (param.securityLevel === 'high') {
            displayValue = '**********';
          }

          content += `    ${param.paramName} : ${displayValue}\n`;
        }
      });
      content += '\n';
    }

    if (this.integrationDetails?.associatedProcess) {
      content += `Connected process: ${(this.integrationDetails?.associatedProcess?.name)} (Ver. ${this.integrationDetails?.associatedProcess?.versionNumber == 0 ?
        'Working copy' : this.integrationDetails?.associatedProcess?.versionNumber}) \n\n`;
    }

    if (this.integrationDetails?.scriptList?.length) {
      content += 'Connected executables\n';

      this.integrationDetails.scriptList.forEach((exe, i) => {
        // Add executable index and name
        let label = `${i + 1}. Name: ${exe.scriptName}`;
        // Add language tag
        if (exe.language === 'C#') {
          label += ' (C# /Adapter)';
        } else if (exe.language === 'VBScript') {
          label += exe.userDefined ? ' (VB /UserScript)' : ' (VB /Template)';
        }

        content += label + '\n';

        // Add description if present, replacing newlines with line breaks (or just keep newlines for text)
        if (exe.description) {
          // Replace \n with actual newlines or keep as is for text files
          const description = exe.description.replace(/\n/g, '\n');
          content += `    Description: ${description}\n`;
        }

        // Add Parameters in if enabled and present
        if (exe.inParameters?.length && this.isInParameters) {
          content += `    Parameters in:\n`;
          exe.inParameters.forEach(inP => {

            let line = `        ${inP.parameterName}`;
            if (this.isInParametersValue && inP.value) {
              line += ` = ${inP.value}`;
            }
            content += line + '\n';
          });
        }

        // Add Parameters out if enabled and present
        if (exe.outParameters?.length && this.isOutParamters) {
          content += `    Parameters out:\n`;
          exe.outParameters.forEach(outP => {
            content += `        ${outP.parameterName}\n`;
          });
        }

        // Add Parameters inOut if present
        if (exe.inOutParameters?.length) {
          content += `    Parameters inOut:\n`;
          exe.inOutParameters.forEach(inOutP => {
            let line = `        ${inOutP.parameterName}`;
            if (this.isInParametersValue && inOutP.value) {
              line += ` = ${inOutP.value}`;
            }
            content += line + '\n';
          });
        }

        content += '\n'; // blank line after each executable for readability
        if (exe.netUsers?.length) {
          content += `    Net user(s):\n`;
          exe.netUsers.forEach(netuser => {
            content += `        ${netuser?.resource}\n`;
          });
        }

        // Spacer between scripts
        content += '\n';
      });

      if (this.integrationDetails?.schedulerList?.length) {
        content += 'Alarm schedulers\n';

        this.integrationDetails.schedulerList.forEach((item, index) => {
          content += `\n${index + 1}. Name: ${item.schedulerName ?? '-'}\n`;
          content += `    Recurrence pattern: ${item.recurrencePattern ?? '-'}\n`;
          content += `    Recurrence summary: ${item.recurrencePatternSummary ?? '-'}\n`;
          content += `    Start date: ${item.startDate ?? '-'}\n`;
          content += `    End date: ${item.endDate ?? '-'}\n`;
          content += `    Hour: ${item.hour ?? '-'}\n`;
          content += `    Minutes: ${item.minutes ?? '-'}\n`;
          content += `    Seconds: ${item.seconds ?? '-'}\n`;

          if (item.alarmProcessName) {
            content += `    Alarm process: ${item.alarmProcessName}\n`;
          }

          // Handle non-scheduled dates if available
          if (item.nonSchedulerDataList?.length) {
            content += `    Non scheduled dates:\n`;
            item.nonSchedulerDataList.forEach(val => {
              const formattedDate = `${val?.dayOfMonth}.${val?.month}.${val?.year}`;
              content += `        ${formattedDate}\n`;
            });
          }

          // Enabled status
          content += `    Enabled: ${item.disabled ? 'No' : 'Yes'}\n`;
        });

        content += '\n'; // extra line for separation
      }

    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    a.download = `GeneralSummaryInt_${timestamp}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /*=============== End Generate General Summary text file ===============*/

  ngOnDestroy(): void {
    this.getWorkspaceTreeSub.unsubscribe();
    this.getWorkspaceTreeItemStatusSub.unsubscribe();
    this.getIntegrationDetailsSub.unsubscribe();
    this.deployIntegrationItemsSub.unsubscribe();
    this.unDeployIntegrationItemsSub.unsubscribe();
    this.deleteIntegrationFolderSub.unsubscribe();
    this.getIntegrationItemStatusSub.unsubscribe();
    this.deleteIntItemSub.unsubscribe();
    this.taskStartSub.unsubscribe();
    this.stopAllTasksSub.unsubscribe();
    this.getIntegrationByIdSub.unsubscribe();
    this.enableDisableIntegrationSub.unsubscribe();
    this.createTaskSub.unsubscribe();
    this.getValidateAccessSub.unsubscribe();
    this.getScriptLockInfoSub.unsubscribe();
    this.getDebugParameterSub.unsubscribe();
    this.lockInfoAndDebugParamSub.unsubscribe();
    this.getScriptByIdSub.unsubscribe();
    this.workspaceTreeItemCount.unsubscribe();
    this.getUserSettingsSub.unsubscribe();
  }
}