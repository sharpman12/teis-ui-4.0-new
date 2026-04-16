import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntLogsComponent } from './app-int-logs.component';

describe('AppIntLogsComponent', () => {
  let component: AppIntLogsComponent;
  let fixture: ComponentFixture<AppIntLogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntLogsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppIntLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
