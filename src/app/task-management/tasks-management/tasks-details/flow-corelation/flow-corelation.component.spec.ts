import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowCorelationComponent } from './flow-corelation.component';

describe('FlowCorelationComponent', () => {
  let component: FlowCorelationComponent;
  let fixture: ComponentFixture<FlowCorelationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlowCorelationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowCorelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
