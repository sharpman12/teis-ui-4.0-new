import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, TreeNode } from 'primeng/api';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, take } from 'rxjs/operators';
import { SharedService } from '../../shared/services/shared.service';
import { ConfirmationComponent } from '../../shared/components/confirmation/confirmation.component';
import { GlobalDataService } from '../global-data.service';
import { EditModules } from './editmodules';
import { RolesService } from './roles.service';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { Constants } from 'src/app/shared/components/constants';

export interface NewTreeNode extends TreeNode {
  isSelected?: boolean;
  children?: NewTreeNode[];
}

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit, AfterViewInit, OnDestroy {
  allRoles: Array<any> = [];
  activeRole: any = 1;
  role: any;
  term = '';

  pageNo = 1;
  isMoreResultLinkShow = true;

  public arrTree: NewTreeNode[] = [];
  public selectedArrTree: NewTreeNode[] = [];
  selectedFile: any[] = [];
  moduleTreeArr: any;
  isShowSelectedOnly = true;

  @ViewChild('searchRole') searchRole: ElementRef;
  isSearching = false;
  searchTxt = '';
  searchRoleName: string;
  rolesTotalCount: number;
  isExpandPT = false;
  isExpandUT = false;
  rolesArr = [];
  isAdminCURDAccess: boolean = false;
  currentUser: any = null;
  isSuperAdmin: boolean = true;
  isAdmin: boolean = true;
  isOrdinaryUser: boolean = true;
  isUpdateProfileFromRole: boolean = false;
  isUserUpdate: boolean = false;

  searchCriteria = {
    type: 'All',
    pageNumber: this.pageNo,
    name: null,
    excludeRecordId: null,
    userType: '',
    includeSuperAdmin: false,
    includeAdmin: false,
    includeUser: false,
    profileId: null
  };

  removeRoleSubscription = Subscription.EMPTY;
  allRolesSubscription = Subscription.EMPTY;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private rolesService: RolesService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private globalDataService: GlobalDataService,
    private breadcrumb: BreadCrumbService,
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
    this.allRoles = [];
    if (this.sharedService.isRoleAction) {
      const roles = this.globalDataService.getRoles();
      if (roles?.roleList?.length) {
        this.allRoles = roles?.roleList;
        this.rolesTotalCount = roles.totalCount;
        this.pageNo = roles?.searchCriteria?.pageNumber;
        this.searchTxt = roles?.searchCriteria?.name;
        this.isSuperAdmin = roles?.searchCriteria?.includeSuperAdmin;
        this.isAdmin = roles?.searchCriteria?.includeAdmin;
        this.isOrdinaryUser = roles?.searchCriteria?.includeUser;

        this.searchCriteria = this.getSearchCriteria('All', this.pageNo, roles?.searchCriteria?.name, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

        if (roles?.searchCriteria?.name) {
          this.searchRoleName = roles?.searchCriteria?.name;
        }
        this.getRoleById(roles?.roleId);
        this.checkPagination(this.rolesTotalCount, this.allRoles.length);
      } else {
        this.getAllRoles();
      }
    } else {
      this.searchCriteria = this.getSearchCriteria('All', this.pageNo, '', null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
      this.sharedService.returnToURPG.pipe(take(1)).subscribe((res) => {
        this.isUserUpdate = res?.isUpdate;
        this.getRoles(res?.activeRoleId, res?.isExpandPT, res?.isExpandUT);
      });
    }
  }

  ngAfterViewInit() {
    /*---------------------- Search Functionality ----------------------*/
    const searchTerm = fromEvent<any>(this.searchRole.nativeElement, 'keyup').pipe(
      map(event => {
        this.isSearching = true;
        return event.target.value;
      }),
      debounceTime(1000),
      distinctUntilChanged()
    );
    // tslint:disable-next-line: deprecation
    searchTerm.subscribe(searchText => {
      this.searchTxt = searchText;
      this.allRoles = [];
      this.pageNo = 1;
      let rname;
      if (searchText === '') {
        rname = null;
      } else {
        rname = searchText;
      }
      // const SearchCriteria = {
      //   type: 'All',
      //   pageNumber: this.pageNo,
      //   name: rname,
      //   excludeRecordId: null
      // };
      // this.searchCriteria = SearchCriteria;

      const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
      this.searchCriteria = this.getSearchCriteria('All', this.pageNo, rname, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

      this.allRolesSubscription = this.rolesService.getAllRoles(this.searchCriteria).subscribe(res => {
        this.isSearching = false;
        this.allRoles = res['roles'];
        this.rolesTotalCount = res?.totalCount;
        if (this.allRoles.length) {
          this.getRoleById(this.allRoles[0].id);
        }
        this.checkPagination(res.totalCount, this.allRoles.length);
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
    this.allRoles = [];
    this.pageNo = 1;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = this.getSearchCriteria('All', this.pageNo, this.searchTxt, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
    this.searchCriteria = SearchCriteria;

    this.allRolesSubscription = this.rolesService.getAllRoles(SearchCriteria).subscribe(res => {
      this.allRoles = res['roles'];
      this.rolesTotalCount = res?.totalCount;
      if (this.allRoles.length) {
        this.getRoleById(this.allRoles[0].id);
      }
      this.checkPagination(res.totalCount, this.allRoles.length);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  updateProfile(profileId: number) {
    this.sharedService.updateURPG({
      isUpdate: true,
      isProfile: false,
      isRole: true,
      isGroup: false,
      isProfileUser: false,
      isRoleUser: false,
      userId: null,
      roleId: null,
      profileId: profileId,
      groupId: null,
      activeProfileId: null,
      activeRoleId: this.activeRole,
      activeGroupId: null,
      isExpandPT: this.isExpandPT,
      isExpandRT: false,
      isExpandUT: this.isExpandUT
    });
    this.router.navigate([`/admin/profiles/editprofile/${profileId}`]);
  }

  updateUser(userId: number) {
    this.sharedService.updateURPG({
      isUpdate: true,
      isProfile: false,
      isRole: true,
      isGroup: false,
      isProfileUser: false,
      isRoleUser: true,
      userId: userId,
      roleId: null,
      profileId: null,
      groupId: null,
      activeProfileId: null,
      activeRoleId: this.activeRole,
      activeGroupId: null,
      isExpandPT: this.isExpandPT,
      isExpandRT: false,
      isExpandUT: this.isExpandUT
    });
    this.router.navigate([`/admin/users/edituser/${userId}`]);
  }

  /*=================== Get All Roles ===================*/

  /*--------------- Get Data From Resolve Gaurd ---------------*/
  getRoles(roleId: string, isExpandPT: boolean, isExpandUT: boolean) {
    const roles = this.activatedRoute.snapshot.data.adminRoles;
    this.allRoles = roles['roles'];
    this.rolesTotalCount = roles?.totalCount;
    if (this.allRoles.length) {
      if (roleId) {
        this.getRoleById(roleId, isExpandPT, isExpandUT);
      } else {
        this.getRoleById(this.allRoles[0].id, isExpandPT, isExpandUT);
      }
    }
    this.checkPagination(roles.totalCount, this.allRoles.length);
  }

  /*--------------- Call only when role is deleted ---------------*/
  getAllRoles() {
    this.allRoles = [];
    this.pageNo = 1;
    // const SearchCriteria = {
    //   type: 'All',
    //   pageNumber: this.pageNo,
    //   name: null,
    //   excludeRecordId: null
    // };
    // this.searchCriteria = SearchCriteria;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    this.searchCriteria = this.getSearchCriteria('All', this.pageNo, null, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

    this.allRolesSubscription = this.rolesService.getAllRoles(this.searchCriteria).subscribe(res => {
      this.allRoles = res['roles'];
      this.rolesTotalCount = res?.totalCount;
      if (this.allRoles.length) {
        this.getRoleById(this.allRoles[0].id);
      }
      this.checkPagination(res.totalCount, this.allRoles.length);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=================== END Get All Roles ===================*/

  /*================ Pagination ==================*/
  getNextPageRole(event) {
    this.pageNo++;
    let rname;
    if (this.searchTxt === '') {
      rname = null;
    } else {
      rname = this.searchTxt;
    }
    let excludeRecordId;
    if (this.sharedService.isNewRoleAdded) {
      excludeRecordId = this.allRoles[0].id;
    } else {
      excludeRecordId = null;
    }
    // const SearchCriteria = {
    //   type: 'All',
    //   pageNumber: this.pageNo,
    //   name: rname,
    //   excludeRecordId: excludeRecordId
    // };
    // this.searchCriteria = SearchCriteria;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    this.searchCriteria = this.getSearchCriteria('All', this.pageNo, rname, excludeRecordId, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

    this.allRolesSubscription = this.rolesService.getAllRoles(this.searchCriteria).subscribe(res => {
      res['roles'].forEach((element: any) => {
        if (this.allRoles[0].id === element.id) {
          const index = res['roles'].indexOf(element.id);
          res['roles'].splice(index, 1);
        }
      });
      const allRoles = this.allRoles.concat(res['roles']);
      this.allRoles = allRoles;
      this.rolesTotalCount = res?.totalCount;
      this.checkPagination(res.totalCount, this.allRoles.length);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  checkPagination(totalCount, arrLength) {
    if (arrLength > 0 && totalCount > arrLength) {
      this.isMoreResultLinkShow = true;
    } else {
      this.isMoreResultLinkShow = false;
    }
  }
  /*================ END Pagination ==================*/

  /*=================== Get Role By Id =====================*/
  getRoleById(roleId: any, isExpandPT: boolean = false, isExpandUT: boolean = false) {
    this.isShowSelectedOnly = false;
    this.isExpandPT = isExpandPT;
    this.isExpandUT = isExpandUT;
    this.arrTree = [];
    this.selectedArrTree = [];
    this.activeRole = roleId;

    let role;
    // const allRoles = this.globalDataService.getRolesOnSelect();
    this.rolesArr = this.globalDataService.getRolesOnSelect();
    if (this.rolesArr?.length) {
      this.rolesArr.forEach(element => {
        if (element.id === this.activeRole) {
          role = element;
        }
      });
    }

    if (role) {
      this.role = role;
      this.moduleTreeArr = this.role.modulesTree;
      this.createModuleTree(this.role.modulesTree);
    } else {
      this.rolesService.getRoleDetailsById(this.activeRole).subscribe(res => {
        this.role = res;
        this.moduleTreeArr = this.role.modulesTree;
        this.createModuleTree(this.role.modulesTree);
        this.rolesArr.push(res);
        this.globalDataService.storeRolesOnSelect(this.rolesArr);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*=================== END Get Role By Id =====================*/

  createModuleTree(modulesTree: Array<any>) {
    let modules = null;
    let nodeArray: TreeNode;
    modulesTree.forEach(module => {
      modules = JSON.parse(module);

      if (this.currentUser?.adminUser) {
        if (!this.role?.adminRole) {
          if (modules?.id === 13 && modules?.name === 'Workspace Management') {
            // IDs to filter out
            const excludeIds = [122, 145, 146];

            // Filter array to exclude these ids
            const filteredArr = modules?.children.filter(obj => !excludeIds.includes(obj.id));
            modules.children = filteredArr;
          }
        }
      }

      nodeArray = new EditModules(modules, 0);
      this.setNodeAsDisabled(nodeArray);
      this.countSeletedNode(nodeArray, true);
      this.arrTree.push(nodeArray);
      this.selectedArrTree.push(nodeArray);
      this.arrTree = this.getValidTreeNodeItems(this.selectedArrTree);
    });
  }

  /*=================== Show Selected Only ====================*/
  showSelectedOnly() {
    this.isShowSelectedOnly = !this.isShowSelectedOnly;
    if (this.isShowSelectedOnly) {
      this.arrTree = [];
      const allArrTree = [];
      let modules = null;
      let nodeArray: TreeNode;
      this.moduleTreeArr.forEach(module => {
        modules = JSON.parse(module);

        if (this.currentUser?.adminUser) {
          if (modules?.id === 13 && modules?.name === 'Workspace Management') {
            // IDs to filter out
            const excludeIds = [122, 145, 146];

            // Filter array to exclude these ids
            const filteredArr = modules?.children.filter(obj => !excludeIds.includes(obj.id));
            modules.children = filteredArr;
          }
        }

        nodeArray = new EditModules(modules, 0);
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
  /*=================== END Check Selected Tree Node ===================*/

  /*=================== Edit Role ====================*/
  editRole(roleId: any) {
    this.router.navigate(['admin/roles/editrole/' + roleId]);
  }
  /*=================== END Edit Role ====================*/

  /*=================== Removed Role ====================*/
  removeRole(roleId: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '330px',
      panelClass: 'myapp-no-padding-dialog',
      data: 'Are you sure you want to remove this role?',
    });
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // tslint:disable-next-line: deprecation
        this.removeRoleSubscription = this.rolesService.deleteRole(roleId).subscribe(res => {
          this.searchRole.nativeElement.value = '';
          this.searchTxt = '';
          this.getAllRoles();
          this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'Role Deleted Successfully!' });
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

  /*================ Exapnd/Collapse Table on Select ================*/
  onToggle(tablename: string) {
    if (tablename === 'P_TABLE') {
      this.isExpandPT = !this.isExpandPT;
    }
    if (tablename === 'U_TABLE') {
      this.isExpandUT = !this.isExpandUT;
    }
  }
  /*================ END Exapnd/Collapse Table on Select ================*/

  ngOnDestroy() {
    const editRoleData = {
      roleId: this.activeRole,
      searchCriteria: this.searchCriteria,
      roleList: this.allRoles,
      totalCount: this.rolesTotalCount
    };
    this.globalDataService.storeRole(editRoleData);
    if (this.router.url !== '/admin/roles/addrole' && this.router.url !== `/admin/roles/editrole/${this.activeRole}`) {
      this.globalDataService.storeRolesOnSelect([]);
    }
    this.removeRoleSubscription.unsubscribe();
    this.allRolesSubscription.unsubscribe();
    this.sharedService.isRoleAction = false;
    this.sharedService.isNewRoleAdded = false;
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
