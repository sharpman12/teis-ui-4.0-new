import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/components/constants';
import { SharedService } from '../../../shared/services/shared.service';
import { GlobalDataService } from '../../global-data.service';
import { CreateProfileFromGroup, CreateUserFromGroup, Groups } from '../groups';
import { GroupsService } from '../groups.service';
import { EditGroupMembersComponent } from './edit-group-members/edit-group-members.component';
import { BreadCrumbService } from '../../../core/service/breadcrumb.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { Profiles } from '../../profiles/profiles';
import { ProfilesService } from '../../profiles/profiles.service';
import { take } from 'rxjs/operators';
import { CreateGroupFromUser } from '../../users/users';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss'],
})
export class AddGroupComponent implements OnInit, OnDestroy {
  subHeading = '';
  path = '';
  groupForm: UntypedFormGroup;
  groupMembers: Array<any> = [];
  selectedGroupMembers: Array<any> = [];
  groupId: string;
  currentUser: any = null;
  allProfiles: Array<Profiles> = [];
  selectedProfile: any = null;
  addEditMembers: string;
  username: any;
  showErrMsg = false;
  isGroupNamePresent: boolean;
  filteredUserTypes: Array<any> = [];
  selectedUserType: string = 'AU';
  isAddEditGroupMembersDisabled: boolean = false;
  filteredProfileArr: Array<any> = [];
  createGrpFromUser: CreateGroupFromUser = null;
  createProfileForGrp: CreateProfileFromGroup = null;

  userTypeArr: Array<any> = [
    { id: 'AU', name: 'Admin', adminUser: true, superAdminUser: false, otherUser: false },
    { id: 'SA', name: 'Super Admin', adminUser: false, superAdminUser: true, otherUser: false },
    { id: 'OU', name: 'Ordinary User', adminUser: false, superAdminUser: false, otherUser: true }
  ];

  validationMessages = {
    name: {
      required: 'Group name is required',
      maxlength: 'Name must not be more than 128 characters',
      hasWhitespace: "Whitespace not allowed"
    },
    description: {
      required: 'Description is required',
    },
    profile: {
      required: 'Profile is required',
    }
  };

  formErrors = {
    name: '',
    description: '',
    profile: ''
  };

  createGroupSubscriptions = Subscription.EMPTY;
  updateGroupSubscriptions = Subscription.EMPTY;
  getAllProfilesSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private location: Location,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private messageService: MessageService,
    private groupsService: GroupsService,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private globalDataService: GlobalDataService,
    private breadcrumb: BreadCrumbService,
    private profilesService: ProfilesService,
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit() {
    this.breadcrumb.visible = false;
    this.breadcrumb.previous(); // show hide breadcrumb
    this.createForm();
    this.path = this.router.url;
    if (this.path === '/admin/groups/addgroup') {
      this.subHeading = 'Add group';
      this.addEditMembers = 'Add group members';
      if (this.currentUser?.superAdminUser) {
        this.groupForm.get('userType').patchValue('AU');
        this.groupForm.get('userType').disable();
      } else if (this.currentUser?.adminUser) {
        this.groupForm.get('userType').patchValue('OU');
        this.groupForm.get('userType').disable();
      } else {
        this.groupForm.get('userType').enable();
      }
      this.getAllProfiles();
      // Create Group From User
      this.sharedService.createGroup.pipe(take(1)).subscribe((res) => {
        this.createGrpFromUser = res;
      });
    } else {
      this.subHeading = 'Update group';
      this.addEditMembers = 'Edit group members';
      this.activatedRoute.params.subscribe(params => {
        if (params.id) {
          this.groupId = params.id;
          this.getGroupById(this.groupId);
        }
      });
    }

    /*=========== Get Current User Data From LocalStroage ============*/
    this.username = localStorage.getItem(Constants.USERNAME);
    /*=========== Get Current User Data From LocalStroage ============*/

    this.groupForm.get('name').valueChanges.subscribe(res => {
      this.isGroupNamePresent = false;
    });

    this.filterUserTypeArr();
  }

  /*=================== Create Form ===================*/
  createForm() {
    this.groupForm = this.fb.group({
      userType: [{ value: 'OU', disabled: false }, {
        validators: []
      }],
      name: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      description: [{ value: '', disabled: false }, {
        validators: [

        ]
      }],
      profile: [{ value: '', disabled: false }, {
        validators: [
          Validators.required
        ]
      }],
      color: [{ value: 'sky_magenta', disabled: false }, {
        validators: [Validators.required]
      }],
    });
    // tslint:disable-next-line: deprecation
    this.groupForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.groupForm);
    });
  }
  /*=================== END Create Form ===================*/

  /*============Check Form Validation and Display Messages============*/
  logValidationErrors(group: UntypedFormGroup = this.groupForm): void {
    Object.keys(group.controls).forEach((key: string) => {
      const abstractControl = group.get(key);
      if (abstractControl instanceof UntypedFormGroup) {
        this.logValidationErrors(abstractControl);
      } else {
        this.formErrors[key] = '';
        if (abstractControl && !abstractControl.valid && (abstractControl.touched || abstractControl.dirty)) {
          const messages = this.validationMessages[key];
          for (const errorKey in abstractControl.errors) {
            if (errorKey) {
              this.formErrors[key] += messages[errorKey] + ' ';
            }
          }
        }
      }
    });
  }
  /*============END Check Form Validation and Display Messages============*/

  /*================= Filtered User Types =================*/
  filterUserTypeArr() {
    this.filteredUserTypes = [];
    if (this.userTypeArr?.length) {
      if (this.currentUser?.superAdminUser) {
        this.filteredUserTypes = this.userTypeArr.filter((x) => !x?.otherUser);
      }
      if (this.currentUser?.adminUser) {
        this.filteredUserTypes = this.userTypeArr.filter((x) => !x?.superAdminUser);
      }
    }
  }

  /*================= On Change User Type ==================*/
  onChangeUserType(userType: string) {
    this.selectedUserType = userType;
    if (userType === 'SA') {
      this.filterProfiles();
    } else {
      this.filterProfiles();
    }
  }

  /*================ Get All Profile ===============*/
  getAllProfiles() {
    const userTypeStr = this.groupForm.get('userType').value;
    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = {
      type: 'All',
      pageNumber: 0,
      name: null,
      excludeRecordId: null,
      userType: userType,
      includeSuperAdmin: userTypeStr === 'SA' ? true : false,
      includeAdmin: userTypeStr === 'AU' ? true : false,
      includeUser: userTypeStr === 'OU' ? true : false,
      profileId: null
    };

    this.getAllProfilesSub = this.profilesService.getAllProfiles(SearchCriteria).subscribe((res) => {
      if (res?.profiles?.length) {
        this.allProfiles = res?.profiles;
        this.filterProfiles();
        if (this.path === '/admin/groups/addgroup') {
          this.sharedService.returnToGrp.pipe(take(1)).subscribe((res) => {
            if (res?.isUserCreated || res?.isCancelUserCreation) {
              const grp = res?.groupFormData;
              this.groupForm.patchValue({
                name: grp.name,
                description: grp.description,
                profile: grp.profile?.id,
                color: grp.color,
                userType: grp?.userType
              });
              this.selectedProfile = grp?.profile?.id;
              this.groupMembers = res?.groupMembers;
            }
          });
        }
        this.sharedService.returnToGroup.pipe(take(1)).subscribe((res) => {
          this.createProfileForGrp = res;
          if (res?.isProfileCreated || res?.isCancelProfileCreation) {
            const grp = res?.groupFormData;
            this.groupForm.patchValue({
              name: grp.name,
              description: grp.description,
              profile: res.profileId ? res.profileId : grp.profile?.id,
              color: grp.color,
              userType: grp?.userType
            });
            this.selectedProfile = res.profileId ? res.profileId : grp.profile?.id;
            this.groupMembers = res?.groupMembers;
          }
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

  filterProfiles() {
    this.filteredProfileArr = [];
    const userType = this.groupForm.get('userType').value;
    const clonedProfiles = JSON.parse(JSON.stringify(this.allProfiles));
    if (userType === 'AU') {
      this.filteredProfileArr = clonedProfiles.filter((x) => x?.adminProfile);
    } else if (userType === 'OU') {
      this.filteredProfileArr = clonedProfiles.filter((x) => (!x?.superAdminProfile && !x?.adminProfile));
    } else {
      this.filteredProfileArr = this.allProfiles;
    }
  }

  /*================ Edit Group Members ===============*/
  editGroupMembers(): void {
    const groupMembers = this.groupMembers;
    const dialogRef = this.dialog.open(EditGroupMembersComponent, {
      width: '600px',
      maxHeight: '95vh',
      height: '95%',
      data: { groupMembers, userType: this.groupForm.get('userType').value, currentUser: this.currentUser }
    });
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupMembers = result;
        this.showErrMsg = false;
      }
    });
  }

  getSelectedMembersId(allMembers: Array<any>) {
    const selectedMembers = [];
    let selectedGroupMembers = [];
    allMembers.forEach(item => {
      const member = { id: item.id };
      selectedMembers.push(member);
    });
    return selectedGroupMembers = selectedMembers;
  }
  /*================ END Edit Group Members ===============*/

  /*================ Create Group Profile ================*/
  createGroupProfile() {
    const formValue = this.groupForm.getRawValue();
    if (formValue.profile) {
      this.allProfiles.forEach(element => {
        if (element.id === formValue.profile) {
          formValue.profile = { id: element.id };
        }
      });
    }
    const createProfileFromGrpObj: CreateProfileFromGroup = {
      isCreateProfileFromGrp: true,
      isProfileCreated: false,
      isCancelProfileCreation: false,
      groupId: null,
      profileId: null,
      groupFormData: formValue,
      groupMembers: this.groupMembers,
      createdProfile: null
    };
    this.sharedService.createProfileFromGroup(createProfileFromGrpObj);
    this.router.navigate(['/admin/profiles/addprofile']);
  }

  /*================ Create Group Members ================*/
  createGroupMembers() {
    const formValue = this.groupForm.getRawValue();
    if (formValue.profile) {
      this.allProfiles.forEach(element => {
        if (element.id === formValue.profile) {
          formValue.profile = { id: element.id };
        }
      });
    }
    const createUserFromGrpObj: CreateUserFromGroup = {
      isCreateUserFromGrp: true,
      isUserCreated: false,
      isCancelUserCreation: false,
      groupId: null,
      groupFormData: formValue,
      groupMembers: this.groupMembers,
      createdUser: null
    };
    this.sharedService.createUserFromGroup(createUserFromGrpObj);
    this.router.navigate(['/admin/users/adduser']);
  }

  /*================ Get Group By Id ================*/
  getGroupById(groupId: string) {
    const group = this.activatedRoute.snapshot.data.group;

    if (group) {
      this.groupForm.patchValue({
        name: group.name,
        description: group.description,
        profile: group.profile?.id,
        color: group.color,
        userType: group?.superAdminGroup ? 'SA' : group?.adminGroup ? 'AU' : 'OU'
      });
      this.getAllProfiles();
      this.selectedProfile = group.profile?.id;
      this.groupMembers = group.users;
      if (this.currentUser?.superAdminUser) {
        if (group?.superAdminGroup) {
          this.isAddEditGroupMembersDisabled = true;
          this.groupForm.disable();
        } else {
          this.isAddEditGroupMembersDisabled = false;
          this.groupForm.enable();
          this.groupForm.get('userType').disable();
        }
      }
    }
  }
  /*================ END Get Group By Id ================*/

  /*================= Cancelled ====================*/
  requestCancelled() {
    this.sharedService.isGroupAction = true;
    if (this.createGrpFromUser?.isCreateGrpFromUser) {
      const CreateUserPageObj: CreateGroupFromUser = {
        isCreateGrpFromUser: false,
        isGrpCreated: false,
        isCancelGroupCreation: true,
        grpId: null,
        userFormData: this.createGrpFromUser?.userFormData
      };
      this.sharedService.backToCreateUserPage(CreateUserPageObj);
    }
    this.location.back();
  }
  /*================= END Cancelled ====================*/

  /*=================== Save Group ===================*/
  saveGroup(formData: Groups) {
    const formValue = this.groupForm.getRawValue();
    this.groupForm.markAllAsTouched();
    this.logValidationErrors();
    formValue.users = this.getSelectedMembersId(this.groupMembers);
    formValue.name = formValue.name ? formValue?.name.trim() : formValue.name;
    formValue.description = formValue?.description ? formValue?.description.trim() : '';
    formValue.updatedBy = this.username;
    formValue.superAdminGroup = formValue?.userType === 'SA' ? true : false;
    formValue.adminGroup = formValue?.userType === 'AU' ? true : false;
    formValue.profile = { id: formValue.profile };
    delete formValue?.userType;

    // Removed users mandatory in group condition "&& formValue.users.length"
    if (this.groupForm.valid) {
      this.showErrMsg = false;
      this.createGroupSubscriptions = this.groupsService.createGroup(formValue).subscribe((res) => {
        this.globalDataService.addGroup(res);
        this.sharedService.isGroupAction = true;
        this.sharedService.isNewGroupAdded = true;
        if (this.createGrpFromUser?.isCreateGrpFromUser) {
          const CreateUserPageObj: CreateGroupFromUser = {
            isCreateGrpFromUser: false,
            isGrpCreated: true,
            isCancelGroupCreation: false,
            grpId: res?.id,
            userFormData: this.createGrpFromUser?.userFormData
          };
          this.sharedService.backToCreateUserPage(CreateUserPageObj);
        }
        // this.router.navigate(['/admin/groups']);
        this.location.back();
        this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'Group Created Successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.groupForm.controls.name.patchValue('');
          this.isGroupNamePresent = true;
        } else {
          // handle server side error here
          this.groupForm.controls.name.patchValue('');
          this.isGroupNamePresent = true;
        }
      });
    }
    if (!formValue.users.length) {
      this.showErrMsg = true;
    }
  }
  /*=================== END Save Group ===================*/

  /*=================== Update Group ===================*/
  updateGroup(formData: Groups) {
    const formValue = this.groupForm.getRawValue();
    this.groupForm.markAllAsTouched();
    this.logValidationErrors();
    formValue.id = this.groupId;
    formValue.users = this.getSelectedMembersId(this.groupMembers);
    formValue.name = formValue?.name ? formValue?.name.trim() : formValue?.name;
    formValue.description = formValue?.description ? formValue?.description.trim() : '';
    formValue.updatedBy = this.username;
    formValue.superAdminGroup = formValue?.userType === 'SA' ? true : false;
    formValue.adminGroup = formValue?.userType === 'AU' ? true : false;
    formValue.profile = { id: formValue.profile };
    delete formValue?.userType;

    // Removed users mandatory in group condition "&& formValue.users.length"
    if (this.groupForm.valid) {
      this.showErrMsg = false;
      this.updateGroupSubscriptions = this.groupsService.updateGroup(formValue).subscribe(res => {
        this.globalDataService.updateGroup(res);
        this.sharedService.isGroupAction = true;
        // this.router.navigate(['/admin/groups']);
        this.location.back();
        this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'Group Updated Successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.groupForm.controls.name.patchValue('');
          this.isGroupNamePresent = true;
        } else {
          // handle server side error here
          this.groupForm.controls.name.patchValue('');
          this.isGroupNamePresent = true;
        }
      });
    }
    if (!formValue.users.length) {
      this.showErrMsg = true;
    }
  }
  /*=================== END Update Group ===================*/

  ngOnDestroy() {
    this.createGroupSubscriptions.unsubscribe();
    this.updateGroupSubscriptions.unsubscribe();
    this.getAllProfilesSub.unsubscribe();
    this.breadcrumb.visible = true;
    this.sharedService.createGrpFromUser(null);
    this.sharedService.backToCreateGrpPage(null);
    this.sharedService.backToCreateGroupPage(null);
    this.breadcrumb.previousHide(); // show hide breadcrumb
  }

}
