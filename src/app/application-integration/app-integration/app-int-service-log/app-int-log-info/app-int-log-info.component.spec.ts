import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntLogInfoComponent } from './app-int-log-info.component';

describe('AppIntLogInfoComponent', () => {
  let component: AppIntLogInfoComponent;
  let fixture: ComponentFixture<AppIntLogInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntLogInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppIntLogInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
