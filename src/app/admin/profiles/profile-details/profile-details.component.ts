import { HttpErrorResponse } from '@angular/common/http';
import { OnDestroy } from '@angular/core';
import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MessageService, TreeNode } from 'primeng/api';
import { EditFunctionalMap } from '../editfunctionalmap';
import { Profiles } from '../profiles';
import { ProfilesService } from '../profiles.service';
import { BreadCrumbService } from '../../../core/service/breadcrumb.service';
import { SharedService } from '../../../shared/services/shared.service';

export interface NewTreeNode extends TreeNode {
  isSelected?: boolean;
  children?: NewTreeNode[];
}

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.scss']
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {
  public arrTree: NewTreeNode[] = [];
  public archiveArrTree: NewTreeNode[] = [];
  public selectedArrTree: NewTreeNode[] = [];
  public selectedArchiveArrTree: NewTreeNode[] = [];
  selectedFile: any[] = [];
  selectedArchiveFile: any[] = [];
  funMapNodes: any;
  isShowSelectedOnly = true;
  isShowArchiveSelectedOnly = true;
  isFmLoading = false;
  isAfmLoading = false;
  profile: any;
  isExpandRT = false;
  isExpandUT = false;
  archiveFunMapNodes: any;
  isArchivePackInstalled: boolean;

  constructor(
    public dialogRef: MatDialogRef<ProfileDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private profileService: ProfilesService,
    private sharedService: SharedService,
    private messageService: MessageService,
    // private breadcrumb: BreadCrumbService,
  ) {
    this.dialogRef.disableClose = true;
    this.getProfileDetails(this.dialogData);
    this.checkIsArchivePackInstalled();
  }

  ngOnInit(): void {
    // this.breadcrumb.visible = false;
    // this.breadcrumb.previous(); // show hide breadcrumb
  }

  /*=========== Is Archive Packed Installed ============*/
  checkIsArchivePackInstalled() {
    this.sharedService.checkArchivePackInstalled().subscribe(res => {
      this.isArchivePackInstalled = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=========== END Is Archive Packed Installed ============*/

  /*=============== Get Profile Details =================*/
  getProfileDetails(profileId: any) {
    this.isShowSelectedOnly = false;
    this.isShowArchiveSelectedOnly = false;
    // this.isFmLoading = true;
    this.arrTree = [];
    this.selectedArrTree = [];
    this.archiveArrTree = [];
    this.selectedArchiveArrTree = [];
    this.profileService.getProfileDetailsById(profileId).subscribe(res => {
      this.profile = res;
      this.getFunctionalMapByProfileId(profileId, res);
      if (this.isArchivePackInstalled) {
        this.getArchiveFunctionalMapByProfileId(profileId);
      }
      // const funMapArr = JSON.parse(res.functionalMapTree);
      // this.funMapNodes = JSON.parse(res.functionalMapTree);
      // let funMap;
      // funMapArr.forEach(element1 => {
      //   funMap = element1;
      //   let nodeArray: TreeNode;
      //   nodeArray = new EditFunctionalMap(funMap, 0);
      //   this.setNodeAsDisabled(nodeArray);
      //   this.countSeletedNode(nodeArray, true);
      //   this.arrTree.push(nodeArray);
      //   this.selectedArrTree.push(nodeArray);
      //   this.arrTree = this.getValidTreeNodeItems(this.selectedArrTree);
      // });
      // this.isFmLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getFunctionalMapByProfileId(profileId: any, profileData: Profiles) {
    this.isFmLoading = true;
    this.profileService.getFunctionalMapByProfileId(profileId).subscribe(res => {
      profileData.functionalMapTree = res.functionalMapTree;
      this.getProfile(profileData);
      this.isFmLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getArchiveFunctionalMapByProfileId(profileId: any, profileData?: Profiles) {
    this.isAfmLoading = true;
    this.profileService.getArchiveFunctionalMapByProfileId(profileId).subscribe(res => {
      // profileData.archiveFunctionalMapTree = res.functionalMapTree;
      // this.profileArr.push(profileData);
      // this.globalDataService.storeProfileOnSelect(this.profileArr);
      // this.getArchiveFunMap(profileData);
      this.getArchiveFunMap(res);
      this.isAfmLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        this.messageService.add({ key: 'adminArchivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }

  getProfile(profile: Profiles) {
    this.profile = profile;
    const funMapArr = JSON.parse(profile.functionalMapTree);
    this.funMapNodes = JSON.parse(profile.functionalMapTree);
    let funMap;
    funMapArr.forEach(element1 => {
      funMap = element1;
      let nodeArray: TreeNode;
      nodeArray = new EditFunctionalMap(funMap, 0);
      this.setNodeAsDisabled(nodeArray);
      this.countSeletedNode(nodeArray, true);
      this.arrTree.push(nodeArray);
      this.selectedArrTree.push(nodeArray);
      this.arrTree = this.getValidTreeNodeItems(this.selectedArrTree);
    });
  }

  getArchiveFunMap(profile: Profiles) {
    const archiveFunMapArr = JSON.parse(profile?.functionalMapTree);
    this.archiveFunMapNodes = JSON.parse(profile?.functionalMapTree);
    let archiveFunMap;
    if (archiveFunMapArr?.length) {
      archiveFunMapArr.forEach(item => {
        archiveFunMap = item;
        let nodeArray: TreeNode;
        nodeArray = new EditFunctionalMap(archiveFunMap, 0);
        this.setNodeAsDisabled(nodeArray);
        this.countSeletedArchiveNode(nodeArray, true);
        this.archiveArrTree.push(nodeArray);
        this.selectedArchiveArrTree.push(nodeArray);
        this.archiveArrTree = this.getValidTreeNodeItems(this.selectedArchiveArrTree);
      });
    }
  }
  /*=============== END Get Profile Details =================*/

  /*=================== Set Tree Node Disabled ===================*/
  private setNodeAsDisabled(node: any) {
    node.selectable = false;
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setNodeAsDisabled(node.children[m]);
      }
    }
  }
  /*=================== END Set Tree Node Disabled ===================*/

  /*=================== Check Selected Tree Node ===================*/
  countSeletedNode(nodes, updateSelectedFile: boolean) {
    if (nodes.isSelected === true) {
      if (updateSelectedFile) {
        // Do not update in case of onNodeSelect
        nodes.selectable = false;
        this.selectedFile.push(nodes);
      }
    }
    if (nodes.children !== null) {
      for (let m = 0; m <= nodes.children.length - 1; m++) {
        this.countSeletedNode(nodes.children[m], updateSelectedFile);
      }
    }
  }

  countSeletedArchiveNode(nodes, updateSelectedFile: boolean) {
    if (nodes.isSelected === true) {
      if (updateSelectedFile) {
        // Do not update in case of onNodeSelect
        nodes.selectable = false;
        this.selectedArchiveFile.push(nodes);
      }
    }
    if (nodes.children !== null) {
      for (let m = 0; m <= nodes.children.length - 1; m++) {
        this.countSeletedArchiveNode(nodes.children[m], updateSelectedFile);
      }
    }
  }
  /*=================== END Check Selected Tree Node ===================*/

  /*=================== Show Selected Only ====================*/
  showSelectedOnly() {
    this.isShowSelectedOnly = !this.isShowSelectedOnly;
    if (this.isShowSelectedOnly) {
      this.arrTree = [];
      const allArrTree = [];
      let funMap;
      this.funMapNodes.forEach(element1 => {
        funMap = element1;
        let nodeArray: TreeNode;
        nodeArray = new EditFunctionalMap(funMap, 0);
        this.setNodeAsDisabled(nodeArray);
        this.countSeletedNode(nodeArray, true);
        allArrTree.push(nodeArray);
      });
      this.arrTree = allArrTree;
    } else {
      this.arrTree = [];
      this.arrTree = this.getValidTreeNodeItems(this.selectedArrTree);
    }
  }

  showArchiveSelectedOnly() {
    this.isShowArchiveSelectedOnly = !this.isShowArchiveSelectedOnly;
    if (this.isShowArchiveSelectedOnly) {
      this.archiveArrTree = [];
      const allArchiveArrTree = [];
      let funMap;
      if (this.archiveFunMapNodes?.length) {
        this.archiveFunMapNodes.forEach(item => {
          funMap = item;
          let nodeArray: TreeNode;
          nodeArray = new EditFunctionalMap(funMap, 0);
          this.setNodeAsDisabled(nodeArray);
          this.countSeletedArchiveNode(nodeArray, true);
          allArchiveArrTree.push(nodeArray);
        });
      }
      this.archiveArrTree = allArchiveArrTree;
    } else {
      this.archiveArrTree = [];
      this.archiveArrTree = this.getValidTreeNodeItems(this.selectedArchiveArrTree);
    }
  }

  getValidTreeNodeItems(treeNodes: NewTreeNode[]): NewTreeNode[] {
    const validItem = treeNodes.filter(i => (i.isSelected === true || i.partialSelected === true));
    validItem.forEach(i => {
      if (i.children) {
        i.children = this.getValidTreeNodeItems(i.children);
      }
    });
    return validItem;
  }
  /*=================== END Show Selected Only ====================*/

  onCancel() {
    this.dialogRef.close();
  }

  onToggle(tablename: string) {
    if (tablename === 'R_TABLE') {
      this.isExpandRT = !this.isExpandRT;
    }
    if (tablename === 'U_TABLE') {
      this.isExpandUT = !this.isExpandUT;
    }
  }

  ngOnDestroy() {
    // this.breadcrumb.visible = true;
    // this.breadcrumb.previousHide(); // show hide breadcrumb
  }

}
