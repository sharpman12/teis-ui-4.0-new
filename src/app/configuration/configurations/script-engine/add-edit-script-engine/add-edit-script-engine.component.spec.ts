import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditScriptEngineComponent } from './add-edit-script-engine.component';

describe('AddEditScriptEngineComponent', () => {
  let component: AddEditScriptEngineComponent;
  let fixture: ComponentFixture<AddEditScriptEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditScriptEngineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditScriptEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
