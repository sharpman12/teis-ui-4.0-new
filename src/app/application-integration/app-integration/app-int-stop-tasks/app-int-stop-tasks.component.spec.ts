import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppIntStopTasksComponent } from './app-int-stop-tasks.component';

describe('AppIntStopTasksComponent', () => {
  let component: AppIntStopTasksComponent;
  let fixture: ComponentFixture<AppIntStopTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppIntStopTasksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppIntStopTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
