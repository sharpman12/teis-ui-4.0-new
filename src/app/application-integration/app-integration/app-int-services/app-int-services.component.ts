import { Component, Input, OnDestroy, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { TaskDetailsDto } from '../appintegration';
import { Router } from '@angular/router';
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { MessageService, TreeNode } from 'primeng/api';
import { take } from "rxjs/operators";
import { ToTitleCaseService } from 'src/app/shared/services/to-title-case.service';
import { AppIntegrationService } from '../app-integration.service';
import { AppIntegrationDataService } from '../app-integration-data.service';
import { Constants } from 'src/app/shared/components/constants';
import { AppIntServiceLogComponent } from '../app-int-service-log/app-int-service-log.component';
import { AppIntEventLogComponent } from '../app-int-event-log/app-int-event-log.component';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Appintitemtree } from '../appintitemtree';
import {
  AppliedFilters,

} from "../appintegration";
@Component({
  selector: 'app-app-int-services',
  templateUrl: './app-int-services.component.html',
  styleUrls: ['./app-int-services.component.scss']
})
export class AppIntServicesComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  @Input() selectedWorkspaceId: number;
  @Input() getWorkspaceTreeObj: TaskDetailsDto;
  activeWebServiceViewIndex = 0;
  webServices: any = null;
  webService: any = null;
  webServiceTree: Array<any> = [];
  selectedWebServices: TreeNode;
  isIntegrationsShow: boolean = false;
  deployed: boolean = true;
  disabled: boolean = false;
  locked: boolean = false;
  itemIds: Array<any> = [];
  webServiceFilterOptions: Array<any> = [];
  selectedWebServiceFilterOption: Array<any> = [];
  isWebServiceInstalled: boolean = false;
  attachedIntegration: any = [];
  @Output() integrationDetailEvent: EventEmitter<object> = new EventEmitter();
  @ViewChild(AppIntServiceLogComponent, { static: false })
  serviceLogs: AppIntServiceLogComponent;
  @ViewChild(AppIntEventLogComponent, { static: false })
  eventLogs: AppIntEventLogComponent;

  allWebServicesSub = Subscription.EMPTY;
  enableDisableWebServiceSub = Subscription.EMPTY;
  integrationListByIdentifierIdSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private messageService: MessageService,
    private toTitleCaseService: ToTitleCaseService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit(): void {
    this.webServiceFilterOptions = [
      { id: 2, name: "Locked", deleted: false },
      { id: 3, name: "Disabled", deleted: false },
    ];

    this.appIntegrationService.returnFromOtherPage
      .pipe(take(1))
      .subscribe((isBack) => {
        if (isBack) {
          const existedFilters: AppliedFilters =
            this.appIntegrationDataService.getAppliedFilters();
          if (existedFilters?.locked) {
            this.selectedWebServiceFilterOption.push(
              this.webServiceFilterOptions[0].id
            );
          }
          if (existedFilters?.disabled) {
            this.selectedWebServiceFilterOption.push(
              this.webServiceFilterOptions[1].id
            );
          }
        }
      });
  }

  handleChange(index: number) {
    this.activeWebServiceViewIndex = index;
    this.itemIds = [
      {
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
        itemId: this.webService?.id,
        itemType: "WebService",
      },
    ];
    if (index === 0) {
    }
    if (index === 1) {
      this.serviceLogs.getServiceLog(this.itemIds);
    }
    if (index === 2) {
      this.eventLogs.getEventLog(this.itemIds);
    }
  }

  reinitiateWebServiceProperties() {
    this.webServiceTree = [];
    this.webService = null;
  }

  /*================= Refresh Workspace Item Tree ==================*/
  refreshTree() {
    this.webServiceTree = [];
    this.getWebServices(this.getWorkspaceTreeObj);
  }

  getTaskDetaisObject(taskDetailsDto) {
    this.locked = false;
    this.disabled = false;
    if (this.selectedWebServiceFilterOption?.length) {
      this.selectedWebServiceFilterOption.forEach((item) => {
        if (Number(item) === 2) {
          this.locked = true;
        }
        if (Number(item) === 3) {
          this.disabled = true;
        }
      })
      taskDetailsDto.showAll = false;
    } else {
      taskDetailsDto.showAll = true;
    }
    taskDetailsDto.locked = this.locked;
    taskDetailsDto.disabled = this.disabled;
    this.appIntegrationDataService.storeSelectedWebServiceItem(null);
    return taskDetailsDto;

  }

  /*=========== On Change Filter ===========*/
  onChangeFilter() {
    this.webServiceTree = [];
    this.webService = null;
    this.appIntegrationDataService.clearSelctedWebServiceItem();
    this.appIntegrationDataService.storeSelectedWebServiceFilter(this.selectedWebServiceFilterOption);
    this.getWebServices(this.getWorkspaceTreeObj);

  }

  /*=========== Get Web Services ===========*/
  getWebServices(taskDetailsDto: TaskDetailsDto) {
    if (!this.webServiceTree?.length) {
      this.isWebServiceInstalled = true;
      const selectedTreeItem = this.appIntegrationDataService.getSelectedWebServiceItem();
      const taskDetailsDtoData = this.getTaskDetaisObject(taskDetailsDto);
      this.allWebServicesSub = this.appIntegrationService.getWebServiceTree(taskDetailsDtoData).subscribe((res) => {
        this.webServices = res;
        const webServices = JSON.parse(JSON.stringify(res));
        webServices.name = 'webservices';
        webServices.type = 'WORKSPACE';
        if (webServices?.appRegistry?.length) {
          this.isWebServiceInstalled = true;
          webServices?.appRegistry.forEach((x) => {
            x.type = 'WEBSERVICE';
            x.versionNumber = x?.version,
              x.enabled = x?.enabled
          });
        } else {
          this.isWebServiceInstalled = false;
        }

        const webServiceArr = this.transformData(webServices);
        if (webServiceArr?.length) {
          webServiceArr.forEach((x) => {
            let nodeArray: TreeNode;
            nodeArray = new Appintitemtree(x, x?.workspaceId);
            this.disabledTreeNode(nodeArray);
            this.updateTreeIcon(nodeArray);
            this.expandTree(nodeArray);
            this.webServiceTree.push(nodeArray);
          });

          if (selectedTreeItem) {
            if (this.webServiceTree?.length) {
              this.webServiceTree.forEach((x) => {
                if (x?.children?.length) {
                  x?.children.forEach((c) => {
                    c?.children.forEach((w) => {
                      if (Number(w?.id) === Number(selectedTreeItem?.id)) {
                        this.selectedWebServices = w;
                        this.nodeSelect(w);
                        return false;
                      }
                    });
                  });
                }
              });
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

  }

  // transformData(input) {
  //   return [
  //     {
  //       deployed: false,
  //       id: input.id,
  //       workspaceId: input.id,
  //       leaf: false,
  //       name: input.name,
  //       partialSelected: false,
  //       profileSelectionPartial: false,
  //       selected: false,
  //       type: input.type,
  //       children: input.appRegistry.map(app => ({
  //         belongsToFolder: input.id,
  //         children: [],
  //         folderStatusMap: {
  //           ProcessingWithError: false,
  //           Failed: false,
  //           Initiate: false,
  //           Processing: false
  //         },
  //         statusCountMap: {},
  //         deployed: false,
  //         id: app.id,
  //         workspaceId: input.id,
  //         leaf: false,
  //         name: app.name,
  //         partialSelected: false,
  //         profileSelectionPartial: false,
  //         selected: false,
  //         type: app.type
  //       }))
  //     }
  //   ];
  // }

  transformData(input) {
    const webServicesNode = {
      deployed: false,
      enabled: input?.enabled,
      id: input.id,
      workspaceId: input.id,
      leaf: false,
      name: input.name, // "webservices"
      partialSelected: false,
      profileSelectionPartial: false,
      selected: false,
      type: input.type, // e.g., "WORKSPACE"
      children: input.appRegistry.map(app => ({
        belongsToFolder: input.id,
        children: [],
        folderStatusMap: {
          ProcessingWithError: false,
          Failed: false,
          Initiate: false,
          Processing: false
        },
        statusCountMap: {},
        deployed: false,
        enabled: app?.enabled,
        id: app.id,
        workspaceId: input.id,
        leaf: false,
        name: app.name,
        partialSelected: false,
        profileSelectionPartial: false,
        selected: false,
        type: app.type
      }))
    };

    // Wrap it with the workspace name node
    const workspaceNode = {
      id: `workspace-${this.webServices?.id}`,
      name: this.webServices?.name, // Set the workspace name here
      type: input.type,    // Or a custom type like "WORKSPACE_FOLDER"
      workspaceId: input.id,
      deployed: false,
      leaf: false,
      partialSelected: false,
      profileSelectionPartial: false,
      selected: false,
      children: [webServicesNode]
    };

    return [workspaceNode];
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

  /*=========== Update Icons ===========*/
  updateTreeIcon(node: any) {
    if (node?.children) {
      node.children.forEach((childNode) => {
        if (childNode?.nodeType === "WEBSERVICE") {
          if (childNode?.enabled) {
            childNode.icon = "fa fa-globe text-success";
          }
        }
        this.updateTreeIcon(childNode);
      });
    }
  }

  /*=========== Expand Whole Tree ===========*/
  private expandTree(node: any) {
    node.expanded = true;
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.expandTree(node.children[m]);
      }
    }
  }

  refreshWebService() {
    this.itemIds = [
      {
        workspaceId: this.getWorkspaceTreeObj?.workspaceId,
        itemId: this.webService?.id,
        itemType: "WebService",
      },
    ];
    if (this.activeWebServiceViewIndex === 0) {
      this.getInterationListByIdentifierId();
    }
    if (this.activeWebServiceViewIndex === 1) {
      setTimeout(() => {
        this.serviceLogs.getServiceLog(this.itemIds);
      }, 0);
    }
    if (this.activeWebServiceViewIndex === 2) {
      setTimeout(() => {
        this.eventLogs.getEventLog(this.itemIds);
      }, 0);
    }
  }

  nodeSelect(item: any) {
    this.webService = null;
    this.attachedIntegration = [];
    this.appIntegrationDataService.clearSelctedWebServiceItem();
    if (this.webServices?.appRegistry?.length) {
      this.webServices?.appRegistry.forEach((x) => {
        if (Number(x?.id) === Number(item?.id)) {
          x.belongsToFolder = item?.belongsToFolder;
          this.webService = x;
          this.appIntegrationDataService.storeSelectedWebServiceItem(this.webService);
          this.getInterationListByIdentifierId();
          if (this.activeWebServiceViewIndex === 1) {
            setTimeout(() => {
              this.serviceLogs.getServiceLog(this.itemIds);
            }, 0);
          }
          if (this.activeWebServiceViewIndex === 2) {
            setTimeout(() => {
              this.eventLogs.getEventLog(this.itemIds);
            }, 0);
          }
        }
      });
    }
  }

  getInterationListByIdentifierId() {
    const identifierId = this.webService?.identifiers?.length && this.webService?.identifiers[0]?.id ? this.webService?.identifiers[0]?.id : null;
    if (!identifierId) {
      return;
    }
    this.integrationListByIdentifierIdSub = this.appIntegrationService.getIntegrationListByIdentifierId(this.selectedWorkspaceId, Number(identifierId)).subscribe((res) => {
      if (res?.length) {
        this.attachedIntegration = res;
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============= Navigate to Process Details =============*/
  navigateToIntegartionDetails(integartionId) {
    this.integrationDetailEvent.emit(integartionId);
  }
  /*============= End Get Process Details =============*/

  nodeUnselect(item: any) { }

  onToggle(value: string) {
    if (value === "CONNECTED_INTEGRATION") {
      this.isIntegrationsShow = !this.isIntegrationsShow;
    }
  }

  webServiceProperties() {
    this.storeAppliedFiltersAndTabNum();
    this.router.navigate([
      `application_integration/properties/webservice/${false}/${this.getWorkspaceTreeObj?.workspaceId}/${this.webService?.belongsToFolder}/${this.webService?.id}`
    ]);
  }

  enableDisableWebService() {
    this.webService.enabled = !this.webService?.enabled;
    this.enableDisableWebServiceSub = this.appIntegrationService.enableDisableWebService(Number(this.webService?.id), this.webService?.enabled).subscribe((res) => {
      if (res) {
        if (this.webService.enabled) {
          this.refreshTree();
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Web service enabled successfully!' });
        } else {
          this.refreshTree();
          this.messageService.add({ key: 'appIntSuccessKey', severity: 'success', summary: '', detail: 'Web service disabled successfully!' });
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

  /*================= Store Applied Filters and Current Tab Number ==================*/
  storeAppliedFiltersAndTabNum() {
    this.deployed = true;
    this.disabled = false;
    this.locked = false;
    if (this.selectedWebServiceFilterOption?.length) {
      this.selectedWebServiceFilterOption.forEach((item) => {
        // if (Number(item) === 1) {
        //   this.deployed = false;
        // }
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
      currentTab: 3,
      searchTerm: this.getWorkspaceTreeObj?.itemName,
      undeployed: this.deployed,
      locked: this.locked,
      disabled: this.disabled,
    });
  }
  /*================= END Store Applied Filters and Current Tab Number ==================*/

  ngOnDestroy(): void {
    this.allWebServicesSub.unsubscribe();
    this.enableDisableWebServiceSub.unsubscribe();
    this.integrationListByIdentifierIdSub.unsubscribe();
  }
}
