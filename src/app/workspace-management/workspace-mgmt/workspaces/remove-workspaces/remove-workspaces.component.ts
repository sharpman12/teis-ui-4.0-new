import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-remove-workspaces',
  templateUrl: './remove-workspaces.component.html',
  styleUrls: ['./remove-workspaces.component.scss']
})
export class RemoveWorkspacesComponent implements OnInit {
  isTaskDelete = false;

  constructor(
    public dialogRef: MatDialogRef<RemoveWorkspacesComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  removeWorkspace() {
    const removeObj = {
      isRemove: true,
      isTaskDelete: this.isTaskDelete
    };
    this.dialogRef.close(removeObj);
  }

  onCancel() {
    this.dialogRef.close();
  }

}
