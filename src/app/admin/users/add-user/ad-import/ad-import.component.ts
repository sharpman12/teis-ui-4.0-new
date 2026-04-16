import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { UsersService } from '../../users.service';
import { BreadCrumbService } from '../../../../core/service/breadcrumb.service';

@Component({
  selector: 'app-ad-import',
  templateUrl: './ad-import.component.html',
  styleUrls: ['./ad-import.component.scss']
})
export class AdImportComponent implements OnInit, OnDestroy {
  users: Array<any> = [];
  userForm: UntypedFormGroup;
  searchUser: string;

  constructor(
    public dialogRef: MatDialogRef<AdImportComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    // private breadcrumb: BreadCrumbService,
    private usersService: UsersService
  ) {
    this.createForm();
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    // this.breadcrumb.visible = false;
    // this.breadcrumb.previous(); // show hide breadcrumb
  }

  createForm(): void {
    this.userForm = new UntypedFormGroup({
      yourChoice: new UntypedFormControl()
    });
  }

  getUsers(searchTerm: string) {
    // tslint:disable-next-line: deprecation
    this.usersService.getUserFromAd(searchTerm).subscribe(res => {
      const usersArr = [];
      usersArr.push(res);
      this.users = res;
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  selectUser(formValue) {
    this.dialogRef.close(formValue);
  }

  ngOnDestroy() {
    // this.breadcrumb.visible = true;
    // this.breadcrumb.previousHide(); // show hide breadcrumb
  }

}
