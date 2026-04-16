import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-exit-interactive-confirmation',
  templateUrl: './exit-interactive-confirmation.component.html',
  styleUrls: ['./exit-interactive-confirmation.component.scss']
})
export class ExitInteractiveConfirmationComponent implements OnInit {
  interactiveConfirmationForm: UntypedFormGroup;
  currentUser: any = null;

  constructor(
    public dialogRef: MatDialogRef<ExitInteractiveConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
  ) {
    dialogRef.disableClose = true;
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER) || '{}');
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.interactiveConfirmationForm = this.fb.group({
      status: [{ value: 'MARK_AS_COMPLETE', disabled: false }, {
        validators: []
      }]
    });
  }

  getTaskStatusValue() {
    return this.interactiveConfirmationForm.get('status')?.value;
  }

  onYesClick() {
    const obj = {
      isConfirm: true,
      status: this.getTaskStatusValue()
    };
    this.dialogRef.close(obj);
  }

  onNoClick(): void {
    const obj = {
      isConfirm: false,
      status: this.getTaskStatusValue()
    };
    this.dialogRef.close(obj);
  }
}
