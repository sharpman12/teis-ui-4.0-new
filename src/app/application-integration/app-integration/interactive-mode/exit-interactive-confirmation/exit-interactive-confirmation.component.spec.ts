import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExitInteractiveConfirmationComponent } from './exit-interactive-confirmation.component';

describe('ExitInteractiveConfirmationComponent', () => {
  let component: ExitInteractiveConfirmationComponent;
  let fixture: ComponentFixture<ExitInteractiveConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExitInteractiveConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExitInteractiveConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
