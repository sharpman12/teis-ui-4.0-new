import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAlertComponent } from './import-alert.component';

describe('ImportAlertComponent', () => {
  let component: ImportAlertComponent;
  let fixture: ComponentFixture<ImportAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportAlertComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
