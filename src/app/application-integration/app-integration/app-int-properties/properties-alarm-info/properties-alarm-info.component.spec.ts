import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesAlarmInfoComponent } from './properties-alarm-info.component';

describe('PropertiesAlarmInfoComponent', () => {
  let component: PropertiesAlarmInfoComponent;
  let fixture: ComponentFixture<PropertiesAlarmInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesAlarmInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesAlarmInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
