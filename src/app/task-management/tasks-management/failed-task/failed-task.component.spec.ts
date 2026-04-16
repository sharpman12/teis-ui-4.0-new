import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedTaskComponent } from './failed-task.component';

describe('FailedTaskComponent', () => {
  let component: FailedTaskComponent;
  let fixture: ComponentFixture<FailedTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FailedTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FailedTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
