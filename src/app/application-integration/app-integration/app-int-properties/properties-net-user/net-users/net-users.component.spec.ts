import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetUsersComponent } from './net-users.component';

describe('NetUsersComponent', () => {
  let component: NetUsersComponent;
  let fixture: ComponentFixture<NetUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
