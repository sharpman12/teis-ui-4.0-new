import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptEngineGroupComponent } from './script-engine-group.component';

describe('ScriptEngineGroupComponent', () => {
  let component: ScriptEngineGroupComponent;
  let fixture: ComponentFixture<ScriptEngineGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScriptEngineGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptEngineGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
