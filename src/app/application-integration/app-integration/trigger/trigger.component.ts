import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnDestroy, OnInit, ViewChild, SimpleChanges, Output, EventEmitter } from "@angular/core";
import { MessageService, TreeNode } from "primeng/api";
import { EMPTY, forkJoin, Subject, Subscription } from "rxjs";
import { Appintitemtree } from "../appintitemtree";
import { AppIntegrationService } from "../app-integration.service";
import { AppIntegrationDataService } from "../app-integration-data.service";
import { Router } from "@angular/router";
import {
  AppliedFilters,
  DeployUndeployItemsDto,
  MarkAllTaskAsCompletedDto,
  TaskDetailsDto,
  TeisItemDto,
} from "../appintegration";
import { AppIntServiceLogComponent } from "../app-int-service-log/app-int-service-log.component";
import { AppIntEventLogComponent } from "../app-int-event-log/app-int-event-log.component";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { Constants } from "src/app/shared/components/constants";
import { AppIntLogsComponent } from "../app-int-logs/app-int-logs.component";
import { AppIntMarkAllAsCompletedComponent } from "../app-int-mark-all-as-completed/app-int-mark-all-as-completed.component";
import { AppIntCreateFolderComponent } from "../app-int-create-folder/app-int-create-folder.component";
import { catchError, finalize, switchMap, take, tap } from "rxjs/operators";
import { StartTaskDetailsDto, StopAllTasksDto } from "src/app/task-management/tasks-management/task-mgmt";
import { RestartTaskComponent } from "src/app/task-management/restart-task/restart-task.component";
import { AppIntConfirmationComponent } from "../app-int-confirmation/app-int-confirmation.component";
import { AppIntStopTasksComponent } from "../app-int-stop-tasks/app-int-stop-tasks.component";
import { ConfirmationComponent } from "src/app/shared/components/confirmation/confirmation.component";
import { AppIntPasteItemComponent } from "../app-int-paste-item/app-int-paste-item.component";
import { AppIntMoveItemComponent } from "../app-int-move-item/app-int-move-item.component";
import { ToTitleCaseService } from "src/app/shared/services/to-title-case.service";
import { ScriptViewComponent } from "src/app/task-management/tasks-management/script-view/script-view.component";
import { SearchItemComponent } from "../search-item/search-item.component";
import { EncryptDecryptService } from "src/app/shared/services/encrypt-decrypt.service";
import { InteractiveModeComponent } from "../interactive-mode/interactive-mode.component";
import { ScriptStateService } from "src/app/shared/services/script-state.service";
import { DevelopmentService } from "src/app/development/development.service";
import { DomSanitizer } from "@angular/platform-browser";
import { KeycloakSecurityService } from "src/app/shared/services/keycloak-security.service";
import { TasksManagementService } from "src/app/task-management/tasks-management/tasks-management.service";
import { DebugScriptEngineComponent } from "src/app/development/development/debug-script-engine/debug-script-engine.component";
import { UserSettingService } from "src/app/dashboard/user-settings/user-setting.service";

@Component({
  selector: "app-trigger",
  templateUrl: "./trigger.component.html",
  styleUrls: ["./trigger.component.scss"],
})
export class TriggerComponent implements OnInit, OnDestroy {
  @Input() selectedWorkspaceId: number;
  @Input() getWorkspaceTreeObj: TaskDetailsDto;
  @Output() isActionPerformEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() onChangeFilterEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() showFilterViewEvent: EventEmitter<boolean> = new EventEmitter();
  currentUser: any;
  selectedTriggerFile: TreeNode;
  activeTriggerIndex = 0;
  isLoading: boolean = false;
  triggerCurrentTabIndex = 0;
  selectedTriggerFilterOption: Array<any> = [];
  triggerItemTree: TreeNode[] = [];
  selectedTriggerTreeItem: any = null;
  triggerTreeItems: Array<any> = [];
  WsTriggerTree: Array<any> = [];
  isAlarmSchedulerShow: boolean = false;
  triggerDetails: any;
  triggerItemDeatils: any = null;
  createdOrUpdatedPITItem: any = null;
  itemIds: Array<any>;
  deployed: boolean = true;
  disabled: boolean = false;
  locked: boolean = false;
  belongsToFolderId: number = null;
  triggerTreeItemCount: number = null;
  filteredTriggerItemCount: number = null;
  isTriggerCopied: boolean = false;
  isActionBtnDisabled: boolean = true;
  triggerItemStatus: any = null; //trigger?
  isCRUDFPITAccess: boolean = false;
  isDeployUndeployFPITAccess: boolean = false;
  isMoveItemAccess: boolean = false;
  isStartStopMarkAsCompletedAccess: boolean = false;
  isInParameters: boolean = true;
  isInParametersValue: boolean = false;
  isOutParamters: boolean = false;
  isHiddenParameters: boolean = false;
  triggerFilterOptions = [];
  isTriggerReturnFilterVisible: boolean = false;
  isTriggerSearchItemExist: boolean = false;
  isStatusLoading: boolean = false;
  isBack: boolean = false;

  getWorkspaceTreeSub = Subscription.EMPTY;
  getTriggerDetailsSub = Subscription.EMPTY;
  markAllTaskAsCompletedSub = Subscription.EMPTY;
  deployTriggerItemsSub = Subscription.EMPTY;
  unDeployTriggerItemsSub = Subscription.EMPTY;
  deleteTriggerFolderSub = Subscription.EMPTY;
  deleteTriggerItemSub = Subscription.EMPTY;
  getTriggerByIdSub = Subscription.EMPTY;
  taskStartSub = Subscription.EMPTY;
  stopAllTasksSub = Subscription.EMPTY;
  getDeployedIntegrationByTriggerIdSub = Subscription.EMPTY;
  getTriggerItemStatusSub = Subscription.EMPTY; //trigger?
  getFolderByIdSub = Subscription.EMPTY;
  pasteTriggerSub = Subscription.EMPTY;
  enableDisableTriggerSub = Subscription.EMPTY;
  createTaskSub = Subscription.EMPTY;
  getScriptDeployStatusSub = Subscription.EMPTY;
  private workspaceTreeItemCount = Subscription.EMPTY;
  private lockInfoAndDebugParamSub = Subscription.EMPTY;
  private getScriptByIdSub = Subscription.EMPTY;
  private getUserSettingsSub = Subscription.EMPTY;

  @ViewChild(AppIntServiceLogComponent, { static: false })
  serviceLogs: AppIntServiceLogComponent;
  @ViewChild(AppIntEventLogComponent, { static: false })
  eventLogs: AppIntEventLogComponent;

  private triggerTreeCalled$ = new Subject<{
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
    if (this.appIntegrationDataService.getTriggerFilter().length > 0) {
      this.triggerFilterOptions = this.appIntegrationDataService.getTriggerFilter();
    } else {
      this.triggerFilterOptions = [
        { id: 1, name: "Undeployed", deleted: false },
        { id: 2, name: "Locked", deleted: false },
        { id: 3, name: "Disabled", deleted: false },
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
    this.selectedTriggerFilterOption = [];

    setTimeout(() => {
      this.selectedTriggerFilterOption = this.appIntegrationDataService.getSelectedTriggerFilter();
    });

    this.appIntegrationService.returnFromOtherPage.pipe(take(1)).subscribe((isBack) => {
      if (isBack) {
        this.isBack = isBack;
        const searchTriggerItem = this.appIntegrationDataService.getTriggerSearchItem();
        this.isTriggerSearchItemExist = searchTriggerItem ? true : false;
        const existedFilters: AppliedFilters =
          this.appIntegrationDataService.getAppliedFilters();
        if (!existedFilters?.undeployed) {
          this.selectedTriggerFilterOption.push(
            this.triggerFilterOptions[0].id
          );
        }
        if (existedFilters?.locked) {
          this.selectedTriggerFilterOption.push(
            this.triggerFilterOptions[1].id
          );
        }
        if (existedFilters?.disabled) {
          this.selectedTriggerFilterOption.push(
            this.triggerFilterOptions[2].id
          );
        }
      }
    });

    // Call worksapce tree API when any action performed
    this.triggerTreeCalled$.pipe(
      switchMap(({ taskDetailsDto, isSearching, isItemRemoved, isItemMoved }) => {
        this.isLoading = true;
        this.isStatusLoading = true; const itemCount = this.appIntegrationDataService.getTriggerTreeItemCount();
        if (itemCount) {
          this.triggerTreeItemCount = itemCount;
        } else {
          this.getWorkspaceTreeItemCount(taskDetailsDto);
        }

        const treeData: any[] = [];   // UI tree
        const statusData: any[] = [];
        const integrationTree = this.appIntegrationDataService.getTriggerItemTree();
        const expandedTree = this.appIntegrationDataService.getExpandedTriggerTree();
        const selectedTreeItem = this.appIntegrationDataService.getSelectedTriggerItem();
        const taskDetailsDtoData = this.getTaskDetailsObject(taskDetailsDto);
        if (integrationTree?.length) {
          this.WsTriggerTree = integrationTree;
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
              this.WsTriggerTree = treeData;
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
              this.WsTriggerTree = treeData;
              const workspaceItems = treeData;
              const expandedTree$ = this.appIntegrationDataService.getExpandedTriggerTree();
              const selectedTreeItem$ = this.appIntegrationDataService.getSelectedTriggerItem();
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
        this.triggerTreeItemCount = res?.Count ?? 0;
        this.appIntegrationDataService.storeTriggerTreeItemCount(this.triggerTreeItemCount);
      });
  }

  refreshDetails() {
    if (this.activeTriggerIndex === 0) {
      if (this.selectedTriggerTreeItem?.nodeType !== "WORKSPACE" && this.selectedTriggerTreeItem?.nodeType !== "FOLDER") {
        this.getTriggerItemDetails(this.selectedTriggerTreeItem?.id);
        this.getTriggerItemStatus(this.selectedTriggerTreeItem?.id);
      }
    }
    if (this.activeTriggerIndex === 1) {
      this.serviceLogs.refreshServiceLogs();
      this.serviceLogs.getServiceLog(this.itemIds);
    }
    if (this.activeTriggerIndex === 2) {
      this.eventLogs.refreshEventLogs();
      this.eventLogs.getEventLog(this.itemIds);
    }
  }

  /*============ Get Item Status On Refresh ============*/
  getTriggerItemStatus(itemId: number) {
    this.getTriggerItemStatusSub = this.appIntegrationService.getPITItemStatus(itemId).subscribe((res) => {
      if (res) {
        const itemStatus = {
          failedCount: res?.itemStatusCount?.Failed,
          initiateCount: res?.itemStatusCount?.Initiate,
          processingCount: res?.itemStatusCount?.Processing,
          processingWithErrorCount: res?.itemStatusCount?.ProcessingWithError,
          hold: res?.itemStatusCount?.Hold,
          inputHold: res?.itemStatusCount?.InputHold
        };
        this.triggerItemStatus = itemStatus;

        this.updateCounts(this.triggerItemTree, itemId, itemStatus);

        if (this.selectedTriggerTreeItem?.nodeType === 'TRIGGER') {
          if (this.triggerItemStatus?.processingCount > 0) {
            this.selectedTriggerTreeItem.icon = "success";
            return;
          }

          if (this.triggerItemStatus?.processingWithErrorCount > 0) {
            this.selectedTriggerTreeItem.icon = "process_error";
            return;
          }

          if (this.triggerItemStatus?.failedCount > 0) {
            this.selectedTriggerTreeItem.icon = "danger";
            this.updateParentIcons(this.selectedTriggerTreeItem, 'close_folder_error', 'open_folder_error');
            return;
          }

          if (this.triggerItemStatus?.hold > 0) {
            this.selectedTriggerTreeItem.icon = "fa fa-pause-circle-o text-warning";
            return;
          }

          if (this.triggerItemStatus?.inputHold > 0) {
            this.selectedTriggerTreeItem.icon = "fa fa-pause-circle-o text-warning";
            return;
          }

          if (this.selectedTriggerTreeItem?.disabled) {
            this.selectedTriggerTreeItem.icon = "fa fa-stop-circle-o text-warning";
            return;
          }

          if (this.selectedTriggerTreeItem?.scheduled) {
            if (this.selectedTriggerTreeItem.schedulersDisabled) {
              this.selectedTriggerTreeItem.icon = "fa fa-calendar text-warning";
              return;
            } else {
              this.selectedTriggerTreeItem.icon = "fa fa-calendar text-success";
              return;
            }
          }

          if (this.triggerItemStatus?.processingCount === 0 && this.triggerItemStatus?.processingWithErrorCount === 0 && this.triggerItemStatus?.failedCount === 0) {
            this.selectedTriggerTreeItem.icon = this.selectedTriggerTreeItem?.scheduled ? this.selectedTriggerTreeItem.schedulersDisabled ? "fa fa-calendar text-warning" : "fa fa-calendar text-success" : "fa fa-bolt";
            this.updateParentIcons(this.selectedTriggerTreeItem, 'fa fa-folder', 'fa fa-folder-open');
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
      if (node.nodeType.toUpperCase() === 'TRIGGER' && node.id === id) {
        node.failed = counts?.failedCount;
      }

      if (node.children && Array.isArray(node.children)) {
        this.updateCounts(node.children, id, counts);
      }
    });
  }

  /*============ Reset Trigger Filter Options ============*/
  resetTriggerFilter() {
    if (this.appIntegrationDataService.getTriggerFilter().length > 0) {
      this.triggerFilterOptions = this.appIntegrationDataService.getTriggerFilter();

    } else {
      this.triggerFilterOptions = [
        { id: 1, name: "Undeployed", deleted: false },
        { id: 2, name: "Locked", deleted: false },
        { id: 3, name: "Disabled", deleted: false }
      ];
    }
  }

  reinitiateTriggerProperties() {
    this.activeTriggerIndex = 0;
    this.triggerCurrentTabIndex = 0;
    this.isTriggerCopied = false;
    this.selectedTriggerTreeItem = null;
    this.WsTriggerTree = [];
    this.triggerItemTree = [];
    this.triggerDetails = null;
    this.triggerItemDeatils = null;
    this.selectedTriggerFilterOption = [];
    this.resetTriggerFilter();
  }

  handleChange(index: number) {
    this.activeTriggerIndex = index;
    this.appIntegrationDataService.storeTriggerTabIndex(index);
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

  onToggle(value: string) {
    if (value === "ALARM_SCHEDULER") {
      this.isAlarmSchedulerShow = !this.isAlarmSchedulerShow;
    }
  }

  /*=========== Advanced Search ============*/
  searchItem() {
    const dialogRef = this.dialog.open(SearchItemComponent, {
      width: "600px",
      maxHeight: "600px",
      data: {
        itemType: 'Integration',
        currentFilters: this.triggerFilterOptions,
        selectedFilterItems: this.selectedTriggerFilterOption
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isSearch) {
        result.id = this.triggerFilterOptions?.length + 1;
        result.name = result?.searchStr;
        result.deleted = true;
        this.triggerFilterOptions = [...this.triggerFilterOptions, result];
        this.selectedTriggerFilterOption = [...this.selectedTriggerFilterOption, result?.id];
        this.appIntegrationDataService.storeSelectedTriggerFilter(this.selectedTriggerFilterOption);
        this.appIntegrationDataService.storeTriggerFilter(this.triggerFilterOptions);
        this.onChangeFilter();
      }
    });
  }

  /*=========== Remove Option From Filter Dropdown ===========*/
  removeOption(item: any, event: Event) {
    event.stopPropagation(); // Prevents ng-select from selecting the option

    // Remove the item from the integrationFilterOptions list
    this.triggerFilterOptions = this.triggerFilterOptions.filter(opt => opt.id !== item.id);
    this.appIntegrationDataService.storeTriggerFilter(this.triggerFilterOptions);
    // Also remove it from the selected values (if it's already selected)
    if (this.selectedTriggerFilterOption.includes(item.id)) {
      this.selectedTriggerFilterOption = this.selectedTriggerFilterOption.filter(id => id !== item.id);
      this.onChangeFilter();
    }
  }

  triggerSelectionChange(newSelection: any[]) {
    const excludedIds = [1, 2, 3];
    const filteredSelection = newSelection.filter(id => !excludedIds.includes(id));
    if (filteredSelection.length > 3) {
      this.selectedTriggerFilterOption.pop();
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: `You can select only three custom filters.` });
      this.selectedTriggerFilterOption = [...this.selectedTriggerFilterOption];
      return;
    }
    this.selectedTriggerFilterOption = newSelection;
    this.onChangeFilter();
  }

  /*============= Trigger Properties =============*/
  triggerProperties() {
    this.storeAppliedFiltersAndTabNum();
    this.appIntegrationService.sharedAlarmPopupOpenedFlag(false);
    this.appIntegrationDataService.clearProcessParamsData();
    this.appIntegrationService.sharedAdditionalScriptParams([]);
    this.appIntegrationService.sharedConfigPending(false);
    this.router.navigate([
      `application_integration/properties/trigger/${false}/${this.getWorkspaceTreeObj?.workspaceId}/${this.belongsToFolderId}/${this.selectedTriggerTreeItem?.id}`
    ]);
  }
  /*============= END Trigger Properties =============*/

  advancedTriggerSearch(result) {
    if (result?.isSearch) {
      this.resetReturnToFilter();
      this.selectedTriggerTreeItem = null;
      this.WsTriggerTree = [];
      // this.selectedIntFilterOption = [];
      this.triggerItemTree = [];
      this.triggerDetails = null;
      this.triggerItemDeatils = null;
      this.appIntegrationDataService.clearTriggerSearchItem();
      this.appIntegrationDataService.clearTriggerItemTree();
      this.appIntegrationDataService.clearTriggerTreeItemCount();
      this.appIntegrationDataService.clearSelectedTriggerItem();
      const updatedResult = {
        ...result,
        id: this.triggerFilterOptions?.length + 1,
        name: result?.searchStr,
        deleted: true
      };
      this.triggerFilterOptions = [...this.triggerFilterOptions, updatedResult];
      this.selectedTriggerFilterOption = [updatedResult?.id];
      this.appIntegrationDataService.storeSelectedTriggerFilter(this.selectedTriggerFilterOption);
      this.appIntegrationDataService.storeTriggerFilter(this.triggerFilterOptions);
      this.getWorkspaceTreeObj.itemType = 'Trigger';
      this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
    }
  }

  /*=========== On Change Filter ===========*/
  onChangeFilter() {
    this.selectedTriggerTreeItem = null;
    this.WsTriggerTree = [];
    // this.selectedIntFilterOption = [];
    this.triggerItemTree = [];
    this.triggerDetails = null;
    this.triggerItemDeatils = null;
    this.onChangeFilterEvent.emit(true);
    if (this.appIntegrationDataService.getTriggerSearchItem()) {
      this.getWorkspaceTreeObj.itemName = "";
      this.appIntegrationDataService.clearTriggerSearchItem();
    }
    this.appIntegrationDataService.clearTriggerItemTree();
    this.appIntegrationDataService.clearTriggerTreeItemCount();
    this.appIntegrationDataService.clearSelectedTriggerItem();
    this.appIntegrationDataService.storeSelectedTriggerFilter(this.selectedTriggerFilterOption);
    this.appIntegrationDataService.storeTriggerFilter(this.triggerFilterOptions);
    // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
  }

  /*==========+ END On Change Filter ===========*/

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
    this.selectedTriggerFilterOption = this.appIntegrationDataService.getSelectedTriggerFilter();
    if (this.selectedTriggerFilterOption?.length) {
      this.selectedTriggerFilterOption.forEach((item) => {
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
          const advancedTriggerSearchArr = [];
          const triggerFilteredArray = this.triggerFilterOptions
            .filter(item => this.selectedTriggerFilterOption.includes(item.id));
          if (triggerFilteredArray?.length) {
            triggerFilteredArray.forEach((q) => {
              if (q?.isSearch) {
                advancedTriggerSearchArr.push({
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
            const advancedSearchItem = this.triggerFilterOptions.find((x) => Number(item) === Number(x?.id));
            taskDetailsDto.inAllParameters = advancedSearchItem?.parameters;
            // taskDetailsDto.inParameterName = advancedSearchItem?.parameterName;
            // taskDetailsDto.inParameterValue = advancedSearchItem?.parameterValue;
            taskDetailsDto.inIdentifier = advancedSearchItem?.identifiers;
            taskDetailsDto.inNetUser = advancedSearchItem?.netUsers;
            taskDetailsDto.inItemName = advancedSearchItem?.itemName;
            taskDetailsDto.inItemDescription = advancedSearchItem?.itemDescription;
            taskDetailsDto.advanceSearch = advancedSearchItem?.isSearch;
            taskDetailsDto.advanceInputSearch = advancedSearchItem?.searchStr;
            taskDetailsDto.advanceSearchFilters = advancedTriggerSearchArr;
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
    this.appIntegrationDataService.storeSelectedTriggerItem(null);
    return taskDetailsDto;
  }

  /*================= Refresh Workspace Item Tree ==================*/
  refreshTree() {
    this.triggerItemTree = [];
    this.appIntegrationDataService.clearTriggerItemTree();
    this.appIntegrationDataService.clearTriggerTreeItemCount();
    // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
  }

  showFilterView() {
    if (this.appIntegrationDataService.getTriggerSearchItem()) {
      this.showFilterViewEvent.emit(true);
      this.getWorkspaceTreeObj.itemName = "";
      this.appIntegrationDataService.clearTriggerSearchItem();
      this.appIntegrationDataService.clearTriggerItemTree();
      this.appIntegrationDataService.clearTriggerTreeItemCount();
    }
    this.isTriggerReturnFilterVisible = false;
    this.isTriggerSearchItemExist = false;
    this.appIntegrationDataService.clearSelectedProcessId();
    this.triggerItemTree = [];
    // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
  }


  triggerSearchItemExist() {
    this.isTriggerSearchItemExist = true;
  }

  resetReturnToFilter() {
    this.isTriggerReturnFilterVisible = false;
    this.isTriggerSearchItemExist = false;
  }


  /*================= Get Workspace Item Tree ==================*/
  getTriggerTree(taskDetailsDto: TaskDetailsDto, isSearching: boolean, isItemRemoved: boolean, isItemMoved: boolean) {
    this.isStatusLoading = false;
    this.appIntegrationDataService.clearTriggerTreeItemCount();
    this.triggerTreeCalled$.next({ taskDetailsDto, isSearching, isItemRemoved, isItemMoved });

    // this.isLoading = true;
    // this.isStatusLoading = true;
    // const treeData: any[] = [];   // UI tree
    // const statusData: any[] = [];
    // const triggerTree = this.appIntegrationDataService.getTriggerItemTree();
    // const expandedTree = this.appIntegrationDataService.getExpandedTriggerTree();
    // const selectedTreeItem = this.appIntegrationDataService.getSelectedTriggerItem();
    // const taskDetailsDtoData = this.getTaskDetailsObject(taskDetailsDto);

    // if (triggerTree?.length) {
    //   this.WsTriggerTree = triggerTree;
    //   const workspaceItems = triggerTree;
    //   this.workspaceTree(taskDetailsDto, expandedTree, selectedTreeItem, isSearching, isItemRemoved, isItemMoved, workspaceItems);
    //   this.isLoading = false;
    //   this.isStatusLoading = false;
    // } else {
    //   // Call both APIs simultaneously
    //   const tree$ = this.appIntegrationService.getWorkspaceTree(taskDetailsDtoData).pipe(
    //     tap((tree) => {
    //       // show tree immediately
    //       treeData.push(...tree);
    //       this.WsTriggerTree = treeData;
    //       const workspaceItems = treeData;
    //       this.workspaceTree(taskDetailsDto, expandedTree, selectedTreeItem, isSearching, isItemRemoved, isItemMoved, workspaceItems);
    //       this.isLoading = false;
    //     }));

    //   const status$ = this.appIntegrationService.getTreeItemStatus(taskDetailsDto).pipe(
    //     tap((status) => {
    //       // show status immediately
    //       statusData.push(...status);
    //     }));

    //   // Execute both
    //   forkJoin([tree$, status$]).subscribe(([tree, status]) => {
    //     this.mergeStatusIntoTree(treeData, statusData);
    //     this.WsTriggerTree = treeData;
    //     const workspaceItems = treeData;
    //     const selectedTreeItem$ = this.appIntegrationDataService.getSelectedTriggerItem();
    //     const expandedTree$ = this.appIntegrationDataService.getExpandedTriggerTree();
    //     this.workspaceTree(taskDetailsDto, expandedTree$, selectedTreeItem$, isSearching, isItemRemoved, isItemMoved, workspaceItems);
    //     this.isLoading = false;
    //     this.isStatusLoading = false;
    //   });
    // }
  }

  calculateTriggerTreeItems(tree: any[]): number {
    let count = 0;

    for (const node of tree) {
      if (node.type === 'TRIGGER') {
        count++;
      }

      if (node.children && node.children.length > 0) {
        count += this.calculateTriggerTreeItems(node.children);
      }
    }

    return count;
  }

  workspaceTree(taskDetailsDto: any, expandedTree: any[], selectedTreeItem: any, isSearching: boolean, isItemRemoved: boolean, isItemMoved: boolean, workspaceItems: any[]) {
    this.triggerItemTree = [];
    if (workspaceItems?.length) {
      this.appIntegrationDataService.storeTriggerItemTree(workspaceItems);
      this.filteredTriggerItemCount = this.calculateTriggerTreeItems(workspaceItems);
      workspaceItems.forEach((element) => {
        let nodeArray: TreeNode;
        nodeArray = new Appintitemtree(element, taskDetailsDto?.workspaceId);
        this.disabledTreeNode(nodeArray);
        this.expandTreeNode(nodeArray, isSearching ? true : false);
        this.updateTreeIcon(nodeArray);
        this.updateFolderIcon(nodeArray);
        this.expandTree(nodeArray, expandedTree[0], selectedTreeItem);
        if (isItemMoved) {
          this.expandMovedTree(nodeArray);
        }
        this.getTriggerTreeItems(nodeArray);
        this.triggerItemTree.push(nodeArray);
      });

      // Code for get updated item details after performing any action except Remove Item action
      if (isItemRemoved) {
        if (selectedTreeItem) {
          if (this.triggerTreeItems?.length) {
            this.triggerTreeItems.forEach((item: any) => {
              if (Number(item?.id) === Number(selectedTreeItem?.parent?.id)) {
                this.selectedTriggerFile = item;
                return false;
              }
            });
            this.nodeSelect(this.selectedTriggerFile);
          }
        }
      } else {
        if (selectedTreeItem) {
          if (this.triggerTreeItems?.length) {
            this.triggerTreeItems.forEach((x: any) => {
              if (Number(x?.id) === Number(selectedTreeItem?.id)) {
                this.selectedTriggerFile = x;
                return false;
              }
            });
            this.nodeSelect(this.selectedTriggerFile);
          }
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

  getWorkspaceTree(taskDetailsDto: TaskDetailsDto, isSearching: boolean, isItemRemoved: boolean, isItemMoved: boolean) {
    if (!this.triggerItemTree?.length) {
      this.isLoading = true;
      const expandedTree = this.appIntegrationDataService.getExpandedTriggerTree();
      const selectedTreeItem = this.appIntegrationDataService.getSelectedTriggerItem();
      const taskDetailsDtoData = this.getTaskDetailsObject(taskDetailsDto);
      this.getWorkspaceTreeSub = this.appIntegrationService.getWorkspaceTree(taskDetailsDtoData).subscribe((res) => {
        this.WsTriggerTree = res;
        const workspaceItems = res;
        if (workspaceItems?.length) {
          this.appIntegrationDataService.storeTriggerItemTree(workspaceItems);

          workspaceItems.forEach((element) => {
            let nodeArray: TreeNode;
            nodeArray = new Appintitemtree(element, taskDetailsDto?.workspaceId);
            this.disabledTreeNode(nodeArray);
            this.expandTreeNode(nodeArray, isSearching ? true : false);
            this.updateTreeIcon(nodeArray);
            this.updateFolderIcon(nodeArray);
            this.expandTree(nodeArray, expandedTree[0], selectedTreeItem);
            if (isItemMoved) {
              this.expandMovedTree(nodeArray);
            }
            this.getTriggerTreeItems(nodeArray);
            this.triggerItemTree.push(nodeArray);
          });

          // Code for get updated item details after performing any action except Remove Item action
          if (isItemRemoved) {
            if (selectedTreeItem) {
              if (this.triggerTreeItems?.length) {
                this.triggerTreeItems.forEach((item: any) => {
                  if (Number(item?.id) === Number(selectedTreeItem?.parent?.id)) {
                    this.selectedTriggerFile = item;
                    return false;
                  }
                });
                this.nodeSelect(this.selectedTriggerFile);
              }
            }
          } else {
            if (selectedTreeItem) {
              if (this.triggerTreeItems?.length) {
                this.triggerTreeItems.forEach((x: any) => {
                  if (Number(x?.id) === Number(selectedTreeItem?.id)) {
                    this.selectedTriggerFile = x;
                    return false;
                  }
                });
                this.nodeSelect(this.selectedTriggerFile);
              }
            }
          }
          this.getNewlyCreatedItem();
        }
        this.isLoading = false;
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  /*=========== Get Newly Created Item For Set Focus on It ===========*/
  getNewlyCreatedItem() {
    let newItem = null;
    this.appIntegrationService.createdUpdatedPITItem.pipe(take(1)).subscribe((res: any) => {
      if (res) {
        this.createdOrUpdatedPITItem = res;
        if (res?.isCreated) {
          if (this.triggerTreeItems?.length) {
            this.triggerTreeItems.forEach((x: any) => {
              if (Number(x?.id) === Number(this.createdOrUpdatedPITItem?.itemId)) {
                newItem = x;
                this.selectedTriggerFile = newItem;
                this.nodeSelect(this.selectedTriggerFile);
                this.appIntegrationService.sharedCreatedUpdatedPITItem(null);
                const itemCount = this.appIntegrationDataService.getTriggerTreeItemCount();
                this.triggerTreeItemCount = itemCount + 1;
                this.appIntegrationDataService.storeTriggerTreeItemCount(this.triggerTreeItemCount);
                return false;
              }
            });
          }
        }
      }
    });
  }

  getTriggerTreeItems(node: any) {
    this.triggerTreeItems.push(node);
    if (node?.children?.length) {
      node?.children.forEach((x: any, index: number) => {
        this.getTriggerTreeItems(node.children[index]);
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
      if (node?.nodeType === 'WORKSPACE' && node?.children?.length) {
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
    const tree = this.appIntegrationDataService.getTriggerItemTree();
    const node = this.findNodeById(tree, nodeId);

    if (node) {
      // Update the node properties
      node.disabled = newProperties?.disabled;
      node.deployed = newProperties?.deployed;
    }
    this.appIntegrationDataService.storeTriggerItemTree(tree)
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
          //this.selectedTriggerTreeItem.icon = "fa fa-stop-circle-o text-warning";
          this.selectedTriggerTreeItem.disabled = true;
          this.triggerDetails.disable = true;
          this.getTriggerItemStatus(this.selectedTriggerTreeItem?.id);
          this.updateNodeById(this.selectedTriggerTreeItem?.id, this.selectedTriggerTreeItem);
        } else {
          // this.selectedTriggerTreeItem.icon = this.selectedTriggerTreeItem?.scheduled ? "fa fa-calendar" : "fa fa-bolt";
          this.selectedTriggerTreeItem.disabled = false;
          this.triggerDetails.disable = false;
          this.getTriggerItemStatus(this.selectedTriggerTreeItem?.id);
          this.updateNodeById(this.selectedTriggerTreeItem?.id, this.selectedTriggerTreeItem);
        }
        break;
      // You can add more cases for other events if needed
      case 'deploy':
        this.selectedTriggerTreeItem.deployed = true;
        this.selectedTriggerTreeItem.label = this.selectedTriggerTreeItem.data;
        this.updateNodeById(this.selectedTriggerTreeItem?.id, this.selectedTriggerTreeItem);
        break;
      case 'undeploy':
        this.selectedTriggerTreeItem.deployed = false;
        this.selectedTriggerTreeItem.label = this.selectedTriggerTreeItem.data + "*";
        this.updateNodeById(this.selectedTriggerTreeItem?.id, this.selectedTriggerTreeItem);
        break;
      case 'scheduled':
        if (schedulerDisabled) {
          this.selectedTriggerTreeItem.schedulersDisabled = true;
          this.selectedTriggerTreeItem.icon = "fa fa-calendar text-warning";
          this.updateNodeById(this.selectedTriggerTreeItem?.id, this.selectedTriggerTreeItem);
        } else {
          this.selectedTriggerTreeItem.schedulersDisabled = false;
          this.selectedTriggerTreeItem.icon = "fa fa-calendar text-success";
          this.updateNodeById(this.selectedTriggerTreeItem?.id, this.selectedTriggerTreeItem);
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
        if (childNode?.nodeType === "TRIGGER") {
          // First priority item status for show icons
          if (childNode?.processing > 0) {
            childNode.icon = "success";
            // childNode.icon = "fa fa-bolt text-success";
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
            // childNode.icon = "fa fa-bolt text-danger";
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
              childNode.icon = "fa fa-calendar text-warning";
              return;
            } else {
              childNode.icon = "fa fa-calendar text-success";
              return;
            }
          } else {
            childNode.icon = "fa fa-bolt";
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

    // If this is an TRIGGER, check its statusCountMap
    if (node.nodeType === 'TRIGGER' && node?.failed > 0) {
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
        const childHasError = current.children.some((child) => (child.nodeType.toUpperCase() === 'TRIGGER' && child?.failed > 0) || (child.nodeType.toUpperCase() === 'FOLDER' && child?.hasError));

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
  storeExpandedTriggerTree() {
    this.appIntegrationDataService.storeExpandedTriggerTree(this.triggerItemTree);
  }
  /*============= END Store Expanded Tree Client Side =============*/

  /*============= Tree Node Selection ============*/
  nodeSelect(item: any) {
    this.selectedTriggerTreeItem = null;
    this.selectedTriggerFile = item;
    this.appIntegrationDataService.clearSelectedTriggerItem();
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.selectedTriggerTreeItem = item;
    // this.getTriggerItemStatus(this.selectedTriggerTreeItem?.id);
    this.appIntegrationDataService.storeSelectedTriggerItem(this.selectedTriggerTreeItem);
    this.storeExpandedTriggerTree();
    if (item?.nodeType === "FOLDER") {
      this.belongsToFolderId = item?.id;
    }
    if (item?.nodeType !== "WORKSPACE" && item?.nodeType !== "FOLDER") {
      this.belongsToFolderId = item?.belongsToFolder;
      this.getTriggerItemDetails(item?.id);
    }
  }
  /*============= END Tree Node Selection ============*/

  /*============= Tree Node Unselecting ============*/
  nodeUnselect(item: any) { }
  /*============= END Tree Node Unselecting ============*/

  /*============= Get Selected Tree Item Details ============*/
  getTriggerById(triggerId: number) {
    this.getTriggerByIdSub = this.appIntegrationService.getDeployedTriggerById(Number(triggerId)).subscribe((res) => {
      if (res) {
        this.triggerItemDeatils = res;
        this.messageService.add({
          key: "appIntSuccessKey",
          severity: "success",
          summary: "",
          detail: `${this.selectedTriggerTreeItem?.data} trigger copied successfully!`,
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
  getTriggerItemDetails(triggerId: number) {
    const triggerTabIndex = this.appIntegrationDataService.getTriggerTabIndex();
    this.getTriggerDetailsSub = this.appIntegrationService.getDeployedTriggerById(Number(triggerId)).subscribe((res) => {
      this.selectedTriggerTreeItem.scheduled = res?.scheduled;
      const triggerInfo = JSON.parse(JSON.stringify(res));
      this.getTriggerItemStatus(triggerInfo?.id);

      if (this.isBack) {
        if (triggerInfo?.deployed) {
          this.updateIconStatus('deploy', triggerInfo?.disable, triggerInfo?.schedulersDisabled);
        } else {
          this.updateIconStatus('undeploy', triggerInfo?.disable, triggerInfo?.schedulersDisabled);
        }
        if (!triggerInfo?.disable) {
          if (triggerInfo?.scheduled) {
            this.updateIconStatus('scheduled', triggerInfo?.disable, triggerInfo?.schedulersDisabled);
            // this.getTriggerItemStatus(triggerInfo?.id);
          } else {
            // this.getTriggerItemStatus(triggerInfo?.id);
          }
        }
      }

      if (triggerInfo?.identifiers?.length) {
        triggerInfo.identifiersReform = this.identifierReform(triggerInfo?.identifiers);

        triggerInfo?.identifiers.forEach((x) => {
          x.identifierParams = x?.detectorParametersData?.identifierParameterDataList;
        });
      }
      triggerInfo.intParam = this.checkProcessIntegrationParams(triggerInfo?.associatedProcess?.paramsData, triggerInfo?.paramsData);

      if (triggerInfo?.scriptList?.length) {
        triggerInfo?.scriptList.forEach((item) => {
          if (item?.scriptParameterDataList?.length) {
            item.scriptParameterDataList = Array.from(new Map(
              item?.scriptParameterDataList.map(data => [data.parameterName.trim(), data])
            ).values());
            item?.scriptParameterDataList.forEach((x) => {
              x.value = null;
              if (triggerInfo?.paramsData?.length) {
                triggerInfo?.paramsData.forEach((p) => {
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
            });
          }
        });
      }


      if (triggerInfo?.paramsData?.length) {
        triggerInfo?.paramsData.forEach((p) => {
          p.value = (p?.securityLevel === 'medium' || p?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(p?.value) : p?.value;
        });
      }

      // Function to shorten configValue (max 100 chars)
      const getShortConfigValue = (configValue) => {
        return configValue.length > 100
          ? configValue.slice(0, 100) + '...'
          : configValue;
      };

      // Function to convert configValue string → array of {name, value}
      const convertConfigValue = (configValue) => {
        return configValue.split('|').map(item => {
          // split only at the first '='
          const index = item.indexOf('=');
          const name = index !== -1 ? item.slice(0, index) : item;
          const value = index !== -1 ? item.slice(index + 1) : '';
          return { name, value };
        });
      };

      if (triggerInfo?.configData?.length) {
        triggerInfo.configData = triggerInfo?.configData.map(obj => ({
          ...obj,
          shortConfigValue: getShortConfigValue(obj.configValue),
          configArr: convertConfigValue(obj.configValue)
        }));
      }

      this.triggerDetails = triggerInfo;
      this.getConnectedExe();
      if (this.triggerDetails?.locked) {
        this.isActionBtnDisabled = false;
      } else {
        this.isActionBtnDisabled = true;
      }
      this.itemIds = [
        {
          workspaceId: this.getWorkspaceTreeObj?.workspaceId,
          itemId: this.selectedTriggerTreeItem?.id,
          itemType: "Trigger",
        },
      ];
      if (this.activeTriggerIndex === 1) {
        this.serviceLogs.getServiceLog(this.itemIds);
      }
      if (this.activeTriggerIndex === 2) {
        this.eventLogs.getEventLog(this.itemIds);
      }
      if (triggerTabIndex || triggerTabIndex === 0) {
        this.activeTriggerIndex = triggerTabIndex;
        if (this.activeTriggerIndex === 1) {
          setTimeout(() => {
            this.serviceLogs.getServiceLog(this.itemIds);
          }, 0);
        }
        if (this.activeTriggerIndex === 2) {
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

  /*============= Merge Process Parameters With Trigger Parameters =============*/
  checkProcessIntegrationParams(processParams: Array<any>, integrationParams: Array<any>) {
    // Ensure processParams and integrationParams are arrays
    const clonedIntParamsArray = Array.isArray(processParams) ? JSON.parse(JSON.stringify(processParams)) : [];

    // If clonedIntParamsArray has elements, continue processing
    if (clonedIntParamsArray.length) {
      clonedIntParamsArray.forEach((x) => {
        x.isIntParam = false;

        if (Array.isArray(integrationParams) && integrationParams.length) {
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
    const res = this.triggerDetails;
    let parameterSettingData = {
      'isInParameters': this.isInParameters,
      'isInParametersValue': this.isInParametersValue,
      'isOutParamters': this.isOutParamters,
      'isHiddenParameters': this.isHiddenParameters
    };
    this.appIntegrationDataService.storeParameterSettings(parameterSettingData);
    if (res?.scriptList?.length) {
      res?.scriptList.forEach((item) => {
        if (item?.scriptParameterDataList?.length) {
          const inParameters = [];
          const outParameters = [];
          const inOutParameters = [];
          item?.scriptParameterDataList.forEach((params) => {
            if (res?.paramsData?.length) {
              res?.paramsData.forEach((x) => {
                if (params?.parameterName === x?.paramName) {
                  params.value = params?.securityLevel === 'high' ? '*****' : x?.value;

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
    this.triggerDetails = res;
  }

  /*============= Add Trigger =============*/
  addTrigger() {
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.appIntegrationService.sharedAdditionalScriptParams([]);
    this.appIntegrationService.sharedIdentifiersMethods(null);
    this.appIntegrationDataService.clearSchedulers();
    this.appIntegrationDataService.clearProcessParamsData();
    this.appIntegrationService.sharedConfigPending(false);
    this.storeAppliedFiltersAndTabNum();
    this.router.navigate([
      `application_integration/item/trigger/${true}/${this.getWorkspaceTreeObj?.workspaceId
      }/${this.belongsToFolderId}/${this.selectedTriggerTreeItem?.id}`,
    ]);
  }
  /*============= END Add Trigger =============*/

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
        itemId: Number(this.selectedTriggerTreeItem?.id),
        isStart: true,
        isInteractive: false,
        item: this.triggerDetails,
        itemType: 'Trigger'
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
      tiesItemID: Number(this.selectedTriggerTreeItem?.id),
      parameters: startTaskDto?.parameters,
      teisItemType: this.selectedTriggerTreeItem?.nodeType,
      updatedTriggerConfigList: updatedTriggerConfigList,
    };
    this.taskStartSub = this.appIntegrationService.startTask(startTaskDetailsDto).subscribe((res) => {
      if (res) {
        // this.triggerItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        // this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
        this.getTriggerItemStatus(this.selectedTriggerTreeItem?.id);
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
        nodeType: this.selectedTriggerTreeItem?.nodeType
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
      itemIdList: [Number(this.selectedTriggerTreeItem?.id)]
    };
    this.stopAllTasksSub = this.appIntegrationService.stopAllTask(stopAllTasksObj).subscribe(res => {
      if (res) {
        // this.triggerItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        // this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
        this.getTriggerItemStatus(this.selectedTriggerTreeItem?.id);
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

  /*============= Copy Trigger =============*/
  copyTriggerItem() {
    this.isTriggerCopied = true;
    this.getTriggerById(this.selectedTriggerTreeItem?.id);
  }
  /*============= END Copy Trigger =============*/

  /*============= Paste Trigger =============*/
  pasteTriggerItem() {
    const triggerDetails = this.triggerItemDeatils;
    if (triggerDetails?.schedulerList?.length) {
      triggerDetails.schedulerList = triggerDetails.schedulerList.map((scheduler: any) => ({
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
        name: triggerDetails?.name ? triggerDetails?.name : "",
        description: triggerDetails?.description
          ? triggerDetails?.description
          : "",
        belongsToFolder:
          this.selectedTriggerTreeItem?.nodeType === "FOLDER"
            ? this.selectedTriggerTreeItem?.id
            : null,
        itemType: "TRIGGER",
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isPaste) {
        this.isTriggerCopied = false;
        const createTriggerDto: TeisItemDto = {
          activatorDataList: triggerDetails?.activatorDataList,
          activatorEnabled: triggerDetails?.activatorEnabled,
          configData: triggerDetails?.configData,
          configDataList: triggerDetails?.configDataList,
          configParameterList: triggerDetails?.configParameterList,
          identifierMethodList: triggerDetails?.identifierMethodList,
          infoFilePath: triggerDetails?.infoFilePath,
          taskRepeatFrequency: triggerDetails?.taskRepeatFrequency,
          taskToBeRepeated: triggerDetails?.taskToBeRepeated,
          alarmList: triggerDetails?.alarmList,
          defaultAlert: triggerDetails?.defaultAlert,
          name: result?.name,
          id: null,
          processId: triggerDetails?.processId,
          identifierIdList: triggerDetails?.identifierIdList,
          note: triggerDetails?.note,
          locked: triggerDetails?.locked,
          lockedDate: triggerDetails?.lockedDate,
          lockedUserId: triggerDetails?.lockedUserId,
          lockedUserName: triggerDetails?.lockedUserName,
          identifiers: triggerDetails?.identifiers,
          createAndDeploy: false,
          description: result?.description,
          disabled: triggerDetails?.disabled,
          updateTaskList: triggerDetails?.updateTaskList,
          enableAlert: triggerDetails?.enableAlert,
          alertProcessId: triggerDetails?.alertProcessId,
          alertProcessName: triggerDetails?.alertProcessName,
          associatedProcess: triggerDetails?.associatedProcess,
          scriptEngineGroup: triggerDetails?.scriptEngineGroup,
          scriptEngine: triggerDetails?.scriptEngine,
          queue: triggerDetails?.queue,
          releaseAndDeploy: false,
          releaseOnly: false,
          saveOnly: false,
          netUsersDto: triggerDetails?.netUsersDto,
          netUserMapping: triggerDetails?.netUserMapping,
          oldFileName: triggerDetails?.oldFileName,
          logMaintenanceId: triggerDetails?.logMaintenanceId,
          alertId: triggerDetails?.alertId,
          alertEnabled: triggerDetails?.alertEnabled,
          scheduled: triggerDetails?.scheduled,
          schedulerList: triggerDetails?.schedulerList,
          modified: triggerDetails?.modified,
          deployed: triggerDetails?.deployed,
          folder: triggerDetails?.folder,
          type: triggerDetails?.type,
          folderDataList: null,
          workspaceId: result?.workspaceId,
          autoStart: triggerDetails?.autoStart,
          interactiveMode: triggerDetails?.interactiveMode,
          showDebugMsg: triggerDetails?.showDebugMsg,
          disable: triggerDetails?.disable,
          logLevel: triggerDetails?.logLevel,
          priority: triggerDetails?.priority,
          processComponentId: triggerDetails?.processComponentId,
          iconId: triggerDetails?.iconId,
          belongsToFolder: result?.belongsToFolder,
          businessFlowDatas: triggerDetails?.businessFlowDatas,
          deleted: triggerDetails?.deleted,
          scriptEngineKey: triggerDetails?.scriptEngineKey,
          imageIconName: triggerDetails?.imageIconName,
          failedTaskCount: triggerDetails?.failedTaskCount,
          initiateTaskCount: triggerDetails?.initiateTaskCount,
          processingTaskCount: triggerDetails?.processingTaskCount,
          processingErrorTaskCount: triggerDetails?.processingErrorTaskCount,
          lastUpdated: "",
          updatedBy: this.currentUser?.userName,
          version: triggerDetails?.version,
          versionCount: triggerDetails?.versionCount,
          deployedVersion: triggerDetails?.deployedVersion,
          versionNumber: triggerDetails?.versionNumber,
          thisDeployedVersion: triggerDetails?.thisDeployedVersion,
          disabledSchedulerOrAlarm: triggerDetails?.disabledSchedulerOrAlarm,
          releasePressed: triggerDetails?.releasePressed,
          paramsData: (triggerDetails?.paramsData && triggerDetails?.paramsData?.length) ? triggerDetails?.paramsData : [],
          scriptList: triggerDetails?.scriptList,
          scripts: triggerDetails?.scriptList,
          teisFolders: triggerDetails?.teisFolders,
        };
        this.pasteTriggerSub = this.appIntegrationService.createTrigger(createTriggerDto).subscribe((res) => {
          if (res) {
            this.triggerItemTree = [];
            this.appIntegrationService.sharedCreatedUpdatedPITItem({ isCreated: true, itemId: res?.triggerId });
            // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
            this.appIntegrationDataService.clearTriggerItemTree();
            this.appIntegrationDataService.clearTriggerTreeItemCount();
            this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
            this.messageService.add({
              key: "appIntSuccessKey",
              severity: "success",
              summary: "",
              detail: `${result?.name} trigger paste successfully!`,
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
  /*============= END Paste Trigger =============*/

  /*================= Mark All Task As Completed ==================*/
  markAllTaskAsCompleted() {
    const dialogRef = this.dialog.open(AppIntMarkAllAsCompletedComponent, {
      width: "500px",
      maxHeight: "600px",
      data: "",
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
      itemIdList: [this.selectedTriggerTreeItem?.id],
      note: `Marked complete by ${this.currentUser?.firstName ? this.currentUser?.firstName : ""
        } ${this.currentUser?.lastName ? this.currentUser?.lastName : ""
        }: ${comment}`,
      taskIdList: [],
      updatedBy: this.currentUser?.userName,
    };
    this.markAllTaskAsCompletedSub = this.appIntegrationService.markTaskAsCompleted(markTaskCompletedDto).subscribe((res) => {
      if (res) {
        // this.triggerItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        // this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
        this.getTriggerItemStatus(this.selectedTriggerTreeItem?.id);
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
        itemType: "Trigger",
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
        processTree: this.WsTriggerTree,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isMove) {
        this.triggerItemTree = [];
        //this.appIntegrationService.sharedCreatedUpdatedPITItem({ isCreated: true, itemId: result?.sourceFolder });

        if (this.triggerTreeItems?.length) {
          this.triggerTreeItems.forEach((x: any) => {
            //if (Number(x?.id) === Number(this.createdOrUpdatedPITItem?.itemId)) {
            if (Number(x?.id) === Number(result?.sourceFolder)) {
              this.selectedTriggerTreeItem = x;
              // this.nodeSelect(x);
              this.appIntegrationDataService.storeSelectedTriggerItem(this.selectedTriggerTreeItem);
              return false;
            }
          });
        }

        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, true);
        this.appIntegrationDataService.clearTriggerItemTree();
        this.appIntegrationDataService.clearTriggerTreeItemCount();
        this.getTriggerTree(this.getWorkspaceTreeObj, false, false, true);
      }
    });
  }
  /*================= END Move Items ================*/

  /*============= Deploy Workspace Items =============*/
  deployTriggerItems() {
    if (this.selectedTriggerTreeItem?.nodeType === "FOLDER") {
      if (this.selectedTriggerTreeItem?.children?.length <= 0) {
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
      this.deployItem();
    }
  }

  deployItem() {
    if (this.triggerDetails?.locked) {
      this.messageService.add({
        key: "appIntErrorKey",
        severity: "error",
        summary: "",
        detail: `Process can not be deployed because it is locked by ${this.triggerDetails?.lockedUserName}`,
      });
    } else {
      if (this.selectedTriggerTreeItem?.nodeType === "FOLDER") {
        this.deployTriggerItem();
      } else {
        const processExecutablesIds = this.triggerDetails?.scriptList.map(item => item.id);
        this.getScriptDeployStatusSub = this.appIntegrationService.getScriptDeployStatus(processExecutablesIds).subscribe((res) => {
          const hasDeployedFalse = res.some(script => script.deployed === false);
          if (hasDeployedFalse) {
            this.messageService.add({
              key: "appIntErrorKey",
              severity: "error",
              summary: "",
              detail: `Error in trigger deploy. One or more connected executables are not deployed.`,
            });
          } else {
            this.deployTriggerItem();
          }
        });
      }
    }
  }
  /*============= END Deploy Workspace Items =============*/

  /*============= Deploy Trigger Items =============*/
  deployTriggerItem() {
    const deployItemsDto: DeployUndeployItemsDto = {
      workspaceId: this.getWorkspaceTreeObj?.workspaceId,
      deploymentDetails: [
        {
          teisItemID: this.selectedTriggerTreeItem?.id,
          teisItemType: "Trigger",
          teisVersionNumber: this.triggerDetails?.deployedVersion > 0 ? this.triggerDetails?.deployedVersion : this.triggerDetails?.versionNumber
        },
      ],
    };
    this.deployTriggerItemsSub = this.appIntegrationService.deployItems(deployItemsDto, "Trigger", this.selectedTriggerTreeItem?.id, this.selectedTriggerTreeItem?.nodeType).subscribe((res) => {
      const nodeType = this.toTitleCaseService.convertToTitleCase(this.selectedTriggerTreeItem?.nodeType);
      // this.triggerItemTree = [];
      // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      // this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
      if (this.selectedTriggerTreeItem?.nodeType !== 'FOLDER') {
        this.updateIconStatus('deploy');
      } else {
        this.appIntegrationDataService.clearTriggerItemTree();
        this.appIntegrationDataService.clearTriggerTreeItemCount();
        this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
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
      }
    });
  }
  /*============= End Deploy Trigger Items =============*/

  /*============= Undeploy Workspace Items =============*/
  unDeployTriggerItems() {
    if (this.selectedTriggerTreeItem?.nodeType === "FOLDER") {
      if (this.selectedTriggerTreeItem?.children?.length <= 0) {
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
          teisItemID: this.selectedTriggerTreeItem?.id,
          teisItemType: "Trigger",
          teisVersionNumber: this.triggerDetails?.deployedVersion > 0 ? this.triggerDetails?.deployedVersion : this.triggerDetails?.versionNumber,
        },
      ],
    };
    this.unDeployTriggerItemsSub = this.appIntegrationService.unDeployItems(unDeployItemsDto, "Trigger", this.selectedTriggerTreeItem?.id, this.selectedTriggerTreeItem?.nodeType).subscribe((res) => {
      // this.triggerItemTree = [];
      // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      // this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
      if (this.selectedTriggerTreeItem?.nodeType !== 'FOLDER') {
        this.updateIconStatus('undeploy');
      } else {
        this.appIntegrationDataService.clearTriggerItemTree();
        this.appIntegrationDataService.clearTriggerTreeItemCount();
        this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
      }
      this.messageService.add({
        key: "appIntSuccessKey",
        severity: "success",
        summary: "",
        detail: "Trigger undeployed successfully!",
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  // undeployItem() {
  //   const unDeployItemsDto: DeployUndeployItemsDto = {
  //     workspaceId: this.getWorkspaceTreeObj?.workspaceId,
  //     deploymentDetails: [
  //       {
  //         teisItemID: this.selectedTriggerTreeItem?.id,
  //         teisItemType: "Trigger",
  //         teisVersionNumber: this.triggerDetails?.deployedVersion > 0 ? this.triggerDetails?.deployedVersion : this.triggerDetails?.versionNumber,
  //       },
  //     ],
  //   };
  //   this.unDeployTriggerItemsSub = this.appIntegrationService.unDeployItems(unDeployItemsDto, "Trigger", this.selectedTriggerTreeItem?.id, this.selectedTriggerTreeItem?.nodeType).subscribe((res) => {
  //     const nodeType = this.toTitleCaseService.convertToTitleCase(this.selectedTriggerTreeItem?.nodeType);
  //     this.triggerItemTree = [];
  //     this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
  //     this.messageService.add({
  //       key: "appIntSuccessKey",
  //       severity: "success",
  //       summary: "",
  //       detail: `${nodeType} undeployed successfully!`,
  //     });
  //     // Update Workspace Deploy, Undeploy and Not initialized Count on Action Perform
  //     this.isActionPerformEvent.emit(true);
  //   }, (err: HttpErrorResponse) => {
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }
  /*============= END Undeploy Workspace Items =============*/

  /*================= Enable / Disable Trigger ==================*/
  enabledDisableTrigger(isDisable: boolean) {
    this.enableDisableTriggerSub = this.appIntegrationService.enabledDisabledTrigger(this.triggerDetails?.id, isDisable).subscribe((res) => {
      if (res) {
        // this.triggerItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        // this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
        this.updateIconStatus('EnableDisable', isDisable);
        this.messageService.add({
          key: "appIntSuccessKey",
          severity: "success",
          summary: "",
          detail: isDisable ? `Trigger ${this.triggerDetails?.name} disabled successfully!` : `Trigger ${this.triggerDetails?.name} enabled successfully!`,
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
          this.selectedTriggerTreeItem?.nodeType === "FOLDER"
            ? this.selectedTriggerTreeItem?.id
            : null,
        name: "",
        description: "",
        type: "TRIGGER",
        isNewFolder: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.triggerItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        this.appIntegrationDataService.clearTriggerItemTree();
        this.appIntegrationDataService.clearTriggerTreeItemCount();
        this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
      }
    });
  }
  /*================= END Create Folder ==================*/

  /*================= Update Folder ==================*/
  updateFolder() {
    const folderId =
      this.selectedTriggerTreeItem?.nodeType === "FOLDER"
        ? this.selectedTriggerTreeItem?.id
        : null;
    this.getFolderByIdSub = this.appIntegrationService
      .getFolderById(folderId)
      .subscribe(
        (res) => {
          if (res) {
            const dialogRef = this.dialog.open(AppIntCreateFolderComponent, {
              width: "500px",
              maxHeight: "600px",
              data: {
                id: Number(res?.id),
                workspaceId: this.getWorkspaceTreeObj?.workspaceId,
                belongsToFolder: Number(res?.belongsToFolder),
                name: res?.name,
                description: res?.description,
                type: "Trigger",
                isNewFolder: false,
              },
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                this.triggerItemTree = [];
                // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
                this.getTriggerTree(this.getWorkspaceTreeObj, false, false, false);
              }
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
  /*================= END Update Folder ==================*/

  /*================= Remove Trigger =================*/
  removeTrigger() {
    if (this.selectedTriggerTreeItem?.nodeType === "FOLDER") {
      if (this.selectedTriggerTreeItem?.children?.length > 0) {
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
          data: `Are you sure you want to remove ${this.selectedTriggerTreeItem?.label} folder?`,
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            if (this.selectedTriggerTreeItem?.nodeType === "FOLDER") {
              const workspaceId = this.getWorkspaceTreeObj?.workspaceId;
              const teisitemtype = "TRIGGER";
              const folderId =
                this.selectedTriggerTreeItem?.nodeType === "FOLDER"
                  ? this.selectedTriggerTreeItem?.id
                  : null;
              const removeAllTask = false;
              this.deleteTriggerFolderSub = this.appIntegrationService.deleteFolder(workspaceId, teisitemtype, folderId, removeAllTask).subscribe((res) => {
                // this.triggerItemTree = [];
                // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, true, false);
                this.appIntegrationDataService.clearTriggerItemTree();
                this.appIntegrationDataService.clearTriggerTreeItemCount();
                this.getTriggerTree(this.getWorkspaceTreeObj, false, true, false);
                this.messageService.add({
                  key: "appIntSuccessKey",
                  severity: "success",
                  summary: "",
                  detail: "Folder deleted successfully!",
                });
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

    if (this.selectedTriggerTreeItem?.nodeType === "TRIGGER") {
      const dialogRef = this.dialog.open(AppIntConfirmationComponent, {
        width: "700px",
        maxHeight: "600px",
        data: {
          title: `Are you sure you  want to remove ${this.selectedTriggerTreeItem?.label} trigger?`,
          subtext: `Note: All versions will be deleted. if any uncertainty, do an export before as a backup.`,
          actiontext: `Also delete task associated with this item`,
          actionsubtext: `Logs associated with the item will not be retrieved on the UI`,
          isShowSingleBtn: false
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result?.isConfirm) {
          this.deleteTriggerItemSub = this.appIntegrationService.deleteTriggerItem(this.getWorkspaceTreeObj?.workspaceId, this.selectedTriggerTreeItem?.id, result?.isSelected).subscribe(res => {
            if (res) {
              // this.triggerItemTree = [];
              // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, true, false);
              this.appIntegrationDataService.clearTriggerItemTree();
              this.appIntegrationDataService.clearTriggerTreeItemCount();
              this.getTriggerTree(this.getWorkspaceTreeObj, false, true, false);
              this.messageService.add({
                key: "appIntSuccessKey",
                severity: "success",
                summary: "",
                detail: "Trigger deleted successfully!",
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
  /*================= END Remove Trigger =================*/

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

  getUrl(wsId: number, scriptId: number, tabId: string, scriptType: string, isVersionCopy: boolean, versionId: string, isDeployed: boolean, debugSeId: string, debugSeUrl: string, theme: string): any {

    const baseUrl = window.location.origin;
    const token = this.kcService.getToken();

    return `${baseUrl}/winwrap/?clientid=${tabId}&wId=${wsId}&exeId=${scriptId}&type=${scriptType}&isDeployed=${isDeployed}&isVersionCopy=${isVersionCopy}&versionId=${versionId}&debugSeId=${debugSeId}&debugSeUrl=${debugSeUrl}&theme=${theme}`;
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

            const scriptUrl = this.getUrl(workspaceId, script?.executableRef ? script?.executableRef : script?.id, this.scriptStateService.getTabId(script?.executableRef ? script?.executableRef : script?.id), script?.userDefined ? 'userScript' : script?.language === 'C#' ? 'adapter' : 'template', false, '0', true, debugSeId, debugSeUrl, this.scriptStateService.getEditorTheme());

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
      }
    });
  }

  /*================= Store Applied Filters and Current Tab Number ==================*/
  storeAppliedFiltersAndTabNum() {
    this.deployed = true;
    this.disabled = false;
    this.locked = false;
    if (this.selectedTriggerFilterOption?.length) {
      this.selectedTriggerFilterOption.forEach((item) => {
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
      selectedWorkspace: this.getWorkspaceTreeObj?.workspaceId,
      currentTab: 2,
      searchTerm: this.getWorkspaceTreeObj?.itemName,
      undeployed: this.deployed,
      locked: this.locked,
      disabled: this.disabled,
    });
  }
  /*================= END Store Applied Filters and Current Tab Number ==================*/

  /*============= Start Task In Interactive Mode ============*/
  startTaskInInteractive() {
    if (this.selectedTriggerTreeItem?.deployed) {
      const dialogRef = this.dialog.open(RestartTaskComponent, {
        width: "800px",
        maxHeight: '95vh',
        height: '95%',
        data: {
          taskId: '',
          itemId: Number(this.selectedTriggerTreeItem?.id),
          isStart: true,
          isInteractive: true,
          item: this.triggerDetails,
          itemType: 'Trigger'
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
            tiesItemID: Number(this.selectedTriggerTreeItem?.id),
            parameters: result?.parameters,
            teisItemType: this.selectedTriggerTreeItem?.nodeType,
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
        item: this.triggerDetails,
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
    let content = 'Trigger Item';
    if (this.triggerDetails?.lockedUserName || this.triggerDetails?.disable || !this.selectedTriggerTreeItem?.deployed || this.triggerDetails?.activatorEnabled) {
      content += '\n\n';
      content += 'Note:';
    }
    if (this.triggerDetails?.lockedUserName) {
      content += ` locked by: ${this.triggerDetails?.lockedUserName} at ${this.triggerDetails?.lockedDate}.`;
    }
    if (this.triggerDetails?.disable) {
      content += ` Item disabled, will never be activated.`;
    }

    if (!this.selectedTriggerTreeItem?.deployed) {
      content += ` No version deployed yet, showing working copy.`;
    }

    if (this.triggerDetails?.activatorEnabled) {
      content += ` Activator enabled.`;
    }

    content += `\n\n   Name: ${this.triggerDetails?.name} (Ver. ${this.triggerDetails?.versionNumber})\n`;
    content += `   Description: ${(this.triggerDetails?.description ? this.triggerDetails?.description : '-')} \n\n`;

    if (this.triggerDetails?.updateTaskList) {
      content += `General information:\n`;
      content += `   Trigger will only show logs when an integration is activated.\n\n`;
    }

    if (this.triggerDetails?.alertProcessName) {
      content += `Alert process: ${(this.triggerDetails?.alertProcessName)} \n\n`;
    }

    if (this.triggerDetails?.identifiers?.length) {
      content += 'Connected Identifiers methods\n';

      this.triggerDetails.identifiers.forEach((item, index) => {
        content += `  ${index + 1}. Name: ${item?.methodName || '-'}\n`;

        const params = item?.identifierParams?.map(p => p?.parameterName);
        if (params?.length) {
          content += `     Parameters: ${params.join(', ')}\n`;
        } else {
          content += `     Parameters: -\n`;
        }
      });

      content += '\n';
    }

    if (this.triggerDetails?.paramsData?.length) {
      content += 'Parameter Settings\n';

      this.triggerDetails.paramsData.forEach(param => {
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

    if (this.triggerDetails?.configData?.length) {
      content += 'Configurations\n';

      this.triggerDetails.configData.forEach((config, index) => {
        content += `    ${index + 1}. ${config.configValue}\n`;
      });

      content += '\n';
    }

    if (this.triggerDetails?.scriptList?.length) {
      content += 'Connected executables\n';

      this.triggerDetails.scriptList.forEach((exe, i) => {
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
    }

    if (this.triggerDetails?.schedulerList?.length) {
      content += 'Activation Schedulers\n';

      this.triggerDetails.schedulerList.forEach((item, index) => {
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
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    a.download = `GeneralSummaryTrigger_${timestamp}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  /*=============== End Generate General Summary text file ===============*/

  ngOnDestroy(): void {
    this.getWorkspaceTreeSub.unsubscribe();
    this.getTriggerDetailsSub.unsubscribe();
    this.markAllTaskAsCompletedSub.unsubscribe();
    this.deployTriggerItemsSub.unsubscribe();
    this.getTriggerItemStatusSub.unsubscribe(); //trigger?
    this.getDeployedIntegrationByTriggerIdSub.unsubscribe();
    this.unDeployTriggerItemsSub.unsubscribe();
    this.deleteTriggerFolderSub.unsubscribe();
    this.deleteTriggerItemSub.unsubscribe();
    this.getTriggerByIdSub.unsubscribe();
    this.stopAllTasksSub.unsubscribe();
    this.taskStartSub.unsubscribe();
    this.enableDisableTriggerSub.unsubscribe();
    this.createTaskSub.unsubscribe();
    this.getScriptDeployStatusSub.unsubscribe();
    this.lockInfoAndDebugParamSub.unsubscribe();
    this.getScriptByIdSub.unsubscribe();
    this.workspaceTreeItemCount.unsubscribe();
    this.getUserSettingsSub.unsubscribe();
  }
}
