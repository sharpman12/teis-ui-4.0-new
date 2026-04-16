import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebServiceInfoComponent } from './web-service-info.component';

describe('WebServiceInfoComponent', () => {
  let component: WebServiceInfoComponent;
  let fixture: ComponentFixture<WebServiceInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebServiceInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WebServiceInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
