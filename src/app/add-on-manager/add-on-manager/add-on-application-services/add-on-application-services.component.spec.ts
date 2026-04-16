import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOnApplicationServicesComponent } from './add-on-application-services.component';

describe('AddOnApplicationServicesComponent', () => {
  let component: AddOnApplicationServicesComponent;
  let fixture: ComponentFixture<AddOnApplicationServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddOnApplicationServicesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOnApplicationServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
