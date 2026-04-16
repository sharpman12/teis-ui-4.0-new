import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';


@Component({
  selector: 'app-app-int-manual-auto-deploy',
  templateUrl: './app-int-manual-auto-deploy.component.html',
  styleUrls: ['./app-int-manual-auto-deploy.component.scss']
})
export class AppIntManualAutoDeployComponent {
   constructor(
      public dialogRef: MatDialogRef<AppIntManualAutoDeployComponent>,
      @Inject(MAT_DIALOG_DATA) public message: string
    ) {
      dialogRef.disableClose = true;
    }
  
    ngOnInit() {
    }
  
    ManualDeployClick() {
      this.dialogRef.close({deploymentMode:'Manual', success:true});
    }

     AutoDeployClick() {
      this.dialogRef.close({deploymentMode: 'Auto', success:true});
    }
  
    onCancelClick(): void {
      this.dialogRef.close({success:false});
    }

}
