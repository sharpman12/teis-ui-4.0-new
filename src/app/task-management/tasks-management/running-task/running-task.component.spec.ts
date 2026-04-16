import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningTaskComponent } from './running-task.component';

describe('RunningTaskComponent', () => {
  let component: RunningTaskComponent;
  let fixture: ComponentFixture<RunningTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunningTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunningTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
