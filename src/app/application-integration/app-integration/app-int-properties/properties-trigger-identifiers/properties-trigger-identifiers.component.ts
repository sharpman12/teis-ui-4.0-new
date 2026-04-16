import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AppIntegrationService } from '../../app-integration.service';
import { Constants } from 'src/app/shared/components/constants';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ConfirmationComponent } from 'src/app/shared/components/confirmation/confirmation.component';
import { AppIntegrationDataService } from '../../app-integration-data.service';

@Component({
  selector: 'app-properties-trigger-identifiers',
  templateUrl: './properties-trigger-identifiers.component.html',
  styleUrls: ['./properties-trigger-identifiers.component.scss']
})
export class PropertiesTriggerIdentifiersComponent implements OnInit, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isProperties: boolean = false;
  currentUser: any = null;
  identifiers: Array<any> = [];
  identifierInfo: any = null;
  selectedIdentifiers: Array<any> = [];
  isPITLock: boolean = true;
  propertiesDetails: any = null;

  getIdentifiersSub = Subscription.EMPTY;
  getIdentifiersParameterSub = Subscription.EMPTY;

  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService,
    private appIntegrationDataService: AppIntegrationDataService,

  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnInit(): void {

  }

   getIdentifiersMethods(propertiesDetails?: any) {
    this.propertiesDetails = propertiesDetails;
    // Check cache first
    const cachedIdentifiers = this.appIntegrationDataService.getIdentifiers();
    if (cachedIdentifiers?.length) {
      const identifiersMethods = JSON.parse(JSON.stringify(cachedIdentifiers));
      identifiersMethods.forEach((x) => {
        if (this.router?.url.includes("properties") && propertiesDetails) {
          x.disabled = (propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? false : true;
        } else {
          x.disabled = false;
        }
      });
      this.identifiers = identifiersMethods;
      return;
    }

    // Only call API if cache is empty
    this.getIdentifiersSub = this.appIntegrationService.getIdentifiers().subscribe((res) => {
      const identifiersMethods = JSON.parse(JSON.stringify(res));
      identifiersMethods.forEach((x) => {
        if (this.router?.url.includes("properties") && propertiesDetails) {
          x.disabled = (propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? false : true;
        } else {
          x.disabled = false;
        }
      });
      this.identifiers = identifiersMethods;
      this.appIntegrationDataService.storeIdentifiers(identifiersMethods);
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  getInfo(identifier: any) {
    const identifierParams = [];
    this.getIdentifiersParameterSub = this.appIntegrationService.getParametersByIdentifiersId(identifier?.id).subscribe((res) => {
      if (res?.identifierParameterDataList?.length) {
        res?.identifierParameterDataList.forEach((x) => {
          identifierParams.push(x?.parameterName);
        });
        this.identifierInfo = {
          paramsName: identifierParams,
          version: identifier?.methodVersion
        };
      }
    }, (err: HttpErrorResponse) => {
      if (err.error instanceof Error) {
        // handle client side error here
      } else {
        // handle server side error here
      }
    });
  }

  /*============ Restrict Same Identifiers Name ============*/
  validateSameIdentifierName(identifierName: string) {
    return this.selectedIdentifiers.some((x) => x?.methodName === identifierName);
  }

  addIdentifier(identifier: any) {
    if (this.itemType === 'webservice') {
      if (this.selectedIdentifiers?.length) {
        this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Only one identifier method can be added to a web service.' });
      } else {
        if (this.validateSameIdentifierName(identifier?.methodName)) {
          this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Identifier method already exists.' });
        } else {
          identifier.disabled = false;
          this.selectedIdentifiers.push(identifier);
        }
      }
    } else {
      if (this.validateSameIdentifierName(identifier?.methodName)) {
        this.messageService.add({ key: 'appIntInfoKey', severity: 'success', summary: '', detail: 'Identifier method already exists.' });
      } else {
        identifier.disabled = false;
        this.selectedIdentifiers.push(identifier);
        this.sharedIdentifier(this.propertiesDetails, this.selectedIdentifiers);
      }
    }
  }

  /*============ Drag and Drop Table Row =============*/
  dropIdentifier(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedIdentifiers, event.previousIndex, event.currentIndex);
  }
  /*============ END Drag and Drop Table Row =============*/

  /*============ Remove Identifiers Methods ============*/
  removeIdentifiersMethods(value: any) {
    const dialogRef = this.dialog.open(ConfirmationComponent, {
      width: '700px',
      maxHeight: '600px',
      data: `Are you sure you want to remove '${value?.methodName}'?`
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.selectedIdentifiers.indexOf(value);
        if (index > -1) {
          this.selectedIdentifiers.splice(index, 1);
          this.sharedIdentifier(this.propertiesDetails, this.selectedIdentifiers);
        }
      }
    });
  }
  /*============ END Remove Identifiers Methods ============*/

  /*============ Set Identifier Methods ============*/
  setIdentifierMethods(propertiesDetails: any) {
    if (this.identifiers?.length) {
      this.identifiers.forEach((item) => {
        item.disabled = (this.router?.url.includes("properties") && propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? false : true;
      });
    }
    if (propertiesDetails?.identifiers?.length) {
      propertiesDetails?.identifiers.forEach((x) => {
        x.disabled = (this.router?.url.includes("properties") && propertiesDetails?.locked && Number(this.currentUser?.id) === Number(propertiesDetails?.lockedUserId)) ? false : true;
      });
      this.selectedIdentifiers = propertiesDetails?.identifiers;
      if (this.itemType !== 'webservice') {
        this.sharedIdentifier(propertiesDetails, this.selectedIdentifiers);
      }
    }
  }

  /*============ Get PIT Lock and Enable/Disable Form Feilds ============*/
  getPITLock(isPITLock: boolean) {
    this.isPITLock = isPITLock;
    if (isPITLock) {
      if (this.selectedIdentifiers?.length) {
        this.selectedIdentifiers.map(x => x.disabled = false);
      }
      if (this.identifiers?.length) {
        this.identifiers.map(x => x.disabled = false);
      }
    } else {
      if (this.selectedIdentifiers?.length) {
        this.selectedIdentifiers.map(x => x.disabled = true);
      }
      if (this.identifiers?.length) {
        this.identifiers.map(x => x.disabled = true);
      }
    }
    // this.sharedIdentifier(this.propertiesDetails, this.selectedIdentifiers);
  }

  sharedIdentifier(propertiesDetails: any, selectedIdentifiers: Array<any>) {
    const obj = {
      propertiesDetails: propertiesDetails,
      identifiers: selectedIdentifiers
    };
    this.appIntegrationService.sharedIdentifiersMethods(obj);
  }

  resetIdentifiers() {
    this.selectedIdentifiers = [];
  }

  getSelectedIdentifiersMethods() {
    if (this.selectedIdentifiers?.length) {
      this.selectedIdentifiers.forEach((x) => {
        delete x?.disabled;
      });
      const clonedIdentifiers = JSON.parse(JSON.stringify(this.selectedIdentifiers));
      if (clonedIdentifiers?.length) {
        clonedIdentifiers.forEach((x, i) => {
          x.order = i + 1;
        });
      }
      return clonedIdentifiers;
    } else {
      return [];
    }
  }

  ngOnDestroy(): void {
    this.getIdentifiersSub.unsubscribe();
  }
}
