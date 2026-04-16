import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-config-confirmation',
  templateUrl: './config-confirmation.component.html',
  styleUrls: ['./config-confirmation.component.scss']
})
export class ConfigConfirmationComponent implements OnInit, OnDestroy {
  connectedItems: Array<string> = [];

  constructor(
    public dialogRef: MatDialogRef<ConfigConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.connectedItems = this.dialogData?.connectedItems;
  }

  onClosed() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    
  }
}
