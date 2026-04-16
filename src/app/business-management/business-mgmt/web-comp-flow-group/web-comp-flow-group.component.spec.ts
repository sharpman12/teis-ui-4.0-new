import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebCompFlowGroupComponent } from './web-comp-flow-group.component';

describe('WebCompFlowGroupComponent', () => {
  let component: WebCompFlowGroupComponent;
  let fixture: ComponentFixture<WebCompFlowGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebCompFlowGroupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebCompFlowGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
