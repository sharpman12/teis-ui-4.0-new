import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionConfirmationComponent } from './session-confirmation.component';

describe('SessionConfirmationComponent', () => {
  let component: SessionConfirmationComponent;
  let fixture: ComponentFixture<SessionConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SessionConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
