import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugScriptEngineComponent } from './debug-script-engine.component';

describe('DebugScriptEngineComponent', () => {
  let component: DebugScriptEngineComponent;
  let fixture: ComponentFixture<DebugScriptEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebugScriptEngineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebugScriptEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
