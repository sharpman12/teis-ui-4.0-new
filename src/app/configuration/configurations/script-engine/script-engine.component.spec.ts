import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptEngineComponent } from './script-engine.component';

describe('ScriptEngineComponent', () => {
  let component: ScriptEngineComponent;
  let fixture: ComponentFixture<ScriptEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScriptEngineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
