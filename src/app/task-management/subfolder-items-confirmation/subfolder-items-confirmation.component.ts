import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-subfolder-items-confirmation',
  templateUrl: './subfolder-items-confirmation.component.html',
  styleUrls: ['./subfolder-items-confirmation.component.scss']
})
export class SubfolderItemsConfirmationComponent implements OnInit {
  currentUser: any;

  constructor(
    public dialogRef: MatDialogRef<SubfolderItemsConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    this.dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {
    
  }

  onYes() {
    const resObj = {
      isClosed: true,
      isSubFoldersItemsInclude: true
    };
    this.dialogRef.close(resObj);
  }

  onNo() {
    const resObj = {
      isClosed: true,
      isSubFoldersItemsInclude: false
    };
    this.dialogRef.close(resObj);
  }

  /*============== Cancel Request ===============*/
  onCancel() {
    const resObj = {
      isClosed: false,
      isSubFoldersItemsInclude: false
    };
    this.dialogRef.close(resObj);
  }
  /*============== END Cancel Request ===============*/
}
