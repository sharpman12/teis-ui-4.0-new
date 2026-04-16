import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';


@Component({
  selector: 'app-app-int-add-note',
  templateUrl: './app-int-add-note.component.html',
  styleUrls: ['./app-int-add-note.component.scss']
})
export class AppIntAddNoteComponent implements OnInit {
  addNoteForm: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<AppIntAddNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    this.addNoteForm = this.fb.group({
      noteHistory: [{ value: this.dialogData.note, disabled: true }, {
        validators: []
      }],
      newNote: [{ value: '', disabled: false }, {
        validators: []
      }]
    });
    if (this.dialogData?.isValidationAdd) {
      this.addNoteForm.get('newNote').setValidators([Validators.required]);
      this.addNoteForm.get('newNote').updateValueAndValidity();
    } else {
      this.addNoteForm.get('newNote').clearValidators();
      this.addNoteForm.get('newNote').updateValueAndValidity();
    }
  }

  addNote() {
    this.dialogRef.close(this.addNoteForm.value);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
