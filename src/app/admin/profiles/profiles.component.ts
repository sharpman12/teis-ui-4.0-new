import { HttpErrorResponse } from "@angular/common/http";
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService, TreeNode } from "primeng/api";
import { fromEvent, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged, map, take } from "rxjs/operators";
import { ConfirmationComponent } from "../../shared/components/confirmation/confirmation.component";
import { SharedService } from "../../shared/services/shared.service";
import { GlobalDataService } from "../global-data.service";
import { EditFunctionalMap } from "./editfunctionalmap";
import { Profiles } from "./profiles";
import { ProfilesService } from "./profiles.service";
import { BreadCrumbService } from "../../core/service/breadcrumb.service";
import { Constants } from "src/app/shared/components/constants";
import { ReturnToURPG } from "../admin";

export interface NewTreeNode extends TreeNode {
  isSelected?: boolean;
  children?: NewTreeNode[];
}

@Component({
  selector: "app-profiles",
  templateUrl: "./profiles.component.html",
  styleUrls: ["./profiles.component.scss"],
})
export class ProfilesComponent implements OnInit, AfterViewInit, OnDestroy {
  allProfiles: Array<any> = [];
  activeProfile: any;
  profile: any;
  term = "";
  public arrTree: NewTreeNode[] = [];
  public archiveArrTree: NewTreeNode[] = [];
  public selectedArrTree: NewTreeNode[] = [];
  public selectedArchiveArrTree: NewTreeNode[] = [];
  selectedFile: any[] = [];
  selectedArchiveFile: any[] = [];
  pageNo = 1;
  isMoreResultLinkShow = true;
  funMapNodes: any;
  isShowSelectedOnly = true;
  isShowArchiveSelectedOnly = true;
  isAdminCURDAccess: boolean = false;
  isSearching = false;
  searchTxt = "";
  searchProfileName: string;
  isFmLoading = false;
  isAfmLoading = false;
  isSuperAdmin: boolean = true;
  isAdmin: boolean = true;
  isOrdinaryUser: boolean = true;
  profileArr = [];
  isExpandRT = false;
  isExpandUT = false;
  archiveFunMapNodes: any;
  currentUser: any;
  isArchivePackInstalled: boolean;
  selectedTabIndex = 0;
  editedProfileId: any;
  profilesTotalCount: number;
  isUpdateRoleFromProfile: boolean = false;
  isUserUpdate: boolean = false;

  @ViewChild("searchProfile") searchProfile: ElementRef;


  searchCriteria = {
    type: "All",
    pageNumber: this.pageNo,
    name: null,
    excludeRecordId: null,
    userType: '',
    includeSuperAdmin: false,
    includeAdmin: false,
    includeUser: false,
    profileId: null
  };

  removeProfileSubscription = Subscription.EMPTY;
  allProfilesSubscription = Subscription.EMPTY;



  constructor(
    private router: Router,
    private dialog: MatDialog,
    private messageService: MessageService,
    private profilesService: ProfilesService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private globalDataService: GlobalDataService,
    private breadcrumb: BreadCrumbService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit() {
    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    // Below code change for JIRA TEI-4968
    this.isSuperAdmin = this.currentUser?.superAdminUser ? false : false;
    this.isAdmin = this.currentUser?.superAdminUser ? true : this.currentUser?.adminUser ? false : false;
    this.isOrdinaryUser = this.currentUser?.superAdminUser ? false : this.currentUser?.adminUser ? true : true;
    if (localStorage.getItem(Constants.USER_MANAGEMENT_CRUD)) {
      this.isAdminCURDAccess = true;
    }
    this.breadcrumb.visible = false;
    this.breadcrumb.previous(); // show hide breadcrumb
    this.allProfiles = [];
    // this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    this.checkIsArchivePackInstalled();
    if (this.sharedService.isProfileAction) {
      const profiles = this.globalDataService.getProfiles();
      if (profiles?.profileList?.length > 0) {
        this.editedProfileId = profiles?.profileId;
        this.allProfiles = profiles?.profileList;
        this.profilesTotalCount = profiles?.totalCount;
        this.pageNo = profiles?.searchCriteria?.pageNumber;
        this.searchTxt = profiles?.searchCriteria?.name;
        this.isSuperAdmin = profiles?.searchCriteria?.includeSuperAdmin;
        this.isAdmin = profiles?.searchCriteria?.includeAdmin;
        this.isOrdinaryUser = profiles?.searchCriteria?.includeUser;

        this.searchCriteria = this.getSearchCriteria('All', this.pageNo, profiles?.searchCriteria?.name, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

        if (profiles?.searchCriteria?.name) {
          this.searchProfileName = profiles?.searchCriteria?.name;
        }
        this.checkPagination(this.profilesTotalCount, this.allProfiles.length);
        this.getProfileById(profiles?.profileId);
      } else {
        this.getAllProfiles();
      }
    } else {
      this.searchCriteria = this.getSearchCriteria('All', this.pageNo, '', null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
      this.sharedService.returnToURPG.pipe(take(1)).subscribe((res: ReturnToURPG) => {
        this.isUserUpdate = res?.isUpdate;
        this.getProfiles(res?.activeProfileId, res?.isExpandRT, res?.isExpandUT);
      });
    }
  }

  ngAfterViewInit() {
    /*---------------------- Search Functionality ----------------------*/
    const searchTerm = fromEvent<any>(
      this.searchProfile.nativeElement,
      "keyup"
    ).pipe(
      map((event) => {
        this.isSearching = true;
        return event.target.value;
      }),
      debounceTime(1000),
      distinctUntilChanged()
    );
    // tslint:disable-next-line: deprecation
    searchTerm.subscribe((searchText) => {
      this.searchTxt = searchText;
      this.allProfiles = [];
      this.pageNo = 1;
      let pname;
      if (searchText === "") {
        pname = null;
      } else {
        pname = searchText;
      }
      // const SearchCriteria = {
      //   type: "All",
      //   pageNumber: this.pageNo,
      //   name: pname,
      //   excludeRecordId: null,
      // };
      // this.searchCriteria = SearchCriteria;

      const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
      this.searchCriteria = this.getSearchCriteria('All', this.pageNo, pname, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

      this.allProfilesSubscription = this.profilesService.getAllProfiles(this.searchCriteria).subscribe((res) => {
        this.isSearching = false;
        this.allProfiles = res["profiles"];
        this.profilesTotalCount = res?.totalCount;
        if (this.allProfiles.length) {
          this.checkPagination(res.totalCount, this.allProfiles.length);
          this.getProfileById(this.allProfiles[0].id);
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.isSearching = false;
        } else {
          // handle server side error here
          this.isSearching = false;
        }
      });
    });
    /*---------------------- END Search Functionality ----------------------*/
  }

  getSearchCriteria(type: string, pageNo: number, name: string, excludeRecordId: any, userType: string, includeSuperAdmin: boolean, includeAdmin: boolean, includeUser: boolean, profileId: any) {
    return {
      type: type,
      pageNumber: pageNo,
      name: name,
      excludeRecordId: excludeRecordId,
      userType: userType,
      includeSuperAdmin: includeSuperAdmin,
      includeAdmin: includeAdmin,
      includeUser: includeUser,
      profileId: profileId
    };
  }

  onChangeFilter() {
    this.allProfiles = [];
    this.pageNo = 1;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = this.getSearchCriteria('All', this.pageNo, this.searchTxt, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
    this.searchCriteria = SearchCriteria;

    this.allProfilesSubscription = this.profilesService.getAllProfiles(SearchCriteria).subscribe((res) => {
      this.isSearching = false;
      this.allProfiles = res["profiles"];
      this.profilesTotalCount = res?.totalCount;
      if (this.allProfiles.length) {
        this.checkPagination(res.totalCount, this.allProfiles.length);
        this.getProfileById(this.allProfiles[0].id);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
        this.isSearching = false;
      } else {
        // handle server side error here
        this.isSearching = false;
      }
    });
  }

  /*=========== Is Archive Packed Installed ============*/
  checkIsArchivePackInstalled() {
    this.sharedService.archivePackInstalled.subscribe((res) => {
      this.isArchivePackInstalled = res;
    });
  }
  /*=========== END Is Archive Packed Installed ============*/

  /*=========== Functional/Archive Map Tab Change ============*/
  onTabChange(e) {
    const index = e.index;
    if (index === 1) {
      if (
        this.sharedService.isProfileAction &&
        this.isArchivePackInstalled &&
        !this.archiveArrTree?.length
      ) {
        this.getArchiveFunctionalMapByProfileId(this.editedProfileId);
      }
    }
  }
  /*=========== END Functional/Archive Map Tab Change ============*/

  updateRole(roleId: number) {
    this.sharedService.updateURPG({
      isUpdate: true,
      isProfile: false,
      isRole: true,
      isGroup: false,
      isProfileUser: false,
      isRoleUser: false,
      userId: null,
      roleId: roleId,
      profileId: null,
      groupId: null,
      activeProfileId: this.activeProfile,
      activeRoleId: null,
      activeGroupId: null,
      isExpandPT: false,
      isExpandRT: this.isExpandRT,
      isExpandUT: this.isExpandUT
    });
    this.router.navigate([`/admin/roles/editrole/${roleId}`]);
  }

  updateUser(userId: number) {
    this.sharedService.updateURPG({
      isUpdate: true,
      isProfile: false,
      isRole: false,
      isGroup: false,
      isProfileUser: true,
      isRoleUser: false,
      userId: userId,
      roleId: null,
      profileId: null,
      groupId: null,
      activeProfileId: this.activeProfile,
      activeRoleId: null,
      activeGroupId: null,
      isExpandPT: false,
      isExpandRT: this.isExpandRT,
      isExpandUT: this.isExpandUT
    });
    this.router.navigate([`/admin/users/edituser/${userId}`]);
  }

  /*=================== Get All Profiles ===================*/

  /*--------------- Get Data From Resolve Gaurd ---------------*/
  getProfiles(profileId: string, isExpandRT: boolean, isExpandUT: boolean) {
    const profiles = this.activatedRoute.snapshot.data.adminProfiles;
    this.allProfiles = profiles["profiles"];
    this.profilesTotalCount = profiles?.totalCount;
    if (this.allProfiles.length) {
      this.checkPagination(profiles.totalCount, this.allProfiles.length);
      if (profileId) {
        this.getProfileById(profileId, isExpandRT, isExpandUT);
      } else {
        this.getProfileById(this.allProfiles[0].id, isExpandRT, isExpandUT);
      }
    }
  }

  /*--------------- Call only when profile is deleted ---------------*/
  getAllProfiles() {
    this.allProfiles = [];
    this.pageNo = 1;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    this.searchCriteria = this.getSearchCriteria('All', this.pageNo, null, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

    this.allProfilesSubscription = this.profilesService.getAllProfiles(this.searchCriteria).subscribe((res) => {
      this.allProfiles = res["profiles"];
      this.profilesTotalCount = res?.totalCount;
      if (this.allProfiles.length) {
        this.checkPagination(res.totalCount, this.allProfiles.length);
        this.getProfileById(this.allProfiles[0].id);
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=================== END Get All Profiles ===================*/

  /*================ Pagination ==================*/
  getNextPageProfile(event) {
    this.pageNo++;
    let pname;
    if (this.searchTxt === "") {
      pname = null;
    } else {
      pname = this.searchTxt;
    }
    let excludeRecordId;
    if (this.sharedService.isNewProfileAdded) {
      excludeRecordId = this.allProfiles[0].id;
    } else {
      excludeRecordId = null;
    }
    // const SearchCriteria = {
    //   type: "All",
    //   pageNumber: this.pageNo,
    //   name: pname,
    //   excludeRecordId: excludeRecordId,
    // };
    // this.searchCriteria = SearchCriteria;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    this.searchCriteria = this.getSearchCriteria('All', this.pageNo, pname, excludeRecordId, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

    this.allProfilesSubscription = this.profilesService
      .getAllProfiles(this.searchCriteria)
      .subscribe(
        (res) => {
          res["profiles"].forEach((element: any) => {
            if (this.allProfiles[0].id === element.id) {
              const index = res["profiles"].indexOf(element.id);
              res["profiles"].splice(index, 1);
            }
          });
          const allProfiles = this.allProfiles.concat(res["profiles"]);
          this.allProfiles = allProfiles;
          this.profilesTotalCount = res?.totalCount;
          this.checkPagination(res.totalCount, this.allProfiles.length);
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

  checkPagination(totalCount, arrLength) {
    if (arrLength > 0 && totalCount > arrLength) {
      this.isMoreResultLinkShow = true;
    } else {
      this.isMoreResultLinkShow = false;
    }
  }
  /*================ END Pagination ==================*/

  /*=================== Get Profiles By Id =====================*/
  getProfileById(profileId: any, isExpandRT: boolean = false, isExpandUT: boolean = false) {
    this.isShowSelectedOnly = false;
    this.isShowArchiveSelectedOnly = false;
    // this.isFmLoading = true;
    this.isExpandRT = isExpandRT;
    this.isExpandUT = isExpandUT;
    this.arrTree = [];
    this.selectedArrTree = [];
    this.archiveArrTree = [];
    this.selectedArchiveArrTree = [];
    this.profileArr = [];
    this.activeProfile = profileId;
    // const storeProfiles = this.globalDataService.getProfileOnSelect();
    this.profileArr = this.globalDataService.getProfileOnSelect();
    let profile;
    if (this.profileArr?.length) {
      this.profileArr.forEach((el) => {
        if (el.id === profileId) {
          profile = el;
        }
      });
    }
    if (profile) {
      this.getProfile(profile);
      // this.getArchiveFunMap(profile);
      if (this.isArchivePackInstalled) {
        this.getArchiveFunctionalMapByProfileId(profile?.id);
      }
      this.isFmLoading = false;
    } else {
      this.profilesService.getProfileDetailsById(profileId).subscribe(
        (res) => {
          this.profile = res;
          this.getFunctionalMapByProfileId(profileId, res);
          if (this.isArchivePackInstalled) {
            this.getArchiveFunctionalMapByProfileId(profileId);
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

  getFunctionalMapByProfileId(profileId: any, profileData: Profiles) {
    this.isFmLoading = true;
    this.profilesService.getFunctionalMapByProfileId(profileId).subscribe(
      (res) => {
        profileData.functionalMapTree = res.functionalMapTree;
        this.profileArr.push(profileData);
        this.globalDataService.storeProfileOnSelect(this.profileArr);
        this.getProfile(profileData);
        this.isFmLoading = false;
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

  getArchiveFunctionalMapByProfileId(profileId: any, profileData?: Profiles) {
    this.isAfmLoading = true;
    this.profilesService
      .getArchiveFunctionalMapByProfileId(profileId)
      .subscribe(
        (res) => {
          // profileData.archiveFunctionalMapTree = res.functionalMapTree;
          // this.profileArr.push(profileData);
          // this.globalDataService.storeProfileOnSelect(this.profileArr);
          // this.getArchiveFunMap(profileData);
          this.getArchiveFunMap(res);
          this.isAfmLoading = false;
        },
        (err: HttpErrorResponse) => {
          if (err.error instanceof Error) {
            // handle client side error here
          } else {
            // handle server side error here
            this.messageService.add({
              key: "adminArchivePkgInfoKey",
              severity: "success",
              summary: "",
              detail: err.error,
            });
          }
        }
      );
  }

  getProfile(profile: Profiles) {
    this.profile = profile;
    const funMapArr = JSON.parse(profile?.functionalMapTree);
    this.funMapNodes = JSON.parse(profile?.functionalMapTree);
    let funMap;
    funMapArr.forEach((element1) => {
      funMap = element1;
      let nodeArray: TreeNode;
      nodeArray = new EditFunctionalMap(funMap, element1?.type === 'WORKSPACE' ? element1?.id : null);
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
      archiveFunMapArr.forEach((item) => {
        archiveFunMap = item;
        let nodeArray: TreeNode;
        nodeArray = new EditFunctionalMap(archiveFunMap, item?.type === 'WORKSPACE' ? item?.id : null);
        this.setNodeAsDisabled(nodeArray);
        this.countSeletedArchiveNode(nodeArray, true);
        this.archiveArrTree.push(nodeArray);
        this.selectedArchiveArrTree.push(nodeArray);
        this.archiveArrTree = this.getValidTreeNodeItems(
          this.selectedArchiveArrTree
        );
      });
    }
  }
  /*=================== END Get Profiles By Id =====================*/

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
      this.funMapNodes.forEach((element1) => {
        funMap = element1;
        let nodeArray: TreeNode;
        nodeArray = new EditFunctionalMap(funMap, element1?.type === 'WORKSPACE' ? element1?.id : null);
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
        this.archiveFunMapNodes.forEach((item) => {
          funMap = item;
          let nodeArray: TreeNode;
          nodeArray = new EditFunctionalMap(funMap, item?.type === 'WORKSPACE' ? item?.id : null);
          this.setNodeAsDisabled(nodeArray);
          this.countSeletedArchiveNode(nodeArray, true);
          allArchiveArrTree.push(nodeArray);
        });
      }
      this.archiveArrTree = allArchiveArrTree;
    } else {
      this.archiveArrTree = [];
      this.archiveArrTree = this.getValidTreeNodeItems(
        this.selectedArchiveArrTree
      );
    }
  }

  getValidTreeNodeItems(treeNodes: NewTreeNode[]): NewTreeNode[] {
    const validItem = treeNodes.filter(
      (i) => i.isSelected === true || i.partialSelected === true
    );
    validItem.forEach((i) => {
      if (i.children) {
        i.children = this.getValidTreeNodeItems(i.children);
      }
    });
    return validItem;
  }
  /*=================== END Show Selected Only ====================*/

  /*=================== Edit Profile ====================*/
  editProfile(profileId: any) {
    this.router.navigate(["admin/profiles/editprofile/" + profileId]);
  }
  /*=================== END Edit Profile ====================*/

  /*=================== Removed Role ====================*/
  removeProfile(profileId: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: "330px",
      panelClass: "myapp-no-padding-dialog",
      data: "Are you sure you want to remove this profile?",
    });
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // tslint:disable-next-line: deprecation
        this.removeProfileSubscription = this.profilesService.deleteProfile(profileId).subscribe((res) => {
          this.searchProfile.nativeElement.value = "";
          this.searchTxt = "";
          if (this.isArchivePackInstalled) {
            this.profilesService.deleteArchiveProfile(profileId).subscribe((response) => {

            }, (err: HttpErrorResponse) => {
              if (err.error instanceof Error) {
                // handle client side error here
              } else {
                // handle server side error here
                this.messageService.add({
                  key: "adminArchivePkgInfoKey",
                  severity: "success",
                  summary: "",
                  detail: err.error,
                });
              }
            });
          }
          this.getAllProfiles();
          this.messageService.add({
            key: "adminKey",
            severity: "success",
            summary: "",
            detail: "Profile Deleted Successfully!",
          });
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
  /*=================== END Removed Role ====================*/

  onToggle(tablename: string) {
    if (tablename === "R_TABLE") {
      this.isExpandRT = !this.isExpandRT;
    }
    if (tablename === "U_TABLE") {
      this.isExpandUT = !this.isExpandUT;
    }
  }

  ngOnDestroy() {
    const editProfileData = {
      profileId: this.activeProfile,
      searchCriteria: this.searchCriteria,
      profileList: this.allProfiles,
      totalCount: this.profilesTotalCount,
    };
    this.globalDataService.storeProfile(editProfileData);
    if (
      this.router.url !== "/admin/profiles/addprofile" &&
      this.router.url !== `/admin/profiles/editprofile/${this.activeProfile}`
    ) {
      this.globalDataService.storeProfileOnSelect([]);
    }
    this.allProfilesSubscription.unsubscribe();
    this.removeProfileSubscription.unsubscribe();
    this.sharedService.isProfileAction = false;
    this.sharedService.isNewProfileAdded = false;
    this.sharedService.backToURPG({
      isReturnToProfile: false,
      isReturnToRole: false,
      isReturnToGroup: false,
      isUpdate: false,
      isProfile: false,
      isRole: false,
      isGroup: false,
      isProfileUser: false,
      isRoleUser: false,
      userId: null,
      roleId: null,
      profileId: null,
      groupId: null,
      activeProfileId: null,
      activeRoleId: null,
      activeGroupId: null,
      isExpandPT: false,
      isExpandRT: false,
      isExpandUT: false
    });
    this.breadcrumb.visible = true;
    this.breadcrumb.previousHide(); // show hide breadcrumb
  }
}
