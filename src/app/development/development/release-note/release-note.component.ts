import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-release-note',
  templateUrl: './release-note.component.html',
  styleUrls: ['./release-note.component.scss']
})
export class ReleaseNoteComponent implements OnInit, OnDestroy {
  addNoteForm: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<ReleaseNoteComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private fb: UntypedFormBuilder,
  ) {
    // Initialize any necessary data or state here
  }

  ngOnInit(): void {
    // Logic to handle component initialization
    this.createForm();
  }

  createForm(): void {
    this.addNoteForm = this.fb.group({
      newNote: [{ value: '', disabled: false }, {
        validators: []
      }]
    });
  }

  addNote() {
    this.dialogRef.close({
      isConfirmed: true,
      note: this.addNoteForm.get('newNote').value
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    // Cleanup logic if needed
  }

}
