import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkAsCompletedComponent } from './mark-as-completed.component';

describe('MarkAsCompletedComponent', () => {
  let component: MarkAsCompletedComponent;
  let fixture: ComponentFixture<MarkAsCompletedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkAsCompletedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkAsCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
