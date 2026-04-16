import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlarmConfirmationComponent } from './alarm-confirmation.component';

describe('AlarmConfirmationComponent', () => {
  let component: AlarmConfirmationComponent;
  let fixture: ComponentFixture<AlarmConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlarmConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlarmConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
