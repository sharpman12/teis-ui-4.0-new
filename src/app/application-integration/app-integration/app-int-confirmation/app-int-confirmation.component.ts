import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';


@Component({
  selector: 'app-app-int-confirmation',
  templateUrl: './app-int-confirmation.component.html',
  styleUrls: ['./app-int-confirmation.component.scss']
})
export class AppIntConfirmationComponent implements OnInit {
  isSelected: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AppIntConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  onYesClick() {
    const obj = {
      isConfirm: true,
      isSelected: this.isSelected
    };
    this.dialogRef.close(obj);
  }

  onNoClick(): void {
    const obj = {
      isConfirm: false,
      isSelected: this.isSelected
    };
    this.dialogRef.close(obj);
  }
}
