import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogMaintenanceComponent } from './log-maintenance.component';

describe('LogMaintenanceComponent', () => {
  let component: LogMaintenanceComponent;
  let fixture: ComponentFixture<LogMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogMaintenanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
