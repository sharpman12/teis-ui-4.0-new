import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, pluck, switchMap, take } from 'rxjs/operators';
import { ConfirmationComponent } from '../../shared/components/confirmation/confirmation.component';
import { SharedService } from '../../shared/services/shared.service';
import { GlobalDataService } from '../global-data.service';
import { ProfileDetailsComponent } from '../profiles/profile-details/profile-details.component';
import { UsersService } from './users.service';
import { BreadCrumbService } from '../../core/service/breadcrumb.service';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  activeUser: any = 1;
  allUsers: Array<any> = [];
  user: any = null;
  pageNo = 1;
  isMoreResultLinkShow = true;

  @ViewChild('searchUser') searchUser: ElementRef;
  isSearching = false;
  searchTxt = '';
  searchUserName: string;
  isSuperAdmin: boolean = false;
  isAdmin: boolean = false;
  isOrdinaryUser: boolean = false;
  isAdminCURDAccess: boolean = false;
  currentUser: any = null;
  filterUsersByType: string = 'SA';

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
  usersTotalCount: number;

  removeUserSubscription = Subscription.EMPTY;
  allUsersSubscription = Subscription.EMPTY;
  isLastAdminUserSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private usersService: UsersService,
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
    if (this.currentUser?.superAdminUser) {
      this.filterUsersByType = 'SA';
    } else if (this.currentUser?.adminUser) {
      this.filterUsersByType = 'AU';
    } else {
      this.filterUsersByType = 'SA';
    }
    if (localStorage.getItem(Constants.USER_MANAGEMENT_CRUD)) {
      this.isAdminCURDAccess = true;
    }
    if (localStorage.getItem('source') || this.router.url === '/admin/users') {
      this.breadcrumb.visible = true;
      this.breadcrumb.previousHide(); // show hide breadcrumb
    } else {
      this.breadcrumb.visible = false;
      this.breadcrumb.previous(); // show hide breadcrumb
    }
    this.allUsers = [];
    if (this.sharedService.isUserAction) {
      const users = this.globalDataService.getUsers();
      if (users?.userList?.length > 0) {
        this.allUsers = users?.userList;
        this.usersTotalCount = users?.totalCount;
        this.pageNo = users?.searchCriteria?.pageNumber;
        this.searchTxt = users?.searchCriteria?.name;
        this.isSuperAdmin = users?.searchCriteria?.includeSuperAdmin;
        this.isAdmin = users?.searchCriteria?.includeAdmin;
        this.isOrdinaryUser = users?.searchCriteria?.includeUser;

        this.searchCriteria = this.getSearchCriteria('All', users?.searchCriteria?.pageNumber, users?.searchCriteria?.name, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

        if (users?.searchCriteria?.name) {
          this.searchUserName = users?.searchCriteria?.name;
        }
        this.getUserById(users?.userId);
        this.checkPagination(this.usersTotalCount, this.allUsers.length);
      } else {
        this.getAllUsers();
      }
    } else {
      this.searchCriteria = this.getSearchCriteria('All', this.pageNo, '', null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
      this.getUsers();
    }
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

  ngAfterViewInit() {
    /*---------------------- Search Functionality ----------------------*/
    const searchTerm = fromEvent<any>(this.searchUser.nativeElement, 'keyup').pipe(
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
      this.allUsers = [];
      this.pageNo = 1;
      let uname;
      if (searchText === '') {
        uname = null;
      } else {
        uname = searchText;
      }
      // const SearchCriteria = {
      //   type: 'All',
      //   pageNumber: this.pageNo,
      //   name: uname,
      //   excludeRecordId: null,
      //   userType: 'OU',
      //   includeSuperAdmin: false,
      //   includeAdmin: false,
      //   includeUser: false,
      //   profileId: null
      // };
      const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
      const SearchCriteria = this.getSearchCriteria('All', this.pageNo, uname, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
      this.searchCriteria = SearchCriteria;
      // tslint:disable-next-line: deprecation
      this.allUsersSubscription = this.usersService.getAllUsers(SearchCriteria).subscribe(res => {
        this.isSearching = false;
        this.allUsers = res['users'];
        this.usersTotalCount = res?.totalCount;
        if (this.allUsers.length) {
          this.getUserById(this.allUsers[0].id);
        }
        this.checkPagination(res.totalCount, this.allUsers.length);
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

  onChangeFilter() {
    this.allUsers = [];
    this.pageNo = 1;

    // This commented code is for Radio Buttons Filter

    // this.isSuperAdmin = false;
    // this.isAdmin = false;
    // this.isOrdinaryUser = false;

    // if (this.filterUsersByType === 'SA') {
    //   this.isSuperAdmin = true;
    // } else if (this.filterUsersByType === 'AU') {
    //   this.isAdmin = true;
    // } else if (this.filterUsersByType === 'OU') {
    //   this.isOrdinaryUser = true;
    // } else {
    //   this.isSuperAdmin = false;
    //   this.isAdmin = false;
    //   this.isOrdinaryUser = false;
    // }

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = this.getSearchCriteria('All', this.pageNo, this.searchTxt, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
    this.searchCriteria = SearchCriteria;

    this.allUsersSubscription = this.usersService.getAllUsers(SearchCriteria).subscribe((res) => {
      this.isSearching = false;
      this.allUsers = res['users'];
      this.usersTotalCount = res?.totalCount;
      if (this.allUsers.length) {
        this.getUserById(this.allUsers[0].id);
      }
      this.checkPagination(res.totalCount, this.allUsers.length);
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

  /*================ Get All Users ===============*/
  /*--------------- Get Data From Resolve Gaurd ---------------*/
  getUsers() {
    const users = this.activatedRoute.snapshot.data.adminUsers;
    this.allUsers = users['users'];
    this.usersTotalCount = users?.totalCount;
    if (this.allUsers.length) {
      this.getUserById(this.allUsers[0].id);
    }
    this.checkPagination(users.totalCount, this.allUsers.length);
  }

  /*--------------- Call only when user is deleted ---------------*/
  getAllUsers() {
    this.allUsers = [];
    this.pageNo = 1;

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = this.getSearchCriteria('All', this.pageNo, null, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);
    this.searchCriteria = SearchCriteria;

    this.allUsersSubscription = this.usersService.getAllUsers(SearchCriteria).subscribe(res => {
      this.allUsers = res['users'];
      this.usersTotalCount = res?.totalCount;
      if (this.allUsers.length) {
        this.getUserById(this.allUsers[0].id);
      }
      this.checkPagination(res.totalCount, this.allUsers.length);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*================ END Get All Users ===============*/

  /*================ Pagination ==================*/
  getNextPageUser(event) {
    this.pageNo++;
    let uname;
    if (this.searchTxt === '') {
      uname = null;
    } else {
      uname = this.searchTxt;
    }
    let excludeRecordId;
    if (this.sharedService.isNewUserAdded) {
      excludeRecordId = this.allUsers[0].id;
    } else {
      excludeRecordId = null;
    }
    // const SearchCriteria = {
    //   type: 'All',
    //   pageNumber: this.pageNo,
    //   name: uname,
    //   excludeRecordId: excludeRecordId,
    //   userType: '',
    //   includeSuperAdmin: false,
    //   includeAdmin: false,
    //   includeUser: false,
    //   profileId: null
    // };

    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = this.getSearchCriteria('All', this.pageNo, uname, null, userType, this.isSuperAdmin, this.isAdmin, this.isOrdinaryUser, null);

    this.searchCriteria = SearchCriteria;
    this.allUsersSubscription = this.usersService.getAllUsers(SearchCriteria).subscribe(res => {
      res['users'].forEach((element: any) => {
        if (this.allUsers[0].id === element.id) {
          const index = res['users'].indexOf(element.id);
          res['users'].splice(index, 1);
        }
      });
      const allUsers = this.allUsers.concat(res['users']);
      this.allUsers = allUsers;
      this.usersTotalCount = res?.totalCount;
      this.checkPagination(res.totalCount, this.allUsers.length);
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

  /*================ Get User By Id ===============*/
  getUserById(userId: any) {
    this.activeUser = userId;
    this.allUsers.forEach((element: any) => {
      // tslint:disable-next-line: radix
      if (parseInt(element.id) === parseInt(userId)) {
        this.user = element;
      }
    });
  }
  /*================ END Get User By Id ===============*/

  /*================ Navigate To Add User Page ===============*/
  addUserPage() {
    this.router.navigate(['../adduser']);
  }
  /*================ END Navigate To Add User Page ===============*/

  /*================ Navigate To Edit User Page ===============*/
  editUser(user: any) {
    this.router.navigate(['admin/users/edituser/' + user?.id]);
  }
  /*================ END Navigate To Edit User Page ===============*/

  /*================ View Profiles Details ================*/
  getProfileDetails(id: any) {
    const dialogRef = this.dialog.open(ProfileDetailsComponent, {
      width: "700px",
      maxHeight: '95vh',
      height: '95%',
      data: id
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) { }
    });
  }
  /*================ END View Profiles Details ================*/

  /*================ Remove User ===============*/
  removeUser(user: any) {
    if (this.currentUser?.superAdminUser) {
      const profileId = user?.userGroupList?.userGroups[0]?.profile?.id;
      
      if (profileId == null) {
        this.deleteUser(user);
        return;
      }

      this.isLastAdminUserSub = this.usersService.isLastUserAttachedToProfile(profileId).subscribe((res) => {
        if (res) {
          const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '600px',
            panelClass: 'myapp-no-padding-dialog',
            data: `You are about to delete the last admin user in the Admin group. Are you sure you want to proceed?`,
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              // this.deleteUser(user);
              this.trashUser(user);
            }
          });
        } else {
          this.deleteUser(user);
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    } else {
      this.deleteUser(user);
    }
  }

  deleteUser(user: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '330px',
      panelClass: 'myapp-no-padding-dialog',
      data: 'Are you sure you want to remove this user?',
    });
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.trashUser(user);
      }
    });
  }

  trashUser(user: any) {
    this.removeUserSubscription = this.usersService.deleteUser(user?.id).subscribe(res => {
      this.searchUser.nativeElement.value = '';
      this.searchTxt = '';
      this.getAllUsers();
      this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'User Deleted Successfully!' });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*================ END Remove User ===============*/

  openKeycloakAdmin() {
    const baseUrl = window.location.origin;
    window.open(`${baseUrl}/auth`, '_blank');
    // window.open(`https://wpg02xvfx:8693/auth`, '_blank');
  }

  ngOnDestroy() {
    const editUserData = {
      userId: this.activeUser,
      searchCriteria: this.searchCriteria,
      userList: this.allUsers,
      totalCount: this.usersTotalCount
    };
    this.globalDataService.storeUsers(editUserData);
    this.removeUserSubscription.unsubscribe();
    this.allUsersSubscription.unsubscribe();
    this.sharedService.isUserAction = false;
    this.sharedService.isGroupAction = false;
    this.sharedService.isNewUserAdded = false;
    this.breadcrumb.visible = true;
    this.breadcrumb.previousHide(); // show hide breadcrumb
    this.isLastAdminUserSub.unsubscribe();
  }

}
