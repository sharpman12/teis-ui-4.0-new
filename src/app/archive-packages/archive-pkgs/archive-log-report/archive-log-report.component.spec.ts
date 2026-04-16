import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchiveLogReportComponent } from './archive-log-report.component';

describe('ArchiveLogReportComponent', () => {
  let component: ArchiveLogReportComponent;
  let fixture: ComponentFixture<ArchiveLogReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArchiveLogReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchiveLogReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
