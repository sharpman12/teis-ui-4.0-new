import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StartedTaskComponent } from './started-task.component';

describe('StartedTaskComponent', () => {
  let component: StartedTaskComponent;
  let fixture: ComponentFixture<StartedTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StartedTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StartedTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
