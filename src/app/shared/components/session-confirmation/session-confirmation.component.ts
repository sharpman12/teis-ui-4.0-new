import { Component, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-session-confirmation',
  templateUrl: './session-confirmation.component.html',
  styleUrls: ['./session-confirmation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionConfirmationComponent implements OnInit {
  countdown: number = 60;

  constructor(
    public dialogRef: MatDialogRef<SessionConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private cdr: ChangeDetectorRef
  ) {
    dialogRef.disableClose = true;
    this.countdown = dialogData?.countdown || 60;
  }

  ngOnInit() {
  }

  onConfirm(): void {
    const obj = {
      confirmed: true,
      reason: this.dialogData?.reason
    };
    this.dialogRef.close(obj);
  }

  onCancel(): void {
    const obj = {
      confirmed: false,
      reason: this.dialogData?.reason
    };
    this.dialogRef.close(obj);
  }

  // Detect changes when dialog data is updated
  detectChanges(): void {
    this.cdr.markForCheck();
  }

}
