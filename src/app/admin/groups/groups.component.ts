import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { SharedService } from '../../shared/services/shared.service';
import { ConfirmationComponent } from '../../shared/components/confirmation/confirmation.component';
import { GroupsService } from './groups.service';
import { GlobalDataService } from '../global-data.service';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit, AfterViewInit, OnDestroy {
  allGroups: Array<any> = [];
  activeGroup: any = 1;
  group: any;
  term = '';
  pageNo = 1;
  isMoreResultLinkShow = true;
  groupsTotalCount: number;
  isAdminCURDAccess: boolean = false;
  isSuperAdmin: boolean = true;
  isAdmin: boolean = true;
  isOrdinaryUser: boolean = true;

  @ViewChild('searchGroup') searchGroup: ElementRef;
  isSearching = false;
  searchTxt = '';
  searchGroupName: string;
  currentUser: any = null;

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

  removeGroupSubscription = Subscription.EMPTY;
  allGroupsSubscription = Subscription.EMPTY;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private groupsService: GroupsService,
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
    this.allGroups = [];

    if (this.sharedService.isGroupAction) {
      const groups = this.globalDataService.getGroups();
      if (groups?.groupList?.length) {
        this.allGroups = groups?.groupList;
        this.groupsTotalCount = groups?.totalCount;
        this.pageNo = groups?.searchCriteria?.pageNumber;
        this.searchTxt = groups?.searchCriteria?.name;
        this.isSuperAdmin = groups?.searchCriteria?.includeSuperAdmin;
        this.isAdmin = groups?.searchCriteria?.includeAdmin;
        this.isOrdinaryUser = groups?.searchCriteria?.includeUser;

        this.searchCriteria = this.getSearchCriteria('All', this.pageNo, groups?.searchCriteria?.name, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

        if (groups?.searchCriteria?.name) {
          this.searchGroupName = groups?.searchCriteria?.name;
        }
        this.getGroupById(groups?.groupId);
        this.checkPagination(this.groupsTotalCount, this.allGroups.length);
      } else {
        this.getAllGroups();
      }
    } else {
      this.searchCriteria = this.getSearchCriteria('All', this.pageNo, '', null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
      this.sharedService.returnToGroupPage.subscribe(res => {
        this.getGroups(res);
      });
    }
  }

  ngAfterViewInit() {
    /*---------------------- Search Functionality ----------------------*/
    const searchTerm = fromEvent<any>(this.searchGroup.nativeElement, 'keyup').pipe(
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
      this.allGroups = [];
      this.pageNo = 1;
      let gname;
      if (searchText === '') {
        gname = null;
      } else {
        gname = searchText;
      }
      // const SearchCriteria = {
      //   type: 'All',
      //   pageNumber: this.pageNo,
      //   name: gname,
      //   excludeRecordId: null
      // };
      // this.searchCriteria = SearchCriteria;

      const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
      this.searchCriteria = this.getSearchCriteria('All', this.pageNo, gname, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

      this.allGroupsSubscription = this.groupsService.getAllGroups(this.searchCriteria).subscribe(res => {
        this.isSearching = false;
        this.allGroups = res['userGroups'];
        this.groupsTotalCount = res?.totalCount;
        if (this.allGroups.length) {
          this.getGroupById(this.allGroups[0].id);
        }
        this.checkPagination(res.totalCount, this.allGroups.length);
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

  /*================ Get All Groups ================*/

  onChangeFilter() {
    this.allGroups = [];
    this.pageNo = 1;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = this.getSearchCriteria('All', this.pageNo, this.searchTxt, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
    this.searchCriteria = SearchCriteria;

    this.allGroupsSubscription = this.groupsService.getAllGroups(SearchCriteria).subscribe(res => {
      this.isSearching = false;
      this.allGroups = res['userGroups'];
      this.groupsTotalCount = res?.totalCount;
      if (this.allGroups.length) {
        this.getGroupById(this.allGroups[0].id);
      }
      this.checkPagination(res.totalCount, this.allGroups.length);
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

  /*--------------- Get Data From Resolve Gaurd ---------------*/
  getGroups(group: any) {
    const groups = this.activatedRoute.snapshot.data.adminGroups;
    this.allGroups = groups['userGroups'];
    this.groupsTotalCount = groups?.totalCount;
    this.allGroups.forEach(element => {
      if (element.id === group.groupId) {
        element.users.forEach(user => {
          if (user.id === group.userId) {
            user.recentlyUpdated = true;
          }
        });
      }
    });
    let grpId;
    if (group.groupId !== '') {
      grpId = group.groupId;
    } else {
      if (this.allGroups?.length) {
        grpId = this.allGroups[0].id;
      }
    }
    if (this.allGroups.length) {
      this.activeGroup = this.allGroups[0].id;
      this.getGroupById(grpId);
    }
    this.checkPagination(groups.totalCount, this.allGroups.length);
  }

  /*--------------- Call only when group is deleted ---------------*/
  getAllGroups() {
    this.allGroups = [];
    this.pageNo = 1;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    this.searchCriteria = this.getSearchCriteria('All', this.pageNo, null, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

    this.groupsService.getAllGroups(this.searchCriteria).subscribe(res => {
      this.allGroups = res['userGroups'];
      this.groupsTotalCount = res?.totalCount;
      if (this.allGroups.length) {
        this.getGroupById(this.allGroups[0].id);
      }
      this.checkPagination(res.totalCount, this.allGroups.length);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*================ END Get All Groups ================*/

  /*================ Pagination ==================*/
  getNextPageUserGroup(event) {
    this.pageNo++;
    let gname;
    if (this.searchTxt === '') {
      gname = null;
    } else {
      gname = this.searchTxt;
    }
    let excludeRecordId;
    if (this.sharedService.isNewGroupAdded) {
      excludeRecordId = this.allGroups[0].id;
    } else {
      excludeRecordId = null;
    }
    // const SearchCriteria = {
    //   type: 'All',
    //   pageNumber: this.pageNo,
    //   name: gname,
    //   excludeRecordId: excludeRecordId
    // };
    // this.searchCriteria = SearchCriteria;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    this.searchCriteria = this.getSearchCriteria('All', this.pageNo, gname, excludeRecordId, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

    this.groupsService.getAllGroups(this.searchCriteria).subscribe(res => {
      res['userGroups'].forEach((element: any) => {
        if (this.allGroups[0].id === element.id) {
          const index = res['userGroups'].indexOf(element.id);
          res['userGroups'].splice(index, 1);
        }
      });
      const allGroups = this.allGroups.concat(res['userGroups']);
      this.allGroups = allGroups;
      this.groupsTotalCount = res?.totalCount;
      this.checkPagination(res.totalCount, this.allGroups.length);
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

  /*================ Get Group By Id ==================*/
  getGroupById(groupId: any) {
    this.activeGroup = groupId;
    this.allGroups.forEach((element: any) => {
      if (element.id === groupId) {
        this.group = element;
      }
    });
  }
  /*================ END Get Group By Id ==================*/

  /*================= Edit Group ===================*/
  editGroup(id: any) {
    this.router.navigate(['admin/groups/editgroup/' + id]);
  }

  /*================= Update User ==================*/
  updateUser(userId: any) {
    this.sharedService.updateGroupMember.next({ isUpdate: true, groupId: this.activeGroup, userId: userId });
    this.router.navigate(['admin/users/edituser/' + userId]);
  }

  /*================= Removed Group =====================*/
  removeGroup(groupId: string) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '330px',
      panelClass: 'myapp-no-padding-dialog',
      data: 'Are you sure you want to remove this group?',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // tslint:disable-next-line: deprecation
        this.removeGroupSubscription = this.groupsService.deleteGroup(groupId).subscribe(res => {
          this.searchGroup.nativeElement.value = '';
          this.searchTxt = '';
          this.getAllGroups();
          this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'Group Deleted Successfully!' });
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
  /*================= END Removed Group =====================*/

  ngOnDestroy() {
    const editGroupData = {
      groupId: this.activeGroup,
      searchCriteria: this.searchCriteria,
      groupList: this.allGroups,
      totalCount: this.groupsTotalCount
    };
    this.globalDataService.storeGroup(editGroupData);
    this.removeGroupSubscription.unsubscribe();
    this.allGroupsSubscription.unsubscribe();
    this.sharedService.returnToGroupPage.next({ isUpdate: false, groupId: '', userId: '' });
    this.sharedService.isGroupAction = false;
    this.sharedService.isNewGroupAdded = false;
    this.breadcrumb.visible = true;
    this.breadcrumb.previousHide(); // show hide breadcrumb
  }

}
