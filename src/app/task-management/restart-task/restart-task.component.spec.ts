import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestartTaskComponent } from './restart-task.component';

describe('RestartTaskComponent', () => {
  let component: RestartTaskComponent;
  let fixture: ComponentFixture<RestartTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestartTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RestartTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
