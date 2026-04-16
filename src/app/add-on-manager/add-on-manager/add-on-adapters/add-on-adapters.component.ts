import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from "@angular/material/legacy-dialog";
import { AddOnSearchComponent } from '../add-on-search/add-on-search.component';

@Component({
  selector: 'app-add-on-adapters',
  templateUrl: './add-on-adapters.component.html',
  styleUrls: ['./add-on-adapters.component.scss']
})
export class AddOnAdaptersComponent implements OnInit, OnDestroy {
  activeAdapterId: number = 1;
  activeAdapter: any = null;
  isInstalled: boolean = false;
  selectedSrcFilterOption: number = 1;
  selectedYourContentFilterOption: number = 1;
  adaptersList: any[] = [
    { id: 1, name: 'Adapter 1', description: 'Description for Adapter 1', version: '1.0.0', status: 'Deployed' },
    { id: 2, name: 'Adapter 2', description: 'Description for Adapter 2', version: '2.1.0', status: 'Undeployed' },
    { id: 3, name: 'Adapter 3', description: 'Description for Adapter 3', version: '3.0.5', status: 'Undeployed' },
    { id: 4, name: 'Adapter 4', description: 'Description for Adapter 4', version: '4.2.1', status: 'Deployed' },
    { id: 5, name: 'Adapter 5', description: 'Description for Adapter 5', version: '5.3.3', status: 'Depricated' },
  ];
  sourceFilterOptions: Array<any> = [
    { id: 1, name: 'Application sources' },
    { id: 2, name: 'Your sources' },
    { id: 3, name: 'Adapters' },
    { id: 4, name: 'Python' },
    { id: 5, name: 'VB' },
  ];
  yourContentFilterOptions: Array<any> = [
    { id: 1, name: 'Application sources' },
    { id: 2, name: 'Your sources' }
  ];

  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getAdapterById(this.activeAdapterId);
  }

  getAdapterById(adapterId: number): any {
    this.activeAdapterId = Number(adapterId);
    this.activeAdapter = this.adaptersList.find(adapter => adapter.id === adapterId);
  }

  installedUninstalledAdapter(): void {
    this.isInstalled = !this.isInstalled;
  }

  addOnSearch() {
    const dialogRef = this.dialog.open(AddOnSearchComponent, {
      width: "600px",
      maxHeight: "600px",
      data: {

      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.isSearch) {

      }
    });
  }

  ngOnDestroy(): void {

  }
}
