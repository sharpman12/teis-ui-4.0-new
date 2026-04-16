import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowCompModelComponent } from './flow-comp-model.component';

describe('FlowCompModelComponent', () => {
  let component: FlowCompModelComponent;
  let fixture: ComponentFixture<FlowCompModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlowCompModelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowCompModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
