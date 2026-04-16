import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskIdsListComponent } from './task-ids-list.component';

describe('TaskIdsListComponent', () => {
  let component: TaskIdsListComponent;
  let fixture: ComponentFixture<TaskIdsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TaskIdsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskIdsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
