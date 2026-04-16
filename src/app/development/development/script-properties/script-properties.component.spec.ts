import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptPropertiesComponent } from './script-properties.component';

describe('ScriptPropertiesComponent', () => {
  let component: ScriptPropertiesComponent;
  let fixture: ComponentFixture<ScriptPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScriptPropertiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScriptPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
