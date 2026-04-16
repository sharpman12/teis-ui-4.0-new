import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGroupMembersComponent } from './edit-group-members.component';

describe('EditGroupMembersComponent', () => {
  let component: EditGroupMembersComponent;
  let fixture: ComponentFixture<EditGroupMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditGroupMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditGroupMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
