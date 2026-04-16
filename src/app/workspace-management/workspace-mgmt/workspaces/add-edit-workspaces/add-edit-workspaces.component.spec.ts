import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditWorkspacesComponent } from './add-edit-workspaces.component';

describe('AddEditWorkspacesComponent', () => {
  let component: AddEditWorkspacesComponent;
  let fixture: ComponentFixture<AddEditWorkspacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditWorkspacesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
