import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntLandingComponent } from './app-int-landing.component';

describe('AppIntLandingComponent', () => {
  let component: AppIntLandingComponent;
  let fixture: ComponentFixture<AppIntLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntLandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
