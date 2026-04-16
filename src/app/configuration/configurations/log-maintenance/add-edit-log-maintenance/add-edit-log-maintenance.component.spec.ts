import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditLogMaintenanceComponent } from './add-edit-log-maintenance.component';

describe('AddEditLogMaintenanceComponent', () => {
  let component: AddEditLogMaintenanceComponent;
  let fixture: ComponentFixture<AddEditLogMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditLogMaintenanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditLogMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
