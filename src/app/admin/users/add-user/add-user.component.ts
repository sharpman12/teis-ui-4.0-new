import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { pairwise, startWith, take } from 'rxjs/operators';
import { Constants } from 'src/app/shared/components/constants';
import { SharedService } from '../../../shared/services/shared.service';
import { MustMatch } from '../../../shared/validation/must-match.validator';
import { PasswordStrength } from '../../../shared/validation/password-strength.validator';
import { GlobalDataService } from '../../global-data.service';
import { RolesService } from '../../roles/roles.service';
import { CreateGroupFromUser, Users } from '../users';
import { UsersService } from '../users.service';
import { AdImportComponent } from './ad-import/ad-import.component';
import { AdSettingComponent } from './ad-setting/ad-setting.component';
import { BreadCrumbService } from '../../../core/service/breadcrumb.service';
import { EncryptDecryptService } from 'src/app/shared/services/encrypt-decrypt.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { GroupsService } from '../../groups/groups.service';
import { CreateUserFromGroup, Groups } from '../../groups/groups';
import { CheckSingleSelection } from 'src/app/shared/validation/single-selection.validator';
import { UpdateURPG } from '../../admin';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit, OnDestroy {
  subHeading = '';
  userForm: UntypedFormGroup;
  path = '';
  hidepw = false;
  hideconfirmpw = false;
  allUsers: any;
  userId: any;
  providersArr: Array<any> = [];
  allProfiles: Array<any> = [];
  filteredProfileArr: Array<any> = [];
  isUserSaved = false;
  selectedIdentityProvider: any;
  userData: any;
  isTEIS = false;
  isWindowDomain = false;
  isOAuth = false;
  username: any;
  selectedProfile: any;
  selectedGroups: Array<any> = [];
  isUserNamePresent = false;
  isUserName = false;
  userNotAvailable = false;
  isAdminUser = false;
  errorMsg: string;
  isGrpMemberUpdate = false;
  grpMemberId: string;
  grpId: string;
  isFirstnameUpdated = false;
  isLastnameUpdated = false;
  isEmailUpdated = false;
  isPhoneNumberUpdated = false;
  oldFname: string;
  oldLname: string;
  oldEmail: string;
  oldPhoneNum: string;
  currentUser: any = null;
  allGroups: Array<Groups> = [];
  filteredGroupsArr: Array<Groups> = [];
  filteredUserTypes: Array<any> = [];
  selectedUserType: string = 'OU';
  userFromProfileOrRole: UpdateURPG = null;
  createUserFromGrp: CreateUserFromGroup = null;
  returnToAddUser: boolean = false;
  isPasswordFieldShow: boolean = true;

  allProviders: Array<any> = [
    { id: 'TEIS', name: 'TEIS' },
    { id: 'Windows Domain', name: 'Windows Domain' },
    { id: 'Third Party', name: 'Third Party' },
    // { id: 'OAuth', name: 'OAuth' }
  ];

  userTypeArr: Array<any> = [
    { id: 'AU', name: 'Admin', adminUser: true, superAdminUser: false, otherUser: false },
    { id: 'SA', name: 'Super Admin', adminUser: false, superAdminUser: true, otherUser: false },
    { id: 'OU', name: 'Ordinary User', adminUser: false, superAdminUser: false, otherUser: true }
  ];

  validationMessages = {
    provider: {
      required: 'Provider is required.',
    },
    firstName: {
      required: 'First name is required.',
      maxlength: 'Firstname must not be more than 128 characters.',
      hasWhitespace: "Whitespace not allowed"
    },
    lastName: {
      required: 'Last name is required.',
      maxlength: 'Lastname must not be more than 128 characters.'
    },
    userName: {
      required: 'User name is required.',
      maxlength: 'Username must not be more than 128 characters.',
      pattern: 'Username cannot contain spaces.'
    },
    email: {
      required: 'Mail id is required.',
      pattern: 'Please enter valid email.',
      maxlength: 'Email must not be more than 128 characters.',
    },
    phoneNumber: {
      required: 'Phone number is required.',
      pattern: 'Please enter valid phone number.',
      maxlength: 'Phone number must not be greater than maximum 128 digits.',
    },
    userProfile: {
      required: 'User profile is required.',
    },
    password: {
      required: 'Password is required.',
      minlength: 'Password must be at least minimum 6 characters long.',
      maxlength: 'Password must not be more than 128 characters.',
      hasNumber: 'Password must be contain at least one numeric digit.',
      hasCapitalCase: 'Password must be contain at least one capital alphabet.',
      hasSmallCase: 'Password must be contain at least one small alphabet.',
      hasSpecialCharacters: 'Password must be contain at least one special characters.',
    },
    confirmpassword: {
      required: 'Confirm password is required.',
      mustMatch: 'Password must match.',
      minlength: 'Password must be at least minimum 6 characters long.',
      maxlength: 'Confirm password must not be more than 128 characters.',
    },
    profile: {
      required: 'Profile is required.'
    },
    groups: {
      required: 'Group(s) is required.',
      singleSelection: 'Select only one group.'
    },
    userType: {
      required: 'User type is required.'
    }
  };

  formErrors = {
    provider: '',
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    phoneNumber: '',
    userProfile: '',
    password: '',
    confirmpassword: '',
    profile: '',
    groups: '',
    userType: ''
  };

  allProfileSubscriptions = Subscription.EMPTY;
  adUserSubscriptions = Subscription.EMPTY;
  createUserSubscriptions = Subscription.EMPTY;
  updateUserSubscriptions = Subscription.EMPTY;
  getAllGroupsSub = Subscription.EMPTY;


  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private usersService: UsersService,
    private messageService: MessageService,
    private sharedService: SharedService,
    public dialog: MatDialog,
    private globalDataService: GlobalDataService,
    private rolesService: RolesService,
    private breadcrumb: BreadCrumbService,
    private encryptDecryptService: EncryptDecryptService,
    private groupsService: GroupsService
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit() {
    this.breadcrumb.visible = false;
    this.breadcrumb.previous(); // show hide breadcrumb
    this.createForm();
    this.filterUserTypeArr();
    this.getAllGroups();

    /*---------------- Get Current Router Path ---------------*/
    this.path = this.router.url;
    if (this.path === '/admin/users/adduser') {
      this.subHeading = 'Add user';
      if (this.currentUser?.superAdminUser) {
        this.selectedUserType = 'AU';
        this.userForm.get('userType').patchValue('AU');
      } else if (this.currentUser?.adminUser) {
        this.selectedUserType = 'OU';
        this.userForm.get('userType').patchValue('OU');
      } else {
        this.selectedUserType = 'OU';
        this.userForm.get('userType').enable();
      }
      // Create Group From User
      this.sharedService.createGrpMember.pipe(take(1)).subscribe((res) => {
        this.createUserFromGrp = res;
      });
    } else {
      this.subHeading = 'Update user';
      /*---------------- Get Router Param ----------------*/
      // tslint:disable-next-line: deprecation
      this.activatedRoute.params.subscribe((params) => {
        console.log('params: ', params);
        if (params.id) {
          this.userId = params.id;
          // this.getUserById(this.userId);
          // if (this.currentUser?.superAdminUser || this.currentUser?.adminUser) {
          //   this.userForm.disable();
          //   this.userForm.controls.password.enable();
          //   this.userForm.controls.confirmpassword.enable();
          //   this.userForm.controls.changePassword.enable();
          // }
          if (Number(this.userId) === Number(this.currentUser?.id)) {
            this.userForm.disable();
            if (Number(this.userId) === 11) {
              this.userForm.get('password').disable();
              this.userForm.get('confirmpassword').disable();
            } else {
              this.userForm.get('password').enable();
              this.userForm.get('confirmpassword').enable();
              this.userForm.get('email').enable();
              this.userForm.get('phoneNumber').enable();
            }
            this.userForm.get('changePassword').enable();
          } else {
            this.userForm.enable();
          }
        }
      });
    }
    /*---------------- END Get Current Router Path ----------------*/

    /*---------------- Set Default Provider ----------------*/
    if (this.path === '/admin/users/adduser') {
      const provider = this.allProviders[0].id;
      this.userForm.patchValue({
        provider: provider,
      });
      this.onChangeProvider(provider);
    }
    /*---------------- END Set Default Provider ----------------*/

    /*---------------- Get Current User Data From LocalStroage ----------------*/
    this.username = localStorage.getItem(Constants.USERNAME);
    /*---------------- Get Current User Data From LocalStroage ----------------*/

    /*---------------- Get Localstroage Data ----------------*/
    this.sharedService.returnToAddUser.pipe(take(1)).subscribe((res) => {
      this.returnToAddUser = res;
      if (res) {
        const user = JSON.parse(localStorage.getItem('userDetails'));

        // const groups = [];
        // if (user?.userGroupList?.userGroups?.length) {
        //   user?.userGroupList?.userGroups.forEach((g) => {
        //     groups.push(g?.id);
        //   });
        // }
        this.onChangeProvider(user.provider);
        this.userForm.patchValue({
          provider: user.provider,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          identityProvider: user.identityProvider,
          password: user.password,
          confirmpassword: user.password,
          email: user.email,
          phoneNumber: user.phoneNumber,
          active: user.active,
          changePassword: user.changePassword,
          userType: user?.userType,
          groups: user?.groups
        });
        this.selectedUserType = user?.userType;
        this.selectedGroups = user?.groups;
        if (user.profile != null) {
          this.userForm.patchValue({
            profile: user.profile?.id,
          });
          this.selectedProfile = user.profile?.id;
        }
      }
    });
    /*---------------- END Get Localstroage Data ----------------*/

    /*---------------- Check Profile Add From Add User Page Flag ----------------*/
    this.sharedService.isProfileAddFromUser.pipe(take(1)).subscribe(res => {
      this.getAllProfiles(res);
    });
    /*---------------- END Check Profile Add From Add User Page Flag ----------------*/

    // tslint:disable-next-line: deprecation
    this.userForm.get('userName').valueChanges.subscribe(res => {
      if (res) {
        this.isUserNamePresent = false;
        this.isUserName = false;
        this.userNotAvailable = false;
      }
      if (!res) {
        this.userNotAvailable = false;
      }
    });

    /*---------------- Update Group Member Flag ----------------*/
    this.sharedService.updateGroupMember.subscribe(res => {
      this.grpId = res.groupId;
      this.isGrpMemberUpdate = res.isUpdate;
      this.grpMemberId = res.userId;
    });

    /*---------------- Update User From Profile Or Role ----------------*/
    this.sharedService.getURPGDetails.pipe(take(1)).subscribe((res: UpdateURPG) => {
      this.userFromProfileOrRole = res;
    });

    this.getRolesByUsername(this.username);
  }

  /*================== Create Form ===================*/
  createForm() {
    // tslint:disable-next-line: deprecation
    this.userForm = this.fb.group({
      userType: [{ value: 'OU', disabled: false }, {
        validators: []
      }],
      provider: [{ value: 'TEIS', disabled: false }, {
        validators: [Validators.required]
      }],
      firstName: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          CheckWhitespace.whitespaceValidator({ hasWhitespace: true })
        ]
      }],
      lastName: [{ value: '', disabled: false }, {
        validators: [
          Validators.maxLength(128)
        ]
      }],
      userName: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          Validators.pattern('^[^\\s]+$')
        ]
      }],
      userIdentity: [{ value: '', disabled: true }, {
        validators: []
      }],
      password: [{ value: '', disabled: false }, {
        validators: [
          Validators.maxLength(128)
          // Validators.required,
          // PasswordStrength.patternValidator(/\d/, { hasNumber: true }),
          // PasswordStrength.patternValidator(/[A-Z]/, { hasCapitalCase: true }),
          // PasswordStrength.patternValidator(/[a-z]/, { hasSmallCase: true }),
          // PasswordStrength.patternValidator(/[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, { hasSpecialCharacters: true }),
        ]
      }],
      confirmpassword: [{ value: '', disabled: false }, {
        validators: [
          Validators.maxLength(128)
        ]
      }],
      identityProvider: [{ value: '', disabled: false }, {
        validators: []
      }],
      email: [{ value: '', disabled: false }, {
        validators: [
          Validators.required,
          Validators.maxLength(128),
          Validators.pattern('^[a-zA-ZÅÄÖåäö0-9._%+-]+@[a-zA-ZÅÄÖåäö0-9.-]+\\.[a-zA-ZÅÄÖåäö]{2,4}$')
        ]
      }],
      phoneNumber: [{ value: '', disabled: false }, {
        validators: [
          Validators.maxLength(128),
          Validators.pattern(/^(?=.*[0-9])[- +()0-9]+$/)
        ]
      }],
      profile: [{ value: '', disabled: false }, {
        validators: []
      }],
      groups: [{ value: [], disabled: false }, {
        validators: []
      }],
      active: [{ value: false, disabled: false }, {
        validators: []
      }],
      changePassword: [{ value: false, disabled: false }, {
        validators: []
      }],
    },
      // {
      //   validator: MustMatch('password', 'confirmpassword')
      // }
    );

    // Add validation on User Type only if login user is super admin
    if (this.currentUser?.superAdminUser) {
      this.userForm.get('userType').setValidators([
        Validators.required
      ]);
      this.userForm.get('userType').updateValueAndValidity();
    } else {
      this.userForm.get('userType').clearValidators();
      this.userForm.get('userType').updateValueAndValidity();
    }

    this.userForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.userForm);
    });
  }
  /*==================END Create Form===================*/

  /*================ Custom validator function for password match ================*/
  passwordMatchValidator(control) {
    const password = this.userForm.get('password').value;
    const confirmPassword = control.value;

    // Check if passwords match
    if (password === confirmPassword) {
      return null; // Valid
    } else {
      return { mustMatch: true }; // Invalid
    }
  }

  /*============Check Form Validation and Display Messages============*/
  logValidationErrors(group: UntypedFormGroup = this.userForm): void {
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

  OnChangePassword() {
    if (this.path.includes('/admin/users/edituser/')) {
      const decryptedPassword = this.encryptDecryptService.decrypt(this.userData.password);
      const oldpw = decryptedPassword;
      const newpw = this.userForm.get('password').value;
      if (Number(this.currentUser?.id) !== Number(this.userData?.id)) {
        if (oldpw !== newpw) {
          this.userForm.get('changePassword').patchValue(true);
          this.userForm.get('changePassword').disable();
        } else {
          this.userForm.get('changePassword').patchValue(false);
          this.userForm.get('changePassword').enable();
        }
      }
    }
  }

  /*================= On Change User Type ==================*/
  onChangeUserType(userType: string) {
    this.selectedUserType = userType;
    if (userType === 'SA') {
      this.filterGroups();
      this.userForm.get('provider').patchValue('TEIS');
      this.userForm.get('provider').disable();
      this.userForm.get('groups').disable();
      this.userForm.get('groups').setValidators([
        CheckSingleSelection?.singleSelectionValidator({})
      ]);
      this.userForm.get('groups').updateValueAndValidity();
    } else if (userType === 'AU') {
      this.filterGroups();
      this.userForm.get('provider').enable();
      // this.userForm.get('groups').enable();
      // this.userForm.get('groups').patchValue([]);
      this.userForm.get('groups').setValidators([
        CheckSingleSelection?.singleSelectionValidator({})
      ]);
      this.userForm.get('groups').updateValueAndValidity();
    } else {
      this.filterGroups();
      this.userForm.get('provider').enable();
      this.userForm.get('groups').enable();
      this.userForm.get('groups').clearValidators();
      this.userForm.get('groups').updateValueAndValidity();
    }
  }

  filterGroups() {
    const userType = this.userForm.get('userType').value;
    const clonedGroups = JSON.parse(JSON.stringify(this.allGroups));
    let superAdminGrp = null;
    let adminGrp = null;
    if (this.allGroups?.length) {
      if (userType === 'SA') {
        this.filteredGroupsArr = clonedGroups.filter((x) => x?.superAdminGroup);
        if (this.filteredGroupsArr?.length) {
          superAdminGrp = this.filteredGroupsArr.find((x) => x?.superAdminGroup);
          // this.userForm.get('changePassword').disable();
          this.userForm.get('groups').setValidators([
            CheckSingleSelection?.singleSelectionValidator({})
          ]);
          this.userForm.get('groups').updateValueAndValidity();
          this.userForm.get('groups').patchValue([superAdminGrp?.id]);
          this.selectedGroups = [superAdminGrp?.id];
        }
      } else if (userType === 'AU') {
        this.filteredGroupsArr = clonedGroups.filter((x) => x?.adminGroup);

        if (this.currentUser?.adminUser) {
          adminGrp = this.filteredGroupsArr.find((x) => x?.adminGroup);
          this.userForm.get('groups').patchValue([adminGrp?.id]);
          this.selectedGroups = [adminGrp?.id];
          this.userForm.get('groups').disable();
        } else {
          this.userForm.get('groups').reset();
          this.userForm.get('groups').enable();
        }

        this.userForm.get('groups').setValidators([
          CheckSingleSelection?.singleSelectionValidator({})
        ]);
        this.userForm.get('groups').updateValueAndValidity();
      } else {
        this.filteredGroupsArr = clonedGroups.filter((x) => !x?.superAdminGroup && !x?.adminGroup);
        const user = JSON.parse(localStorage.getItem('userDetails'));
        const groups = this.returnToAddUser ? user?.groups : [];
        if (Number(this.userId) === 11) {
          this.userForm.get('changePassword').disable();
        } else {
          this.userForm.get('changePassword').enable();
        }
        this.userForm.get('groups').patchValue(groups);
        this.userForm.get('groups').clearValidators();
        this.userForm.get('groups').updateValueAndValidity();
        this.selectedGroups = groups;
      }
    }
  }

  /*================= On Change Provider ==================*/
  onChangeProvider(provider: string) {
    if (provider === 'TEIS') {
      this.isTEIS = true;
      this.isWindowDomain = false;
      this.userForm.get('changePassword').enable();
      this.userForm.get('password').addValidators([
        Validators.required,
        Validators.maxLength(128)
      ]);
      this.userForm.get('confirmpassword').addValidators([
        Validators.required,
        Validators.maxLength(128),
        this.passwordMatchValidator.bind(this)
      ]);
      this.userForm.get('password').updateValueAndValidity();
      this.userForm.get('confirmpassword').updateValueAndValidity();
    } else {
      this.isTEIS = false;
      this.isWindowDomain = true;
      this.userForm.get('changePassword').disable();
      this.userForm.get('password').clearValidators();
      this.userForm.get('confirmpassword').clearValidators();
      this.userForm.get('password').updateValueAndValidity();
      this.userForm.get('confirmpassword').updateValueAndValidity();
    }
    // if (provider === 'Windows Domain' || provider === 'Third Party') {
    //   this.isWindowDomain = true;
    //   this.userForm.get('changePassword').disable();
    // } else {
    //   this.isWindowDomain = false;
    //   this.userForm.get('changePassword').enable();
    // }
  }
  /*================= END On Change Provider ==================*/

  /*============= On Cancel ================*/
  requestCancelled() {
    if (this.isGrpMemberUpdate) {
      this.sharedService.returnToGroupPage.next({ isUpdate: true, groupId: this.grpId, userId: '' });
    } else {
      this.sharedService.isUserAction = true;
      localStorage.removeItem('userDetails');
      this.sharedService.backToURPG({
        isReturnToProfile: this.userFromProfileOrRole?.isProfile,
        isReturnToRole: this.userFromProfileOrRole?.isRole,
        isReturnToGroup: this.userFromProfileOrRole?.isGroup,
        isUpdate: false,
        isProfile: this.userFromProfileOrRole?.isProfile,
        isRole: this.userFromProfileOrRole?.isRole,
        isGroup: this.userFromProfileOrRole?.isGroup,
        isProfileUser: this.userFromProfileOrRole?.isProfileUser,
        isRoleUser: this.userFromProfileOrRole?.isProfileUser,
        userId: this.userFromProfileOrRole?.userId,
        roleId: this.userFromProfileOrRole?.roleId,
        profileId: this.userFromProfileOrRole?.profileId,
        groupId: this.userFromProfileOrRole?.groupId,
        activeProfileId: this.userFromProfileOrRole?.activeProfileId,
        activeRoleId: this.userFromProfileOrRole?.activeRoleId,
        activeGroupId: this.userFromProfileOrRole?.activeGroupId,
        isExpandPT: this.userFromProfileOrRole?.isExpandPT,
        isExpandRT: this.userFromProfileOrRole?.isExpandRT,
        isExpandUT: this.userFromProfileOrRole?.isExpandUT
      });
      if (this.createUserFromGrp && this.createUserFromGrp?.isCreateUserFromGrp) {
        const CreateUserPageObj: CreateUserFromGroup = {
          isCreateUserFromGrp: false,
          isUserCreated: false,
          isCancelUserCreation: true,
          groupId: null,
          groupFormData: this.createUserFromGrp?.groupFormData,
          groupMembers: this.createUserFromGrp?.groupMembers,
          createdUser: null
        };
        this.sharedService.backToCreateGrpPage(CreateUserPageObj);
      }
    }
    this.location.back();
  }
  /*============= END On Cancel ================*/

  /*============= Get Roles By Username =================*/
  getAllGroups() {
    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = {
      type: 'All',
      pageNumber: 1,
      name: null,
      excludeRecordId: null,
      userType: userType,
      includeSuperAdmin: this.currentUser?.superAdminUser ? true : false,
      includeAdmin: this.currentUser?.superAdminUser ? true : this.currentUser?.adminUser ? true : false,
      includeUser: this.currentUser?.superAdminUser ? false : this.currentUser?.adminUser ? true : true,
      profileId: null
    };
    this.getAllGroupsSub = this.groupsService.getAllGroups(SearchCriteria).subscribe((res) => {
      if (res?.userGroups?.length) {
        this.allGroups = res?.userGroups;
        this.filterGroups();
        if (this.path === '/admin/users/adduser') {
          this.sharedService.returnToUser.pipe(take(1)).subscribe((res) => {
            if (res?.isGrpCreated || res?.isCancelGroupCreation) {
              const user = res?.userFormData;
              this.onChangeProvider(user.provider);
              this.userForm.patchValue({
                provider: user?.provider,
                firstName: user?.firstName,
                lastName: user?.lastName,
                userName: user?.userName,
                identityProvider: user?.identityProvider,
                password: user?.password,
                confirmpassword: user?.password,
                email: user?.email,
                phoneNumber: user?.phoneNumber,
                active: user?.active,
                changePassword: user?.changePassword,
                userType: user?.userType,
                groups: res?.grpId ? [res?.grpId] : []
              });
              if (user.profile != null) {
                this.userForm.patchValue({
                  profile: user.profile?.id,
                });
                this.selectedProfile = user.profile?.id;
              }
              this.selectedGroups = res?.grpId ? [res?.grpId] : [];
            }
          });
        }
        if (this.path.includes('/admin/users/edituser')) {
          this.getUserById(this.userId);
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

  /*============= Get Roles By Username =================*/
  getRolesByUsername(currentUserName: string) {
    this.rolesService.getRoleByUsername(currentUserName).subscribe(res => {
      res.forEach(element => {
        if (element.name === 'Administrator') {
          this.isAdminUser = true;
        }
      });
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*================= Get User By Id For Edit =================*/
  getUserById(userId: any) {
    const user = this.activatedRoute.snapshot.data.user;

    const groups = [];
    let profileId = null;

    if (user?.userGroupList?.userGroups?.length) {
      user?.userGroupList?.userGroups.forEach((g) => {
        profileId = g?.profile?.id;
        groups.push(g?.id);
      });
    }

    if (user?.superAdminUser) {
      this.userForm.get('userType').disable();
      this.userForm.get('provider').disable();
      this.userForm.get('groups').disable();
    } else {
      // Below code is commented and added new code and condition for Jira change request #TEI-5440
      if (this.currentUser?.adminUser && Number(this.currentUser?.id) === Number(user?.id)) {
        this.userForm.get('userType').disable();
        this.userForm.get('provider').disable();
        this.userForm.get('groups').disable();
      }
      // this.userForm.get('userType').enable();
      // this.userForm.get('provider').enable();
      // this.userForm.get('groups').enable();
    }

    const decryptedPassword = this.encryptDecryptService.decrypt(user.password);

    if (user) {
      this.userData = user;
      console.log('userData: ', this.userData);
      if (userId === 'administrator') {
        if (user.provider === 'TEIS' || user.provider === null) {
          this.isTEIS = true;
          this.isWindowDomain = false;
          this.userForm.get('changePassword').enable();
          this.userForm.get('password').addValidators([
            Validators.required,
            Validators.maxLength(128)
          ]);
          this.userForm.get('confirmpassword').addValidators([
            Validators.required,
            Validators.maxLength(128),
            this.passwordMatchValidator.bind(this)
          ]);
          this.userForm.get('password').updateValueAndValidity();
          this.userForm.get('confirmpassword').updateValueAndValidity();
        } else {
          this.isTEIS = false;
          this.isWindowDomain = true;
          this.userForm.get('changePassword').disable();
          this.userForm.get('password').clearValidators();
          this.userForm.get('password').updateValueAndValidity();
          this.userForm.get('confirmpassword').clearValidators();
          this.userForm.get('confirmpassword').updateValueAndValidity();
        }
        // Below code is commented for Jira change request #TEI-5440
        // if (this.currentUser?.adminUser && user?.adminUser) {
        //   this.isPasswordFieldShow = false;
        //   this.userForm.get('password').disable();
        //   this.userForm.get('confirmpassword').disable();
        //   this.userForm.get('changePassword').disable();
        //   this.userForm.get('password').clearValidators();
        //   this.userForm.get('password').updateValueAndValidity();
        //   this.userForm.get('confirmpassword').clearValidators();
        //   this.userForm.get('confirmpassword').updateValueAndValidity();
        // } else {
        //   this.isPasswordFieldShow = true;
        // }
        this.userForm.patchValue({
          provider: 'TEIS',
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          identityProvider: user.identityProvider,
          password: decryptedPassword,
          confirmpassword: decryptedPassword,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profile: user.profile?.id ? user.profile?.id : '',
          active: !user.active,
          changePassword: user.changePassword,
          userType: user?.superAdminUser ? 'SA' : user?.adminUser ? 'AU' : 'OU',
          groups: groups
        });
        // if (this.currentUser?.superAdminUser) {
        //   this.selectedUserType = 'AU';
        // } else if (this.currentUser?.adminUser) {
        //   this.selectedUserType = 'OU';
        // } else {
        //   this.selectedUserType = 'OU';
        // }
        this.selectedUserType = user?.superAdminUser ? 'SA' : user?.adminUser ? 'AU' : 'OU';
        this.filterGroups();
        this.filterProfiles();

        this.selectedProfile = user.profile?.id ? user.profile?.id : '';
        this.selectedGroups = groups;

      } else {
        if (user.provider === 'TEIS') {
          this.isTEIS = true;
          this.isWindowDomain = false;
          if (Number(this.userId) === 11) {
            this.userForm.get('changePassword').disable();
          } else {
            this.userForm.get('changePassword').enable();
          }
          this.userForm.get('password').addValidators([
            Validators.required,
            Validators.maxLength(128)
          ]);
          this.userForm.get('confirmpassword').addValidators([
            Validators.required,
            Validators.maxLength(128),
            this.passwordMatchValidator.bind(this)
          ]);
          this.userForm.get('password').updateValueAndValidity();
          this.userForm.get('confirmpassword').updateValueAndValidity();
        } else {
          this.isTEIS = false;
          this.isWindowDomain = true;
          this.userForm.get('changePassword').disable();
          this.userForm.get('password').clearValidators();
          this.userForm.get('password').updateValueAndValidity();
          this.userForm.get('confirmpassword').clearValidators();
          this.userForm.get('confirmpassword').updateValueAndValidity();
        }
        // Below code is commented for Jira change request #TEI-5440
        // if (this.currentUser?.adminUser && user?.adminUser) {
        //   this.isPasswordFieldShow = false;
        //   this.userForm.get('password').disable();
        //   this.userForm.get('confirmpassword').disable();
        //   this.userForm.get('changePassword').disable();
        //   this.userForm.get('password').clearValidators();
        //   this.userForm.get('password').updateValueAndValidity();
        //   this.userForm.get('confirmpassword').clearValidators();
        //   this.userForm.get('confirmpassword').updateValueAndValidity();
        // } else {
        //   this.isPasswordFieldShow = true;
        // }
        this.userForm.patchValue({
          provider: user.provider,
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          identityProvider: user.identityProvider,
          password: decryptedPassword,
          confirmpassword: decryptedPassword,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profile: user.profile?.id ? user.profile?.id : '',
          active: !user.active,
          changePassword: user.changePassword,
          userType: user?.superAdminUser ? 'SA' : user?.adminUser ? 'AU' : 'OU',
          groups: groups
        });
        // if (this.currentUser?.superAdminUser) {
        //   this.selectedUserType = 'AU';
        // } else if (this.currentUser?.adminUser) {
        //   this.selectedUserType = 'OU';
        // } else {
        //   this.selectedUserType = 'OU';
        // }
        this.selectedUserType = user?.superAdminUser ? 'SA' : user?.adminUser ? 'AU' : 'OU';
        this.filterGroups();
        this.filterProfiles();

        this.selectedProfile = user.profile?.id ? user.profile?.id : '';
        this.selectedGroups = groups;
      }
    }
  }
  /*================= END Get User By Id For Edit =================*/

  /*================= Add Profile ==================*/
  addProfile() {
    const formValue = this.userForm.getRawValue();
    if (formValue.profile) {
      this.allProfiles.forEach(element => {
        if (element.id === formValue.profile) {
          formValue.profile = { id: element.id };
        }
      });
    }
    localStorage.setItem('userDetails', JSON.stringify(formValue));
    this.sharedService.isAddProfile.next(true);
    this.router.navigate(['/admin/profiles/addprofile']);
  }

  addGroup() {
    const formValue = this.userForm.getRawValue();
    if (formValue.profile) {
      this.allProfiles.forEach(element => {
        if (element.id === formValue.profile) {
          formValue.profile = { id: element.id };
        }
      });
    }
    const createGrpFromUserObj: CreateGroupFromUser = {
      isCreateGrpFromUser: true,
      isGrpCreated: false,
      isCancelGroupCreation: false,
      grpId: null,
      userFormData: formValue
    };
    this.sharedService.createGrpFromUser(createGrpFromUserObj);
    this.router.navigate(['/admin/groups/addgroup']);
  }

  /*=================== Get All Profiles ===================*/
  getAllProfiles(isReturnFromAddProfile: boolean) {
    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = {
      type: 'All',
      pageNumber: 0,
      name: null,
      excludeRecordId: null,
      userType: userType,
      includeSuperAdmin: this.currentUser?.superAdminUser ? true : false,
      includeAdmin: this.currentUser?.superAdminUser ? true : this.currentUser?.adminUser ? true : false,
      includeUser: this.currentUser?.superAdminUser ? false : this.currentUser?.adminUser ? true : true,
      profileId: null
    };
    const profiles = this.globalDataService.getProfiles();
    if (isReturnFromAddProfile && profiles.profileList.length) {
      this.allProfiles = profiles.profileList;
      this.filterProfiles();
      if (this.sharedService.isProfileAddedForUser) {
        this.userForm.patchValue({
          profile: profiles.profileList[0].id,
        });
        this.selectedProfile = profiles.profileList[0].id;
      }
    } else {
      this.allProfileSubscriptions = this.usersService.getAllProfiles(SearchCriteria).subscribe(res => {
        const allProfiles = res['profiles'];
        this.allProfiles = allProfiles;
        this.filterProfiles();
        const profilesData = {
          profileId: null,
          searchCriteria: SearchCriteria,
          profileList: allProfiles,
          totalCount: allProfiles['totalCount']
        };
        this.globalDataService.storeProfile(profilesData);
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*=================== END Get All Profiles ===================*/

  filterProfiles() {
    this.filteredProfileArr = [];
    const userType = this.userForm.get('userType').value;
    const clonedProfiles = JSON.parse(JSON.stringify(this.allProfiles)).filter((x) => Number(x?.id) !== Number(this.currentUser?.profileRef));
    if (userType === 'AU') {
      this.filteredProfileArr = clonedProfiles.filter((x) => x?.adminProfile);
    } else if (userType === 'OU') {
      // this.filteredProfileArr = clonedProfiles.filter((x) => (!x?.superAdminProfile && !x?.adminProfile));
      this.filteredProfileArr = clonedProfiles.filter((x) => (!x?.superAdminProfile));
    } else {
      this.filteredProfileArr = this.allProfiles;
    }
  }

  /*================== AD Setting ====================*/
  adSetting() {
    const dialogRef = this.dialog.open(AdSettingComponent, {
      width: '650px',
      data: ''
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {

      }
    });
  }
  /*================== END AD Setting ====================*/

  /*================== Test AD Connection ====================*/
  testADConnection() {
    this.usersService.testADConnection().subscribe(res => {
      if (res) {
        this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'AD connection is successful!' });
      } else {
        this.messageService.add({ key: 'adminWarnKey', severity: 'Warning', summary: '', detail: 'AD is not connected!' });
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
        // this.messageService.add({ key: 'adminWarnKey', severity: 'Error', summary: '', detail: err?.error?.message });
      }
    });
  }

  /*================== AD Import ====================*/
  adImport() {
    const dialogRef = this.dialog.open(AdImportComponent, {
      width: '550px',
      data: ''
    });
    // tslint:disable-next-line: deprecation
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const user = result.yourChoice;
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          identityProvider: user.identityProvider,
          password: user.password,
          confirmpassword: user.password,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profile: user.profile?.id,
          active: !user.active,
          changePassword: user.changePassword,
          userType: user?.superAdminUser ? 'SA' : 'AU'
        });
        this.selectedProfile = user.profile?.id;
      }
    });
  }
  /*================== END AD Import ====================*/

  /*================== AD Sync ====================*/
  adSync() {
    const formValue = this.userForm.value;
    const userName = this.userForm.get('userName').value;
    if (userName) {
      this.isUserName = false;
      this.adUserSubscriptions = this.usersService.getADUserByUsername(userName).subscribe((res) => {
        const user = res;
        if (formValue.firstName !== user.firstName && formValue.firstName !== '') {
          this.isFirstnameUpdated = true;
          this.oldFname = `First name changed. Previous value '${formValue.firstName}'`;
        }
        if (formValue.lastName !== user.lastName && formValue.lastName !== '') {
          this.isLastnameUpdated = true;
          this.oldLname = `Last name changed. Previous value '${formValue.lastName}'`;
        }
        if (formValue.email !== user.email && formValue.email !== '') {
          this.isEmailUpdated = true;
          this.oldEmail = `Email changed. Previous value '${formValue.email}'`;
        }
        if (formValue.phoneNumber !== user.phoneNumber && formValue.phoneNumber !== '') {
          this.isPhoneNumberUpdated = true;
          this.oldPhoneNum = `Phone number changed. Previous value '${formValue.phoneNumber}'`;
        }
        this.userForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          userName: user.userName,
          identityProvider: user.identityProvider,
          password: user.password,
          confirmpassword: user.password,
          email: user.email,
          phoneNumber: user.phoneNumber,
          active: !user.active,
          changePassword: user.changePassword,
          userType: user?.superAdminUser ? 'SA' : 'AU'
        });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.userNotAvailable = true;
        } else {
          // handle server side error here
          this.userNotAvailable = true;
          this.errorMsg = err.error.message;
        }
      });
    } else {
      this.isUserName = true;
    }
  }
  /*================== END AD Sync ====================*/

  getGroupsObjById(arr: Array<number>) {
    const connectedGroups = [];
    if (arr?.length) {
      arr.forEach((x) => {
        connectedGroups.push({
          id: x
        });
      });
    }
    return connectedGroups;
  }

  /*================= Save User =================*/
  saveUser(formData: Users) {
    const formValue = this.userForm.getRawValue();
    this.userForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.userForm.valid) {
      delete formValue.confirmpassword;
      delete formValue.userIdentity;
      formValue.userName = formValue.userName ? formValue.userName.trim() : formValue.userName;
      formValue.firstName = formValue.firstName ? formValue.firstName.trim() : formValue.firstName;
      formValue.lastName = formValue.lastName ? formValue.lastName.trim() : formValue.lastName;
      formValue.email = formValue.email ? formValue.email.trim() : formValue.email;
      formValue.phoneNumber = formValue.phoneNumber ? formValue.phoneNumber.trim() : formValue.phoneNumber;
      const encryptedPassword = this.encryptDecryptService.encrypt(formValue?.password);
      if (formValue.lastName === null) {
        formValue.lastName = '';
      }

      if (this.currentUser?.superAdminUser || this.currentUser?.adminUser) {
        if (formValue?.userType === 'OU') {
          if (formValue.profile) {
            this.allProfiles.forEach(element => {
              if (element.id === formValue.profile) {
                formValue.profile = { id: element.id };
              }
            });
          } else {
            formValue.profile = null;
          }
        } else {
          formValue.profile = null;
        }
      } else {
        if (formValue.profile) {
          this.allProfiles.forEach(element => {
            if (element.id === formValue.profile) {
              formValue.profile = { id: element.id };
            }
          });
        } else {
          formValue.profile = null;
        }
      }

      formValue.defaultWorkspace = null;
      formValue.active = !formValue.active;
      formValue.updatedBy = this.username;
      if (formValue?.provider === 'Third Party' || formValue?.provider === 'Windows Domain') {
        // formValue.password = this.encryptDecryptService.encrypt('teisadmin3');
        formValue.password = null;
      } else {
        formValue.password = encryptedPassword;
      }
      formValue.superAdminUser = formValue?.userType === 'SA' ? true : false;
      formValue.adminUser = formValue?.userType === 'AU' ? true : false;
      formValue.userGroupList = { userGroups: this.getGroupsObjById(formValue?.groups) };
      delete formValue?.userType;
      delete formValue?.groups;

      this.createUserSubscriptions = this.usersService.createUser(formValue).subscribe(res => {
        this.globalDataService.addUser(res);
        this.sharedService.isUserAction = true;
        this.sharedService.isNewUserAdded = true;
        // this.router.navigate(['/admin/users']);
        if (this.createUserFromGrp && this.createUserFromGrp?.isCreateUserFromGrp) {
          const CreateUserPageObj: CreateUserFromGroup = {
            isCreateUserFromGrp: false,
            isUserCreated: true,
            isCancelUserCreation: false,
            groupId: res?.id,
            groupFormData: this.createUserFromGrp?.groupFormData,
            groupMembers: [...this.createUserFromGrp?.groupMembers, res],
            createdUser: res
          };
          this.sharedService.backToCreateGrpPage(CreateUserPageObj);
        }
        this.location.back();
        localStorage.removeItem('userDetails');
        this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'User Created Successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.userForm.controls.userName.patchValue('');
          this.isUserNamePresent = true;
        } else {
          // handle server side error here
          this.userForm.controls.userName.patchValue('');
          this.isUserNamePresent = true;
        }
      });
    }
  }
  /*================= END Save User =================*/

  get isFormValid(): boolean {
    return this.userForm.disabled ? true : this.userForm.valid;
  }

  /*================= Update User =================*/
  updateUser(formValue: Users) {
    this.userForm.markAllAsTouched();
    this.logValidationErrors();
    const formData = this.userForm.getRawValue();
    if (this.isFormValid) {
      delete formData.confirmpassword;
      delete formData.userIdentity;
      formData.id = this.userData.id;
      formData.userName = formData.userName ? formData.userName.trim() : formData.userName;
      formData.firstName = formData.firstName ? formData.firstName.trim() : formData.firstName;
      formData.lastName = formData.lastName ? formData.lastName.trim() : formData.lastName;
      formData.email = formData.email ? formData.email.trim() : formData.email;
      formData.phoneNumber = formData.phoneNumber ? formData.phoneNumber.trim() : formData.phoneNumber;
      const encryptedPassword = this.encryptDecryptService.encrypt(formData?.password);
      if (formData.lastName === null) {
        formData.lastName = '';
      }

      if (this.currentUser?.superAdminUser || this.currentUser?.adminUser) {
        if (formData?.userType === 'OU') {
          if (formData.profile) {
            this.allProfiles.forEach(element => {
              if (element.id === formData.profile) {
                formData.profile = { id: element.id };
              }
            });
          } else {
            formData.profile = null;
          }
        } else {
          formData.profile = null;
        }
      } else {
        if (formData.profile) {
          this.allProfiles.forEach(element => {
            if (element.id === formData.profile) {
              formData.profile = { id: element.id };
            }
          });
        } else {
          formData.profile = null;
        }
      }

      formData.active = !formData.active;
      formData.updatedBy = this.username;
      // Fixed Jira Bug TEI-5615
      formData.defaultWorkspace = (this.userData?.defaultWorkspace) ? this.userData?.defaultWorkspace : null;
      if (formData?.provider === 'Third Party' || formData?.provider === 'Windows Domain') {
        // formData.password = this.encryptDecryptService.encrypt('teisadmin3');
        formData.password = null;
      } else {
        formData.password = encryptedPassword;
      }
      formData.superAdminUser = formData?.userType === 'SA' ? true : false;
      formData.adminUser = formData?.userType === 'AU' ? true : false;
      formData.userGroupList = { userGroups: this.getGroupsObjById(formData?.groups) };
      delete formData?.userType;
      delete formData?.groups;

      this.updateUserSubscriptions = this.usersService.updateUser(formData).subscribe(res => {
        if (this.isGrpMemberUpdate) {
          this.sharedService.returnToGroupPage.next({ isUpdate: true, groupId: this.grpId, userId: this.grpMemberId });
          this.location.back();
        } else {
          this.globalDataService.updateUser(res);
          this.sharedService.isUserAction = true;
          // this.router.navigate(['/admin/users']);
          this.sharedService.backToURPG({
            isReturnToProfile: this.userFromProfileOrRole?.isProfile,
            isReturnToRole: this.userFromProfileOrRole?.isRole,
            isReturnToGroup: this.userFromProfileOrRole?.isGroup,
            isUpdate: true,
            isProfile: this.userFromProfileOrRole?.isProfile,
            isRole: this.userFromProfileOrRole?.isRole,
            isGroup: this.userFromProfileOrRole?.isGroup,
            isProfileUser: this.userFromProfileOrRole?.isProfileUser,
            isRoleUser: this.userFromProfileOrRole?.isProfileUser,
            userId: this.userFromProfileOrRole?.userId,
            roleId: this.userFromProfileOrRole?.roleId,
            profileId: this.userFromProfileOrRole?.profileId,
            groupId: this.userFromProfileOrRole?.groupId,
            activeProfileId: this.userFromProfileOrRole?.activeProfileId,
            activeRoleId: this.userFromProfileOrRole?.activeRoleId,
            activeGroupId: this.userFromProfileOrRole?.activeGroupId,
            isExpandPT: this.userFromProfileOrRole?.isExpandPT,
            isExpandRT: this.userFromProfileOrRole?.isExpandRT,
            isExpandUT: this.userFromProfileOrRole?.isExpandUT
          });
          this.location.back();
          localStorage.removeItem('userDetails');
        }
        this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'User Updated Successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.userForm.controls.userName.patchValue('');
          this.isUserNamePresent = true;
        } else {
          // handle server side error here
          this.userForm.controls.userName.patchValue('');
          this.isUserNamePresent = true;
        }
      });
    }
  }
  /*================= END Update User =================*/

  ngOnDestroy() {
    this.sharedService.isGroupAction = false;
    this.allProfileSubscriptions.unsubscribe();
    this.adUserSubscriptions.unsubscribe();
    this.createUserSubscriptions.unsubscribe();
    this.updateUserSubscriptions.unsubscribe();
    this.getAllGroupsSub.unsubscribe();
    this.sharedService.returnToAddUser.next(false);
    this.sharedService.updateGroupMember.next({ isUpdate: false, groupId: '', userId: '' });
    this.sharedService.isProfileAddFromUser.next(false);
    this.sharedService.isProfileAddedForUser = false;
    this.breadcrumb.visible = true;
    this.sharedService.updateURPG({
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
    this.sharedService.backToCreateUserPage(null);
    this.sharedService.createUserFromGroup(null);
    this.breadcrumb.previousHide(); // show hide breadcrumb
  }

}
