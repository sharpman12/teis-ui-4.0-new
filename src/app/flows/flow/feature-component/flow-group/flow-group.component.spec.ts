import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowGroupComponent } from './flow-group.component';

describe('FlowGroupComponent', () => {
  let component: FlowGroupComponent;
  let fixture: ComponentFixture<FlowGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
