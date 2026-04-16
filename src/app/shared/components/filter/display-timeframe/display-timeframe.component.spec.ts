import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayTimeframeComponent } from './display-timeframe.component';

describe('DisplayTimeframeComponent', () => {
  let component: DisplayTimeframeComponent;
  let fixture: ComponentFixture<DisplayTimeframeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayTimeframeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayTimeframeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
