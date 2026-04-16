import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Items } from '../../tools';
import { ToolsDataService } from '../../tools-data.service';
import { ToolsService } from '../../tools.service';
import { ItemsTree } from './items-tree';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() activeTabIndex: number = 0;
  @Output() currentTabIndex: EventEmitter<number> = new EventEmitter<number>();
  activeTab: number = 0;
  public integrationArrTree: TreeNode[] = [];
  public processArrTree: TreeNode[] = [];
  public triggerArrTree: TreeNode[] = [];
  selectedIntegrationFile: any[] = [];
  selectedProcessFile: any[] = [];
  selectedTriggerFile: any[] = [];
  selectedType: number;
  exportOption: any;
  workspaceId: number;
  isSearching = false;
  isExportDeployedVersion: boolean = true;

  @ViewChild('searchIntegrationItem') searchIntegrationItem: ElementRef;
  @ViewChild('searchProcessItem') searchProcessItem: ElementRef;
  @ViewChild('searchTriggerItem') searchTriggerItem: ElementRef;

  constructor(
    private fb: UntypedFormBuilder,
    private toolsService: ToolsService,
    private toolsDataService: ToolsDataService
  ) { }

  ngOnInit(): void {
    this.toolsService.selectedWsAndTypeForExport.subscribe((res) => {
      this.workspaceId = res?.workspaceId;
      this.selectedType = res?.typeId;
      this.exportOption = res?.exportOption;
      this.isExportDeployedVersion = res?.isExportDeployedVersion;
    });
  }

  ngAfterViewInit(): void {
    /*---------------------- Integration Search Functionality ----------------------*/
    // const searchIntegrationTerm = fromEvent<any>(this.searchIntegrationItem.nativeElement, 'keyup').pipe(
    //   map(event => {
    //     this.isSearching = false;
    //     return event.target.value;
    //   }),
    //   debounceTime(1000),
    //   distinctUntilChanged()
    // );

    // searchIntegrationTerm.subscribe(res => {
    //   this.getIntegrationItemsTree(this.workspaceId, this.selectedType, 'Integration', res);
    // });

    /*---------------------- Process Search Functionality ----------------------*/
    // const searchProcessTerm = fromEvent<any>(this.searchProcessItem.nativeElement, 'keyup').pipe(
    //   map(event => {
    //     this.isSearching = false;
    //     return event.target.value;
    //   }),
    //   debounceTime(1000),
    //   distinctUntilChanged()
    // );

    // searchProcessTerm.subscribe(res => {
    //   this.getProcessItemsTree(this.workspaceId, this.selectedType, 'Process', res);
    // });

    /*---------------------- Trigger Search Functionality ----------------------*/
    // const searchTriggerTerm = fromEvent<any>(this.searchTriggerItem.nativeElement, 'keyup').pipe(
    //   map(event => {
    //     this.isSearching = false;
    //     return event.target.value;
    //   }),
    //   debounceTime(1000),
    //   distinctUntilChanged()
    // );

    // searchTriggerTerm.subscribe(res => {
    //   this.getTriggerItemsTree(this.workspaceId, this.selectedType, 'Trigger', res);
    // });
  }

  handleChange(index: number) {
    if (index === 0) {
      this.currentTabIndex.next(index);
    }
    if (index === 1) {
      this.currentTabIndex.next(index);
      this.getProcessItemsTree(this.workspaceId, this.selectedType, 'Process');
    }
    if (index === 2) {
      this.currentTabIndex.next(index);
      this.getTriggerItemsTree(this.workspaceId, this.selectedType, 'Trigger');
    }
  }

  /*=========== Set Tab Index ===========*/
  setTabIndex(index: number, nextTab: boolean, prevTab: boolean) {
    this.activeTab = index;
    if (index === 0) {
      this.currentTabIndex.next(index);
    }
    if (index === 1) {
      this.currentTabIndex.next(index);
    }
    if (index === 2) {
      this.currentTabIndex.next(index);
    }
  }
  /*=========== END Set Tab Index ===========*/

  refreshTree(treeType: string) {
    if (treeType.toLowerCase() === 'integration') {
      this.getIntegrationItemsTree(this.workspaceId, this.selectedType, 'Integration');
    } else if (treeType.toLowerCase() === 'process') {
      this.getProcessItemsTree(this.workspaceId, this.selectedType, 'Process');
    } else if (treeType.toLowerCase() === 'trigger') {
      this.getTriggerItemsTree(this.workspaceId, this.selectedType, 'Trigger');
    }
  }

  /*=========== Get Integration Items By Id and Item Name ===========*/
  getIntegrationItemsTree(wsId: number, exportType: number, treeName: string, searchStr?: string) {
    this.integrationArrTree = [];
    this.selectedIntegrationFile = [];
    const itemTreeObj: Items = {
      workspaceId: wsId,
      exportDeployedVersion: this.isExportDeployedVersion,
      type: treeName,
      processIds: this.toolsDataService.getProcessItemIds(),
      integrationIds: this.toolsDataService.getIntegrationItemIds(),
      triggerIds: this.toolsDataService.getTriggerItemIds(),
      searchText: searchStr
    };
    this.toolsService.getWsItemTree(itemTreeObj).subscribe(res => {
      let funMap;
      res.forEach((int) => {
        funMap = int;
        this.isItemConnected(funMap);
        if (exportType === 1) {
          this.setChildrenAsSelected(funMap, true, 'Integration');
        } else {
          this.setChildrenAsSelected(funMap, false, 'Integration');
        }
        let nodeArray: TreeNode;
        nodeArray = new ItemsTree(funMap, 0);
        this.setPreSelectedNodeAsSelected(nodeArray, this.toolsDataService.getAllSelectedIntegrationItemIds());
        this.setParentAsSelected(nodeArray);
        this.countSelectedNode(nodeArray, true, 'Integration');
        if (exportType === 1) {
          this.setNodeAsDisabled(nodeArray);
        }
        this.getSelectedItemsIds('Integration');
        this.integrationArrTree.push(nodeArray);
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Get Integration Items By Id and Item Name ===========*/

  /*=========== Get Process Items By Id and Item Name ===========*/
  getProcessItemsTree(wsId: number, exportType: number, treeName: string, searchStr?: string) {
    this.processArrTree = [];
    this.selectedProcessFile = [];
    const itemTreeObj: Items = {
      workspaceId: wsId,
      exportDeployedVersion: this.isExportDeployedVersion,
      type: treeName,
      processIds: this.toolsDataService.getProcessItemIds(),
      integrationIds: this.toolsDataService.getIntegrationItemIds(),
      triggerIds: this.toolsDataService.getTriggerItemIds(),
      searchText: searchStr
    };
    this.toolsService.getWsItemTree(itemTreeObj).subscribe(res => {
      let funMap;
      res.forEach((process) => {
        funMap = process;
        this.isItemConnected(funMap);
        if (exportType === 1) {
          this.setChildrenAsSelected(funMap, true, 'Process');
        } else {
          this.setChildrenAsSelected(funMap, false, 'Process');
        }
        let nodeArray: TreeNode;
        nodeArray = new ItemsTree(funMap, 0);
        this.setPreSelectedNodeAsSelected(nodeArray, this.toolsDataService.getAllSelectedProcessItemIds());
        this.setParentAsSelected(nodeArray);
        this.countSelectedNode(nodeArray, true, 'Process');
        // Below code is commented for Jira issue #SP6-TEI-4752
        // if (exportType === 1) {
        //   this.setNodeAsDisabled(nodeArray);
        // }
        this.setNodeAsDisabled(nodeArray);
        this.getSelectedItemsIds('Process');
        this.processArrTree.push(nodeArray);
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Get Process Items By Id and Item Name ===========*/

  /*=========== Get Trigger Items By Id and Item Name ===========*/
  getTriggerItemsTree(wsId: number, exportType: number, treeName: string, searchStr?: string) {
    this.triggerArrTree = [];
    this.selectedTriggerFile = [];
    const itemTreeObj: Items = {
      workspaceId: wsId,
      exportDeployedVersion: this.isExportDeployedVersion,
      type: treeName,
      processIds: this.toolsDataService.getProcessItemIds(),
      integrationIds: this.toolsDataService.getIntegrationItemIds(),
      triggerIds: this.toolsDataService.getTriggerItemIds(),
      searchText: searchStr
    };
    this.toolsService.getWsItemTree(itemTreeObj).subscribe(res => {
      let funMap;
      res.forEach((trigger) => {
        funMap = trigger;
        this.isItemConnected(funMap);
        if (exportType === 1) {
          this.setChildrenAsSelected(funMap, true, 'Trigger');
        } else {
          this.setChildrenAsSelected(funMap, false, 'Trigger');
        }
        let nodeArray: TreeNode;
        nodeArray = new ItemsTree(funMap, 0);
        this.setPreSelectedNodeAsSelected(nodeArray, this.toolsDataService.getAllSelectedTriggerItemIds());
        this.setParentAsSelected(nodeArray);
        this.countSelectedNode(nodeArray, true, 'Trigger');
        // Below code is commented for Jira issue #SP6-TEI-4752
        // if (exportType === 1) {
        //   this.setNodeAsDisabled(nodeArray);
        // }
        this.setNodeAsDisabled(nodeArray);
        this.getSelectedItemsIds('Trigger');
        this.triggerArrTree.push(nodeArray);
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Get Trigger Items By Id and Item Name ===========*/

  /*=========== Update Is Process Connected With Integration Flag in Process Tree DTO ===========*/
  private isItemConnected(node: any) {
    if (node.selected) {
      node.isConnected = true;
    }

    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.isItemConnected(node.children[m]);
      }
    }
  }

  /*=========== Set Pre Selected Node As Selected ===========*/
  private setPreSelectedNodeAsSelected(node: any, preSelectedNodes: any[]) {
    if (preSelectedNodes?.length) {
      preSelectedNodes.forEach((x) => {
        if (Number(node.id) === Number(x)) {
          node.selected = true;
        }
      });
    }
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setPreSelectedNodeAsSelected(node.children[m], preSelectedNodes);
      }
    }
  }

  /*=========== Set Parent As Selected If All Children Selected ===========*/
  setParentAsSelected(node: any) {
    if (!node.children || node.children.length === 0) return;

    // Recursively update children first
    node.children.forEach(child => {
      this.setParentAsSelected(child);
    });

    const selectedChildren = node.children.filter(c => c.selected);
    const partiallySelectedChildren = node.children.filter(c => c.partialSelected);

    if (selectedChildren.length === node.children.length) {
      // All children are selected
      node.selected = true;
      node.partialSelected = false;
    } else if (selectedChildren.length > 0 || partiallySelectedChildren.length > 0) {
      // Some children are selected or partially selected
      node.selected = false;
      node.partialSelected = true;
    } else {
      // No children are selected
      node.selected = false;
      node.partialSelected = false;
    }
  }

  /*================== Update Label as Name ========================*/
  private setChildrenAsSelected(node: any, isSelected: boolean, treeType: string) {
    node.label = node.name;
    node.expanded = false;
    if (this.selectedType === 1) {
      if (treeType === 'Process' && this.exportOption === 'exportConnected') {
        // node.selected = node.selected; // Commented this line for Jira issue #SP6-TEI-5292
        node.selected = isSelected;
        node.partialSelected = false;
      } else if (treeType === 'Process' && this.exportOption === 'exportAll') {
        node.selected = isSelected;
        node.partialSelected = false;
      } else {
        node.selected = isSelected;
      }
    } else {
      node.selected = node.selected;
    }
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setChildrenAsSelected(node.children[m], isSelected, treeType);
      }
    }
  }
  /*================== END Update Label as Name ========================*/

  /*=================== Set Tree Node Disabled ===================*/
  private setNodeAsDisabled(node: any) {

    if (this.selectedType === 1) {
      node.selectable = false;
    } else {
      if (node?.isConnected) {
        node.selectable = false;
      }
    }

    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setNodeAsDisabled(node.children[m]);
      }
    }
  }
  /*=================== END Set Tree Node Disabled ===================*/

  /*=================== Check Selected Tree Node ===================*/
  countSelectedNode(nodes, updateSelectedFile: boolean, treeType: string) {
    if (nodes?.selected || nodes?.partialSelected) {
      if (updateSelectedFile) {
        // Do not update in case of onNodeSelect
        if (treeType === 'Integration') {
          this.selectedIntegrationFile.push(nodes);
        }
        if (treeType === 'Process') {
          // nodes.selectable = false;
          this.selectedProcessFile.push(nodes);
        }
        if (treeType === 'Trigger') {
          // nodes.selectable = false;
          this.selectedTriggerFile.push(nodes);
        }
      }
    }
    if (nodes.children !== null) {
      for (let m = 0; m <= nodes.children.length - 1; m++) {
        this.countSelectedNode(nodes.children[m], updateSelectedFile, treeType);
      }
    }
  }
  /*=================== END Check Selected Tree Node ===================*/

  /*================== Check Error Msg Validation on Node Select and De-select =====================*/
  nodeSelect(event, treeType: string) {
    if (treeType === 'Integration') {
      this.getSelectedItemsIds('Integration');
      // const spanEle = document.getElementById('valid');
      // if (this.selectedIntegrationFile.length > 0) {
      //   spanEle.style.display = 'none';
      // } else {
      //   spanEle.style.display = 'block';
      // }
    }
    if (treeType === 'Process') {
      this.getSelectedItemsIds('Process');
    }
    if (treeType === 'Trigger') {
      this.getSelectedItemsIds('Trigger');
    }

  }

  nodeUnselect(event, treeType: string) {
    if (treeType === 'Integration') {
      this.getSelectedItemsIds('Integration');
      // const spanEle = document.getElementById('valid');
      // if (this.selectedIntegrationFile.length > 0) {
      //   spanEle.style.display = 'none';
      // } else {
      //   spanEle.style.display = 'block';
      // }
    }
    if (treeType === 'Process') {
      this.getSelectedItemsIds('Process');
    }
    if (treeType === 'Trigger') {
      this.getSelectedItemsIds('Trigger');
    }

  }
  /*================== END Check Error Msg Validation on Node Select and De-select =====================*/

  /*================== Get Selected Item Ids ===================*/
  getSelectedItemsIds(itemTreeType: string) {
    if (itemTreeType === 'Integration') {
      const integrationItemsIds = [];
      let allSelectedIntegrationItemsIds = [];
      if (this.selectedIntegrationFile.length) {
        allSelectedIntegrationItemsIds = this.selectedIntegrationFile.map(item => item.id);
        this.toolsDataService.storeAllSelectedIntegrationItemIds(allSelectedIntegrationItemsIds);
        this.selectedIntegrationFile.forEach(intItem => {
          if (intItem?.nodeType === 'INTEGRATION') {
            integrationItemsIds.push(intItem?.id);
          }
        });
      }
      this.toolsDataService.storeIntegrationsItemIds(integrationItemsIds);
    }
    if (itemTreeType === 'Process') {
      const processItemsIds = [];
      let allSelectedProcessItemsIds = [];
      if (this.selectedProcessFile.length) {
        allSelectedProcessItemsIds = this.selectedProcessFile.map(item => item.id);
        this.toolsDataService.storeAllSelectedProcessItemIds(allSelectedProcessItemsIds);
        this.selectedProcessFile.forEach(processItem => {
          allSelectedProcessItemsIds.push(processItem?.id);
          if (processItem?.nodeType === 'PROCESS') {
            processItemsIds.push(processItem?.id);
          }
        });
      }
      this.toolsDataService.storeProcessItemIds(processItemsIds);
    }
    if (itemTreeType === 'Trigger') {
      const triggerItemsIds = [];
      let allSelectedTriggerItemsIds = [];
      if (this.selectedTriggerFile.length) {
        allSelectedTriggerItemsIds = this.selectedTriggerFile.map(item => item.id);
        this.toolsDataService.storeAllSelectedTriggerItemIds(allSelectedTriggerItemsIds);
        this.selectedTriggerFile.forEach(triggerItem => {
          if (triggerItem?.nodeType === 'TRIGGER') {
            triggerItemsIds.push(triggerItem?.id);
          }
        });
      }
      this.toolsDataService.storeTriggerItemIds(triggerItemsIds);
    }
  }
  /*================== END Get Selected Item Ids ===================*/

  ngOnDestroy(): void {

  }

}
