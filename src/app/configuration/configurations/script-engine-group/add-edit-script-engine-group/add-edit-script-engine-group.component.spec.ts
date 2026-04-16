import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditScriptEngineGroupComponent } from './add-edit-script-engine-group.component';

describe('AddEditScriptEngineGroupComponent', () => {
  let component: AddEditScriptEngineGroupComponent;
  let fixture: ComponentFixture<AddEditScriptEngineGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddEditScriptEngineGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditScriptEngineGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
