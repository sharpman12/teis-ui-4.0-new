import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldTaskComponent } from './hold-task.component';

describe('HoldTaskComponent', () => {
  let component: HoldTaskComponent;
  let fixture: ComponentFixture<HoldTaskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HoldTaskComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HoldTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
