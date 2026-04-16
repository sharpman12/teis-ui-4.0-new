import { Component, Inject, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Appintitemtree } from '../appintitemtree';
import { MessageService, TreeNode } from 'primeng/api';
import { AppIntegrationService } from '../app-integration.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskDetailsDto } from '../appintegration';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, take } from "rxjs/operators";
import { Constants } from "src/app/shared/components/constants";

@Component({
  selector: 'app-app-int-move-item',
  templateUrl: './app-int-move-item.component.html',
  styleUrls: ['./app-int-move-item.component.scss']
})
export class AppIntMoveItemComponent implements OnInit, OnDestroy {
  sourceTree: TreeNode[] = [];
  targetTree: TreeNode[] = [];
  selectedSourceFile: any = null;
  selectedTargetFile: any = null;
  searchSourceItem: string;
  searchTargetItem: string;
  currentUser: any;
  @ViewChild("searchTargetTreeItem") searchTargetTreeItem: ElementRef;
  @ViewChild("searchSourceTreeItem") searchSourceTreeItem: ElementRef;

  getWorkspaceFolderTreeSub = Subscription.EMPTY;
  getWorkspaceTreeSub = Subscription.EMPTY;
  moveItemSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<AppIntMoveItemComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private appIntegrationService: AppIntegrationService,
    private messageService: MessageService,
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
    dialogRef.disableClose = true;
    this.getSourceTree();
    this.getTargetTree();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    /*------------ Search Target Workspace Item ------------*/
    const searchSourceTerm = fromEvent<any>(
      this.searchSourceTreeItem.nativeElement,
      "keyup"
    ).pipe(
      map((event) => {
        // event.target.value === "" ? this.isSearching = true : this.isSearching = false;
        return event.target.value;
      }),
      debounceTime(500),
      distinctUntilChanged()
    );
    searchSourceTerm.subscribe((txt) => {
      if (txt === "") {
        this.searchSourceItem = "";
        this.getSourceTreeByApi();
      }
    });
    /*------------ Search Target Workspace Item ------------*/
    const searchTargrtTerm = fromEvent<any>(
      this.searchTargetTreeItem.nativeElement,
      "keyup"
    ).pipe(
      map((event) => {
        // event.target.value === "" ? this.isSearching = true : this.isSearching = false;
        return event.target.value;
      }),
      debounceTime(500),
      distinctUntilChanged()
    );
    searchTargrtTerm.subscribe((txt) => {
      if (txt === "") {
        this.searchTargetItem = "";
        this.getTargetTree();
      }
    });

  }

  /*============= Get Source Tree =============*/
  getSourceTree() {
    const processTree = this.dialogData?.processTree;
    processTree.forEach((element) => {
      let nodeArray: TreeNode;
      nodeArray = new Appintitemtree(element, 0);
      // this.updateTreeIcon(nodeArray);
      this.expandTreeNode(nodeArray, true);
      this.disabledTreeNode(nodeArray, false);
      this.sourceTree.push(nodeArray);
    });
  }
  /*============= END Get Source Tree =============*/

  /*============= Clear Source Tree =============*/
  clearSourceTreeItem() {
    this.searchSourceItem = "";
    this.getSourceTreeByApi();
  }
  /*============= END Clear Source Tree =============*/

  /*============= Search Source Tree Items =============*/
  searchMoveSourceItem(searchTxt: string) {
    this.searchSourceItem = searchTxt;
    this.getSourceTreeByApi();
  }
  /*============= End Search Source Tree Items =============*/

  /*============= Get Source Tree By API =============*/
  getSourceTreeByApi() {
    const taskDetailsDto: TaskDetailsDto = {
      workspaceId: Number(this.dialogData?.workspaceId),
      itemType: this.dialogData?.itemType,
      itemName: this.searchSourceItem ? this.searchSourceItem : '',
      deployed: false,
      disabled: false,
      locked: false,
      showAll: this.searchSourceItem ? false : true,
      moveItemFolderSearch: this.searchSourceItem ? true : false,
      searchInNameAndDesc: false,
      userName: this.currentUser?.userName
    };
    this.sourceTree = [];
    this.getWorkspaceTreeSub = this.appIntegrationService.getWorkspaceTree(taskDetailsDto).subscribe(res => {
      const processTree = res;
      processTree.forEach((element) => {
        let nodeArray: TreeNode;
        nodeArray = new Appintitemtree(element, 0);
        // this.updateTreeIcon(nodeArray);
        this.expandTreeNode(nodeArray, true);
        this.disabledTreeNode(nodeArray, false);
        this.sourceTree.push(nodeArray);
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });

  }
  /*============= End Get Source Tree By API =============*/

  /*============= Search Target Tree Items =============*/
  searchMoveTargetItem(searchTxt: string) {
    this.searchTargetItem = searchTxt;
    this.getTargetTree();
  }
  /*============= End Search Target Tree Items =============*/

 /*============= Clear Target Tree =============*/
  clearTargetTreeItem() {
    this.searchTargetItem = "";
    this.getTargetTree()
  }
  /*============= END Clear Source Tree =============*/

  /*============= Get Target Tree =============*/
  getTargetTree() {
    const taskDetailsDto: TaskDetailsDto = {
      workspaceId: Number(this.dialogData?.workspaceId),
      itemType: this.dialogData?.itemType,
      itemName: this.searchTargetItem ? this.searchTargetItem : '',
      deployed: false,
      disabled: false,
      locked: false,
      showAll: this.searchTargetItem ? false : true,
      moveItemFolderSearch: this.searchTargetItem ? true : false,
      searchInNameAndDesc: false,
      userName: this.currentUser?.userName
    };
    this.targetTree = [];
    this.getWorkspaceFolderTreeSub = this.appIntegrationService.getWorkspaceFolderTree(taskDetailsDto).subscribe(res => {
      const processTree = res;
      processTree.forEach((element) => {
        let nodeArray: TreeNode;
        nodeArray = new Appintitemtree(element, 0);
        this.expandTreeNode(nodeArray, true);
        this.disabledTreeNode(nodeArray, true);
        this.targetTree.push(nodeArray);
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
    // const processTree = this.dialogData?.processTree;
    // processTree.forEach((element) => {
    //   let nodeArray: TreeNode;
    //   nodeArray = new Appintitemtree(element, 0);
    //   this.getTargetFolderTree(nodeArray);
    //   // this.setNodeAsDisabled(nodeArray);
    //   this.targetTree.push(nodeArray);
    // });
  }

  getTargetFolderTree(node) {
    if (node?.children) {
      node.children.forEach((childNode, i, arr) => {
        if (childNode?.nodeType === 'PROCESS') {
          const foundIndex = node.children.findIndex(x => Number(x.id) === Number(childNode?.id));
          if (foundIndex > -1) {
            node.children.splice(foundIndex, 1);
          }
        }
        this.getTargetFolderTree(childNode);
      });
    }
  }

  // private setNodeAsDisabled(node: any) {
  //   if (node.children) {
  //     for (let m = 0; m <= node.children.length - 1; m++) {
  //       this.setNodeAsDisabled(node.children[m]);
  //     }
  //   }
  // }

  /*=========== Disabled Tree Node ===========*/
  private disabledTreeNode(node: any, isTargetTree: boolean) {
    // disabled Workspace type tree node
    if (isTargetTree) {
      if (node?.nodeType === 'WORKSPACE') {
        node.selectable = false;
      }
      if (node.children) {
        for (let m = 0; m <= node.children.length - 1; m++) {
          // disabled the folder if it has partial access 
          node.children[m].selectable = node.children[m]?.partialSelected ? false : true;
          node.children[m].disabled = node.children[m]?.partialSelected ? true : false;
          this.disabledTreeNode(node.children[m], isTargetTree);
        }
      }
    } else {
      if (node?.nodeType === 'WORKSPACE' || node?.belongsToFolder === 0) {
        node.selectable = false;
      }
      if (node.children) {
        for (let m = 0; m <= node.children.length - 1; m++) {
          if (node.children[m].nodeType === "FOLDER" && node.children[m].partialSelected) {
            // disabled the folder if it has partial access
            node.children[m].selectable = node.children[m]?.partialSelected ? false : true;
            node.children[m].disabled = node.children[m]?.partialSelected ? true : false;
          }
          this.disabledTreeNode(node.children[m], isTargetTree);
        }
      }
    }
  }

  /*=================== Set Tree Node Expanded ===================*/
  private expandTreeNode(node: any, isFullyExpanded: boolean) {
    if (isFullyExpanded) {
      node.expanded = true;
    } else {
      if (node?.nodeType === 'WORKSPACE') {
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
  /*============= END Get Target Tree =============*/

  sourceNodeSelect(item: any) {
    this.selectedSourceFile = item;
  }

  sourceNodeUnselect(item: any) {

  }

  targetNodeSelect(item: any) {
    this.selectedTargetFile = item;
  }

  targetNodeUnselect(item: any) {

  }

  /*============ Move Item ============*/
  moveItem() {
    if (Number(this.selectedSourceFile?.id) && Number(this.selectedTargetFile?.id)) {
      if (Number(this.selectedSourceFile?.id) === Number(this.selectedTargetFile?.id)) {
        this.messageService.add({
          key: "appIntInfoKey",
          severity: "success",
          summary: "",
          detail: "Source and target folder should not be same.",
        });
      } else {
        const obj = {
          // isMove: true,
          workspaceId: Number(this.dialogData?.workspaceId),
          sourceFolder: Number(this.selectedSourceFile?.id),
          destinationFolder: Number(this.selectedTargetFile?.id),
          itemType: this.dialogData?.itemType,
          isFolder: this.selectedSourceFile?.nodeType === 'FOLDER' ? true : false
        };
        // this.dialogRef.close(obj);

        this.moveItemSub = this.appIntegrationService.moveItem(obj).subscribe((res) => {
          if (res) {
            const objs = {
              isMove: true,
              ...obj
            }
            this.dialogRef.close(objs);
            this.messageService.add({
              key: "appIntSuccessKey",
              severity: "success",
              summary: "",
              detail: "Selected item move successfully!",
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
    } else {
      this.messageService.add({
        key: "appIntInfoKey",
        severity: "success",
        summary: "",
        detail: "Please select source and target tree item.",
      });
    }
  }
  /*============ End Move Item ============*/

  onCancel() {
    const obj = {
      isMove: false,
      workspaceId: null,
      sourceFolder: null,
      destinationFolder: null,
      itemType: null,
      isFolder: null
    };
    this.dialogRef.close(obj);
  }

  ngOnDestroy(): void {
    this.getWorkspaceFolderTreeSub.unsubscribe();
    this.moveItemSub.unsubscribe();
  }
}
