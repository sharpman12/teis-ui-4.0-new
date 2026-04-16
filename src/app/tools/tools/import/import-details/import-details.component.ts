import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MessageService, TreeNode } from 'primeng/api';
import { ItemsTree } from '../../export/items/items-tree';
import { ExportedData, ImportContentDto, ItemRequestDto, Items } from '../../tools';
import { ToolsDataService } from '../../tools-data.service';
import { ToolsService } from '../../tools.service';

@Component({
  selector: 'app-import-details',
  templateUrl: './import-details.component.html',
  styleUrls: ['./import-details.component.scss']
})
export class ImportDetailsComponent implements OnInit {
  activeTab: number = 0;
  @Output() currentTabIndex: EventEmitter<number> = new EventEmitter<number>();
  importDetails: ExportedData;
  importTreesContents: ImportContentDto;
  public integrationArrTree: TreeNode[] = [];
  public processArrTree: TreeNode[] = [];
  public triggerArrTree: TreeNode[] = [];
  selectedIntegrationFile: any[] = [];
  selectedProcessFile: any[] = [];
  selectedTriggerFile: any[] = [];
  userScriptList = [];
  templateScriptList = [];
  globalParametersList = [];
  applicationParametersList = [];
  workspaceId: number;
  selectedExportType: number;
  importFromId: string;

  constructor(
    private fb: UntypedFormBuilder,
    private toolsService: ToolsService,
    private messageService: MessageService,
    private toolsDataService: ToolsDataService
  ) { }

  ngOnInit(): void {
    this.toolsService.selectedImportDetails.subscribe(res => {
      if (res?.isTypeChanged) {
        this.selectedIntegrationFile = [];
        this.selectedProcessFile = [];
        this.selectedTriggerFile = [];
        this.toolsDataService.clearImportItemIds();
        this.toolsDataService.clearImportTempScript();
        this.toolsDataService.clearImportParams();
      }
      this.workspaceId = res?.workspaceId;
      this.selectedExportType = Number(res?.typeId);
      this.importFromId = res?.importFromId;
    });
  }

  handleChange(index: number) {
    if (index === 0) {
      this.currentTabIndex.next(index);
    }
    if (index === 1) {
      this.currentTabIndex.next(index);
      // this.getProcessTree();
      if (this.selectedExportType === 1) {
        this.getProcessTreeItemIds();
      } else {
        this.getProcessTree();
      }
    }
    if (index === 2) {
      this.currentTabIndex.next(index);
      this.getTriggerTree();
    }
    if (index === 3) {
      this.currentTabIndex.next(index);
      this.getUserScript();
    }
    if (index === 4) {
      this.currentTabIndex.next(index);
      // this.getTemplateScript();
    }
    if (index === 5) {
      this.currentTabIndex.next(index);
      this.getGlobalParameters();
    }
    if (index === 6) {
      this.currentTabIndex.next(index);
      this.getAppParameters();
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
    if (index === 3) {
      this.currentTabIndex.next(index);
    }
    if (index === 4) {
      this.currentTabIndex.next(index);
    }
    if (index === 5) {
      this.currentTabIndex.next(index);
    }
    if (index === 6) {
      this.currentTabIndex.next(index);
    }
  }
  /*=========== END Set Tab Index ===========*/

  /*=========== Cleared Selected Files Array ===========*/
  clearSelectedFiles(treeType: string) {
    if (treeType === 'Integration') {
      this.selectedIntegrationFile = [];
    }
    if (treeType === 'Process') {
      this.selectedProcessFile = [];
    }
    if (treeType === 'Trigger') {
      this.selectedTriggerFile = [];
    }
  }

  /*=========== Get Import Details ===========*/
  getImportDetails() {
    this.importDetails = this.toolsDataService.getImportParseWorkspace();
    this.importTreesContents = this.importDetails?.importContentDto;
    this.getIntegrationTree();
    this.getProcessTreeItemIds();
  }
  /*=========== END Get Import Details ===========*/

  refreshTree(treeType: string) {
    if (treeType.toLowerCase() === 'integration') {
      this.getIntegrationTree();
    } else if (treeType.toLowerCase() === 'process') {
      this.getProcessTree();
    } else if (treeType.toLowerCase() === 'trigger') {
      this.getTriggerTree();
    }
  }

  /*=========== Get Integration Tree ===========*/
  getIntegrationTree() {
    let funMap;
    this.integrationArrTree = [];
    const selectedIntegrationItems = this.toolsDataService.getImportIntegrationItemIds();
    const allSelectedIntItemIds = this.toolsDataService.getAllImportIntegrationsItemIds();
    const integrationTree = JSON.parse(this.importTreesContents?.integrationTree);
    if (integrationTree?.length) {
      integrationTree.forEach(item => {
        funMap = item;
        this.isItemConnected(funMap);
        if (this.selectedExportType === 1) {
          this.setChildrenAsSelected(funMap, true, false);
        } else {
          this.setChildrenAsSelected(funMap, false, false);
        }
        let nodeArray: TreeNode;
        nodeArray = new ItemsTree(funMap, 0);
        this.setPreSelectedNodeAsSelected(nodeArray, allSelectedIntItemIds);
        this.setParentAsSelected(nodeArray);
        this.countSelectedNode(nodeArray, true, 'Integration');
        if (this.selectedExportType === 1) {
          this.setNodeAsDisabled(nodeArray, false);
        }
        this.getSelectedItemsIds('Integration');
        this.integrationArrTree.push(nodeArray);
      });
    }
  }
  /*=========== END Get Integration Tree ===========*/

  /*=========== Get Process Tree Item Ids For Process api Call ===========*/
  getProcessTreeItemIds() {
    let funMap;
    this.processArrTree = [];
    const selectedProcessItems = this.toolsDataService.getImportProcessItemIds();
    const allSelectedProcessItemIds = this.toolsDataService.getAllImportProcessesItemIds();
    const processTree = JSON.parse(this.importTreesContents?.processTree);
    if (processTree?.length) {
      processTree.forEach(item => {
        funMap = item;
        this.isItemConnected(funMap);
        if (this.selectedExportType === 1) {
          this.setChildrenAsSelected(funMap, true, false);
        } else {
          this.setChildrenAsSelected(funMap, false, false);
        }
        let nodeArray: TreeNode;
        nodeArray = new ItemsTree(funMap, 0);
        if (allSelectedProcessItemIds?.length) {
          this.setPreSelectedNodeAsSelected(nodeArray, allSelectedProcessItemIds);
          this.setParentAsSelected(nodeArray);
        }
        if (this.selectedExportType === 1) {
          this.countSelectedNode(nodeArray, true, 'Process');
          this.setNodeAsDisabled(nodeArray, false);
        } else {
          this.countSelectedNode(nodeArray, true, 'Process');
          this.setNodeAsDisabled(nodeArray, true);
        }
        this.getSelectedItemsIds('Process');
      });
    }
  }

  /*=========== Get Process Tree ===========*/
  getProcessTree() {
    const selectedIntegrationItems = [];
    const selectedProcessItems = this.toolsDataService.getImportProcessItemIds();
    const allSelectedProcessItemIds = this.toolsDataService.getAllImportProcessesItemIds();
    /*----------- Get selected integrations items here -----------*/
    if (this.selectedIntegrationFile?.length) {
      this.selectedIntegrationFile.forEach(element => {
        this.importDetails?.integrationList.forEach(item => {
          if (Number(element?.id) === Number(item?.id)) {
            selectedIntegrationItems.push(item);
          }
        });
      });
    }
    const itemTreeObj: ItemRequestDto = {
      workspaceId: this.workspaceId,
      type: 'Process',
      integrationList: selectedIntegrationItems,
      processList: this.importDetails?.processList,
      triggerList: [],
      scriptList: [],
      searchText: ''
    };
    this.toolsService.getWsImportItemTree(itemTreeObj).subscribe(res => {
      let funMap;
      this.processArrTree = [];
      if (res?.processTree) {
        const processTree = JSON.parse(res?.processTree);
        if (processTree?.length) {
          processTree.forEach(item => {
            funMap = item;
            this.isItemConnected(funMap);
            if (this.selectedExportType === 1) {
              this.setChildrenAsSelected(funMap, true, false);
            } else {
              this.setChildrenAsSelected(funMap, false, false);
            }
            let nodeArray: TreeNode;
            nodeArray = new ItemsTree(funMap, 0);
            if (allSelectedProcessItemIds?.length) {
              this.setPreSelectedNodeAsSelected(nodeArray, allSelectedProcessItemIds);
              this.setParentAsSelected(nodeArray);
            }
            if (this.selectedExportType === 1) {
              this.countSelectedNode(nodeArray, true, 'Process');
              this.setNodeAsDisabled(nodeArray, false);
            } else {
              this.countSelectedNode(nodeArray, true, 'Process');
              this.setNodeAsDisabled(nodeArray, false);
            }
            this.getSelectedItemsIds('Process');
            this.processArrTree.push(nodeArray);
          });
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
  /*=========== END Get Process Tree ===========*/

  /*=========== Get Trigger Tree ===========*/
  getTriggerTree() {
    let funMap;
    this.triggerArrTree = [];
    const selectedTriggerItems = this.toolsDataService.getImportTriggerItemIds();
    const allSelectedTriggerItemIds = this.toolsDataService.getAllImportTriggersItemIds();
    let triggerTree = JSON.parse(this.importTreesContents?.triggerTree);
    if (triggerTree?.length) {
      triggerTree.forEach(item => {
        funMap = item;
        this.isItemConnected(funMap);
        if (this.selectedExportType === 1) {
          this.setChildrenAsSelected(funMap, true, false);
        } else {
          this.setChildrenAsSelected(funMap, false, false);
        }
        let nodeArray: TreeNode;
        nodeArray = new ItemsTree(funMap, 0);
        if (allSelectedTriggerItemIds?.length) {
          this.setPreSelectedNodeAsSelected(nodeArray, allSelectedTriggerItemIds);
          this.setParentAsSelected(nodeArray);
        }
        this.triggerArrTree.push(nodeArray);
        if (this.selectedExportType === 1) {
          this.countSelectedNode(nodeArray, true, 'Trigger');
          this.setNodeAsDisabled(nodeArray, false);
        } else {
          this.countSelectedNode(nodeArray, true, 'Trigger');
          this.setNodeAsDisabled(nodeArray, true);
        }
        this.getSelectedItemsIds('Trigger');
      });
    }
  }
  /*=========== END Get Trigger Tree ===========*/

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
  private setChildrenAsSelected(node: any, isSelected: boolean, isPartialSelected: boolean) {
    node.label = node.name;
    node.expanded = false;
    if (this.selectedExportType === 1) {
      node.selected = isSelected;
      node.partialSelected = isPartialSelected;
    } else {
      node.selected = node.selected;
      // node.partialSelected = node.partialSelected;
    }
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setChildrenAsSelected(node.children[m], isSelected, isPartialSelected);
      }
    }
  }
  /*================== END Update Label as Name ========================*/

  /*=================== Set Tree Node Disabled ===================*/
  private setNodeAsDisabled(node: any, isSelectable: boolean) {
    // node.selectable = isSelectable;
    if (this.selectedExportType === 1) {
      node.selectable = false;
    } else {
      if (node?.selected && node?.isConnected) {
        node.selectable = false;
      }
    }

    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setNodeAsDisabled(node.children[m], isSelectable);
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

  /*================== Get Selected Item Ids ===================*/
  getSelectedItemsIds(itemTreeType: string) {
    if (itemTreeType === 'Integration') {
      const integrationItemsIds = [];
      let allSelectedImportIntItemsIds = [];
      if (this.selectedIntegrationFile.length) {
        allSelectedImportIntItemsIds = this.selectedIntegrationFile.map(item => item.id);
        this.toolsDataService.storeAllImportIntegrationsItemIds(allSelectedImportIntItemsIds);
        this.selectedIntegrationFile.forEach(intItem => {
          if (intItem?.nodeType === 'INTEGRATION') {
            integrationItemsIds.push(intItem?.id);
          }
        });
      }
      this.toolsDataService.storeImportIntegrationsItemIds(integrationItemsIds);
    }
    if (itemTreeType === 'Process') {
      const processItemsIds = [];
      let allSelectedImportProItemsIds = [];
      if (this.selectedProcessFile.length) {
        allSelectedImportProItemsIds = this.selectedProcessFile.map(item => item.id);
        this.toolsDataService.storeAllImportProcessesItemIds(allSelectedImportProItemsIds);
        this.selectedProcessFile.forEach(processItem => {
          if (processItem?.nodeType === 'PROCESS') {
            processItemsIds.push(processItem?.id);
          }
        });
      }
      this.toolsDataService.storeImportProcessItemIds(processItemsIds);
    }
    if (itemTreeType === 'Trigger') {
      const triggerItemsIds = [];
      let allSelectedImportTrigItemsIds = [];
      if (this.selectedTriggerFile.length) {
        allSelectedImportTrigItemsIds = this.selectedTriggerFile.map(item => item.id);
        this.toolsDataService.storeAllImportTriggersItemIds(allSelectedImportTrigItemsIds);
        this.selectedTriggerFile.forEach(triggerItem => {
          if (triggerItem?.nodeType === 'TRIGGER') {
            triggerItemsIds.push(triggerItem?.id);
          }
        });
      }
      this.toolsDataService.storeImportTriggerItemIds(triggerItemsIds);
    }
  }
  /*================== END Get Selected Item Ids ===================*/

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

  /*=============== Get User Scripts =================*/
  getUserScript() {
    this.userScriptList = [];
    this.templateScriptList = [];
    const selectedProcessItems = [];
    const selectedTriggerItems = [];

    const selectedScripts = this.toolsDataService.getImportScript();
    const selectedTemplates = this.toolsDataService.getImportTemplate();

    /*----------- Get selected process items here -----------*/
    if (this.selectedProcessFile?.length) {
      this.selectedProcessFile.forEach(p_el => {
        this.importDetails?.processList.forEach(p_item => {
          if (Number(p_el?.id) === Number(p_item?.id)) {
            selectedProcessItems.push(p_item);
          }
        });
      });
    }

    /*----------- Get selected trigger items here -----------*/
    if (this.selectedTriggerFile?.length) {
      this.selectedTriggerFile.forEach(t_el => {
        this.importDetails?.triggerList.forEach(t_item => {
          if (Number(t_el?.id) === Number(t_item?.id)) {
            selectedTriggerItems.push(t_item);
          }
        });
      });
    }

    const itemTreeObj: ItemRequestDto = {
      workspaceId: this.workspaceId,
      type: '',
      integrationList: [],
      processList: selectedProcessItems,
      triggerList: selectedTriggerItems,
      scriptList: this.importDetails?.userScriptList?.length ? this.importDetails?.userScriptList.concat(this.importDetails?.templateList?.length ? this.importDetails?.templateList : []) : this.importDetails?.templateList?.length ? this.importDetails?.templateList : [],
      searchText: ''
    };

    this.toolsService.getWsImportItemTree(itemTreeObj).subscribe(res => {
      if (res?.scriptList?.length) {
        res?.scriptList.forEach(item => {
          if (this.selectedExportType === 1) {
            item.disabled = true;
            item.checked = true;
          } else {
            if (item?.connected) {
              item.disabled = true;
              item.checked = true;
            } else {
              item.disabled = false;
              item.checked = false;

              // State mantain
              if (selectedTemplates?.length || selectedScripts?.length) {
                const selectedTempIds = selectedTemplates.map(x => Number(x?.id));
                const selectedScriptsIds = selectedScripts.map(x => Number(x?.id));
                item.checked = (selectedTempIds.includes(Number(item?.id)) || selectedScriptsIds.includes(Number(item?.id)));
              }
            }
          }

          // Check if the item is user defined or template
          if (item?.userDefined) {
            this.userScriptList.push(item);
          } else {
            this.templateScriptList.push(item);
          }
        });
        this.onScriptChange();
        this.onTemplateChange();
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=============== END Get User Scripts =================*/

  /*=============== Get Template Scripts =================*/
  getTemplateScript() {
    // this.templateScriptList = [];
    // const tempScripts = this.importDetails?.templateList;
    // if (tempScripts?.length) {
    //   tempScripts.forEach(item => {
    //     if (this.selectedExportType === 1) {
    //       item.disabled = true;
    //       item.checked = true;
    //     } else {
    //       item.disabled = false;
    //       item.checked = false;
    //     }
    //   });
    // }
    // this.templateScriptList = tempScripts;
    // this.toolsDataService.storeImportTemplate(this.templateScriptList);
  }
  /*=============== END Get Template Scripts =================*/

  onScriptChange() {
    this.toolsDataService.storeImportScript(this.getScripts());
  }

  getScripts() {
    const uniqueScripts = [];
    if (this.userScriptList?.length) {
      this.userScriptList.forEach(item => {
        if (item?.checked) {
          uniqueScripts.push(item);
        }
      });

      return uniqueScripts;
    }
  }

  onTemplateChange() {
    this.toolsDataService.storeImportTemplate(this.getTemplates());
  }

  getTemplates() {
    const uniqueTemplates = [];
    if (this.templateScriptList?.length) {
      this.templateScriptList.forEach(item => {
        if (item?.checked) {
          uniqueTemplates.push(item);
        }
      });

      return uniqueTemplates;
    }
  }

  /*=============== Get Global Parameters =================*/
  getGlobalParameters() {
    this.globalParametersList = [];
    const globalParams = this.importDetails?.globalParamList;
    const selectedGlobalParams = this.toolsDataService.getImportGlobalParams();
    if (globalParams?.length) {
      globalParams.forEach(item => {
        if (Number(this.selectedExportType) === 1) {
          item.disabled = true;
          item.checked = true;
        } else {
          item.disabled = false;
          item.checked = false;

          // State mantain
          if (selectedGlobalParams?.length) {
            const selectedGlobalParamsIds = selectedGlobalParams.map(x => Number(x?.id));
            item.checked = selectedGlobalParamsIds.includes(Number(item?.id));
          }
        }
        this.globalParametersList.push(item);
      });
    }
    this.onChangeGlobalParameter();
  }

  onChangeGlobalParameter() {
    this.toolsDataService.storeImportGlobalParams(this.getGlobalParams());
  }

  getGlobalParams() {
    const uniqueGlobalParams = [];
    if (this.globalParametersList?.length) {
      this.globalParametersList.forEach(item => {
        if (item?.checked) {
          uniqueGlobalParams.push(item);
        }
      });

      return uniqueGlobalParams;
    }
  }
  /*=============== END Get Global Parameters =================*/

  /*=============== Get Global Parameters =================*/
  getAppParameters() {
    this.applicationParametersList = [];
    const appParams = this.importDetails?.applicationParamList;
    if (appParams?.length) {
      appParams.forEach(item => {
        item.disabled = true;
        item.checked = false;
      });
    }
    this.applicationParametersList = appParams;
    this.toolsDataService.storeImportAppParams(this.applicationParametersList);
  }
  /*=============== END Get Global Parameters =================*/

  /*=============== Reset Step Two ===============*/
  resetStepTwo() {
    this.importDetails = null;
    this.importTreesContents = null;
    this.integrationArrTree = [];
    this.processArrTree = [];
    this.triggerArrTree = [];
    this.selectedIntegrationFile = [];
    this.selectedProcessFile = [];
    this.selectedTriggerFile = [];
    this.userScriptList = [];
    this.templateScriptList = [];
    this.globalParametersList = [];
    this.applicationParametersList = [];
    this.toolsDataService.clearImportParseWorkspace();
    this.toolsDataService.clearImportItemIds();
    this.toolsDataService.clearImportTempScript();
    this.toolsDataService.clearImportParams();
  }
  /*=============== END Reset Step Two ===============*/

}
