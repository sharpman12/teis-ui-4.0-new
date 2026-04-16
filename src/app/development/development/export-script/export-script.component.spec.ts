import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportScriptComponent } from './export-script.component';

describe('ExportScriptComponent', () => {
  let component: ExportScriptComponent;
  let fixture: ComponentFixture<ExportScriptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportScriptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
