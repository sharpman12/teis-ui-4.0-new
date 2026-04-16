import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnWebServicesComponent } from './add-on-web-services.component';

describe('AddOnWebServicesComponent', () => {
  let component: AddOnWebServicesComponent;
  let fixture: ComponentFixture<AddOnWebServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnWebServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnWebServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
