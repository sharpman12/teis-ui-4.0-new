import { Component, Inject, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-add-note',
  templateUrl: './add-note.component.html',
  styleUrls: ['./add-note.component.scss']
})
export class AddNoteComponent implements OnInit {
  addNoteForm: UntypedFormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddNoteComponent>,
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
        validators: [Validators.required]
      }]
    });
  }

  addNote() {
    this.dialogRef.close(this.addNoteForm.value);
  }

  onCancel() {
    this.dialogRef.close();
  }

}
