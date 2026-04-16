import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditWebFlowComponent } from './add-edit-web-flow.component';

describe('AddEditWebFlowComponent', () => {
  let component: AddEditWebFlowComponent;
  let fixture: ComponentFixture<AddEditWebFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditWebFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditWebFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
