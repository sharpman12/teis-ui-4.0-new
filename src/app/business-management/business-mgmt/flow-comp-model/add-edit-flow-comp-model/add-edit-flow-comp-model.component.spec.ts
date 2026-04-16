import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditFlowCompModelComponent } from './add-edit-flow-comp-model.component';

describe('AddEditFlowCompModelComponent', () => {
  let component: AddEditFlowCompModelComponent;
  let fixture: ComponentFixture<AddEditFlowCompModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditFlowCompModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditFlowCompModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
