import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebCompFlowComponent } from './web-comp-flow.component';

describe('WebCompFlowComponent', () => {
  let component: WebCompFlowComponent;
  let fixture: ComponentFixture<WebCompFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebCompFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebCompFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
