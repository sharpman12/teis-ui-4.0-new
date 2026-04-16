import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntMarkAllAsCompletedComponent } from './app-int-mark-all-as-completed.component';

describe('AppIntMarkAllAsCompletedComponent', () => {
  let component: AppIntMarkAllAsCompletedComponent;
  let fixture: ComponentFixture<AppIntMarkAllAsCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntMarkAllAsCompletedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntMarkAllAsCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
