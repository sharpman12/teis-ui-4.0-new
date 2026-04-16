import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceMgmtComponent } from './workspace-mgmt.component';

describe('WorkspaceMgmtComponent', () => {
  let component: WorkspaceMgmtComponent;
  let fixture: ComponentFixture<WorkspaceMgmtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkspaceMgmtComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkspaceMgmtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
