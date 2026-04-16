import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-on-manager',
  templateUrl: './add-on-manager.component.html',
  styleUrls: ['./add-on-manager.component.scss']
})
export class AddOnManagerComponent implements OnInit, OnDestroy {
  selectedAddOnOption: number = 1;
  selectedModuleOption: number = 1;
  currentUser: any = null;
  addOnsLists: any[] = [
    {id: 1, name: 'All'},
    {id: 2, name: 'Test 1'},
    {id: 3, name: 'Test 2'},
    {id: 4, name: 'Test 3'},
  ];
  addOnsFilters: any[] = [
    {id: 1, name: 'Executables'},
    {id: 2, name: 'Identifiers'},
    {id: 3, name: 'Plugins'},
    {id: 4, name: 'Web services'},
    {id: 5, name: 'Application services'}
  ];

  constructor() { }

  ngOnInit(): void {
    
  }

  onChangeModule(): void {

  }

  ngOnDestroy(): void {
    
  }

}
