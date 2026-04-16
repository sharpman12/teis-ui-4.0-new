import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportWorkspaceComponent } from './import-workspace.component';

describe('ImportWorkspaceComponent', () => {
  let component: ImportWorkspaceComponent;
  let fixture: ComponentFixture<ImportWorkspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportWorkspaceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
