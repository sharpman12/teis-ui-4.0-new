import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, TreeNode } from 'primeng/api';
import { AppIntegrationService } from '../../app-integration.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { take, distinctUntilChanged, skip } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Constants } from 'src/app/shared/components/constants';

@Component({
  selector: 'app-properties-trigger-activators',
  templateUrl: './properties-trigger-activators.component.html',
  styleUrls: ['./properties-trigger-activators.component.scss']
})
export class PropertiesTriggerActivatorsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() itemType: string = null;
  @Input() isCreatePIT: boolean = false;
  @Input() workspaceId: number;
  @Input() itemId: number = null;
  @Input() itemDetails: any = null;
  @Input() isProperties: boolean = false;
  currentUser: any = null;
  identifiersMethod: Array<any> = [];
  connectedIntToIdentifiers: TreeNode[];
  selectedIntIdentifiers: Array<any> = [];
  isActivatorEnable: boolean = false;
  isPITLock: boolean = true;
  isActivator: boolean = false;

  getIntegrationByIdentifiersSub = Subscription.EMPTY;
  triggerIdentifiersSub = Subscription.EMPTY;


  constructor(
    private router: Router,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private messageService: MessageService,
    private appIntegrationService: AppIntegrationService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem(Constants.CURRENTUSER));
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit(): void {
    this.triggerIdentifiersSub = this.appIntegrationService.triggerIdentifiers
      .pipe(
        skip(1),  // Skip the initial cached value from BehaviorSubject
        distinctUntilChanged()
      )
      .subscribe((res) => {
        this.connectedIntToIdentifiers = [];
        if (res) {
          this.identifiersMethod = res?.identifiers;
          const identifiersIds = res?.identifiers.map(item => item.id);
          this.getIntegrationByIdentifiers(identifiersIds, res?.propertiesDetails);
        }
      });
  }

  onChangeActivator() {
    this.setNodeAsEnabledDisabled(this.connectedIntToIdentifiers, this.isActivatorEnable);
  }

  getIdentifiersMethods(propertiesDetails?: any) {
    // this.connectedIntToIdentifiers = [];
    // this.appIntegrationService.triggerIdentifiers.pipe(take(1)).subscribe((res) => {
    //   if (res?.length) {
    //     this.identifiersMethod = res;
    //     const identifiersIds = res.map(item => item.id);
    //     this.getIntegrationByIdentifiers(identifiersIds, propertiesDetails);
    //   }
    // });
  }

  getIntegrationByIdentifiers(identifierIds: Array<string>, propertiesDetails?: any) {
    this.connectedIntToIdentifiers = [];
    if (identifierIds?.length) {
      this.getIntegrationByIdentifiersSub = this.appIntegrationService.getIntByIdentifiers(this.workspaceId, identifierIds).subscribe((res) => {
        const identifier = JSON.parse(JSON.stringify(res));
        const identifiersIntArr = Object.keys(identifier).map(label => ({ label, id: '', expandedIcon: '', collapsedIcon: '', selectable: false, selected: false, expanded: true, children: identifier[label] }));
        if (identifiersIntArr?.length) {
          identifiersIntArr.forEach((x) => {
            // x.selectable = (propertiesDetails?.locked && this.isActivatorEnable) ? true : false;
            x?.children.map((item) => {
              item.label = item?.name;
              item.selectable = false;
              item.selected = false;
              // item.selectable = (propertiesDetails?.locked && this.isActivatorEnable) ? true : false;
            });
            if (this.identifiersMethod?.length) {
              this.identifiersMethod.forEach((item) => {
                if (x?.label === item?.methodName) {
                  x.id = item?.id;
                }
              });
            }
          });
        }
        this.connectedIntToIdentifiers = identifiersIntArr;
        if (propertiesDetails) {
          this.setTriggerActivators(propertiesDetails);
        }
      }, (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // handle client side error here
        } else {
          // handle server side error here
        }
      });
    }
  }

  /*=================== Set Tree Node Disabled ===================*/
  private setNodeAsEnabledDisabled(arr: Array<any>, selectable: boolean) {
    if (arr?.length) {
      arr.forEach((node) => {
        node.selectable = selectable;
        node.expanded = true;
        if (node.children && node.children.length > 0) {
          this.setNodeAsEnabledDisabled(node.children, selectable);
        }
      });
    }
  }
  /*=================== END Set Tree Node Disabled ===================*/

  setTriggerActivators(propertiesDetails: any) {
    const selectedIdentifiersMethods = [];
    this.selectedIntIdentifiers = [];
    this.isActivator = !propertiesDetails?.locked;
    this.isActivatorEnable = propertiesDetails?.activatorEnabled;
    if (propertiesDetails?.activatorDataList?.length) {
      propertiesDetails?.activatorDataList.forEach((x) => {
        selectedIdentifiersMethods.push(x?.identifierId, ...x?.integrationIdList);
      });
    }
    if (selectedIdentifiersMethods?.length) {
      // this.isActivatorEnable = true;
      selectedIdentifiersMethods.forEach((q) => {
        this.setNodeAsSelected(this.connectedIntToIdentifiers, Number(q), propertiesDetails?.locked);
      });
      this.setNodeAsPartial(this.selectedIntIdentifiers);
    }
  }

  private setNodeAsSelected(arr: Array<any>, id: number, locked: boolean) {
    if (arr?.length) {
      arr.forEach((node) => {
        // node.partialSelected = node?.parent ? false : true;
        node.selectable = (locked && this.isActivatorEnable) ? true : false;
        if (Number(id) === Number(node?.id)) {
          node.selected = true;
          this.selectedIntIdentifiers.push(node);
        }
        if (node.children && node.children.length > 0) {
          this.setNodeAsSelected(node.children, id, locked);
        }
      });
    }
  }

  private setNodeAsPartial(arr: Array<any>) {
    const nodes = this.selectedIntIdentifiers;
    if (this.selectedIntIdentifiers?.length) {
      this.selectedIntIdentifiers.forEach((node) => {
        if (node?.children && node?.children?.length) {
          node.partialSelected = node?.children.some((x) => !x?.selected);
        }
      });
    }

  }

  getPITLock(isPITLock: boolean) {
    this.isPITLock = isPITLock;
  }

  nodeSelect(item: any) { }

  nodeUnselect(item: any) {
    if (item?.children?.length && this.selectedIntIdentifiers?.length) {
      // Remove objects from selectedIntIdentifiers if their id exists in item?.children
      item?.children.forEach(item1 => {
        let index = this.selectedIntIdentifiers.findIndex(item2 => Number(item2.id) === Number(item1.id));
        while (index !== -1) {
          this.selectedIntIdentifiers = this.selectedIntIdentifiers.slice(0, index).concat(this.selectedIntIdentifiers.slice(index + 1));
          index = this.selectedIntIdentifiers.findIndex(item2 => item2.id === item1.id);
        }
      });
    }
  }

  getSelectedIdentifiersIntegrations() {
    return {
      activatorEnabled: this.isActivatorEnable,
      activatorDataList: this.restructureData(this.selectedIntIdentifiers)
    }
  }

  resetActivators() {
    this.isActivatorEnable = false;
    this.connectedIntToIdentifiers = [];
  }

  restructureData(arr: Array<any>) {
    const activators = arr.filter((x) => x?.parent);
    if (activators?.length) {
      activators.forEach((x) => {
        x.parentId = x?.parent?.id;
      });
    }

    const output = activators.reduce((acc, curr) => {
      const existing = acc.find((item) => item.identifierId === curr.parentId);
      if (existing) {
        existing.integrationIdList.push(curr.id);
      } else {
        acc.push({
          identifierId: curr.parentId,
          integrationIdList: [curr.id],
        });
      }
      return acc;
    }, []);

    return output;
  }

  ngOnDestroy(): void {
    this.getIntegrationByIdentifiersSub.unsubscribe();
    this.triggerIdentifiersSub.unsubscribe();

  }
}
