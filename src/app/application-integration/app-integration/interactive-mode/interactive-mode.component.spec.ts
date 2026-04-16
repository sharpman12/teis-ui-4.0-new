import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveModeComponent } from './interactive-mode.component';

describe('InteractiveModeComponent', () => {
  let component: InteractiveModeComponent;
  let fixture: ComponentFixture<InteractiveModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InteractiveModeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InteractiveModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
