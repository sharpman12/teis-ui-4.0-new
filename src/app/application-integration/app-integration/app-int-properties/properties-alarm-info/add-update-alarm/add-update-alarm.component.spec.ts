import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUpdateAlarmComponent } from './add-update-alarm.component';

describe('AddUpdateAlarmComponent', () => {
  let component: AddUpdateAlarmComponent;
  let fixture: ComponentFixture<AddUpdateAlarmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddUpdateAlarmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUpdateAlarmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
