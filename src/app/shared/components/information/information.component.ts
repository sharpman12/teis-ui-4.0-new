import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<InformationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {

  }

  onYesClick(): void {
    const obj = {
      isConfirmed: true,
    };
    this.dialogRef.close(obj);
  }

  onNoClick(): void {
    const obj = {
      isConfirmed: false,
    };
    this.dialogRef.close(obj);
  }
}
