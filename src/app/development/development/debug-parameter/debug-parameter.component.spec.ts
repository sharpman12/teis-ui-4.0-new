import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugParameterComponent } from './debug-parameter.component';

describe('DebugParameterComponent', () => {
  let component: DebugParameterComponent;
  let fixture: ComponentFixture<DebugParameterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebugParameterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebugParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
