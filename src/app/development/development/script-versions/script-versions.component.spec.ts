import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptVersionsComponent } from './script-versions.component';

describe('ScriptVersionsComponent', () => {
  let component: ScriptVersionsComponent;
  let fixture: ComponentFixture<ScriptVersionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScriptVersionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScriptVersionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
