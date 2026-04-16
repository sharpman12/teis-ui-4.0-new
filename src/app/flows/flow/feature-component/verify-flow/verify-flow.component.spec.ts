import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyFlowComponent } from './verify-flow.component';

describe('VerifyFlowComponent', () => {
  let component: VerifyFlowComponent;
  let fixture: ComponentFixture<VerifyFlowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VerifyFlowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
