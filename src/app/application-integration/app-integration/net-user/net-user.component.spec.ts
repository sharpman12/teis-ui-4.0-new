import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetUserComponent } from './net-user.component';

describe('NetUserComponent', () => {
  let component: NetUserComponent;
  let fixture: ComponentFixture<NetUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
