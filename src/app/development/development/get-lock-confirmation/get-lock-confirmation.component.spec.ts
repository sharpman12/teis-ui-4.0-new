import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetLockConfirmationComponent } from './get-lock-confirmation.component';

describe('GetLockConfirmationComponent', () => {
  let component: GetLockConfirmationComponent;
  let fixture: ComponentFixture<GetLockConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetLockConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GetLockConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
