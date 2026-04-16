import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportLogDetailsComponent } from './export-log-details.component';

describe('ExportLogDetailsComponent', () => {
  let component: ExportLogDetailsComponent;
  let fixture: ComponentFixture<ExportLogDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportLogDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportLogDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
