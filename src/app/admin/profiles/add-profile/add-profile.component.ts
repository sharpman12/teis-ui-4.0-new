import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Profiles } from '../profiles';
import { ProfilesService } from '../profiles.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService, TreeNode } from 'primeng/api';
import { SharedService } from '../../../shared/services/shared.service';
import { take } from 'rxjs/operators';
import { EditFunctionalMap } from '../editfunctionalmap';
import { GlobalDataService } from '../../global-data.service';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/components/constants';
import { BreadCrumbService } from '../../../core/service/breadcrumb.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { CreateProfileFromGroup } from '../../groups/groups';

@Component({
  selector: 'app-add-profile',
  templateUrl: './add-profile.component.html',
  styleUrls: ['./add-profile.component.scss']
})
export class AddProfileComponent implements OnInit, AfterViewInit, OnDestroy {
  subHeading = '';
  path = '';
  profileForm: UntypedFormGroup;
  selectedRole: any;
  profileId: any;
  allRoles: any;
  isAddProfile: boolean;
  localSelectedRoles = [];
  username: any;
  public arrTree: TreeNode[] = [];
  public archiveArrTree: TreeNode[] = [];
  selectedFile: any[] = [];
  preSelectedItems: any[] = [];
  selectedArchiveFile: any[] = [];
  isExpanded = false;
  isArchiveExpanded = false;
  isProfileNamePresent: boolean;
  partialSelectedItems: Array<any> = [];
  fullSelectedItems: Array<any> = [];
  unSelectedItems: Array<any> = [];
  newlySelectedItems: Array<any> = [];
  isFmLoading = false;
  isAfmLoading = false;
  isClickOnAddRole = false;
  isAdd = false;
  currentUser: any;
  isArchivePackInstalled: boolean;
  filteredUserTypes: Array<any> = [];
  filteredRolesArr: Array<any> = [];
  selectedUserType: string = 'AU';
  profileById: any = null;
  updateProfileFromRoleObj: any = null;
  createProfileForGrp: CreateProfileFromGroup = null;

  userTypeArr: Array<any> = [
    { id: 'AU', name: 'Admin', adminUser: true, superAdminUser: false, otherUser: false },
    { id: 'SA', name: 'Super Admin', adminUser: false, superAdminUser: true, otherUser: false },
    { id: 'OU', name: 'Ordinary User', adminUser: false, superAdminUser: false, otherUser: true }
  ];

  validationMessages = {
    name: {
      required: 'Profile name is required',
      maxlength: 'Name must not be more than 128 characters',
      hasWhitespace: "Whitespace not allowed"
    },
    description: {
      required: 'Description is required',
      maxlength: 'Description must not be more than 2000 characters',
    },
    roleDataList: {
      required: 'Connected role is required'
    }
  };

  formErrors = {
    name: '',
    description: '',
    roleDataList: ''
  };

  functionalMapSubscriptions = Subscription.EMPTY;
  allRolesSubscriptions = Subscription.EMPTY;
  createProfileSubscriptions = Subscription.EMPTY;
  updateProfileSubscriptions = Subscription.EMPTY;


  constructor(
    private router: Router,
    private location: Location,
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private profilesService: ProfilesService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private globalDataService: GlobalDataService,
    private breadcrumb: BreadCrumbService,
  ) {
    this.currentUser = JSON.parse(
      localStorage.getItem(Constants.CURRENTUSER)
    );
  }

  ngOnInit() {
    // this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.breadcrumb.visible = false;
    this.breadcrumb.previous(); // show hide breadcrumb
    this.createForm();
    /*---------------- Get Current Router Path ---------------*/
    this.path = this.router.url;
    if (this.path === '/admin/profiles/addprofile') {
      this.isAdd = true;
      this.subHeading = 'Add profile';
      this.getFunctionalMap();
      if (this.currentUser?.superAdminUser) {
        this.profileForm.get('userType').patchValue('AU');
        this.profileForm.get('userType').disable();
      } else if (this.currentUser?.adminUser) {
        this.profileForm.get('userType').patchValue('OU');
        this.profileForm.get('userType').disable();
        // Admin can create admin profile for deligation case
        // this.profileForm.get('userType').enable();
      } else {
        this.profileForm.get('userType').enable();
      }
    } else {
      this.isAdd = false;
      this.subHeading = 'Update profile';
      this.activatedRoute.params.subscribe(params => {
        if (params.id) {
          this.profileId = params.id;
          this.checkIsArchivePackInstalled();
          // if (this.currentUser?.id === '1' && this.profileId === '1') {
          //   this.profileForm.enable();
          // } else {
          //   this.profileForm.disable();
          // }
          if (Number(this.profileId) === Number(this.currentUser?.profileRef) || Number(this.profileId) === 11) {
            this.profileForm.disable();
          } else if (this.currentUser?.superAdminUser) {
            this.profileForm.get('userType').patchValue('AU');
            this.profileForm.get('userType').disable();
          } else if (this.currentUser?.adminUser) {
            this.profileForm.get('userType').patchValue('OU');
            this.profileForm.get('userType').disable();
            // Admin can create admin profile for deligation case
            // this.profileForm.get('userType').enable();
          } else {
            this.profileForm.enable();
          }
        }
      });
    }
    /*---------------- END Get Current Router Path ---------------*/

    /*-------------- Get Current User Data From LocalStroage --------------*/
    this.username = localStorage.getItem(Constants.USERNAME);
    /*-------------- END Get Current User Data From LocalStroage --------------*/

    // tslint:disable-next-line: deprecation
    this.sharedService.isAddProfile.subscribe(res => {
      this.isAddProfile = res;
    });

    /*---------------- Get Localstroage Data ----------------*/
    // tslint:disable-next-line: deprecation
    this.sharedService.returnToAddProfile.pipe(take(1)).subscribe(res => {
      if (res) {
        const profile = JSON.parse(localStorage.getItem('profileDetails'));
        this.localSelectedRoles = [];
        profile.roleDataList.forEach(elements => {
          this.localSelectedRoles.push(elements.id);
        });
        this.profileForm.patchValue({
          name: profile.name,
          description: profile.description,
          roleDataList: this.localSelectedRoles
        });
        this.selectedRole = this.localSelectedRoles;
      }
    });
    /*---------------- END Get Localstroage Data ----------------*/

    /*---------------- Check Profile Add From Add User Page Flag ----------------*/
    this.sharedService.isRoleAddFromProfile.pipe(take(1)).subscribe(res => {
      this.getAllRoles(res);
    });
    /*---------------- END Check Profile Add From Add User Page Flag ----------------*/

    this.profileForm.get('name').valueChanges.subscribe(res => {
      this.isProfileNamePresent = false;
    });

    /*---------------- Update Profile From Role ----------------*/
    this.sharedService.getURPGDetails.pipe(take(1)).subscribe((res) => {
      this.updateProfileFromRoleObj = res;
    });

    /*---------------- Create Profile For Group ----------------*/
    this.sharedService.createProfile.pipe(take(1)).subscribe((res) => {
      this.createProfileForGrp = res;
    });

    this.filterUserTypeArr();
  }

  ngAfterViewInit() {
    if (this.path !== '/admin/profiles/addprofile') {
      const profile = this.activatedRoute.snapshot.data.profile;
      if (profile) {
        const funMapArr = JSON.parse(profile.functionalMapTree);
        /*------------ Show Error Message ------------*/
        const spanEle = document.getElementById('valid');
        if (funMapArr.length > 0) {
          spanEle.style.display = 'none';
        } else {
          spanEle.style.display = 'block';
        }
        /*------------ END Show Error Message ------------*/
      }
    }
  }

  /*=========== Is Archive Packed Installed ============*/
  checkIsArchivePackInstalled() {
    this.sharedService.archivePackInstalled.pipe(take(1)).subscribe(res => {
      this.isArchivePackInstalled = res;
      this.getProfileById(this.profileId, res);
    });
  }
  /*=========== END Is Archive Packed Installed ============*/

  /*================= Create Form =================*/
  createForm() {
    this.profileForm = this.fb.group({
      userType: [{ value: 'AU', disabled: false }, {
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
          Validators.maxLength(2000)
        ]
      }],
      roleDataList: [{ value: '', disabled: false }, {
        validators: [Validators.required]
      }],
      active: [{ value: false, disabled: false }, {
        validators: []
      }],
    });
    // tslint:disable-next-line: deprecation
    this.profileForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.profileForm);
    });
  }
  /*================= END Create Form =================*/

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

    } else {

    }
  }

  /*================= Get Profile By Id =================*/
  getProfileById(profileId: any, isArchivePackInstalled: boolean) {
    const profile = this.activatedRoute.snapshot.data.profile;
    this.profileById = profile;
    if (profile) {
      this.isExpanded = true;
      this.isArchiveExpanded = true;
      const selectedRoles = [];
      const selectedFunctionalMap = [];
      const selectedArchiveFunctionalMap = [];
      profile.roleDataList.forEach(elements => {
        selectedRoles.push(elements.id);
      });
      if (Number(this.profileId) === 11) {
        this.profileForm.get('userType').patchValue('SA');
      }
      this.profileForm.patchValue({
        name: profile.name,
        description: profile.description,
        roleDataList: selectedRoles,
        active: !profile.active
      });
      this.selectedRole = selectedRoles;

      /*------------ Get Functional Map By Id ------------*/
      const funMapArr = JSON.parse(profile.functionalMapTree);
      let funMap;
      funMapArr.forEach((element) => {
        funMap = element;
        selectedFunctionalMap.push(funMap);
        let nodeArray: TreeNode;
        nodeArray = new EditFunctionalMap(funMap, element?.type === 'WORKSPACE' ? element?.id : null);
        this.checkArrTreeNode(nodeArray);
        this.countSeletedNode(nodeArray, true);
        // if (this.currentUser?.id !== '1' && this.profileId !== '1') {
        //   this.setNodeAsDisabled(nodeArray);
        // }

        // Disabled tree if profile id is same as login user or user id is 11 for super admin user
        if (Number(this.profileId) === Number(this.currentUser?.profileRef) || Number(this.profileId) === 11) {
          this.setNodeAsDisabled(nodeArray);
        }
        this.setItemAsDisabled(nodeArray);
        if (this.currentUser?.superAdminUser) {
          this.setPITItemAsDisabled(nodeArray);
        }
      });
      /*------------ END Get Functional Map By Id ------------*/

      /*------------ Get Archive Functional Map By Id ------------*/
      // const archiveFunMapArr = JSON.parse(profile?.archiveFunctionalMapTree);
      // let archiveFunMap;
      // archiveFunMapArr.forEach(item => {
      //   archiveFunMap = item;
      //   selectedArchiveFunctionalMap.push(archiveFunMap);
      //   let archiveNodeArray: TreeNode;
      //   archiveNodeArray = new EditFunctionalMap(archiveFunMap, 0);
      //   this.checkArchiveArrTreeNode(archiveNodeArray);
      //   this.countSeletedArchiveNode(archiveNodeArray, true);
      //   // if (this.currentUser?.id !== '1' && this.profileId !== '1') {
      //   //   this.setNodeAsDisabled(archiveNodeArray);
      //   // }
      // });
      if (isArchivePackInstalled) {
        this.getArchiveFunctionalMapByProfileId(profile?.id);
      }
      /*------------ END Get Archive Functional Map By Id ------------*/
    }
  }
  /*================= END Get Profile By Id =================*/

  /*=================== Get Functional Map ===================*/
  getFunctionalMap() {
    this.isFmLoading = true;
    // tslint:disable-next-line: deprecation
    this.functionalMapSubscriptions = this.profilesService.getFunctionalMap().subscribe(res => {
      if (res) {
        const functionalMap = [];
        let funMap;
        res.forEach((element) => {
          funMap = element;
          this.setChildrenAsSelected(funMap);
          let nodeArray: TreeNode;
          nodeArray = new EditFunctionalMap(funMap, element?.type === 'WORKSPACE' ? element?.id : null);
          // functionalMap.push(nodeArray);
          this.setItemAsDisabled(nodeArray);
          if (this.currentUser?.superAdminUser) {
            this.setPITItemAsDisabled(nodeArray);
          }
          this.arrTree.push(nodeArray);
        });
        // this.arrTree = functionalMap;
        this.isFmLoading = false;
      }
      this.isFmLoading = false;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*=================== END Get Functional Map ===================*/

  /*=============== Get Archive Functional Map By Id ==============*/
  getArchiveFunctionalMapByProfileId(profileId: any, profileData?: Profiles) {
    this.isAfmLoading = true;
    this.profilesService.getArchiveFunctionalMapByProfileId(profileId).subscribe(res => {
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

  getArchiveFunMap(profile: Profiles) {
    const selectedArchiveFunctionalMap = [];
    const archiveFunMapArr = JSON.parse(profile?.functionalMapTree);
    let archiveFunMap;
    archiveFunMapArr.forEach(item => {
      archiveFunMap = item;
      selectedArchiveFunctionalMap.push(archiveFunMap);
      let archiveNodeArray: TreeNode;
      archiveNodeArray = new EditFunctionalMap(archiveFunMap, item?.type === 'WORKSPACE' ? item?.id : null);
      this.checkArchiveArrTreeNode(archiveNodeArray);
      this.countSeletedArchiveNode(archiveNodeArray, true);
      // if (this.currentUser?.id !== '1' && this.profileId !== '1') {
      //   this.setNodeAsDisabled(archiveNodeArray);
      // }

      // Disabled tree if profile id is same as login user or user id is 11 for super admin user
      if (Number(this.profileId) === Number(this.currentUser?.profileRef) || Number(this.profileId) === 11) {
        this.setNodeAsDisabled(archiveNodeArray);
      }
    });
  }

  /*=================== Expand/Collaps All Functional Map Tree =====================*/
  expandAll() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.arrTree.forEach(node => {
        this.expandRecursive(node, true);
      });
    } else {
      this.arrTree.forEach(node => {
        this.expandRecursive(node, false);
      });
    }
  }

  expandAllArchive() {
    this.isArchiveExpanded = !this.isArchiveExpanded;
    if (this.isArchiveExpanded) {
      this.archiveArrTree.forEach(node => {
        this.expandRecursive(node, true);
      });
    } else {
      this.archiveArrTree.forEach(node => {
        this.expandRecursive(node, false);
      });
    }
  }

  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }
  /*=================== END Expand/Collaps All Functional Map Tree =====================*/

  /*=================== Set Tree Node Disabled ===================*/
  private setNodeAsDisabled(node: any) {
    node.selectable = false;
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setNodeAsDisabled(node.children[m]);
      }
    }
  }

  private setItemAsDisabled(node: any) {
    if (this.currentUser?.adminUser) {
      if (node?.nodeType !== 'MODULE') {
        if (node?.profileSelectionPartial && !node?.hasFullAccess) {
          node.selectable = false;
        }
      }
    }
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setItemAsDisabled(node.children[m]);
      }
    }
  }

  private setPITItemAsDisabled(node: any) {
    // Super admin can select only workspace JIRA TEI-5082
    //  && node?.nodeType !== 'FOLDER' && node?.nodeType !== 'FLOWGROUP'
    if (node?.nodeType !== 'WORKSPACE') {
      node.selectable = false;
    }
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setPITItemAsDisabled(node.children[m]);
      }
    }
  }
  /*=================== END Set Tree Node Disabled ===================*/

  /*================== Update Label as Name ========================*/
  private setChildrenAsSelected(node: any) {
    node.label = node.name;
    node.expanded = false;
    node.selected = false;
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.setChildrenAsSelected(node.children[m]);
      }
    }
  }
  /*================== END Update Label as Name ========================*/

  /*================== Check Error Msg Validation on Node Select and De-select =====================*/
  nodeSelect(event) {
    const spanEle = document.getElementById('valid');
    if (this.selectedFile.length > 0) {
      spanEle.style.display = 'none';
    } else {
      spanEle.style.display = 'block';
    }
  }

  nodeUnselect(event) {
    this.unSelectedItems.push(event?.node);
    const spanEle = document.getElementById('valid');
    if (this.selectedFile.length > 0) {
      spanEle.style.display = 'none';
    } else {
      spanEle.style.display = 'block';
    }
  }

  unselectedTreeItems(): Array<any> {
    if (this.selectedFile.length && this.unSelectedItems?.length) {
      // To remove duplicates by id:
      const uniqueRemovedItems = this.unSelectedItems.filter((obj, i, arr) => i === arr.findIndex((o) => o.id === obj.id));
      const result = uniqueRemovedItems.filter(obj2 => !this.selectedFile.some(obj1 => Number(obj1.id) === Number(obj2.id)));
      return this.getProfileAccessItemsList(result);
    }
  }

  newlyAddedItems() {
    if (this.selectedFile.length && this.preSelectedItems.length) {
      const newlySelectedItems = this.selectedFile.filter(obj1 => !this.preSelectedItems.some(obj2 => Number(obj1.id) === Number(obj2.id)));
      return this.getProfileAccessItemsList(newlySelectedItems);
    }
  }
  /*================== END Check Error Msg Validation on Node Select and De-select =====================*/

  /*=================== Check Selected Tree Node ===================*/
  countSeletedNode(nodes, updateSelectedFile: boolean) {
    if (nodes.isSelected === true) {
      if (updateSelectedFile) {
        // Do not update in case of onNodeSelect
        this.selectedFile.push(nodes);
        this.preSelectedItems.push(nodes);
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

  /*============== Checks if node is already present in arrTree ==============*/
  private checkArrTreeNode(temp) {
    if (this.arrTree.length > 0) {
      let found = false;
      for (let count = 0; count <= this.arrTree.length - 1; count++) {
        if (this.arrTree[count].label === temp.label) {
          found = true;
          break;
        }
      }
      if (!found) {
        this.arrTree.push(temp);
      }
    } else {
      this.arrTree.push(temp);
    }
  }

  private checkArchiveArrTreeNode(temp) {
    if (this.archiveArrTree.length > 0) {
      let found = false;
      for (let count = 0; count <= this.archiveArrTree.length - 1; count++) {
        if (this.archiveArrTree[count].label === temp.label) {
          found = true;
          break;
        }
      }
      if (!found) {
        this.archiveArrTree.push(temp);
      }
    } else {
      this.archiveArrTree.push(temp);
    }
  }
  /*============== END Checks if node is already present in arrTree ==============*/

  /*=================== Get All Roles ===================*/
  getAllRoles(isReturnFromAddRole: boolean) {
    const userType = this.currentUser?.superAdminUser ? 'SA' : this.currentUser?.adminUser ? 'AU' : 'OU';
    const SearchCriteria = {
      type: 'All',
      pageNumber: 0,
      name: null,
      excludeRecordId: null,
      userType: userType,
      // includeSuperAdmin: this.currentUser?.superAdminUser ? true : false,
      // includeAdmin: this.currentUser?.adminUser ? true : false,
      // includeUser: this.currentUser?.superAdminUser ? false : this.currentUser?.adminUser ? false : true,
      includeSuperAdmin: this.currentUser?.superAdminUser ? true : false,
      includeAdmin: this.currentUser?.superAdminUser ? true : this.currentUser?.adminUser ? true : false,
      includeUser: this.currentUser?.superAdminUser ? false : this.currentUser?.adminUser ? true : true,
      profileId: null
    };

    const roles = this.globalDataService.getRoles();
    if (isReturnFromAddRole && roles?.roleList?.length) {
      this.allRoles = roles.roleList;
      this.filterRoles();
      if (this.sharedService.isRoleAddedForProfile) {
        this.localSelectedRoles.push(roles?.roleList[0].id);
        this.profileForm.patchValue({
          roleDataList: this.localSelectedRoles
        });
        this.selectedRole = this.localSelectedRoles;
      }
    } else {
      this.allRolesSubscriptions = this.profilesService.getAllRoles(SearchCriteria).subscribe(res => {
        const allRoles = res['roles'];
        this.allRoles = allRoles;
        this.filterRoles();
        const rolesData = {
          roleId: null,
          searchCriteria: SearchCriteria,
          roleList: allRoles,
          totalCount: allRoles['totalCount']
        };
        this.globalDataService.storeRole(rolesData);
        /*---------------- Check Role is Saved or Cancelled and Set the Form Value --------------*/
        // tslint:disable-next-line: deprecation
        // this.sharedService.isRoleSave.subscribe(isRoleSaved => {
        //   if (isRoleSaved) {
        //     // tslint:disable-next-line: deprecation
        //     this.sharedService.returnToAddProfile.pipe(take(1)).subscribe(data => {
        //       if (data) {
        //         const role = this.allRoles[this.allRoles.length - 1];
        //         this.localSelectedRoles.push(role.id);
        //         this.profileForm.patchValue({
        //           roleDataList: this.localSelectedRoles
        //         });
        //         this.selectedRole = this.localSelectedRoles;
        //       }
        //     });
        //   }
        // });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }
  /*=================== END Get All Roles ===================*/

  filterRoles() {
    this.filteredRolesArr = [];
    const userType = this.profileForm.get('userType').value;
    const clonedRoles = JSON.parse(JSON.stringify(this.allRoles));
    if (userType === 'AU') {
      this.filteredRolesArr = clonedRoles.filter((x) => x?.adminRole);
    } else if (userType === 'OU') {
      this.filteredRolesArr = clonedRoles.filter((x) => (!x?.superAdminRole && !x?.adminRole));
    } else {
      this.filteredRolesArr = this.allRoles;
    }
  }

  /*================= Cancelled Request =================*/
  requestCancelled() {
    if (this.isAddProfile) {
      this.sharedService.returnToAddUser.next(true);
      this.sharedService.isProfileAddFromUser.next(true);
      this.sharedService.isProfileAddedForUser = false;
      this.sharedService.isProfileAction = false;
      this.location.back();
    } else if (this.createProfileForGrp && this.createProfileForGrp?.isCreateProfileFromGrp) {
      this.sharedService.returnToAddUser.next(false);
      const createProfileFromGrpObj: CreateProfileFromGroup = {
        isCreateProfileFromGrp: false,
        isProfileCreated: false,
        isCancelProfileCreation: true,
        groupId: null,
        profileId: null,
        groupFormData: this.createProfileForGrp?.groupFormData,
        groupMembers: this.createProfileForGrp.groupMembers,
        createdProfile: null
      };
      this.sharedService.backToCreateGroupPage(createProfileFromGrpObj);
      this.location.back();
    } else {
      this.sharedService.returnToAddUser.next(false);
      this.sharedService.isProfileAction = true;
      // this.router.navigate(['/admin/profiles']);
      this.sharedService.backToURPG({
        isReturnToProfile: this.updateProfileFromRoleObj?.isProfile,
        isReturnToRole: this.updateProfileFromRoleObj?.isRole,
        isReturnToGroup: this.updateProfileFromRoleObj?.isGroup,
        isUpdate: false,
        isProfile: this.updateProfileFromRoleObj?.isProfile,
        isRole: this.updateProfileFromRoleObj?.isRole,
        isGroup: this.updateProfileFromRoleObj?.isGroup,
        isProfileUser: this.updateProfileFromRoleObj?.isProfileUser,
        isRoleUser: this.updateProfileFromRoleObj?.isProfileUser,
        userId: this.updateProfileFromRoleObj?.userId,
        roleId: this.updateProfileFromRoleObj?.roleId,
        profileId: this.updateProfileFromRoleObj?.profileId,
        groupId: this.updateProfileFromRoleObj?.groupId,
        activeProfileId: this.updateProfileFromRoleObj?.activeProfileId,
        activeRoleId: this.updateProfileFromRoleObj?.activeRoleId,
        activeGroupId: this.updateProfileFromRoleObj?.activeGroupId,
        isExpandPT: this.updateProfileFromRoleObj?.isExpandPT,
        isExpandRT: this.updateProfileFromRoleObj?.isExpandRT,
        isExpandUT: this.updateProfileFromRoleObj?.isExpandUT
      });
      this.location.back();
    }
  }
  /*================= END Cancelled Request =================*/

  /*================ Add Role ================*/
  addRole() {
    const formValue = this.profileForm.value;
    const roleList = [];
    this.isClickOnAddRole = true;
    if (formValue.roleDataList) {
      formValue.roleDataList.forEach(roleId => {
        this.allRoles.forEach(element => {
          if (element.id === roleId) {
            const roles = { id: element.id };
            roleList.push(roles);
          }
        });
      });
    }
    formValue.roleDataList = roleList;
    localStorage.setItem('profileDetails', JSON.stringify(formValue));
    this.sharedService.isAddRole.next(true);
    this.router.navigate(['/admin/roles/addrole']);
  }

  /*============ Check Form Validation and Display Messages ============*/
  logValidationErrors(group: UntypedFormGroup = this.profileForm): void {
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
  /*============ END Check Form Validation and Display Messages ============*/

  get isFormValid(): boolean {
    return this.profileForm.disabled ? true : this.profileForm.valid;
  }

  /*============= Get Profile Access List =============*/
  getProfileAccessItemsList(arr: Array<any>) {
    const functionalMap = [];
    if (arr?.length) {
      // arr.forEach((res) => {
      //   if ((res?.nodeType === 'WORKSPACE' || res?.label === 'Application Services') && (res?.parent === null || res?.parent === undefined)) {
      //     functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
      //     // return false;
      //   } else {
      //     if (res?.parent?.partialSelected && res?.nodeType !== 'WORKSPACE') {
      //       functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
      //     }
      //   }
      // });

      if (this.currentUser?.superAdminUser) {
        arr.forEach((res) => {
          if ((res?.nodeType === 'WORKSPACE' || res?.label === 'Application Services') && (res?.parent === null || res?.parent === undefined)) {
            functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
            // return false;
          } else {
            if (res?.parent?.partialSelected && res?.nodeType !== 'WORKSPACE') {
              functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
            }
          }
        });
      } else if (this.currentUser?.adminUser) {
        arr.forEach((res) => {
          if ((res?.nodeType === 'WORKSPACE' || res?.label === 'Application Services') && (res?.parent === null || res?.parent === undefined) && !res?.profileSelectionPartial) {
            functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
            // return false;
          } else if (res?.parent?.profileSelectionPartial && res?.nodeType !== 'WORKSPACE' && !res?.profileSelectionPartial) {
            functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
          } else if (res?.parent?.partialSelected && res?.nodeType !== 'WORKSPACE' && !res?.profileSelectionPartial) {
            functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
          } else if (res?.parent?.partialSelected && res?.nodeType !== 'WORKSPACE') {
            functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
          }
        });
      }
    }
    return functionalMap;
  }
  /*============= END Get Profile Access List =============*/

  /*====================== Save Profile =======================*/
  saveProfile(formData: Profiles) {
    const formValue = this.profileForm.getRawValue();
    this.profileForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.isFormValid && this.selectedFile.length) {
      formValue.deleted = false;
      formValue.active = !formValue.active;
      const roleList = [];
      formValue.roleDataList.forEach(roleId => {
        this.allRoles.forEach(element => {
          if (element.id === roleId) {
            const roles = { id: element.id };
            roleList.push(roles);
          }
        });
      });
      formValue.roleDataList = roleList;
      // const functionalMap = [];
      // this.selectedFile.forEach((res) => {
      //   // let nodeType = res?.nodeType.toUpperCase();
      //   // if (!res?.parent || res?.parent?.partialSelected || (nodeType === 'INTEGRATION' || nodeType === 'PROCESS' || nodeType === 'TRIGGER' || nodeType === 'URL' || nodeType === 'URI')) {
      //   //   functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
      //   // }

      //   if (res?.nodeType === 'WORKSPACE' && (res?.parent === null || res?.parent === undefined)) {
      //     functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
      //     return false;
      //   } else {
      //     if (res?.parent?.partialSelected && res?.nodeType !== 'WORKSPACE') {
      //       functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
      //     }
      //   }
      // });

      formValue.name = formValue?.name.trim();
      formValue.description = formValue?.description.trim();
      // formValue.profileAccessList = functionalMap;
      formValue.profileAccessList = this.getProfileAccessItemsList(this.selectedFile);
      formValue.updatedBy = this.username;
      formValue.superAdminProfile = formValue?.userType === 'SA' ? true : false;
      formValue.adminProfile = formValue?.userType === 'AU' ? true : false;
      delete formValue?.userType;

      this.createProfileSubscriptions = this.profilesService.createProfile(formValue).subscribe(res => {
        if (this.isAddProfile) {
          this.globalDataService.addProfile(res);
          this.sharedService.returnToAddUser.next(true);
          this.sharedService.isProfileAddFromUser.next(true);
          this.sharedService.isProfileAddedForUser = true;
          this.sharedService.isProfileAction = false;
          this.location.back();
        } else if (this.createProfileForGrp && this.createProfileForGrp?.isCreateProfileFromGrp) {
          this.globalDataService.addProfile(res);
          this.sharedService.returnToAddUser.next(false);
          const createProfileFromGrpObj: CreateProfileFromGroup = {
            isCreateProfileFromGrp: false,
            isProfileCreated: true,
            isCancelProfileCreation: false,
            groupId: null,
            profileId: res?.id,
            groupFormData: this.createProfileForGrp?.groupFormData,
            groupMembers: this.createProfileForGrp.groupMembers,
            createdProfile: res
          };
          this.sharedService.backToCreateGroupPage(createProfileFromGrpObj);
          this.location.back();
        } else {
          this.globalDataService.addProfile(res);
          this.sharedService.returnToAddUser.next(false);
          this.sharedService.isProfileAction = true;
          this.sharedService.isNewProfileAdded = true;
          // this.router.navigate(['/admin/profiles']);
          this.location.back();
        }
        localStorage.removeItem('profileDetails');
        this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'Profile Created Successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.profileForm.controls.name.patchValue('');
          this.isProfileNamePresent = true;
        } else {
          // handle server side error here
          this.profileForm.controls.name.patchValue('');
          this.isProfileNamePresent = true;
        }
      });
    }
  }
  /*====================== END Save Profile =======================*/

  /*====================== Update Profile =======================*/
  updateProfile(formData: Profiles) {
    const formValue = this.profileForm.getRawValue();
    this.profileForm.markAllAsTouched();
    this.logValidationErrors();
    this.partialSelectedItems = [];
    this.fullSelectedItems = [];
    // const removedItems = this.unselectedTreeItems();
    // const newItems = this.newlyAddedItems();
    if (this.isFormValid && this.selectedFile.length) {
      formValue.id = this.profileId;
      formValue.deleted = false;
      formValue.active = !formValue.active;
      const roleList = [];
      formValue.roleDataList.forEach(roleId => {
        this.allRoles.forEach((element) => {
          if (element.id === roleId) {
            const roles = { id: element.id };
            roleList.push(roles);
          }
        });
      });
      formValue.roleDataList = roleList;
      // const functionalMap = [];

      // const selectedItems = this.partialSelectedItems.filter((x, i, arr) => i === arr.findIndex((o) => o.itemRef === x.itemRef));
      // this.selectedFile.forEach((res) => {
      //   // let nodeType = res?.nodeType.toUpperCase();
      //   // if (!res?.parent || res?.parent?.partialSelected || (nodeType === 'INTEGRATION' || nodeType === 'PROCESS' || nodeType === 'TRIGGER' || nodeType === 'URL' || nodeType === 'URI')) {
      //   //   functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
      //   // }

      //   // if (res?.nodeType === 'WORKSPACE' && (res?.parent === null || res?.parent === undefined)) {
      //   //   functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
      //   //   return false;
      //   // } else {
      //   //   if (res?.parent?.partialSelected && res?.nodeType !== 'WORKSPACE') {
      //   //     functionalMap.push({ workspaceId: res?.workspaceId, itemRef: res.id, itemName: res.label, itemType: res.nodeType, parentPartialSelected: res.parent ? res.parent.partialSelected : null });
      //   //   }
      //   // }

      //   // const partialSelectedItems = this.partialSelectedItems.filter((x, i, arr) => i === arr.findIndex((o) => o.itemRef === x.itemRef));
      //   // const fullSelectedItems = this.fullSelectedItems.filter((x, i, arr) => i === arr.findIndex((o) => o.itemRef === x.itemRef));
      // });

      formValue.name = formValue?.name.trim();
      formValue.description = formValue?.description.trim();
      // formValue.profileAccessList = functionalMap;
      formValue.profileAccessList = this.getProfileAccessItemsList(this.selectedFile);
      formValue.updatedBy = this.username;
      formValue.superAdminProfile = formValue?.userType === 'SA' ? true : false;
      formValue.adminProfile = formValue?.userType === 'AU' ? true : false;
      delete formValue?.userType;

      this.updateProfileSubscriptions = this.profilesService.updateProfile(formValue).subscribe(res => {
        if (this.isArchivePackInstalled) {
          this.updateArchiveFunMap(formValue);
        }
        this.sharedService.isProfileAction = true;
        this.globalDataService.updateProfile(res);
        // this.router.navigate(['/admin/profiles']);
        this.sharedService.backToURPG({
          isReturnToProfile: this.updateProfileFromRoleObj?.isProfile,
          isReturnToRole: this.updateProfileFromRoleObj?.isRole,
          isReturnToGroup: this.updateProfileFromRoleObj?.isGroup,
          isUpdate: true,
          isProfile: this.updateProfileFromRoleObj?.isProfile,
          isRole: this.updateProfileFromRoleObj?.isRole,
          isGroup: this.updateProfileFromRoleObj?.isGroup,
          isProfileUser: this.updateProfileFromRoleObj?.isProfileUser,
          isRoleUser: this.updateProfileFromRoleObj?.isProfileUser,
          userId: this.updateProfileFromRoleObj?.userId,
          roleId: this.updateProfileFromRoleObj?.roleId,
          profileId: this.updateProfileFromRoleObj?.profileId,
          groupId: this.updateProfileFromRoleObj?.groupId,
          activeProfileId: this.updateProfileFromRoleObj?.activeProfileId,
          activeRoleId: this.updateProfileFromRoleObj?.activeRoleId,
          activeGroupId: this.updateProfileFromRoleObj?.activeGroupId,
          isExpandPT: this.updateProfileFromRoleObj?.isExpandPT,
          isExpandRT: this.updateProfileFromRoleObj?.isExpandRT,
          isExpandUT: this.updateProfileFromRoleObj?.isExpandUT
        });
        this.location.back();
        localStorage.removeItem('profileDetails');
        this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'Profile Update Successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.profileForm.controls.name.patchValue('');
          this.isProfileNamePresent = true;
        } else {
          // handle server side error here
          this.profileForm.controls.name.patchValue('');
          this.isProfileNamePresent = true;
        }
      });
    }
  }

  updateArchiveFunMap(formValue: Profiles) {
    const archiveFunctionalMap = [];
    this.selectedArchiveFile.forEach(item => {
      archiveFunctionalMap.push(
        {
          itemRef: item.id,
          itemName: item.label,
          itemType: item.nodeType,
          parentPartialSelected: item.parent ? item.parent.partialSelected : null
        }
      );
    });
    // const archiveObj = {
    //   id: this.profileId,
    //   profileAccessList: archiveFunctionalMap
    // };
    formValue.profileAccessList = archiveFunctionalMap;
    this.profilesService.updateArchiveProfile(formValue).subscribe(res => {
      this.sharedService.isProfileAction = true;
      this.globalDataService.updateArchiveFunMap(res);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
        this.profileForm.controls.name.patchValue('');
        this.isProfileNamePresent = true;
      } else {
        // handle server side error here
        this.profileForm.controls.name.patchValue('');
        this.isProfileNamePresent = true;
        this.messageService.add({ key: 'adminArchivePkgInfoKey', severity: 'success', summary: '', detail: err.error });
      }
    });
  }
  /*====================== END Update Profile =======================*/

  ngOnDestroy() {
    this.functionalMapSubscriptions.unsubscribe();
    this.allRolesSubscriptions.unsubscribe();
    this.createProfileSubscriptions.unsubscribe();
    this.updateProfileSubscriptions.unsubscribe();
    if (this.isAddProfile && this.isClickOnAddRole) {
      this.sharedService.isAddProfile.next(true);
    } else {
      this.sharedService.isAddProfile.next(false);
    }
    this.sharedService.returnToAddProfile.next(false);
    this.sharedService.isRoleAddFromProfile.next(false);
    this.sharedService.isRoleAddedForProfile = false;
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
    this.breadcrumb.visible = true;
    this.breadcrumb.previousHide(); // show hide breadcrumb
    this.sharedService.createProfileFromGroup(null);
  }
}
