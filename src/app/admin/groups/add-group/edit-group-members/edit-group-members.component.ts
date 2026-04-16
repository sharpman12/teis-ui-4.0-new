import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { GroupsService } from '../../groups.service';
import { BreadCrumbService } from '../../../../core/service/breadcrumb.service';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-edit-group-members',
  templateUrl: './edit-group-members.component.html',
  styleUrls: ['./edit-group-members.component.scss']
})
export class EditGroupMembersComponent implements OnInit, AfterViewInit, OnDestroy {
  allUsers: Array<any> = [];
  term = '';
  path = '';
  heading = '';
  pageNo = 0;
  isMoreResultLinkShow = true;
  currentUser: any = null;

  @ViewChild('searchUser') searchUser: ElementRef;
  isSearching = false;
  searchTxt = '';

  getAllUsersSub = Subscription.EMPTY;

  constructor(
    public dialogRef: MatDialogRef<EditGroupMembersComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private groupsService: GroupsService,
    // private breadcrumb: BreadCrumbService,
    private router: Router,
  ) {
    dialogRef.disableClose = true;
    this.getAllUsers();
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit() {
    // this.breadcrumb.visible = false;
    // this.breadcrumb.previous(); // show hide breadcrumb
    this.path = this.router.url;
    if (this.path === '/admin/groups/addgroup') {
      this.heading = 'Add group member';
    } else {
      this.heading = 'Edit group member';
    }
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
      this.pageNo = 0;
      let uname;
      if (searchText === '') {
        uname = null;
      } else {
        uname = searchText;
      }
      // const SearchCriteria = {
      //   type: 'All',
      //   pageNumber: this.pageNo,
      //   name: uname
      // };

      const userType = this.dialogData.userType;
      const SearchCriteria = {
        type: 'All',
        pageNumber: this.pageNo,
        name: uname,
        excludeRecordId: null,
        userType: this.dialogData?.currentUser?.superAdminUser ? 'SA' : this.dialogData?.currentUser?.adminUser ? 'AU' : 'OU',
        includeSuperAdmin: userType === 'SA' ? true : false,
        includeAdmin: userType === 'AU' ? true : false,
        includeUser: userType === 'OU' ? true : false,
        profileId: null
      };

      this.groupsService.getAllUsers(SearchCriteria).subscribe(res => {
        this.isSearching = false;
        const users = JSON.parse(JSON.stringify(res?.users));
        if (users?.length) {
          users.map((x) => {
            x.isChecked = false;
            x.isUserConnectedWithGroup = false;
            x.isUserConnectedWithSameGroup = false;
          });

          // Apply the below logic only login user is superadmin Jira TEI-5314
          if (this.currentUser?.superAdminUser) {
            users.forEach((u) => {
              if (u?.userGroupList?.userGroups?.length) {
                u.isUserConnectedWithGroup = true;
              }
            });
          }

          this.dialogData.groupMembers.forEach(selectedUsers => {
            users.forEach((element) => {
              if (selectedUsers.id === element.id) {
                element.isChecked = true;
                // Apply the below logic only login user is superadmin Jira TEI-5314
                if (this.currentUser?.superAdminUser) {
                  element.isUserConnectedWithSameGroup = true;
                }
              }
            });
          });
          this.allUsers = users;
        }

        // this.checkPagination(res.totalCount, this.allUsers.length);
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

  /*================= Sort Users =================*/
  // sortUsers(allUsers: any[]) {
  //   return allUsers.sort((a, b) => a.firstName.localeCompare(b.firstName));
  // }
  /*================= END Sort Users =================*/

  /*============== Get All Users ===============*/
  getAllUsers() {
    const userType = this.dialogData.userType;
    const SearchCriteria = {
      type: 'All',
      pageNumber: this.pageNo,
      name: null,
      excludeRecordId: null,
      userType: this.dialogData?.currentUser?.superAdminUser ? 'SA' : this.dialogData?.currentUser?.adminUser ? 'AU' : 'OU',
      includeSuperAdmin: userType === 'SA' ? true : false,
      includeAdmin: userType === 'AU' ? true : false,
      includeUser: userType === 'OU' ? true : false,
      profileId: null
    };

    this.getAllUsersSub = this.groupsService.getAllUsers(SearchCriteria).subscribe(res => {
      const users = JSON.parse(JSON.stringify(res?.users));
      if (users?.length) {
        users.map((x) => {
          x.isChecked = false;
          x.isUserConnectedWithGroup = false;
          x.isUserConnectedWithSameGroup = false;
        });

        // Apply the below logic only login user is superadmin Jira TEI-5314
        if (this.currentUser?.superAdminUser) {
          users.forEach((u) => {
            if (u?.userGroupList?.userGroups?.length) {
              u.isUserConnectedWithGroup = true;
            }
          });
        }

        this.dialogData.groupMembers.forEach(selectedUsers => {
          users.forEach((element) => {
            if (selectedUsers.id === element.id) {
              element.isChecked = true;
              // Apply the below logic only login user is superadmin Jira TEI-5314
              if (this.currentUser?.superAdminUser) {
                element.isUserConnectedWithSameGroup = true;
              }
            }
          });
        });
        this.allUsers = users;
      }

      // this.checkPagination(res.totalCount, this.allUsers.length);
    });
  }

  /*================ Pagination ==================*/
  // getNextPageUser(event) {
  //   this.pageNo++;
  //   let uname;
  //   if (this.searchTxt === '') {
  //     uname = null;
  //   } else {
  //     uname = this.searchTxt;
  //   }
  //   const SearchCriteria = {
  //     type: 'All',
  //     pageNumber: this.pageNo,
  //     name: uname
  //   };
  //   // tslint:disable-next-line: deprecation
  //   this.groupsService.getAllUsers(SearchCriteria).subscribe(res => {
  //     const allUsers = this.allUsers.concat(res['users']);
  //     this.dialogData.groupMembers.forEach(selectedUsers => {
  //       allUsers.forEach(element => {
  //         if (selectedUsers.id === element.id) {
  //           element.isChecked = true;
  //         }
  //       });
  //     });
  //     this.allUsers = allUsers;
  //     this.checkPagination(res.totalCount, this.allUsers.length);
  //   }, (err: HttpErrorResponse) => {
  //     if (err.error instanceof Error) {
  //       // handle client side error here
  //     } else {
  //       // handle server side error here
  //     }
  //   });
  // }

  // checkPagination(totalCount, arrLength) {
  //   if (arrLength > 0 && totalCount > arrLength) {
  //     this.isMoreResultLinkShow = true;
  //   } else {
  //     this.isMoreResultLinkShow = false;
  //   }
  // }
  /*================ END Pagination ==================*/

  /*=============== Get Selected Users =============*/
  get selectedUsers() {
    return this.allUsers.filter(item => item.isChecked);
  }

  /*============== Save User ==============*/
  saveUser() {
    if (this.selectedUsers.length) {
      this.dialogRef.close(this.selectedUsers);
    }
  }

  /*============== Closed Model Pop up =============*/
  cancelledRequest() {
    this.dialogRef.close();
  }

  ngOnDestroy() {
    this.getAllUsersSub.unsubscribe();
    // this.breadcrumb.visible = true;
    // this.breadcrumb.previousHide(); // show hide breadcrumb
  }

}
