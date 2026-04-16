import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertiesBusinessFlowComponent } from './properties-business-flow.component';

describe('PropertiesBusinessFlowComponent', () => {
  let component: PropertiesBusinessFlowComponent;
  let fixture: ComponentFixture<PropertiesBusinessFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PropertiesBusinessFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesBusinessFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
