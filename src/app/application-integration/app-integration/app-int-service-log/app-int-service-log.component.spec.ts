import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntServiceLogComponent } from './app-int-service-log.component';

describe('AppIntServiceLogComponent', () => {
  let component: AppIntServiceLogComponent;
  let fixture: ComponentFixture<AppIntServiceLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntServiceLogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntServiceLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
