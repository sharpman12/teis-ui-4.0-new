import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoveWorkspacesComponent } from './remove-workspaces.component';

describe('RemoveWorkspacesComponent', () => {
  let component: RemoveWorkspacesComponent;
  let fixture: ComponentFixture<RemoveWorkspacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoveWorkspacesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoveWorkspacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
