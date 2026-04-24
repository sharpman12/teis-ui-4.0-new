import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectorRef
} from "@angular/core";
import { MessageService, TreeNode } from "primeng/api";
import { Appintitemtree } from "../appintitemtree";
import { EMPTY, forkJoin, Subject, Subscription } from "rxjs";
import { AppIntegrationService } from "../app-integration.service";
import { AppIntegrationDataService } from "../app-integration-data.service";
import { Router } from "@angular/router";
import { AppIntServiceLogComponent } from "../app-int-service-log/app-int-service-log.component";
import { AppIntEventLogComponent } from "../app-int-event-log/app-int-event-log.component";
import {
  AppliedFilters,
  DeployUndeployItemsDto,
  MarkAllTaskAsCompletedDto,
  SelectedItemDto,
  TaskDetailsDto,
  TeisItemDto,
  UserAccessValidationDto
} from "../appintegration";
import { Constants } from "src/app/shared/components/constants";
import { AppIntMarkAllAsCompletedComponent } from "../app-int-mark-all-as-completed/app-int-mark-all-as-completed.component";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { AppIntCreateFolderComponent } from "../app-int-create-folder/app-int-create-folder.component";
import { catchError, finalize, switchMap, take, tap } from "rxjs/operators";
import { ConfirmationComponent } from "src/app/shared/components/confirmation/confirmation.component";
import { RestartTaskComponent } from "src/app/task-management/restart-task/restart-task.component";
import { StartTaskDetailsDto, StopAllTasksDto } from "src/app/task-management/tasks-management/task-mgmt";
import { AppIntConfirmationComponent } from "../app-int-confirmation/app-int-confirmation.component";
import { AppIntPasteItemComponent } from "../app-int-paste-item/app-int-paste-item.component";
import { ScriptViewComponent } from "src/app/task-management/tasks-management/script-view/script-view.component";
import { AppIntMoveItemComponent } from "../app-int-move-item/app-int-move-item.component";
import { AppIntStopTasksComponent } from "../app-int-stop-tasks/app-int-stop-tasks.component";
import { ToTitleCaseService } from "src/app/shared/services/to-title-case.service";
import { SearchItemComponent } from "../search-item/search-item.component";
import { EncryptDecryptService } from "src/app/shared/services/encrypt-decrypt.service";
import { tr } from "date-fns/locale";
import { InteractiveModeComponent } from "../interactive-mode/interactive-mode.component";
import { DebugScriptEngineComponent } from "src/app/development/development/debug-script-engine/debug-script-engine.component";
import { ScriptStateService } from "src/app/shared/services/script-state.service";
import { DevelopmentService } from "src/app/development/development.service";
import { DomSanitizer } from "@angular/platform-browser";
import { KeycloakSecurityService } from "src/app/shared/services/keycloak-security.service";
import { TasksManagementService } from "src/app/task-management/tasks-management/tasks-management.service";
import { UserSettingService } from "src/app/dashboard/user-settings/user-setting.service";

@Component({
  selector: "app-process",
  templateUrl: "./process.component.html",
  styleUrls: ["./process.component.scss"],
})
export class ProcessComponent implements OnInit, OnDestroy {
  @Input() selectedWorkspaceId: number;
  @Input() getWorkspaceTreeObj: TaskDetailsDto;
  @Output() isActionPerformEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() integrationDetailEvent: EventEmitter<object> = new EventEmitter();
  @Output() showSearchItemEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() showFilterViewEvent: EventEmitter<boolean> = new EventEmitter();
  isLoading: boolean = false;
  currentUser: any;
  selectedProcessFile: TreeNode;
  activeProcessIndex = 0;
  processCurrentTabIndex = 0;
  selectedProcessFilterOption: Array<any> = [];
  WsProcessTree: Array<any> = [];
  processItemTree: TreeNode[] = [];
  processTreeItems: Array<any> = [];
  selectedProcessTreeItem: any = null;
  processDetails: any = null;
  processItemDeatils: any = null;
  itemIds: Array<SelectedItemDto>;
  integrationsByProcessId = [];
  isConnectedIntegrationsShow: boolean = false;
  isServiceFilterOpen = false;
  deployed: boolean = true;
  disabled: boolean = false;
  locked: boolean = false;
  belongsToFolderId: number = null;
  processTreeItemCount: number = null;
  filteredProcessItemCount: number = null;
  isProcessCopied: boolean = false;
  isParameterSettings: boolean = false;
  isActionBtnDisabled: boolean = true;
  isCRUDFPITAccess: boolean = false;
  isDeployUndeployFPITAccess: boolean = false;
  isMoveItemAccess: boolean = false;
  isStartStopMarkAsCompletedAccess: boolean = false;
  createdOrUpdatedPITItem: any = null;
  processItemStatus: any = null;
  isInParameters: boolean = true;
  isInParametersValue: boolean = false;
  isOutParamters: boolean = false;
  isHiddenParameters: boolean = false;
  processFilterOptions = [];
  isProcessReturnFilterVisible: boolean = false;
  isProcessSearchItemExist: boolean = false;
  isStatusLoading: boolean = false;
  isBack: boolean = false;
  getWorkspaceTreeSub = Subscription.EMPTY;
  getProcessByIdSub = Subscription.EMPTY;
  getProcessItemStatusSub = Subscription.EMPTY;
  getProcessDetailsSub = Subscription.EMPTY;
  getIntegrationByProcessIdSub = Subscription.EMPTY;
  getDeployedIntegrationByProcessIdSub = Subscription.EMPTY;
  markAllTaskAsCompletedSub = Subscription.EMPTY;
  deployProcessItemsSub = Subscription.EMPTY;
  unDeployProcessItemsSub = Subscription.EMPTY;
  unDeployIntegrationItemsSub = Subscription.EMPTY;
  deleteProcessFolderSub = Subscription.EMPTY;
  deleteProcessItemSub = Subscription.EMPTY;
  checkProcessIsConnectedToIntegrationSub = Subscription.EMPTY;
  pasteProcessSub = Subscription.EMPTY;
  taskStartSub = Subscription.EMPTY;
  stopTaskSub = Subscription.EMPTY;
  stopAllTasksSub = Subscription.EMPTY;
  moveItemSub = Subscription.EMPTY;
  getFolderByIdSub = Subscription.EMPTY;
  enableDisableProcessSub = Subscription.EMPTY;
  pitItemSubscription = Subscription.EMPTY;
  createTaskSub = Subscription.EMPTY;
  getScriptDeployStatusSub = Subscription.EMPTY;
  getValidateAccessSub = Subscription.EMPTY;
  private workspaceTreeItemCount = Subscription.EMPTY;
  private lockInfoAndDebugParamSub = Subscription.EMPTY;
  private getScriptByIdSub = Subscription.EMPTY;
  private getUserSettingsSub = Subscription.EMPTY;

  @ViewChild(AppIntServiceLogComponent, { static: false })
  serviceLogs: AppIntServiceLogComponent;
  @ViewChild(AppIntEventLogComponent, { static: false })
  eventLogs: AppIntEventLogComponent;

  private processTreeCalled$ = new Subject<{
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
    private scriptStateService: ScriptStateService,
    private developmentService: DevelopmentService,
    private sanitizer: DomSanitizer,
    private kcService: KeycloakSecurityService,
    private tasksManagementService: TasksManagementService,
    private userSettingService: UserSettingService,
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnInit(): void {
    if (this.appIntegrationDataService.getProcessFilter().length > 0) {
      this.processFilterOptions = this.appIntegrationDataService.getProcessFilter();
    } else {
      this.processFilterOptions = [
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

    setTimeout(() => {
      this.selectedProcessFilterOption = this.appIntegrationDataService.getSelectedProcessFilter();
    });

    this.appIntegrationService.returnFromOtherPage.pipe(take(1)).subscribe((isBack) => {
      if (isBack) {
        this.isBack = isBack;
        const selectedProcessId = this.appIntegrationDataService.getSelectedProcessId();
        const searchProcessItem = this.appIntegrationDataService.getProcessSearchItem();
        this.isProcessReturnFilterVisible = selectedProcessId ? true : false;
        this.isProcessSearchItemExist = searchProcessItem ? true : false;
        const existedFilters: AppliedFilters =
          this.appIntegrationDataService.getAppliedFilters();
        if (!existedFilters?.undeployed) {
          this.selectedProcessFilterOption.push(
            this.processFilterOptions[0].id
          );
        }
        if (existedFilters?.locked) {
          this.selectedProcessFilterOption.push(
            this.processFilterOptions[1].id
          );
        }
        if (existedFilters?.disabled) {
          this.selectedProcessFilterOption.push(
            this.processFilterOptions[2].id
          );
        }
      }
    });

    // Call worksapce tree API when any action performed
    this.processTreeCalled$.pipe(
      switchMap(({ taskDetailsDto, isSearching, isItemRemoved, isItemMoved }) => {
        this.isLoading = true;
        this.isStatusLoading = true;
        const itemCount = this.appIntegrationDataService.getProcessTreeItemCount();
        if (itemCount) {
          this.processTreeItemCount = itemCount;
        } else {
          this.getWorkspaceTreeItemCount(taskDetailsDto);
        }
        if (this.isProcessReturnFilterVisible) {
          this.isStatusLoading = false;
          this.processItemTree = [];
          this.appIntegrationDataService.clearProcessItemTree();
          this.appIntegrationDataService.clearProcessTreeItemCount();
          const taskDetailsDtoData = this.getTaskDetailsToggleSearchObject(taskDetailsDto);
          const selectedProcessId = this.appIntegrationDataService.getSelectedProcessId();

          this.getWorkspaceTreeSub = this.appIntegrationService.getWorkspaceTreeToggleSearch(taskDetailsDtoData).subscribe((res) => {
            this.isStatusLoading = false;
            this.WsProcessTree = res;
            const workspaceItems = res;
            if (workspaceItems?.length) {
              this.appIntegrationDataService.storeProcessItemTree(workspaceItems);
              workspaceItems.forEach((element) => {
                let nodeArray: TreeNode;
                nodeArray = new Appintitemtree(element, taskDetailsDto?.workspaceId);
                this.disabledTreeNode(nodeArray);
                this.expandTreeNode(nodeArray, true);
                this.updateTreeIcon(nodeArray);
                this.updateFolderIcon(nodeArray);
                this.getProcessTreeItems(nodeArray);
                this.processItemTree.push(nodeArray);
              });
              if (selectedProcessId) {
                if (this.processTreeItems?.length) {
                  this.processTreeItems.forEach((x: any) => {
                    if (Number(x?.id) === Number(selectedProcessId)) {
                      this.selectedProcessFile = x;
                      return false;
                    }
                  });
                  this.nodeSelect(this.selectedProcessFile);
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
          const processTree = this.appIntegrationDataService.getProcessItemTree();
          const expandedTree = this.appIntegrationDataService.getExpandedTree();
          const selectedTreeItem = this.appIntegrationDataService.getSelectedProcessItem();
          const taskDetailsDtoData = this.getTaskDetailsObject(taskDetailsDto);

          if (processTree?.length) {
            this.WsProcessTree = processTree;
            const workspaceItems = processTree;
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
                this.WsProcessTree = treeData;
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
                this.WsProcessTree = treeData;
                const workspaceItems = treeData;
                const expandedTree$ = this.appIntegrationDataService.getExpandedTree();
                const selectedTreeItem$ = this.appIntegrationDataService.getSelectedProcessItem();
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
        this.processTreeItemCount = res?.Count ?? 0;
        this.appIntegrationDataService.storeProcessTreeItemCount(this.processTreeItemCount);
      });
  }

  findNodeInTree(tree: any[], id: any): any {
    for (const node of tree) {
      if (node.id === id) {
        return node;
      }
      if (node.children) {
        const found = this.findNodeInTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  refreshDetails() {
    if (this.activeProcessIndex === 0) {
      if (
        this.selectedProcessTreeItem?.nodeType !== "WORKSPACE" &&
        this.selectedProcessTreeItem?.nodeType !== "FOLDER"
      ) {
        this.processDetails = null;
        this.getProcessItemDetails(this.selectedProcessTreeItem?.id);
        this.getProcessItemStatus(this.selectedProcessTreeItem?.id);
      }
    }
    if (this.activeProcessIndex === 1) {
      this.serviceLogs.refreshServiceLogs();
      this.serviceLogs.getServiceLog(this.itemIds);
    }
    if (this.activeProcessIndex === 2) {
      this.eventLogs.refreshEventLogs();
      this.eventLogs.getEventLog(this.itemIds);
    }
  }

  /*============ Get Item Status On Refresh ============*/
  getProcessItemStatus(itemId: number) {
    this.getProcessItemStatusSub = this.appIntegrationService.getPITItemStatus(itemId).subscribe((res) => {
      if (res) {
        const itemStatus = {
          failedCount: res?.itemStatusCount?.Failed,
          initiateCount: res?.itemStatusCount?.Initiate,
          processingCount: res?.itemStatusCount?.Processing,
          processingWithErrorCount: res?.itemStatusCount?.ProcessingWithError,
          hold: res?.itemStatusCount?.Hold,
          inputHold: res?.itemStatusCount?.InputHold
        };
        this.processItemStatus = itemStatus;

        this.updateCounts(this.processItemTree, itemId, itemStatus);

        if (this.selectedProcessTreeItem?.nodeType === 'PROCESS') {
          if (this.processItemStatus?.processingCount > 0) {
            this.selectedProcessTreeItem.icon = "success";
            return;
          }

          if (this.processItemStatus?.processingWithErrorCount > 0) {
            this.selectedProcessTreeItem.icon = "process_error";
            return;
          }

          if (this.processItemStatus?.failedCount > 0) {
            this.selectedProcessTreeItem.icon = "danger";
            this.updateParentIcons(this.selectedProcessTreeItem, 'close_folder_error', 'open_folder_error');
            return;
          }

          if (this.processItemStatus?.hold > 0) {
            this.selectedProcessTreeItem.icon = "fa fa-pause-circle-o text-warning";
            return;
          }

          if (this.processItemStatus?.inputHold > 0) {
            this.selectedProcessTreeItem.icon = "fa fa-pause-circle-o text-warning";
            return;
          }

          if (this.selectedProcessTreeItem?.disabled) {
            this.selectedProcessTreeItem.icon = "fa fa-stop-circle-o text-warning";
            return;
          }

          if (this.processItemStatus?.processingCount === 0 && this.processItemStatus?.processingWithErrorCount === 0 && this.processItemStatus?.failedCount === 0) {
            this.selectedProcessTreeItem.icon = "fa fa-cog";
            this.updateParentIcons(this.selectedProcessTreeItem, 'fa fa-folder', 'fa fa-folder-open');
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
      if (node.nodeType.toUpperCase() === 'PROCESS' && node.id === id) {
        node.failed = counts?.failedCount;
      }

      if (node.children && Array.isArray(node.children)) {
        this.updateCounts(node.children, id, counts);
      }
    });
  }

  /*============ Reset Process Filter Options ============*/
  resetProcessFilter() {
    if (this.appIntegrationDataService.getProcessFilter().length > 0) {
      this.processFilterOptions = this.appIntegrationDataService.getProcessFilter();

    } else {
      this.processFilterOptions = [
        { id: 1, name: "Undeployed", deleted: false },
        { id: 2, name: "Locked", deleted: false },
        { id: 3, name: "Disabled", deleted: false }
      ];
    }
  }

  reinitiateProcessProperties() {
    this.activeProcessIndex = 0;
    this.processCurrentTabIndex = 0;
    this.isProcessCopied = false;
    this.selectedProcessTreeItem = null;
    this.WsProcessTree = [];
    this.processItemTree = [];
    this.processDetails = null;
    this.processItemDeatils = null;
    this.selectedProcessFilterOption = [];
    this.resetProcessFilter();
  }

  toggleServiceFilter() {
    this.isServiceFilterOpen = !this.isServiceFilterOpen;
  }

  handleChange(index: number) {
    this.activeProcessIndex = index;
    this.appIntegrationDataService.storeProcessTabIndex(index);
    if (index === 0) {
    }
    if (index === 1) {
      this.serviceLogs.getServiceLog(this.itemIds);
    }
    if (index === 2) {
      this.eventLogs.getEventLog(this.itemIds);
    }
  }

  /*=========== Advanced Search ============*/
  searchItem() {
    const dialogRef = this.dialog.open(SearchItemComponent, {
      width: "600px",
      maxHeight: "600px",
      data: {
        itemType: 'Integration',
        currentFilters: this.processFilterOptions,
        selectedFilterItems: this.selectedProcessFilterOption
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isSearch) {
        result.id = this.processFilterOptions?.length + 1;
        result.name = result?.searchStr;
        result.deleted = true;
        this.processFilterOptions = [...this.processFilterOptions, result];
        this.selectedProcessFilterOption = [...this.selectedProcessFilterOption, result?.id];
        this.appIntegrationDataService.storeSelectedProcessFilter(this.selectedProcessFilterOption);
        this.appIntegrationDataService.storeProcessFilter(this.processFilterOptions);
        this.onChangeFilter();
      }
    });
  }

  processSelectionChange(newSelection: any[]) {
    const excludedIds = [1, 2, 3];
    const filteredSelection = newSelection.filter(id => !excludedIds.includes(id));
    if (filteredSelection.length > 3) {
      this.selectedProcessFilterOption.pop();
      this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: `You can select only three custom filters.` });
      this.selectedProcessFilterOption = [...this.selectedProcessFilterOption];
      return;
    }
    this.selectedProcessFilterOption = newSelection;
    this.onChangeFilter();
  }


  advancedProcessSearch(result) {
    if (result?.isSearch) {
      this.resetReturnToFilter();
      this.selectedProcessTreeItem = null;
      this.WsProcessTree = [];
      this.processItemTree = [];
      this.processDetails = null;
      this.processItemDeatils = null;
      this.appIntegrationDataService.clearProcessSearchItem();
      this.appIntegrationDataService.clearProcessItemTree();
      this.appIntegrationDataService.clearProcessTreeItemCount();
      this.appIntegrationDataService.clearSelectedProcessItem();
      const updatedResult = {
        ...result,
        id: this.processFilterOptions?.length + 1,
        name: result?.searchStr,
        deleted: true
      };
      this.processFilterOptions = [...this.processFilterOptions, updatedResult];
      this.selectedProcessFilterOption = [updatedResult?.id];
      this.appIntegrationDataService.storeSelectedProcessFilter(this.selectedProcessFilterOption);
      this.appIntegrationDataService.storeProcessFilter(this.processFilterOptions);
      this.getWorkspaceTreeObj.itemType = 'Process';
      this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
    }
  }

  removeOption(item: any, event: Event) {
    event.stopPropagation(); // Prevents ng-select from selecting the option

    // Remove the item from the integrationFilterOptions list
    this.processFilterOptions = this.processFilterOptions.filter(opt => opt.id !== item.id);
    this.appIntegrationDataService.storeProcessFilter(this.processFilterOptions);
    // Also remove it from the selected values (if it's already selected)
    if (this.selectedProcessFilterOption.includes(item.id)) {
      this.selectedProcessFilterOption = this.selectedProcessFilterOption.filter(id => id !== item.id);
      this.onChangeFilter();
    }
  }

  /*=========== On Change Filter ===========*/
  onChangeFilter() {
    this.selectedProcessTreeItem = null;
    this.WsProcessTree = [];
    this.processItemTree = [];
    this.processDetails = null;
    this.processItemDeatils = null;
    this.appIntegrationDataService.clearProcessItemTree();
    this.appIntegrationDataService.clearProcessTreeItemCount();
    this.appIntegrationDataService.clearSelectedProcessItem();
    this.appIntegrationDataService.storeSelectedProcessFilter(this.selectedProcessFilterOption);
    this.appIntegrationDataService.storeProcessFilter(this.processFilterOptions);
    // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
  }
  /*============== End On Change Filter ===========*/


  getTaskDetailsObject(taskDetailsDto,) {
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

    this.selectedProcessFilterOption = this.appIntegrationDataService.getSelectedProcessFilter();
    if (this.selectedProcessFilterOption?.length) {
      this.selectedProcessFilterOption.forEach((item) => {
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
          const advancedProcessSearchArr = [];
          const processFilteredArray = this.processFilterOptions
            .filter(item => this.selectedProcessFilterOption.includes(item.id));
          if (processFilteredArray?.length) {
            processFilteredArray.forEach((q) => {
              if (q?.isSearch) {
                advancedProcessSearchArr.push({
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
            const advancedSearchItem = this.processFilterOptions.find((x) => Number(item) === Number(x?.id));
            taskDetailsDto.inAllParameters = advancedSearchItem?.parameters;
            // taskDetailsDto.inParameterName = advancedSearchItem?.parameterName;
            // taskDetailsDto.inParameterValue = advancedSearchItem?.parameterValue;
            taskDetailsDto.inIdentifier = advancedSearchItem?.identifiers;
            taskDetailsDto.inNetUser = advancedSearchItem?.netUsers;
            taskDetailsDto.inItemName = advancedSearchItem?.itemName;
            taskDetailsDto.inItemDescription = advancedSearchItem?.itemDescription;
            taskDetailsDto.advanceSearch = advancedSearchItem?.isSearch;
            taskDetailsDto.advanceInputSearch = advancedSearchItem?.searchStr;
            taskDetailsDto.advanceSearchFilters = advancedProcessSearchArr;
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
    //this.appIntegrationDataService.storeSelectedProcessItem(null);
    const hasSearchText = !!taskDetailsDto?.itemName?.trim();
    taskDetailsDto.searchInNameAndDesc = hasSearchText ? taskDetailsDto.searchInNameAndDesc : false;
    return taskDetailsDto;

  }

  getTaskDetailsToggleSearchObject(taskDetailsDto) {
    const selectedProcessId = this.appIntegrationDataService.getSelectedProcessId();
    this.deployed = true;
    this.disabled = false;
    this.locked = false;
    taskDetailsDto.deployed = this.deployed;
    taskDetailsDto.locked = this.locked;
    taskDetailsDto.disabled = this.disabled;
    taskDetailsDto.toggleSearchItem = Number(selectedProcessId);
    taskDetailsDto.searchInNameAndDesc = false;
    return taskDetailsDto;
  }

  /*================= Refresh Workspace Item Tree ==================*/
  refreshTree() {
    this.processItemTree = [];
    this.appIntegrationDataService.clearProcessItemTree();
    this.appIntegrationDataService.clearProcessTreeItemCount();
    // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
  }

  showFilterView() {
    this.appIntegrationDataService.clearProcessItemTree();
    this.appIntegrationDataService.clearProcessTreeItemCount();
    if (this.appIntegrationDataService.getProcessSearchItem()) {
      this.showFilterViewEvent.emit(true);
      this.getWorkspaceTreeObj.itemName = "";
      this.appIntegrationDataService.clearProcessSearchItem();
      // this.appIntegrationDataService.clearProcessItemTree();
    }
    this.isProcessReturnFilterVisible = false;
    this.isProcessSearchItemExist = false;
    this.appIntegrationDataService.clearSelectedProcessId();
    this.processItemTree = [];
    this.showSearchItemEvent.emit(true);
    // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
    this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
  }

  processSearchItemExist() {
    this.isProcessSearchItemExist = true;
  }

  resetReturnToFilter() {
    this.isProcessReturnFilterVisible = false;
    this.isProcessSearchItemExist = false;
  }

  getProcessDetails(getWorkspaceTreeObj, processId) {
    this.isProcessReturnFilterVisible = true;
    const selectedProcessId = this.isProcessReturnFilterVisible ? processId : null;
    this.appIntegrationDataService.storeSelectedProcessId(selectedProcessId);
    // this.getWorkspaceTree(getWorkspaceTreeObj, false, false, false);
    this.getProcessTree(getWorkspaceTreeObj, false, false, false);
  }

  toggleLinkVisibility() {
    if (this.isProcessReturnFilterVisible) {
      this.appIntegrationDataService.clearSelectedProcessId();
      this.isProcessReturnFilterVisible = false;
      this.processItemTree = [];
    }
    this.isProcessReturnFilterVisible = false; // Toggle the visibility when clicked
  }

  /*================= Get Workspace Item Tree ==================*/
  getProcessTree(taskDetailsDto: TaskDetailsDto, isSearching: boolean, isItemRemoved: boolean, isItemMoved: boolean) {
    this.isStatusLoading = false;
    this.appIntegrationDataService.clearProcessTreeItemCount();
    this.processTreeCalled$.next({ taskDetailsDto, isSearching, isItemRemoved, isItemMoved });

    // this.isLoading = true;
    // this.isStatusLoading = true;
    // if (this.isProcessReturnFilterVisible) {
    //   this.isStatusLoading = false;
    //   const taskDetailsDtoData = this.getTaskDetailsToggleSearchObject(taskDetailsDto);
    //   const selectedProcessId = this.appIntegrationDataService.getSelectedProcessId();

    //   this.getWorkspaceTreeSub = this.appIntegrationService.getWorkspaceTreeToggleSearch(taskDetailsDtoData).subscribe((res) => {
    //     this.isStatusLoading = false;
    //     this.WsProcessTree = res;
    //     const workspaceItems = res;
    //     if (workspaceItems?.length) {
    //       this.appIntegrationDataService.storeProcessItemTree(workspaceItems);
    //       workspaceItems.forEach((element, i) => {
    //         let nodeArray: TreeNode;
    //         nodeArray = new Appintitemtree(element, taskDetailsDto?.workspaceId);
    //         this.disabledTreeNode(nodeArray);
    //         this.expandTreeNode(nodeArray, true);
    //         this.updateTreeIcon(nodeArray);
    //         this.updateFolderIcon(nodeArray);
    //         this.getProcessTreeItems(nodeArray);
    //         this.processItemTree.push(nodeArray);
    //       });

    //       if (selectedProcessId) {
    //         if (this.processTreeItems?.length) {
    //           this.processTreeItems.forEach((x: any) => {
    //             if (Number(x?.id) === Number(selectedProcessId)) {
    //               this.selectedProcessFile = x;
    //               return false;
    //             }
    //           });
    //           this.nodeSelect(this.selectedProcessFile);
    //         }
    //       }
    //     }
    //     this.isLoading = false;
    //   }, (err: HttpErrorResponse) => {
    //     if (err.error instanceof Error) {
    //       // handle client side error here
    //     } else {
    //       // handle server side error here
    //     }
    //   });
    // } else {
    //   const treeData: any[] = [];   // UI tree
    //   const statusData: any[] = [];
    //   const processTree = this.appIntegrationDataService.getProcessItemTree();
    //   const expandedTree = this.appIntegrationDataService.getExpandedTree();
    //   const selectedTreeItem = this.appIntegrationDataService.getSelectedProcessItem();
    //   const taskDetailsDtoData = this.getTaskDetailsObject(taskDetailsDto);

    //   if (processTree?.length) {
    //     this.WsProcessTree = processTree;
    //     const workspaceItems = processTree;
    //     this.workspaceTree(taskDetailsDto, expandedTree, selectedTreeItem, isSearching, isItemRemoved, isItemMoved, workspaceItems);
    //     this.isLoading = false;
    //   } else {
    //     // Call both APIs simultaneously
    //     const tree$ = this.appIntegrationService.getWorkspaceTree(taskDetailsDtoData).pipe(
    //       tap((tree) => {
    //         treeData.push(...tree);
    //         this.WsProcessTree = treeData;
    //         const workspaceItems = treeData;
    //         this.workspaceTree(taskDetailsDto, expandedTree, selectedTreeItem, isSearching, isItemRemoved, isItemMoved, workspaceItems);
    //         this.isLoading = false;
    //       }));

    //     const status$ = this.appIntegrationService.getTreeItemStatus(taskDetailsDto).pipe(
    //       tap((status) => {
    //         statusData.push(...status);
    //       }));

    //     // Execute both
    //     forkJoin([tree$, status$]).subscribe(([tree, status]) => {
    //       this.mergeStatusIntoTree(treeData, statusData);
    //       this.WsProcessTree = treeData;
    //       const workspaceItems = treeData;
    //       const selectedTreeItem$ = this.appIntegrationDataService.getSelectedProcessItem();
    //       const expandedTree$ = this.appIntegrationDataService.getExpandedTree();
    //       this.workspaceTree(taskDetailsDto, expandedTree$, selectedTreeItem$, isSearching, isItemRemoved, isItemMoved, workspaceItems);
    //       this.isLoading = false;
    //       this.isStatusLoading = false;
    //     });
    //   }
    // }
  }

  calculateProcessTreeItems(tree: any[]): number {
    let count = 0;

    for (const node of tree) {
      if (node.type === 'PROCESS') {
        count++;
      }

      if (node.children && node.children.length > 0) {
        count += this.calculateProcessTreeItems(node.children);
      }
    }

    return count;
  }

  workspaceTree(taskDetailsDto: any, expandedTree: any[], selectedTreeItem: any, isSearching: boolean, isItemRemoved: boolean, isItemMoved: boolean, workspaceItems: any[]) {
    this.processItemTree = [];
    if (workspaceItems?.length) {
      this.appIntegrationDataService.storeProcessItemTree(workspaceItems);
      this.filteredProcessItemCount = this.calculateProcessTreeItems(workspaceItems);
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
        this.getProcessTreeItems(nodeArray);
        this.processItemTree.push(nodeArray);
      });
      // Code for get updated item details after performing any action except Remove Item action
      if (isItemRemoved) {
        if (selectedTreeItem) {
          if (this.processTreeItems?.length) {
            this.processTreeItems.forEach((item: any) => {
              if (Number(item?.id) === Number(selectedTreeItem?.parent?.id)) {
                this.selectedProcessFile = item;
                return false;
              }
            });
            this.nodeSelect(this.selectedProcessFile);
          }
        }
      } else {
        if (selectedTreeItem) {
          if (this.processTreeItems?.length) {
            this.processTreeItems.forEach((x: any) => {
              if (Number(x?.id) === Number(selectedTreeItem?.id)) {
                this.selectedProcessFile = x;
                return false;
              }
            });
            this.nodeSelect(this.selectedProcessFile);
          }
        } else {
          this.selectedProcessTreeItem = null;
          this.appIntegrationDataService.clearSelectedProcessItem();
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
    if (!this.processItemTree?.length) {
      this.isLoading = true;
      if (this.isProcessReturnFilterVisible) {
        const taskDetailsDtoData = this.getTaskDetailsToggleSearchObject(taskDetailsDto);
        const selectedProcessId = this.appIntegrationDataService.getSelectedProcessId();
        this.getWorkspaceTreeSub = this.appIntegrationService.getWorkspaceTreeToggleSearch(taskDetailsDtoData).subscribe((res) => {
          this.WsProcessTree = res;
          const workspaceItems = res;
          if (workspaceItems?.length) {
            this.appIntegrationDataService.storeProcessItemTree(workspaceItems);
            workspaceItems.forEach((element, i) => {
              let nodeArray: TreeNode;
              nodeArray = new Appintitemtree(element, taskDetailsDto?.workspaceId);
              this.disabledTreeNode(nodeArray);
              this.expandTreeNode(nodeArray, true);
              this.updateTreeIcon(nodeArray);
              this.updateFolderIcon(nodeArray);
              this.getProcessTreeItems(nodeArray);
              this.processItemTree.push(nodeArray);
            });

            if (selectedProcessId) {
              if (this.processTreeItems?.length) {
                this.processTreeItems.forEach((x: any) => {
                  if (Number(x?.id) === Number(selectedProcessId)) {
                    this.selectedProcessFile = x;
                    return false;
                  }
                });
                this.nodeSelect(this.selectedProcessFile);
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
        const expandedTree = this.appIntegrationDataService.getExpandedTree();
        const selectedTreeItem = this.appIntegrationDataService.getSelectedProcessItem();
        const taskDetailsDtoData = this.getTaskDetailsObject(taskDetailsDto);
        this.getWorkspaceTreeSub = this.appIntegrationService.getWorkspaceTree(taskDetailsDtoData).subscribe((res) => {
          this.WsProcessTree = res;
          const workspaceItems = res;
          if (workspaceItems?.length) {
            this.appIntegrationDataService.storeProcessItemTree(workspaceItems);
            workspaceItems.forEach((element, i) => {
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
              this.getProcessTreeItems(nodeArray);
              this.processItemTree.push(nodeArray);
            });

            // Code for get updated item details after performing any action except Remove Item action
            if (isItemRemoved) {
              if (selectedTreeItem) {
                if (this.processTreeItems?.length) {
                  this.processTreeItems.forEach((item: any) => {
                    if (Number(item?.id) === Number(selectedTreeItem?.parent?.id)) {
                      this.selectedProcessFile = item;
                      return false;
                    }
                  });
                  this.nodeSelect(this.selectedProcessFile);
                }
              }
            } else {
              if (selectedTreeItem) {
                if (this.processTreeItems?.length) {
                  this.processTreeItems.forEach((x: any) => {
                    if (Number(x?.id) === Number(selectedTreeItem?.id)) {
                      this.selectedProcessFile = x;
                      return false;
                    }
                  });
                  this.nodeSelect(this.selectedProcessFile);
                }
              } else {
                this.selectedProcessTreeItem = null;
                this.appIntegrationDataService.clearSelectedProcessItem();
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
  }

  /*=========== Get Newly Created Item For Set Focus on It ===========*/
  getNewlyCreatedItem() {
    let newItem = null;
    this.pitItemSubscription = this.appIntegrationService.createdUpdatedPITItem.subscribe((res: any) => {
      if (res) {
        this.createdOrUpdatedPITItem = res;
        if (res?.isCreated) {
          if (this.processTreeItems?.length) {
            this.processTreeItems.forEach((x: any) => {
              if (Number(x?.id) === Number(this.createdOrUpdatedPITItem?.itemId)) {
                newItem = x;
                this.selectedProcessFile = newItem;
                this.nodeSelect(newItem);
                this.appIntegrationService.sharedCreatedUpdatedPITItem(null);
                const itemCount = this.appIntegrationDataService.getProcessTreeItemCount();
                this.processTreeItemCount = itemCount + 1;
                this.appIntegrationDataService.storeProcessTreeItemCount(this.processTreeItemCount);
                return false;
              }
            });
          }
        }
      }
    });

  }

  getProcessTreeItems(node: any) {
    this.processTreeItems.push(node);
    if (node?.children?.length) {
      node?.children.forEach((x: any, index: number) => {
        this.getProcessTreeItems(node.children[index]);
      });
    }
  }

  /*=========== Highlight Selected Node ===========*/
  highlightTreeNode(node: any) {
    const selectedNode = this.appIntegrationDataService.getSelectedProcessItem();
    if (this.createdOrUpdatedPITItem) {
      if (Number(node?.id) === Number(this.createdOrUpdatedPITItem?.itemId)) {
        return 'highlighted-node';
      }
    } else {
      if (Number(node?.id) === Number(selectedNode?.id)) {
        return 'highlighted-node';
      }
    }
    if (node?.children?.length) {
      node?.children.forEach((x: any, index: number) => {
        this.highlightTreeNode(node.children[index]);
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

  /*=========== Set Tree Node Expanded ===========*/
  private expandTreeNode(node: any, isFullyExpanded: boolean) {
    if (isFullyExpanded) {
      node.expanded = true;
    } else {
      if (node?.nodeType === "WORKSPACE" && node?.children?.length) {
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

  updateNodeById(nodeId, newProperties) {
    const tree = this.appIntegrationDataService.getProcessItemTree();
    const node = this.findNodeById(tree, nodeId);

    if (node) {
      // Update the node properties
      node.disabled = newProperties?.disabled;
      node.deployed = newProperties?.deployed;
    }
    this.appIntegrationDataService.storeProcessItemTree(tree)
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

  updateIconStatus(clickEvent: string, enabledDisable?: boolean) {
    switch (clickEvent) {
      case 'EnableDisable':
        if (enabledDisable) {
          //this.selectedProcessTreeItem.icon = "fa fa-stop-circle-o text-warning";
          this.selectedProcessTreeItem.disabled = true;
          this.processDetails.disable = true;
          this.getProcessItemStatus(this.selectedProcessTreeItem?.id);
          this.updateNodeById(this.selectedProcessTreeItem?.id, this.selectedProcessTreeItem);
        } else {
          //this.selectedProcessTreeItem.icon = "fa fa-cog";
          this.selectedProcessTreeItem.disabled = false;
          this.processDetails.disable = false;
          this.getProcessItemStatus(this.selectedProcessTreeItem?.id);
          this.updateNodeById(this.selectedProcessTreeItem?.id, this.selectedProcessTreeItem);
        }
        break;
      // You can add more cases for other events if needed
      case 'deploy':
        this.selectedProcessTreeItem.deployed = true;
        this.selectedProcessTreeItem.label = this.selectedProcessTreeItem.data;
        this.updateNodeById(this.selectedProcessTreeItem?.id, this.selectedProcessTreeItem);
        break;
      case 'undeploy':
        this.selectedProcessTreeItem.deployed = false;
        this.selectedProcessTreeItem.label = this.selectedProcessTreeItem.data + "*";
        this.updateNodeById(this.selectedProcessTreeItem?.id, this.selectedProcessTreeItem);
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
        if (childNode?.nodeType === "PROCESS") {
          if (childNode?.processing > 0) {
            childNode.icon = "success";
            // childNode.icon = "fa fa-cog text-success";
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
            // childNode.icon = "fa fa-cog text-danger";
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

    // If this is an PROCESS, check its statusCountMap
    if (node.nodeType === 'PROCESS' && node?.failed > 0) {
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
        const childHasError = current.children.some((child) => (child.nodeType.toUpperCase() === 'PROCESS' && child?.failed > 0) || (child.nodeType.toUpperCase() === 'FOLDER' && child?.hasError));

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
  storeExpandedTree() {
    this.appIntegrationDataService.storeExpandedTree(this.processItemTree);
  }
  /*============= END Store Expanded Tree Client Side =============*/



  /*============= Toggle Button for enable/disble Search Filter =============*/

  /*============= Tree Node Selection ============*/
  nodeSelect(item: any) {
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.processDetails = null;
    this.selectedProcessTreeItem = item;
    this.appIntegrationDataService.clearSelectedProcessItem();
    this.appIntegrationDataService.storeSelectedProcessItem(this.selectedProcessTreeItem);

    this.getProcessItemStatus(this.selectedProcessTreeItem?.id);

    this.storeExpandedTree();
    this.itemIds = [
      {
        workspaceId: this.getWorkspaceTreeObj?.workspaceId.toString(),
        itemId: this.selectedProcessTreeItem?.id,
        itemType: "Process",
      },
    ];
    if (item?.nodeType === "FOLDER") {
      this.belongsToFolderId = item?.id;
    }
    if (item?.nodeType !== "WORKSPACE" && item?.nodeType !== "FOLDER") {
      this.belongsToFolderId = item?.belongsToFolder;
      this.getProcessItemDetails(item?.id);

      // if (this.activeProcessIndex === 1) {
      //   this.serviceLogs.getServiceLog(this.itemIds);
      // }
      // if (this.activeProcessIndex === 2) {
      //   this.eventLogs.getEventLog(this.itemIds);
      // }
    }
  }
  /*============= END Tree Node Selection ============*/

  /*============= Tree Node Unselecting ============*/
  nodeUnselect(item: any) { }
  /*============= END Tree Node Unselecting ============*/

  /*============= Get Selected Tree Item Details ============*/
  getProcessById(processId: number) {
    this.getProcessByIdSub = this.appIntegrationService.getDeployedProcessById(Number(processId)).subscribe((res) => {
      if (res) {
        this.processItemDeatils = res;
        this.messageService.add({
          key: "appIntSuccessKey",
          severity: "success",
          summary: "",
          detail: `${this.selectedProcessTreeItem?.data} process copied successfully!`,
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

  getProcessItemDetails(processId: number) {
    // const itemDetails = this.appIntegrationDataService.getProcessTreeItemDetails(this.selectedWorkspaceId, processId);
    // if (itemDetails) {
    //   this.processDetails = itemDetails?.processDetails;
    //   if (this.processDetails?.paramsData?.length) {
    //     this.isParameterSettings = this.processDetails?.paramsData.some(x => x?.value);
    //   }
    //   this.getIntegrationByProcessId(itemDetails?.workspaceId, itemDetails?.processId);
    // } else {
    // }
    this.getProcessDetailsSub = this.appIntegrationService.getDeployedProcessById(Number(processId)).subscribe((res) => {
      if (res) {
        const processInfo = JSON.parse(JSON.stringify(res));
        if (this.isBack) {
          if (processInfo?.deployed) {
            this.updateIconStatus('deploy');
          } else {
            this.updateIconStatus('undeploy');
          }
        }

        if (processInfo?.scriptList?.length) {
          processInfo?.scriptList.forEach((item) => {
            if (item?.scriptParameterDataList?.length) {
              item.scriptParameterDataList = Array.from(new Map(
                item?.scriptParameterDataList.map(data => [data.parameterName.trim(), data])
              ).values());
              item?.scriptParameterDataList.forEach((x) => {
                x.value = null;
                if (processInfo?.paramsData?.length) {
                  processInfo?.paramsData.forEach((p) => {
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

        if (processInfo?.paramsData?.length) {
          processInfo?.paramsData.forEach((p) => {
            p.value = (p?.securityLevel === 'medium' || p?.securityLevel === 'high') ? this.encryptDecryptService.decrypt(p?.value) : p?.value;
          });
        }

        this.processDetails = processInfo;
        this.getConnectedExe();
        if (this.processDetails?.locked) {
          this.isActionBtnDisabled = false;
        } else {
          this.isActionBtnDisabled = true;
        }
        if (this.processDetails?.paramsData?.length) {
          this.isParameterSettings = this.processDetails?.paramsData.some(
            (x) => x?.value
          );
        }
        const processItemDetails = {
          workspaceId: this.selectedWorkspaceId,
          processId: processId,
          processDetails: this.processDetails,
        };
        this.appIntegrationDataService.storeProcessTreeItemDetails(
          processItemDetails
        );
        this.getIntegrationByProcessId(this.selectedWorkspaceId, processId);
        this.isBack = false;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*============= END Get Selected Tree Item Details ============*/

  /*============= Get Connected Executables ============*/
  getConnectedExe() {
    const res = this.processDetails;
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
                  params.value = x?.value;
                  params.value = params?.securityLevel.toLowerCase() === 'high' ? '*****' : x?.value;
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
    this.processDetails = res;
  }

  /*============= Get Integration By Process Id ============*/
  getIntegrationByProcessId(workspaceId: number, processId: number) {
    const processTabIndex = this.appIntegrationDataService.getProcessTabIndex();
    this.itemIds = [
      {
        workspaceId: this.getWorkspaceTreeObj?.workspaceId.toString(),
        itemId: this.selectedProcessTreeItem?.id,
        itemType: "Process",
      },
    ];
    this.integrationsByProcessId = [];
    const processIntegrationsList =
      this.appIntegrationDataService.getIntegrationsByProcessId(
        workspaceId,
        processId
      );
    if (processIntegrationsList) {
      this.integrationsByProcessId = processIntegrationsList?.processIntegrations;

      if (processTabIndex || processTabIndex === 0) {
        this.activeProcessIndex = processTabIndex;
        if (this.activeProcessIndex === 1) {
          setTimeout(() => {
            this.serviceLogs.getServiceLog(this.itemIds);
          }, 0);
        }
        if (this.activeProcessIndex === 2) {
          setTimeout(() => {
            this.eventLogs.getEventLog(this.itemIds);
          }, 0);
        }
      }
    } else {
      this.getIntegrationByProcessIdSub = this.appIntegrationService.getIntegrationProcessById(workspaceId, processId).subscribe((res) => {
        if (res?.length) {
          this.integrationsByProcessId = res;
          const processIntegrationLists = {
            workspaceId: workspaceId,
            processId: processId,
            processIntegrations: this.integrationsByProcessId,
          };
          this.appIntegrationDataService.storeIntegrationByProcessId(processIntegrationLists);
        }

        if (processTabIndex || processTabIndex === 0) {
          this.activeProcessIndex = processTabIndex;
          if (this.activeProcessIndex === 1) {
            setTimeout(() => {
              this.serviceLogs.getServiceLog(this.itemIds);
            }, 0);
          }
          if (this.activeProcessIndex === 2) {
            setTimeout(() => {
              this.eventLogs.getEventLog(this.itemIds);
            }, 0);
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
  }

  onToggle(value: string) {
    if (value === "CONNECTED_INTEGRATION") {
      this.isConnectedIntegrationsShow = !this.isConnectedIntegrationsShow;
    }
  }

  /*============= Process Properties =============*/
  processProperties() {
    this.storeAppliedFiltersAndTabNum();
    this.appIntegrationDataService.clearProcessParamsData();
    this.router.navigate([
      `application_integration/properties/process/${false}/${this.getWorkspaceTreeObj?.workspaceId
      }/${this.belongsToFolderId}/${this.selectedProcessTreeItem?.id}`,
    ]);
  }
  /*============= END Process Properties =============*/

  /*============= Navigate to Process Details =============*/
  navigateToIntegartionDetails(integration: any) {
    const userAccessValidationDto: UserAccessValidationDto = {
      userName: this.currentUser.userName,
      workspaceId: this.selectedWorkspaceId.toString(),
      itemType: 'integration',
      itemId: integration?.id,
      validateRootAccess: false,
      parentId: integration?.belongsToFolder
    }
    this.getValidateAccessSub = this.appIntegrationService.getValidateAccess(userAccessValidationDto).subscribe((res) => {
      if (res) {
        if (res?.hasAccess) {
          this.integrationDetailEvent.emit(integration?.id);
        } else {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: `User does not have access of ${integration.name} integration.` });

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
  /*============= End Get Process Details =============*/

  /*============= Add Process =============*/
  addProcess() {
    this.appIntegrationDataService.clearCurrentParamsData();
    this.appIntegrationDataService.clearCurrentTriggerConfigParamsData();
    this.appIntegrationService.sharedAdditionalScriptParams([]);
    this.appIntegrationDataService.clearProcessParamsData();
    this.storeAppliedFiltersAndTabNum();
    this.router.navigate([
      `application_integration/item/process/${true}/${this.getWorkspaceTreeObj?.workspaceId
      }/${this.belongsToFolderId}/${this.selectedProcessTreeItem?.id}`,
    ]);
  }
  /*============= END Add Process =============*/

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
        itemId: Number(this.selectedProcessTreeItem?.id),
        isStart: true,
        isInteractive: false,
        item: this.processDetails,
        itemType: 'Process'
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
      tiesItemID: Number(this.selectedProcessTreeItem?.id),
      parameters: startTaskDto?.parameters,
      teisItemType: this.selectedProcessTreeItem?.nodeType,
      updatedTriggerConfigList: updatedTriggerConfigList,
    };
    this.taskStartSub = this.appIntegrationService.startTask(startTaskDetailsDto).subscribe((res) => {
      if (res) {
        //this.processItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        //this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
        this.getProcessItemStatus(this.selectedProcessTreeItem?.id);
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

  /*============= Stop Task ==============*/
  stopTasks() {
    let executionState: string = "";
    if (this.selectedProcessTreeItem?.processing > 0) {
      executionState = "Processing";
      this.selectedProcessTreeItem.processingWithError = 0;
    }
    if (this.selectedProcessTreeItem?.processingWithError > 0) {
      executionState = "ProcessingWithError";
    }

    const dialogRef = this.dialog.open(AppIntStopTasksComponent, {
      width: "45vw",
      maxHeight: "600px",
      data: {
        processId: this.processDetails?.id,
        executionState: executionState,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result?.isStop) {
          result?.stopTasksList?.stopTaskList.forEach((item) => {
            item.workspaceId = this.getWorkspaceTreeObj?.workspaceId;
          });
          const taskUpdateDto = result?.stopTasksList?.stopTaskList;
          this.stopTaskSub = this.appIntegrationService.stopTask(taskUpdateDto).subscribe((res) => {
            if (res) {
              this.messageService.add({
                key: "appIntSuccessKey",
                severity: "success",
                summary: "",
                detail: "Task Stopped Successfully!",
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
      }
    });
  }

  /*============= Stop All Tasks Async Call ==============*/
  stopAllTasksAsync() {
    const dialogRef = this.dialog.open(AppIntStopTasksComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        itemIdList: this.itemIds,
        isSelectAll: true,
        nodeType: this.selectedProcessTreeItem?.nodeType
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isStop) {
        this.stopAllTasks(result);
      }
    });
  }

  /*============= Stop All Tasks ===============*/
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
      itemIdList: [Number(this.selectedProcessTreeItem?.id)]
    };
    this.stopAllTasksSub = this.appIntegrationService.stopAllTask(stopAllTasksObj).subscribe(res => {
      if (res) {
        // this.processItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        // this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
        this.getProcessItemStatus(this.selectedProcessTreeItem?.id);
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
  /*============= Stop All Tasks ===============*/

  /*============= Copy Process =============*/
  copyProcessItem() {
    this.isProcessCopied = true;
    this.getProcessById(this.selectedProcessTreeItem?.id);
  }
  /*============= END Copy Process =============*/

  confirmAndPasteProcess() {
    if (this.processItemDeatils?.defaultAlert) {
      const dialogRef = this.dialog.open(ConfirmationComponent, {
        width: '700px',
        maxHeight: '600px',
        data: `A default alert process already exists in the workspace. The process cannot be copied as another default alert. Do you want to continue copying it as a normal alert process instead?`
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.pasteProcessItem();
        }
      });
    } else {
      this.pasteProcessItem();
    }
  }

  /*============= Paste Process =============*/
  pasteProcessItem() {
    const processDetails = this.processItemDeatils;
    const dialogRef = this.dialog.open(AppIntPasteItemComponent, {
      width: "500px",
      maxHeight: "600px",
      data: {
        name: processDetails?.name ? processDetails?.name : "",
        description: processDetails?.description
          ? processDetails?.description
          : "",
        belongsToFolder:
          this.selectedProcessTreeItem?.nodeType === "FOLDER"
            ? this.selectedProcessTreeItem?.id
            : null,
        itemType: "PROCESS",
        workspaceId: this.getWorkspaceTreeObj?.workspaceId
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isPaste) {
        this.isProcessCopied = false;
        const createProcessDto: TeisItemDto = {
          alertProcess: processDetails?.alertProcess,
          defaultAlert: (processDetails?.defaultAlert === true) ? false : processDetails?.defaultAlert,
          name: result?.name,
          id: null,
          createAndDeploy: false,
          description: result?.description,
          disabled: processDetails?.disabled,
          updateTaskList: processDetails?.updateTaskList,
          enableAlert: processDetails?.enableAlert,
          alertProcessId: processDetails?.alertProcessId,
          alertProcessName: processDetails?.alertProcessName,
          scriptEngineGroup: processDetails?.scriptEngineGroup,
          scriptEngine: processDetails?.scriptEngine,
          queue: processDetails?.queue,
          netUsersDto: processDetails?.netUsersDto,
          netUserMapping: processDetails?.netUserMapping,
          oldFileName: processDetails?.oldFileName,
          logMaintenanceId: processDetails?.logMaintenanceId,
          alertId: processDetails?.alertId,
          alertEnabled: processDetails?.alertEnabled,
          scheduled: processDetails?.scheduled,
          modified: processDetails?.modified,
          deployed: processDetails?.deployed,
          folder: processDetails?.folder,
          type: processDetails?.type,
          folderDataList: null,
          workspaceId: result?.workspaceId,
          autoStart: processDetails?.autoStart,
          interactiveMode: processDetails?.interactiveMode,
          showDebugMsg: processDetails?.showDebugMsg,
          disable: processDetails?.disable,
          logLevel: processDetails?.logLevel,
          priority: processDetails?.priority,
          iconId: processDetails?.iconId,
          belongsToFolder: result?.belongsToFolder,
          deleted: processDetails?.deleted,
          scriptEngineKey: processDetails?.scriptEngineKey,
          imageIconName: processDetails?.imageIconName,
          failedTaskCount: processDetails?.failedTaskCount,
          initiateTaskCount: processDetails?.initiateTaskCount,
          processingTaskCount: processDetails?.processingTaskCount,
          processingErrorTaskCount: processDetails?.processingErrorTaskCount,
          lastUpdated: "",
          updatedBy: this.currentUser?.userName,
          versionCount: processDetails?.versionCount,
          deployedVersion: processDetails?.deployedVersion,
          versionNumber: processDetails?.versionNumber,
          thisDeployedVersion: processDetails?.thisDeployedVersion,
          disabledSchedulerOrAlarm: processDetails?.disabledSchedulerOrAlarm,
          releasePressed: processDetails?.releasePressed,
          paramsData: (processDetails?.paramsData && processDetails?.paramsData?.length) ? processDetails?.paramsData : [],
          scriptList: processDetails?.scriptList,
          scripts: processDetails?.scriptList,
          teisFolders: processDetails?.teisFolders,
        };
        this.pasteProcessSub = this.appIntegrationService.createProcess(createProcessDto).subscribe((res) => {
          if (res) {
            this.processItemTree = [];
            this.appIntegrationService.sharedCreatedUpdatedPITItem({ isCreated: true, itemId: res?.processId });
            // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
            this.appIntegrationDataService.clearProcessItemTree();
            this.appIntegrationDataService.clearProcessTreeItemCount();
            this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
            this.messageService.add({
              key: "appIntSuccessKey",
              severity: "success",
              summary: "",
              detail: `${result?.name} process paste successfully!`,
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
  /*============= END Paste Process =============*/

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
      itemIdList: [this.selectedProcessTreeItem?.id],
      note: `Marked complete by ${this.currentUser?.firstName ? this.currentUser?.firstName : ""
        } ${this.currentUser?.lastName ? this.currentUser?.lastName : ""
        }: ${comment}`,
      taskIdList: [],
      updatedBy: this.currentUser?.userName,
    };
    this.markAllTaskAsCompletedSub = this.appIntegrationService.markTaskAsCompleted(markTaskCompletedDto).subscribe((res) => {
      if (res) {
        //this.processItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        //this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
        this.getProcessItemStatus(this.selectedProcessTreeItem?.id);
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
    }
    );
  }
  /*================= END Mark All Task As Completed ==================*/

  /*================= Move Items ================*/
  moveItem() {
    const dialogRef = this.dialog.open(AppIntMoveItemComponent, {
      width: "90vw",
      maxHeight: "95vh",
      data: {
        itemType: "Process",
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
        processTree: this.WsProcessTree
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isMove) {
        this.processItemTree = [];
        //this.appIntegrationService.sharedCreatedUpdatedPITItem({ isCreated: true, itemId: result?.sourceFolder });

        if (this.processTreeItems?.length) {
          this.processTreeItems.forEach((x: any) => {
            // if (Number(x?.id) === Number(this.createdOrUpdatedPITItem?.itemId)) {
            if (Number(x?.id) === Number(result?.sourceFolder)) {
              this.selectedProcessTreeItem = x;
              // this.nodeSelect(x);
              this.appIntegrationDataService.storeSelectedProcessItem(this.selectedProcessTreeItem);
              return false;
            }
          });
        }
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, true);
        this.appIntegrationDataService.clearProcessItemTree();
        this.appIntegrationDataService.clearProcessTreeItemCount();
        this.getProcessTree(this.getWorkspaceTreeObj, false, false, true);
      }
    });
  }
  /*================= END Move Items ================*/

  /*============= Deploy Workspace Items =============*/
  deployProcessItems() {
    if (this.selectedProcessTreeItem?.nodeType === "FOLDER") {
      if (this.selectedProcessTreeItem?.children?.length <= 0) {
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
    if (this.processDetails?.locked) {
      this.messageService.add({
        key: "appIntInfoKey",
        severity: "success",
        summary: "",
        detail: `Process can not be deployed because it is locked by ${this.processDetails?.lockedUserName}`,
      });
    } else {
      if (this.selectedProcessTreeItem?.nodeType === "FOLDER") {
        this.deployProcessItem();
      } else {
        const processExecutablesIds = this.processDetails?.scriptList.map(item => item.id);
        this.getScriptDeployStatusSub = this.appIntegrationService.getScriptDeployStatus(processExecutablesIds).subscribe((res) => {
          const hasDeployedFalse = res.some(script => script.deployed === false);
          if (hasDeployedFalse) {
            this.messageService.add({
              key: "appIntErrorKey",
              severity: "error",
              summary: "",
              detail: `Error in process deploy. One or more connected executables are not deployed.`,
            });
          } else {
            this.deployProcessItem();
          }
        });

      }

    }
  }
  /*============= END Deploy Workspace Items =============*/

  deployProcessItem() {
    const deployItemsDto: DeployUndeployItemsDto = {
      workspaceId: this.getWorkspaceTreeObj?.workspaceId,
      deploymentDetails: [
        {
          teisItemID: this.selectedProcessTreeItem?.id,
          teisItemType: "Process",
          teisVersionNumber: this.processDetails?.deployedVersion > 0 ? this.processDetails?.deployedVersion : this.processDetails?.versionNumber
        },
      ],
    };

    this.deployProcessItemsSub = this.appIntegrationService.deployItems(
      deployItemsDto,
      "Process",
      this.selectedProcessTreeItem?.id,
      this.selectedProcessTreeItem?.nodeType
    ).subscribe((res) => {
      const nodeType = this.toTitleCaseService.convertToTitleCase(this.selectedProcessTreeItem?.nodeType);
      //this.processItemTree = [];
      // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      // this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
      if (this.selectedProcessTreeItem?.nodeType !== 'FOLDER') {
        this.updateIconStatus('deploy');
      } else {
        this.appIntegrationDataService.clearProcessItemTree();
        this.appIntegrationDataService.clearProcessTreeItemCount();
        this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
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

  /*============= Undeploy Workspace Items =============*/
  unDeployProcessItems() {
    if (this.selectedProcessTreeItem?.nodeType === "FOLDER") {
      if (this.selectedProcessTreeItem?.children?.length <= 0) {
        this.messageService.add({
          key: "appIntInfoKey",
          severity: "success",
          summary: "",
          detail: "No item(s) to undeploy. Folder is empty.",
        });
      } else {
        const dialogRef = this.dialog.open(AppIntConfirmationComponent, {
          width: "700px",
          maxHeight: "600px",
          data: {
            title: `The processes in this folder might have connected integration(s). Please undeploy each process seperately.`,
            subtext: ``,
            actiontext: ``,
            actionsubtext: ``,
            isShowSingleBtn: true
          },
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
          }
        });
      }
    } else {
      this.undeployItems();
    }
  }

  undeployItems() {
    const connectedIntegrationArr = [];
    this.getDeployedIntegrationByProcessIdSub = this.appIntegrationService.getDeployedIntegrationProcessById(this.selectedProcessTreeItem?.id).subscribe((res) => {
      if (res?.length) {
        let integrationNames = "";
        for (let i = 0; i < res?.length; i++) {
          integrationNames += `${res[i]?.name}<br/>`;

          const connectedIntgrationObj = {
            teisItemID: res[i]?.id,
            teisItemType: "Integration",
            teisVersionNumber: res[i]?.deployedVersion > 0 ? res[i]?.deployedVersion : res[i]?.versionNumber
          };
          connectedIntegrationArr.push(connectedIntgrationObj);
        }

        const dialogRef = this.dialog.open(ConfirmationComponent, {
          width: "700px",
          maxHeight: "600px",
          data: `Process undeploy will also undeploy all the following connected integration(s): <br>${integrationNames}<br> click <b>Yes</b> to proceed or <b>No</b> to cancel the undeploy action.`,
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.undeployConnectedIntegrations(connectedIntegrationArr);
          }
        });
      } else {
        this.undeployItem();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  undeployItem() {
    const unDeployItemsDto: DeployUndeployItemsDto = {
      workspaceId: this.getWorkspaceTreeObj?.workspaceId,
      deploymentDetails: [
        {
          teisItemID: this.selectedProcessTreeItem?.id,
          teisItemType: "Process",
          teisVersionNumber: this.processDetails?.deployedVersion > 0 ? this.processDetails?.deployedVersion : this.processDetails?.versionNumber,
        },
      ],
    };
    this.unDeployProcessItemsSub = this.appIntegrationService.unDeployItems(unDeployItemsDto, "Process", this.selectedProcessTreeItem?.id, this.selectedProcessTreeItem?.nodeType).subscribe((res) => {
      const nodeType = this.toTitleCaseService.convertToTitleCase(this.selectedProcessTreeItem?.nodeType);
      // this.processItemTree = [];
      // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
      // this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
      if (this.selectedProcessTreeItem?.nodeType !== 'FOLDER') {
        this.updateIconStatus('undeploy');
      } else {
        this.appIntegrationDataService.clearProcessItemTree();
        this.appIntegrationDataService.clearProcessTreeItemCount();
        this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
      }
      this.messageService.add({
        key: "appIntSuccessKey",
        severity: "success",
        summary: "",
        detail: `${nodeType} undeployed successfully!`,
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
  /*============= END Undeploy Workspace Items =============*/

  /*============= Undeploy Connected Integration Items to Process If Any =============*/
  undeployConnectedIntegrations(integrationItemsArr: Array<any>) {
    const unDeployItemsDto: DeployUndeployItemsDto = {
      workspaceId: this.getWorkspaceTreeObj?.workspaceId,
      deploymentDetails: integrationItemsArr
    };
    this.unDeployIntegrationItemsSub = this.appIntegrationService.unDeployItems(unDeployItemsDto, "Integration", this.selectedProcessTreeItem?.id, 'INTEGRATION').subscribe((res) => {
      if (res) {
        this.undeployItem();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*================= Enable / Disable Process ==================*/
  enabledDisableProcess(isDisable: boolean) {
    this.enableDisableProcessSub = this.appIntegrationService.enabledDisabledProcess(this.processDetails?.id, isDisable).subscribe((res) => {
      if (res) {
        //this.processItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        //this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
        this.updateIconStatus('EnableDisable', isDisable);
        this.messageService.add({
          key: "appIntSuccessKey",
          severity: "success",
          summary: "",
          detail: isDisable ? `Process ${this.processDetails?.name} disabled successfully!` : `Process ${this.processDetails?.name} enabled successfully!`,
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
          this.selectedProcessTreeItem?.nodeType === "FOLDER"
            ? this.selectedProcessTreeItem?.id
            : null,
        name: "",
        description: "",
        type: "PROCESS",
        isNewFolder: true,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // this.processItemTree = [];
        // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
        this.appIntegrationDataService.clearProcessItemTree();
        this.appIntegrationDataService.clearProcessTreeItemCount();
        this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
      }
    });
  }
  /*================= END Create Folder ==================*/

  /*================= Update Folder ==================*/
  updateFolder() {
    const folderId =
      this.selectedProcessTreeItem?.nodeType === "FOLDER"
        ? this.selectedProcessTreeItem?.id
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
                type: "PROCESS",
                isNewFolder: false,
              },
            });
            dialogRef.afterClosed().subscribe((result) => {
              if (result) {
                this.processItemTree = [];
                // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, false, false);
                this.getProcessTree(this.getWorkspaceTreeObj, false, false, false);
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

  /*================= Remove Integration =================*/
  removeProcess() {
    if (this.selectedProcessTreeItem?.nodeType === "FOLDER") {
      if (this.selectedProcessTreeItem?.children?.length > 0) {
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
          data: `Are you sure you want to remove ${this.selectedProcessTreeItem?.label} folder?`,
        });
        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            if (this.selectedProcessTreeItem?.nodeType === "FOLDER") {
              const workspaceId = this.getWorkspaceTreeObj?.workspaceId;
              const teisitemtype = "PROCESS";
              const folderId =
                this.selectedProcessTreeItem?.nodeType === "FOLDER"
                  ? this.selectedProcessTreeItem?.id
                  : null;
              const removeAllTask = false;
              this.deleteProcessFolderSub = this.appIntegrationService.deleteFolder(workspaceId, teisitemtype, folderId, removeAllTask).subscribe((res) => {
                if (res) {
                  // this.processItemTree = [];
                  // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, true, false);
                  this.appIntegrationDataService.clearProcessItemTree();
                  this.appIntegrationDataService.clearProcessTreeItemCount();
                  this.getProcessTree(this.getWorkspaceTreeObj, false, true, false);
                  this.messageService.add({
                    key: "appIntSuccessKey",
                    severity: "success",
                    summary: "",
                    detail: "Folder deleted successfully!",
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
          }
        });
      }
    }

    if (this.selectedProcessTreeItem?.nodeType === "PROCESS") {
      this.checkProcessIsConnectedToIntegrationSub = this.appIntegrationService.checkProcessConnectedToIntegration(this.selectedProcessTreeItem?.id).subscribe((res) => {
        if (res) {
          this.messageService.add({
            key: "appIntErrorKey",
            severity: "error",
            summary: "",
            detail:
              "Process can not be deleted because it is connected to integration(s) or any of the integration's version(s).",
          });
        } else {
          const dialogRef = this.dialog.open(AppIntConfirmationComponent, {
            width: "700px",
            maxHeight: "600px",
            data: {
              title: `Are you sure you want to remove ${this.selectedProcessTreeItem?.label} process?`,
              subtext: `Note: All versions will be deleted. if any uncertainty, do an export before as a backup.`,
              actiontext: `Also delete task associated with this item`,
              actionsubtext: `Logs associated with the item will not be retrieved on the UI`,
              isShowSingleBtn: false
            },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result?.isConfirm) {
              this.deleteProcessItemSub = this.appIntegrationService.deleteProcessItem(this.getWorkspaceTreeObj?.workspaceId, this.selectedProcessTreeItem?.id, result?.isSelected).subscribe((res) => {
                if (res) {
                  // this.processItemTree = [];
                  // this.getWorkspaceTree(this.getWorkspaceTreeObj, false, true, false);
                  this.appIntegrationDataService.clearProcessItemTree();
                  this.appIntegrationDataService.clearProcessTreeItemCount();
                  this.getProcessTree(this.getWorkspaceTreeObj, false, true, false);
                  this.messageService.add({
                    key: "appIntSuccessKey",
                    severity: "success",
                    summary: "",
                    detail: "Process deleted successfully!",
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
    if (this.selectedProcessFilterOption?.length) {
      this.selectedProcessFilterOption.forEach((item) => {
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
      currentTab: 1,
      searchTerm: this.getWorkspaceTreeObj?.itemName,
      undeployed: this.deployed,
      locked: this.locked,
      disabled: this.disabled,
    });
  }
  /*================= END Store Applied Filters and Current Tab Number ==================*/

  /*============= Start Task In Interactive Mode ============*/
  startTaskInInteractive() {
    if (this.selectedProcessTreeItem?.deployed) {
      const dialogRef = this.dialog.open(RestartTaskComponent, {
        width: "800px",
        maxHeight: '95vh',
        height: '95%',
        data: {
          taskId: '',
          itemId: Number(this.selectedProcessTreeItem?.id),
          isStart: true,
          isInteractive: true,
          item: this.processDetails,
          itemType: 'Process'
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
            tiesItemID: Number(this.selectedProcessTreeItem?.id),
            parameters: result?.parameters,
            teisItemType: this.selectedProcessTreeItem?.nodeType,
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
        item: this.processDetails,
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
    let content = 'Process Item';
    if (this.processDetails?.lockedUserName || this.processDetails?.disable || !this.selectedProcessTreeItem?.deployed) {
      content += '\n\n';
      content += 'Note:';
    }
    if (this.processDetails?.lockedUserName) {
      content += ` locked by: ${this.processDetails?.lockedUserName} at ${this.processDetails?.lockedDate}.`;
    }
    if (this.processDetails?.disable) {
      content += ` Item disabled, will never be activated.`;
    }

    if (!this.selectedProcessTreeItem?.deployed) {
      content += ` No version deployed yet, showing working copy.`;
    }

    content += `\n\n   Name: ${this.processDetails?.name} (Ver. ${this.processDetails?.versionNumber})`;
    if (this.processDetails?.alertProcess) {
      content += ` (Process is of type 'Alert')`;
    }
    content += `\n`
    content += `   Description: ${(this.processDetails?.description ? this.processDetails?.description : '-')} \n\n`;

    if (this.processDetails?.alertProcessName) {
      content += `Alert process: ${(this.processDetails?.alertProcessName)} \n\n`;
    }

    if (this.processDetails?.paramsData?.length && this.isParameterSettings) {
      content += 'Parameter Settings\n';
      this.processDetails.paramsData.forEach(param => {
        const value = param.securityLevel === 'high' ? '*****' : (param.value ?? '-');
        content += `  ${param.paramName}: ${value}\n`;
      });
      content += '\n';
    }

    //  Connected Executables
    if (this.processDetails?.scriptList?.length) {
      content += 'Connected Executables\n';

      this.processDetails.scriptList.forEach((exe, index) => {
        // Script Name with Language Info
        content += `\n${index + 1}. Name: ${exe.scriptName ?? '-'} `;

        if (exe.language === 'C#') {
          content += '(C# /Adapter)\n';
        } else if (exe.language === 'VBScript' && !exe.userDefined) {
          content += '(VB /Template)\n';
        } else if (exe.language === 'VBScript' && exe.userDefined) {
          content += '(VB /UserScript)\n';
        } else {
          content += '\n';
        }

        // Description
        if (exe.description) {
          const formattedDesc = exe.description.replace(/\n/g, '\n    ');
          content += `    Description: ${formattedDesc}\n`;
        }

        // Parameters In
        if (exe.inParameters?.length && this.isInParameters) {
          content += `    Parameters in:\n`;
          exe.inParameters.forEach(p => {
            let line = `      ${p.parameterName}`;
            if (this.isInParametersValue && p.value) {
              line += ` = ${p.value}`;
            }
            content += `${line}\n`;
          });
        }

        // Parameters Out
        if (exe.outParameters?.length && this.isOutParamters) {
          content += `    Parameters out:\n`;
          exe.outParameters.forEach(p => {
            content += `      ${p.parameterName}\n`;
          });
        }

        // Parameters InOut
        if (exe.inOutParameters?.length) {
          content += `    Parameters inOut:\n`;
          exe.inOutParameters.forEach(p => {
            let line = `      ${p.parameterName}`;
            if (this.isInParametersValue && p.value) {
              line += ` = ${p.value}`;
            }
            content += `${line}\n`;
          });
        }

        // Net Users
        if (exe.netUsers?.length) {
          content += `    Net user(s):\n`;
          exe.netUsers.forEach(user => {
            content += `      ${user.resource}\n`;
          });
        }
      });
      content += '\n';
      if (this.integrationsByProcessId?.length) {
        content += 'Connected to the following integrations\n';
        this.integrationsByProcessId.forEach((int, index) => {
          const versionLabel = int.versionNumber === 0 ? 'Working copy' : int.versionNumber;
          content += `  ${index + 1}. Name: ${int.name} (Ver. ${versionLabel})\n`;

          if (int.description) {
            const formattedDesc = int.description.replace(/\n/g, '\n     ');
            content += `     Description: ${formattedDesc}\n`;
          } else {
            content += `     Description: -\n`;
          }
        });
        content += '\n';
      }

    }
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-'); // Format: 2025-08-20T14-30-00-000Z
    a.download = `GeneralSummaryProcess_${timestamp}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);

  }

  /*=============== End Generate General Summary text file ===============*/

  ngOnDestroy(): void {
    this.isProcessCopied = false;
    this.selectedProcessTreeItem = null;
    this.createdOrUpdatedPITItem = null;
    this.getWorkspaceTreeSub.unsubscribe();
    this.getProcessDetailsSub.unsubscribe();
    this.getIntegrationByProcessIdSub.unsubscribe();
    this.getDeployedIntegrationByProcessIdSub.unsubscribe();
    this.markAllTaskAsCompletedSub.unsubscribe();
    this.deployProcessItemsSub.unsubscribe();
    this.unDeployProcessItemsSub.unsubscribe();
    this.unDeployIntegrationItemsSub.unsubscribe();
    this.pasteProcessSub.unsubscribe();
    this.taskStartSub.unsubscribe();
    this.stopTaskSub.unsubscribe();
    this.stopAllTasksSub.unsubscribe();
    this.moveItemSub.unsubscribe();
    this.checkProcessIsConnectedToIntegrationSub.unsubscribe();
    this.enableDisableProcessSub.unsubscribe();
    this.createTaskSub.unsubscribe();
    this.getScriptDeployStatusSub.unsubscribe();
    this.getValidateAccessSub.unsubscribe();
    this.lockInfoAndDebugParamSub.unsubscribe();
    this.getScriptByIdSub.unsubscribe();
    this.workspaceTreeItemCount.unsubscribe();
    this.getUserSettingsSub.unsubscribe();
    if (this.pitItemSubscription) {
      this.pitItemSubscription.unsubscribe();
    }
  }
}
