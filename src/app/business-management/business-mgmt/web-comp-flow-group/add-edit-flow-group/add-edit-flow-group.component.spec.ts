import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFlowGroupComponent } from './add-edit-flow-group.component';

describe('AddEditFlowGroupComponent', () => {
  let component: AddEditFlowGroupComponent;
  let fixture: ComponentFixture<AddEditFlowGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditFlowGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditFlowGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
