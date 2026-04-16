import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Constants } from 'src/app/shared/components/constants';
import { SharedService } from '../../../shared/services/shared.service';
import { GlobalDataService } from '../../global-data.service';
import { EditModules } from '../editmodules';
import { Roles } from '../roles';
import { RolesService } from '../roles.service';
import { BreadCrumbService } from '../../../core/service/breadcrumb.service';
import { CheckWhitespace } from 'src/app/shared/validation/check-whitespace.validator';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-add-role',
  templateUrl: './add-role.component.html',
  styleUrls: ['./add-role.component.scss']
})
export class AddRoleComponent implements OnInit, OnDestroy {
  subHeading = '';
  path = '';
  roleForm: UntypedFormGroup;
  roleId: any;
  roleData: any;
  isAddRole: boolean;
  seletedModules: Array<any>;
  allModules: Array<any> = [];
  selectedFiles2: TreeNode;
  preSelectedModules: string[];
  cssClass = 'mytree';
  username: any;
  currentUser: any;
  public arrTree: TreeNode[] = [];
  selectedFile: any[] = [];
  isExpanded = false;
  isRoleNamePresent: boolean;
  filteredUserTypes: Array<any> = [];
  selectedUserType: string = 'AU';
  roleById: any = null;
  updateRoleFromProfileObj: any = null;

  userTypeArr: Array<any> = [
    { id: 'AU', name: 'Admin', adminUser: true, superAdminUser: false, otherUser: false },
    { id: 'SA', name: 'Super Admin', adminUser: false, superAdminUser: true, otherUser: false },
    { id: 'OU', name: 'Ordinary User', adminUser: false, superAdminUser: false, otherUser: true }
  ];

  validationMessages = {
    name: {
      required: 'Name is required',
      maxlength: 'Name must not be more than 128 characters',
      hasWhitespace: "Whitespace not allowed"
    },
    description: {
      required: 'Description is required',
      maxlength: 'Description must not be more than 2000 characters',
    }
  };

  formErrors = {
    name: '',
    description: ''
  };

  allModulesSubscriptions = Subscription.EMPTY;
  createRoleSubscriptions = Subscription.EMPTY;
  updateRoleSubscriptions = Subscription.EMPTY;

  constructor(
    private router: Router,
    private location: Location,
    private fb: UntypedFormBuilder,
    private rolesService: RolesService,
    private activatedRoute: ActivatedRoute,
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
    this.breadcrumb.visible = false;
    this.breadcrumb.previous(); // show hide breadcrumb
    this.createForm();

    this.path = this.router.url;
    if (this.path === '/admin/roles/addrole') {
      this.subHeading = 'Add role';
      this.getAllModules();
      if (this.currentUser?.superAdminUser) {
        this.roleForm.get('userType').patchValue('AU');
        this.roleForm.get('userType').disable();
      } else if (this.currentUser?.adminUser) {
        this.roleForm.get('userType').patchValue('OU');
        this.roleForm.get('userType').disable();
      } else {
        this.roleForm.get('userType').enable();
      }
    } else {
      this.subHeading = 'Update role';
      const spanEle = document.getElementById('valid');
      spanEle.style.display = 'none';
      // tslint:disable-next-line: deprecation
      this.activatedRoute.params.subscribe(params => {
        if (params.id) {
          this.roleId = params.id;
          this.getRoleById(this.roleId);
          // if (this.roleId === '1') {
          //   this.roleForm.disable();
          // } else {
          //   this.roleForm.enable();
          // }
        }
      });
    }

    /*=========== Get Current User Data From LocalStroage ============*/
    this.username = localStorage.getItem(Constants.USERNAME);
    /*=========== Get Current User Data From LocalStroage ============*/

    // tslint:disable-next-line: deprecation
    this.sharedService.isAddRole.subscribe(res => {
      this.isAddRole = res;
    });

    this.roleForm.get('name').valueChanges.subscribe(res => {
      this.isRoleNamePresent = false;
    });

    /*---------------- Update Role From Profile ----------------*/
    this.sharedService.getURPGDetails.pipe(take(1)).subscribe((res) => {
      this.updateRoleFromProfileObj = res;
    });

    this.filterUserTypeArr();
  }

  /*=================== Create Form ===================*/
  createForm() {
    this.roleForm = this.fb.group({
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
    });
    // tslint:disable-next-line: deprecation
    this.roleForm.valueChanges.subscribe((data: any) => {
      this.logValidationErrors(this.roleForm);
    });
  }
  /*=================== END Create Form ===================*/

  /*============Check Form Validation and Display Messages============*/
  logValidationErrors(group: UntypedFormGroup = this.roleForm): void {
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

    } else {

    }
  }

  /*================== Get All Modules ===================*/
  getAllModules() {
    // tslint:disable-next-line: deprecation
    this.allModulesSubscriptions = this.rolesService.getAllModules().subscribe(res => {

      let nodeArray: TreeNode;

      res.forEach((element) => {
        let module = JSON.parse(element);

        if (this.currentUser?.adminUser) {
          if (module?.id === 13 && module?.name === 'Workspace Management') {
            // IDs to filter out
            const excludeIds = [122, 145, 146];

            // Filter array to exclude these ids
            const filteredArr = module?.children.filter(obj => !excludeIds.includes(obj.id));
            module.children = filteredArr;
          }
        }

        this.allModules.push(module);

        this.setChildrenAsSelected(module);
        nodeArray = new EditModules(module, 0);

        this.arrTree.push(nodeArray);
      });

    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }
  /*================== END Get All Modules ===================*/

  /*================== Remove Workspace Action For OU User ==================*/
  private removeWsAction(node: any) {
    if (node.children) {
      for (let m = 0; m <= node.children.length - 1; m++) {
        this.removeWsAction(node.children[m]);
      }
    }
  }

  /*================== Update Label as Name ========================*/
  private setChildrenAsSelected(node: any) {
    node.label = node.name;
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
    const spanEle = document.getElementById('valid');
    if (this.selectedFile.length > 0) {
      spanEle.style.display = 'none';
    } else {
      spanEle.style.display = 'block';
    }
  }
  /*================== END Check Error Msg Validation on Node Select and De-select =====================*/

  /*================ Cancelled Role Creation ================*/
  requestCancelled() {
    if (this.isAddRole) {
      this.sharedService.returnToAddProfile.next(true);
      this.sharedService.isRoleAddFromProfile.next(true);
      this.sharedService.isRoleAddedForProfile = false;
      this.sharedService.isRoleSave.next(false);
      this.sharedService.isRoleAction = false;
      this.location.back();
    } else {
      this.sharedService.returnToAddProfile.next(false);
      this.sharedService.isRoleAction = true;
      // this.router.navigate(['/admin/roles']);
      this.sharedService.backToURPG({
        isReturnToProfile: this.updateRoleFromProfileObj?.isProfile,
        isReturnToRole: this.updateRoleFromProfileObj?.isRole,
        isReturnToGroup: this.updateRoleFromProfileObj?.isGroup,
        isUpdate: false,
        isProfile: this.updateRoleFromProfileObj?.isProfile,
        isRole: this.updateRoleFromProfileObj?.isRole,
        isGroup: this.updateRoleFromProfileObj?.isGroup,
        isProfileUser: this.updateRoleFromProfileObj?.isProfileUser,
        isRoleUser: this.updateRoleFromProfileObj?.isProfileUser,
        userId: this.updateRoleFromProfileObj?.userId,
        roleId: this.updateRoleFromProfileObj?.roleId,
        profileId: this.updateRoleFromProfileObj?.profileId,
        groupId: this.updateRoleFromProfileObj?.groupId,
        activeProfileId: this.updateRoleFromProfileObj?.activeProfileId,
        activeRoleId: this.updateRoleFromProfileObj?.activeRoleId,
        activeGroupId: this.updateRoleFromProfileObj?.activeGroupId,
        isExpandPT: this.updateRoleFromProfileObj?.isExpandPT,
        isExpandRT: this.updateRoleFromProfileObj?.isExpandRT,
        isExpandUT: this.updateRoleFromProfileObj?.isExpandUT
      });
      this.location.back();
    }
  }
  /*================ END Cancelled Role Creation ================*/

  /*================== Get Role By Id ===================*/
  getRoleById(roleId: any) {
    const role = this.activatedRoute.snapshot.data.role;
    this.roleById = role;
    if (role) {
      this.roleData = role;
      this.isExpanded = true;
      this.roleForm.patchValue({
        name: role.name,
        description: role.description,
        userType: role?.superAdminRole ? 'SA' : role?.adminRole ? 'AU' : 'OU'
      });

      let modules = null;
      let nodeArray: TreeNode;
      role.modulesTree.forEach(module => {
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
        // this.arrTree.push(nodeArray);
        this.checkArrTreeNode(nodeArray);
        this.countSeletedNode(nodeArray, true);
        // if (this.roleId === '1') {
        //   this.setNodeAsDisabled(nodeArray);
        // }
        if ((this.roleById?.superAdminRole && this.currentUser?.superAdminUser) || (this.roleById?.adminRole && this.currentUser?.adminUser)) {
          this.setNodeAsDisabled(nodeArray);
        }
      });

      if ((this.roleById?.superAdminRole && this.currentUser?.superAdminUser) || (this.roleById?.adminRole && this.currentUser?.adminUser)) {
        this.roleForm.disable();
      } else {
        this.roleForm.enable();
        this.roleForm.get('userType').disable();
      }
    }
  }
  /*================== END Get Role By Id ===================*/

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
  /*=================== END Set Tree Node Disabled ===================*/

  /*=================== Check Selected Tree Node ===================*/
  countSeletedNode(nodes, updateSelectedFile: boolean) {
    if (nodes.isSelected === true) {
      if (updateSelectedFile) {
        // Do not update in case of onNodeSelect
        // nodes.selectable = false;
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
  /*============== END Checks if node is already present in arrTree ==============*/

  /*====================== Save Role =======================*/
  saveRole(formData: Roles) {
    const formValue = this.roleForm.getRawValue();
    this.roleForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.roleForm.valid && this.selectedFile.length) {
      formValue.active = true;
      formValue.deleted = false;
      const modules = [];
      this.selectedFile.forEach(res => {
        modules.push({ id: res.id });
      });
      formValue.name = formValue?.name.trim();
      formValue.description = formValue?.description.trim();
      formValue.modules = modules;
      formValue.updatedBy = this.username;
      formValue.superAdminRole = formValue?.userType === 'SA' ? true : false;
      formValue.adminRole = formValue?.userType === 'AU' ? true : false;
      delete formValue?.userType;

      this.createRoleSubscriptions = this.rolesService.createRole(formValue).subscribe(res => {
        if (this.isAddRole) {
          this.globalDataService.addRole(res);
          this.sharedService.returnToAddProfile.next(true);
          this.sharedService.isRoleAddFromProfile.next(true);
          this.sharedService.isRoleAddedForProfile = true;
          this.sharedService.isRoleSave.next(true);
          this.sharedService.isRoleAction = false;
          this.location.back();
        } else {
          this.globalDataService.addRole(res);
          this.sharedService.returnToAddProfile.next(false);
          this.sharedService.isRoleAction = true;
          this.sharedService.isNewRoleAdded = true;
          this.router.navigate(['/admin/roles']);
        }
        this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'Role Created Successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.roleForm.controls.name.patchValue('');
          this.isRoleNamePresent = true;
        } else {
          // handle server side error here
          this.roleForm.controls.name.patchValue('');
          this.isRoleNamePresent = true;
        }
      });
    }
  }
  /*====================== END Save Role =======================*/

  get isFormValid(): boolean {
    return this.roleForm.disabled ? true : this.roleForm.valid;
  }

  /*====================== Update Role =======================*/
  updateRole(formData: Roles) {
    const formValue = this.roleForm.getRawValue();
    this.roleForm.markAllAsTouched();
    this.logValidationErrors();
    if (this.isFormValid && this.selectedFile.length) {
      formValue.id = this.roleId;
      formValue.active = this.roleData.active;
      formValue.deleted = this.roleData.deleted;
      const modules = [];
      this.selectedFile.forEach(res => {
        modules.push({ id: res.id });
      });
      formValue.name = formValue?.name.trim();
      formValue.description = formValue?.description.trim();
      formValue.modules = modules;
      formValue.updatedBy = this.username;
      formValue.superAdminRole = formValue?.userType === 'SA' ? true : false;
      formValue.adminRole = formValue?.userType === 'AU' ? true : false;
      delete formValue?.userType;

      this.updateRoleSubscriptions = this.rolesService.updateRole(formValue).subscribe(res => {
        this.globalDataService.updateRole(res);
        this.sharedService.isRoleAction = true;
        // this.router.navigate(['/admin/roles']);
        this.sharedService.backToURPG({
          isReturnToProfile: this.updateRoleFromProfileObj?.isProfile,
          isReturnToRole: this.updateRoleFromProfileObj?.isRole,
          isReturnToGroup: this.updateRoleFromProfileObj?.isGroup,
          isUpdate: true,
          isProfile: this.updateRoleFromProfileObj?.isProfile,
          isRole: this.updateRoleFromProfileObj?.isRole,
          isGroup: this.updateRoleFromProfileObj?.isGroup,
          isProfileUser: this.updateRoleFromProfileObj?.isProfileUser,
          isRoleUser: this.updateRoleFromProfileObj?.isProfileUser,
          userId: this.updateRoleFromProfileObj?.userId,
          roleId: this.updateRoleFromProfileObj?.roleId,
          profileId: this.updateRoleFromProfileObj?.profileId,
          groupId: this.updateRoleFromProfileObj?.groupId,
          activeProfileId: this.updateRoleFromProfileObj?.activeProfileId,
          activeRoleId: this.updateRoleFromProfileObj?.activeRoleId,
          activeGroupId: this.updateRoleFromProfileObj?.activeGroupId,
          isExpandPT: this.updateRoleFromProfileObj?.isExpandPT,
          isExpandRT: this.updateRoleFromProfileObj?.isExpandRT,
          isExpandUT: this.updateRoleFromProfileObj?.isExpandUT
        });
        this.location.back();
        this.messageService.add({ key: 'adminKey', severity: 'success', summary: '', detail: 'Role Updated Successfully!' });
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
          this.roleForm.controls.name.patchValue('');
          this.isRoleNamePresent = true;
        } else {
          // handle server side error here
          this.roleForm.controls.name.patchValue('');
          this.isRoleNamePresent = true;
        }
      });
    }
  }
  /*====================== END Update Role =======================*/

  ngOnDestroy() {
    this.allModulesSubscriptions.unsubscribe();
    this.createRoleSubscriptions.unsubscribe();
    this.updateRoleSubscriptions.unsubscribe();
    this.sharedService.isAddRole.next(false);
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
  }

}
