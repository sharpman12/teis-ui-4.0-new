import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-get-lock-confirmation',
  templateUrl: './get-lock-confirmation.component.html',
  styleUrls: ['./get-lock-confirmation.component.scss']
})
export class GetLockConfirmationComponent implements OnInit, OnDestroy {
  confirmationForm: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<GetLockConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    // Initialization logic can go here
    this.createForm();
    if (Number(this.dialogData?.scriptInfo?.deployedVersion) === 0) {
      this.confirmationForm.get('scriptCopy')?.disable();
    } else {
      this.confirmationForm.get('scriptCopy')?.enable();
    }
  }

  createForm(): void {
    this.confirmationForm = this.fb.group({
      scriptCopy: [{ value: 'Deployed', disabled: false }, {
        validators: []
      }]
    });
  }

  onChangeScriptCopy(): void {
    // Logic to handle script type change can go here
    // For example, you might want to update some state or perform an action
  }

  onConfirm(): void {
    const scriptCopy = this.confirmationForm.get('scriptCopy')?.value;
    this.dialogRef.close({ isGetLock: true, scriptCopy: scriptCopy });
  }

  onCancel(): void {
    this.dialogRef.close({ isGetLock: false, scriptCopy: null });
  }

  ngOnDestroy(): void {
    // Cleanup logic can go here
  }
}
