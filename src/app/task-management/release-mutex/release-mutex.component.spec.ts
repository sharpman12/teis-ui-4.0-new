import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseMutexComponent } from './release-mutex.component';

describe('ReleaseMutexComponent', () => {
  let component: ReleaseMutexComponent;
  let fixture: ComponentFixture<ReleaseMutexComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseMutexComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseMutexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
