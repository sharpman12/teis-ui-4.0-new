import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntConfirmationComponent } from './app-int-confirmation.component';

describe('AppIntConfirmationComponent', () => {
  let component: AppIntConfirmationComponent;
  let fixture: ComponentFixture<AppIntConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppIntConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
