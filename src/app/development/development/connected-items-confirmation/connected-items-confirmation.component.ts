import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-connected-items-confirmation',
  templateUrl: './connected-items-confirmation.component.html',
  styleUrls: ['./connected-items-confirmation.component.scss']
})
export class ConnectedItemsConfirmationComponent implements OnInit, OnDestroy {
  activeTab: number = 0;
  selectedWorkspace: any = null;

  constructor(
    public dialogRef: MatDialogRef<ConnectedItemsConfirmationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    dialogRef.disableClose = true;
    this.selectedWorkspace = (dialogData?.workspaceId === 0 || !dialogData?.workspaceId) ? dialogData?.connectedItems[0]?.workspaceId : dialogData?.workspaceId;
    this.getAllPITItemsCount();
    this.onChangeWorkspace();
  }

  ngOnInit(): void {
  }

  onChangeWorkspace() {
    // Logic to handle workspace change if needed
    const connectedItems = this.dialogData?.connectedItems || [];
    this.dialogData.processes = [];
    this.dialogData.integrations = [];
    this.dialogData.triggers = [];
    if (connectedItems?.length > 0) {
      connectedItems.forEach((x) => {
        if (Number(this.selectedWorkspace) === Number(x?.workspaceId)) {
          if (x?.scriptItemsAssociationPojos?.length > 0) {
            x?.scriptItemsAssociationPojos.forEach((association: any) => {
              if (association?.itemType?.toLowerCase() === 'process') {
                if (association?.connectedItemInfo?.length > 0) {
                  this.dialogData.processes = association.connectedItemInfo;
                }
              }
              if (association?.itemType?.toLowerCase() === 'integration') {
                if (association?.connectedItemInfo?.length > 0) {
                  this.dialogData.integrations = association.connectedItemInfo;
                }
              }
              if (association?.itemType?.toLowerCase() === 'triggers') {
                if (association?.connectedItemInfo?.length > 0) {
                  this.dialogData.triggers = association.connectedItemInfo;
                }
              }
            });
          }
        }
      });
    }
  }

  getAllPITItemsCount() {
    const connectedItems = this.dialogData?.connectedItems || [];
    const processes = [];
    const integrations = [];
    const triggers = [];
    if (connectedItems?.length > 0) {
      connectedItems.forEach((item: any) => {
        if (item?.scriptItemsAssociationPojos?.length > 0) {
          item.scriptItemsAssociationPojos.forEach((association: any) => {
            if (association?.itemType?.toLowerCase() === 'process') {
              if (association?.connectedItemInfo?.length > 0) {
                association?.connectedItemInfo.forEach((connectedProcess: any) => {
                  processes.push(connectedProcess);
                });
              }
            }
            if (association?.itemType?.toLowerCase() === 'integration') {
              if (association?.connectedItemInfo?.length > 0) {
                association?.connectedItemInfo.forEach((connectedInt: any) => {
                  integrations.push(connectedInt);
                });
              }
            }
            if (association?.itemType?.toLowerCase() === 'triggers') {
              if (association?.connectedItemInfo?.length > 0) {
                association?.connectedItemInfo.forEach((connectedTrigger: any) => {
                  triggers.push(connectedTrigger);
                });
              }
            }
          });
        }
      });
      this.dialogData.message = `Deploy of script <b>${this.dialogData?.scriptName}</b> will affect: </br> ${integrations?.length} integrations, ${processes?.length} processes, ${triggers?.length} triggers. <br/><br/> Do you want to proceed?`;
    }
  }

  onYesClick() {
    // Logic for when the user clicks "Yes"
    this.dialogRef.close({
      isConfirmed: true,
    });
  }

  onCancelClick(): void {
    // Logic for when the user clicks "Cancel"
    this.dialogRef.close({
      isConfirmed: false,
    });
  }

  ngOnDestroy(): void {
    // Cleanup logic if needed
  }

}
