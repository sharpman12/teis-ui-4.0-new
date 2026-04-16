import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditAppParamsComponent } from './add-edit-app-params.component';

describe('AddEditAppParamsComponent', () => {
  let component: AddEditAppParamsComponent;
  let fixture: ComponentFixture<AddEditAppParamsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditAppParamsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditAppParamsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
