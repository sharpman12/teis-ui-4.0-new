import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditWebServiceComponent } from './add-edit-web-service.component';

describe('AddEditWebServiceComponent', () => {
  let component: AddEditWebServiceComponent;
  let fixture: ComponentFixture<AddEditWebServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditWebServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditWebServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
