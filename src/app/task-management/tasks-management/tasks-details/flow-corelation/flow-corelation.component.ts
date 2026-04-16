import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-flow-corelation',
  templateUrl: './flow-corelation.component.html',
  styleUrls: ['./flow-corelation.component.scss']
})
export class FlowCorelationComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<FlowCorelationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
  }

  onCancel() {
    this.dialogRef.close();
  }

}
