import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptVersionViewerComponent } from './script-version-viewer.component';

describe('ScriptVersionViewerComponent', () => {
  let component: ScriptVersionViewerComponent;
  let fixture: ComponentFixture<ScriptVersionViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScriptVersionViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScriptVersionViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
